/*
 * Parse conformance for the forked CommonMark parser.
 *
 * Run as:  node test/conformance.js
 *
 * This checks the parse half only, against the spec's own HTML, so nothing here is
 * an authored expectation. The Org half is checked by test/spec.js.
 *
 * Expected result is 645/652, and the seven exceptions are all the same decision:
 * named entity references are not decoded. DESIGN.md passes them through as the
 * author wrote them, so the parser has no named table at all — upstream's is 99 KB,
 * about two thirds of the whole bundle, and carrying it would put the Shortcut copy
 * far past what its code field will accept.
 *
 * Example 25 is the direct test of named entities. The other six use one somewhere
 * the spec expects it resolved before the surrounding construct is built: in a link
 * destination, a link title, a link reference definition, or a code fence's info
 * string. Nothing there is a parse defect — the parser is doing exactly what the
 * contract asks — but the count is asserted so the trade cannot drift silently into
 * something larger.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const extract = require("./extract.js");

const EXPECTED_PASS = 645;
const EXPECTED_FAILURES = [25, 32, 33, 34, 41, 503, 506];

const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, "vendor-cmark-html.js"), "utf8"), ctx);

const examples = extract(extract.SPEC);
let pass = 0;
const failures = [];

for (const e of examples) {
  ctx.__doc = e.markdown + "\n";
  let got;
  try {
    got = vm.runInContext("new CM.HtmlRenderer().render(new CM.Parser().parse(__doc))", ctx);
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
