/*
 * Extracts the CommonMark spec examples from specs/commonmark-0.31.2.txt.
 *
 * The spec writes tab characters as U+2192 (→) in every example, so they are
 * converted back to tabs.
 */
const fs = require("fs");
const path = require("path");

const ARROW = /\u2192/g;
const untab = s => s.replace(ARROW, "\t");

function extract(specPath) {
  const lines = fs.readFileSync(specPath, "utf8").split("\n");
  const out = [];
  let section = null, i = 0, n = 0;
  while (i < lines.length) {
    const h = lines[i].match(/^#{1,6} +(.*)$/);
    if (h) section = h[1].trim();
    if (/^`{32} example$/.test(lines[i])) {
      let j = i + 1;
      while (j < lines.length && lines[j] !== ".") j++;
      let k = j + 1;
      while (k < lines.length && !/^`{32}$/.test(lines[k])) k++;
      out.push({
        n: ++n,
        section,
        specLine: i + 1,
        markdown: untab(lines.slice(i + 1, j).join("\n")),
        html: untab(lines.slice(j + 1, k).join("\n"))
      });
      i = k + 1;
      continue;
    }
    i++;
  }
  return out;
}

module.exports = extract;
module.exports.extract = extract;
module.exports.SPEC = path.join(__dirname, "..", "specs", "commonmark-0.31.2.txt");
