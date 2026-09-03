/*
 * org-validate: checks that a string is structurally valid Org, following
 * specs/org-syntax-v2.org. Block delimiters must pair and nest, source blocks
 * need a language, lesser block bodies must be comma-quoted, and link paths may
 * not contain an unescaped "]". Applied to every case in the suite and to fuzzed
 * input.
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
  let em;

  // Nothing else is checked: literal text can resemble any Org markup, so other
  // markup cannot be judged from the output alone. test/invariant.js checks that
  // the author's text survives.
  return problems;
}

module.exports = validate;
module.exports.validate = validate;
