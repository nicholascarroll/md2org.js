/*
 * Regenerates src/vendor/commonmark.js and test/vendor-cmark-html.js.
 *
 * Development-only: needs network and npx, and is not part of `npm test`. The
 * generated files are committed, so nobody building or testing md2org needs this.
 *
 *   node tools/build-vendor.js
 */
const { execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const CM_VERSION = "0.31.2";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "md2org-vendor-"));
const here = path.resolve(__dirname, "..");

console.log("installing commonmark@" + CM_VERSION + " in " + tmp);
execSync("npm init -y", { cwd: tmp, stdio: "ignore" });
execSync("npm install commonmark@" + CM_VERSION + " esbuild", { cwd: tmp, stdio: "inherit" });

fs.copyFileSync(path.join(here, "tools/entities-compact.js"), path.join(tmp, "entities-compact.js"));

/*
 * The fork. commonmark.js is a parser, not an extension host, but it is closer
 * to one than it looks: `this.blockStarts` is read live on every parse and
 * `handleDelim` is on the InlineParser prototype. Two module-local constants are
 * what actually stand in the way, and both are opened here rather than in a
 * patch file, so the diff against upstream 0.31.2 stays visible.
 *
 * Why in the parser at all: GFM's delta is small but sits inside the block
 * parser. A source-level pre-pass runs before block structure exists, so it
 * cannot see containers — which is why tables and footnote definitions inside
 * lists and block quotes went wrong. See DESIGN.md.
 */
function patch(file, edits) {
  const full = path.join(tmp, "node_modules/commonmark/lib", file);
  let src = fs.readFileSync(full, "utf8");
  for (const [from, to] of edits) {
    if (src.indexOf(from) === -1) throw new Error("fork patch missed in " + file + ": " + from);
    src = src.replace(from, to);
  }
  fs.writeFileSync(full, src);
  console.log("  patched lib/" + file);
}

console.log("applying md2org fork patches");

patch("blocks.js", [
  // The block-start loop is skipped entirely for lines not starting with one of
  // these, so a table block start would never be reached. "|" is the only
  // addition; every other character is upstream's.
  // "|", ":" and "[" are the additions: a table delimiter row may begin with the
  // first two and a footnote definition with the third, and this fast path skips
  // the block-start loop entirely for anything else.
  ["var reMaybeSpecial = /^[#`~*+_=<>0-9-]/;",
   "var reMaybeSpecial = /^[#`~*+_=<>0-9|:[-]/;"]
]);

patch("node.js", [
  // Without this the walker will not descend into a strikethrough and its
  // contents vanish from every consumer, including the renderer.
  ['        case "strong":', '        case "strong":\n        case "strikethrough":']
]);

patch("node.js", [
  ['        case "strikethrough":',
   '        case "strikethrough":\n        case "table":\n        case "table_row":\n        case "table_cell":']
]);

