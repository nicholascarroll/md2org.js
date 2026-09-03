/*
 * Behavioural tests: each case gives Markdown input and the exact Org expected.
 *
 *   node test/spec.js
 */
const md2org = require("../src/md2org.js");

const WARN_DESC = "\n\n# md2org warnings:\n# ]] in a link description: line 1";

let pass = 0, fail = 0;
/*
 * Each case also runs against the generated Shortcut copy in an isolated context.
 * The copy concatenates the core regions of src/ without the Node bootstrap, so a
 * core that depends on a bootstrap name would pass under Node and fail on iOS.
 */
const __vm = require("vm");
const __bundle = require("fs").readFileSync(__dirname + "/../shortcut/transform.js", "utf8");
function runBundled(input) {
  const ctx = __vm.createContext({ __in: input });
  return __vm.runInContext("(function($text){" + __bundle + "})(__in)", ctx);
}

function check(name, input, expected) {
  const got = md2org(input);
  if (got !== expected) {
    fail++;
    console.log("  FAIL " + name);
    console.log("    input:    " + JSON.stringify(input));
    console.log("    expected: " + JSON.stringify(expected));
    console.log("    got:      " + JSON.stringify(got));
    return;
  }
  // The Shortcut copy returns a hint for empty input rather than an empty string.
  if (input === "") { pass++; console.log("  ok   " + name); return; }
  // The same input through the generated Shortcut copy, in an isolated context.
  let bundled;
  try { bundled = runBundled(input); }
  catch (e) { bundled = "THREW: " + (e && e.message ? e.message : String(e)); }
  if (bundled !== expected) {
    fail++;
    console.log("  FAIL " + name + "   [src/ is correct; the Shortcut copy differs]");
    console.log("    input:    " + JSON.stringify(input));
    console.log("    shortcut: " + JSON.stringify(bundled));
    return;
  }
  pass++;
  console.log("  ok   " + name);
}

console.log("HEADINGS");
check("h1", "# Title", "* Title");
check("h2", "## Summary", "** Summary");
check("h6", "###### Deep", "****** Deep");
check("heading keeps inline markup", "## The `code` here", "** The =code= here");
check("hash without space is not a heading", "#nospace", "#nospace");

console.log("CODE BLOCKS");
check("fenced block with language",
  "```rust\nlet x = 1;\n```",
  "#+BEGIN_SRC rust\nlet x = 1;\n#+END_SRC");
// Org requires a LANGUAGE on a source block (§Lesser Elements), so a bare fence
// becomes an example block.
check("fenced block without language",
  "```\nplain\n```",
  "#+BEGIN_EXAMPLE\nplain\n#+END_EXAMPLE");
check("hash inside code is not a heading",
  "```py\n# a comment\nx = 1\n```",
  "#+BEGIN_SRC py\n# a comment\nx = 1\n#+END_SRC");
check("stars and underscores inside code are untouched",
  "```py\nsome_var = a*b\n```",
  "#+BEGIN_SRC py\nsome_var = a*b\n#+END_SRC");

console.log("MARKDOWN COMMENTS");
check("single-line comment becomes an Org comment",
  "<!-- a note -->",
  "#  a note ");
check("empty comment",
  "<!---->",
  "#");
check("multi-line comment becomes a run of comment lines",
  "<!--\nline one\nline two\n-->",
  "#\n# line one\n# line two\n#");
check("a blank line in a comment body survives",
  "<!--\nline one\n\nline two\n-->",
  "#\n# line one\n#\n# line two\n#");
check("an indented comment is the same construct",
  "   <!-- a note -->",
  "#  a note ");
check("a comment body needs no comma-quoting",
  "<!--\n*star line\n#+END_COMMENT\n-->",
  "#\n# *star line\n# #+END_COMMENT\n#");
check("comment marker inside code stays literal",
  "```html\n<!-- html example -->\n```",
  "#+BEGIN_SRC html\n<!-- html example -->\n#+END_SRC");

