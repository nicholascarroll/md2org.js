/*
 * Tests DESIGN.md Invariant 4: source text that changes how Org parses the
 * document is reported in the warnings footer.
 *
 *   node test/warnings.js
 *
 * Two checks:
 *
 *   Coverage. Each warning category has a case asserting its exact footer label,
 *   which catches a warning that stops firing.
 *
 *   Accounting. The headlines in the output, less those the footer warns about,
 *   must equal the Markdown headings converted to headlines. This catches a
 *   headline introduced by any route, not only those anticipated by a case. It
 *   runs over the corpus, the repository's documents and, via test/fuzz.js,
 *   random input.
 *
 * A row may carry a target label that differs from the label emitted today. It is
 * reported as pending, and the test fails if the row regresses or is fixed
 * without being updated.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const md2org = require("../src/md2org.js");
const cmark = require("../src/vendor/commonmark.js");
const corpus = require("./corpus.js");

/*
 * Container types whose headings become bold text rather than headlines, since a
 * headline would close the container. They are excluded from the count.
 */
const CONTAINER = new Set(["block_quote", "item", "table", "table_row", "table_cell"]);

/* Reads warnings from the footer, as a user would. */
function warnings(org) {
  const m = org.match(/\n\n# md2org warnings:\n([\s\S]*)$/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split("\n")) {
    const w = line.match(/^# (.+): line (.+)$/);
    if (w) out[w[1]] = w[2].split(", ").map(Number);
  }
  return out;
}

function body(org) {
  return org.replace(/\n\n# md2org warnings:\n[\s\S]*$/, "");
}

/*
 * md2org emits bullets as "- ", so any output line starting with asterisks and a
 * space is a headline. Lesser blocks are skipped; their bodies are comma-quoted.
 */
function headlinesIn(org) {
  const lines = body(org).split("\n");
  const out = [];
  let inLesser = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^[ \t]*#\+BEGIN_(EXAMPLE|SRC|EXPORT|VERSE|COMMENT)\b/i.test(l)) inLesser = true;
    else if (/^[ \t]*#\+END_/i.test(l)) inLesser = false;
    else if (!inLesser && /^\*+\s/.test(l)) out.push(i + 1);
  }
  return out;
}

function headingsIn(src) {
  let n = 0, depth = 0, ev;
  const walker = new cmark.Parser().parse(src).walker();
  while ((ev = walker.next())) {
    if (CONTAINER.has(ev.node.type)) { depth += ev.entering ? 1 : -1; continue; }
    if (ev.entering && ev.node.type === "heading" && depth === 0) n++;
  }
  return n;
}

/*
 * Heading accounting. Every headline in the output is either a converted Markdown
 * heading or passed-through text, which must be warned:
 *
 *     headlines(out) - warned lines == headings(src)
 *
 * Returns a description of the discrepancy, or null when it balances.
 */
function accountHeadings(src) {
  const org = md2org(src);
  const found = headlinesIn(org);
  const warned = warnings(org)["heading"] || [];
  const converted = headingsIn(src);
  const unexplained = found.filter(n => !warned.includes(n));
  const delta = unexplained.length - converted;
  if (delta === 0) return null;
  return (delta > 0
      ? delta + " headline(s) appeared from nowhere"
      : -delta + " Markdown heading(s) lost their headline") +
    ": output has " + found.length + " on lines [" + found + "], of which " +
    warned.length + " warned [" + warned + "]; source has " + converted +
    " Markdown heading(s)";
}

/* Exported so test/fuzz.js can run the accounting check on random input. */
module.exports = accountHeadings;
module.exports.warnings = warnings;

if (require.main !== module) return;

/*
 * One case per warning category (MAPPING.md, Warned rows).
 *
 *   key      the footer label emitted today
 *   target   the intended label, when it differs from key
 */
const TABLE = [
  { name: "]] inside a link description",
    md: "[a\\]\\]b](/u)",
    key: "]] in a link description" },

  { name: "** at line start becomes a heading",
    md: "text\n\n** looks like org",
    key: "heading" },

  { name: "escaped pipe in a table cell",
    md: "| a |\n| --- |\n| x \\| y |",
    key: "\\| in a table cell" },

  { name: "stray block delimiter",
    md: "para\n\n#+END_SRC",
    key: "stray block delimiter" },

  { name: "[[Some Page]] read as an Org link",
    md: "see [[Some Page]] here",
    key: "[[ ]] read as an Org link" },

  { name: "a link description ending in ]",
    md: "[a\\]](/u)",
    key: "]] in a link description" },

  /*
   * "\#" leaves a bare "#", which Org reads as a comment. Every character stays
   * in the file, so only this warning reports it.
   */
  { name: "escaped hash becomes an Org comment",
    md: "text\n\n\\# not a heading",
    key: "comment" },

  { name: "escaped hash inside a quote block",
    md: "> \\# not a heading\n>\n> body",
    key: "comment" }
];

/*
 * Inputs chosen to bring a headline to column 0 without a Markdown heading. The
 * corpus and the repository's documents do not exercise these routes.
 */
const ADVERSARIAL = [
  ["asterisk line inside an HTML region",
   "# Title\n\n<div>\n* claimed\n</div>\n\n## After\n\nbody\n"],
  ["asterisk line inside a details block",
   "<details>\n* a\n* b\n</details>\n"],
  ["org headline in a fenced block",
   "```\n** in code\n```\n"],
  ["org headline in a quote",
   "> ** quoted\n"],
  ["org headline in a list item",
   "- ** in a list\n"],
  ["org headline in a table cell",
   "| a |\n| --- |\n| ** x |\n"],
  ["org headline in running prose",
   "para\n\n** loose\n\nmore\n"],
  ["indented code holding a headline",
   "    ** indented\n"]
];

let pass = 0, fail = 0;
const ok = n => { pass++; console.log("  ok   " + n); };
const bad = (n, d) => { fail++; console.log("  FAIL " + n + "\n         " + d); };

console.log("WARNINGS — invariant 4");

let pending = 0;
for (const row of TABLE) {
  const w = warnings(md2org(row.md));
  const got = Object.keys(w);
  const expected = row.key === null ? [] : [row.key];

  if (got.length === expected.length && got.every(k => expected.includes(k))) {
    if (row.target && row.target !== row.key) {
      pending++;
      ok(row.name + "  [pending: emits " +
         (row.key === null ? "nothing" : JSON.stringify(row.key)) +
         ", DESIGN says " + JSON.stringify(row.target) + "]");
    } else {
      ok(row.name);
    }
  } else {
    bad(row.name, "expected footer keys " + JSON.stringify(expected) +
                  ", got " + JSON.stringify(got));
  }
}

/*
 * Constructs that look like Org markup where Org parses none, such as inside a
 * code span or block (§Text Markup: CONTENTS is a literal string). A warning here
 * would be false. Confirmed against Emacs 29.3.
 */
const SILENT = [
  ["[[ ]] inside a code span", "A `[[Some Page]]` literal."],
  ["[[ ]] inside a fenced block", "```\n[[Some Page]]\n```"],
  ["a block delimiter inside a code span", "`#+END_SRC` ends a block."],
  ["a block delimiter inside a fenced block", "```\n#+END_SRC\n```"],
  ["an asterisk line inside a fenced block", "```\n** not a heading\n```"],
  ["]] inside a code span", "A `a]]b` literal."],
  ["a pipe inside a code span outside a table", "A `x|y` literal."],
  /*
   * "# " is common in a shell or Python block, and Org parses no comment there.
   * Block bodies are comma-quoted for "*" and "#+" but not "#", so this exemption
   * is explicit.
   */
  ["a hash comment inside a src block", "```sh\n# install it\nnpm i\n```"],
  ["a hash comment inside an example block", "```\n# install it\n```"],
  /* Org requires "#" followed by whitespace or end of line; neither is a comment. */
  ["a hash with no space after it", "\\#1 fixed"],
  ["a keyword line", "\\#+TITLE: x"],
  /* Comments md2org emits itself. */
  ["md2org's own one-line comment", "<!-- a note -->"],
  ["md2org's own multi-line comment", "<!--\nline one\nline two\n-->"]
];

for (const [name, md] of SILENT) {
  const got = Object.keys(warnings(md2org(md)));
  if (got.length === 0) ok("silent: " + name);
  else bad("silent: " + name, "expected no footer, got " + JSON.stringify(got));
}

/* A clean document produces no footer. */
const quiet = md2org("# Title\n\nSome **bold** text.\n\n- a\n- b\n");
if (Object.keys(warnings(quiet)).length === 0) ok("ordinary document warns nothing");
else bad("ordinary document warns nothing", JSON.stringify(warnings(quiet)));

const docs = ["README.md", "DESIGN.md", "MAPPING.md", "CHANGELOG.md"]
  .map(r => path.join(__dirname, "..", r))
  .filter(f => fs.existsSync(f));

let unaccounted = 0;
for (const [name, src] of ADVERSARIAL) {
  const p = accountHeadings(src);
  if (p) { unaccounted++; bad("accounting: " + name, p); }
}
for (let i = 0; i < corpus.length; i++) {
  const p = accountHeadings(corpus[i]);
  if (p) { unaccounted++; bad("corpus[" + i + "] heading accounting", p); }
}
for (const f of docs) {
  const p = accountHeadings(fs.readFileSync(f, "utf8"));
  if (p) { unaccounted++; bad(path.basename(f) + " heading accounting", p); }
}
if (!unaccounted) {
  ok("every headline accounted for across " +
     (ADVERSARIAL.length + corpus.length + docs.length) + " documents");
}

console.log("");
if (pending) console.log("  " + pending + " row" + (pending > 1 ? "s" : "") +
  " pending — emits a warning DESIGN.md has since renamed, or none yet");
console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