patch("blocks.js", [
  // GFM tables, as a real block. cmark-gfm opens the block on the DELIMITER row
  // and uses the paragraph above it as the header; doing the same here means the
  // container prefixes ("> ", list indentation) are already stripped by the time
  // we look, which is the whole reason for moving this inside the parser.
  ["var reMaybeSpecial",
   "var reTableDelimRow = /^\\|?[ \\t]*:?-+:?[ \\t]*(?:\\|[ \\t]*:?-+:?[ \\t]*)*\\|?[ \\t]*$/;\n\n" +
   "// GFM: a pipe is a cell separator unless escaped, and that distinction is\n" +
   "// erased by the time inlines are parsed, so rows are split here.\n" +
   "var splitTableRow = function(s) {\n" +
   "    var cells = [], cur = '', i, c;\n" +
   "    s = s.trim().replace(/^\\|/, '').replace(/\\|[ \\t]*$/, '');\n" +
   "    for (i = 0; i < s.length; i++) {\n" +
   "        c = s.charAt(i);\n" +
   "        if (c === '\\\\' && s.charAt(i + 1) === '|') { cur += '|'; i++; }\n" +
   "        else if (c === '|') { cells.push(cur.trim()); cur = ''; }\n" +
   "        else { cur += c; }\n" +
   "    }\n" +
   "    cells.push(cur.trim());\n" +
   "    return cells;\n" +
   "};\n\nvar reMaybeSpecial"],

  // A table is checked for new block starts like a paragraph is, so that a quote
  // or list on the next line ends it, as GFM requires.
  ['var matchedLeaf =\n        container.type !== "paragraph" && blocks[container.type].acceptsLines;',
   'var matchedLeaf =\n        container.type !== "paragraph" && container.type !== "table" &&\n        blocks[container.type].acceptsLines;'],

  ["    paragraph: {",
   "    table: {\n" +
   "        continue: function(parser) {\n" +
   "            return parser.blank ? 1 : 0;\n" +
   "        },\n" +
   "        finalize: function(parser, block) {\n" +
   "            var lines = block._string_content.replace(/\\n$/, '').split('\\n');\n" +
   "            var delim = splitTableRow(lines[1]);\n" +
   "            var align = delim.map(function(d) {\n" +
   "                var l = d.charAt(0) === ':', r = d.charAt(d.length - 1) === ':';\n" +
   "                return l && r ? 'center' : r ? 'right' : l ? 'left' : null;\n" +
   "            });\n" +
   "            var i, j, cells, row, cell;\n" +
   "            for (i = 0; i < lines.length; i++) {\n" +
   "                if (i === 1) { continue; }\n" +
   "                cells = splitTableRow(lines[i]);\n" +
   "                row = new Node('table_row');\n" +
   "                row._isHeading = i === 0;\n" +
   "                for (j = 0; j < delim.length; j++) {\n" +
   "                    cell = new Node('table_cell');\n" +
   "                    cell._align = align[j];\n" +
   "                    cell._string_content = cells[j] === undefined ? '' : cells[j];\n" +
   "                    row.appendChild(cell);\n" +
   "                }\n" +
   "                block.appendChild(row);\n" +
   "            }\n" +
   "            block._string_content = null;\n" +
   "            return;\n" +
   "        },\n" +
   "        canContain: function(t) {\n" +
   "            return t === 'table_row';\n" +
   "        },\n" +
   "        acceptsLines: true\n" +
   "    },\n" +
   "    paragraph: {"],

  // Cells hold inlines, and nothing else - GFM calls a table a leaf block and
  // says block-level elements cannot be inserted in one.
  ['if (!event.entering && (t === "paragraph" || t === "heading")) {',
   'if (!event.entering && (t === "paragraph" || t === "heading" || t === "table_cell")) {'],

  ["var blockStarts = [", "var blockStarts = [\n" +
   "    // table: fires on the delimiter row, with the header paragraph still open\n" +
   "    function(parser, container) {\n" +
   "        if (parser.indented || container.type !== 'paragraph') { return 0; }\n" +
   "        var rest = parser.currentLine.slice(parser.nextNonspace);\n" +
   "        if (rest.indexOf('|') === -1 || !reTableDelimRow.test(rest)) { return 0; }\n" +
   "        var lines = container._string_content.replace(/\\n$/, '').split('\\n');\n" +
   "        var header = lines[lines.length - 1];\n" +
   "        if (!header || header.indexOf('|') === -1) { return 0; }\n" +
   "        if (splitTableRow(header).length !== splitTableRow(rest).length) { return 0; }\n" +
   "        var keep = lines.slice(0, lines.length - 1).join('\\n');\n" +
   "        container._string_content = keep === '' ? '' : keep + '\\n';\n" +
   "        parser.closeUnmatchedBlocks();\n" +
   "        var empty = keep === '';\n" +
   "        var t = parser.addChild('table', parser.nextNonspace);\n" +
   "        if (empty) { container.unlink(); }\n" +
   "        // The delimiter row is not added here: the parser appends the current\n" +
   "        // line itself once this returns, and doing both duplicated it.\n" +
   "        t._string_content = header + '\\n';\n" +
   "        return 2;\n" +
   "    },"]
]);

patch("node.js", [
  ['        case "table_cell":',
   '        case "table_cell":\n        case "footnote_definition":']
]);

