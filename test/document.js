/*
 * Document-scale inputs.
 *
 *   node test/document.js
 *
 * Converts whole documents, the repository's own Markdown and a large synthetic
 * one, to find defects that arise only from interactions across a document. Each
 * must be structurally valid Org, satisfy Invariant 1 and balance its headings.
 *
 * Export failures are checked in test/emacs.js. These documents are written with
 * md2org in mind, so adversarial and random input is covered by test/warnings.js
 * and test/fuzz.js.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const md2org = require("../src/md2org.js");
const validate = require("./org-validate.js");
const invariant1 = require("./invariant.js");
const accountHeadings = require("./warnings.js");
const corpus = require("./corpus.js");

const root = path.join(__dirname, "..");

// The repository's own documents.
const DOCS = [
  "README.md",
  "DESIGN.md",
  "MAPPING.md",
  "CHANGELOG.md",
  path.join("specs", "README.md")
];

/*
 * A large document, well beyond the repository's own, built from the corpus so
 * that many constructs share one document.
 */
function syntheticDocument(copies) {
  const parts = [];
  for (let i = 0; i < copies; i++) {
    parts.push("## Section " + (i + 1));
    parts.push(corpus[i % corpus.length]);
  }
  return parts.join("\n\n") + "\n";
}

let failed = 0;

function check(name, src) {
  let out;
  const t0 = Date.now();
  try {
    out = md2org(src);
  } catch (e) {
    console.log("  FAIL " + name + " — crashed: " + (e && e.message ? e.message : e));
    failed++;
    return;
  }
  const ms = Date.now() - t0;

  const heading = accountHeadings(src);
  const problems = validate(out)
    .concat(invariant1(src, out))
    .concat(heading ? ["invariant 4: " + heading] : []);
  const hard = problems;

  const size = (src.length / 1024).toFixed(1) + " KB";

  if (hard.length) {
    console.log("  FAIL " + name + "  (" + size + ")");
    hard.slice(0, 5).forEach(p => console.log("         " + p));
    if (hard.length > 5) console.log("         … and " + (hard.length - 5) + " more");
    failed++;
    return;
  }

  // An empty output from a non-empty document means the whole thing was
  // swallowed. Structurally that is valid Org; as a conversion it is total loss.
  if (src.trim() && !out.trim()) {
    console.log("  FAIL " + name + " — non-empty input produced empty output");
    failed++;
    return;
  }

  console.log("  ok   " + name.padEnd(22) + size.padStart(9) +
              "  ->" + ((out.length / 1024).toFixed(1) + " KB").padStart(9) +
              "  " + ms + "ms");
}

console.log("DOCUMENT SCALE");

for (const rel of DOCS) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  check(rel, fs.readFileSync(file, "utf8"));
}

check("synthetic x400", syntheticDocument(400));
check("synthetic x6000", syntheticDocument(6000));

// Every document at once: the largest input the repository can produce, and the
// one most likely to surface a defect that needs distance between two features.
check("all docs concatenated", DOCS
  .map(r => path.join(root, r))
  .filter(f => fs.existsSync(f))
  .map(f => fs.readFileSync(f, "utf8"))
  .join("\n\n"));

console.log("");
console.log(failed ? "  " + failed + " failed" : "  all document-scale inputs valid");
process.exit(failed ? 1 : 0);
