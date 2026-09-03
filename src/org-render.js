/*
 * org-render: walks a CommonMark AST and emits Org.
 *
 * Literal text is copied; the few escapes live in org-escape. This file handles
 * structure: the block-context stack, indentation and blank lines. Blank lines
 * follow the source, using sourcepos, rather than being emitted at every block
 * boundary.
 */

/* --8<-- core start */

function fnLabel(s) {
  return String(s).trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "fn";
}

function renderOrg(ast, esc) {
  // A reference converts only if a matching definition exists, so definitions
  // are collected first. Labels that sanitise to the same Org label ("x y" and
  // "x-y") get a counter to keep them distinct.
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
  var nestedSkip = 0;  // inside a nested link or image whose children are suppressed
  var bareDesc = 0;    // inside a link emitted as its description text only
  var emptyDesc = 0;   // inside a link with no description
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
  var declaredComment = false;   // md2org emitted an Org comment on this line, on purpose
  var inVerbatim = false;        // emitting the body of a block Org does not parse
  var descStart = -1;       // index in the current line where the description begins
  function warnAt(k) {
    var a = renderOrg.warn[k] || (renderOrg.warn[k] = []), n = out.length + 1;
    if (a[a.length - 1] !== n) a.push(n);
  }

  function pad() { return indent.join(""); }

  // Invariant 4. Warns when an escape changed its input, which attributes the
  // finding to the construct that caused it rather than to the finished line.
  function ent(before, after, name) {
    if (before !== after) warnAt(name);
    return after;
  }
  function push(s) { if (s) { line += s; atLineStart = false; } }

  function endLine() {
    // GFM task list. The parser does not recognise the box, so it is corrected
    // on the assembled line. Org recognises "[X]" but not "[x]".
    if (listStack.length) line = line.replace(/^(\s*(?:-|\d+\.) )\[x\] /, "$1[X] ");
    // Warn on any line Org reads as a headline, unless md2org declared it. The
    // test is on the output line because only the line determines what Org does:
    // generated emphasis markup can also produce leading asterisks ("__** * **__").
    if (!declaredHeadline && /^\*+\s/.test(line)) warnAt("heading");
    // Warn on any line Org reads as a comment, which drops it from every export.
    // The usual source is "\#", CommonMark's escape for a literal hash: the parser
    // consumes the backslash and leaves a bare "#". Org requires "#" followed by
    // whitespace or end of line, so "#1" and "#+TITLE:" do not match. Exempt:
    // comments md2org emitted, and verbatim block bodies, where Org parses none.
    if (!declaredComment && !inVerbatim && /^[ \t]*#(\s|$)/.test(line)) warnAt("comment");
    // An authored block delimiter can pair with one md2org emitted. Block bodies
    // are comma-quoted, so only authored text can reach this.
    if (authored && /^[ \t]*#\+(BEGIN|END)_/i.test(line)) warnAt("stray block delimiter");
    // Org reads "[[…]]" as a link. Tested against authored text only, because
    // every link md2org emits has that form.
    if (/\[\[[^\]]*\]\]/.test(authoredLine)) warnAt("[[ ]] read as an Org link");
    authored = false;
    authoredLine = "";
    declaredHeadline = false;
    declaredComment = false;
    out.push(line);
    line = "";
    atLineStart = true;
  }

  // Close any open line before a block starts, so that a heading after an empty
  // list item is not emitted as "- * H".
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

  // Literal text is copied unchanged (DESIGN.md, Invariant 1).
  function text(s) {
    var t = inCell ? ent(s, esc.escapeCell(s), "\\| in a table cell") : s;
    // Accumulated across nodes: a backslash escape is its own text node, so
    // "[a\\]\\]b](/u)" arrives as "a", "]", "]", "b" and no node holds "]]".
    authored = true;
    authoredLine += t;
    push(t);
  }

  // Close a bracket link. A description that contains "]]", or ends in "]" and so
  // forms "]]" with the closer, ends the link early. Org has no escape for this,
  // so it is reported.
  function closeLink() {
    var desc = descStart >= 0 ? line.slice(descStart) : "";
    if (desc.indexOf("]]") !== -1 || desc.slice(-1) === "]")
      warnAt("]] in a link description");
    descStart = -1;
    push("]]");
  }

  // Emits the body of a block Org does not parse: an export, src or example
  // block. Quote block contents are walked instead, which lets the comment check
  // in endLine tell the two apart.
  function emitBlockLines(str) {
    inVerbatim = true;
    str.replace(/\n$/, "").split("\n").forEach(function (l) {
      push(pad() + l);
      endLine();
    });
    inVerbatim = false;
  }

  // An HTML comment block becomes Org comment lines rather than an export block.
  function htmlComment(literal) {
    var raw = literal.replace(/\n$/, "");
    // An HTML block may be indented up to three spaces; the literal keeps them.
    var open = /^ {0,3}<!--/.exec(raw);
    if (!open) return false;
    // The block ends on the line containing "-->", so any text after it is part
    // of the literal. A comment would drop that text, so it goes to an export
    // block instead.
    var cut = raw.indexOf("-->");
    if (cut !== -1 && !/^\s*$/.test(raw.slice(cut + 3))) return false;
    var body = raw.slice(open[0].length, cut === -1 ? undefined : cut);
    // A run of comment lines, not a comment block. Org strips "#" and one space
    // on read, so the body survives exactly without comma-quoting, which Org does
    // not reverse in a comment block. No body line can start another construct.
    body.split("\n").forEach(function (l) {
      push(pad() + (l ? "# " + l : "#"));
      declaredComment = true;
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
        // Footnote definitions and headlines (§Headings) are single lines, so a
        // soft break inside one becomes a space. Otherwise a multi-line setext
        // heading ("foo\nbar\n===") would be truncated.
        if (inFnDef) { push(" "); break; }
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
        // A code span holding "|" in a table cell loses its monospace: CONTENTS
        // is a literal string (§Text Markup), so no escape works inside the
        // delimiters. The characters are emitted bare and warned.
        var lit = node.literal, span, bare;
        if (inCell && lit.indexOf("|") !== -1) {
          span = ent(lit, esc.escapeCell(lit), "\\| in a table cell");
          bare = true;
        } else {
          span = esc.codeSpan(lit);
          // codeSpan returns the text unchanged when it holds both "=" and "~".
          bare = span === lit;
        }
        authored = true;
        // Only a span emitted without delimiters can be read as Org markup;
        // "=[[Some Page]]=" is not a link.
        if (bare) authoredLine += span;
        push(span);
        break;

      case "math":
        // LaTeX math is copied verbatim; Org reads "\(…\)" and "\[…\]" as LaTeX
        // fragments. Line breaks follow softbreak's rules. In a table cell the
        // text goes through escapeCell like any other.
        var ml = node.literal.split("\n"), mi;
        authored = true;
        for (mi = 0; mi < ml.length; mi++) {
          if (mi) {
            if (inFnDef || inHeading) push(" ");
            else { endLine(); push(pad()); }
          }
          push(inCell ? ent(ml[mi], esc.escapeCell(ml[mi]), "\\| in a table cell") : ml[mi]);
        }
        break;

      case "emph":
        push("/");
        break;

      case "footnote_definition":
        if (ev.entering) {
          // Consecutive definitions are separated by a blank line for readability.
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
        // Text inside a cell goes through escapeCell (see text()).
        inCell = ev.entering;
        if (ev.entering) push(" "); else push(" |");
        break;

      case "strikethrough":
        push("+");
        break;

      case "strong":
        push("*");
        break;

      // Links and images share one path: an Org image is a link to a displayable
      // file. Alt text becomes the description; a Markdown title is dropped.
      case "link":
      case "image":
        if (ev.entering) {
          if (linkDepth > 0) {
            // A description may contain another link only as a plain or angle
            // link (§Regular Link). A nested link or image, typically a badge,
            // contributes its destination as the description; its own text is
            // dropped.
            push(esc.escapeLinkPath(node.destination));
            nestedSkip++;
          } else if (node.destination && !node.firstChild) {
            // A description must hold at least one object, so an empty one uses
            // the path-only form.
            push("[[" + esc.escapeLinkPath(node.destination));
            emptyDesc++;
          } else if (!node.destination || node.destination[0] === "#") {
            // No link is possible, so the description is emitted as text. An
            // empty PATHREG is not a link (§Regular Link), and a "#anchor" needs a
            // CUSTOM_ID property that Markdown does not declare; an unresolvable
            // link makes the whole export fail.
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
          // Export block contents are raw text, so "*" and "#+" lines are
          // comma-quoted.
          emitBlockLines(esc.protectBlockBody(node.literal));
          push(pad() + "#+END_EXPORT"); endLine();
        }
        noteEnd(node);
        break;

      case "paragraph":
        if (ev.entering) {
          // Blank lines follow the source, which keeps loose lists loose.
          if (!inFnDef) spaceBefore(node);
          // A list item or footnote definition has already written its marker
          // onto this line.
          if (line === "") line += pad();
          atLineStart = true;
          inPara = true;
        } else {
          // Footnote definition paragraphs are joined, because a blank line
          // would end the definition.
          if (inFnDef) push(" "); else endLine();
          inPara = false;
          noteEnd(node);
        }
        break;

      case "heading":
        if (ev.entering) {
          inHeading++;
          // A headline must start at column 0 (§Headings), so a heading inside a
          // quote or list item would end the enclosing block. It is emitted as
          // bold text instead, and its level is lost.
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
        // Only the first word is the language; Org reads the rest of the line as
        // switches and header arguments. "{r setup}" gives "r".
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
          // Measure the first inner paragraph's gap from the quote's opening line.
          if (node.sourcepos) lastEnd = node.sourcepos[0][0];
        } else {
          quoteDepth--;
          // An empty list item can leave its bullet on an open line; flush it so
          // the delimiter starts a line of its own.
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
