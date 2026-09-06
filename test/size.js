/*
 * Shape guard for the iOS Shortcut copy.
 *
 * The Actions app's code field is the binding constraint on this project, and
 * what crashes it is the file's SHAPE rather than its size alone: bytes, line
 * count and line length each matter, and they interact. Measured on one device
 * (iPhone 14, iOS 26.x) by pasting files of known dimensions:
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
 *     39,054       115       631    pasted   <- shipped, built the .shortcut binary
 *
 * Rows marked "~" predate byte-exact records. The shipped row is the reference:
 * it is the build that was pasted successfully and used to generate
 * shortcut/md2org.shortcut, so it is the one shape known to work end to end.
 *
 * Two lessons from the crashes. Many short lines are worse than few long ones —
 * ~36,900 bytes pastes at 97 lines and crashes at 369 — so wrapping narrower
 * makes a file MORE likely to crash, not less. And both extremes crash: an early
 * build put the parser on a single 11,446-character line and died at a total size
 * that otherwise pasted fine. A few hundred characters per line is the safe zone,
 * which is what build.js targets.
 *
 * ---------------------------------------------------------------------------
 * HOW THESE NUMBERS CAN CHANGE
 *
 * Every row above came from a person pasting a file into the Actions app on a
 * physical iPhone and seeing what happened. There is no other way to obtain one.
 * The test suite cannot measure this, CI cannot measure this, and neither can
 * anyone reading the code: the Shortcuts editor is the instrument, and pasting is
 * the experiment.
 *
 * So a FAIL here is not a defect report. It is this file saying the build has left
 * the region someone has actually stood in, and asking for a fresh measurement.
 * The response is to paste the current shortcut/transform.js on a device:
 *
 *   - if it pastes, that is a new row. Add it, move the limit to it, and say
 *     which device and iOS version it came from.
 *   - if it crashes, the ceiling is below the current build and something has to
 *     come out. See FEATURES.md for what can be cut.
 *
 * What must NOT happen is the limit being raised to make the suite green. A number
 * nobody has pasted is not a measurement, and the whole value of this file is that
 * every number in it is one. Never combine the best figure from two different
 * rows either — no file holding 40,063 bytes at 118 lines has ever been pasted,
 * so that shape is not known-good, it is merely arithmetic.
 * ---------------------------------------------------------------------------
 */
const fs = require("fs");
const path = require("path");

// Bytes and lines are measured. They come from the shipped build in the table
// above, and they move only the way the note there describes.
//
// MAX_LINE is NOT measured, and is a different kind of thing. No paste has ever
// been observed to fail on column count: 422, 493, 500, 631 and 632 all went in.
// The one column-driven crash was a build with the whole parser on a single
// 11,446-character line, which is a different phenomenon from a line being a bit
// long. Meanwhile the number drifts on its own — the longest line is one
// unbreakable regex from the forked parser (the HTML block tag list, about 390
// characters, holding no comma or semicolon outside a string, so
// tools/wrap-lines.js cannot split it) preceded by minified identifier names that
// the minifier reassigns on any change to src/.
//
// So this is a tripwire, not a limit. What it guards is esbuild's lineLimit in
// build.js's minify(), which is what actually bounds THIS file — wrap-lines runs
// earlier and its output is re-flowed by the minifier, so it governs the
// unminified docs/md2org.js instead. Remove that lineLimit and transform.js comes
// out as 28 lines with a longest of 11,472, which is the same shape as the
// 11,446-character build in the table above that crashed the editor. Verified by
// doing exactly that.
//
// Treat a failure here as "the minifier stopped wrapping", not as "we are near a
// device ceiling" — the device ceiling for columns, if there is one, has never
// been found.
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
