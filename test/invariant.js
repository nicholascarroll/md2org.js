/*
 * Tests DESIGN.md Invariant 1: every non-markup character in the source appears
 * in the output.
 *
 *   node test/invariant.js
 *
 * Exported for test/fuzz.js, which applies it to every generated document.
 *
 * Non-markup characters are the parser's leaves: text, code spans, code blocks
 * and raw HTML. Before comparing, the output is normalised by reversing
 * comma-quoting and the restored backslash of "\|" in table cells.
 *
 * Two documented losses are exempt (MAPPING.md): alt text on a badge, which an
 * Org link description cannot hold, and the delimiters of an HTML comment, which
 * are translated to Org comment syntax. A link title is not a leaf, so it needs
 * no exemption.
 */
"use strict";

const cmark = require("../src/vendor/commonmark.js");

/*
 * Reverses output-side handling that is not part of the author's text.
 */
function unescape(org) {
  return org
    // A pipe in a table cell: the parser consumed the backslash of "\|" and
    // md2org restored it, so it is removed to compare with the leaf.
    .replace(/\\\|/g, "|")
    // Org's own comma-quoting, reversed the way Org reverses it on read. Mirrors
    // protectBlockBody in src/org-escape.js, which quotes after any indentation
    // and after any commas already there.
    .replace(/^([ \t]*)(,*),(\*|#\+)/gm, "$1$2$3");
}

/*
 * Collects content leaves, skipping the documented losses. Links and images are
 * counted together; a leaf at depth 2 or more is inside a badge.
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

    // Alt text on a badge (MAPPING.md, Lossy).
    if (depth > 1) continue;

    // A comment becomes an Org comment; its delimiters are translated markup.
    if ((type === "html_block" || type === "html_inline") &&
        /^\s*<!--/.test(node.literal)) continue;

    // An HTML block is opaque: its literal is the whole region, which md2org
    // passes into an export block. It is compared line by line, trimmed because a
    // region inside a list item is re-indented. Inline HTML contributes only the
    // tag; the surrounding text arrives as ordinary text nodes.
    if (type === "html_block" || type === "html_inline") {
      node.literal.split("\n").forEach(function (l) {
        if (l.trim()) out.push({ type: type, literal: l.trim() });
      });
      continue;
    }

    if (type === "text" || type === "code" || type === "code_block" || type === "math") {
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
    // Code blocks and math are emitted line by line; compare on the same terms.
    const pieces = leaf.type === "code_block" || leaf.type === "math"
      ? leaf.literal.split("\n").filter(s => s !== "")
      : [leaf.literal];

    for (const piece of pieces) {
      if (piece === "") continue;
      // A leaf survives if it appears as written or in the normalised output;
      // normalising alone could alter text the author wrote, such as "\|".
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

/* Runnable on its own, over the corpus and the repository's documents. */
if (require.main === module) {
  const fs = require("fs");
  const path = require("path");
  const md2org = require("../src/md2org.js");
  const corpus = require("./corpus.js");

  const inputs = corpus.map((src, i) => ["corpus[" + i + "]", src]);
  for (const rel of ["README.md", "DESIGN.md", "MAPPING.md", "CHANGELOG.md"]) {
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
