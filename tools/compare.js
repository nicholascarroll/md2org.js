/*
 * Reports where md2org's output differs in meaning from the CommonMark spec's
 * reference HTML. Not a test; nothing passes or fails.
 *
 *   node tools/compare.js               all 652 CommonMark examples
 *   node tools/compare.js links         only sections matching "links"
 *   node tools/compare.js -n 355        one example by number
 *   node tools/compare.js -v            show every difference, not a summary
 *
 * Requires Emacs. Uses Pandoc as a second opinion if installed.
 *
 * Each example's text content is compared along two paths:
 *
 *   spec Markdown ---> md2org ---> Org ---> Emacs ox-html ---> text
 *   spec Markdown ------------------------> spec's own HTML ---> text
 *
 * A difference means md2org dropped something or Org read it differently.
 * Neither Emacs nor Pandoc is authoritative, so tool versions are printed with
 * every run. Where Pandoc agrees with md2org, the difference is probably inherent
 * to Org; where it differs, md2org is the first place to look.
 *
 * The match count depends on the Emacs version, so it is not asserted. Confirmed
 * defects are added to test/emacs.js.
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

/* One Emacs process for the whole run, since startup dominates. */
function orgToHtml(docs) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "md2org-cmp-"));
  const inF = path.join(tmp, "in.json"), outF = path.join(tmp, "out.json");
  fs.writeFileSync(inF, JSON.stringify(docs));
  fs.writeFileSync(path.join(tmp, "run.el"), `
(require 'org)(require 'ox-html)(require 'json)
;; TOC and section numbers are export furniture, not content. Sub- and
;; superscripts are off because Org reads "_bar" in "foo_bar_" as a subscript,
;; which would dominate the results; set it to t to see that class.
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
// Ignore whitespace: Org's exporter fills paragraphs and the spec's HTML does not.
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
