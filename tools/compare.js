/*
 * Where does md2org's output differ from what other tools make of the same
 * Markdown? Not a test. Nothing here passes or fails.
 *
 *   node tools/compare.js               all 652 CommonMark examples
 *   node tools/compare.js links         only sections matching "links"
 *   node tools/compare.js -n 355        one example by number
 *   node tools/compare.js -v            show every difference, not a summary
 *
 * Needs Emacs. Uses Pandoc as well if it is installed.
 *
 * WHAT IT COMPARES
 *
 * For each example the CommonMark spec gives Markdown and the HTML it must
 * produce. That HTML is a statement about meaning, so its text content is a
 * reasonable stand-in for "what the document says". So:
 *
 *   spec Markdown ---> md2org ---> Org ---> Emacs ox-html ---> text
 *   spec Markdown ------------------------> spec's own HTML ---> text
 *
 * and the two texts should agree. Where they do not, either md2org dropped
 * something or Org read it differently than intended.
 *
 * NEITHER SIDE IS TRUTH
 *
 * Emacs is not an oracle. Its exporter has its own losses, its own opinions and
 * its own bugs, and it changes between versions. Pandoc is not an oracle either,
 * and it converts Markdown to Org directly, which is md2org's own job rather than
 * a check on it. The tool versions are printed at the top of every run for that
 * reason: a change in these numbers is as likely to be a change in Emacs as a
 * change in md2org.
 *
 * What the second opinion is good for is priority. Where Pandoc agrees with
 * md2org, a difference from the spec is probably inherent to Org. Where Pandoc
 * differs from md2org, md2org is worth looking at first. Where the two disagree
 * with each other the case is likely ambiguous and probably not worth the time.
 *
 * WHY THIS IS NOT IN test/
 *
 * The match count moves when Emacs moves, so asserting it would fail the build for
 * reasons that have nothing to do with this repository. Differences that ARE
 * defects get promoted by hand into test/emacs.js, where the right answer is
 * obvious and stays obvious. This file is for finding them, not for guarding them.
 * The fuzzy-link defect fixed in 1.0.1 was found here and now lives there.
 */
"use strict";

const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const extract = require("../test/extract.js");
const md2org = require("../src/md2org.js");

const args = process.argv.slice(2);
const verbose = args.includes("-v");
const nIdx = args.indexOf("-n");
const only = nIdx !== -1 ? Number(args[nIdx + 1]) : null;
const filter = args.find((a, i) => !a.startsWith("-") && args[i - 1] !== "-n");

function have(cmd) {
  return spawnSync(cmd, ["--version"], { encoding: "utf8" }).status === 0;
}
function version(cmd) {
  const r = spawnSync(cmd, ["--version"], { encoding: "utf8" });
  return r.stdout ? r.stdout.split("\n")[0].trim() : "?";
}

if (!have("emacs")) {
  console.log("This tool needs Emacs. Install it, or run it on a machine that has it.");
  process.exit(1);
}
const hasPandoc = have("pandoc");

// The warnings footer is md2org's own commentary, not converted content.
function body(org) {
  const i = org.indexOf("\n\n# md2org warnings:");
  return i === -1 ? org : org.slice(0, i);
}

let examples = extract(extract.SPEC);
if (only !== null) examples = examples.filter(e => e.n === only);
else if (filter) {
  const f = filter.toLowerCase();
  examples = examples.filter(e => (e.section || "").toLowerCase().indexOf(f) !== -1);
}
if (!examples.length) {
  console.log("Nothing matched. Sections look like: Links, Emphasis and strong emphasis, Images.");
  process.exit(1);
}

const orgs = examples.map(e => body(md2org(e.markdown)));

