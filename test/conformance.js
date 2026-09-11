/*
 * Parse conformance for the forked CommonMark parser.
 *
 * Run as:  node test/conformance.js
 *
 * This checks the parse half only, against the spec's own HTML, so nothing here is
 * an authored expectation. The Org half is checked by test/spec.js.
 *
 * Expected result is 639/652, and the thirteen exceptions are all one decision:
 * md2org decodes no character references, named or numeric. See
 * tools/entities-compact.js for why, and DESIGN.md for the contract.
 *
 * Examples 25, 26 and 27 test references directly. The other ten use one somewhere
 * the spec expects it resolved before the surrounding construct is built: in a link
 * destination, a link title, a link reference definition, a code fence's info
 * string, or as a literal "*", "#", tab or newline that would otherwise be markup.
 * Nothing there is a parse defect — the parser is doing exactly what the contract
 * asks — but the count is asserted so the trade cannot drift silently into
 * something larger.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const extract = require("./extract.js");

const EXPECTED_PASS = 639;
const EXPECTED_FAILURES = [25, 26, 27, 32, 33, 34, 37, 38, 39, 40, 41, 503, 506];

/*
 * The parser under test is the shipped one, src/vendor/commonmark.js — the file
 * src/md2org.js actually requires. test/vendor-cmark-html.js supplies only the
 * HTML renderer, so the spec's own HTML can be compared against.
 *
 * It read the parser out of the test bundle until 1.1.0, which measured a sibling
 * rather than the artifact. tools/build-vendor.js writes both from the same patched
 * upstream, so they agreed by construction, and nothing checked that they still
 * did: renaming a method in the shipped parser broke every code span while this
 * tier reported 639/652 and said the fork matched its documented conformance. It
 * is also how the 1.1.0 character-reference change passed here unchanged until the
 * test bundle was patched too.
 *
 * The test bundle is loaded in a vm context because it is an IIFE that assigns to
 * a global.
 */
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, "vendor-cmark-html.js"), "utf8"), ctx);
const HtmlRenderer = vm.runInContext("CM", ctx).HtmlRenderer;
const Parser = require("../src/vendor/commonmark.js").Parser;

const examples = extract(extract.SPEC);
let pass = 0;
const failures = [];

for (const e of examples) {
  let got;
  try {
    got = new HtmlRenderer().render(new Parser().parse(e.markdown + "\n"));
  } catch (err) {
    failures.push(e.n);
    continue;
  }
  const want = e.html === "" ? "" : e.html + "\n";
  if (got === want) pass++; else failures.push(e.n);
}

console.log("PARSE CONFORMANCE   " + pass + "/" + examples.length +
            "  (" + (pass / examples.length * 100).toFixed(1) + "%)");

let bad = 0;
if (examples.length !== 652) {
  console.log("  FAIL extracted " + examples.length + " examples, expected 652");
  bad++;
}
// Example 207 is a bare link reference definition and legitimately renders nothing.
// Asserting it stops a future extraction bug from silently emptying the corpus.
const empties = examples.filter(e => e.html === "").map(e => e.n);
if (empties.length !== 1 || empties[0] !== 207) {
  console.log("  FAIL expected exactly one empty-HTML example (207), got " + JSON.stringify(empties));
  bad++;
}
if (pass !== EXPECTED_PASS || String(failures) !== String(EXPECTED_FAILURES)) {
  console.log("  FAIL expected " + EXPECTED_PASS + " passing with failures " +
              JSON.stringify(EXPECTED_FAILURES) + ", got " + pass +
              " with " + JSON.stringify(failures));
  bad++;
}
if (!bad) console.log("  forked parser matches its documented conformance");
process.exit(bad ? 1 : 0);
