/*
 * md2org
 *
 * A single pure function: string in, string out. 
 */

function md2org(src) {
  const B = "\u0001"; // sentinel: protects bold markers during the italic pass

  // Inline markup — operates on a single line's text, never across lines.
  function inline(t) {
    return t
      // bold (**x** and __x__) parked behind a sentinel so italic can't touch it
      .replace(/\*\*(.+?)\*\*/g, B + "$1" + B)
      .replace(/__(.+?)__/g, B + "$1" + B)
      // italic: a lone * or _ not touching word chars or another marker.
      // The guards stop some_variable_name turning into /some/variable/name.
      .replace(/(?<![\w*_])[*_](?=\S)([^*_]+?)(?<=\S)[*_](?![\w*_])/g, "/$1/")
      .replace(new RegExp(B, "g"), "*")
      // inline code
      .replace(/`([^`]+)`/g, "=$1=")
      // strikethrough
      .replace(/~~(.+?)~~/g, "+$1+")
      // links [text](url) -> [[url][text]]
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "[[$2][$1]]");
  }

  const out = [];
  let inFence = false;   // inside a ``` code block
  let inComment = false; // inside a multi-line <!-- --> comment

  for (const line of src.split("\n")) {
    // 1. CODE BLOCKS — highest priority. Contents are protected from every
    //    other rule, so # or _ or * inside code is never reinterpreted.
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence && !inComment) {
      out.push(inFence ? "#+END_SRC" : "#+BEGIN_SRC " + (fence[1] || ""));
      inFence = !inFence;
      continue;
    }
    if (inFence) { out.push(line); continue; }

    // 2. MARKDOWN COMMENTS — only when not inside a code block.
    if (inComment) {
      if (/-->/.test(line)) {
        const before = line.replace(/-->.*$/, "").trim();
        if (before) out.push(before);
        out.push("#+END_COMMENT");
        inComment = false;
      } else {
        out.push(line);
      }
      continue;
    }
    const single = line.match(/^\s*<!--(.*?)-->\s*$/);
    if (single) {
      const body = single[1].trim();
      out.push(body ? "# " + body : "#");
      continue;
    }
    if (/^\s*<!--/.test(line)) {
      out.push("#+BEGIN_COMMENT");
      const rest = line.replace(/^\s*<!--/, "").trim();
      if (rest) out.push(rest);
      inComment = true;
      continue;
    }

    // 3. LISTS — before headings, so a "* " bullet isn't read as a heading
    //    and a heading made here isn't demoted to a bullet. Ordered lists
    //    (1. 2.) pass through since Org uses the same form.
    let l = line.replace(/^([ \t]*)[*+-][ \t]+/, "$1- ");

    // 4. HEADINGS — ATX "#" .. "######" to Org "*" .. "******".
    const h = l.match(/^(#{1,6})[ \t]+(.*)$/);
    if (h) {
      out.push("*".repeat(h[1].length) + " " + inline(h[2]));
      continue;
    }

    // Everything else: inline markup, keep the line.
    out.push(inline(l));
  }

  // Close anything a malformed document left open, rather than dropping it.
  if (inFence) out.push("#+END_SRC");
  if (inComment) out.push("#+END_COMMENT");

  return out.join("\n");
}

// Universal export: CommonJS (Node/CLI), ES module (bundlers), browser global.
if (typeof module !== "undefined" && module.exports) {
  module.exports = md2org;
  module.exports.md2org = md2org;
}
if (typeof window !== "undefined") {
  window.md2org = md2org;
}
