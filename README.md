# md2org.js

md2org.js converts Markdown markup to Org markup.

- at the command line as a Unix filter  🙂
- on your phone via an iOS Shortcut  😎
- in your browser with nothing uploaded anywhere 🥷

**[Try it in your browser →](https://nicholascarroll.github.io/md2org.js/)**

Source text that isn't Markdown markup passes through unchanged. The conversion is one-way only: Markdown is a small language and maps cleanly onto Org; the reverse is lossy and I don't plan to attempt it in this project.

## Use

### 1. Command line

A Unix filter. Needs [Node.js](https://nodejs.org).

Install from npm:

```sh
npm install -g md2org
```

Or from a clone:

```sh
git clone https://github.com/nicholascarroll/md2org.js
cd md2org.js
npm link          # or add bin/ to your PATH
```

Either way:

```sh
md2org notes.md > notes.org
cat notes.md | md2org
md2org < notes.md
md2org --help
md2org --version
```

Reads a file argument or stdin, writes Org to stdout. Diagnostics go to stderr, so
a failure leaves your redirect target empty rather than full of an error message.
Exit status is 0 on success, 1 if the input file can't be read, 2 for a usage
error.

### 2. iOS Shortcut

Copy Markdown, tap the md2org button in the Control Centre and your clipboard content converts to Org. See **[shortcut/README.md](shortcut/README.md)** for the two-minute setup, or get the [drop-in Shortcut definition](shortcut/)

### 3. In the browser

Open the [live page](https://nicholascarroll.github.io/md2org.js/). Paste Markdown, copy Org. Conversion happens entirely on your device; it sends nothing over the network.

## Warnings Footer

md2org will write any warnings to the tail of the Org mode output as comments. For example, if your source file had a line starting with `** foo`, you will see this at the bottom of your output.

```
# md2org warnings:
# line 2: ** foo
```
This is warning you that line 2 of your output was not a heading in the source but is now.

Org syntax in the source that does *not* produce a warning include: `TODO`/`DONE`, priorities e.g. `[#A]`, `:tag:`, `COMMENT`, doc properties e.g. `#+TITLE:`, `:PROPERTIES:` drawers, `DEADLINE:`, timestamps.


## Known lossy conversions

- Intraword emphasis `a**b**c` becomes `a*b*c`.
- Link titles: `[t](/u "title")` loses the title.
- `+ item` becomes `- item` and `_em_` becomes `/em/`. 
- Raw HTML. Blocks become `#+BEGIN_EXPORT html`
- inline HTML becomes  `@@html:…@@`. 
- Obscure named entities such as `&HilbertSpace;` pass through as text.

## Correctness

md2org.js forks and modifies the reference [CommonMark](https://spec.commonmark.org/0.31.2/) parser, and passes 651 of the specification's 652 test cases. Forking is safe because `test/conformance.js` runs the spec's own 652 examples as data.

Tables and footnotes are [GitHub Flavoured Markdown](specs/gfm-spec-0.29.txt) extensions that CommonMark doesn't define.

If you encounter any nonconformities please log an issue or a PR even.

### Edge cases

The cases below are all tested:

| Markdown | Naive output would mean | What md2org emits |
|---|---|---|
| a language-tagged fence containing `#+END_SRC` | block ends early, rest of the file is body text | `,#+END_SRC` (comma-quoted) |
| `` `a=b` `` | verbatim ending at the first `=` | falls back to `~a=b~` |
| `]` in a link path | the link ends early | percent-encoded by the parser |
| `]]` in a link description | the link ends early | broken with `\zwnj{}` |

### Testing

```sh
npm test
```

`npm test` runs five tiers, in order:

- **`test/spec.js`** — the behavioural contract. Every mapping in
  [FEATURES.md](FEATURES.md) has a case here. Also checks that every output is
  valid Org, and that the browser and Shortcut copies convert identically to
  `src/`, which is what the README promises about the three interfaces.
- **`test/cli.js`** — the CLI contract, shelling out to `bin/md2org` for real:
  argument handling, exit statuses, and which stream each kind of output goes to.
- **`test/conformance.js`** — CommonMark conformance, 651/652, measured against
  the spec's own Markdown/HTML pairs run as data.
- **`test/gfm.js`** — GFM table conformance, 8/8, against the GFM spec's examples.
- **`test/fuzz.js`** — generates 5,000 documents from a fragment corpus and
  asserts that every output is structurally valid Org. `npm run fuzz` runs 100,000.
- **`test/size.js`** — asserts `shortcut/transform.js` still fits the shape known
  to paste into the Actions app. See [FEATURES.md](FEATURES.md#bytes-budget).

The specifications the first three measure against are in
[`specs/`](specs/README.md), committed unmodified.

`npm test` needs no build tools — only `node build.js` does, and only when you
change `src/`. So the suite runs anywhere Node does, including on a tablet where
esbuild has no binary. CI covers the other half, rebuilding the derived copies and
the forked parser and failing on any byte difference.

## Building

`src/` is several modules; `build.js` concatenates them into the browser and
Shortcut copies. Run it after editing anything in `src/`:

```sh
node build.js
```

The CommonMark parser in `src/vendor/` is generated and committed. You only need
`node tools/build-vendor.js` if you want to regenerate it.

### Size limit on the iOS Shortcut

The iOS Shortcut is the tightest constraint in the project. Pasting
`shortcut/transform.js` into the Actions app's JavaScript code field crashes the
Shortcuts editor if the file's byte count, line count or line length is too great
— and wrapping narrower makes it worse, not better, because many short lines crash
where a few long ones don't. That's why the Shortcut copy is minified while the
browser copy is not, and why new features are costed in bytes in
[FEATURES.md](FEATURES.md#bytes-budget). `npm test` asserts all three dimensions.

I've tested on iOS 26.3.1(a) and 26.6.1 (iPhone 14).  If you hit this issue on your device, please open an issue with your iOS version. Might not be fixable 🙁. 


## License

MIT
