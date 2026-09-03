# Mapping

This document specifies what md2org does to each Markdown construct. Each
construct appears in exactly one row. The Disposition column uses the terms
defined in [DESIGN.md](DESIGN.md#dispositions), which also explains the rules
behind them.

## Blocks

| Markdown | Org | Disposition | Notes |
|---|---|---|---|
| `# H` … `###### H` | `* H` … `****** H` | Converted | |
| Setext heading (`H` over `===` or `---`) | `* H`, `** H` | Converted | level from the underline character |
| Heading inside a block quote or list item (`> ## H`, `- ## H`) | `*H*` | Lossy | an Org headline must start at column 0 and would end the enclosing block, so the heading becomes bold text; its level is lost |
| Paragraphs | paragraphs | Converted | blank lines follow the source |
| ` ```lang ` fence | `#+BEGIN_SRC lang` | Lossy | first word of the info string only; Org would read the rest of the line as switches and header arguments |
| ` ``` ` fence, no language | `#+BEGIN_EXAMPLE` | Converted | Org requires a language on a source block |
| `~~~` fence, fences longer than three | as for ` ``` ` | as for ` ``` ` | |
| Indented code | `#+BEGIN_EXAMPLE` | Converted | |
| Block quotes, nested | `#+BEGIN_QUOTE` | Converted | |
| Bullet lists, nested | `-` | Lossy | `+` and `*` markers also become `-`; the parse tree does not record which was used |
| Ordered lists | `1.` | Lossy | `)` delimiter becomes `.`; a start other than 1 uses the `[@n]` cookie |
| Tight lists | tight lists | Converted | |
| Loose lists, multi-paragraph items | blank lines kept | Converted | |
| Thematic break | `-----` | Converted | |

## Inline

| Markdown | Org | Disposition | Notes |
|---|---|---|---|
| `*em*`, `_em_` | `/em/` | Lossy | delimiter spelling not preserved |
| `**strong**` | `*strong*` | Converted | |
| `***both***` | `/*both*/` | Converted | |
| `a**b**c` | `a*b*c` | Lossy | Org's PRE rule forbids markup starting inside a word, so Org reads plain text |
| `` `code` `` | `=code=` | Converted | `~code~` when the span contains `=` |
| `` `a=b~c` `` | `a=b~c` | Lossy | no Org object can hold both `=` and `~`; monospace dropped, characters kept |
| Hard line break | `\\` | Converted | |
| `\*a\*`, `\_a\_`, `\~a\~`, `\=a\=`, `\+a\+` | `*a*`, `_a_`, `~a~`, `=a=`, `+a+` | Export hazard | the backslash is Markdown markup and the parser consumes it, so Org can read the result as bold, underline, code, verbatim or strikethrough. Not warned, because md2org does not escape literal text |
| `&#65;` `&#x41;` `&amp;` `&mdash;` | unchanged | Unchanged | `md2org -e` or the web page checkbox decodes them to the characters they name; not available in the Shortcut |
| `&#42; foo`, `&#35; foo` at line start, with `-e` | `* foo`, `# foo` | Warned | `heading`, `comment` |

## Links and images

| Markdown | Org | Disposition | Notes |
|---|---|---|---|
| `[t](/u)` | `[[/u][t]]` | Converted | |
| `[t](u)`, `[t](a/b.md)` | `[[file:u][t]]` | Converted | a bare relative path is a fuzzy link in Org, which searches the document for a headline of that name; `file:` is the relative-path link type |
| `[t][ref]` with a definition | `[[/u][t]]` | Converted | |
| `<http://e.com>` | `[[http://e.com][http://e.com]]` | Converted | |
| Bare `http://…`, `https://…` | unchanged | Unchanged | Org recognises a plain link itself |
| `![alt](/i.png)` | `[[/i.png][alt]]` | Converted | |
| `[](/u)` | `[[/u]]` | Converted | an Org link description must hold at least one object |
| `[t]()` | `t` | Lossy | an empty path is not an Org link; the description is kept as text |
| `[t](/u "title")` | `[[/u][t]]` | Lossy | Org links have no title |
| `[![alt](/i.png)](/u)` | `[[/u][/i.png]]` | Lossy | badges; a description may contain only a plain or angle link, so the alt text is dropped |
| `[Install](#install)` | `Install` | Lossy | Org anchors are declared as `CUSTOM_ID` properties, not derived from heading text; this is why a table of contents loses its links |
| ``[see `a]]b` now](/u)`` | ``[[/u][see =a]]b= now]]`` | Warned | `]] in a link description`; Org ends the link at the first `]]` and has no escape for it |

## Raw HTML

| Markdown | Org | Disposition | Notes |
|---|---|---|---|
| HTML block | `#+BEGIN_EXPORT html` | Export hazard | appears in HTML export only |
| Inline HTML tag | `@@html:<b>@@` | Export hazard | one snippet per tag; Markdown between tags converts normally. Dropped by every backend but HTML, so a construct such as `<<anything>>` leaves nothing behind |
| Inline HTML comment | `@@html:<!-- c -->@@` | Converted | invisible in every export, as in the source |
| HTML comment block, one line | `# …` | Converted | |
| HTML comment block, several lines | a run of `# …` lines | Converted | body kept verbatim; no comma-quoting |
| HTML comment with text after `-->` | `#+BEGIN_EXPORT html` | Export hazard | the export block keeps the trailing text, which an Org comment would drop |
| HTML comment inside an HTML block (`<div>` without blank lines, `<pre>` with them) | part of the export block | Export hazard | the comment belongs to the HTML block |
| HTML comment on the line directly above `<div>` | an Org comment, then an export block | Converted | |

