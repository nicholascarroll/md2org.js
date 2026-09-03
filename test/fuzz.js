/*
 * Property fuzzer.
 *
 *   node test/fuzz.js [documents] [seed]
 *
 * Generates random Markdown and asserts properties that need no expected output:
 * structurally valid Org (test/org-validate.js), Invariant 1 (test/invariant.js)
 * and heading accounting (test/warnings.js). Every byte sequence is valid
 * CommonMark, so any generated input is a legitimate case.
 *
 * Documents are assembled from known fragments, nested inside one another, to
 * exercise interactions between constructs. The seed is printed so a run can be
 * reproduced.
 */
const md2org = require("../src/md2org.js");
const validate = require("./org-validate.js");
const invariant1 = require("./invariant.js");
const accountHeadings = require("./warnings.js");

const FRAGMENTS = [
  "# H", "## H2", "###### H6", "Title\n=====", "para text", "", "   ",
  "- a", "- [ ] t", "1. one", "5. five", "  - nested", "+", "+\n# H",
  "> quote", ">> deep", "    indented code",
  "```", "```py", "```\n#+END_SRC", "~~~", "````",
  "*em*", "**strong**", "***both***", "_u_", "__s__", "~~strike~~",
  "`code`", "`a=b`", "`a=b~c`", "`*x*`", "\\*lit\\*", "\\_lit\\_",
  "[t](/u)", '[t](/u "ti")', "![a](/i.png)", "[![b](/i.png)](/u)",
  "<http://e.com>", "[r]", "[r]: /url", "&amp;", "&#65;", "&nosuch;",
  "* * *", "---", "___", "#+title: k", "#+BEGIN_SRC", "#+END_SRC",
  "| a | b |", "| --- | --- |", "| 1 | 2 |", "| :-: | ---: |", "| x \\| y |",
  "[^1]", "[^1]: def", "[^a]: x", "[^my note!]", "`[^1]`", "[^1]: a\n    cont", "a :: b", "- x :: y", ":tag:", "# H :a:b:",
  "# TODO x", "# [#A] y", "<div>", "</div>", "<em>i</em>", "a|b",
  "|", "||", "=", "~", "+", "*", "/", "_", "\\", "[", "]", "[[", "]]",
,
  "\\(a_b\\)", "\\(x", "\\[\nA_{ij} = 1\n\\]", "\\[1\\]", "\\(\\)"
];

// Deterministic PRNG so a failing run can be replayed from its seed.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const N = parseInt(process.argv[2] || "5000", 10);
const seed = parseInt(process.argv[3] || String(Date.now() % 1e9), 10);
const rnd = mulberry32(seed);
const pick = arr => arr[Math.floor(rnd() * arr.length)];

/*
 * Wrappers place a fragment inside another construct: inline markup, links, and
 * the block containers quote, list item and table cell.
 */
const WRAPPERS = [
  s => "*" + s + "*",
  s => "**" + s + "**",
  s => "_" + s + "_",
  s => "~~" + s + "~~",
  s => "`" + s + "`",
  s => "[" + s + "](/u)",
  s => '[' + s + '](/u "ti")',
  s => "![" + s + "](/i.png)",
  s => "[" + s + "][r]",
  s => "<" + s + ">",
  s => "> " + s,
  s => "- " + s,
  s => "| " + s + " | b |\n| --- | --- |\n| 1 | 2 |"
];

/*
 * Depth is capped at three; failures arise between a construct and its immediate
 * container.
 */
function nest(depth) {
  const base = pick(FRAGMENTS);
  if (depth <= 0 || rnd() < 0.45) return base;
  return pick(WRAPPERS)(nest(depth - 1));
}

function generate() {
  const parts = [];
  const n = 1 + Math.floor(rnd() * 7);
  for (let i = 0; i < n; i++) parts.push(nest(3));
  return parts.join(rnd() < 0.5 ? "\n" : "\n\n");
}

/*
 * Accepted failure modes (DESIGN.md, Known limitations). A literal "#+BEGIN_SRC"
 * or "#+END_SRC" in the source can pair with a delimiter md2org emitted. The
 * fragments include both, so these modes occur in most runs; the rate reflects
 * the corpus, not real Markdown.
 *
 * They are reported but do not fail the run. Any other mode fails. At `npm run
 * fuzz` depth, an entry that matches nothing is reported so it can be removed.
 */
