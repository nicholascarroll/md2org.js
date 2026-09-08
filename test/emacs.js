/*
 * Optional tier: check the output against a real Org parser.
 *
 *   node test/emacs.js
 *
 * Part of `npm test`, and skipped with a zero exit when Emacs is not installed,
 * so a machine without it still gets a green suite. CI installs it, which is the
 * point: this is the only total oracle the project has for *export*, and the
 * failure it catches — a document that parses fine and exports to nothing — is
 * invisible to every other tier. Leaving it opt-in meant the check with the most
 * power ran the least often.
 *
 * Every other tier reasons about Org from specs/org-syntax-v2.org. That is the
 * right primary source — it is what the validator encodes and what keeps the fork
 * honest — but a specification is not an implementation, and the two have already
 * disagreed once in this project's history. The spec grants a backslash escape
 * only inside a link PATH and says nothing about one in a DESCRIPTION, from which
 * it looked like "[[/u][a\]\]b]]" could not work. Emacs parses it perfectly well.
 * It then exports it as "a\]\]b", backslashes and all, which is why md2org does
 * not use it — but that is a fact nobody could have got from reading the spec.
 *
 * So this tier asks Org two questions that only Org can answer:
 *
 *   1. Does the output parse into the structure md2org intended? A link that
 *      closes early is still valid Org, so no static checker can see it. Org can:
 *      it reports the description it actually found.
 *   2. Does it render back to the characters the author wrote? This is where the
 *      no entity survives. md2org generates none, so none may be in the file and
 *      not be in the export.
 *
 * Question 2 is the one worth having. It is the closest thing to a direct test of
 * DESIGN.md invariant 1 that exists anywhere in the suite.
 */
"use strict";

const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const md2org = require("../src/md2org.js");

function haveEmacs() {
  const r = spawnSync("emacs", ["--version"], { encoding: "utf8" });
  return r.status === 0;
}

if (!haveEmacs()) {
  console.log("EMACS          not installed — skipping.");
  console.log("               The only oracle for export. CI runs it; install");
  console.log("               emacs to run it here: node test/emacs.js");
  process.exit(0);
}

/*
 * One Emacs process for the whole run, not one per case: startup dominates, and a
 * case-per-process turns a two-second tier into a minute of waiting, which is how
 * an optional tier stops being run at all.
 */
function askOrg(cases) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "md2org-emacs-"));
  const inFile = path.join(tmp, "in.json");
  const outFile = path.join(tmp, "out.json");
  const elFile = path.join(tmp, "probe.el");
  fs.writeFileSync(inFile, JSON.stringify(cases));

  fs.writeFileSync(elFile, `
(require 'org)
(require 'org-element)
(require 'ox-ascii)
(require 'json)
(let* ((cases (with-temp-buffer
                (insert-file-contents ${JSON.stringify(inFile)})
                (json-parse-buffer :array-type 'list :object-type 'alist)))
       (results '()))
  (dolist (org cases)
    (let (links ascii)
      (with-temp-buffer
        (insert org)
        (org-mode)
        (setq links
              (org-element-map (org-element-parse-buffer) 'link
                (lambda (l)
                  ;; A vector, not a list: json-encode reads a list of strings as
                  ;; an alist and emits an object, so ("/u" "text") comes out as
                  ;; {"/u":["text"]} instead of ["/u","text"].
                  (vector (or (org-element-property :path l) "")
                          (let ((b (org-element-property :contents-begin l))
                                (e (org-element-property :contents-end l)))
                            (if (and b e) (buffer-substring-no-properties b e) ""))))))
        (setq ascii (condition-case e (org-export-as 'ascii nil nil t)
                      (error (format "EXPORT-ERROR: %s" (error-message-string e))))))
      (push (list (cons 'links (vconcat links)) (cons 'ascii ascii)) results)))
  (with-temp-file ${JSON.stringify(outFile)}
    (insert (json-encode (nreverse results)))))
`);

  execFileSync("emacs", ["-Q", "--batch", "-l", elFile], { stdio: "pipe" });
  const out = JSON.parse(fs.readFileSync(outFile, "utf8"));
  fs.rmSync(tmp, { recursive: true, force: true });
  return out;
}

