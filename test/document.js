/*
 * Document-scale inputs.
 *
 *   node test/document.js
 *
 * Every other tier feeds md2org a construct. This one feeds it a document.
 *
 * A defect that needs a table of contents in one section and the matching
 * headings in another cannot be reached by a test whose input is three lines
 * long, and neither can one that only shows up once a document is long enough
 * for two features to interact at a distance.
 *
 * The inputs are the repository's own Markdown. They are real multi-page
 * documents, they are always present, they cost nothing to maintain, and they
 * change as the project changes.
 *
 * WHAT THIS TIER CAN AND CANNOT SEE
 *
 * Two things limit it, and both are worth stating rather than discovering later.
 *
 * It asserts structural validity, which is what test/org-validate.js can judge
 * without being told the answer. It cannot see an *export* failure: a link Org
 * cannot resolve is structurally valid Org, and only Org knows the difference.
 * Document-scale export is checked in test/emacs.js.
 *
 * And its corpus is friendly. These documents are written by people who know
 * md2org, so they under-represent exactly the input most likely to break it.
 * That is why the adversarial cases live in test/warnings.js and the random ones
 * in test/fuzz.js: this tier is for scale and interaction, not for hostility,
 * and treating a green run here as broad assurance would be a mistake.
 *
 * Every finding is a hard failure. There used to be an exclusion here for an Org
 * entity inside a verbatim span, because an author may write "\vert{}" in a code
 * span — this repository's own documentation did, while documenting the feature —
 * and nothing in the output distinguished that from one md2org generated. md2org
 * generates no entities now, so the check itself is gone from
 * test/org-validate.js and the exclusion went with it.
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

// Real documents, in the repository, maintained for their own sake.
const DOCS = [
  "README.md",
  "DESIGN.md",
  "FEATURES.md",
  "CHANGELOG.md",
  path.join("specs", "README.md")
];

/*
 * The repository's own documents top out around 11 KB. A converter that is fine
 * at 11 KB can still fall over at 100 KB, and the Shortcut runs on a phone, so
 * one input is built well past anything the repo can offer. Assembled from the
 * corpus rather than from prose: every fragment there is a construct some other
 * tier tests in isolation, so this asks what happens when hundreds of them share
 * a document.
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
