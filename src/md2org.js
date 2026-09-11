/*
 * md2org — one-way Markdown to Org mode converter.
 *
 * A single pure function: string in, string out. No I/O, no platform APIs, no
 * network. The CLI, the web page and the iOS Shortcut all run this same code,
 * generated into place by build.js, so they can never drift.
 *
 * Design: CommonMark's own two-phase strategy (spec Appendix, "A parsing
 * strategy"). A forked CommonMark parser produces an AST; org-render walks it;
 * org-escape owns the invariant that everything emitted is valid Org. Precedence,
 * emphasis nesting and link reference definitions are handled by the parser rather
 * than by ordering regular expressions, which is what the previous single-pass
 * design could not do.
 *
 *   src/vendor/commonmark.js   parse  (forked commonmark.js, BSD-2-Clause)
 *   src/org-escape.js          escaping layer
 *   src/org-render.js          AST -> Org
 */


/*
 * Node/CommonJS bootstrap. build.js concatenates the modules into one scope for
 * the browser and Shortcut copies, so this block sits outside the core markers
 * and is dropped from the generated bundles.
 */
if (typeof __cmark === "undefined") { var __cmark = require("./vendor/commonmark.js"); }
if (typeof renderOrg === "undefined") { var renderOrg = require("./org-render.js"); }
if (typeof codeSpan === "undefined") {
  var __esc = require("./org-escape.js");
  var codeSpan = __esc.codeSpan,
      escapeLinkPath = __esc.escapeLinkPath,
      protectBlockBody = __esc.protectBlockBody,
      escapeCell = __esc.escapeCell;
}

/* --8<-- core start */

function md2org(src) {
  if (typeof src !== "string") src = String(src == null ? "" : src);
  if (src === "") return "";
  renderOrg.warn = {};

  var parser = new __cmark.Parser({ sourcepos: true });

  var escapes = {
    codeSpan: codeSpan,
    escapeLinkPath: escapeLinkPath,
    protectBlockBody: protectBlockBody,
    escapeCell: escapeCell
  };

  var out = renderOrg(parser.parse(src), escapes);
  var k = Object.keys(renderOrg.warn);
  return k.length ? out + "\n\n# md2org warnings:\n" +
    k.map(function (x) { return "# " + x + ": line " + renderOrg.warn[x].join(", "); }).join("\n") : out;
}

/* --8<-- core end */

/*
 * Character-reference decoding, off by default.
 *
 * md2org decodes no character reference: "&mdash;", "&#8212;" and "&#x2014;" all
 * reach the Org file as the author typed them. That is the contract, it is one
 * sentence with no exceptions, and it is the same on all three targets.
 *
 * The reason is size and only size. Upstream's name table is 123 KB minified
 * against a whole-file budget of 39 KB for the iOS Shortcut, so the shipped parser
 * cannot carry it. The CLI and the browser have no such limit, so they can offer
 * the conversion as something the user asks for: every reference becomes the UTF-8
 * character it names.
 *
 * It stays off by default, which is not tidiness. build.js verifies that src/, the
 * browser copy and the Shortcut copy convert 53 inputs identically, and that check
 * is the only proof that the three targets are one program. A default that differed
 * by target would mean relaxing it permanently, for every future change.
 *
 * This lives outside the core markers, so nothing here reaches the Shortcut and
 * the option costs it zero bytes. The core reads __cmark when it is called rather
 * than closing over it, which is what lets the parser be swapped from out here
 * without the core knowing the option exists. The 156 KB bundle is required on
 * first use only.
 *
 * Decoding produces characters, and some of them are Org syntax — "&#42; foo"
 * decodes to a level-1 headline and "&#35; foo" to a comment. Both are reported
 * in the Warnings Footer like any other line Org reads differently from the way
 * the source read, so the option widens no hole the default does not already have.
 */
var __cmarkEntities = null;

md2org.withEntities = function (src) {
  if (!__cmarkEntities) __cmarkEntities = require("./vendor/commonmark-entities.js");
  var saved = __cmark;
  __cmark = __cmarkEntities;
  try {
    return md2org(src);
  } finally {
    __cmark = saved;
  }
};

// Universal export: CommonJS (Node/CLI), bundlers, browser global.
if (typeof module !== "undefined" && module.exports) {
  module.exports = md2org;
  module.exports.md2org = md2org;
}
if (typeof window !== "undefined") {
  window.md2org = md2org;
}