/* One Emacs process for the whole run: startup dominates everything else. */
function orgToHtml(docs) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "md2org-cmp-"));
  const inF = path.join(tmp, "in.json"), outF = path.join(tmp, "out.json");
  fs.writeFileSync(inF, JSON.stringify(docs));
  fs.writeFileSync(path.join(tmp, "run.el"), `
(require 'org)(require 'ox-html)(require 'json)
;; toc and section numbers are Org furniture, not content, and would differ on
;; every heading example. sub-superscripts is a real judgement call and is turned
;; off here deliberately: with Org's default, "foo_bar_" exports as "foobar_"
;; because "_bar" is read as a subscript. That is Org reinterpreting text the
;; author wrote as plain, which is worth knowing about, but it fires on so many
;; examples that it drowns everything else. Set it back to t to see that class.
(setq org-export-with-toc nil org-export-with-section-numbers nil
      org-export-with-sub-superscripts nil)
(let ((cases (with-temp-buffer (insert-file-contents ${JSON.stringify(inF)})
               (json-parse-buffer :array-type 'list)))
      (out '()))
  (dolist (o cases)
    (push (with-temp-buffer
            (insert o) (org-mode)
            (condition-case e (org-export-as 'html nil nil t)
              (error (format "EXPORT-ERROR: %s" (error-message-string e)))))
          out))
  (with-temp-file ${JSON.stringify(outF)} (insert (json-encode (vconcat (nreverse out))))))
`);
  execFileSync("emacs", ["-Q", "--batch", "-l", path.join(tmp, "run.el")],
               { stdio: "pipe", maxBuffer: 1 << 28 });
  const r = JSON.parse(fs.readFileSync(outF, "utf8"));
  fs.rmSync(tmp, { recursive: true, force: true });
  return r;
}

function pandocOrg(md) {
  const r = spawnSync("pandoc", ["-f", "commonmark", "-t", "org"],
                      { input: md, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
}

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function text(html) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (m, d) => String.fromCodePoint(parseInt(d, 16)))
    .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d))
    .replace(/&(\w+);/g, (m, n) => (NAMED[n] !== undefined ? NAMED[n] : m));
}
// Whitespace is where the two paths differ most and mean least: Org's exporter
// fills paragraphs, the spec's HTML does not.
const norm = h => text(h).replace(/\s+/g, "");

console.log("md2org compare");
console.log("  " + version("emacs"));
console.log("  " + (hasPandoc ? version("pandoc") : "pandoc not installed (second opinion unavailable)"));
console.log("  " + examples.length + " CommonMark examples\n");

const html = orgToHtml(orgs);
const diffs = [];
let match = 0, errors = 0;

examples.forEach((e, i) => {
  const got = html[i];
  if (/^EXPORT-ERROR/.test(got)) { errors++; diffs.push({ e, org: orgs[i], got, kind: "export" }); return; }
  if (norm(e.html) === norm(got)) { match++; return; }
  diffs.push({ e, org: orgs[i], got, kind: "text", want: norm(e.html), have: norm(got) });
});

console.log("  matches      " + match + "/" + examples.length +
            "  (" + (match / examples.length * 100).toFixed(1) + "%)");
console.log("  export fails " + errors);
console.log("  differences  " + (diffs.length - errors) + "\n");

if (!verbose && diffs.length > 12) {
  const bySection = {};
  diffs.forEach(d => (bySection[d.e.section] = bySection[d.e.section] || []).push(d.e.n));
  console.log("  by section (use -v for detail, or pass a section name):");
  Object.entries(bySection).sort((a, b) => b[1].length - a[1].length)
    .forEach(([s, ns]) => console.log("    " + String(ns.length).padStart(3) + "  " + s +
                                      "   #" + ns.slice(0, 5).join(" #")));
  process.exit(0);
}

diffs.forEach(d => {
  console.log("#" + d.e.n + "  " + d.e.section);
  console.log("  markdown : " + JSON.stringify(d.e.markdown.trim()));
  console.log("  md2org   : " + JSON.stringify(d.org));
  if (hasPandoc) {
    const p = pandocOrg(d.e.markdown);
    if (p !== null && p !== d.org) console.log("  pandoc   : " + JSON.stringify(p));
    else if (p !== null) console.log("  pandoc   : (same)");
  }
  if (d.kind === "export") console.log("  " + d.got);
  else {
    console.log("  spec says: " + JSON.stringify(d.want));
    console.log("  we give  : " + JSON.stringify(d.have));
  }
  console.log("");
});
