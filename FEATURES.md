# Mapping

What every construct becomes. The two rules behind it are in [DESIGN.md](DESIGN.md):

> md2org converts Markdown markup to Org markup.
> Source text that isn't Markdown markup passes through unchanged.

Rows marked with an **open issue** number are settled design the code doesn't
implement yet; the issues are in [DESIGN.md](DESIGN.md).

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
| HTML comments, multi-line | `#+BEGIN_COMMENT` | body comma-quoted; not an export block |
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
| ``[see `a]]b` now](/u)`` | `[[/u][see a]\zwnj{}]b now]]` | a code span holding `]]` in a description unwraps: monospace lost, characters kept |
| `<http://e.com>` | `[[http://e.com][http://e.com]]` | |
| Bare `http://…` | unchanged | Org parses plain links natively |
| Hard line break | `\\` | |
| `&amp;` `&#65;` | resolved to characters | ~26 named entities; see [Not convertible](#not-convertible) |
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
| `www.` and bare email autolinks | unchanged | **D3** — the GFM autolink extension is not implemented. `http://` and `https://` still work, because Org recognises a bare URL itself; `www` is not an Org link type and email needs `mailto:` |

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

### The one warned case

A line in the source starting with `** ` and deeper passes through, and Org reads it as a heading, which claims everything after it until the next heading of equal or lower level. It is the only pass-through construct that changes the document's shape, so those lines are listed in a comment block at the end of the output:

```org
# md2org warnings:
# line 4: ** Important Reminder **
```

Line number refers to the output. The block is absent when there is
nothing to report. A single `*` plus a space is always a Markdown bullet, so
level-1 headings can't arise this way.

## Content that must survive verbatim

This table is the whole of the escaping in the program. All of it lives in
`src/org-escape.js`.

| Hazard | Handling |
|---|---|
| `#+END_SRC` inside a fence | comma-quoted (`,#+END_SRC`) |
| `*` or `#+` at line start inside any block | comma-quoted |
| `,*` or `,#+` at line start inside any block | one comma added, per `org-escape-code-in-string` |
| `]` or `\` in a link path | percent-encoded by the parser; backslash-escaped after that, the one escape §Regular Link sanctions |
| `]]` in a link description | separated by `\zwnj{}`, whether it arrives as text or inside a code span |
| `]]` in a code span in a link description | the span unwraps first — an entity inside verbatim would not be expanded |
| `\|` in a table cell | becomes the `\vert{}` entity |
| `=` and `~` together in a code span | monospace dropped, characters kept |

Comma-quoting is Org's own mechanism and is reversed on read. The last three rows are not the escaping the contract forbids — the link wrapper, the table markup and the code-span delimiters are all markup md2org *generates*, breaking on the content they wrap, and Org gives those slots no escape syntax. Nothing here touches the author's literal text.

The two entities are the only characters in the output the author didn't write,
and both are reported in the warnings footer — see the README. `\vert{}` is the
escape the Org manual itself prescribes for a pipe in a table field. `\zwnj{}` is
not: Org offers no escape for `]]` in a link description, so a zero-width
non-joiner separates the pair. Both export to the character the author typed,
which `npm run test:emacs` verifies against a real Org parser.

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
| `&HilbertSpace;` and similar | the full entity table far exceeds the bytes budget |
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
| Minimal entity table | ~0.4 KB | only ~26 named entities resolve |

These figures predate the fork and need re-measuring; the table code moved into
the parser and is no longer separable.

The parser cannot be reduced. It is the great majority of the file, and removing
HTML support entirely would save only a fraction of what the table above lists.

**This was measured on one device only** (iPhone 14, iOS 26.x), by pasting files
of known dimensions. `test/size.js` carries the full table — every shape measured,
crashes included — and asserts bytes, line count and line length together.

The reference shape is the build that pasted successfully and was used to generate `shortcut/md2org.shortcut`: **39,054 bytes, 115 lines, longest line 631**. The column limit is set one higher, at 632, because the minifier reassigns identifier names on any change to `src/` and the longest line drifts by a character or two for no reason worth chasing; 632 was itself measured as pasting.

These are shapes, not a box. Nothing combining the largest number from two
different measurements has ever been pasted, so the limits come from one file and are raised only by pasting a bigger one.