console.log("INLINE MARKUP");
check("bold with asterisks", "some **bold** text", "some *bold* text");
check("bold with underscores", "some __bold__ text", "some *bold* text");
check("italic with asterisk", "some *italic* text", "some /italic/ text");
check("italic with underscore", "some _italic_ text", "some /italic/ text");
check("inline code", "call `foo()` now", "call =foo()= now");
check("strikethrough", "~~gone~~", "+gone+");
check("link", "[text](https://x.com)", "[[https://x.com][text]]");
check("underscores inside a word are not italic", "some_var_name here", "some_var_name here");
// A bare relative path would be a FUZZY link, a headline search that fails on
// export. Markdown means a relative URL, which is Org's "file:" link type.
check("bare relative path becomes a file: link",
  "[foo](url)",
  "[[file:url][foo]]");
check("path with a directory too",
  "[foo](a/b.md)",
  "[[file:a/b.md][foo]]");
check("image path likewise",
  "![i](img.png)",
  "[[file:img.png][i]]");
// "(foo)" would otherwise be a CODEREF.
check("parenthesised path is not a coderef",
  "[link]((foo))",
  "[[file:(foo)][link]]");
// Already unambiguous, so left alone.
check("./ and ../ and / are already file paths",
  "[a](./x) [b](../y) [c](/z)",
  "[[./x][a]] [[../y][b]] [[/z][c]]");
check("a link type is left alone",
  "[a](http://x/y) [b](mailto:p@q.r)",
  "[[http://x/y][a]] [[mailto:p@q.r][b]]");
// Org resolves a "#" link against CUSTOM_ID properties, which Markdown does not
// declare, and one unresolvable link fails the whole export. The description is
// kept as text.
check("#anchor is not a link",
  "[a](#sec)",
  "a");
check("a table of contents keeps its words and still exports",
  "- [Install](#install)\n- [Usage](#usage)\n\n## Install\n\n## Usage",
  "- Install\n- Usage\n\n** Install\n\n** Usage");
check("link whose text is code", "[`fn`](u)", "[[file:u][=fn=]]");

console.log("LISTS");
check("dash bullet", "- item", "- item");
check("asterisk bullet", "* item", "- item");
check("plus bullet", "+ item", "- item");
// Nesting follows CommonMark: an indented bullet with no parent list is a
// top-level item.
check("lone indented bullet is top level", "  - nested", "- nested");
check("real nesting is preserved",
  "- outer\n  - inner",
  "- outer\n  - inner");
check("ordered list passes through", "1. first", "1. first");

console.log("INTERACTIONS");
check("asterisk bullet carrying bold",
  "* some **bold**",
  "- some *bold*");
check("heading followed by a bullet",
  "# Head\n- item",
  "* Head\n- item");
check("bold next to italic",
  "**bold** and *italic*",
  "*bold* and /italic/");

console.log("MALFORMED INPUT");
check("unclosed code fence is closed",
  "```py\ncode",
  "#+BEGIN_SRC py\ncode\n#+END_SRC");
check("unclosed comment still converts",
  "<!--\ndangling",
  "#\n# dangling");

console.log("EDGE");
check("empty input", "", "");
check("plain paragraph untouched", "just text", "just text");

console.log("REGRESSIONS — cases that silently corrupted before the rewrite");
check("fenced content cannot escape its block",
  "```\n#+END_SRC\nstill code\n```",
  "#+BEGIN_EXAMPLE\n,#+END_SRC\nstill code\n#+END_EXAMPLE");
// Only "#+end_NAME" matching the block's name ends it (§Lesser Elements), so the
// hazard applies to a language-tagged fence, which becomes a src block.
check("language-tagged fence cannot be ended early",
  "```python\n#+END_SRC\nstill code\n```",
  "#+BEGIN_SRC python\n,#+END_SRC\nstill code\n#+END_SRC");
// "*star" is not a headline, since Org requires a space after the stars.
check("leading asterisk passes through",
  "*star at col 0",
  "*star at col 0");
check("** at line start passes through and is warned",
  "** x **",
  "** x **\n\n# md2org warnings:\n# heading: line 1");
check("emphasis nests rather than crossing",
  "***both***",
  "/*both*/");
check("backslash escapes are consumed by the parser",
  "\\*not emph\\*",
  "*not emph*");
check("code spans protect their contents",
  "`*x*`",
  "=*x*=");
check("code spans protect links too",
  "`[a](b)`",
  "=[a](b)=");
check("fence info string keeps only the language",
  "```ruby startline=3\ncode\n```\nafter",
  "#+BEGIN_SRC ruby\ncode\n#+END_SRC\nafter");