const ACCEPTED = [
  /^line N: #\+END_\w+ with no matching #\+BEGIN_$/,
  /^line N: #\+BEGIN_\w+ never closed$/,
  /^line N: #\+END_\w+ closes #\+BEGIN_\w+$/,
  /^line N: #\+BEGIN_\w+ with no LANGUAGE$/,
  // The same cause, where the delimiter is inside a quote or list that md2org
  // wrapped in a block.
  /^line N: unquoted '#\+' at start of line inside #\+BEGIN_\w+$/
];

/*
 * Known open defects: real failures awaiting a fix, as distinct from ACCEPTED
 * design decisions. Each entry is { re, closedBy }, naming the change that will
 * close it. Reported without failing the run, and checked for staleness as
 * ACCEPTED is.
 */
const KNOWN_OPEN = [
  // None.
];

const accepted = key => ACCEPTED.some(re => re.test(key));
const knownOpen = key => KNOWN_OPEN.find(k => k.re.test(key));

let crashes = 0, invalid = 0;
const modes = new Map();
const seen = new Set();

for (let i = 0; i < N; i++) {
  const src = generate();
  let out;
  try {
    out = md2org(src);
  } catch (e) {
    crashes++;
    const key = "CRASH: " + (e && e.message ? e.message : String(e));
    if (!modes.has(key)) modes.set(key, { src, out: null });
    continue;
  }
  // Three checks, none needing an expected answer: structural validity,
  // Invariant 1 and Invariant 4's heading accounting.
  const heading = accountHeadings(src);
  const problems = validate(out)
    .concat(invariant1(src, out))
    .concat(heading ? ["invariant 4: " + heading] : []);
  if (problems.length) {
    invalid++;
    const key = problems[0]
      .replace(/offset \d+/, "offset N")
      .replace(/line \d+/, "line N")
      .replace(/ on lines \[[^\]]*\][\s\S]*$/, " on lines [N]");
    seen.add(key);
    if (!modes.has(key)) modes.set(key, { src, out });
  }
}

console.log("FUZZ           " + N + " documents, seed " + seed);
console.log("  crashes      " + crashes);
console.log("  invalid Org  " + invalid + (invalid ? "  (" + (invalid / N * 100).toFixed(2) + "%)" : ""));

const unexplained = [...modes].filter(([mode]) => !accepted(mode) && !knownOpen(mode));
const known = [...modes].filter(([mode]) => accepted(mode));
const open = [...modes].filter(([mode]) => !accepted(mode) && knownOpen(mode));

if (known.length) {
  console.log("  accepted     " + known.length + " mode" + (known.length > 1 ? "s" : "") +
              " — stray #+BEGIN_/#+END_ in the corpus; see DESIGN.md");
  for (const [mode] of known) console.log("               " + mode);
}

if (open.length) {
  console.log("  known open   " + open.length + " defect" + (open.length > 1 ? "s" : "") +
              ", not decisions — see KNOWN_OPEN in test/fuzz.js");
  for (const [mode] of open) {
    const k = knownOpen(mode);
    console.log("               " + mode);
    console.log("                 closed by: " + k.closedBy);
  }
}

if (unexplained.length) {
  console.log("");
  for (const [mode, ex] of unexplained) {
    console.log("  " + mode);
    console.log("    input : " + JSON.stringify(ex.src));
    if (ex.out !== null) console.log("    output: " + JSON.stringify(ex.out));
  }
  console.log("");
  console.log("  reproduce with: node test/fuzz.js " + N + " " + seed);
  process.exit(1);
}

// An accepted mode that no longer occurs should be removed. Checked only at
// `npm run fuzz` depth, because the rarest mode is absent from many 5,000-document
// runs.
if (N >= 100000) {
  const stale = ACCEPTED.concat(KNOWN_OPEN.map(k => k.re))
    .filter(re => ![...seen].some(k => re.test(k)));
  if (stale.length) {
    console.log("  NOTE these ACCEPTED patterns matched nothing this run; if the");
    console.log("       underlying issue is fixed, delete them from test/fuzz.js:");
    for (const re of stale) console.log("         " + re);
  }
}
process.exit(0);
