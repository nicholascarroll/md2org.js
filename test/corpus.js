/*
 * Inputs run through src/ and the generated copies by build.js, so any
 * difference introduced by generation fails the build. Also used by test/spec.js.
 */
module.exports = [
  "",
  "just text",
  "## x\n**b** _i_ `c`\n- one\n<!-- n -->",
  "```py\n#c\nx=a_b\n```",
  "# H :tags:\n\n> q\n\n1. a\n2. b\n\n[l](/u \"t\") ![i](/p.png)",
  "```\n#+END_SRC\nstill code\n```",
  "\\*lit\\* and ***both*** and `a=b`",
  // Code spans that break the markup around them: "]]" in a link description
  // (warned) and "|" in a table cell (monospace dropped).
  "[see `a]]b` now](/u)",
  "| `a|b` | c |\n|---|---|\n| 1 | 2 |",
  "** x **",
  "* * *",
  "Title\n=====",
  "    indented code",
  "~~~\nfence\n~~~",
  "<http://example.com>",
  "foo  \nbar",
  "&amp; &copy;",
  "[foo]\n\n[foo]: /url",
  "- a\n  - b\n- c",
  "1. one\n2. two",
  "5. five\n6. six",
  "# TODO fix\n\n# [#A] p\n\n- foo :: bar",
  "#+title: k",
  "<div>\nraw\n</div>",
  "text with <em>inline</em> html",
  "~~struck~~",
  "2 + 2 and some_var_name and a/b",
  "`a=b` and `a=b~c`",
  "[t](http://x/a]]b)",
  "> quote\n> more\n\nafter",
  "```ruby startline=3\ncode\n```\nafter",
  // Footnotes.
  "note [^1] here\n\n[^1]: the body",
  "see [^a] and [^b]\n\n[^a]: first\n[^b]: second",
  "[^1]: body\n    continued",
  "x [^my note!] and `[^2]`",
  "[![Alt](https://img.shields.io/b.svg)](https://example.com/p)",
  // LaTeX math.
  "where \\(A_{ij}\\) is\n\n\\[\n\\sum_j A_{ij} = 1\n\\]"
];