check("link title does not leak into the url",
  "[t](/u \"the title\")",
  "[[/u][t]]");
check("image is a link, not a bang",
  "![alt](/i.png)",
  "[[/i.png][alt]]");
check("code span containing = falls back to ~",
  "`a=b`",
  "~a=b~");
check("thematic break is not a bullet",
  "* * *",
  "-----");
check("heading tags pass through",
  "# Meeting :notes:draft:",
  "* Meeting :notes:draft:");
// A leading TODO keyword passes through and becomes an Org todo keyword.
check("heading TODO keyword is promoted",
  "# TODO fix the parser",
  "* TODO fix the parser");
check("bare TODO heading",
  "# TODO",
  "* TODO");
check("DONE keyword is promoted too",
  "## DONE shipped it",
  "** DONE shipped it");
// Only a configured keyword is a todo state, so no keyword list is needed.
check("word merely starting with a keyword is untouched",
  "# TODOs for the week",
  "* TODOs for the week");
check("heading priority cookie passes through",
  "# [#A] important",
  "* [#A] important");
// A leading COMMENT passes through; Org excludes the subtree from export
// (MAPPING.md, export hazard).
check("heading COMMENT keyword passes through",
  "# COMMENT on the new API",
  "* COMMENT on the new API");
check("bare COMMENT heading passes through too",
  "# COMMENT",
  "* COMMENT");
check("COMMENT is case-sensitive",
  "# Comment on the new API",
  "* Comment on the new API");
check("a longer word starting with COMMENT is untouched",
  "# COMMENTARY on the API",
  "* COMMENTARY on the API");
check("description-list marker passes through",
  "- foo :: bar",
  "- foo :: bar");
check("document keyword passes through",
  "#+title: from markdown",
  "#+title: from markdown");
check("ordinary punctuation is not over-escaped",
  "2 + 2 and some_var_name and a/b",
  "2 + 2 and some_var_name and a/b");

check("badge (image inside a link) does not nest brackets",
  "[![Alt](https://img.shields.io/b.svg)](https://example.com/p)",
  "[[https://example.com/p][https://img.shields.io/b.svg]]");
check("image inside link text alongside words",
  "[see ![i](/p.png) here](/u)",
  "[[/u][see /p.png here]]");

// §Regular Link: a description may not contain "]]". A "]" at the end of the
// description forms "]]" with the closer, and "\]\]" arrives as separate text
// nodes. Passed through and warned: the link ends early and the remaining
// characters stay in the document as text.
check("description ending in ] passes through and warns",
  "[a\\]](/u)",
  "[[/u][a]]]" + WARN_DESC);
check("]] split across text nodes passes through and warns",
  "[a\\]\\]b](/u)",
  "[[/u][a]]b]]" + WARN_DESC);
// The "]]" in a code span is reported like any other; the span keeps its
// monospace.
check("]] inside a code span in a description keeps the span",
  "[see `a]]b` now](/u)",
  "[[/u][see =a]]b= now]]" + WARN_DESC);
check("]] inside a code span in an image description keeps the span too",
  "![alt `]]` t](/i.png)",
  "[[/i.png][alt =]]= t]]" + WARN_DESC);
// A lone "]" does not break a description, so the span keeps its monospace.
check("a single ] in a code span keeps its monospace",
  "[a`x]`](/u)",
  "[[/u][a=x]=]]");
check("]] in a code span outside a link keeps its monospace",
  "`]]` here",
  "=]]= here");
check("]] in a code span in a table cell keeps its monospace",
  "| `a]]b` | c |\n|---|---|\n| 1 | 2 |",
  "| =a]]b= | c |\n|----+----|\n| 1 | 2 |");
check("a single ] in a description is left alone",
  "[a\\]b](/u)",
  "[[/u][a]b]]");
check("image alt ending in ] passes through and warns",
  "![alt\\]](/i.png)",
  "[[/i.png][alt]]]" + WARN_DESC);
check("autolink ending in ] passes through and warns",
  "<http://x/ab]>",
  "[[http://x/ab%5D][http://x/ab]]]" + WARN_DESC);

check("table rule row is an Org rule, not a data row",
  "| a | b |\n| --- | --- |\n| 1 | 2 |",
  "| a | b |\n|----+----|\n| 1 | 2 |");
