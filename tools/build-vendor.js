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
 * Applies the fork's edits to upstream. Each edit is an exact string replacement
 * that must match, so an upstream change fails the build. GFM tables, footnotes
 * and strikethrough live in the parser because they depend on block structure
 * (DESIGN.md, The parser is forked).
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
  // Upstream skips the block-start loop for lines not beginning with one of these
  // characters. Added: "|" and ":", which can begin a table delimiter row, and
  // "[", which begins a footnote definition.
  ["var reMaybeSpecial = /^[#`~*+_=<>0-9-]/;",
   "var reMaybeSpecial = /^[#`~*+_=<>0-9|:[-]/;"]
]);

patch("node.js", [
  // The walker must descend into strikethrough nodes, or their contents are lost.
  ['        case "strong":', '        case "strong":\n        case "strikethrough":']
]);

patch("node.js", [
  ['        case "strikethrough":',
   '        case "strikethrough":\n        case "table":\n        case "table_row":\n        case "table_cell":']
]);

patch("blocks.js", [
  // GFM tables as a block. As in cmark-gfm, the block opens on the delimiter row
  // and takes the preceding paragraph line as its header. Container prefixes
  // ("> ", list indentation) are already stripped at that point.
  ["var reMaybeSpecial",
   "var reTableDelimRow = /^\\|?[ \\t]*:?-+:?[ \\t]*(?:\\|[ \\t]*:?-+:?[ \\t]*)*\\|?[ \\t]*$/;\n\n" +
   "// GFM: a pipe separates cells unless escaped. The escape is lost by the time\n" +
   "// inlines are parsed, so rows are split here.\n" +
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

  // A cell holds inline content only; GFM defines a table as a leaf block.
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
   "        // The delimiter row is not added here; the parser appends the current\n" +
   "        // line after this returns.\n" +
   "        t._string_content = header + '\\n';\n" +
   "        return 2;\n" +
   "    },"]
]);

patch("node.js", [
  ['        case "table_cell":',
   '        case "table_cell":\n        case "footnote_definition":']
]);

