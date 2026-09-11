# Mapping

What every construct becomes. The two rules behind it are in [DESIGN.md](DESIGN.md):

> md2org converts Markdown markup to Org markup.
> Source text that isn't Markdown markup passes through unchanged.

---

## Blocks

| Markdown | Org | Notes |
|---|---|---|
| `# H` … `###### H` | `*` … `******` | |
| Setext (`H` over `===`) | `* H` | level from the underline character |
| `# TODO H`, `# H :tag:` | `* TODO H`, `* H :tag:` | keywords, priorities and tags pass through |
| Paragraphs | paragraphs | blank lines follow the source |
| ` ```lang ` | `#+BEGIN_SRC lang` | first word only; Org reads the rest of the line as switches and header arguments |
| ` ``` ` (no language) | `#+BEGIN_EXAMPLE` | Org requires a language on a source block |
| Indented code | `#+BEGIN_EXAMPLE` | |
| `~~~`, ` ```` ` | as above | |
| Block quotes, nested | `#+BEGIN_QUOTE` | |
| Bullet lists, nested | `-` | `+` and `*` markers also become `-`; the tree doesn't record which was used |
| Ordered lists | `1.` | non-1 starts use the `[@n]` cookie; `)` delimiter becomes `.` |
| Tight list | tight list | |
| Loose list, multi-paragraph item | blank lines kept | |
| Thematic break | `-----` | |
| HTML blocks | `#+BEGIN_EXPORT html` | see [Not convertible](#not-convertible) |
| HTML comments, one line | `# …` | |
| HTML comments, multi-line | a run of `# …` lines | body kept verbatim; no comma-quoting |
| HTML comment with text after `-->` | `#+BEGIN_EXPORT html` | keeps the trailing text, which a comment would drop |

## Inline

| Markdown | Org | Notes |
|---|---|---|
| `*em*`, `_em_` | `/em/` | spelling not preserved |
| `**strong**` | `*strong*` | |
| `***both***` | `/*both*/` | |
| `` `code` `` | `=code=` | `~code~` when it contains `=`; plain text when it contains both, since no Org object can hold that |
| `~~strike~~` | `+strike+` | |
| `[t](/u)` | `[[/u][t]]` | |
| `[t](u)`, `[t](a/b.md)` | `[[file:u][t]]` | a bare relative path is a FUZZY link to Org, which searches the document for a headline of that name; `file:` is the relative-path link type |
| `[t][ref]` + definition | `[[/u][t]]` | |
| `[t]()` | `t` | an empty PATHREG is not a link; the description is the only content |
| `[](/u)` | `[[/u]]` | a description must hold one or more objects |
| `[t](/u "title")` | `[[/u][t]]` | title dropped; Org links have no title slot |
| `![alt](/i.png)` | `[[/i.png][alt]]` | |
| `[![alt](/i.png)](/u)` | `[[/u][/i.png]]` | badges; alt text dropped |
| ``[see `a]]b` now](/u)`` | ``[[/u][see =a]]b= now]]`` | the link ends at the `]]`; monospace and characters both kept, and the footer says so |
| `<http://e.com>` | `[[http://e.com][http://e.com]]` | |
| Bare `http://…` | unchanged | Org parses plain links natively |
| Hard line break | `\\` | |
| `&#65;` `&#x41;` `&amp;` `&mdash;` | passed through unchanged | md2org decodes no character reference of any kind. `md2org -e`, or the checkbox on the web page, decodes them all to the characters they name; off by default, and not available in the Shortcut, whose budget cannot hold the table |
| `\*escaped\*` | `*escaped*` | the backslash is Markdown markup and the parser consumes it |
| `a**b**c` | `a*b*c` | Org's PRE rule forbids markup starting inside a word, so this reads as plain text |

## GitHub Flavoured Markdown

