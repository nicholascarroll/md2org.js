/*
 * org-validate — checks that a string is structurally valid Org.
 *
 * This is the invariant tier. It doesn't ask whether the conversion was *right*,
 * only whether the output is Org that means what it looks like. Every one of the
 * corruption bugs the rewrite fixed is caught here, so it runs over every case in
 * the suite rather than over a chosen few: a wrong conversion is a bug, but
 * invalid Org is a different and worse kind of bug, and it should be impossible to
 * introduce one without a test going red.
 *
 * Rules are from Org Syntax v2 (specs/org-syntax-v2.org).
 */

/*
 * Org distinguishes lesser blocks, whose contents are raw text, from greater
 * blocks, whose contents are elements. The comma-quoting rule applies only to the
 * former: a "*" at the start of a line inside #+BEGIN_QUOTE is ordinary content,
 * and greater blocks may nest.
 */
const LESSER = new Set(["EXAMPLE", "SRC", "EXPORT", "VERSE", "COMMENT"]);

const BEGIN = /^[ \t]*#\+BEGIN_(\w+)(.*)$/i;
const END = /^[ \t]*#\+END_(\w+)[ \t]*$/i;

function validate(org) {
  const problems = [];
  const lines = org.split("\n");
  const stack = [];   // open blocks, innermost last

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const at = "line " + (i + 1);
    const inner = stack.length ? stack[stack.length - 1] : null;

    // Inside a lesser block everything is raw text until the matching #+END_.
    if (inner && LESSER.has(inner.name.toUpperCase())) {
      const e = line.match(END);
      if (e && e[1].toUpperCase() === inner.name.toUpperCase()) { stack.pop(); continue; }
      if (/^[ \t]*\*/.test(line)) {
        problems.push(at + ": unquoted '*' at start of line inside #+BEGIN_" + inner.name);
      }
      if (/^[ \t]*#\+/.test(line)) {
        problems.push(at + ": unquoted '#+' at start of line inside #+BEGIN_" + inner.name);
      }
      continue;
    }

    const b = line.match(BEGIN);
    if (b) {
      // A source block must carry a LANGUAGE (§Lesser Elements).
      if (b[1].toUpperCase() === "SRC" && b[2].trim() === "") {
        problems.push(at + ": #+BEGIN_SRC with no LANGUAGE");
      }
      stack.push({ name: b[1], line: i });
      continue;
    }

    const e = line.match(END);
    if (e) {
      if (!inner) { problems.push(at + ": #+END_" + e[1] + " with no matching #+BEGIN_"); }
      else if (e[1].toUpperCase() !== inner.name.toUpperCase()) {
        problems.push(at + ": #+END_" + e[1] + " closes #+BEGIN_" + inner.name);
        stack.pop();
      } else stack.pop();
      continue;
    }

    // A line of bare stars used to be impossible - the escape layer neutralised
    // any asterisk at column 0. Under the pass-through contract it is literal
    // text md2org copied, and Org reads it as an empty headline, which is valid.
  }

  for (const open of stack) {
    problems.push("line " + (open.line + 1) + ": #+BEGIN_" + open.name + " never closed");
  }

  problems.push(...checkInline(org));
  return problems;
}

/*
 * Link paths may not contain an unescaped "]", which would close the link early.
 */
function checkInline(org) {
  const problems = [];
  // Contents of a lesser block are raw text, so brackets and entities there are
  // literal and must not be judged as markup.
  const lines = org.split("\n");
  const kept = [];
  let skip = null;
  for (const line of lines) {
    if (skip) {
      const e = line.match(END);
      if (e && e[1].toUpperCase() === skip) skip = null;
      continue;
    }
    const b = line.match(BEGIN);
    if (b && LESSER.has(b[1].toUpperCase())) { skip = b[1].toUpperCase(); continue; }
    kept.push(line);
  }
  org = kept.join("\n");
  const re = /\[\[((?:[^\]\\]|\\.)*)\]\[/g;
  let m;
  while ((m = re.exec(org)) !== null) {
    if (/(^|[^\\])\]/.test(m[1])) {
      problems.push("unescaped ']' in link path: " + JSON.stringify(m[1]));
    }
  }
  // The nested-bracket-link check has gone the same way as the link-shape check
  // below: "][ ... [[" is now just as likely to be literal text as a badge
  // rendered naively, and the output does not say which.

  // Entities are not expanded inside verbatim or code (§Text Markup: CONTENTS is
  // a string), so an entity there is displayed literally and is almost always a
  // conversion bug rather than an intention.
  const entInVerbatim = /([=~])[^=~\n]*\\[a-zA-Z]+\{\}[^=~\n]*\1/g;
  let em;
  while ((em = entInVerbatim.exec(org)) !== null) {
    problems.push("Org entity inside verbatim/code at offset " + em.index + ": " + JSON.stringify(em[0].slice(0, 40)));
  }

  // There was a third check here: that a bracket link md2org generated always
  // closes. It has gone the same way as the two above. Under the pass-through
  // contract (DESIGN.md) literal text can look like any Org markup, and nothing in
  // the output distinguishes text md2org copied from markup md2org generated, so
  // an unclosed "[[" can no longer be told from a "[[" that was always meant as
  // text. The guard that replaces all three is the invariant in DESIGN.md §1:
  // every non-markup character in the source appears in the output. See D2.
  return problems;
}

module.exports = validate;
module.exports.validate = validate;