let pass = 0, fail = 0;
function ok(name) { console.log("  ok   " + name); pass++; }
function bad(name, detail) { console.log("  FAIL " + name + "\n         " + detail); fail++; }

/*
 * Each case: Markdown in, plus what Org should find once md2org has converted it.
 *   desc  — the description text Org parses out of the link, which catches a link
 *           that closed early. A truncated description was the bug fixed in
 *           1.0.1: a code span holding "]]" ended the link early.
 *   text  — a string that must appear in the ASCII export. This is where an entity
 *           has to disappear and leave the author's character behind.
 */
const CASES = [
  { name: "ordinary link keeps its description",
    md: "[text](/u)", desc: "text" },

  /*
   * "]]" in a description. DESIGN.md passes it through and warns, so these assert
   * the damage rather than its absence: Org ends the link at the first "]]" and
   * leaves the remainder as text. What must hold is that no character is lost, so
   * only the ASCII export is checked — the description Org reads is a truncation
   * by design and pinning it would be pinning the wrong thing.
   *
   * Until 1.1.0 a \zwnj{} separated the pair, which read well until an author's
   * own "=" or "~" closed around it: entities are not expanded inside verbatim, so
   * Org printed "\zwnj{}" to the reader. The characters now survive without one.
   */
  { name: "]] in a description keeps every character",
    md: "[a&#93;&#93;b](/u)", text: "a]" },

  { name: "]] from a code span keeps every character",
    md: "[see `a]]b` now](/u)", text: "see" },

  { name: "a description ending in ] keeps every character",
    md: "[a\\]](/u)", text: "a]" },

  /*
   * Entities, fed to the leak guard below rather than to an expectation. The
   * guard asks one question of every case: did md2org put an Org entity in the
   * file that Org will not turn back into a character? Whichever way the entity
   * story goes — resolved to the character, or passed through as the author
   * wrote it — the answer must be no. It is the only check that can catch a
   * generated "\\name{}" for a name Org does not know, and it needs an entity in
   * the corpus to have anything to catch.
   */
  { name: "entities leave no unresolved markup",
    md: "&amp; &apos; &divide; &mdash; &copy; &HilbertSpace; &frac12;" },

  /*
   * The author wrote "\\|", GFM required it, and md2org puts the backslash back
   * rather than generating a \\vert{} for it.
   *
   * Org has no cell escape at all, so the pipe still ends the field: this row
   * exports as three columns under a two-column header, and the "|" is consumed as
   * a boundary rather than shown. The backslash is what proves the pass-through
   * reached the file. That the table comes out broken is the documented outcome —
   * it is why DESIGN.md files this under "Pass through, with a warning" and not
   * under a conversion, and no arrangement of characters would have saved it.
   */
  { name: "an escaped pipe survives as the author wrote it",
    md: "| a |\n| --- |\n| x \\| y |", text: "x \\" },

  { name: "a single ] needs no entity at all",
    md: "[a\\]b](/u)", desc: "a]b", text: "a]b" },

  { name: "badge renders as a path-only description",
    md: "[![alt](/i.png)](/u)", desc: "/i.png" },

  { name: "code span survives as verbatim",
    md: "`a=b`", text: "a=b" },

  { name: "heading becomes a real headline",
    md: "# Title", text: "Title" },

  // A bare relative path matches no PATHREG pattern but FUZZY, so Org searched the
  // document for a headline called "url" and export failed. Valid Org throughout,
  // which is why nothing else in the suite could see it.
  { name: "a bare relative path exports",
    md: "[foo](url)", desc: "foo", text: "foo" },

  { name: "a path with a directory exports",
    md: "[foo](a/b.md)", desc: "foo", text: "foo" },

  { name: "a parenthesised path is not read as a coderef",
    md: "[link]((foo))", desc: "link", text: "link" }
];

