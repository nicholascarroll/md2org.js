# Changelog


## [Unreleased]

### Added


### Changed


### Fixed


## [1.1.0] — 2026-09-08

### Added
- Character references now pass through as the author wrote them, named and
  numeric alike: `&mdash;`, `&#8212;` and `&#x2014;` all reach the Org file
  untouched. Decoding the numeric ones produced characters that are Org syntax —
  `&#42; foo` became a level-1 headline, and `&#35; foo` became a comment, which
  dropped the line from every export without a warning.
- `md2org -e` on the CLI, and a checkbox on the web page, decode HTML entities
  and numeric character references to the characters they name. Off by default on
  every target: the iOS Shortcut cannot carry the 123 KB entity table, and
  `build.js` proving that the three copies convert identically is worth more than
  saving a flag. Conformance with the option on is 652/652, asserted alongside the
  default's 639/652.
- Warnings Footer covers five more constructs that Org parses differently from
  the way the source reads: `]]` in a link description, `\|` in a table cell, a
  stray `#+BEGIN_`/`#+END_` line, `[[Some Page]]`, and a line Org reads as a
  comment. The last of those is reached by `\#`, CommonMark's own escape for a
  literal hash at line start: the bare `#` left after the parser consumes the
  backslash is an Org comment, so the line was leaving every export with no
  notice and every character still present in the file.
- `test/warnings.js` — the first tier to test DESIGN.md invariant 4. Asserts a
  warning for every construct in the warned table, and accounts for every
  headline in the output against the headings in the source, so one that appears
  by an unforeseen route fails without anyone having predicted the route.
- `test/invariant.js` — invariant 1 as a property test, run by the fuzzer on
  every document it generates rather than on a fixture list.
- `test/document.js` — document-scale inputs, the repository's own Markdown.
- Document-scale export checks in `test/emacs.js`, which now runs as part of
  `npm test` and is skipped when Emacs is absent. CI installs it.

### Changed
- Warnings Footer now reports per warning category.
- md2org generates no Org entities. `\vert{}` and `\zwnj{}` are gone: each was
  markup generated to protect markup generated, and each could be captured by an
  author's own `=` or `~`, at which point Org printed it to the reader instead of
  expanding it. Both constructs now pass through and are warned.
- A code span holding `]]` in a link description keeps its monospace. It only
  ever lost it so the escape could be applied outside the delimiters.
- CommonMark conformance is 639/652, from 651/652. All thirteen exceptions are
  the same decision: character references are not decoded.
- The fuzzer generates nested documents, so a construct can appear inside
  another. The previous generator could not express the shape the 1.0.1 `]]`
  defect lived in.
- `ACCEPTED` in `test/fuzz.js` is split from a new `KNOWN_OPEN`. The first is a
  decision the design made; the second is a defect nobody has decided anything
  about. `KNOWN_OPEN` is currently empty.

### Fixed
- #1 `[Foo](#foo)` used to produce a link and now produces plain text.
- A multi-line setext heading dropped every line after the first out of the
  headline, truncating the heading and leaving the rest as body text; a
  continuation beginning `** ` became a second headline that claimed the
  following sections. A soft break inside heading content now folds to a space,
  as pandoc does. Present since before 1.0.1 and found by `test/warnings.js`.
- The `heading` warning missed several routes to a headline: a line emitted from
  inside a footnote definition, a line inside a block quote, and a line whose
  leading asterisks are strong-emphasis markup md2org generated itself, as in
  `__** * **__`. It now tests the finished line and exempts only a headline
  md2org declared, rather than inferring authorship after the fact. Found by
  `test/warnings.js` at fuzz depth.
- `test/org-validate.js` honoured neither half of Org's rule that verbatim
  contents may not begin or end with whitespace, so `= x =` was reported as a
  verbatim span when Org does not read it as one.


## [1.0.1] — 2026-09-06

### Added
- Entities md2org adds are now reported in the warnings footer.

### Changed
- `shortcut/transform.js` header comment now shows md2org version.

### Fixed
- A bare relative link path such as `[foo](url)` or `[foo](a/b.md)` became a fuzzy Org link, which Org reads as a search for a headline of that name. Export failed This  affected 26 of the 652 CommonMark spec examples.
- The web page's Copy button did nothing in Chromium browsers over plain http,
  where `navigator.clipboard` is undefined. It now falls back and reports failure.
- A code span containing `]]` inside a link description ended the link early,
  producing invalid Org. The span now unwraps (monospace lost, characters kept).

## [1.0.0] — 2026-09-06

First release. Markdown to Org conversion at the command line, in the browser, and
via an iOS Shortcut.

### Added
- `md2org --version` / `-v`.
- `CHANGELOG.md`
- CI, and a CLI test tier.

### Changed
- DESIGN.md, FEATURES.md and README.md reconciled with the code: the escaping
  table now lists every escape the program performs.
- specs in test directory moved to spec

### Fixed
- The CLI ignored unknown options and then waited on stdin, so a typo hung.
  Usage errors now exit 2.
- The CLI wrote no trailing newline, leaving a malformed text file.
- `npm test` needed esbuild and so could not run where esbuild has no binary. The
  derived-copy check now compares behaviour instead of rebuilding; CI still
  asserts byte-identity.
- `shortcut/transform.js` size reduced by removing dead code.

### Removed
- Dead code in `src/org-render.js` left from the pre-fork design

## Guidelines for updating this document
Only user facing changes to this project are documented here. Entries are very brief summaries.

For a converter, "the public API" is the mapping in [FEATURES.md](FEATURES.md) as much as it is the `md2org(string)` function. A change to what a given Markdown construct becomes in Org is a change users will notice in their files, so it is treated as breaking unless the previous output was invalid Org or plainly wrong.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

[1.0.1]: https://github.com/nicholascarroll/md2org.js/releases/tag/1.0.1
[1.0.0]: https://github.com/nicholascarroll/md2org.js/releases/tag/1.0.0
