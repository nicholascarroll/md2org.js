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
 * Rows marked "~" predate byte-exact records. The shipped row is the reference for
 * bytes and lines: it is the build that was pasted successfully and used to
 * generate shortcut/md2org.shortcut, so it is the one shape known to work end to
 * end. The column limit is 632 rather than its 631, from the row above it — the
 * minifier reassigns identifier names on any change to src/, which moves the
 * longest line by a character or two in either direction for no reason worth
 * chasing, and 632 was measured as pasting.
 *
 * Two lessons from the crashes. Many short lines are worse than few long ones —
 * ~36,900 bytes pastes at 97 lines and crashes at 369 — so wrapping narrower
 * makes a file MORE likely to crash, not less. And both extremes crash: an early
 * build put the parser on a single 11,446-character line and died at a total size
 * that otherwise pasted fine. A few hundred characters per line is the safe zone,
 * which is what build.js targets.
 *
 * Raise these numbers only by pasting a bigger file and having it work, and never
 * by taking the best number from two different measurements — no file combining
 * 40,063 bytes with 118 lines and 631 columns has ever been pasted.
 */
const fs = require("fs");
const path = require("path");

// Bytes and lines from the shipped build; columns from the widest measured paste.
// See the table above.
const LIMIT_BYTES = 39054;
const MAX_LINES = 115;
const MAX_LINE = 632;
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
              " of the shipped build. See FEATURES.md for what can be cut.");
  bad++;
} else if (bytes > WARN_BYTES) {
  console.log("  NOTE within " + (LIMIT_BYTES - WARN_BYTES) +
              " bytes of the limit — the next feature needs a cut to pay for it.");
}

if (lines.length > MAX_LINES) {
  console.log("  FAIL " + lines.length + " lines, over the " + MAX_LINES +
              " of the shipped build. Long lines are cheap and many lines are not; " +
              "raise the wrap width in build.js rather than cutting features.");
  bad++;
}

if (longest > MAX_LINE) {
  console.log("  FAIL longest line is " + longest + " characters, over the " + MAX_LINE +
              " measured as pasting. Long lines crash the Shortcuts editor " +
              "independently of total size; check tools/wrap-lines.js.");
  bad++;
}

process.exit(bad ? 1 : 0);