// The warnings footer is md2org's own commentary, not converted content, and it
// would otherwise show up in every export. Strip it before asking Org.
function body(org) {
  const i = org.indexOf("\n\n# md2org warnings:");
  return i === -1 ? org : org.slice(0, i);
}

const orgs = CASES.map(c => body(md2org(c.md)));
const answers = askOrg(orgs);

console.log("EMACS          " + execFileSync("emacs", ["--version"], { encoding: "utf8" })
  .split("\n")[0].trim());

CASES.forEach((c, i) => {
  const a = answers[i];
  const org = orgs[i];

  if (c.desc !== undefined) {
    const found = a.links.length ? a.links[0][1] : null;
    if (found === c.desc) ok(c.name + " (parse)");
    else bad(c.name + " (parse)",
      "org: " + JSON.stringify(org) +
      "\n         Org read description " + JSON.stringify(found) +
      ", expected " + JSON.stringify(c.desc));
  }

  if (/^EXPORT-ERROR/.test(a.ascii)) {
    bad(c.name + " (export)",
      "org: " + JSON.stringify(org) + "\n         " + a.ascii);
    return;
  }

  if (c.text !== undefined) {
    if (a.ascii.indexOf(c.text) !== -1) ok(c.name + " (export)");
    else bad(c.name + " (export)",
      "org: " + JSON.stringify(org) +
      "\n         ASCII export " + JSON.stringify(a.ascii.trim()) +
      "\n         does not contain " + JSON.stringify(c.text));
  }
});

// No entity md2org generates may survive into an export: the whole justification
// for using one is that the reader gets the character back.
// Any generated entity, not a hand-kept list of the two that existed when this
// was written. A guard that names its targets stops covering the feature the
// moment the feature grows, and this one exists precisely to catch a name Org
// turns out not to know.
/*
 * Applied to the cases above and not to the documents below. On a real document
 * this cannot tell a generated entity from one the author typed inside a code
 * span while documenting the feature — this repository's own README does exactly
 * that — which is DESIGN.md's "static validation is weaker than it was" in
 * miniature. On a case the input is controlled, so the finding is unambiguous.
 */
const ENTITY = /\\[a-zA-Z][a-zA-Z0-9]*\{\}/;
const leaked = answers
  .map((a, i) => [CASES[i].name, a.ascii])
  .filter(([, ascii]) => ENTITY.test(ascii));
if (leaked.length) {
  leaked.forEach(([name, ascii]) =>
    bad(name + " (entity leaked into export)", JSON.stringify(ascii.trim())));
} else {
  ok("no generated entity survives into an export");
}

/*
 * Document scale.
 *
 * test/document.js converts the repository's own Markdown and asserts the result
 * is structurally valid Org. It cannot go further, because the failure this
 * guards against is not malformed output: a link Org cannot resolve is perfectly
 * valid Org, and Org's exporter can still refuse the whole document over it.
 * Every static tier stays green throughout.
 *
 * So the question only Org can answer is asked here, on whole documents rather
 * than constructs: does it come out the other side?
 */
const DOCS = ["README.md", "DESIGN.md", "FEATURES.md", "CHANGELOG.md"];
const docFiles = DOCS
  .map(r => path.join(__dirname, "..", r))
  .filter(f => fs.existsSync(f));

if (docFiles.length) {
  const docOrgs = docFiles.map(f => md2org(fs.readFileSync(f, "utf8")));
  const docAnswers = askOrg(docOrgs);

  docFiles.forEach((f, i) => {
    const name = path.basename(f) + " exports";
    const ascii = docAnswers[i].ascii;
    if (/^EXPORT-ERROR/.test(ascii)) bad(name, ascii);
    else if (!ascii.trim()) bad(name, "exported to nothing at all");
    else ok(name);
  });
}

console.log("");
console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