patch("blocks.js", [
  // GFM footnotes, following GitHub; they are not in the GFM spec. A definition
  // is a block start so that it is recognised before link reference definitions,
  // which share its syntax.
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
  // Footnote references are recognised before link labels. Whether one renders
  // as a footnote depends on a matching definition, which the renderer decides.
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
  // Strikethrough uses the emphasis delimiter machinery, so it can span other
  // inline nodes ("~~a *b* c~~").
  ["var C_DOUBLEQUOTE = 34;",
   "var C_DOUBLEQUOTE = 34;\nvar C_TILDE = 126;"],
  // Upstream treats "~" as ordinary text, which parseString consumes in runs;
  // excluding it lets the dispatch above see each tilde.
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

patch("inlines.js", [
  // LaTeX math, kept whole as a "math" node so no Markdown is parsed inside it.
  // "\(...\)" is inline math anywhere it closes. "\[...\]" is display math only
  // when "\[" begins a line and "\]" ends one, so a mid-line "\[" remains
  // CommonMark's escape for a literal bracket. Both need at least one character
  // and may not contain their own closing delimiter (§LaTeX Fragments), so an
  // empty "\(\)" remains two escapes.
  ["var reMain = ",
   "var reMathInline = /^\\\\\\((?:(?!\\\\\\))[\\s\\S])+\\\\\\)/;\n" +
   "var reMathDisplay = /^\\\\\\[(?:(?!\\\\\\])[\\s\\S])+\\\\\\](?=[ \\t]*(?:\\n|$))/;\n" +
   "var reMain = "],
  ["var parseBackslash = function(block) {\n    var subj = this.subject;\n    var node;\n",
   "var parseBackslash = function(block) {\n" +
   "    var subj = this.subject;\n" +
   "    var node;\n" +
   "    var c = subj.charAt(this.pos + 1);\n" +
   "    var math = c === '(' ? this.match(reMathInline)\n" +
   "        : c === '[' && (this.pos === 0 || subj.charAt(this.pos - 1) === '\\n')\n" +
   "        ? this.match(reMathDisplay) : null;\n" +
   "    if (math) {\n" +
   "        node = new Node('math');\n" +
   "        node._literal = math;\n" +
   "        block.appendChild(node);\n" +
   "        return true;\n" +
   "    }\n"]
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

function bundle(entry, globalName, outfile, opts) {
  // lineLimit stops esbuild emitting the parser as one very long line, which
  // crashes the Shortcuts editor. The entities alias replaces upstream's 123 KB
  // name table with tools/entities-compact.js; fullEntities keeps the table.
  execSync(
    "npx esbuild " + entry + " --bundle --minify --line-limit=80 --format=iife --global-name=" +
    globalName + ((opts && opts.fullEntities) ? "" : " --alias:entities=./entities-compact.js") +
    " --outfile=" + outfile,
    { cwd: tmp, stdio: "inherit" }
  );
  return fs.readFileSync(path.join(tmp, outfile), "utf8").trim();
}

/*
 * Conformance figures are read from test/conformance.js, which asserts them, so
 * the generated headers always match the tests.
 */
function conformanceCounts() {
  const src = fs.readFileSync(path.join(here, "test/conformance.js"), "utf8");
  const pass = /EXPECTED_PASS\s*=\s*(\d+)/.exec(src);
  const full = /EXPECTED_PASS_ENTITIES\s*=\s*(\d+)/.exec(src);
  const total = /EXPECTED_TOTAL\s*=\s*(\d+)/.exec(src);
  if (!pass || !full || !total) {
    throw new Error("build-vendor: cannot read the conformance figures from test/conformance.js");
  }
  return { pass: pass[1], full: full[1], total: total[1] };
}
const CONF = conformanceCounts();

const shipHeader = [
  "/*",
  " * Vendored CommonMark parser (parse phase only).",
  " *",
  " * Source:  commonmark.js " + CM_VERSION + ", https://github.com/commonmark/commonmark.js",
  " * License: BSD-2-Clause (see src/vendor/LICENSE-commonmark)",
  " *",
  " * Built from lib/blocks.js with md2org's fork patches (tools/build-vendor.js),",
  " * and with upstream's entity table replaced by tools/entities-compact.js, which",
  " * decodes nothing. Exposes __cmark.Parser; the HTML renderer is not included.",
  " *",
  " * Conformance: " + CONF.pass + "/" + CONF.total + " CommonMark " + CM_VERSION + " spec examples,",
  " * asserted by test/conformance.js. Every failure is a character reference that",
  " * is not decoded.",
  " *",
  " * Regenerate: node tools/build-vendor.js",
  " */",
  ""
].join("\n");

fs.writeFileSync(path.join(here, "src/vendor/commonmark.js"),
  shipHeader + bundle("entry-parser.js", "__cmark", "parser.js") +
  '\n\nif (typeof module !== "undefined" && module.exports) { module.exports = __cmark; }\n');

/*
 * The same parser with upstream's entity table, for the CLI's -e option and the
 * web page's checkbox. Too large for the Shortcut. src/md2org.js loads it on
 * first use.
 */
const entitiesHeader = [
  "/*",
  " * Vendored CommonMark parser (parse phase only), WITH upstream's entity table.",
  " *",
  " * Source:  commonmark.js " + CM_VERSION + ", https://github.com/commonmark/commonmark.js",
  " * License: BSD-2-Clause (see src/vendor/LICENSE-commonmark)",
  " *",
  " * Identical to src/vendor/commonmark.js except that character references are",
  " * decoded. Used only by the CLI's -e option and the web page's checkbox; never",
  " * built into shortcut/transform.js.",
  " *",
  " * Conformance: " + CONF.full + "/" + CONF.total + " CommonMark " + CM_VERSION + " spec examples,",
  " * asserted by test/conformance.js.",
  " *",
  " * Regenerate: node tools/build-vendor.js",
  " */",
  ""
].join("\n");

fs.writeFileSync(path.join(here, "src/vendor/commonmark-entities.js"),
  entitiesHeader + bundle("entry-parser.js", "__cmarkEntities", "parser-entities.js", { fullEntities: true }) +
  '\n\nif (typeof module !== "undefined" && module.exports) { module.exports = __cmarkEntities; }\n');

const testHeader = [
  "/*",
  " * Test only: not shipped and not referenced by src/.",
  " *",
  " * Upstream's HTML renderer, used by test/conformance.js to compare against the",
  " * spec's 652 Markdown/HTML pairs. Conformance parses with src/vendor/commonmark.js,",
  " * the shipped parser, not the one bundled here.",
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
