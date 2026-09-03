/*
 * md2org: one-way Markdown to Org mode converter.
 *
 * A pure function, string in and string out, with no I/O or platform APIs. The
 * CLI, the web page and the iOS Shortcut run this same code, copied into place by
 * build.js.
 *
 * Structure follows CommonMark's two-phase parsing strategy (spec Appendix):
 *
 *   src/vendor/commonmark.js   parse   (forked commonmark.js, BSD-2-Clause)
 *   src/org-render.js          AST to Org
 *   src/org-escape.js          escaping
 */


/*
 * Node/CommonJS bootstrap. Outside the core markers, so build.js drops it from
 * the generated bundles, which concatenate the modules into one scope.
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
 * Character-reference decoding, off by default (DESIGN.md, Character references
 * and entities). Used by the CLI's -e option.
 *
 * Outside the core markers, so it costs the Shortcut nothing. It swaps in the
 * parser built with upstream's entity table, which is loaded on first use. This
 * works because the core reads __cmark at call time.
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
