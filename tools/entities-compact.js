/*
 * Compact replacement for the `entities` package used by commonmark.js.
 *
 * Upstream's generated HTML entity table is 99 KB — about two thirds of the whole
 * parser bundle — because it carries all ~2100 named entities. Numeric references
 * are kept: they are a rule rather than a table, so they cost almost nothing and
 * cover every code point.
 *
 * Named references are not decoded. Under DESIGN.md they are not markup md2org
 * converts: they pass through and appear in the output as the author wrote them.
 * That is a decision about the contract, not a limitation of this file — there is
 * no partial table here to extend, and adding one would put md2org back in the
 * business of choosing which of ~2100 names are worth carrying.
 *
 * It is also what keeps md2org from generating Org entities. The alternative
 * considered was rewriting "&name;" to Org's "\name{}", which reads well until a
 * name Org does not know reaches the export: HTML defines "apos" and "divide",
 * Org defines neither, and both would print as "\apos{}" and "\divide{}" in the
 * reader's face. Pass-through has no such cliff edge.
 *
 * Cost: seven CommonMark spec examples instead of one, asserted in
 * test/conformance.js.
 */
function decodeHTML(s){
  return s.replace(/&(?:#[xX]([0-9a-fA-F]+)|#(\d+));/g,(m,hex,dec)=>{
    if(hex) return String.fromCodePoint(parseInt(hex,16)||0xFFFD);
    return String.fromCodePoint(parseInt(dec,10)||0xFFFD);
  });
}
module.exports={decodeHTML,decodeHTMLStrict:decodeHTML,encodeHTML:s=>s,escape:s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))};
