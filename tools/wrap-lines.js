/*
 * Breaks long lines in minified JavaScript without changing its meaning.
 *
 * Long lines crash the Shortcuts editor when the Shortcut copy is pasted into
 * the Actions code field, but so do too many lines, so wrapping narrower is not
 * a remedy. build.js wraps at 400 columns; test/size.js holds the measurements.
 *
 * Breaks are taken only after ";" or "," outside strings, template literals,
 * regex literals and regex character classes. A "/" is treated as division when
 * it follows a character that can end an expression, and as a regex otherwise.
 * The test suite and build.js's parity check run against the wrapped output.
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
