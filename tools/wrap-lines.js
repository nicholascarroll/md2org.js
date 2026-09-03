/*
 * Breaks long lines in minified JavaScript, without changing what it means.
 *
 * Why this exists: pasting the generated Shortcut copy into the Actions app's code
 * field crashed the Shortcuts editor. The file was the right size but the wrong
 * shape — esbuild emits the parser as a few very long lines (one was 11,446
 * characters), and a syntax-highlighting text field has to lay each line out as a
 * unit. esbuild's own --line-limit gets most of the way but won't split an array
 * of regex literals, which left one 422-character line.
 *
 * BOTH EXTREMES CRASH. Wrapping to ~80 columns fixed the long-line crash and
 * caused a different one: it put every build at 400+ lines, and a ~36,900-byte
 * file pastes at 97 lines but crashes at 369. The full measurement table is in
 * test/size.js. build.js targets 400 columns. Do not "fix" a paste crash by
 * wrapping narrower — that makes it worse.
 *
 * Splitting minified JS is only safe if you know where you are: a ";" inside a
 * string or a regex character class is not a statement separator. So this tracks
 * string, template, regex and character-class state and only breaks outside all of
 * them. Distinguishing a regex literal from division uses the standard heuristic —
 * a "/" is division only when it follows something that can end an expression.
 *
 * Correctness is not assumed. The full test suite, the 651/652 conformance check
 * and the corpus parity check in build.js all run against the wrapped output, so a
 * bad break fails loudly rather than shipping.
 */

// Characters that, as the last non-space character, mean a following "/" is
// division rather than the start of a regex literal.
function endsExpression(ch) {
  return /[\w$)\]]/.test(ch);
}

function wrapLines(src, limit) {
  limit = limit || 100;
  let out = "";
  let lineLen = 0;
  let i = 0;
  let lastSignificant = "";

  let inString = null;   // quote character, when inside a string
  let inTemplate = false;
  let inRegex = false;
  let inClass = false;   // inside [...] within a regex
  let escaped = false;

  while (i < src.length) {
    const c = src[i];

    if (c === "\n") {
      out += c;
      lineLen = 0;
      i++;
      continue;
    }

    out += c;
    lineLen++;
    i++;

    if (escaped) { escaped = false; lastSignificant = c; continue; }
    if (c === "\\") { escaped = true; continue; }

    if (inString) {
      if (c === inString) inString = null;
      continue;
    }
    if (inTemplate) {
      if (c === "`") inTemplate = false;
      continue;
    }
    if (inRegex) {
      if (c === "[") inClass = true;
      else if (c === "]") inClass = false;
      else if (c === "/" && !inClass) inRegex = false;
      continue;
    }

    // Not inside anything: opening delimiters.
    if (c === '"' || c === "'") { inString = c; continue; }
    if (c === "`") { inTemplate = true; continue; }
    if (c === "/") {
      if (!endsExpression(lastSignificant)) { inRegex = true; continue; }
    }

    if (!/\s/.test(c)) lastSignificant = c;

    // A break is safe here. Only take it once the line is long enough, so the
    // output stays compact.
    if ((c === ";" || c === ",") && lineLen >= limit) {
      out += "\n";
      lineLen = 0;
    }
  }

  return out;
}

module.exports = wrapLines;
module.exports.wrapLines = wrapLines;