check("table alignment becomes a cookie row",
  "| a | b |\n| :-: | ---: |\n| 1 | 2 |",
  "| a | b |\n|----+----|\n| <c> | <r> |\n| 1 | 2 |");
check("escaped pipe in a plain cell passes through and warns",
  "| a |\n| --- |\n| x \\| y |",
  "| a |\n|----|\n| x \\| y |\n\n# md2org warnings:\n# \\| in a table cell: line 3");
// CONTENTS of a code span is a literal string (§Text Markup), so a pipe cannot
// be escaped inside it. The span loses its monospace and keeps its characters.
check("pipe inside code in a cell unwraps the code span",
  "| a |\n| --- |\n| \`Alt-\\|\` |",
  "| a |\n|----|\n| Alt-\\| |\n\n# md2org warnings:\n# \\| in a table cell: line 3");
check("code span without a pipe keeps its markup",
  "| a |\n| --- |\n| \`fmt\` |",
  "| a |\n|----|\n| =fmt= |");

// Regressions found by test/fuzz.js.
check("empty list item followed by a heading",
  "+\n# H",
  "- \n* H");
check("export block contents are comma-quoted",
  "<div>\n#+END_SRC",
  "#+BEGIN_EXPORT html\n<div>\n,#+END_SRC\n#+END_EXPORT");
check("literal [[ passes through as an Org link",
  "a [[ b",
  "a [[ b");
check("indented keyword passes through too",
  "- item\n\n  #+END_SRC",
  "- item\n\n  #+END_SRC\n\n# md2org warnings:\n# stray block delimiter: line 3");

// Footnotes follow GitHub, since the GFM spec has no footnote examples. A
// reference converts only when a definition exists, so a regex class such as
// "[^abc def]" in prose is left alone.
check("footnote reference with a definition",
  "Text with a note [^1] here.\n\n[^1]: body",
  "Text with a note [fn:1] here.\n\n[fn:1] body");
check("reference without a definition stays literal",
  "Text with a note [^1] here.",
  "Text with a note [^1] here.");
check("regex character class is not a footnote",
  "match [^abc def] here",
  "match [^abc def] here");
check("footnote definition",
  "x [^1]\n\n[^1]: The body.",
  "x [fn:1]\n\n[fn:1] The body.");
// A footnote definition shares its syntax with a link reference definition and
// must not be consumed as one.
check("footnote definition is not a link reference definition",
  "See [^a] and [^b].\n\n[^a]: first\n[^b]: second",
  "See [fn:a] and [fn:b].\n\n[fn:a] first\n\n[fn:b] second");
check("real link reference definitions still work",
  "[foo]\n\n[foo]: /url",
  "[[/url][foo]]");
check("footnote definition keeps inline markup",
  "y [^a]\n\n[^a]: see [link](/u) and **bold**",
  "y [fn:a]\n\n[fn:a] see [[/u][link]] and *bold*");
check("indented lines continue a footnote definition",
  "x [^1]\n\n[^1]: first line\n    continued",
  "x [fn:1]\n\n[fn:1] first line continued");
// Org labels allow only word characters and hyphens, so other characters become
// hyphens.
check("label is sanitised for Org",
  "x [^a_b.c]\n\n[^a_b.c]: body",
  "x [fn:a_b-c]\n\n[fn:a_b-c] body");
check("label with whitespace is a footnote when defined",
  "x [^my note]\n\n[^my note]: body",
  "x [fn:my-note]\n\n[fn:my-note] body");
check("footnote syntax inside code is literal",
  "Use `[^1]` literally.\n\n[^1]: body",
  "Use =[^1]= literally.\n\n[fn:1] body");

console.log("NEWLY SUPPORTED");
check("setext heading", "Title\n=====", "* Title");
check("block quote", "> quoted", "#+BEGIN_QUOTE\nquoted\n#+END_QUOTE");
check("indented code block", "    code here", "#+BEGIN_EXAMPLE\ncode here\n#+END_EXAMPLE");
check("tilde fence", "~~~\ncode\n~~~", "#+BEGIN_EXAMPLE\ncode\n#+END_EXAMPLE");
check("autolink", "<http://example.com>", "[[http://example.com][http://example.com]]");
check("hard line break", "foo  \nbar", "foo\\\\\nbar");
/*
 * Character references, named and numeric, pass through as written. Decoding a
 * numeric reference could produce Org syntax, such as "&#42; x" as a headline.
 */
