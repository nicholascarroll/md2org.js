/*
 * DESIGN.md invariant 1, as a property.
 *
 *   node test/invariant.js
 *
 *     Every non-markup character in the source appears in the output.
 *
 * This is the replacement oracle. test/org-validate.js used to be a total one —
 * it could judge any output without being told the answer, which is what makes
 * the fuzzer work. Under the contract it lost three checks, because literal text
 * can look like any Org markup and nothing in the output distinguishes text
 * md2org copied from markup md2org generated.
 *
 * It is exported as well as runnable, and test/fuzz.js calls it on every document
 * it generates. That is the point: an invariant checked against a fixed list of
 * inputs is a fixture test wearing a costume. Against 5,000 random documents it
 * says something about the program.
 *
 * HOW IT DECIDES WHAT COUNTS AS NON-MARKUP
 *
 * The parser has already made that judgement, so we ask it rather than guess.
 * The leaves of the tree — text, code spans, code blocks, raw HTML — are exactly
 * the characters CommonMark decided were content rather than syntax. Everything
 * else in the tree is markup, and markup is what md2org is licensed to change.
 *
 * WHAT IS NORMALISED BEFORE COMPARING
 *
 * Two things, and both are due to shrink.
 *
 * The Org entities md2org still generates are reversed first, because those are
 * the cases where a generated wrapper would otherwise break on the content it
 * wraps and Org gives the slot no escape syntax. Reversing them asks the real
 * question: did the author's characters survive, once md2org's own mechanisms
 * are undone? DESIGN.md commits to md2org generating no entities at all, at
 * which point both lines below delete themselves and this file gets stronger for
 * it — an oracle that reverses fewer of the program's own decisions is grading
 * less of the answer with the answer key.
 *
 * Comma-quoting is Org's, not ours, and Org reverses it on read.
 *
 * THE EXCEPTIONS, AND WHY THEY ARE NOT CHEATING
 *
 * Two constructs lose characters by design, and both are in FEATURES.md's "Not
 * convertible" table with a reason:
 *
 *   - Alt text on a badge. An Org link description may contain only a plain or
 *     angle link, so an image inside a link cannot keep its alt text.
 *   - An HTML comment. It converts to an Org comment, so the "<!--" delimiters
 *     are markup that has been translated, not content that was dropped.
 *
 * A link title is not listed because it never reaches the tree as a leaf; it is
 * a property of the link node, and FEATURES.md records it as dropped.
 *
 * If a third exception ever seems necessary, that is the interesting moment. The
 * value of this file is that the list is short and every entry cites a documented
 * decision. An exception added to make a run go green would cost exactly what the
 * fuzzer's ACCEPTED list would have cost had it been tuned instead of argued.
 */
"use strict";

const cmark = require("../src/vendor/commonmark.js");

/*
 * md2org's own escaping, reversed rather than ignored. Both entries go when
 * DESIGN.md's "md2org generates no Org entities" lands; nothing else here is
 * ours to undo.
 */
function unescape(org) {
  return org
    .replace(/\\vert\{\}/g, "|")        // a pipe in a table cell
    .replace(/\\zwnj\{\}/g, "")         // the separator inside "]]"
    // Org's own comma-quoting, reversed the way Org reverses it on read. Mirrors
    // protectBlockBody in src/org-escape.js, which quotes after any indentation
    // and after any commas already there.
    .replace(/^([ \t]*)(,*),(\*|#\+)/gm, "$1$2$3");
}

/*
 * Collect the content characters, skipping the two documented losses.
 *
 * Depth is counted over link and image nodes together, because Org makes no
 * distinction: an image is a link whose path happens to be displayable. A leaf
 * at depth 2 or more is inside a badge, where the description has nowhere to go.
 */
function contentLeaves(ast) {
  const out = [];
  const walker = ast.walker();
  let event, depth = 0;

  while ((event = walker.next())) {
    const node = event.node;
    const type = node.type;

    if (type === "link" || type === "image") {
      depth += event.entering ? 1 : -1;
      continue;
    }
    if (!event.entering || !node.literal) continue;

    // Alt text on a badge: FEATURES.md, Not convertible.
    if (depth > 1) continue;

    // A comment becomes an Org comment; its delimiters are translated markup.
    if ((type === "html_block" || type === "html_inline") &&
        /^\s*<!--/.test(node.literal)) continue;

    // A tag is markup, so rule 1 governs it and md2org may rewrap or fold it.
    // The text between tags is content, and DESIGN.md invariant 6 is the promise
    // that it survives, so that is what is checked. Compared line by line and
    // trimmed, because md2org re-indents an HTML region carried inside a list
    // item: the words are what invariant 6 promises, their leading whitespace is
    // the container's business.
    if (type === "html_block" || type === "html_inline") {
      node.literal.split(/<[^>]*>/).forEach(function (piece) {
        piece.split("\n").forEach(function (l) {
          if (l.trim()) out.push({ type: type, literal: l.trim() });
        });
      });
      continue;
    }

    if (type === "text" || type === "code" || type === "code_block") {
      out.push({ type: type, literal: node.literal });
    }
  }
  return out;
}

/*
 * Returns a list of problems, empty when the invariant holds. Same shape as
 * test/org-validate.js so the fuzzer can treat them alike.
 */
function checkInvariant1(src, org) {
  const ast = new cmark.Parser().parse(src);
  const plain = unescape(org);
  const problems = [];

  for (const leaf of contentLeaves(ast)) {
    // A code block's body is emitted line by line; compare on the same terms.
    const pieces = leaf.type === "code_block"
      ? leaf.literal.split("\n").filter(s => s !== "")
      : [leaf.literal];

    for (const piece of pieces) {
      if (piece === "") continue;
      // Either form counts. An author may write "\vert{}" in the source — this
      // repository's own documentation does — and unescaping the output would
      // erase the very characters we are looking for. So a leaf survives if it
      // appears as written, or if it appears once md2org's escaping is undone.
      if (org.indexOf(piece) === -1 && plain.indexOf(piece) === -1) {
        problems.push("invariant 1: " + leaf.type + " content missing from output: " +
                      JSON.stringify(piece.length > 40 ? piece.slice(0, 40) + "…" : piece));
      }
    }
  }
  return problems;
}

module.exports = checkInvariant1;
module.exports.unescape = unescape;

/* Runnable on its own, over the inputs the project already maintains. */
if (require.main === module) {
  const fs = require("fs");
  const path = require("path");
  const md2org = require("../src/md2org.js");
  const corpus = require("./corpus.js");

  const inputs = corpus.map((src, i) => ["corpus[" + i + "]", src]);
  for (const rel of ["README.md", "DESIGN.md", "FEATURES.md", "CHANGELOG.md"]) {
    const file = path.join(__dirname, "..", rel);
    if (fs.existsSync(file)) inputs.push([rel, fs.readFileSync(file, "utf8")]);
  }

  let bad = 0, checked = 0;
  for (const [name, src] of inputs) {
    const problems = checkInvariant1(src, md2org(src));
    checked++;
    if (problems.length) {
      bad++;
      console.log("  FAIL " + name);
      problems.slice(0, 3).forEach(p => console.log("         " + p));
      console.log("         input: " + JSON.stringify(src.length > 60 ? src.slice(0, 60) + "…" : src));
    }
  }

  console.log("INVARIANT 1    " + (checked - bad) + "/" + checked + " inputs keep every non-markup character");
  process.exit(bad ? 1 : 0);
}
