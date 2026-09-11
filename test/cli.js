/*
 * CLI contract for bin/md2org.
 *
 * The other tiers all test the core function. This one tests the wrapper, because
 * the wrapper had its own bugs that no amount of conversion testing could reach:
 * an unrecognised option fell through to the stdin branch and the command sat
 * there waiting for input that was never coming, and output went out with no
 * trailing newline, so `md2org notes.md > notes.org` produced a file whose last
 * line had no terminator.
 *
 * Everything here shells out for real. Requiring the module and calling a function
 * would test something other than what a user runs.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const BIN = path.join(__dirname, "..", "bin", "md2org");
const VERSION = require("../package.json").version;

let pass = 0, fail = 0;

// Every case pipes something to stdin, even when it should be ignored: a case
// that wrongly falls through to reading stdin would otherwise hang the suite
// rather than fail it.
function run(args, stdin) {
  return spawnSync(process.execPath, [BIN].concat(args), {
    input: stdin === undefined ? "" : stdin,
    encoding: "utf8",
    timeout: 10000
  });
}

function check(name, fn) {
  try {
    fn();
    console.log("  ok   " + name);
    pass++;
  } catch (e) {
    console.log("  FAIL " + name + "\n         " + e.message);
    fail++;
  }
}

function eq(actual, expected, what) {
  if (actual !== expected) {
    throw new Error(what + "\n         expected: " + JSON.stringify(expected) +
                    "\n         actual:   " + JSON.stringify(actual));
  }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "md2org-cli-"));
const doc = path.join(tmp, "doc.md");
fs.writeFileSync(doc, "# H\n\n- a\n");

console.log("CLI");

check("converts a file argument", () => {
  const r = run([doc]);
  eq(r.status, 0, "exit status");
  eq(r.stdout, "* H\n\n- a\n", "stdout");
});

check("converts stdin", () => {
  const r = run([], "# H\n");
  eq(r.status, 0, "exit status");
  eq(r.stdout, "* H\n", "stdout");
});

check("'-' means stdin", () => {
  const r = run(["-"], "# H\n");
  eq(r.status, 0, "exit status");
  eq(r.stdout, "* H\n", "stdout");
});

// A POSIX text file ends in a newline. Without one, `cat` runs into the next
// prompt and diffs report "\ No newline at end of file".
check("output ends with exactly one newline", () => {
  const r = run([doc]);
  if (!r.stdout.endsWith("\n")) throw new Error("no trailing newline");
  if (r.stdout.endsWith("\n\n")) throw new Error("more than one trailing newline");
});

check("empty input produces empty output, not a newline", () => {
  const r = run([], "");
  eq(r.status, 0, "exit status");
  eq(r.stdout, "", "stdout");
});

/*
 * -e is the only flag that changes the conversion rather than the plumbing, and it
 * is the one place the CLI and the Shortcut deliberately differ, so the default
 * must be asserted alongside it: a regression that turned decoding on would
 * otherwise look like a passing suite.
 */
check("references pass through by default", () => {
  const r = run([], "A &mdash; B and &#8212;\n");
  eq(r.status, 0, "exit status");
  eq(r.stdout, "A &mdash; B and &#8212;\n", "stdout");
});

check("-e decodes references to their characters", () => {
  const r = run(["-e"], "A &mdash; B and &#8212;\n");
  eq(r.status, 0, "exit status");
  eq(r.stdout, "A — B and —\n", "stdout");
});

check("--entities is the same as -e", () => {
  eq(run(["--entities"], "A &mdash; B\n").stdout, run(["-e"], "A &mdash; B\n").stdout, "stdout");
});

check("-e is listed in the usage", () => {
  if (!/-e, --entities/.test(run(["--help"]).stdout)) {
    throw new Error("the usage does not mention -e");
  }
});

check("--help exits 0 and writes usage to stdout", () => {
  const r = run(["--help"]);
  eq(r.status, 0, "exit status");
  if (!/Usage:/.test(r.stdout)) throw new Error("no usage on stdout");
});

check("-h is the same as --help", () => {
  eq(run(["-h"]).stdout, run(["--help"]).stdout, "stdout");
});

check("--version prints the package version", () => {
  const r = run(["--version"]);
  eq(r.status, 0, "exit status");
  eq(r.stdout, VERSION + "\n", "stdout");
});

check("-v is the same as --version", () => {
  eq(run(["-v"]).stdout, VERSION + "\n", "stdout");
});

// The regression this file exists for: an unknown option used to be ignored and
// the command blocked on stdin, so a typo produced silence.
check("unknown option fails instead of reading stdin", () => {
  const r = run(["--bogus"], "# H\n");
  eq(r.status, 2, "exit status");
  eq(r.stdout, "", "stdout should be empty");
  if (!/unknown option --bogus/.test(r.stderr)) {
    throw new Error("stderr did not name the option: " + JSON.stringify(r.stderr));
  }
});

check("more than one file argument fails", () => {
  const r = run([doc, doc]);
  eq(r.status, 2, "exit status");
  if (!/at most one file/.test(r.stderr)) throw new Error("unhelpful stderr");
});

check("unreadable file exits 1 with the reason on stderr", () => {
  const r = run([path.join(tmp, "nope.md")]);
  eq(r.status, 1, "exit status");
  eq(r.stdout, "", "stdout should be empty");
  if (!/cannot read/.test(r.stderr)) throw new Error("unhelpful stderr");
});

// Diagnostics belong on stderr so that `md2org bad.md > out.org` leaves out.org
// empty rather than filled with an error message.
check("diagnostics never land on stdout", () => {
  for (const args of [["--bogus"], [path.join(tmp, "nope.md")], [doc, doc]]) {
    eq(run(args).stdout, "", "stdout for " + JSON.stringify(args));
  }
});

check("file argument and stdin agree", () => {
  const viaFile = run([doc]).stdout;
  const viaPipe = run([], fs.readFileSync(doc, "utf8")).stdout;
  eq(viaPipe, viaFile, "the two input paths");
});

check("UTF-8 survives both input paths", () => {
  const u = path.join(tmp, "u.md");
  fs.writeFileSync(u, "# 日本語 — café 🥷\n");
  eq(run([u]).stdout, "* 日本語 — café 🥷\n", "file");
  eq(run([], "# 日本語 — café 🥷\n").stdout, "* 日本語 — café 🥷\n", "stdin");
});

fs.rmSync(tmp, { recursive: true, force: true });

console.log("");
console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