check("named entity references pass through", "&amp; &copy;", "&amp; &copy;");
check("decimal references pass through", "A &#8212; B", "A &#8212; B");
check("hex references pass through", "A &#x2014; B", "A &#x2014; B");
check("a reference is never decoded into a headline", "&#42; foo", "&#42; foo");
check("a reference is never decoded into a comment", "&#35; foo", "&#35; foo");
check("a reference in a link destination is left alone",
  "[a](/u&#65;)", "[[/u&#65;][a]]");
check("reference link", "[foo]\n\n[foo]: /url", "[[/url][foo]]");
check("ordered list start number", "5. five\n6. six", "5. [@5] five\n6. six");

console.log("MATH");
// LaTeX math is copied verbatim, since Org uses the same delimiters for LaTeX
// fragments (§LaTeX Fragments). Nothing inside it is parsed as Markdown.
check("inline math is kept", "where \\(A_{ij}\\) is", "where \\(A_{ij}\\) is");
check("underscores in math are not emphasis",
  "\\(a_b\\) and \\(c_d\\)", "\\(a_b\\) and \\(c_d\\)");
check("display math is kept",
  "\\[\n\\sum_j A_{ij} = 1\n\\]", "\\[\n\\sum_j A_{ij} = 1\n\\]");
check("backslash commands in math keep their backslash",
  "\\(a \\; b\\)", "\\(a \\; b\\)");
check("display math in a list item keeps the item's indentation",
  "- a\n  \\[\n  x_1\n  \\]", "- a\n  \\[\n  x_1\n  \\]");
check("inline math in a table cell is kept",
  "| \\(x_1\\) | b |\n| --- | --- |\n| 1 | 2 |", "| \\(x_1\\) | b |\n|----+----|\n| 1 | 2 |");
// A footnote definition is one line, so a line break in its math becomes a
// space, which LaTeX treats the same way.
check("math in a footnote definition is joined onto one line",
  "x [^1]\n\n[^1]: \\(a\nb\\)", "x [fn:1]\n\n[fn:1] \\(a b\\)");
check("math syntax in a code span stays code", "`\\(a\\)`", "=\\(a\\)=");
// Not math: CommonMark escapes still apply.
check("a mid-line \\[ is an escaped bracket", "see \\[1\\] here", "see [1] here");
check("empty \\(\\) is two escapes", "\\(\\)", "()");
check("an unclosed \\( is an escape", "\\(x", "(x");
// Known limitation: block structure is decided before inline math, so a line
// inside display math that starts a list item is split off.
check("a list marker inside display math is parsed as a list",
  "\\[\n* x\n\\]", "[\n- x\n  ]");

console.log("");

// ---- L3: every output above must be valid Org ------------------------------
const validate = require("./org-validate.js");
const corpus = [
  "# H\n\ntext", "```\n#+END_SRC\n*star\n```", "** x **", "***both***",
  "\\*lit\\*", "`a=b`", "`a=b~c`", "[t](http://x/a]]b)", "* * *",
  "# Meeting :notes:draft:", "#+title: k", "> q\n> r", "    code",
  "![i](/p.png)", "<http://e.com>", "foo  \nbar", "1. a\n2. b",
  "- a\n  - b\n- c", "<div>\nraw\n</div>", "text with <em>inline</em> html",
  "&amp; &copy;", "[foo]\n\n[foo]: /url", "~~struck~~", "a **b** c",
  "```py\n*star at col 0\n#+END_SRC\n```",
  "[![Alt](https://img.shields.io/b.svg)](https://example.com/p)",
  "[see ![i](/p.png) here](/u)",
  "| a | b |\n| --- | ---: |\n| \`Alt-\\|\` | x |",
  "note [^1] and [^b]\n\n[^1]: one\n[^b]: two"
];
let vBad = 0;
for (const src of corpus) {
  const problems = validate(md2org(src));
  if (problems.length) {
    vBad++;
    console.log("  INVALID ORG for " + JSON.stringify(src));
    problems.forEach(p => console.log("    " + p));
  }
}
if (vBad === 0) console.log("ORG VALIDITY   " + corpus.length + "/" + corpus.length + " outputs valid");
else { console.log("ORG VALIDITY   " + (corpus.length - vBad) + "/" + corpus.length); fail += vBad; }

