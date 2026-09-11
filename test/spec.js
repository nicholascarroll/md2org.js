/*
 * md2org spec / test suite.
 *
 * This file is the behavioural contract for the converter. Every case names a
 * Run as:
 *
 *   node test/spec.js
 *
 */
const md2org = require("../src/md2org.js");

const WARN_DESC = "\n\n# md2org warnings:\n# ]] in a link description: line 1";

let pass = 0, fail = 0;
/*
 * Every behavioural case is run twice: once against src/, and once against the
 * generated Shortcut copy in an isolated context.
 *
 * This is not redundant. The Shortcut copy is a concatenation of the core regions
 * of src/, with the Node require bootstrap stripped out — so a core that refers to
 * a name the bootstrap defines works perfectly under Node and is undefined on the
 * phone. That shipped once: footnote rendering called __gfmLabel, which existed
 * only in the bootstrap, and the build's separate corpus happened to contain no
 * footnote definition, so nothing caught it.
 *
 * Comparing here means any feature with a test automatically has parity coverage.
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
  // The Shortcut copy deliberately answers empty input with a hint rather than an
  // empty string, because an empty paste on a phone tells the user nothing.
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
// CHANGED (was "#+BEGIN_SRC \nplain\n#+END_SRC"). Org Syntax v2 §Lesser Elements
// makes DATA mandatory for a source block: "In the case of a source block, this is
// mandatory and must follow the pattern LANGUAGE SWITCHES ARGUMENTS". An empty
// #+BEGIN_SRC is not conformant Org, so a bare fence becomes an example block.
// pandoc emits the same. Revert this one line to restore the old contract.
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
// A bare relative path matches no PATHREG pattern but FUZZY, so Org reads it as a
// search for a headline of that name and export fails outright. Markdown means a
// relative URL, which in Org is the "file:" link type.
check("bare relative path becomes a file: link",
  "[foo](url)",
  "[[file:url][foo]]");
check("path with a directory too",
  "[foo](a/b.md)",
  "[[file:a/b.md][foo]]");
check("image path likewise",
  "![i](img.png)",
  "[[file:img.png][i]]");
// "(foo)" matches CODEREF, which is worse than fuzzy.
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
// Anchors are not supported. Org resolves a "#" link against CUSTOM_ID
// properties, which Markdown never declares, and one unresolvable anchor makes
// the exporter fail on the whole document. The description is kept as text.
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
// CHANGED (was "  - nested"). Nesting is now decided by CommonMark's rules rather
// than by copying source indentation: a two-space indented bullet with no parent
// list is a top-level item, so its indent carries no meaning. Genuine nesting is
// tested below.
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
// Only a "#+end_NAME" matching the block's own name terminates it (§Lesser
// Elements), so the hazard is real for a language-tagged fence, where the
// generated block is BEGIN_SRC and the name does match. Confirmed in Emacs:
// an unquoted #+END_SRC inside BEGIN_EXAMPLE leaves the body inside the block.
check("language-tagged fence cannot be ended early",
  "```python\n#+END_SRC\nstill code\n```",
  "#+BEGIN_SRC python\n,#+END_SRC\nstill code\n#+END_SRC");
// A leading asterisk at column 0 is the genuine heading hazard. Distinct from
// "** x **" below, which is escaped by the emphasis rules and fires mid-line too.
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
// A leading TODO keyword is promoted, not escaped: the Markdown almost always
// means a task, and this is what the author would have typed in Org by hand. A
// bare "# TODO" always behaved this way; these make the two consistent.
check("heading TODO keyword is promoted",
  "# TODO fix the parser",
  "* TODO fix the parser");
check("bare TODO heading",
  "# TODO",
  "* TODO");
check("DONE keyword is promoted too",
  "## DONE shipped it",
  "** DONE shipped it");
// Only a keyword the reader has configured is a state; an unconfigured word is
// ordinary text either way, so nothing here needs a fixed keyword list.
check("word merely starting with a keyword is untouched",
  "# TODOs for the week",
  "* TODOs for the week");
check("heading priority cookie passes through",
  "# [#A] important",
  "* [#A] important");
// A leading COMMENT excludes the heading and its whole subtree from export, so
// ordinary prose starting with the word would silently vanish. Unlike a todo
// keyword this is fixed in the grammar, so the guard can match exactly.
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

// §Regular Link: a description may contain square brackets but not "]]". A "]"
// ending the description forms one against the closer, and CommonMark splits
// "\]\]" into separate text nodes so the pair can straddle a node boundary.
//
// Passed through and reported, per DESIGN.md. The link ends early and the rest of
// the description is left in the document as text: every character survives, the
// link does not. The alternative was separating the pair with a \zwnj{} entity,
// which produced a correct link right up until an author's own "=" or "~" closed
// around it, at which point Org printed "\zwnj{}" in the reader's face — entities
// are not expanded inside verbatim (§Text Markup: CONTENTS is a string). md2org
// now generates no entities at all, so the escape had nowhere left to live.
check("description ending in ] passes through and warns",
  "[a\\]](/u)",
  "[[/u][a]]]" + WARN_DESC);
check("]] split across text nodes passes through and warns",
  "[a\\]\\]b](/u)",
  "[[/u][a]]b]]" + WARN_DESC);
// A code span keeps its monospace now. It only ever lost it so that the escape
// could be applied outside the delimiters; with no escape to apply, the span is
// left alone and the "]]" inside it is reported like any other.
check("]] inside a code span in a description keeps the span",
  "[see `a]]b` now](/u)",
  "[[/u][see =a]]b= now]]" + WARN_DESC);
check("]] inside a code span in an image description keeps the span too",
  "![alt `]]` t](/i.png)",
  "[[/i.png][alt =]]= t]]" + WARN_DESC);
// Only "]]" breaks a description, so a lone "]" keeps its monospace. Unwrapping
// more than necessary would lose formatting the author asked for.
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
// Entities are not expanded inside verbatim (§Text Markup: CONTENTS is a string),
// so a pipe inside code in a cell cannot be escaped in place. The span is
// unwrapped: the text stays correct, only the monospace is lost.
check("pipe inside code in a cell unwraps the code span",
  "| a |\n| --- |\n| \`Alt-\\|\` |",
  "| a |\n|----|\n| Alt-\\| |\n\n# md2org warnings:\n# \\| in a table cell: line 3");
check("code span without a pipe keeps its markup",
  "| a |\n| --- |\n| \`fmt\` |",
  "| a |\n|----|\n| =fmt= |");

// Found by test/fuzz.js, not by hand. Each of these crashed or produced invalid Org.
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

// Footnotes. GFM 0.29 has no footnote example, so these follow GitHub.
// GitHub only renders a reference as a footnote when a definition exists. Without
// that rule a regex character class in prose — "[^abc def]" — becomes a footnote.
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
// A definition is shaped like a link reference definition, so it must be lifted
// out before CommonMark sees it or it is silently swallowed as one.
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
// Org labels allow only word characters and hyphens, so other characters fold to
// a hyphen. A label containing whitespace is not recognised as a footnote at all
// and stays literal — a documented limit, since GitHub does allow those.
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
 * Character references, named and numeric alike, reach the output as written.
 *
 * The numeric cases are the ones with teeth. Decoding them produces characters
 * that are Org syntax: "&#42; x" became a level-1 headline and "&#35; x" became
 * an Org comment, which dropped the line from every export without a warning.
 * Nothing in this suite covered references at all before 1.1.0 — the decoding
 * could be removed from the parser and every tier still passed — so these are
 * here to make the contract observable rather than merely intended.
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

// ---- derived copies must be in sync (README promises they can't drift) -----
//
// Checked by BEHAVIOUR, not by regenerating. An earlier version shelled out to
// `node build.js` and diffed the result, which had three problems: it needed
// esbuild, so `npm test` could not run anywhere the build toolchain would not
// install; it rewrote docs/ and shortcut/ mid-test, so a failing run repaired the
// files it was complaining about and the next run passed; and a failed spawn
// dumped a raw result object full of byte arrays instead of an error message.
//
// Byte-identical regeneration is still asserted — by build.js when it runs, and
// by CI, which rebuilds and fails on any diff. That is the right place for it:
// it is a property of the build, and it needs the build tools. What matters here
// is the promise the README makes to users, which is that the CLI, the browser
// page and the Shortcut all convert identically. That is a property of the
// committed files, and testing it needs nothing but the committed files.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

function loadDerived() {
  const web = require(path.join(root, "docs", "md2org.js"));
  const shortcutSrc = fs.readFileSync(path.join(root, "shortcut", "transform.js"), "utf8");
  // docs/md2org-entities.js is an IIFE that assigns to window, so it needs a
  // context with one rather than a require.
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
 * Character-reference decoding, the CLI's -e and the browser's checkbox.
 *
 * Off by default, so every case above still holds. What is asserted here is that
 * the option decodes, that it leaves the default alone, and that decoding into a
 * character which is Org syntax is still reported — the option must not be a way
 * to lose a line quietly.
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

/* The option must not leak: the default is the default before and after. */
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
  // Both corpora: this file's, which covers the constructs the suite asserts, and
  // the shared one build.js uses. They overlap but neither contains the other.
  const parityCorpus = [...new Set(corpus.concat(require("./corpus.js")))];
  let drift = 0;
  for (const src of parityCorpus) {
    const want = md2org(src);
    if (derived.web(src) !== want) {
      drift++;
      console.log("  FAIL docs/md2org.js differs from src/ on " + JSON.stringify(src));
    }
    // The Shortcut copy deliberately answers empty input with a hint rather than
    // an empty string, because an empty paste on a phone gives the user nothing
    // to go on. Every other input must match src/ exactly.
    if (src === "") continue;
    if (derived.shortcut(src) !== want) {
      drift++;
      console.log("  FAIL shortcut/transform.js differs from src/ on " + JSON.stringify(src));
    }
    // The entities copy is the same program with a different parser, so it is held
    // to src/ too — against md2org.withEntities, not the default.
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
