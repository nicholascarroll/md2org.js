/*
 * Checks md2org's output with Emacs, the reference Org implementation.
 *
 *   node test/emacs.js
 *
 * Part of `npm test`; exits zero with a notice when Emacs is not installed. CI
 * installs it. This is the only tier that tests export, which can fail on output
 * that is structurally valid Org.
 *
 * Each case asks two questions:
 *
 *   1. Does the output parse into the intended structure? A link that closes
 *      early is still valid Org, so only Org can report the description it found.
 *   2. Does the export contain the characters the author wrote? This is the most
 *      direct test of DESIGN.md Invariant 1.
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

/* One Emacs process for the whole run, since startup dominates. */
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
    (let (links latex ascii)
      (with-temp-buffer
        (insert org)
        (org-mode)
        (setq links
              (org-element-map (org-element-parse-buffer) 'link
                (lambda (l)
                  ;; A vector, not a list: json-encode would emit a list of
                  ;; strings as an object.
                  (vector (or (org-element-property :path l) "")
                          (let ((b (org-element-property :contents-begin l))
                                (e (org-element-property :contents-end l)))
                            (if (and b e) (buffer-substring-no-properties b e) ""))))))
        (setq latex
              (org-element-map (org-element-parse-buffer) 'latex-fragment
                (lambda (f) (org-element-property :value f))))
        (setq ascii (condition-case e (org-export-as 'ascii nil nil t)
                      (error (format "EXPORT-ERROR: %s" (error-message-string e))))))
      (push (list (cons 'links (vconcat links)) (cons 'latex (vconcat latex))
                  (cons 'ascii ascii)) results)))
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
 * Each case gives Markdown and what Org should find after conversion:
 *   desc    the description Org parses from the first link; detects a link that
 *           closed early
 *   text    a string the ASCII export must contain
 *   absent  a string the ASCII export must not contain
 *   latex   the LaTeX fragments Org parses, in order
 */
const CASES = [
  { name: "ordinary link keeps its description",
    md: "[text](/u)", desc: "text" },

  /*
   * "]]" in a description is passed through and warned. Org ends the link at the
   * first "]]", so only the export is checked: every character must survive.
   */
  { name: "]] in a description keeps every character",
    md: "[a\\]\\]b](/u)", text: "a]" },

  { name: "]] from a code span keeps every character",
    md: "[see `a]]b` now](/u)", text: "see" },

  { name: "a description ending in ] keeps every character",
    md: "[a\\]](/u)", text: "a]" },

  /*
   * "\#" leaves a bare "#", which Org reads as a comment and drops from every
   * export. Checked against Emacs because the claim is about Org's behaviour.
   */
  { name: "an escaped hash is dropped by Org",
    md: "Release notes.\n\n\\# not a heading, just a hash\n\nTail line.",
    text: "Tail line.", absent: "not a heading" },

  /*
   * Checked only by the entity guard below: no Org entity may reach an export.
   */
  { name: "entities leave no unresolved markup",
    md: "&amp; &apos; &divide; &mdash; &copy; &HilbertSpace; &frac12;" },

  /*
   * The parser consumes the backslash of "\|" and md2org restores it. The pipe
   * still ends the cell, since Org has no escape for it; the backslash in the
   * export shows that the text passed through.
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

  // A bare relative path would be a FUZZY link, which fails on export while
  // remaining valid Org.
  { name: "a bare relative path exports",
    md: "[foo](url)", desc: "foo", text: "foo" },

  { name: "a path with a directory exports",
    md: "[foo](a/b.md)", desc: "foo", text: "foo" },

  { name: "a parenthesised path is not read as a coderef",
    md: "[link]((foo))", desc: "link", text: "link" },

  // Math is copied verbatim and Org reads it as LaTeX fragments.
  { name: "inline and display math are LaTeX fragments",
    md: "where \\(A_{ij}\\) is\n\n\\[\n\\sum_j A_{ij} = 1\n\\]",
    latex: ["\\(A_{ij}\\)", "\\[\n\\sum_j A_{ij} = 1\n\\]"] },

  { name: "a mid-line \\[ is not math",
    md: "see \\[1\\] here", latex: [], text: "see [1] here" }
];

// The warnings footer is not converted content; strip it before export.
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

  if (c.latex !== undefined) {
    if (JSON.stringify(a.latex) === JSON.stringify(c.latex)) ok(c.name + " (parse)");
    else bad(c.name + " (parse)",
      "org: " + JSON.stringify(org) +
      "\n         Org read LaTeX " + JSON.stringify(a.latex) +
      ", expected " + JSON.stringify(c.latex));
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
  /* Content the export is expected to drop, for warned constructs. */
  if (c.absent !== undefined) {
    if (a.ascii.indexOf(c.absent) === -1) ok(c.name + " (dropped on export)");
    else bad(c.name + " (dropped on export)",
      "org: " + JSON.stringify(org) +
      "\n         ASCII export " + JSON.stringify(a.ascii.trim()) +
      "\n         still contains " + JSON.stringify(c.absent));
  }
});

/*
 * No Org entity may appear in an export, since md2org generates none. The
 * pattern matches any entity rather than a list of names. Applied only to the
 * cases above, because a real document may contain an entity the author typed in
 * a code span.
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
 * Document scale: the repository's own Markdown must export. An unresolvable link
 * is valid Org but can make the exporter reject the whole document, which no
 * static tier detects.
 */
const DOCS = ["README.md", "DESIGN.md", "MAPPING.md", "CHANGELOG.md"];
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