patch("blocks.js", [
  // GFM footnotes. Not in the 0.29 spec at all; this follows GitHub. cmark-gfm
  // makes them a parser option rather than an extension, because a definition
  // races link reference definitions for the same syntax - and a block start
  // fires before removeLinkReferenceDefinitions ever sees the paragraph, which a
  // source pre-pass could not guarantee.
  ["var reTableDelimRow",
   "var reFootnoteDef = /^\\[\\^([^\\]]+)\\]:[ \\t]*/;\n\nvar reTableDelimRow"],

  ["    table: {",
   "    footnote_definition: {\n" +
   "        continue: function(parser) {\n" +
   "            // A blank line does not end a definition: an indented paragraph\n" +
   "            // after one is still part of the body. The next unindented line\n" +
   "            // closes it, because the paragraph is no longer open by then.\n" +
   "            if (parser.blank) { return 0; }\n" +
   "            if (parser.indent >= 4) { parser.advanceOffset(4, true); return 0; }\n" +
   "            return parser.tip.type === 'paragraph' ? 0 : 1;\n" +
   "        },\n" +
   "        finalize: function() { return; },\n" +
   "        // A definition ends at the next one; nesting them would make the\n" +
   "        // second a child of the first.\n" +
   "        canContain: function(t) {\n" +
   "            return t !== 'item' && t !== 'footnote_definition';\n" +
   "        },\n" +
   "        acceptsLines: false\n" +
   "    },\n" +
   "    table: {"],

  ["var blockStarts = [",
   "var blockStarts = [\n" +
   "    // footnote definition: must precede the table start and the paragraph\n" +
   "    // fallback, or the label is consumed as a link reference definition.\n" +
   "    function(parser) {\n" +
   "        if (parser.indented) { return 0; }\n" +
   "        var m = parser.currentLine.slice(parser.nextNonspace).match(reFootnoteDef);\n" +
   "        if (!m) { return 0; }\n" +
   "        parser.closeUnmatchedBlocks();\n" +
   "        parser.advanceNextNonspace();\n" +
   "        parser.advanceOffset(m[0].length, false);\n" +
   "        var d = parser.addChild('footnote_definition', parser.nextNonspace);\n" +
   "        d._label = m[1];\n" +
   "        return 1;\n" +
   "    },"]
]);

patch("inlines.js", [
  // Strikethrough is an emphasis type (GFM: "text wrapped in two tildes"), so it
  // belongs in the delimiter machinery, not in a regex over text nodes. A regex
  // cannot see across node boundaries, which is why "~~a *b* c~~" broke.
  // GFM footnote reference. Recognised here so it cannot be mistaken for a link
  // label; whether it renders as a footnote depends on a matching definition,
  // which is not known until the whole document is parsed, so that decision is
  // left to the renderer.
  ["var parseOpenBracket = function(block) {\n    var startpos = this.pos;\n    this.pos += 1;",
   "var parseOpenBracket = function(block) {\n" +
   "    var startpos = this.pos;\n" +
   "    var fn = this.match(/^\\[\\^[^\\]]+\\]/);\n" +
   "    if (fn) {\n" +
   "        var fnode = new Node('footnote_reference');\n" +
   "        fnode._label = fn.slice(2, -1);\n" +
   "        block.appendChild(fnode);\n" +
   "        return true;\n" +
   "    }\n" +
   "    this.pos += 1;"],
  ["var C_DOUBLEQUOTE = 34;",
   "var C_DOUBLEQUOTE = 34;\nvar C_TILDE = 126;"],
  // parseString swallows any run of "ordinary" characters, and upstream counts
  // "~" as ordinary, so the dispatch above would only ever fire at position 0.
  ["var reMain = /^[^\\n`\\[\\]\\\\!<&*_'\"]+/m;",
   "var reMain = /^[^\\n`\\[\\]\\\\!<&*_'\"~]+/m;"],
  ["        case C_ASTERISK:\n        case C_UNDERSCORE:\n            res = this.handleDelim(c, block);",
   "        case C_ASTERISK:\n        case C_UNDERSCORE:\n        case C_TILDE:\n            res = this.handleDelim(c, block);"],
  ["               case C_ASTERISK:\n                 openers_bottom_index = 8 + (closer.can_open ? 3 : 0)\n                                          + (closer.origdelims % 3);\n                 break;",
   "               case C_ASTERISK:\n                 openers_bottom_index = 8 + (closer.can_open ? 3 : 0)\n                                          + (closer.origdelims % 3);\n                 break;\n               case C_TILDE:\n                 openers_bottom_index = 14;\n                 break;"],
  // Exactly two tildes, per the GFM spec. A single tilde is left as text.
  ["            if (closercc === C_ASTERISK || closercc === C_UNDERSCORE) {",
   "            if (closercc === C_TILDE) {\n" +
   "                if (!opener_found || closer.numdelims < 2 || opener.numdelims < 2) {\n" +
   "                    closer = closer.next;\n" +
   "                } else {\n" +
   "                    opener_inl = opener.node;\n" +
   "                    closer_inl = closer.node;\n" +
   "                    opener.numdelims -= 2;\n" +
   "                    closer.numdelims -= 2;\n" +
   "                    opener_inl._literal = opener_inl._literal.slice(0, opener_inl._literal.length - 2);\n" +
   "                    closer_inl._literal = closer_inl._literal.slice(0, closer_inl._literal.length - 2);\n" +
   "                    var del = new Node('strikethrough');\n" +
   "                    var tmpn = opener_inl._next;\n" +
   "                    while (tmpn && tmpn !== closer_inl) {\n" +
   "                        var nx = tmpn._next;\n" +
   "                        del.appendChild(tmpn);\n" +
   "                        tmpn = nx;\n" +
   "                    }\n" +
   "                    opener_inl.insertAfter(del);\n" +
   "                    removeDelimitersBetween(opener, closer);\n" +
   "                    if (opener.numdelims === 0) {\n" +
   "                        opener_inl.unlink();\n" +
   "                        this.removeDelimiter(opener);\n" +
   "                    }\n" +
   "                    if (closer.numdelims === 0) {\n" +
   "                        closer_inl.unlink();\n" +
   "                        tempstack = closer.next;\n" +
   "                        this.removeDelimiter(closer);\n" +
   "                        closer = tempstack;\n" +
   "                    }\n" +
   "                }\n" +
   "            } else if (closercc === C_ASTERISK || closercc === C_UNDERSCORE) {"]
]);