| Markdown | Org | Notes |
|---|---|---|
| Tables | Org tables | 8/8 spec examples: rule rows, alignment cookies, escaped pipes, ragged rows, block interruption |
| Table cell contents | inline only | GFM defines a table as a leaf block; a cell can't contain a list, heading or quote |
| Tables in lists or quotes | Org tables | tables are a block in the forked parser |
| Table indented 1–3 spaces | Org tables | |
| `- [ ]` | `- [ ]` | |
| `- [x]` | `- [X]` | Org recognises only an uppercase box |
| `~~strike~~` spanning other inlines | `+strike+` | strikethrough is a delimiter type in the forked parser |
| `[^1]` + definition | `[fn:1]`, `[fn:1] text` | a reference converts only if a matching definition exists |
| `[^x y]` and `[^x-y]` | `[fn:x-y]`, `[fn:x-y-2]` | a counter keeps colliding labels distinct |
| Footnote definition, indented or in a quote | a footnote definition | definitions are a block in the forked parser |
| Multi-paragraph footnote body | joined into one line | an Org definition ends at a blank line, so it cannot hold two paragraphs |
| `www.` and bare email autolinks | unchanged | the GFM autolink extension is not implemented. `http://` and `https://` still work, because Org recognises a bare URL itself; `www` is not an Org link type and email needs `mailto:` |

## Passes through unchanged

Org markup isn't Markdown markup, so it's left alone. None of this is a special
case in the code — it works because nothing stops it.

| Written in the Markdown | Arrives as |
|---|---|
| `#+TITLE:` and other keywords | a real keyword |
| `TODO` / `DONE` on a heading | a real todo keyword |
| `[#A]` on a heading | a real priority cookie |
| `:tag:tag:` on a heading | real tags |
| `COMMENT` on a heading | a real export-excluded subtree |
| `:PROPERTIES:` … `:END:` | a real drawer |
| `DEADLINE:` `SCHEDULED:` | real planning lines |
| `<2026-01-01 Thu>` | a real timestamp |
| `: x` | a fixed-width line |
| `[fn:1] x` at line start | a footnote definition |
| `%%(x)` | a diary sexp |
| `[[Page Name]]` | an Org fuzzy link — Obsidian and Roam wiki-links convert themselves |
| `** x` at line start | a heading — see below |

### The warned cases

Five constructs pass through unchanged and are reported instead, because each one
changes how Org parses the document and none of them has an escape Org would
honour. They are listed by category at the end of the output:

```org
# md2org warnings:
# heading: line 4
# \| in a table cell: line 12, 19
```

One line per category, followed by comma-separated line numbers. Line numbers
refer to the output. The block is absent when there is nothing to report.

- **`heading`** — a line starting `** ` or deeper, which Org reads as a heading, and which then claims everything after it until the next heading of equal or lower level.
- **an escaped pipe in a table cell** — Org gives a table cell no escape syntax at all, so the row splits.
- **`]] in a link description`** — Org has no escape for it either, so the link ends early and the rest of the description stays in the document as text.
- **`stray block delimiter`** — a literal `#+BEGIN_`/`#+END_` line, which can pair with one md2org emitted.
- **`[[ ]] read as an Org link`** — text Org will read as a fuzzy link; Obsidian and Roam wiki-links convert themselves.
- **`comment`** — a line Org reads as a comment, which drops it from every export. `\#` is CommonMark's escape for a literal hash at line start; the parser consumes the backslash and the bare `#` left behind is an Org comment. Org wants `#` then whitespace or end of line, so `\#1 fixed` and `\#+TITLE:` are not affected, and a `# ` line inside a code fence is not reported because Org parses no comment there.

A level-1 heading is not known to arise: a single `*` plus a space is always a
Markdown bullet. That was stated as *cannot* until 1.1.0 and was wrong — `&#42; foo`
decoded to `* foo`, which Org read as a headline. Character references are no longer
decoded, so the route is closed, but the check is on the finished line rather than on
any list of constructs, which is why it warned even while the claim was false.

Text inside a code span or a fenced block is not reported, because Org parses no
markup there: §Text Markup makes the contents of a verbatim span a literal
string, so `` `[[Some Page]]` `` is not a link and warning about it would be a
false finding. `test/warnings.js` asserts both directions.

## Content that must survive verbatim

This table is the whole of the escaping in the program. All of it lives in
`src/org-escape.js`.

