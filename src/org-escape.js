/*
 * All of md2org's escaping (DESIGN.md, Escaping).
 *
 * Literal text is not escaped. Each function below either applies Org's own
 * quoting mechanism or protects markup that md2org generates.
 */

/* --8<-- core start */

/*
 * Block bodies (§Lesser Elements). A line beginning with "*" or "#+" inside a
 * block is comma-quoted, or Org reads it as a headline or a block delimiter. Org
 * removes the comma on read.
 *
 * Mirrors org-escape-code-in-string: quote only when the line, after any existing
 * commas, begins with "*" or "#+". Org strips a comma only from such lines, so
 * quoting ",foo" would not be reversed.
 */
function protectBlockBody(text) {
  return text.split("\n").map(function (line) {
    return line.replace(/^([ \t]*)(,*)(\*|#\+)/, "$1$2,$3");
  }).join("\n");
}

/*
 * Code spans (§Text Markup). CONTENTS may not contain the MARKER, so a span
 * holding "=" uses "~" and vice versa. A span holding both is returned as plain
 * text, since entities are not expanded inside verbatim or code.
 */
function codeSpan(text) {
  if (text.indexOf("=") === -1) return "=" + text + "=";
  if (text.indexOf("~") === -1) return "~" + text + "~";
  return text;
}

/*
 * Table cells (§Table). A bare "|" ends a cell and Org has no escape for it.
 * The parser consumes the backslash of GFM's "\|"; this restores it, so the
 * output shows what the author typed. The renderer warns.
 */
function escapeCell(text) {
  return String(text).replace(/\|/g, "\\|");
}

/*
 * Link paths (§Regular Link). "[", "]" and "\" in PATHREG are backslash-escaped,
 * the only escape Org provides there.
 *
 * A bare path such as "url" or "a/b.md" would be a FUZZY link (a headline
 * search), and "(foo)" a CODEREF, so any path without an explicit type gets
 * "file:", Org's type for a relative path. Unchanged: a path with its own
 * LINKTYPE ("http:", "mailto:", "id:"), a FILENAME starting with "/", "~", "./"
 * or "../", and a "#" CUSTOM-ID.
 */
function linkType(path) {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)   // LINKTYPE:...
      || /^[/~#]/.test(path)                      // FILENAME or #CUSTOM-ID
      || /^\.\.?\//.test(path);                    // ./ or ../ FILENAME
}

function escapeLinkPath(path) {
  var p = String(path);
  if (p && !linkType(p)) p = "file:" + p;
  return p.replace(/([\[\]\\])/g, "\\$1");
}

/* --8<-- core end */

module.exports = { protectBlockBody: protectBlockBody, codeSpan: codeSpan,
                   escapeLinkPath: escapeLinkPath, escapeCell: escapeCell };
