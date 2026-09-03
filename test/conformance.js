/*
 * Parse conformance of the forked CommonMark parser against the spec's own HTML.
 *
 *   node test/conformance.js
 *
 * Expected: 639/652. All thirteen failures are character references, which md2org
 * does not decode (DESIGN.md, Character references and entities): examples 25-27
 * test references directly, and the rest use one where the spec expects it
 * decoded, such as a link destination or info string. The count is asserted so
 * that no other failure can join them unnoticed.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const extract = require("./extract.js");

const EXPECTED_TOTAL = 652;
const EXPECTED_PASS = 639;
const EXPECTED_FAILURES = [25, 26, 27, 32, 33, 34, 37, 38, 39, 40, 41, 503, 506];

/*
 * The same examples against src/vendor/commonmark-entities.js, the parser behind
 * the -e option, which decodes references and so passes all 652.
 * tools/build-vendor.js reads these constants for the headers it generates.
 */
const EXPECTED_PASS_ENTITIES = 652;

/*
 * Parses with the shipped parser, src/vendor/commonmark.js; the test bundle
 * supplies only the HTML renderer. The bundle is an IIFE assigning a global, so
 * it is loaded in a vm context.
 */
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, "vendor-cmark-html.js"), "utf8"), ctx);
const HtmlRenderer = vm.runInContext("CM", ctx).HtmlRenderer;
const Parser = require("../src/vendor/commonmark.js").Parser;
const EntityParser = require("../src/vendor/commonmark-entities.js").Parser;

const examples = extract(extract.SPEC);

function measure(P) {
  let pass = 0;
  const failures = [];
  for (const e of examples) {
    let got;
    try {
      got = new HtmlRenderer().render(new P().parse(e.markdown + "\n"));
    } catch (err) {
      failures.push(e.n);
      continue;
    }
    const want = e.html === "" ? "" : e.html + "\n";
    if (got === want) pass++; else failures.push(e.n);
  }
  return { pass, failures };
}

const { pass, failures } = measure(Parser);
const withEntities = measure(EntityParser);

console.log("PARSE CONFORMANCE   " + pass + "/" + examples.length +
            "  (" + (pass / examples.length * 100).toFixed(1) + "%)");
console.log("  with -e            " + withEntities.pass + "/" + examples.length +
            "  (" + (withEntities.pass / examples.length * 100).toFixed(1) + "%)");

let bad = 0;
if (examples.length !== EXPECTED_TOTAL) {
  console.log("  FAIL extracted " + examples.length + " examples, expected " + EXPECTED_TOTAL);
  bad++;
}
// Example 207 is a bare link reference definition and renders nothing. Asserting
// it detects an extraction error that empties the examples.
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
if (withEntities.pass !== EXPECTED_PASS_ENTITIES) {
  console.log("  FAIL with -e expected " + EXPECTED_PASS_ENTITIES + " passing, got " +
              withEntities.pass + " with " + JSON.stringify(withEntities.failures));
  bad++;
}
if (!bad) console.log("  both parsers match their documented conformance");
process.exit(bad ? 1 : 0);
