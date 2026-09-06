/*
 * Property fuzzer.
 *
 *   node test/fuzz.js [documents] [seed]
 *
 * The idea rests on one observation: test/org-validate.js is a *total oracle*. It
 * judges any output without being told what the answer should be. So we do not
 * need authored expectations to test exhaustively — we can generate arbitrary
 * Markdown and assert a single invariant:
 *
 *     whatever goes in, what comes out is structurally valid Org.
 *
 * This is unusually well suited to Markdown, because there is no such thing as
 * invalid input. CommonMark has no parse errors; every byte sequence is a valid
 * document. There is no rejection path to work around, so any generated garbage is
 * a legitimate test case.
 *
 * Its first run found five real defects that 68 hand-written tests had missed,
 * including a crash on "+\n# H" that affected 2.4% of generated documents.
 *
 * The generator is fragment-based rather than byte-random: it assembles known
 * constructs in random combinations, which is what surfaces *interactions* between
 * features. Byte-random input is also valid and finds different things; that is
 * worth adding later.
 *
 * The seed is printed on failure so any run can be reproduced exactly.
 */
const md2org = require("../src/md2org.js");
const validate = require("./org-validate.js");

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
  "text with * star", "a**b**c", "x_y_z", "foo  ", "\t tab"
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

function generate() {
  const parts = [];
  const n = 1 + Math.floor(rnd() * 7);
  for (let i = 0; i < n; i++) parts.push(pick(FRAGMENTS));
  return parts.join(rnd() < 0.5 ? "\n" : "\n\n");
}

/*
 * Known-accepted failure modes: see DESIGN.md, "Block delimiters can pair
 * with ones md2org emits".
 *
 * A literal "#+BEGIN_SRC" or "#+END_SRC" in the source passes through under the
 * contract, where it can pair with a delimiter md2org emitted. That was accepted
 * on reachability grounds, and the corpus below carries both delimiters as
 * fragments on purpose, so these modes appear in every run at around 7%. That
 * rate is a property of the corpus, not a measure of real Markdown.
 *
 * They are reported but do not fail the run. Failing on a condition the design
 * has already decided not to fix leaves the suite with no green state, which
 * costs the only thing the fuzzer is for: noticing when something NEW breaks.
 * Anything not listed here is unexplained and fails.
 *
 * Delete an entry when the corresponding issue is closed; a mode that stops
 * occurring is reported at the end so the entry doesn't outlive the bug.
 */
const ACCEPTED = [
  /^line N: #\+END_SRC with no matching #\+BEGIN_$/,
  /^line N: #\+BEGIN_SRC never closed$/,
  /^line N: #\+END_SRC closes #\+BEGIN_\w+$/,
  /^line N: #\+BEGIN_SRC with no LANGUAGE$/
];
const accepted = key => ACCEPTED.some(re => re.test(key));

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
  const problems = validate(out);
  if (problems.length) {
    invalid++;
    const key = problems[0].replace(/offset \d+/, "offset N").replace(/line \d+/, "line N");
    seen.add(key);
    if (!modes.has(key)) modes.set(key, { src, out });
  }
}

console.log("FUZZ           " + N + " documents, seed " + seed);
console.log("  crashes      " + crashes);
console.log("  invalid Org  " + invalid + (invalid ? "  (" + (invalid / N * 100).toFixed(2) + "%)" : ""));

const unexplained = [...modes].filter(([mode]) => !accepted(mode));
const known = [...modes].filter(([mode]) => accepted(mode));

if (known.length) {
  console.log("  accepted     " + known.length + " mode" + (known.length > 1 ? "s" : "") +
              " — stray #+BEGIN_/#+END_ in the corpus; see DESIGN.md");
  for (const [mode] of known) console.log("               " + mode);
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

// An accepted mode that no longer occurs means the issue was fixed and the entry
// should be deleted, so say so rather than letting it sit there forever granting
// an exemption nothing needs. Only at `npm run fuzz` depth: the rarest of these
// modes appears in roughly one 5,000-document run in six, so at suite depth this
// would cry wolf.
if (N >= 100000) {
  const stale = ACCEPTED.filter(re => ![...seen].some(k => re.test(k)));
  if (stale.length) {
    console.log("  NOTE these ACCEPTED patterns matched nothing this run; if the");
    console.log("       underlying issue is fixed, delete them from test/fuzz.js:");
    for (const re of stale) console.log("         " + re);
  }
}
process.exit(0);
