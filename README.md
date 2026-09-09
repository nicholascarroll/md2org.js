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

```sh
npm install -g md2org
```
Usage: 

```sh
md2org notes.md > notes.org
cat notes.md | md2org
md2org < notes.md
md2org --help
md2org --version
```

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
# heading: line 2
```
This is warning you that line 2 of your output was not a heading in the source but has become a heading in the output. 

If you see this: 

```
# md2org warnings:
# \| in a table cell: line 3
```
It is because the source Markdown had `\|` in a table cell. 


## Known lossy conversions

- Intraword emphasis `a**b**c` becomes `a*b*c`.
- Link titles: `[t](/u "title")` loses the title.
- `+ item` becomes `- item` and `_em_` becomes `/em/`. 
- Raw HTML. Blocks become `#+BEGIN_EXPORT html`
- inline HTML becomes  `@@html:…@@`. 
- Named entities such as `&mdash;` and `&HilbertSpace;` pass through as you wrote them. Numeric references such as `&#65;` still resolve.

## Correctness

md2org.js forks and modifies the reference [CommonMark](https://spec.commonmark.org/0.31.2/) parser, and passes 645 of the specification's 652 test cases. 

Tables and footnotes are [GitHub Flavoured Markdown](specs/gfm-spec-0.29.txt) extensions that CommonMark doesn't define.

If you encounter any nonconformities please log an issue or a PR even.

### Edge cases

The cases below are all tested:

| Markdown | Naive output would mean | What md2org emits |
|---|---|---|
| a language-tagged fence containing `#+END_SRC` | block ends early, rest of the file is body text | `,#+END_SRC` (comma-quoted) |
| `` `a=b` `` | verbatim ending at the first `=` | falls back to `~a=b~` |
| `]` in a link path | the link ends early | percent-encoded by the parser |
| `]]` in a link description | the link ends early | passed through and warned |

### Testing

```sh
npm test
```

`npm test` runs five tiers, in order:

- **`test/spec.js`** — the behavioural contract. Every mapping in
  [FEATURES.md](FEATURES.md) has a case here. Also checks that every output is
  valid Org, and that the browser and Shortcut copies convert identically to
  `src/`.
- **`test/cli.js`** — the CLI contract, tests `bin/md2org` in the shell.
- **`test/conformance.js`** — CommonMark conformance, 645/652, measured against
  the spec's own Markdown/HTML pairs run as data.
- **`test/gfm.js`** — GFM table conformance, 8/8, against the GFM spec's examples.
- **`test/fuzz.js`** — generates 5,000 documents from a fragment corpus and
  asserts that every output is structurally valid Org. `npm run fuzz` runs 
  100,000.
- **`test/size.js`** — asserts `shortcut/transform.js` still fits into the
  Actions app. See [FEATURES.md](FEATURES.md#bytes-budget).

Optional (**not** run by `npm test`):

```sh
npm run test:emacs
```

If Emacs is installed, `test/emacs.js` feeds the output to a real Org parser and checks that Org finds the structure md2org intended.

The specifications the first three measure against are in [`specs/`](specs/README.md), committed unmodified.


## Building

`src/` is several modules; `build.js` concatenates them into the browser and
Shortcut copies. Run it after editing anything in `src/`:

```sh
node build.js
```

The CommonMark parser in `src/vendor/` is generated and committed. You only need
`node tools/build-vendor.js` if you want to regenerate it.

### Size limit on the iOS Shortcut

The iOS Shortcut is extremely tightly constrained by a size limit for the md2org core code `shortcut/transform.js`: when pasting its contents into the Actions app's JavaScript code field, the Shortcuts editor crashes. There is a limit on lines and on bytes. For that reason the Shortcut copy is minified and new features are costed in bytes in [FEATURES.md](FEATURES.md).

I've tested on iOS 26.3.1(a) and 26.6.1 (iPhone 14).  If you hit this issue on your device, please open an issue with your iOS version. Might not be fixable 🙁. 


## License

MIT
