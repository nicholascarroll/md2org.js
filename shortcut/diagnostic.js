// md2org diagnostic. Paste into the "Transform Text with JavaScript" action in
// place of transform.js, run the Shortcut, and paste the result. It converts
// nothing; it reports what the JavaScript environment supports.

var report = [];

function note(label, value) { report.push(label + ": " + value); }

// 1. Did the input actually arrive?
try {
  note("typeof $text", typeof $text);
  if (typeof $text === "string") {
    note("input length", $text.length);
    note("input starts", JSON.stringify($text.slice(0, 40)));
  } else {
    note("input value", String($text));
  }
} catch (e) {
  note("input ERROR", e.message);
}

// 2. Unicode property escapes. commonmark.js uses /\p{P}/u to classify
//    punctuation; an engine that rejects it fails the whole script at parse time.
try {
  var re = new RegExp("[\\p{P}\\p{S}]", "u");
  note("unicode property escapes", re.test("!") ? "OK" : "compiled but wrong");
} catch (e) {
  note("unicode property escapes", "FAIL — " + e.message);
}

// 3. Other syntax the bundle relies on.
try {
  var f = new Function("return (() => 1)()");
  note("arrow functions", f() === 1 ? "OK" : "wrong");
} catch (e) {
  note("arrow functions", "FAIL — " + e.message);
}

try {
  var g = new Function("return `t` + String.fromCodePoint(65)");
  note("template + fromCodePoint", g() === "tA" ? "OK" : "wrong");
} catch (e) {
  note("template + fromCodePoint", "FAIL — " + e.message);
}

try {
  var h = new Function("var o = {a:1}; return Object.keys(o).length");
  note("basic object ops", h() === 1 ? "OK" : "wrong");
} catch (e) {
  note("basic object ops", "FAIL — " + e.message);
}

// 4. Can this action return a non-trivial string at all?
note("return path", "if you can read this, returning works");

return report.join("\n");
