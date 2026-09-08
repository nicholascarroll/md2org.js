/*
 * The whole of the escaping in md2org.
 *
 * DESIGN.md: "Source text that isn't Markdown markup passes through unchanged."
 * So there is no escaping of literal text at all. Everything below is either
 * Org's own quoting mechanism, or is needed because markup md2org *generates*
 * would otherwise break on the content it wraps.
 *
 * Earlier versions escaped literal text with entities — \ast{}, \colon{},
 * \zwnj{} — so that Org would render it the way Markdown rendered it. That is a
 * rendering-equivalence standard, and it is not what the tool promises. The .org
 * file is the deliverable, not a later export of it.
 */

/* --8<-- core start */

/*
 * Block bodies. §Lesser Elements: a line beginning with "*" or "#+" inside a
 * block must be quoted with a comma, or Org reads it as a headline or as the
 * block's own end delimiter. This is Org's mechanism and Org reverses it on read.
 *
 * Mirrors org-escape-code-in-string: quote only when the line, after any commas
 * already there, begins with "*" or "#+". A bare leading comma is no hazard, and
 * quoting it is not reversible — Org strips a comma only from ",*" and ",#+"
 * lines, so ",foo" would stay ",,foo". CSV and comma-first code hit that.
 */
function protectBlockBody(text) {
  return text.split("\n").map(function (line) {
    return line.replace(/^([ \t]*)(,*)(\*|#\+)/, "$1$2,$3");
  }).join("\n");
}

/*
 * Code spans. §Text Markup: CONTENTS may not contain the MARKER, so a span
 * holding "=" uses "~" and vice versa. A span holding both cannot be an Org
 * object at all: entities are not expanded inside verbatim or code, so
 * "\equal{}" would be displayed literally. Same resolution as a pipe inside code
 * in a table cell — drop the monospace, keep the characters right.
 */
function codeSpan(text) {
  if (text.indexOf("=") === -1) return "=" + text + "=";
  if (text.indexOf("~") === -1) return "~" + text + "~";
  return text;
}

/*
 * Table cells. §Table: a bare "|" ends the cell, and Org gives a cell no escape
 * syntax at all — not even a backslash, which Org leaves in the field as a
 * literal character while still splitting on the pipe.
 *
 * So nothing here can make the table come out right, and md2org does not
 * pretend otherwise. GFM makes the author write "\|", the parser consumes the
 * backslash as Markdown escape markup, and this puts it back: what the author
 * typed is what appears in the output. DESIGN.md lists the construct under
 * "Pass through, with a warning" for exactly this reason — the table breaks, the
 * characters survive, and the footer says so.
 *
 * This is the last of md2org's escapes to go. The \vert{} entity that used to
 * live here, and the \zwnj{} that separated "]]" in a link description, were
 * both markup md2org generated to protect markup md2org generated, and both
 * could be captured by an author's own "=" or "~" and printed in the reader's
 * face. md2org now generates no Org entities at all.
 */
function escapeCell(text) {
  return String(text).replace(/\|/g, "\\|");
}

/*
 * Link paths. §Regular Link sanctions a backslash escape for "]" and "\" inside
 * PATHREG, which is the one place Org has one.
 *
 * PATHREG also decides what KIND of link this is, and the default is not the one
 * Markdown means. A bare "url" or "a/b.md" matches none of the annotated patterns
 * except FUZZY, so Org reads it as a search for a headline of that name in the
 * same document, and export fails with "Unable to resolve link". Markdown means a
 * relative URL. "(foo)" is worse: it matches CODEREF.
 *
 * So anything that is not already unambiguous gets the "file:" LINKTYPE, which is
 * what Org uses for a relative path. Left alone: a path with its own LINKTYPE
 * ("http:", "mailto:", "id:"), one that starts with "/", "~", "./" or "../" and so
 * is already FILENAME, and "#anchor", which is CUSTOM-ID.
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
