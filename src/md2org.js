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
      escapeLinkDesc = __esc.escapeLinkDesc,
      escapeLinkPath = __esc.escapeLinkPath,
      protectBlockBody = __esc.protectBlockBody,
      escapeCell = __esc.escapeCell;
}

/* --8<-- core start */

function md2org(src) {
  if (typeof src !== "string") src = String(src == null ? "" : src);
  if (src === "") return "";
  renderOrg.warn = [];

  var parser = new __cmark.Parser({ sourcepos: true });

  var escapes = {
    codeSpan: codeSpan,
    escapeLinkDesc: escapeLinkDesc,
    escapeLinkPath: escapeLinkPath,
    protectBlockBody: protectBlockBody,
    escapeCell: escapeCell
  };

  var out = renderOrg(parser.parse(src), escapes);
  return renderOrg.warn.length ? out + "\n\n# md2org warnings:\n" +
    renderOrg.warn.map(function (w) { return "# line " + w.n + ": " + w.t; }).join("\n") : out;
}

/* --8<-- core end */

// Universal export: CommonJS (Node/CLI), bundlers, browser global.
if (typeof module !== "undefined" && module.exports) {
  module.exports = md2org;
  module.exports.md2org = md2org;
}
if (typeof window !== "undefined") {
  window.md2org = md2org;
}