## GFM extensions

| Markdown | Org | Disposition | Notes |
|---|---|---|---|
| Tables | Org tables | Converted | all 8 GFM spec examples pass: delimiter rows, alignment cookies, escaped pipes, ragged rows, block interruption. Cells hold inline content only |
| Tables in lists or quotes | Org tables | Converted | |
| Tables indented 1–3 spaces | Org tables | Converted | |
| `\\|` in a table cell, including inside code | `\\|` | Warned | `\\| in a table cell`; the parser consumes the backslash and md2org restores it, but Org has no escape for a pipe in a cell, so the cell splits. md2org does not use `\vert{}` |
| `- [ ]` | `- [ ]` | Converted | |
| `- [x]` | `- [X]` | Converted | Org recognises only an uppercase box |
| `~~strike~~` | `+strike+` | Converted | including spans across other inline markup |
| `www.…` and bare email addresses | unchanged | Unchanged | the GFM autolink extension is not implemented; `www` is not an Org link type, and email needs `mailto:` |

## Footnotes

Footnotes are not part of the GFM specification; md2org supports them as an
extension.

| Markdown | Org | Disposition | Notes |
|---|---|---|---|
| `[^1]` with a definition | `[fn:1]`, and `[fn:1] text` | Converted | |
| `[^1]` with no definition | unchanged | Unchanged | a reference converts only if a matching definition exists |
| `[^x y]`, `[^x-y]` | `[fn:x-y]`, `[fn:x-y-2]` | Converted | a counter keeps labels distinct when they collide after normalisation |
| Definition indented or in a quote | a footnote definition | Converted | |
| Multi-paragraph definition | one line | Lossy | an Org definition ends at a blank line, so it cannot hold two paragraphs |

## LaTeX math

Math is an extension; it is not part of GFM (DESIGN.md, LaTeX math).

| Markdown | Org | Disposition | Notes |
|---|---|---|---|
| `\(A_{ij}\)` | unchanged | Unchanged | a LaTeX fragment in Org; nothing inside is parsed as Markdown |
| `\[` … `\]`, with `\[` beginning a line and `\]` ending one | unchanged | Unchanged | a LaTeX fragment in Org; may span lines within a paragraph |
| Math in a footnote definition or heading, over several lines | one line | Unchanged | line breaks become spaces, which LaTeX treats alike |
| `\[1\]` in mid-line, `\(\)`, an unclosed `\(` | `[1]`, `()`, `(` | Converted | CommonMark escapes, not math |
| A line inside `\[` … `\]` beginning `- `, `* `, `# `, or indented four spaces | that block | Lossy | the equation is split; see DESIGN.md, Known limitations |

## Text that Org reads as its own syntax

Markdown files sometimes carry Org syntax on purpose. It passes through, and Org
reads it as the real thing.

| Written in the Markdown | Org reads it as | Disposition | Notes |
|---|---|---|---|
| `#+TITLE:` and other keywords | a keyword | Unchanged | |
| `# TODO H`, `# DONE H` | a todo keyword | Unchanged | the heading converts; the keyword passes through |
| `# [#A] H` | a priority cookie | Unchanged | |
| `# H :a:b:` | tags | Unchanged | |
| `# COMMENT H` | a commented subtree | Export hazard | the whole section is excluded from every export: intended if the author wrote Org, a surprise otherwise |
| `:PROPERTIES:` or `:LOGBOOK:` … `:END:` | a drawer | Export hazard | drawer contents are dropped on export |
| `DEADLINE:`, `SCHEDULED:` | planning lines | Unchanged | |
| `<2026-01-01 Thu>` | a timestamp | Unchanged | |
| `: x` at line start | a fixed-width line | Export hazard | exported as boxed monospace |
| `[fn:1] x` at line start, referenced | a footnote definition | Unchanged | |
| `[fn:1] x` at line start, unreferenced | a footnote definition | Export hazard | dropped on export |
| `%%(x)` | a diary sexp | Unchanged | |
| `$x$` in prose | a LaTeX fragment | Export hazard | ASCII export leaves it; LaTeX and HTML export render it as mathematics |
| `[[Page Name]]` | a fuzzy link | Warned | `[[ ]] read as an Org link`; Obsidian and Roam wiki-links therefore become Org links |
| `** x` or `\* x` at line start | a headline | Warned | `heading`; it claims everything after it until the next heading of equal or lower level. An unescaped `* x` is a Markdown bullet and converts to `-` |
| `#+BEGIN_…` or `#+END_…` on its own line | a block delimiter | Warned | `stray block delimiter`; can pair with a delimiter md2org emitted (see DESIGN.md, Known limitations) |
| `\# x` at line start | a comment | Warned | `comment`; `\#` is CommonMark's escape for a literal hash, but the parser consumes the backslash and Org reads the bare `#` as a comment, dropping the line from every export |

## Output escaping

These are the hazards in content that md2org otherwise passes through verbatim.

| Hazard | Handling |
|---|---|
| `*` or `#+` at line start inside any block, including `#+END_SRC` inside a fence | comma-quoted: `,*`, `,#+END_SRC` |
| `,*` or `,#+` at line start inside any block | one more comma, per `org-escape-code-in-string` |
| `]` or `\` in a link path | percent-encoded by the parser, then backslash-escaped, the one escape Org's Regular Link syntax sanctions |

The only other handling in `src/org-escape.js` is shown in the rows for a code
span containing both `=` and `~` (Inline) and for `\|` in a table cell (GFM
extensions).
