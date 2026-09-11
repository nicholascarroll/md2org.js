/*
 * Compact replacement for the `entities` package used by commonmark.js.
 *
 * md2org decodes no character references at all. Not the named ones, and since
 * 1.1.0 not the numeric ones either. "&mdash;", "&#8212;" and "&#x2014;" all
 * reach the Org file exactly as the author typed them.
 *
 * The original reason for dropping named references was size: upstream's
 * generated table is 99 KB, about two thirds of the whole parser bundle, and
 * carrying it would put the Shortcut copy far past what its code field accepts.
 * Numeric references were kept because they are a rule rather than a table and
 * cost almost nothing.
 *
 * That left one construct with two answers, which is the thing this codebase
 * least wants. Resolving turned out to be the wrong half to keep, for a reason
 * that has nothing to do with bytes: decoding produces characters, and in Org
 * several of those characters are syntax.
 *
 *     &#42; foo   decoded to   "* foo"   which Org reads as a level-1 headline
 *     &#35; foo   decoded to   "# foo"   which Org reads as a comment, so the
 *                                        line is dropped from every export
 *
 * An author writes "&#42;" precisely to stop an asterisk being read as markup.
 * In an HTML renderer decoding it is safe, because "*" means nothing in HTML.
 * Decoding it into Org manufactures the markup the escape existed to prevent.
 * The same mistake as generating \vert{}, arriving from the other end.
 *
 * So the rule is now one sentence with no exceptions: md2org does not touch
 * character references. Passing them through is inert, and where a reader would
 * have seen an em dash they see "&#8212;" instead, which is a display loss and
 * not a structural one.
 *
 * Cost: thirteen CommonMark spec examples, asserted in test/conformance.js.
 */
function decodeHTML(s){ return s; }
module.exports={decodeHTML,decodeHTMLStrict:decodeHTML,encodeHTML:s=>s,escape:s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))};