| Hazard | Handling |
|---|---|
| `#+END_SRC` inside a fence | comma-quoted (`,#+END_SRC`) |
| `*` or `#+` at line start inside any block | comma-quoted |
| `,*` or `,#+` at line start inside any block | one comma added, per `org-escape-code-in-string` |
| `]` or `\` in a link path | percent-encoded by the parser; backslash-escaped after that, the one escape §Regular Link sanctions |
| `\|` in a table cell | the backslash the parser consumed is put back, so the cell reads as the author wrote it |
| `=` and `~` together in a code span | monospace dropped, characters kept |

Comma-quoting is Org's own mechanism and is reversed on read. Nothing here touches
the author's literal text.

md2org generates no Org entities. `\vert{}` and `\zwnj{}` were both removed in
1.1.0: each was markup md2org generated to protect markup md2org generated, and
each could be captured by an author's own `=` or `~`, at which point Org printed
it to the reader rather than expanding it — §Text Markup makes the contents of a
verbatim span a literal string. Where Org offers no escape, DESIGN.md now passes
the construct through and warns, which `npm run test:emacs` verifies against a
real Org parser.

A backslash escape, `]\]`, was tried and rejected: Org parses it, but never strips
the backslashes, so they survive into every export.

---

## Not convertible

Org has no equivalent, so the first rule can't be kept in full.

| Markdown | Why not |
|---|---|
| `[t](/u "title")` | Org bracket links have no title slot |
| Alt text on a badge | a link description may contain only a plain or angle link |
| A pipe inside code in a table cell | GFM requires the pipe be escaped; a cell can't hold a bare `\|` |
| Faithful raw HTML | export blocks survive HTML export and vanish everywhere else |
| Character references, `&mdash;` and `&#8212;` alike | passed through; the named table far exceeds the bytes budget, and decoding the numeric ones produced Org syntax — see DESIGN.md |
| Bullet character, emphasis spelling | CommonMark's tree doesn't record which was used |
| `[Install](#install)`, a table of contents | Org anchors must be declared as `CUSTOM_ID` properties |

## Out of scope

Org to Markdown; round-tripping; math; GitHub alerts; non-GFM dialects; anything
needing a configuration file.

Tables of contents: `[Install](#install)`:  Org anchors must be declared as
`CUSTOM_ID` properties rather than derived from heading text. So the link is stripped, leaving just plain text `Install`. 

---
## Bytes budget

The iOS Shortcut is the binding constraint on this project: pasting `transform.js`
into the Actions app's code field crashes the Shortcuts editor if the file's line
count, byte count or line length is too great.

`npm test` prints the current size and headroom and asserts the limits of bytes and line count (`test/size.js`).

Where the bytes go: the forked CommonMark parser is about 85% of the file. The
rest is the renderer, then the entry point, the escape module and the Shortcut
wrapper that `build.js` appends. Tables, footnotes and strikethrough are inside
the parser now, so there is no separate GFM layer to cost.

Everything that could be cut, if it came to it:

| Cut | Saves | Cost to the user |
|---|---|---|
| HTML blocks and raw inline HTML | ~0.6 KB | HTML passes through as text |
| Character-reference decoding | 144 B, taken in 1.1.0 | all references pass through; 13 spec examples |

These figures predate the fork and need re-measuring; the table code moved into
the parser and is no longer separable.

The parser cannot be reduced. It is the great majority of the file, and removing
HTML support entirely would save only a fraction of what the table above lists.

**This was measured on one device only** (iPhone 14, iOS 26.x), by pasting files
of known dimensions. `test/size.js` carries the full table — every shape measured,
crashes included — and asserts bytes and line count together.

The reference shape is the build that pasted successfully and was used to generate `shortcut/md2org.shortcut`: **39,054 bytes, 115 lines, longest line 631**.

Bytes and line count are measured limits and `test/size.js` asserts both. Longest line is not a limit: no paste has ever failed on column count, and 631 was simply the longest line in that build — the number drifts by a character or two whenever the minifier reassigns identifier names, so the current build is a little past it and that is not a failure. `test/size.js` does carry a column tripwire, set far above any plausible drift at 2,000, and what it guards is esbuild's `lineLimit` in `build.js`: remove that and the file comes out as 28 lines with a longest of 11,472, which is the shape of the one build that ever crashed the editor on line length.

These are shapes, not a box. Nothing combining the largest number from two
different measurements has ever been pasted, so the limits come from one file and are raised only by pasting a bigger one.
