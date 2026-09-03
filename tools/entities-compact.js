/*
 * Compact replacement for the `entities` package used by commonmark.js.
 *
 * Upstream's generated HTML entity table is 99 KB — about two thirds of the whole
 * parser bundle — because it carries all ~2100 named entities. This keeps numeric
 * references (which are cheap and general) and the named entities that actually
 * occur in prose.
 *
 * Cost: one CommonMark spec example (25), which tests names like &HilbertSpace;
 * and &ClockwiseContourIntegral;. Asserted in test/conformance.js.
 *
 * Add names here if real documents need them; each costs a few bytes.
 */
// minimal entity decode: numeric + the ~50 named entities that appear in real prose
const NAMED = {amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:"\u00a0",copy:"\u00a9",reg:"\u00ae",trade:"\u2122",hellip:"\u2026",mdash:"\u2014",ndash:"\u2013",lsquo:"\u2018",rsquo:"\u2019",ldquo:"\u201c",rdquo:"\u201d",bull:"\u2022",dagger:"\u2020",deg:"\u00b0",plusmn:"\u00b1",times:"\u00d7",divide:"\u00f7",frac12:"\u00bd",laquo:"\u00ab",raquo:"\u00bb",sect:"\u00a7",para:"\u00b6",middot:"\u00b7",eacute:"\u00e9",egrave:"\u00e8",agrave:"\u00e0",ccedil:"\u00e7",uuml:"\u00fc",ouml:"\u00f6",auml:"\u00e4",szlig:"\u00df",ntilde:"\u00f1",aacute:"\u00e1",iacute:"\u00ed",oacute:"\u00f3",uacute:"\u00fa",euro:"\u20ac",pound:"\u00a3",yen:"\u00a5",cent:"\u00a2",alpha:"\u03b1",beta:"\u03b2",gamma:"\u03b3",delta:"\u03b4",pi:"\u03c0",lambda:"\u03bb",mu:"\u03bc",infin:"\u221e",ne:"\u2260",le:"\u2264",ge:"\u2265",larr:"\u2190",rarr:"\u2192",harr:"\u2194"};
function decodeHTML(s){
  return s.replace(/&(?:#[xX]([0-9a-fA-F]+)|#(\d+)|([a-zA-Z][a-zA-Z0-9]*));/g,(m,hex,dec,name)=>{
    if(hex) return String.fromCodePoint(parseInt(hex,16)||0xFFFD);
    if(dec) return String.fromCodePoint(parseInt(dec,10)||0xFFFD);
    return NAMED[name]!==undefined?NAMED[name]:m;
  });
}
module.exports={decodeHTML,decodeHTMLStrict:decodeHTML,encodeHTML:s=>s,escape:s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))};
