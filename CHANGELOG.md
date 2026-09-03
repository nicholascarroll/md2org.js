# Changelog

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

[1.0.0]: https://github.com/nicholascarroll/md2org.js/releases/tag/1.0.0
