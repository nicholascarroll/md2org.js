/*
 * Replacement for the `entities` package used by commonmark.js. It decodes
 * nothing, so every character reference passes through as written (DESIGN.md,
 * Character references and entities).
 *
 * This costs thirteen CommonMark spec examples, asserted in test/conformance.js.
 */
function decodeHTML(s){ return s; }
module.exports={decodeHTML,decodeHTMLStrict:decodeHTML,encodeHTML:s=>s,escape:s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))};
