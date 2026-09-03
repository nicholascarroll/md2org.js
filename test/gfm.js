/*
 * GFM table conformance against specs/gfm-spec-0.29.txt. Checks the parse only,
 * using cell and alignment counts derived from the spec's HTML; the Org output
 * is tested in test/spec.js. The spec has no footnote examples, so footnotes are
 * tested in test/spec.js against GitHub's behaviour.
 */
const fs = require("fs");
const path = require("path");
const { Parser } = require("../src/vendor/commonmark.js");

// Tables are parsed by the forked parser; their shape is read from the tree.
const parser = new Parser();
function tableOf(md) {
  const w = parser.parse(md).walker();
  let ev, header = null, rows = 0, align = [];
  while ((ev = w.next())) {
    const n = ev.node;
    if (!ev.entering || n.type !== "table_row") continue;
    const cells = [];
    for (let c = n.firstChild; c; c = c.next) cells.push(c._align || null);
    if (n._isHeading) { header = cells; align = cells; } else rows++;
  }
  return header ? { header: header, rows: rows, align: align } : null;
}

// The spec is committed, so its absence fails the test rather than skipping it.
const SPEC = path.join(__dirname, "..", "specs", "gfm-spec-0.29.txt");
if (!fs.existsSync(SPEC)) {
  console.log("GFM SPEC missing at specs/gfm-spec-0.29.txt — it is committed, so");
  console.log("this is a broken checkout. Restore it with `git checkout -- specs/`.");
  process.exit(1);
}

const untab = s => s.replace(/\u2192/g, "\t");
const lines = fs.readFileSync(SPEC, "utf8").split("\n");
const examples = [];
let sec = null, i = 0, n = 0;
while (i < lines.length) {
  const h = lines[i].match(/^#{1,6} +(.*)$/);
  if (h) sec = h[1].trim();
  if (/^`{32} example/.test(lines[i])) {
    let j = i + 1; while (j < lines.length && lines[j] !== ".") j++;
    let k = j + 1; while (k < lines.length && !/^`{32}$/.test(lines[k])) k++;
    examples.push({ n: ++n, sec, markdown: untab(lines.slice(i + 1, j).join("\n")), html: untab(lines.slice(j + 1, k).join("\n")) });
    i = k + 1; continue;
  }
  i++;
}

const tables = examples.filter(e => e.sec === "Tables (extension)");
let pass = 0;
for (const e of tables) {
  const t = tableOf(e.markdown);
  // <th and <td must be matched with a delimiter so <thead> isn't counted.
  const th = (e.html.match(/<th[ >]/g) || []).length;
  const td = (e.html.match(/<td[ >]/g) || []).length;
  const isTable = /<table>/.test(e.html);
  let ok = isTable
    ? !!t && t.header.length === th && t.rows * t.header.length === td
    : t === null;
  if (isTable && t) {
    const want = (e.html.match(/<th align="(\w+)"/g) || []).map(s => s.match(/"(\w+)"/)[1]);
    if (want.length) ok = ok && JSON.stringify(t.align.filter(Boolean)) === JSON.stringify(want);
  }
  if (ok) pass++;
  else console.log("  FAIL spec example " + e.n);
}
console.log("GFM TABLES     " + pass + "/" + tables.length + " spec examples");
if (tables.length !== 8) { console.log("  FAIL expected 8 table examples, found " + tables.length); process.exit(1); }
process.exit(pass === tables.length ? 0 : 1);