// ---- derived copies must convert identically to src/ ----------------------
//
// Tested by behaviour against the committed files, without rebuilding.
// Byte-identical regeneration is asserted by build.js and by CI.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

function loadDerived() {
  const web = require(path.join(root, "docs", "md2org.js"));
  const shortcutSrc = fs.readFileSync(path.join(root, "shortcut", "transform.js"), "utf8");
  // docs/md2org-entities.js assigns to window, so it runs in a context.
  const vm = require("vm");
  const c = vm.createContext({ window: {}, module: { exports: {} } });
  vm.runInContext(fs.readFileSync(path.join(root, "docs", "md2org-entities.js"), "utf8"), c);
  return {
    web: web,
    shortcut: new Function("$text", shortcutSrc),
    webEntities: vm.runInContext("window.md2orgEntities", c)
  };
}

/*
 * Character-reference decoding (the CLI's -e and the web page's checkbox). The
 * option must decode, must leave the default unchanged, and must still warn when
 * a decoded character is Org syntax.
 */
console.log("CHARACTER REFERENCES WITH -e");

function checkEntities(name, src, want) {
  const got = md2org.withEntities(src);
  if (got === want) { pass++; console.log("  ok   " + name); return; }
  fail++;
  console.log("  FAIL " + name);
  console.log("    input:    " + JSON.stringify(src));
  console.log("    expected: " + JSON.stringify(want));
  console.log("    got:      " + JSON.stringify(got));
}

checkEntities("named reference decodes", "A &mdash; B", "A — B");
checkEntities("decimal reference decodes", "A &#8212; B", "A — B");
checkEntities("hex reference decodes", "A &#x2014; B", "A — B");
checkEntities("predefined reference decodes", "Tom &amp; Jerry", "Tom & Jerry");
checkEntities("an unknown name is left alone", "a &notreal; b", "a &notreal; b");
checkEntities("a reference decoded into a headline is warned",
  "&#42; foo", "* foo\n\n# md2org warnings:\n# heading: line 1");
checkEntities("a reference decoded into a comment is warned",
  "&#35; foo", "# foo\n\n# md2org warnings:\n# comment: line 1");

/* The option does not change the default, before or after use. */
(function () {
  const before = md2org("A &mdash; B");
  md2org.withEntities("A &mdash; B");
  const after = md2org("A &mdash; B");
  const name = "the option does not leak into the default";
  if (before === "A &mdash; B" && after === before) { pass++; console.log("  ok   " + name); }
  else {
    fail++;
    console.log("  FAIL " + name);
    console.log("    before " + JSON.stringify(before) + "  after " + JSON.stringify(after));
  }
})();

let derived;
try {
  derived = loadDerived();
} catch (e) {
  fail++;
  derived = null;
  console.log("  FAIL could not load the derived copies: " + (e && e.message ? e.message : e));
}

if (derived) {
  // This file's corpus and the shared one in corpus.js; they overlap but neither
  // contains the other.
  const parityCorpus = [...new Set(corpus.concat(require("./corpus.js")))];
  let drift = 0;
  for (const src of parityCorpus) {
    const want = md2org(src);
    if (derived.web(src) !== want) {
      drift++;
      console.log("  FAIL docs/md2org.js differs from src/ on " + JSON.stringify(src));
    }
    // The Shortcut copy returns a hint for empty input; every other input must
    // match src/ exactly.
    if (src === "") continue;
    if (derived.shortcut(src) !== want) {
      drift++;
      console.log("  FAIL shortcut/transform.js differs from src/ on " + JSON.stringify(src));
    }
    // The entities copy is compared with md2org.withEntities.
    if (derived.webEntities(src) !== md2org.withEntities(src)) {
      drift++;
      console.log("  FAIL docs/md2org-entities.js differs from src/ on " + JSON.stringify(src));
    }
  }
  if (drift) {
    fail += drift;
    console.log("  run `node build.js` and commit the result");
  } else {
    console.log("DERIVED COPIES match src/ on " + parityCorpus.length + " inputs");
  }
}

console.log("");
console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
