/*
 * DESIGN.md invariant 4, as a tier.
 *
 *   node test/warnings.js
 *
 *     If any text in the source happens to be valid Org syntax that changes how
 *     Org *parses* the document, it is reported in the Warnings Footer.
 *
 * Nothing tested invariant 4 before this file. That is worth stating plainly,
 * because it is the invariant the contract leans on hardest: md2org's answer to
 * every construct it decided not to fix is "we warn instead", and until now that
 * answer was unverified. A warning that silently stopped firing would have cost
 * nothing in any other tier — the output is still valid Org, the characters are
 * all present, Emacs still exports it. Invariant 4 is the only thing that
 * notices, and it had no oracle.
 *
 * TWO CHECKS, AND WHY BOTH
 *
 * The first is coverage: every row of DESIGN.md's warned table gets a case, and
 * the case asserts the exact warning key. That direction catches a warning that
 * disappears.
 *
 * The second is accounting, and it is the one with teeth. Count the headline
 * lines in the output; count the headings in the source; the difference must be
 * exactly the lines the footer warned about. A heading that appears from nowhere
 * — carried out of a container, emitted by a conversion, anything — fails here
 * without anyone having predicted the route it took. That is the property
 * invariant 4 actually promises, as opposed to a list of cases someone thought
 * of, and it runs over the corpus, the repository's own documents, and (through
 * test/fuzz.js) random input.
 *
 * PENDING ROWS
 *
 * Some rows of the table are design commitments the code has not caught up with.
 * They are listed with the key they emit *today* and the key DESIGN.md says they
 * should emit, and the tier asserts today's reality exactly. It fails if a
 * pending row regresses, and it fails if one is fixed without being moved, which
 * is the point: the list shortens deliberately or not at all. Same discipline as
 * EXPECTED_FAILURES in test/conformance.js.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const md2org = require("../src/md2org.js");
const cmark = require("../src/vendor/commonmark.js");
const corpus = require("./corpus.js");

/*
 * Headings md2org will emit as headlines, which is not every heading in the
 * tree. A heading inside a quote, a list item or a table cell becomes emphasis
 * instead: a headline there would close the container it is sitting in, so
 * md2org declines to make one. Counting those would report a lost headline on
 * every "> # H" in the corpus, which is a correct conversion.
 */
const CONTAINER = new Set(["block_quote", "item", "table", "table_row", "table_cell"]);

/* The footer is the contract's only output channel for a warning. Read it back
 * the way a user would, rather than reaching into renderOrg.warn. */
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
 * md2org emits a bullet as "- ", never "* ", so every line in the output that
 * starts with asterisks and a space is a headline as far as Org is concerned.
 * Lesser blocks are skipped: their contents are raw text and are comma-quoted,
 * so an asterisk there is not at the start of a line any more.
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
 * Heading accounting.
 *
 * Every headline in the output came from exactly one of two places: a Markdown
 * heading md2org converted, or source text that already looked like a headline
 * and passed through. The second kind must be warned. So:
 *
 *     headlines(out) - warned lines == headings(src)
 *
 * Any other number means a headline appeared or vanished by a route nobody
 * accounted for, which is precisely the failure invariant 4 exists to catch and
 * the one no other tier can see: an injected headline is perfectly valid Org,
 * keeps every character of the source, and exports without complaint.
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
 * DESIGN.md, "Pass through, with a warning". One row, one case.
 *
 *   key      what the footer says today
 *   target   what DESIGN.md says it should say; omitted when they agree
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
    key: "]] in a link description" }
];

/*
 * The corpus and the repository's documents are a friendly corpus: they are
 * written by people who know md2org, and neither contains a line that only looks
 * like a headline once it has been carried out of the container it started in.
 * A check with teeth needs input chosen to bite. Every entry below is a route by
 * which a headline can reach column 0 without being a Markdown heading.
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
 * The other direction, and nothing checked it before. These are constructs that
 * read as Org markup but sit where Org parses no markup at all, so a warning
 * about one is a false report against an invariant scoped to the parse and
 * nothing else. It costs more than a missing warning does: the footer is the
 * only place md2org writes words the author did not, and a reader who learns to
 * skip it loses the true findings with the false. Every case below was confirmed
 * against Emacs 29.3, which finds no link, no headline and no block in any of
 * them -- §Text Markup makes the contents of a verbatim span a literal string.
 */
const SILENT = [
  ["[[ ]] inside a code span", "A `[[Some Page]]` literal."],
  ["[[ ]] inside a fenced block", "```\n[[Some Page]]\n```"],
  ["a block delimiter inside a code span", "`#+END_SRC` ends a block."],
  ["a block delimiter inside a fenced block", "```\n#+END_SRC\n```"],
  ["an asterisk line inside a fenced block", "```\n** not a heading\n```"],
  ["]] inside a code span", "A `a]]b` literal."],
  ["a pipe inside a code span outside a table", "A `x|y` literal."]
];

for (const [name, md] of SILENT) {
  const got = Object.keys(warnings(md2org(md)));
  if (got.length === 0) ok("silent: " + name);
  else bad("silent: " + name, "expected no footer, got " + JSON.stringify(got));
}

/* A clean document must produce no footer at all. The footer is the only place
 * md2org writes words the author didn't, so a spurious one is its own defect. */
const quiet = md2org("# Title\n\nSome **bold** text.\n\n- a\n- b\n");
if (Object.keys(warnings(quiet)).length === 0) ok("ordinary document warns nothing");
else bad("ordinary document warns nothing", JSON.stringify(warnings(quiet)));

const docs = ["README.md", "DESIGN.md", "FEATURES.md", "CHANGELOG.md"]
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
