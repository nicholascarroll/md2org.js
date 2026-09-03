/*
 * Vendored CommonMark parser (parse phase only).
 *
 * Source:  commonmark.js 0.31.2  —  https://github.com/commonmark/commonmark.js
 * License: BSD-2-Clause (see src/vendor/LICENSE-commonmark)
 *
 * Built from lib/blocks.js with the 99 KB html-entity table replaced by
 * tools/entities-compact.js. Everything else is upstream. Exposes
 * __cmark.Parser; the HTML renderer is not included, since md2org never emits
 * HTML.
 *
 * Conformance: 651/652 CommonMark 0.31.2 spec examples, asserted by
 * test/conformance.js. The exception is example 25 — see tools/entities-compact.js.
 *
 * Regenerate: node tools/build-vendor.js
 */
var __cmark=(()=>{var He=Object.create;var T=Object.defineProperty;var $e=Object.getOwnPropertyDescriptor;var Ze=Object.getOwnPropertyNames;var qe=Object.getPrototypeOf,Ge=Object.prototype.hasOwnProperty;var A=(e,t,n)=>()=>{if(n)throw n[0];try{return e&&(t=e(e=0)),t}catch(i){throw n=
[i],i}};var P=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(n){
throw t=0,n}},Ke=(e,t)=>{for(var n in t)T(e,n,{get:t[n],enumerable:!0})},Y=(e,t,n,i)=>{
if(t&&typeof t=="object"||typeof t=="function")for(let r of Ze(t))!Ge.call(e,r)&&
r!==n&&T(e,r,{get:()=>t[r],enumerable:!(i=$e(t,r))||i.enumerable});return e};var z=(e,t,n)=>(n=e!=null?He(qe(e)):{},Y(t||!e||!e.__esModule?T(n,"default",{value:e,
enumerable:!0}):n,e)),We=e=>Y(T({},"__esModule",{value:!0}),e);function J(e){switch(e._type){case"document":case"block_quote":case"list":case"i\
tem":case"paragraph":case"heading":case"emph":case"strong":case"strikethrough":case"\
table":case"table_row":case"table_cell":case"footnote_definition":case"link":case"\
image":case"custom_inline":case"custom_block":return!0;default:return!1}}var Xe,
Qe,Ve,g,f,p,U=A(()=>{"use strict";Xe=function(e,t){this.current=e,this.entering=
t===!0},Qe=function(){var e=this.current,t=this.entering;if(e===null)return null;
var n=J(e);return t&&n?e._firstChild?(this.current=e._firstChild,this.entering=!0):
this.entering=!1:e===this.root?this.current=null:e._next===null?(this.current=e.
_parent,this.entering=!1):(this.current=e._next,this.entering=!0),{entering:t,node:e}},
Ve=function(e){return{current:e,root:e,entering:!0,next:Qe,resumeAt:Xe}},g=function(e,t){
this._type=e,this._parent=null,this._firstChild=null,this._lastChild=null,this._prev=
null,this._next=null,this._sourcepos=t,this._open=!0,this._string_content=null,this.
_literal=null,this._listData={},this._info=null,this._destination=null,this._title=
null,this._isFenced=!1,this._fenceChar=null,this._fenceLength=0,this._fenceOffset=
null,this._level=null,this._onEnter=null,this._onExit=null},f=g.prototype;Object.
defineProperty(f,"isContainer",{get:function(){return J(this)}});Object.defineProperty(
f,"type",{get:function(){return this._type}});Object.defineProperty(f,"firstChil\
d",{get:function(){return this._firstChild}});Object.defineProperty(f,"lastChild",
{get:function(){return this._lastChild}});Object.defineProperty(f,"next",{get:function(){
return this._next}});Object.defineProperty(f,"prev",{get:function(){return this.
_prev}});Object.defineProperty(f,"parent",{get:function(){return this._parent}});
Object.defineProperty(f,"sourcepos",{get:function(){return this._sourcepos}});Object.
defineProperty(f,"literal",{get:function(){return this._literal},set:function(e){
this._literal=e}});Object.defineProperty(f,"destination",{get:function(){return this.
_destination},set:function(e){this._destination=e}});Object.defineProperty(f,"ti\
tle",{get:function(){return this._title},set:function(e){this._title=e}});Object.
defineProperty(f,"info",{get:function(){return this._info},set:function(e){this.
_info=e}});Object.defineProperty(f,"level",{get:function(){return this._level},set:function(e){
this._level=e}});Object.defineProperty(f,"listType",{get:function(){return this.
_listData.type},set:function(e){this._listData.type=e}});Object.defineProperty(f,
"listTight",{get:function(){return this._listData.tight},set:function(e){this._listData.
tight=e}});Object.defineProperty(f,"listStart",{get:function(){return this._listData.
start},set:function(e){this._listData.start=e}});Object.defineProperty(f,"listDe\
limiter",{get:function(){return this._listData.delimiter},set:function(e){this._listData.
delimiter=e}});Object.defineProperty(f,"onEnter",{get:function(){return this._onEnter},
set:function(e){this._onEnter=e}});Object.defineProperty(f,"onExit",{get:function(){
return this._onExit},set:function(e){this._onExit=e}});g.prototype.appendChild=function(e){
e.unlink(),e._parent=this,this._lastChild?(this._lastChild._next=e,e._prev=this.
_lastChild,this._lastChild=e):(this._firstChild=e,this._lastChild=e)};g.prototype.
prependChild=function(e){e.unlink(),e._parent=this,this._firstChild?(this._firstChild.
_prev=e,e._next=this._firstChild,this._firstChild=e):(this._firstChild=e,this._lastChild=
e)};g.prototype.unlink=function(){this._prev?this._prev._next=this._next:this._parent&&
(this._parent._firstChild=this._next),this._next?this._next._prev=this._prev:this.
_parent&&(this._parent._lastChild=this._prev),this._parent=null,this._next=null,
this._prev=null};g.prototype.insertAfter=function(e){e.unlink(),e._next=this._next,
e._next&&(e._next._prev=e),e._prev=this,this._next=e,e._parent=this._parent,e._next||
(e._parent._lastChild=e)};g.prototype.insertBefore=function(e){e.unlink(),e._prev=
this._prev,e._prev&&(e._prev._next=e),e._next=this,this._prev=e,e._parent=this._parent,
e._prev||(e._parent._firstChild=e)};g.prototype.walker=function(){var e=new Ve(this);
return e};p=g});var ne=P((Gn,te)=>{"use strict";var ee={};function Ye(e){var t,n,i=ee[e];if(i)return i;
for(i=ee[e]=[],t=0;t<128;t++)n=String.fromCharCode(t),/^[0-9a-z]$/i.test(n)?i.push(
n):i.push("%"+("0"+t.toString(16).toUpperCase()).slice(-2));for(t=0;t<e.length;t++)
i[e.charCodeAt(t)]=e[t];return i}function y(e,t,n){var i,r,s,l,a,o="";for(typeof t!=
"string"&&(n=t,t=y.defaultChars),typeof n>"u"&&(n=!0),a=Ye(t),i=0,r=e.length;i<r;i++){
if(s=e.charCodeAt(i),n&&s===37&&i+2<r&&/^[0-9a-f]{2}$/i.test(e.slice(i+1,i+3))){
o+=e.slice(i,i+3),i+=2;continue}if(s<128){o+=a[s];continue}if(s>=55296&&s<=57343){
if(s>=55296&&s<=56319&&i+1<r&&(l=e.charCodeAt(i+1),l>=56320&&l<=57343)){o+=encodeURIComponent(
e[i]+e[i+1]),i++;continue}o+="%EF%BF%BD";continue}o+=encodeURIComponent(e[i])}return o}
y.defaultChars=";/?:@&=+$,-_.!~*'()#";y.componentChars="-_.!~*'()";te.exports=y});var R=P((Kn,se)=>{var ie={amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:"\xA0",copy:"\
\xA9",reg:"\xAE",trade:"\u2122",hellip:"\u2026",mdash:"\u2014",ndash:"\u2013",lsquo:"\
\u2018",rsquo:"\u2019",ldquo:"\u201C",rdquo:"\u201D",bull:"\u2022",dagger:"\u2020",
deg:"\xB0",plusmn:"\xB1",times:"\xD7",divide:"\xF7",frac12:"\xBD",laquo:"\xAB",raquo:"\
\xBB",sect:"\xA7",para:"\xB6",middot:"\xB7",eacute:"\xE9",egrave:"\xE8",agrave:"\
\xE0",ccedil:"\xE7",uuml:"\xFC",ouml:"\xF6",auml:"\xE4",szlig:"\xDF",ntilde:"\xF1",
aacute:"\xE1",iacute:"\xED",oacute:"\xF3",uacute:"\xFA",euro:"\u20AC",pound:"\xA3",
yen:"\xA5",cent:"\xA2",alpha:"\u03B1",beta:"\u03B2",gamma:"\u03B3",delta:"\u03B4",
pi:"\u03C0",lambda:"\u03BB",mu:"\u03BC",infin:"\u221E",ne:"\u2260",le:"\u2264",ge:"\
\u2265",larr:"\u2190",rarr:"\u2192",harr:"\u2194"};function re(e){return e.replace(
/&(?:#[xX]([0-9a-fA-F]+)|#(\d+)|([a-zA-Z][a-zA-Z0-9]*));/g,(t,n,i,r)=>n?String.fromCodePoint(
parseInt(n,16)||65533):i?String.fromCodePoint(parseInt(i,10)||65533):ie[r]!==void 0?
ie[r]:t)}se.exports={decodeHTML:re,decodeHTMLStrict:re,encodeHTML:e=>e,escape:e=>e.
replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t])}});var ae,le,Je,j,oe,et,tt,nt,it,rt,st,at,I,F,lt,ot,ut,ht,ct,ue,ft,M,pt,dt,Wn,vt,w,
he,H=A(()=>{"use strict";ae=z(ne(),1),le=z(R(),1),Je=92,j="&(?:#x[a-f0-9]{1,6}|#\
[0-9]{1,7}|[a-z][a-z0-9]{1,31});",oe="[A-Za-z][A-Za-z0-9-]*",et="[a-zA-Z_:][a-zA\
-Z0-9:._-]*",tt="[^\"'=<>`\\x00-\\x20]+",nt="'[^']*'",it='"[^"]*"',rt="(?:"+tt+"\
|"+nt+"|"+it+")",st="(?:\\s*=\\s*"+rt+")",at="(?:\\s+"+et+st+"?)",I="<"+oe+at+"*\
\\s*/?>",F="</"+oe+"\\s*[>]",lt="<!-->|<!--->|<!--[\\s\\S]*?-->",ot="[<][?][\\s\\S\
]*?[?][>]",ut="<![A-Za-z]+[^>]*>",ht="<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",ct="(?:"+I+
"|"+F+"|"+lt+"|"+ot+"|"+ut+"|"+ht+")",ue=new RegExp("^"+ct),ft=/[\\&]/,M="[!\"#$%\
&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]",pt=new RegExp("\\\\"+M+"|"+j,"gi"),dt='[&<>"]',
Wn=new RegExp(dt,"g"),vt=function(e){return e.charCodeAt(0)===Je?e.charAt(1):(0,le.decodeHTMLStrict)(
e)},w=function(e){return ft.test(e)?e.replace(pt,vt):e},he=function(e){try{return(0,ae.default)(
e)}catch{return e}}});function b(e){return $(e)}var $,ce,fe,pe=A(()=>{"use strict";String.fromCodePoint?
$=function(e){try{return String.fromCodePoint(e)}catch(t){if(t instanceof RangeError)
return"\uFFFD";throw t}}:(ce=String.fromCharCode,fe=Math.floor,$=function(){var e=16384,
t=[],n,i,r=-1,s=arguments.length;if(!s)return"";for(var l="";++r<s;){var a=Number(
arguments[r]);if(!isFinite(a)||a<0||a>1114111||fe(a)!==a)return"\uFFFD";a<=65535?
t.push(a):(a-=65536,n=(a>>10)+55296,i=a%1024+56320,t.push(n,i)),(r+1===s||t.length>
e)&&(l+=ce.apply(null,t),t.length=0)}return l})});function hn(e){return{subject:"",delimiters:null,brackets:null,pos:0,refmap:{},match:jt,
peek:It,spnl:Ft,parseBackticks:Mt,parseBackslash:Ht,parseAutolink:$t,parseHtmlTag:Zt,
scanDelims:qt,handleDelim:Gt,parseLinkTitle:Xt,parseLinkDestination:Qt,parseLinkLabel:Vt,
parseOpenBracket:Yt,parseBang:Jt,parseCloseBracket:en,addBracket:tn,removeBracket:nn,
parseEntity:rn,parseString:sn,parseNewline:an,parseReference:ln,parseInline:on,processEmphasis:Wt,
removeDelimiter:Kt,options:e||{},parse:un}}var ge,O,q,Ce,G,D,mt,xe,gt,ke,Ct,Le,xt,
Ne,K,kt,C,x,W,Ae,Z,Lt,Nt,de,At,bt,be,Et,Tt,yt,wt,Ot,Dt,Bt,St,Ee,ve,Pt,zt,_e,Ut,Rt,
d,Te,jt,It,Ft,Mt,Ht,$t,Zt,qt,Gt,Kt,me,Wt,Xt,Qt,Vt,Yt,Jt,en,tn,nn,rn,sn,an,ln,on,
un,ye,we=A(()=>{"use strict";U();H();pe();ge=z(R(),1),O=he,q=w,Ce=10,G=42,D=95,mt=
96,xe=91,gt=93,ke=60,Ct=33,Le=92,xt=38,Ne=40,K=41,kt=58,C=39,x=34,W=126,Ae=M,Z="\
\\\\"+Ae,Lt=j,Nt=ue,de=new RegExp(/^[!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~\p{P}\p{S}]/u),
At=new RegExp('^(?:"('+Z+`|\\\\[^\\\\]|[^\\\\"\\x00])*"|'(`+Z+"|\\\\[^\\\\]|[^\\\\'\\x0\
0])*'|\\(("+Z+"|\\\\[^\\\\]|[^\\\\()\\x00])*\\))"),bt=/^(?:<(?:[^<>\n\\\x00]|\\.)*>)/,
be=new RegExp("^"+Ae),Et=new RegExp("^"+Lt,"i"),Tt=/`+/,yt=/^`+/,wt=/\.\.\./g,Ot=
/--+/g,Dt=/^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/,
Bt=/^<[A-Za-z][A-Za-z0-9.+-]{1,31}:[^<>\x00-\x20]*>/i,St=/^ *(?:\n *)?/,Ee=/^[ \t\n\x0b\x0c\x0d]/,
ve=/^\s/,Pt=/ *$/,zt=/^ */,_e=/^ *(?:\n|$)/,Ut=/^\[(?:[^\\\[\]]|\\.){0,1000}\]/s,
Rt=/^[^\n`\[\]\\!<&*_'"~]+/m,d=function(e){var t=new p("text");return t._literal=
e,t},Te=function(e){return e.slice(1,e.length-1).trim().replace(/[ \t\r\n]+/g," ").
toLowerCase().toUpperCase()},jt=function(e){var t=e.exec(this.subject.slice(this.
pos));return t===null?null:(this.pos+=t.index+t[0].length,t[0])},It=function(){return this.
pos<this.subject.length?this.subject.charCodeAt(this.pos):-1},Ft=function(){return this.
match(St),!0},Mt=function(e){var t=this.match(yt);if(t===null)return!1;for(var n=this.
pos,i,r,s;(i=this.match(Tt))!==null;)if(i===t)return r=new p("code"),s=this.subject.
slice(n,this.pos-t.length).replace(/\n/gm," "),s.length>0&&s.match(/[^ ]/)!==null&&
s[0]==" "&&s[s.length-1]==" "?r._literal=s.slice(1,s.length-1):r._literal=s,e.appendChild(
r),!0;return this.pos=n,e.appendChild(d(t)),!0},Ht=function(e){var t=this.subject,
n;return this.pos+=1,this.peek()===Ce?(this.pos+=1,n=new p("linebreak"),e.appendChild(
n)):be.test(t.charAt(this.pos))?(e.appendChild(d(t.charAt(this.pos))),this.pos+=
1):e.appendChild(d("\\")),!0},$t=function(e){var t,n,i;return(t=this.match(Dt))?
(n=t.slice(1,t.length-1),i=new p("link"),i._destination=O("mailto:"+n),i._title=
"",i.appendChild(d(n)),e.appendChild(i),!0):(t=this.match(Bt))?(n=t.slice(1,t.length-
1),i=new p("link"),i._destination=O(n),i._title="",i.appendChild(d(n)),e.appendChild(
i),!0):!1},Zt=function(e){var t=this.match(Nt);if(t===null)return!1;var n=new p(
"html_inline");return n._literal=t,e.appendChild(n),!0},qt=function(e){var t=0,n,
i,r,s=this.pos,l,a,o,u,h,v,c,_;if(e===C||e===x)t++,this.pos++;else for(;this.peek()===
e;)t++,this.pos++;return t===0?null:(n=s===0?`
`:this.subject.charAt(s-1),r=this.peek(),r===-1?i=`
`:i=b(r),h=ve.test(i),v=de.test(i),c=ve.test(n),_=de.test(n),l=!h&&(!v||c||_),a=
!c&&(!_||h||v),e===D?(o=l&&(!a||_),u=a&&(!l||v)):e===C||e===x?(o=l&&!a,u=a):(o=l,
u=a),this.pos=s,{numdelims:t,can_open:o,can_close:u})},Gt=function(e,t){var n=this.
scanDelims(e);if(!n)return!1;var i=n.numdelims,r=this.pos,s;this.pos+=i,e===C?s=
"\u2019":e===x?s="\u201C":s=this.subject.slice(r,this.pos);var l=d(s);return t.appendChild(
l),(n.can_open||n.can_close)&&(this.options.smart||e!==C&&e!==x)&&(this.delimiters=
{cc:e,numdelims:i,origdelims:i,node:l,previous:this.delimiters,next:null,can_open:n.
can_open,can_close:n.can_close},this.delimiters.previous!==null&&(this.delimiters.
previous.next=this.delimiters)),!0},Kt=function(e){e.previous!==null&&(e.previous.
next=e.next),e.next===null?this.delimiters=e.previous:e.next.previous=e.previous},
me=function(e,t){e.next!==t&&(e.next=t,t.previous=e)},Wt=function(e){for(var t,n,
i,r,s,l,a,o,u,h,v=[],c,_=!1,k=0;k<14;k++)v[k]=e;for(n=this.delimiters;n!==null&&
n.previous!==e;)n=n.previous;for(;n!==null;){var L=n.cc;if(!n.can_close)n=n.next;else{
switch(t=n.previous,h=!1,L){case C:c=0;break;case x:c=1;break;case D:c=2+(n.can_open?
3:0)+n.origdelims%3;break;case G:c=8+(n.can_open?3:0)+n.origdelims%3;break;case W:
c=14;break}for(;t!==null&&t!==e&&t!==v[c];){if(_=(n.can_open||t.can_close)&&n.origdelims%
3!==0&&(t.origdelims+n.origdelims)%3===0,t.cc===n.cc&&t.can_open&&!_){h=!0;break}
t=t.previous}if(i=n,L===W)if(!h||n.numdelims<2||t.numdelims<2)n=n.next;else{r=t.
node,s=n.node,t.numdelims-=2,n.numdelims-=2,r._literal=r._literal.slice(0,r._literal.
length-2),s._literal=s._literal.slice(0,s._literal.length-2);for(var Q=new p("st\
rikethrough"),N=r._next;N&&N!==s;){var Me=N._next;Q.appendChild(N),N=Me}r.insertAfter(
Q),me(t,n),t.numdelims===0&&(r.unlink(),this.removeDelimiter(t)),n.numdelims===0&&
(s.unlink(),l=n.next,this.removeDelimiter(n),n=l)}else if(L===G||L===D)if(!h)n=n.
next;else{a=n.numdelims>=2&&t.numdelims>=2?2:1,r=t.node,s=n.node,t.numdelims-=a,
n.numdelims-=a,r._literal=r._literal.slice(0,r._literal.length-a),s._literal=s._literal.
slice(0,s._literal.length-a);var V=new p(a===1?"emph":"strong");for(o=r._next;o&&
o!==s;)u=o._next,o.unlink(),V.appendChild(o),o=u;r.insertAfter(V),me(t,n),t.numdelims===
0&&(r.unlink(),this.removeDelimiter(t)),n.numdelims===0&&(s.unlink(),l=n.next,this.
removeDelimiter(n),n=l)}else L===C?(n.node._literal="\u2019",h&&(t.node._literal=
"\u2018"),n=n.next):L===x&&(n.node._literal="\u201D",h&&(t.node.literal="\u201C"),
n=n.next);h||(v[c]=i.previous,i.can_open||this.removeDelimiter(i))}}for(;this.delimiters!==
null&&this.delimiters!==e;)this.removeDelimiter(this.delimiters)},Xt=function(){
var e=this.match(At);return e===null?null:q(e.slice(1,-1))},Qt=function(){var e=this.
match(bt);if(e===null){if(this.peek()===ke)return null;for(var t=this.pos,n=0,i;(i=
this.peek())!==-1;)if(i===Le&&be.test(this.subject.charAt(this.pos+1)))this.pos+=
1,this.peek()!==-1&&(this.pos+=1);else if(i===Ne)this.pos+=1,n+=1;else if(i===K){
if(n<1)break;this.pos+=1,n-=1}else{if(Ee.exec(b(i))!==null)break;this.pos+=1}return this.
pos===t&&i!==K||n!==0?null:(e=this.subject.slice(t,this.pos),O(q(e)))}else return O(
q(e.slice(1,-1)))},Vt=function(){var e=this.match(Ut);return e===null||e.length>
1001?0:e.length},Yt=function(e){var t=this.pos,n=this.match(/^\[\^[^\]]+\]/);if(n){
var i=new p("footnote_reference");return i._label=n.slice(2,-1),e.appendChild(i),
!0}this.pos+=1;var r=d("[");return e.appendChild(r),this.addBracket(r,t,!1),!0},
Jt=function(e){var t=this.pos;if(this.pos+=1,this.peek()===xe){this.pos+=1;var n=d(
"![");e.appendChild(n),this.addBracket(n,t+1,!0)}else e.appendChild(d("!"));return!0},
en=function(e){var t,n,i,r,s=!1,l,a;if(this.pos+=1,t=this.pos,a=this.brackets,a===
null)return e.appendChild(d("]")),!0;if(!a.active)return e.appendChild(d("]")),this.
removeBracket(),!0;n=a.image;var o=this.pos;if(this.peek()===Ne&&(this.pos++,this.
spnl()&&(i=this.parseLinkDestination())!==null&&this.spnl()&&(Ee.test(this.subject.
charAt(this.pos-1))&&(r=this.parseLinkTitle())||!0)&&this.spnl()&&this.peek()===
K?(this.pos+=1,s=!0):this.pos=o),!s){var u=this.pos,h=this.parseLinkLabel();if(h>
2?l=this.subject.slice(u,u+h):a.bracketAfter||(l=this.subject.slice(a.index,t)),
h===0&&(this.pos=o),l){var v=this.refmap[Te(l)];v&&(i=v.destination,r=v.title,s=
!0)}}if(s){var c=new p(n?"image":"link");c._destination=i,c._title=r||"";var _,k;
for(_=a.node._next;_;)k=_._next,_.unlink(),c.appendChild(_),_=k;if(e.appendChild(
c),this.processEmphasis(a.previousDelimiter),this.removeBracket(),a.node.unlink(),
!n)for(a=this.brackets;a!==null;)a.image||(a.active=!1),a=a.previous;return!0}else
return this.removeBracket(),this.pos=t,e.appendChild(d("]")),!0},tn=function(e,t,n){
this.brackets!==null&&(this.brackets.bracketAfter=!0),this.brackets={node:e,previous:this.
brackets,previousDelimiter:this.delimiters,index:t,image:n,active:!0}},nn=function(){
this.brackets=this.brackets.previous},rn=function(e){var t;return(t=this.match(Et))?
(e.appendChild(d((0,ge.decodeHTMLStrict)(t))),!0):!1},sn=function(e){var t;return(t=
this.match(Rt))?(this.options.smart?e.appendChild(d(t.replace(wt,"\u2026").replace(
Ot,function(n){var i=0,r=0;return n.length%3===0?r=n.length/3:n.length%2===0?i=n.
length/2:n.length%3===2?(i=1,r=(n.length-2)/3):(i=2,r=(n.length-4)/3),"\u2014".repeat(
r)+"\u2013".repeat(i)}))):e.appendChild(d(t)),!0):!1},an=function(e){this.pos+=1;
var t=e._lastChild;if(t&&t.type==="text"&&t._literal[t._literal.length-1]===" "){
var n=t._literal[t._literal.length-2]===" ";t._literal=t._literal.replace(Pt,""),
e.appendChild(new p(n?"linebreak":"softbreak"))}else e.appendChild(new p("softbr\
eak"));return this.match(zt),!0},ln=function(e,t){this.subject=e,this.pos=0;var n,
i,r,s,l=this.pos;if(s=this.parseLinkLabel(),s===0)return 0;if(n=this.subject.slice(
0,s),this.peek()===kt)this.pos++;else return this.pos=l,0;if(this.spnl(),i=this.
parseLinkDestination(),i===null)return this.pos=l,0;var a=this.pos;this.spnl(),this.
pos!==a&&(r=this.parseLinkTitle()),r===null&&(this.pos=a);var o=!0;if(this.match(
_e)===null&&(r===null?o=!1:(r=null,this.pos=a,o=this.match(_e)!==null)),!o)return this.
pos=l,0;var u=Te(n);return u===""?(this.pos=l,0):(t[u]||(t[u]={destination:i,title:r===
null?"":r}),this.pos-l)},on=function(e){var t=!1,n=this.peek();if(n===-1)return!1;
switch(n){case Ce:t=this.parseNewline(e);break;case Le:t=this.parseBackslash(e);
break;case mt:t=this.parseBackticks(e);break;case G:case D:case W:t=this.handleDelim(
n,e);break;case C:case x:t=this.options.smart&&this.handleDelim(n,e);break;case xe:
t=this.parseOpenBracket(e);break;case Ct:t=this.parseBang(e);break;case gt:t=this.
parseCloseBracket(e);break;case ke:t=this.parseAutolink(e)||this.parseHtmlTag(e);
break;case xt:t=this.parseEntity(e);break;default:t=this.parseString(e);break}return t||
(this.pos+=1,e.appendChild(d(b(n)))),!0},un=function(e){for(this.subject=e._string_content.
trim(),this.pos=0,this.delimiters=null,this.brackets=null;this.parseInline(e););
e._string_content=null,this.processEmphasis(null)};ye=hn});var je={};Ke(je,{default:()=>Hn});function Mn(e){return{doc:new Re,blocks:Ue,blockStarts:Sn,
tip:this.doc,oldtip:this.doc,currentLine:"",lineNumber:0,offset:0,column:0,nextNonspace:0,
nextNonspaceColumn:0,indent:0,indented:!1,blank:!1,partiallyConsumedTab:!1,allClosed:!0,
lastMatchedContainer:this.doc,refmap:{},lastLineLength:0,inlineParser:new ye(e),
findNextNonspace:Un,advanceOffset:Pn,advanceNextNonspace:zn,addLine:Tn,addChild:yn,
incorporateLine:Rn,finalize:jn,processInlines:In,closeUnmatchedBlocks:Dn,parse:Fn,
options:e||{}}}var B,De,cn,Be,fn,Se,Pe,pn,dn,vn,_n,mn,S,gn,ze,Cn,xn,kn,Ln,Nn,An,
bn,En,E,m,Oe,Tn,yn,wn,On,Dn,Bn,Ue,Sn,Pn,zn,Un,Rn,jn,In,Re,Fn,Hn,Ie=A(()=>{"use s\
trict";U();H();we();B=4,De=9,cn=10,Be=62,fn=60,Se=32,Pe=91,pn=[/./,/^<(?:script|pre|textarea|style)(?:\s|>|$)/i,
/^<!--/,/^<[?]/,/^<![A-Za-z]/,/^<!\[CDATA\[/,/^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|search|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i,
new RegExp("^(?:"+I+"|"+F+")\\s*$","i")],dn=[/./,/<\/(?:script|pre|textarea|style)>/i,
/-->/,/\?>/,/>/,/\]\]>/],vn=/^(?:\*[ \t]*){3,}$|^(?:_[ \t]*){3,}$|^(?:-[ \t]*){3,}$/,
_n=/^\[\^([^\]]+)\]:[ \t]*/,mn=/^\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/,
S=function(e){var t=[],n="",i,r;for(e=e.trim().replace(/^\|/,"").replace(/\|[ \t]*$/,
""),i=0;i<e.length;i++)r=e.charAt(i),r==="\\"&&e.charAt(i+1)==="|"?(n+="|",i++):
r==="|"?(t.push(n.trim()),n=""):n+=r;return t.push(n.trim()),t},gn=/^[#`~*+_=<>0-9|:[-]/,
ze=/[^ \t\f\v\r\n]/,Cn=/^[*+-]/,xn=/^(\d{1,9})([.)])/,kn=/^#{1,6}(?:[ \t]+|$)/,Ln=
/^`{3,}(?!.*`)|^~{3,}/,Nn=/^(?:`{3,}|~{3,})(?=[ \t]*$)/,An=/^(?:=+|-+)[ \t]*$/,bn=
/\r\n|\n|\r/,En=function(e){return!ze.test(e)},E=function(e){return e===Se||e===
De},m=function(e,t){return t<e.length?e.charCodeAt(t):-1},Oe=function(e){return e.
next&&e.sourcepos[1][0]!==e.next.sourcepos[0][0]-1},Tn=function(){if(this.partiallyConsumedTab){
this.offset+=1;var e=4-this.column%4;this.tip._string_content+=" ".repeat(e)}this.
tip._string_content+=this.currentLine.slice(this.offset)+`
`},yn=function(e,t){for(;!this.blocks[this.tip.type].canContain(e);)this.finalize(
this.tip,this.lineNumber-1);var n=t+1,i=new p(e,[[this.lineNumber,n],[0,0]]);return i.
_string_content="",this.tip.appendChild(i),this.tip=i,i},wn=function(e,t){var n=e.
currentLine.slice(e.nextNonspace),i,r,s,l,a={type:null,tight:!0,bulletChar:null,
start:null,delimiter:null,padding:null,markerOffset:e.indent};if(e.indent>=4)return null;
if(i=n.match(Cn))a.type="bullet",a.bulletChar=i[0][0];else if((i=n.match(xn))&&(t.
type!=="paragraph"||i[1]==1))a.type="ordered",a.start=parseInt(i[1]),a.delimiter=
i[2];else return null;if(r=m(e.currentLine,e.nextNonspace+i[0].length),!(r===-1||
r===De||r===Se)||t.type==="paragraph"&&!e.currentLine.slice(e.nextNonspace+i[0].
length).match(ze))return null;e.advanceNextNonspace(),e.advanceOffset(i[0].length,
!0),s=e.column,l=e.offset;do e.advanceOffset(1,!0),r=m(e.currentLine,e.offset);while(e.
column-s<5&&E(r));var o=m(e.currentLine,e.offset)===-1,u=e.column-s;return u>=5||
u<1||o?(a.padding=i[0].length+1,e.column=s,e.offset=l,E(m(e.currentLine,e.offset))&&
e.advanceOffset(1,!0)):a.padding=i[0].length+u,a},On=function(e,t){return e.type===
t.type&&e.delimiter===t.delimiter&&e.bulletChar===t.bulletChar},Dn=function(){if(!this.
allClosed){for(;this.oldtip!==this.lastMatchedContainer;){var e=this.oldtip._parent;
this.finalize(this.oldtip,this.lineNumber-1),this.oldtip=e}this.allClosed=!0}},Bn=
function(e,t){for(var n,i,r=t.walker(),s=[];n=r.next();)if(i=n.node,n.entering&&
i.type==="paragraph"){for(var l,a=!1;m(i._string_content,0)===Pe&&(l=e.inlineParser.
parseReference(i._string_content,e.refmap));){let o=i._string_content.slice(0,l);
i._string_content=i._string_content.slice(l),a=!0;let u=o.split(`
`);i.sourcepos[0][0]+=u.length-1}a&&En(i._string_content)&&s.push(i)}for(i of s)
i.unlink()},Ue={document:{continue:function(){return 0},finalize:function(e,t){Bn(
e,t)},canContain:function(e){return e!=="item"},acceptsLines:!1},list:{continue:function(){
return 0},finalize:function(e,t){for(var n=t._firstChild;n;){if(n._next&&Oe(n)){
t._listData.tight=!1;break}for(var i=n._firstChild;i;){if(i._next&&Oe(i)){t._listData.
tight=!1;break}i=i._next}n=n._next}t.sourcepos[1]=t._lastChild.sourcepos[1]},canContain:function(e){
return e==="item"},acceptsLines:!1},block_quote:{continue:function(e){var t=e.currentLine;
if(!e.indented&&m(t,e.nextNonspace)===Be)e.advanceNextNonspace(),e.advanceOffset(
1,!1),E(m(t,e.offset))&&e.advanceOffset(1,!0);else return 1;return 0},finalize:function(){},
canContain:function(e){return e!=="item"},acceptsLines:!1},item:{continue:function(e,t){
if(e.blank){if(t._firstChild==null)return 1;e.advanceNextNonspace()}else if(e.indent>=
t._listData.markerOffset+t._listData.padding)e.advanceOffset(t._listData.markerOffset+
t._listData.padding,!0);else return 1;return 0},finalize:function(e,t){t._lastChild?
t.sourcepos[1]=t._lastChild.sourcepos[1]:(t.sourcepos[1][0]=t.sourcepos[0][0],t.
sourcepos[1][1]=t._listData.markerOffset+t._listData.padding)},canContain:function(e){
return e!=="item"},acceptsLines:!1},heading:{continue:function(){return 1},finalize:function(){},
canContain:function(){return!1},acceptsLines:!1},thematic_break:{continue:function(){
return 1},finalize:function(){},canContain:function(){return!1},acceptsLines:!1},
code_block:{continue:function(e,t){var n=e.currentLine,i=e.indent;if(t._isFenced){
var r=i<=3&&n.charAt(e.nextNonspace)===t._fenceChar&&n.slice(e.nextNonspace).match(
Nn);if(r&&r[0].length>=t._fenceLength)return e.lastLineLength=e.offset+i+r[0].length,
e.finalize(t,e.lineNumber),2;for(var s=t._fenceOffset;s>0&&E(m(n,e.offset));)e.advanceOffset(
1,!0),s--}else if(i>=B)e.advanceOffset(B,!0);else if(e.blank)e.advanceNextNonspace();else
return 1;return 0},finalize:function(e,t){if(t._isFenced){var n=t._string_content,
i=n.indexOf(`
`),r=n.slice(0,i),s=n.slice(i+1);t.info=w(r.trim()),t._literal=s}else{for(var l=t.
_string_content.split(`
`);/^[ \t]*$/.test(l[l.length-1]);)l.pop();t._literal=l.join(`
`)+`
`,t.sourcepos[1][0]=t.sourcepos[0][0]+l.length-1,t.sourcepos[1][1]=t.sourcepos[0][1]+
l[l.length-1].length-1}t._string_content=null},canContain:function(){return!1},acceptsLines:!0},
html_block:{continue:function(e,t){return e.blank&&(t._htmlBlockType===6||t._htmlBlockType===
7)?1:0},finalize:function(e,t){t._literal=t._string_content.replace(/\n$/,""),t.
_string_content=null},canContain:function(){return!1},acceptsLines:!0},footnote_definition:{
continue:function(e){return e.blank?0:e.indent>=4?(e.advanceOffset(4,!0),0):e.tip.
type==="paragraph"?0:1},finalize:function(){},canContain:function(e){return e!==
"item"&&e!=="footnote_definition"},acceptsLines:!1},table:{continue:function(e){
return e.blank?1:0},finalize:function(e,t){var n=t._string_content.replace(/\n$/,
"").split(`
`),i=S(n[1]),r=i.map(function(h){var v=h.charAt(0)===":",c=h.charAt(h.length-1)===
":";return v&&c?"center":c?"right":v?"left":null}),s,l,a,o,u;for(s=0;s<n.length;s++)
if(s!==1){for(a=S(n[s]),o=new p("table_row"),o._isHeading=s===0,l=0;l<i.length;l++)
u=new p("table_cell"),u._align=r[l],u._string_content=a[l]===void 0?"":a[l],o.appendChild(
u);t.appendChild(o)}t._string_content=null},canContain:function(e){return e==="t\
able_row"},acceptsLines:!0},paragraph:{continue:function(e){return e.blank?1:0},
finalize:function(){},canContain:function(){return!1},acceptsLines:!0}},Sn=[function(e){
if(e.indented)return 0;var t=e.currentLine.slice(e.nextNonspace).match(_n);if(!t)
return 0;e.closeUnmatchedBlocks(),e.advanceNextNonspace(),e.advanceOffset(t[0].length,
!1);var n=e.addChild("footnote_definition",e.nextNonspace);return n._label=t[1],
1},function(e,t){if(e.indented||t.type!=="paragraph")return 0;var n=e.currentLine.
slice(e.nextNonspace);if(n.indexOf("|")===-1||!mn.test(n))return 0;var i=t._string_content.
replace(/\n$/,"").split(`
`),r=i[i.length-1];if(!r||r.indexOf("|")===-1||S(r).length!==S(n).length)return 0;
var s=i.slice(0,i.length-1).join(`
`);t._string_content=s===""?"":s+`
`,e.closeUnmatchedBlocks();var l=s==="",a=e.addChild("table",e.nextNonspace);return l&&
t.unlink(),a._string_content=r+`
`,2},function(e){return!e.indented&&m(e.currentLine,e.nextNonspace)===Be?(e.advanceNextNonspace(),
e.advanceOffset(1,!1),E(m(e.currentLine,e.offset))&&e.advanceOffset(1,!0),e.closeUnmatchedBlocks(),
e.addChild("block_quote",e.nextNonspace),1):0},function(e){var t;if(!e.indented&&
(t=e.currentLine.slice(e.nextNonspace).match(kn))){e.advanceNextNonspace(),e.advanceOffset(
t[0].length,!1),e.closeUnmatchedBlocks();var n=e.addChild("heading",e.nextNonspace);
return n.level=t[0].trim().length,n._string_content=e.currentLine.slice(e.offset).
replace(/^[ \t]*#+[ \t]*$/,"").replace(/[ \t]+#+[ \t]*$/,""),e.advanceOffset(e.currentLine.
length-e.offset),2}else return 0},function(e){var t;if(!e.indented&&(t=e.currentLine.
slice(e.nextNonspace).match(Ln))){var n=t[0].length;e.closeUnmatchedBlocks();var i=e.
addChild("code_block",e.nextNonspace);return i._isFenced=!0,i._fenceLength=n,i._fenceChar=
t[0][0],i._fenceOffset=e.indent,e.advanceNextNonspace(),e.advanceOffset(n,!1),2}else
return 0},function(e,t){if(!e.indented&&m(e.currentLine,e.nextNonspace)===fn){var n=e.
currentLine.slice(e.nextNonspace),i;for(i=1;i<=7;i++)if(pn[i].test(n)&&(i<7||t.type!==
"paragraph"&&!(!e.allClosed&&!e.blank&&e.tip.type==="paragraph"))){e.closeUnmatchedBlocks();
var r=e.addChild("html_block",e.offset);return r._htmlBlockType=i,2}}return 0},function(e,t){
var n;if(!e.indented&&t.type==="paragraph"&&(n=e.currentLine.slice(e.nextNonspace).
match(An))){e.closeUnmatchedBlocks();for(var i;m(t._string_content,0)===Pe&&(i=e.
inlineParser.parseReference(t._string_content,e.refmap));)t._string_content=t._string_content.
slice(i);if(t._string_content.length>0){var r=new p("heading",t.sourcepos);return r.
level=n[0][0]==="="?1:2,r._string_content=t._string_content,t.insertAfter(r),t.unlink(),
e.tip=r,e.advanceOffset(e.currentLine.length-e.offset,!1),2}else return 0}else return 0},
function(e){return!e.indented&&vn.test(e.currentLine.slice(e.nextNonspace))?(e.closeUnmatchedBlocks(),
e.addChild("thematic_break",e.nextNonspace),e.advanceOffset(e.currentLine.length-
e.offset,!1),2):0},function(e,t){var n;return(!e.indented||t.type==="list")&&(n=
wn(e,t))?(e.closeUnmatchedBlocks(),(e.tip.type!=="list"||!On(t._listData,n))&&(t=
e.addChild("list",e.nextNonspace),t._listData=n),t=e.addChild("item",e.nextNonspace),
t._listData=n,1):0},function(e){return e.indented&&e.tip.type!=="paragraph"&&!e.
blank?(e.advanceOffset(B,!0),e.closeUnmatchedBlocks(),e.addChild("code_block",e.
offset),2):0}],Pn=function(e,t){for(var n=this.currentLine,i,r,s;e>0&&(s=n[this.
offset]);)s==="	"?(i=4-this.column%4,t?(this.partiallyConsumedTab=i>e,r=i>e?e:i,
this.column+=r,this.offset+=this.partiallyConsumedTab?0:1,e-=r):(this.partiallyConsumedTab=
!1,this.column+=i,this.offset+=1,e-=1)):(this.partiallyConsumedTab=!1,this.offset+=
1,this.column+=1,e-=1)},zn=function(){this.offset=this.nextNonspace,this.column=
this.nextNonspaceColumn,this.partiallyConsumedTab=!1},Un=function(){for(var e=this.
currentLine,t=this.offset,n=this.column,i;(i=e.charAt(t))!=="";)if(i===" ")t++,n++;else if(i===
"	")t++,n+=4-n%4;else break;this.blank=i===`
`||i==="\r"||i==="",this.nextNonspace=t,this.nextNonspaceColumn=n,this.indent=this.
nextNonspaceColumn-this.column,this.indented=this.indent>=B},Rn=function(e){var t=!0,
n,i=this.doc;this.oldtip=this.tip,this.offset=0,this.column=0,this.blank=!1,this.
partiallyConsumedTab=!1,this.lineNumber+=1,e.indexOf("\0")!==-1&&(e=e.replace(/\0/g,
"\uFFFD")),this.currentLine=e;for(var r;(r=i._lastChild)&&r._open;){switch(i=r,this.
findNextNonspace(),this.blocks[i.type].continue(this,i)){case 0:break;case 1:t=!1;
break;case 2:return;default:throw"continue returned illegal value, must be 0, 1,\
 or 2"}if(!t){i=i._parent;break}}this.allClosed=i===this.oldtip,this.lastMatchedContainer=
i;for(var s=i.type!=="paragraph"&&i.type!=="table"&&Ue[i.type].acceptsLines,l=this.
blockStarts,a=l.length;!s;){if(this.findNextNonspace(),!this.indented&&!gn.test(
e.slice(this.nextNonspace))){this.advanceNextNonspace();break}for(var o=0;o<a;){
var u=l[o](this,i);if(u===1){i=this.tip;break}else if(u===2){i=this.tip,s=!0;break}else
o++}if(o===a){this.advanceNextNonspace();break}}!this.allClosed&&!this.blank&&this.
tip.type==="paragraph"?this.addLine():(this.closeUnmatchedBlocks(),n=i.type,this.
blocks[n].acceptsLines?(this.addLine(),n==="html_block"&&i._htmlBlockType>=1&&i.
_htmlBlockType<=5&&dn[i._htmlBlockType].test(this.currentLine.slice(this.offset))&&
(this.lastLineLength=e.length,this.finalize(i,this.lineNumber))):this.offset<e.length&&
!this.blank&&(i=this.addChild("paragraph",this.offset),this.advanceNextNonspace(),
this.addLine())),this.lastLineLength=e.length},jn=function(e,t){var n=e._parent;
e._open=!1,e.sourcepos[1]=[t,this.lastLineLength],this.blocks[e.type].finalize(this,
e),this.tip=n},In=function(e){var t,n,i,r=e.walker();for(this.inlineParser.refmap=
this.refmap,this.inlineParser.options=this.options;n=r.next();)t=n.node,i=t.type,
!n.entering&&(i==="paragraph"||i==="heading"||i==="table_cell")&&this.inlineParser.
parse(t)},Re=function(){var e=new p("document",[[1,1],[0,0]]);return e},Fn=function(e){
this.doc=new Re,this.tip=this.doc,this.refmap={},this.lineNumber=0,this.lastLineLength=
0,this.offset=0,this.column=0,this.lastMatchedContainer=this.doc,this.currentLine=
"",this.options.time&&console.time("preparing input");var t=e.split(bn),n=t.length;
e.charCodeAt(e.length-1)===cn&&(n-=1),this.options.time&&console.timeEnd("prepar\
ing input"),this.options.time&&console.time("block parsing");for(var i=0;i<n;i++)
this.incorporateLine(t[i]);for(;this.tip;)this.finalize(this.tip,n);return this.
options.time&&console.timeEnd("block parsing"),this.options.time&&console.time("\
inline parsing"),this.processInlines(this.doc),this.options.time&&console.timeEnd(
"inline parsing"),this.doc};Hn=Mn});var $n=P((ni,Fe)=>{var X=(Ie(),We(je));Fe.exports={Parser:X.Parser||X.default||X}});return $n();})();
/*! Bundled license information:

commonmark/lib/from-code-point.js:
  (*! http://mths.be/fromcodepoint v0.2.1 by @mathias *)
*/

if (typeof module !== "undefined" && module.exports) { module.exports = __cmark; }
