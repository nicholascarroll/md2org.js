/*
 * Regenerates the two derived copies of the core so they can't drift by hand:
 *   docs/md2org.js       — verbatim copy, loaded by the browser page
 *   shortcut/transform.js — core adapted to the Actions $text / return convention
 *
 * Run after editing src/md2org.js:  node build.js
 */
const fs = require("fs");

const core = fs.readFileSync("src/md2org.js", "utf8");

// 1. web copy: verbatim
fs.writeFileSync("docs/md2org.js", core);

// 2. shortcut copy: extract the function body, bind $text, return result
const start = core.indexOf("function md2org(src) {");
const bodyOpen = core.indexOf("{", start) + 1;
let depth = 1, i = bodyOpen;
while (depth > 0) { const c = core[i]; if (c === "{") depth++; else if (c === "}") depth--; i++; }
let body = core.slice(bodyOpen, i - 1).replace(/\bsrc\.split\b/, "$text.split");

const header =
  "// md2org — for the Actions app \"Transform Text with JavaScript\" action.\n" +
  "// Input arrives as $text; return the result. Generated from src/md2org.js.\n";
fs.writeFileSync("shortcut/transform.js", header + body.replace(/^\n/, "").replace(/\n\s*$/, "\n"));

// 3. verify parity
const md = require("./src/md2org.js");
const shortcutFn = new Function("$text", fs.readFileSync("shortcut/transform.js", "utf8"));
const webFn = require("./docs/md2org.js");
const probes = ["## x\n**b** _i_ `c`\n- one\n<!-- n -->", "```py\n#c\nx=a_b\n```", ""];
for (const s of probes) {
  if (md(s) !== shortcutFn(s)) throw new Error("shortcut/transform.js drifted");
  if (md(s) !== webFn(s)) throw new Error("docs/md2org.js drifted");
}
console.log("build ok — docs/md2org.js and shortcut/transform.js regenerated and verified");
