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

let pass = 0, fail = 0;
function check(name, input, expected) {
  const got = md2org(input);
  if (got === expected) { pass++; console.log("  ok   " + name); }
  else {
    fail++;
    console.log("  FAIL " + name);
    console.log("    input:    " + JSON.stringify(input));
    console.log("    expected: " + JSON.stringify(expected));
    console.log("    got:      " + JSON.stringify(got));
  }
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
check("fenced block without language",
  "```\nplain\n```",
  "#+BEGIN_SRC \nplain\n#+END_SRC");
check("hash inside code is not a heading",
  "```py\n# a comment\nx = 1\n```",
  "#+BEGIN_SRC py\n# a comment\nx = 1\n#+END_SRC");
check("stars and underscores inside code are untouched",
  "```py\nsome_var = a*b\n```",
  "#+BEGIN_SRC py\nsome_var = a*b\n#+END_SRC");

console.log("MARKDOWN COMMENTS");
check("single-line comment becomes an Org comment",
  "<!-- a note -->",
  "# a note");
check("empty comment",
  "<!---->",
  "#");
check("multi-line comment becomes a comment block",
  "<!--\nline one\nline two\n-->",
  "#+BEGIN_COMMENT\nline one\nline two\n#+END_COMMENT");
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
check("link whose text is code", "[`fn`](u)", "[[u][=fn=]]");

console.log("LISTS");
check("dash bullet", "- item", "- item");
check("asterisk bullet", "* item", "- item");
check("plus bullet", "+ item", "- item");
check("nested bullet keeps indent", "  - nested", "  - nested");
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
check("unclosed comment is closed",
  "<!--\ndangling",
  "#+BEGIN_COMMENT\ndangling\n#+END_COMMENT");

console.log("EDGE");
check("empty input", "", "");
check("plain paragraph untouched", "just text", "just text");

console.log("");
console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
