/*
 * org-render — walks a CommonMark AST and emits Org.
 *
 * Every literal string leaves through org-escape, so this file is about structure:
 * the block-context stack, indentation, and blank lines.
 *
 * Two things here are easy to get subtly wrong and are worth naming:
 *
 * 1. The column-0 guard applies to *literal text only*. Applying it to a finished
 *    line would escape the converter's own markup — a paragraph beginning with
 *    bold would have its opening "*" turned into an entity.
 *
 * 2. Blank lines follow the source, using sourcepos, rather than being emitted at
 *    every block boundary. Inventing one after each block reflows the document.
 *
 * Where a construct has no faithful Org form the choice is recorded in a comment
 * rather than made silently.
 */

/* --8<-- core start */

function fnLabel(s) {
  return String(s).trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "fn";
}

function renderOrg(ast, esc) {
  // GitHub renders a reference as a footnote only when a matching definition
  // exists, so the whole tree has to be seen before any reference is decided.
  // Two distinct labels can sanitise to the same Org label ("x y" and "x-y"),
  // which would merge two footnotes into one, so collisions get a counter.
  var defined = {}, taken = {}, w0 = ast.walker(), e0, raw, lab, n;
  while ((e0 = w0.next())) {
    if (!e0.entering || e0.node.type !== "footnote_definition") continue;
    raw = e0.node._label;
    if (defined[raw] !== undefined) continue;
    lab = fnLabel(raw); n = 1;
    while (taken[lab]) { n++; lab = fnLabel(raw) + "-" + n; }
    taken[lab] = 1;
    defined[raw] = lab;
  }
  function fnRef(r) { return defined[r] !== undefined ? defined[r] : null; }

  if (!renderOrg.warn) renderOrg.warn = {};
  var out = [];
  var line = "";
  var indent = [];
  var listStack = [];
  var linkDepth = 0;    // inside a link description
  var nestedSkip = 0;
  var bareDesc = 0;
  var emptyDesc = 0;   // inside a nested image whose children are suppressed
  var atLineStart = true;   // nothing but indentation emitted on this line yet
  var inPara = false;       // inside a paragraph, where footnotes are recognised
  var lastEnd = 0;          // source line on which the previous block ended
  var inCell = false;
  var inFnDef = false;
  var quoteDepth = 0;       // inside a quote block
  var boldHeading = 0;      // current heading is being written as bold text
  var inHeading = 0;        // inside a heading node
  var authored = false;     // this line carries text the author wrote
  var authoredLine = "";    // just the authored part of it
  var declaredHeadline = false;  // md2org emitted a headline on this line, on purpose
  var descStart = -1;       // index in the current line where the description begins
  function warnAt(k) {
    var a = renderOrg.warn[k] || (renderOrg.warn[k] = []), n = out.length + 1;
    if (a[a.length - 1] !== n) a.push(n);
  }

  function pad() { return indent.join(""); }

  // DESIGN.md invariant 4: source text that changes how Org parses the document
  // is reported. Detected by comparing an escape's input with its output rather
  // than by scanning the finished line, so an author who writes the same
  // characters in their Markdown is not blamed for them.
  function ent(before, after, name) {
    if (before !== after) warnAt(name);
    return after;
  }
  function push(s) { if (s) { line += s; atLineStart = false; } }

  function endLine() {
    // GFM task list. CommonMark does not parse these, so the box arrives as
    // bracket text nodes and can only be seen once the line is assembled. Org
    // recognises "[X]" and not "[x]".
    if (listStack.length) line = line.replace(/^(\s*(?:-|\d+\.) )\[x\] /, "$1[X] ");
    // A body line Org will read as a headline the Markdown never declared. Left
    // alone - the contract leaves non-Markdown alone - but recorded, because it
    // is the one pass-through construct that re-parents the document. Output line
    // numbers, so they are true for the file the reader is holding.
    //
    // Unconditional on the line, with one exemption: a headline md2org declared.
    //
    // The question is not who wrote the asterisks, it is what Org will do with the
    // line, and only the line can answer that. Every attempt to infer authorship
    // instead got it wrong in one direction or the other. "inPara && !pad()" stood
    // in for "starts at column 0" and missed a line emitted from inside a footnote
    // definition, where the indent is consumed and the paragraph flag says nothing
    // useful. Testing the authored text for the pattern blamed md2org for a setext
    // heading whose first words are bold. Testing the column where authored text
    // begins missed "__** * **__", where the leading asterisks are emphasis markup
    // md2org generated — nobody wrote them and Org still reads a headline.
    //
    // So everything that reads as a headline is a finding unless md2org said
    // otherwise at the moment it emitted one, which is the only place the answer
    // is known for certain rather than reconstructed.
    if (!declaredHeadline && /^\*+\s/.test(line)) warnAt("heading");
    // A delimiter the author wrote, not one md2org emitted. It pairs with one
    // md2org did emit, opening or closing a block that was never meant to be
    // there. Only reachable from authored text: a block body is comma-quoted on
    // the way out, so a delimiter inside one no longer starts the line.
    if (authored && /^[ \t]*#\+(BEGIN|END)_/i.test(line)) warnAt("stray block delimiter");
    // Org reads "[[…]]" as a link the Markdown never declared. Tested against the
    // authored text alone, because every link md2org emits is "[[…][…]]" and would
    // otherwise match.
    if (/\[\[[^\]]*\]\]/.test(authoredLine)) warnAt("[[ ]] read as an Org link");
    authored = false;
    authoredLine = "";
    declaredHeadline = false;
    out.push(line);
    line = "";
    atLineStart = true;
  }

  // A block that begins its own line must not land on a line another block left
  // open — an empty list item followed by a heading would otherwise emit "- * H",
  // burying the heading inside the item.
  function flush() { if (line !== "") endLine(); }

  function blank() {
    if (out.length && out[out.length - 1] !== "") out.push("");
  }

  // Emit the blank line separating this block from the previous one, but only if
  // the source had one.
  function spaceBefore(node) {
    var sp = node.sourcepos;
    if (!sp) { blank(); return; }
    if (lastEnd && sp[0][0] > lastEnd + 1) blank();
  }
  function noteEnd(node) {
    if (node.sourcepos) lastEnd = node.sourcepos[1][0];
  }

  // Literal text. Copied. The parser has already decided this is not markup, so
  // by the contract it is not ours to touch — see DESIGN.md. Text nodes are the
  // leaves of the tree, and re-serialising a tree copies its leaves.
  function text(s) {
    var t = inCell ? ent(s, esc.escapeCell(s), "\\| in a table cell") : s;
    // Accumulated rather than tested per node: a backslash escape becomes its own
    // text node, so "[a\\]\\]b](/u)" reaches here as "a", "]", "]", "b" and no
    // single node ever holds the "]]" that does the damage.
    authored = true;
    authoredLine += t;
    push(t);
  }

  // Close a bracket link. A description ending in "]" forms "]]" against the
  // closer and ends the link one character early. Nothing can be inserted to stop
  // it without generating an entity, so it is reported like any other "]]".
  function closeLink() {
    var desc = descStart >= 0 ? line.slice(descStart) : "";
    // Either the description already holds "]]", or it ends in "]" and forms one
    // against the closer. Same outcome: the link ends early and the remainder of
    // the description is left in the document as text.
    if (desc.indexOf("]]") !== -1 || desc.slice(-1) === "]")
      warnAt("]] in a link description");
    descStart = -1;
    push("]]");
  }

  function emitBlockLines(str) {
    str.replace(/\n$/, "").split("\n").forEach(function (l) {
      push(pad() + l);
      endLine();
    });
  }

  // Markdown HTML comments are not really HTML to an Org reader; they are
  // comments. Mapping them to Org's own comment syntax rather than to an export
  // block is a deliberate ergonomic choice, and is pinned by the test suite.
  function htmlComment(literal) {
    var raw = literal.replace(/\n$/, "");
    // Up to three spaces may precede any HTML block start condition, and the
    // literal keeps them, so an indented comment is the same construct as one at
    // column 0 and converts the same way.
    var open = /^ {0,3}<!--/.exec(raw);
    if (!open) return false;
    // CommonMark ends the block at the line "-->" is on, so the rest of that line
    // is in the literal and is visible in the Markdown. Folding it into a comment
    // deletes it, so hand anything with trailing content to the export block,
    // which keeps every byte.
    var cut = raw.indexOf("-->");
    if (cut !== -1 && !/^\s*$/.test(raw.slice(cut + 3))) return false;
    var body = raw.slice(open[0].length, cut === -1 ? undefined : cut);
    // A run of comment lines, not a comment block. Org strips "#" and one space
    // on read, so the body survives exactly -- blank lines, indentation and all
    // -- with no comma-quoting, which org-element-comment-block-parser does not
    // reverse the way it does for src, example and export. Nothing in the body
    // can start a line either, so "#+END_COMMENT" in a comment is inert and a
    // "*" line cannot become a headline.
    body.split("\n").forEach(function (l) {
      push(pad() + (l ? "# " + l : "#"));
      endLine();
    });
    return true;
  }

  var walker = ast.walker(), ev, node, type;

  while ((ev = walker.next())) {
    node = ev.node;
    type = node.type;

    switch (type) {
      case "text":
        if (nestedSkip === 0) text(node.literal, node);
        break;

      case "softbreak":
        // A definition is one line: Org ends it at a blank line, and a body
        // spread over several would swallow whatever followed.
        if (inFnDef) { push(" "); break; }
        // So is a headline (§Headings: a headline is a single line). CommonMark
        // allows a setext heading to span several — "foo\nbar\n===" is one h1 —
        // and emitting the break would drop every line after the first out of the
        // headline, truncating the heading and leaving the rest as body text. A
        // continuation beginning "** " became a second headline outright. Folded
        // to a space, which is what pandoc does with the same input.
        if (inHeading) { push(" "); break; }
        endLine();
        push(pad());
        atLineStart = true;
        break;

      case "linebreak":
        push("\\\\");
        endLine();
        push(pad());
        atLineStart = true;
        break;

      case "code":
        // A code span whose contents would break the markup wrapping it has to
        // lose its monospace. The escape cannot go inside the delimiters: entities
        // are not expanded within verbatim or code (§Text Markup: CONTENTS is a
        // string), so "\vert{}" or "\zwnj{}" there would be displayed literally.
        // Dropping the monospace and keeping the characters right is the same
        // resolution as a span holding both "=" and "~".
        //
        // A cell ends at a bare "|", and a backslash cannot go inside the
        // delimiters: §Text Markup makes CONTENTS a literal string, so "\\|" there
        // would be shown as written. The span loses its monospace and keeps its
        // characters, the same resolution as one holding both "=" and "~".
        //
        // "]]" in a span inside a link description needs no handling of its own
        // any more: it is passed through and reported like any other "]]", so the
        // monospace survives.
        var lit = node.literal, span, bare;
        if (inCell && lit.indexOf("|") !== -1) {
          span = ent(lit, esc.escapeCell(lit), "\\| in a table cell");
          bare = true;
        } else {
          span = esc.codeSpan(lit);
          // codeSpan keeps its delimiters unless the content holds both "=" and
          // "~", in which case the monospace is dropped and the characters go out
          // as themselves.
          bare = span === lit;
        }
        authored = true;
        // Only text that left without verbatim delimiters can be read as Org
        // markup. §Text Markup makes CONTENTS a literal string, so "[[x]]" inside
        // "=…=" is not a link, and reporting it is a false finding against an
        // invariant that is about the parse and nothing else. Verified against
        // Emacs: "=[[Some Page]]=" yields no link element.
        if (bare) authoredLine += span;
        push(span);
        break;

      case "emph":
        push("/");
        break;

      case "footnote_definition":
        if (ev.entering) {
          // Definitions on consecutive source lines still need separating: Org
          // ends one at the next definition, but a reader should not have to know.
          flush();
          if (node.prev && node.prev.type === "footnote_definition") blank();
          else spaceBefore(node);
          push(pad() + "[fn:" + fnRef(node._label) + "] ");
          inFnDef = true;
        } else {
          inFnDef = false;
          line = line.replace(/[ \t]+$/, "");
          // Org ends a definition at a blank line; without one the next
          // paragraph is absorbed into the footnote.
          endLine(); blank(); noteEnd(node);
        }
        break;

      case "footnote_reference":
        push(fnRef(node._label)
          ? "[fn:" + fnRef(node._label) + "]" : "[^" + node._label + "]");
        break;

      case "table":
        if (ev.entering) { flush(); spaceBefore(node); } else { noteEnd(node); }
        break;

      case "table_row":
        if (ev.entering) {
          push(pad() + "|");
        } else {
          endLine();
          // Org's rule row goes under the heading, and carries the column count.
          if (node._isHeading) {
            var segs = [], cookies = [], any = false, cell = node.firstChild;
            while (cell) {
              segs.push("----");
              cookies.push(cell._align === "center" ? " <c> "
                : cell._align === "right" ? " <r> "
                : cell._align === "left" ? " <l> " : " ");
              if (cell._align) any = true;
              cell = cell.next;
            }
            push(pad() + "|" + segs.join("+") + "|"); endLine();
            if (any) { push(pad() + "|" + cookies.join("|") + "|"); endLine(); }
          }
        }
        break;

      case "table_cell":
        // A bare "|" would end the cell. GFM makes the author escape it, so this
        // only fires on content that arrived as "\|" - and the table markup is
        // ours, so repairing it is not the escaping the contract forbids.
        inCell = ev.entering;
        if (ev.entering) push(" "); else push(" |");
        break;

      case "strikethrough":
        push("+");
        break;

      case "strong":
        push("*");
        break;

      // Links and images take the same path. An Org image is a link whose path is
      // displayable, so the only difference in Markdown — that an image renders
      // inline — is carried by the path, not by the syntax. Alt text becomes the
      // description; a Markdown title is dropped rather than folded into the path,
      // which is what produced broken links before.
      case "link":
      case "image":
        if (ev.entering) {
          if (linkDepth > 0) {
            // §Regular Link: a description may contain another link only as a
            // plain or angle link, and may never contain "]]". Nesting brackets
            // here would end the outer link early. A badge — an image inside a
            // link — is the common case: the description becomes the inner
            // destination run through escapeLinkPath, so a bare path picks up a
            // "file:" type ([[url][file:img.png]]) and an anchor or a URL keeps
            // the type it already had. The inner alt text has to go, which is the
            // exception named in invariant 1.
            push(esc.escapeLinkPath(node.destination));
            nestedSkip++;
          } else if (node.destination && !node.firstChild) {
            // A description must hold one or more objects, so "[[u][]]" is not a
            // link. The path-only form says the same thing and is valid.
            push("[[" + esc.escapeLinkPath(node.destination));
            emptyDesc++;
          } else if (!node.destination || node.destination[0] === "#") {
            // §Regular Link: PATHREG must match one of seven patterns and empty
            // is none of them, so "[[][t]]" is not a link at all. The
            // description is the only content there is; emit it as text.
            //
            // A "#anchor" link takes the same path. Markdown derives the target
            // from the heading text; Org requires it be declared as a CUSTOM_ID
            // property, and md2org does not add one. Emitting "[[#x][t]]" leaves
            // a link Org cannot resolve, and the exporter fails on the WHOLE
            // document rather than on the link -- one unresolvable anchor and
            // there is no output at all. Anchors are unsupported, so the
            // description is emitted as text and the document still exports.
            bareDesc++;
          } else {
            push("[[" + esc.escapeLinkPath(node.destination) + "][");
            if (linkDepth === 0) descStart = line.length;
          }
          linkDepth++;
        } else {
          linkDepth--;
          if (linkDepth > 0) nestedSkip--;
          else if (bareDesc) bareDesc--;
          else if (emptyDesc) { emptyDesc--; push("]]"); }
          else closeLink();
        }
        break;

      case "html_inline":
        // No Org object corresponds to raw inline HTML; an export snippet keeps it
        // for HTML export and hides it elsewhere.
        push("@@html:" + node.literal + "@@");
        break;

      case "html_block":
        flush();
        spaceBefore(node);
        if (!htmlComment(node.literal)) {
          push(pad() + "#+BEGIN_EXPORT html"); endLine();
          // An export block is a lesser block: its contents are raw text, so a
          // line starting with "*" or "#+" ends it early unless comma-quoted.
          // Same hazard as a source block, and it was missed here.
          emitBlockLines(esc.protectBlockBody(node.literal));
          push(pad() + "#+END_EXPORT"); endLine();
        }
        noteEnd(node);
        break;

      case "paragraph":
        if (ev.entering) {
          // A loose list keeps its blank lines: dropping them merged two
          // paragraphs of an item into one, which changed what the source said.
          if (!inFnDef) spaceBefore(node);
          // A list item or footnote definition has already written its marker
          // onto this line.
          if (line === "") line += pad();
          atLineStart = true;
          inPara = true;
        } else {
          // A definition is one Org line, so its paragraphs are joined rather
          // than separated - a blank line inside one would end it.
          if (inFnDef) push(" "); else endLine();
          inPara = false;
          noteEnd(node);
        }
        break;

      case "heading":
        if (ev.entering) {
          inHeading++;
          // A heading is an *unindented* line and is context-free (§Headings), so
          // it is recognised inside a quote block or a list item just as it is at
          // top level -- it ends the enclosing section, leaves the block unclosed
          // and pulls the rest of the document under itself. Org has no nested
          // headline, so bold text is the closest valid reading; the level is the
          // part that has nowhere to go.
          boldHeading = quoteDepth || listStack.length;
          if (boldHeading) {
            if (!listStack.length) spaceBefore(node);
            if (line === "") line += pad();
            push("*");
          } else {
            flush();
            spaceBefore(node);
            push("*".repeat(node.level) + " ");
            declaredHeadline = true;
          }
        } else {
          if (boldHeading) {
            // An empty heading would leave "**": neither markup nor text.
            if (line.slice(-1) === "*") line = line.slice(0, -1); else push("*");
          }
          inHeading--;
          endLine();
          noteEnd(node);
        }
        break;

      case "code_block":
        flush();
        spaceBefore(node);
        // Only the first word is the language. Org reads the rest of the line as
        // switches and header arguments, so an R Markdown chunk header of the
        // form {r setup} used to arrive as "#+BEGIN_SRC {r".
        var info = (node.info || "").trim().split(/[\s{}]+/).filter(Boolean)[0] || "";
        // Org requires a LANGUAGE on a source block (§Lesser Elements), so a bare
        // fence becomes an example block rather than an empty #+BEGIN_SRC.
        push(pad() + (info ? "#+BEGIN_SRC " + info : "#+BEGIN_EXAMPLE"));
        endLine();
        emitBlockLines(esc.protectBlockBody(node.literal));
        push(pad() + (info ? "#+END_SRC" : "#+END_EXAMPLE"));
        endLine();
        noteEnd(node);
        break;

      case "thematic_break":
        flush();
        spaceBefore(node);
        push(pad() + "-----"); endLine();
        noteEnd(node);
        break;

      case "block_quote":
        if (ev.entering) {
          flush();
          spaceBefore(node);
          push(pad() + "#+BEGIN_QUOTE"); endLine();
          quoteDepth++;
          // The quote's own opening line is now the reference point, so the first
          // paragraph inside it doesn't read the gap before the quote as a blank.
          if (node.sourcepos) lastEnd = node.sourcepos[0][0];
        } else {
          quoteDepth--;
          // An empty list item leaves its bullet on an open line; a delimiter
          // must never land on it, or the block never closes.
          flush();
          push(pad() + "#+END_QUOTE"); endLine();
          noteEnd(node);
        }
        break;

      case "list":
        if (ev.entering) {
          if (!listStack.length) spaceBefore(node);
          listStack.push({
            ordered: node.listType === "ordered",
            n: (node.listStart === null || node.listStart === undefined) ? 1 : node.listStart,
            first: true
          });
        } else {
          listStack.pop();
          noteEnd(node);
        }
        break;

      case "item":
        if (ev.entering) {
          flush();
          var st = listStack[listStack.length - 1];
          var bullet;
          if (st.ordered) {
            // Org takes a non-1 start via the [@n] counter cookie.
            bullet = st.n + ". ";
            if (st.first && st.n !== 1) bullet += "[@" + st.n + "] ";
            st.n++;
          } else {
            bullet = "- ";
          }
          st.first = false;
          line += pad() + bullet;
          indent.push(" ".repeat(bullet.length));
          atLineStart = true;
        } else {
          indent.pop();
        }
        break;

      default:
        break;
    }
  }

  if (line !== "") endLine();

  while (out.length && out[0] === "") out.shift();
  while (out.length && out[out.length - 1] === "") out.pop();

  return out.join("\n");
}

/* --8<-- core end */

if (typeof module !== "undefined" && module.exports) {
  module.exports = renderOrg;
}