// Ship bundle: parser only.
fs.writeFileSync(path.join(tmp, "entry-parser.js"),
  'const b = require("./node_modules/commonmark/lib/blocks.js");\n' +
  'module.exports = { Parser: b.Parser || b.default || b };\n');
// Test bundle: parser plus upstream's HTML renderer.
fs.writeFileSync(path.join(tmp, "entry-html.js"),
  'const b = require("./node_modules/commonmark/lib/blocks.js");\n' +
  'const h = require("./node_modules/commonmark/lib/render/html.js");\n' +
  'module.exports = { Parser: b.Parser || b.default || b, HtmlRenderer: h.default || h };\n');

function bundle(entry, globalName, outfile) {
  // --line-limit matters more than it looks. Without it esbuild emits the whole
  // parser as a single ~11,000-character line, which crashes the Shortcuts editor
  // when the generated copy is pasted in. Wrapping costs nothing in bytes.
  execSync(
    "npx esbuild " + entry + " --bundle --minify --line-limit=80 --format=iife --global-name=" +
    globalName + " --alias:entities=./entities-compact.js --outfile=" + outfile,
    { cwd: tmp, stdio: "inherit" }
  );
  return fs.readFileSync(path.join(tmp, outfile), "utf8").trim();
}

const shipHeader = [
  "/*",
  " * Vendored CommonMark parser (parse phase only).",
  " *",
  " * Source:  commonmark.js " + CM_VERSION + "  —  https://github.com/commonmark/commonmark.js",
  " * License: BSD-2-Clause (see src/vendor/LICENSE-commonmark)",
  " *",
  " * Built from lib/blocks.js with the 99 KB html-entity table replaced by",
  " * tools/entities-compact.js. Everything else is upstream. Exposes",
  " * __cmark.Parser; the HTML renderer is not included, since md2org never emits",
  " * HTML.",
  " *",
  " * Conformance: 651/652 CommonMark " + CM_VERSION + " spec examples, asserted by",
  " * test/conformance.js. The exception is example 25 — see tools/entities-compact.js.",
  " *",
  " * Regenerate: node tools/build-vendor.js",
  " */",
  ""
].join("\n");

fs.writeFileSync(path.join(here, "src/vendor/commonmark.js"),
  shipHeader + bundle("entry-parser.js", "__cmark", "parser.js") +
  '\n\nif (typeof module !== "undefined" && module.exports) { module.exports = __cmark; }\n');

const testHeader = [
  "/*",
  " * TEST ONLY — not shipped, not bundled, not referenced by src/.",
  " *",
  " * The same forked parser as src/vendor/commonmark.js plus upstream's HTML",
  " * renderer, so test/conformance.js can check the parser against the spec's own",
  " * 652 markdown/HTML pairs.",
  " *",
  " * This pins the parser, which is third-party and already verified upstream. It",
  " * says nothing about the Org rendering — that is test/spec.js.",
  " *",
  " * Regenerate: node tools/build-vendor.js",
  " */",
  ""
].join("\n");

fs.writeFileSync(path.join(here, "test/vendor-cmark-html.js"),
  testHeader + bundle("entry-html.js", "CM", "html.js") + "\n");

fs.copyFileSync(path.join(tmp, "node_modules/commonmark/LICENSE"),
  path.join(here, "src/vendor/LICENSE-commonmark"));

console.log("\nregenerated src/vendor/commonmark.js and test/vendor-cmark-html.js");
console.log("now run: node build.js && npm test");
