/*
 * Shape guard for the iOS Shortcut copy (DESIGN.md, Constraints).
 *
 * Bytes, line count and line length can each crash the Shortcuts editor when
 * shortcut/transform.js is pasted into the Actions code field, and they interact.
 * Measured on one device (iPhone 14, iOS 26.x) by pasting files of known shape:
 *
 *      bytes     lines   longest    result
 *    ~18,400       378        56    pasted
 *    ~36,900        97       400    pasted
 *    ~36,900       369       100    CRASHED
 *    ~39,500       469       392    CRASHED
 *    ~39,800       469       392    CRASHED
 *     38,875       117       493    pasted
 *     39,625       118       422    pasted
 *     40,063       115       500    pasted
 *     38,581       113       632    pasted
 *     39,054       115       631    pasted   <- reference build
 *
 * "~" marks an approximate figure. The reference build is the one used to
 * generate shortcut/md2org.shortcut. Many short lines are worse than few long
 * ones, and a single very long line also crashes.
 *
 * These limits can be changed only by pasting a build on a device. If this test
 * fails, paste the current shortcut/transform.js: if it pastes, add a row and move
 * the limit to it, recording the device and iOS version; if it crashes, the build
 * must shrink. Never raise a limit without a measurement, and never combine
 * figures from different rows.
 */
const fs = require("fs");
const path = require("path");

// Bytes and lines are measured limits from the reference build.
//
// MAX_LINE is not a device limit; no paste has failed on line length alone
// below 632. It detects esbuild's lineLimit in build.js's minify() no longer
// being applied, which would produce lines of over 11,000 characters.
const LIMIT_BYTES = 39054;
const MAX_LINES = 115;
const MAX_LINE = 2000;  // tripwire for wrap-lines failing, not a device limit
const WARN_BYTES = LIMIT_BYTES - 500;

const file = path.join(__dirname, "..", "shortcut", "transform.js");
const bytes = fs.statSync(file).size;
const lines = fs.readFileSync(file, "utf8").replace(/\n$/, "").split("\n");
const longest = Math.max(...lines.map(l => l.length));

let bad = 0;

console.log("SIZE           " + bytes + " bytes of " + LIMIT_BYTES +
            "   (" + (LIMIT_BYTES - bytes) + " to spare)");
console.log("               " + lines.length + " lines of " + MAX_LINES +
            ", longest " + longest + " of " + MAX_LINE);

if (bytes > LIMIT_BYTES) {
  console.log("  FAIL " + bytes + " bytes, over the " + LIMIT_BYTES +
              " of the shipped build. This needs a fresh paste on a device, not a " +
              "bigger number here — see the note at the top of this file.");
  bad++;
} else if (bytes > WARN_BYTES) {
  console.log("  NOTE within " + (LIMIT_BYTES - WARN_BYTES) +
              " bytes of the limit — the next feature needs a cut to pay for it.");
}

if (lines.length > MAX_LINES) {
  console.log("  FAIL " + lines.length + " lines, over the " + MAX_LINES +
              " of the shipped build. Line count is the dimension that has actually " +
              "crashed the editor, so this needs a fresh paste on a device — see the " +
              "note at the top of this file. Long lines are cheap and many lines are " +
              "not, so widening the wrap in build.js buys room; narrowing it costs room.");
  bad++;
}

if (longest > MAX_LINE) {
  console.log("  FAIL longest line is " + longest + " characters. That is far past " +
              "anything the build should produce, so the lineLimit in build.js's " +
              "minify() is not being applied — check that before looking at the device.");
  bad++;
}

process.exit(bad ? 1 : 0);
