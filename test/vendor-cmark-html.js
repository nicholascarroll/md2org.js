/*
 * TEST ONLY — not shipped, not bundled, not referenced by src/.
 *
 * The same forked parser as src/vendor/commonmark.js plus upstream's HTML
 * renderer, so test/conformance.js can check the parser against the spec's own
 * 652 markdown/HTML pairs.
 *
 * This pins the parser, which is third-party and already verified upstream. It
 * says nothing about the Org rendering — that is test/spec.js.
 *
 * Regenerate: node tools/build-vendor.js
 */
var CM=(()=>{var et=Object.create;var w=Object.defineProperty;var tt=Object.getOwnPropertyDescriptor;var it=Object.getOwnPropertyNames;var nt=Object.getPrototypeOf,rt=Object.prototype.hasOwnProperty;var x=(e,t,i)=>()=>{if(i)throw i[0];try{return e&&(t=e(e=0)),t}catch(n){throw i=
[n],n}};var U=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(i){
throw t=0,i}},te=(e,t)=>{for(var i in t)w(e,i,{get:t[i],enumerable:!0})},ie=(e,t,i,n)=>{
if(t&&typeof t=="object"||typeof t=="function")for(let r of it(t))!rt.call(e,r)&&
r!==i&&w(e,r,{get:()=>t[r],enumerable:!(n=tt(t,r))||n.enumerable});return e};var j=(e,t,i)=>(i=e!=null?et(nt(e)):{},ie(t||!e||!e.__esModule?w(i,"default",{value:e,
enumerable:!0}):i,e)),ne=e=>ie(w({},"__esModule",{value:!0}),e);function re(e){switch(e._type){case"document":case"block_quote":case"list":case"\
item":case"paragraph":case"heading":case"emph":case"strong":case"strikethrough":case"\
table":case"table_row":case"table_cell":case"footnote_definition":case"link":case"\
image":case"custom_inline":case"custom_block":return!0;default:return!1}}var st,
at,lt,C,p,d,I=x(()=>{"use strict";st=function(e,t){this.current=e,this.entering=
t===!0},at=function(){var e=this.current,t=this.entering;if(e===null)return null;
var i=re(e);return t&&i?e._firstChild?(this.current=e._firstChild,this.entering=
!0):this.entering=!1:e===this.root?this.current=null:e._next===null?(this.current=
e._parent,this.entering=!1):(this.current=e._next,this.entering=!0),{entering:t,
node:e}},lt=function(e){return{current:e,root:e,entering:!0,next:at,resumeAt:st}},
C=function(e,t){this._type=e,this._parent=null,this._firstChild=null,this._lastChild=
null,this._prev=null,this._next=null,this._sourcepos=t,this._open=!0,this._string_content=
null,this._literal=null,this._listData={},this._info=null,this._destination=null,
this._title=null,this._isFenced=!1,this._fenceChar=null,this._fenceLength=0,this.
_fenceOffset=null,this._level=null,this._onEnter=null,this._onExit=null},p=C.prototype;
Object.defineProperty(p,"isContainer",{get:function(){return re(this)}});Object.
defineProperty(p,"type",{get:function(){return this._type}});Object.defineProperty(
p,"firstChild",{get:function(){return this._firstChild}});Object.defineProperty(
p,"lastChild",{get:function(){return this._lastChild}});Object.defineProperty(p,
"next",{get:function(){return this._next}});Object.defineProperty(p,"prev",{get:function(){
return this._prev}});Object.defineProperty(p,"parent",{get:function(){return this.
_parent}});Object.defineProperty(p,"sourcepos",{get:function(){return this._sourcepos}});
Object.defineProperty(p,"literal",{get:function(){return this._literal},set:function(e){
this._literal=e}});Object.defineProperty(p,"destination",{get:function(){return this.
_destination},set:function(e){this._destination=e}});Object.defineProperty(p,"ti\
tle",{get:function(){return this._title},set:function(e){this._title=e}});Object.
defineProperty(p,"info",{get:function(){return this._info},set:function(e){this.
_info=e}});Object.defineProperty(p,"level",{get:function(){return this._level},set:function(e){
this._level=e}});Object.defineProperty(p,"listType",{get:function(){return this.
_listData.type},set:function(e){this._listData.type=e}});Object.defineProperty(p,
"listTight",{get:function(){return this._listData.tight},set:function(e){this._listData.
tight=e}});Object.defineProperty(p,"listStart",{get:function(){return this._listData.
start},set:function(e){this._listData.start=e}});Object.defineProperty(p,"listDe\
limiter",{get:function(){return this._listData.delimiter},set:function(e){this._listData.
delimiter=e}});Object.defineProperty(p,"onEnter",{get:function(){return this._onEnter},
set:function(e){this._onEnter=e}});Object.defineProperty(p,"onExit",{get:function(){
return this._onExit},set:function(e){this._onExit=e}});C.prototype.appendChild=function(e){
e.unlink(),e._parent=this,this._lastChild?(this._lastChild._next=e,e._prev=this.
_lastChild,this._lastChild=e):(this._firstChild=e,this._lastChild=e)};C.prototype.
prependChild=function(e){e.unlink(),e._parent=this,this._firstChild?(this._firstChild.
_prev=e,e._next=this._firstChild,this._firstChild=e):(this._firstChild=e,this._lastChild=
e)};C.prototype.unlink=function(){this._prev?this._prev._next=this._next:this._parent&&
(this._parent._firstChild=this._next),this._next?this._next._prev=this._prev:this.
_parent&&(this._parent._lastChild=this._prev),this._parent=null,this._next=null,
this._prev=null};C.prototype.insertAfter=function(e){e.unlink(),e._next=this._next,
e._next&&(e._next._prev=e),e._prev=this,this._next=e,e._parent=this._parent,e._next||
(e._parent._lastChild=e)};C.prototype.insertBefore=function(e){e.unlink(),e._prev=
this._prev,e._prev&&(e._prev._next=e),e._next=this,this._prev=e,e._parent=this._parent,
e._prev||(e._parent._firstChild=e)};C.prototype.walker=function(){var e=new lt(this);
return e};d=C});var le=U((Bn,ae)=>{"use strict";var se={};function ot(e){var t,i,n=se[e];if(n)return n;
for(n=se[e]=[],t=0;t<128;t++)i=String.fromCharCode(t),/^[0-9a-z]$/i.test(i)?n.push(
i):n.push("%"+("0"+t.toString(16).toUpperCase()).slice(-2));for(t=0;t<e.length;t++)
n[e.charCodeAt(t)]=e[t];return n}function O(e,t,i){var n,r,s,l,a,o="";for(typeof t!=
"string"&&(i=t,t=O.defaultChars),typeof i>"u"&&(i=!0),a=ot(t),n=0,r=e.length;n<r;n++){
if(s=e.charCodeAt(n),i&&s===37&&n+2<r&&/^[0-9a-f]{2}$/i.test(e.slice(n+1,n+3))){
o+=e.slice(n,n+3),n+=2;continue}if(s<128){o+=a[s];continue}if(s>=55296&&s<=57343){
if(s>=55296&&s<=56319&&n+1<r&&(l=e.charCodeAt(n+1),l>=56320&&l<=57343)){o+=encodeURIComponent(
e[n]+e[n+1]),n++;continue}o+="%EF%BF%BD";continue}o+=encodeURIComponent(e[n])}return o}
O.defaultChars=";/?:@&=+$,-_.!~*'()#";O.componentChars="-_.!~*'()";ae.exports=O});var H=U((Pn,he)=>{var oe={amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:"\xA0",copy:"\
\xA9",reg:"\xAE",trade:"\u2122",hellip:"\u2026",mdash:"\u2014",ndash:"\u2013",lsquo:"\
\u2018",rsquo:"\u2019",ldquo:"\u201C",rdquo:"\u201D",bull:"\u2022",dagger:"\u2020",
deg:"\xB0",plusmn:"\xB1",times:"\xD7",divide:"\xF7",frac12:"\xBD",laquo:"\xAB",raquo:"\
\xBB",sect:"\xA7",para:"\xB6",middot:"\xB7",eacute:"\xE9",egrave:"\xE8",agrave:"\
\xE0",ccedil:"\xE7",uuml:"\xFC",ouml:"\xF6",auml:"\xE4",szlig:"\xDF",ntilde:"\xF1",
aacute:"\xE1",iacute:"\xED",oacute:"\xF3",uacute:"\xFA",euro:"\u20AC",pound:"\xA3",
yen:"\xA5",cent:"\xA2",alpha:"\u03B1",beta:"\u03B2",gamma:"\u03B3",delta:"\u03B4",
pi:"\u03C0",lambda:"\u03BB",mu:"\u03BC",infin:"\u221E",ne:"\u2260",le:"\u2264",ge:"\
\u2265",larr:"\u2190",rarr:"\u2192",harr:"\u2194"};function ue(e){return e.replace(
/&(?:#[xX]([0-9a-fA-F]+)|#(\d+)|([a-zA-Z][a-zA-Z0-9]*));/g,(t,i,n,r)=>i?String.fromCodePoint(
parseInt(i,16)||65533):n?String.fromCodePoint(parseInt(n,10)||65533):oe[r]!==void 0?
oe[r]:t)}he.exports={decodeHTML:ue,decodeHTMLStrict:ue,encodeHTML:e=>e,escape:e=>e.
replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t])}});var fe,pe,ut,M,de,ht,ct,ft,pt,dt,vt,_t,F,$,mt,gt,Ct,xt,kt,ve,bt,q,Lt,yt,ce,Nt,D,
_e,Et,Z,S=x(()=>{"use strict";fe=j(le(),1),pe=j(H(),1),ut=92,M="&(?:#x[a-f0-9]{1\
,6}|#[0-9]{1,7}|[a-z][a-z0-9]{1,31});",de="[A-Za-z][A-Za-z0-9-]*",ht="[a-zA-Z_:]\
[a-zA-Z0-9:._-]*",ct="[^\"'=<>`\\x00-\\x20]+",ft="'[^']*'",pt='"[^"]*"',dt="(?:"+
ct+"|"+ft+"|"+pt+")",vt="(?:\\s*=\\s*"+dt+")",_t="(?:\\s+"+ht+vt+"?)",F="<"+de+_t+
"*\\s*/?>",$="</"+de+"\\s*[>]",mt="<!-->|<!--->|<!--[\\s\\S]*?-->",gt="[<][?][\\s\
\\S]*?[?][>]",Ct="<![A-Za-z]+[^>]*>",xt="<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",kt="(?:"+
F+"|"+$+"|"+mt+"|"+gt+"|"+Ct+"|"+xt+")",ve=new RegExp("^"+kt),bt=/[\\&]/,q="[!\"#\
$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]",Lt=new RegExp("\\\\"+q+"|"+M,"gi"),yt='[&<>\
"]',ce=new RegExp(yt,"g"),Nt=function(e){return e.charCodeAt(0)===ut?e.charAt(1):
(0,pe.decodeHTMLStrict)(e)},D=function(e){return bt.test(e)?e.replace(Lt,Nt):e},
_e=function(e){try{return(0,fe.default)(e)}catch{return e}},Et=function(e){switch(e){case"\
&":return"&amp;";case"<":return"&lt;";case">":return"&gt;";case'"':return"&quot;";default:
return e}},Z=function(e){return ce.test(e)?e.replace(ce,Et):e}});function A(e){return G(e)}var G,me,ge,Ce=x(()=>{"use strict";String.fromCodePoint?
G=function(e){try{return String.fromCodePoint(e)}catch(t){if(t instanceof RangeError)
return"\uFFFD";throw t}}:(me=String.fromCharCode,ge=Math.floor,G=function(){var e=16384,
t=[],i,n,r=-1,s=arguments.length;if(!s)return"";for(var l="";++r<s;){var a=Number(
arguments[r]);if(!isFinite(a)||a<0||a>1114111||ge(a)!==a)return"\uFFFD";a<=65535?
t.push(a):(a-=65536,i=(a>>10)+55296,n=a%1024+56320,t.push(i,n)),(r+1===s||t.length>
e)&&(l+=me.apply(null,t),t.length=0)}return l})});function xi(e){return{subject:"",delimiters:null,brackets:null,pos:0,refmap:{},match:Wt,
peek:Qt,spnl:Vt,parseBackticks:Yt,parseBackslash:Jt,parseAutolink:ei,parseHtmlTag:ti,
scanDelims:ii,handleDelim:ni,parseLinkTitle:ai,parseLinkDestination:li,parseLinkLabel:oi,
parseOpenBracket:ui,parseBang:hi,parseCloseBracket:ci,addBracket:fi,removeBracket:pi,
parseEntity:di,parseString:vi,parseNewline:_i,parseReference:mi,parseInline:gi,processEmphasis:si,
removeDelimiter:ri,options:e||{},parse:Ci}}var ye,B,X,Ne,W,P,Tt,Ee,wt,Ae,Ot,Te,Dt,
we,Q,St,k,b,V,Oe,K,Bt,Pt,xe,zt,Rt,De,Ut,jt,It,Ht,Mt,Ft,$t,qt,Se,ke,Zt,Gt,be,Kt,Xt,
v,Be,Wt,Qt,Vt,Yt,Jt,ei,ti,ii,ni,ri,Le,si,ai,li,oi,ui,hi,ci,fi,pi,di,vi,_i,mi,gi,
Ci,Pe,ze=x(()=>{"use strict";I();S();Ce();ye=j(H(),1),B=_e,X=D,Ne=10,W=42,P=95,Tt=
96,Ee=91,wt=93,Ae=60,Ot=33,Te=92,Dt=38,we=40,Q=41,St=58,k=39,b=34,V=126,Oe=q,K="\
\\\\"+Oe,Bt=M,Pt=ve,xe=new RegExp(/^[!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~\p{P}\p{S}]/u),
zt=new RegExp('^(?:"('+K+`|\\\\[^\\\\]|[^\\\\"\\x00])*"|'(`+K+"|\\\\[^\\\\]|[^\\\\'\\x0\
0])*'|\\(("+K+"|\\\\[^\\\\]|[^\\\\()\\x00])*\\))"),Rt=/^(?:<(?:[^<>\n\\\x00]|\\.)*>)/,
De=new RegExp("^"+Oe),Ut=new RegExp("^"+Bt,"i"),jt=/`+/,It=/^`+/,Ht=/\.\.\./g,Mt=
/--+/g,Ft=/^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/,
$t=/^<[A-Za-z][A-Za-z0-9.+-]{1,31}:[^<>\x00-\x20]*>/i,qt=/^ *(?:\n *)?/,Se=/^[ \t\n\x0b\x0c\x0d]/,
ke=/^\s/,Zt=/ *$/,Gt=/^ */,be=/^ *(?:\n|$)/,Kt=/^\[(?:[^\\\[\]]|\\.){0,1000}\]/s,
Xt=/^[^\n`\[\]\\!<&*_'"~]+/m,v=function(e){var t=new d("text");return t._literal=
e,t},Be=function(e){return e.slice(1,e.length-1).trim().replace(/[ \t\r\n]+/g," ").
toLowerCase().toUpperCase()},Wt=function(e){var t=e.exec(this.subject.slice(this.
pos));return t===null?null:(this.pos+=t.index+t[0].length,t[0])},Qt=function(){return this.
pos<this.subject.length?this.subject.charCodeAt(this.pos):-1},Vt=function(){return this.
match(qt),!0},Yt=function(e){var t=this.match(It);if(t===null)return!1;for(var i=this.
pos,n,r,s;(n=this.match(jt))!==null;)if(n===t)return r=new d("code"),s=this.subject.
slice(i,this.pos-t.length).replace(/\n/gm," "),s.length>0&&s.match(/[^ ]/)!==null&&
s[0]==" "&&s[s.length-1]==" "?r._literal=s.slice(1,s.length-1):r._literal=s,e.appendChild(
r),!0;return this.pos=i,e.appendChild(v(t)),!0},Jt=function(e){var t=this.subject,
i;return this.pos+=1,this.peek()===Ne?(this.pos+=1,i=new d("linebreak"),e.appendChild(
i)):De.test(t.charAt(this.pos))?(e.appendChild(v(t.charAt(this.pos))),this.pos+=
1):e.appendChild(v("\\")),!0},ei=function(e){var t,i,n;return(t=this.match(Ft))?
(i=t.slice(1,t.length-1),n=new d("link"),n._destination=B("mailto:"+i),n._title=
"",n.appendChild(v(i)),e.appendChild(n),!0):(t=this.match($t))?(i=t.slice(1,t.length-
1),n=new d("link"),n._destination=B(i),n._title="",n.appendChild(v(i)),e.appendChild(
n),!0):!1},ti=function(e){var t=this.match(Pt);if(t===null)return!1;var i=new d(
"html_inline");return i._literal=t,e.appendChild(i),!0},ii=function(e){var t=0,i,
n,r,s=this.pos,l,a,o,u,c,_,f,m;if(e===k||e===b)t++,this.pos++;else for(;this.peek()===
e;)t++,this.pos++;return t===0?null:(i=s===0?`
`:this.subject.charAt(s-1),r=this.peek(),r===-1?n=`
`:n=A(r),c=ke.test(n),_=xe.test(n),f=ke.test(i),m=xe.test(i),l=!c&&(!_||f||m),a=
!f&&(!m||c||_),e===P?(o=l&&(!a||m),u=a&&(!l||_)):e===k||e===b?(o=l&&!a,u=a):(o=l,
u=a),this.pos=s,{numdelims:t,can_open:o,can_close:u})},ni=function(e,t){var i=this.
scanDelims(e);if(!i)return!1;var n=i.numdelims,r=this.pos,s;this.pos+=n,e===k?s=
"\u2019":e===b?s="\u201C":s=this.subject.slice(r,this.pos);var l=v(s);return t.appendChild(
l),(i.can_open||i.can_close)&&(this.options.smart||e!==k&&e!==b)&&(this.delimiters=
{cc:e,numdelims:n,origdelims:n,node:l,previous:this.delimiters,next:null,can_open:i.
can_open,can_close:i.can_close},this.delimiters.previous!==null&&(this.delimiters.
previous.next=this.delimiters)),!0},ri=function(e){e.previous!==null&&(e.previous.
next=e.next),e.next===null?this.delimiters=e.previous:e.next.previous=e.previous},
Le=function(e,t){e.next!==t&&(e.next=t,t.previous=e)},si=function(e){for(var t,i,
n,r,s,l,a,o,u,c,_=[],f,m=!1,L=0;L<14;L++)_[L]=e;for(i=this.delimiters;i!==null&&
i.previous!==e;)i=i.previous;for(;i!==null;){var y=i.cc;if(!i.can_close)i=i.next;else{
switch(t=i.previous,c=!1,y){case k:f=0;break;case b:f=1;break;case P:f=2+(i.can_open?
3:0)+i.origdelims%3;break;case W:f=8+(i.can_open?3:0)+i.origdelims%3;break;case V:
f=14;break}for(;t!==null&&t!==e&&t!==_[f];){if(m=(i.can_open||t.can_close)&&i.origdelims%
3!==0&&(t.origdelims+i.origdelims)%3===0,t.cc===i.cc&&t.can_open&&!m){c=!0;break}
t=t.previous}if(n=i,y===V)if(!c||i.numdelims<2||t.numdelims<2)i=i.next;else{r=t.
node,s=i.node,t.numdelims-=2,i.numdelims-=2,r._literal=r._literal.slice(0,r._literal.
length-2),s._literal=s._literal.slice(0,s._literal.length-2);for(var J=new d("st\
rikethrough"),E=r._next;E&&E!==s;){var Je=E._next;J.appendChild(E),E=Je}r.insertAfter(
J),Le(t,i),t.numdelims===0&&(r.unlink(),this.removeDelimiter(t)),i.numdelims===0&&
(s.unlink(),l=i.next,this.removeDelimiter(i),i=l)}else if(y===W||y===P)if(!c)i=i.
next;else{a=i.numdelims>=2&&t.numdelims>=2?2:1,r=t.node,s=i.node,t.numdelims-=a,
i.numdelims-=a,r._literal=r._literal.slice(0,r._literal.length-a),s._literal=s._literal.
slice(0,s._literal.length-a);var ee=new d(a===1?"emph":"strong");for(o=r._next;o&&
o!==s;)u=o._next,o.unlink(),ee.appendChild(o),o=u;r.insertAfter(ee),Le(t,i),t.numdelims===
0&&(r.unlink(),this.removeDelimiter(t)),i.numdelims===0&&(s.unlink(),l=i.next,this.
removeDelimiter(i),i=l)}else y===k?(i.node._literal="\u2019",c&&(t.node._literal=
"\u2018"),i=i.next):y===b&&(i.node._literal="\u201D",c&&(t.node.literal="\u201C"),
i=i.next);c||(_[f]=n.previous,n.can_open||this.removeDelimiter(n))}}for(;this.delimiters!==
null&&this.delimiters!==e;)this.removeDelimiter(this.delimiters)},ai=function(){
var e=this.match(zt);return e===null?null:X(e.slice(1,-1))},li=function(){var e=this.
match(Rt);if(e===null){if(this.peek()===Ae)return null;for(var t=this.pos,i=0,n;(n=
this.peek())!==-1;)if(n===Te&&De.test(this.subject.charAt(this.pos+1)))this.pos+=
1,this.peek()!==-1&&(this.pos+=1);else if(n===we)this.pos+=1,i+=1;else if(n===Q){
if(i<1)break;this.pos+=1,i-=1}else{if(Se.exec(A(n))!==null)break;this.pos+=1}return this.
pos===t&&n!==Q||i!==0?null:(e=this.subject.slice(t,this.pos),B(X(e)))}else return B(
X(e.slice(1,-1)))},oi=function(){var e=this.match(Kt);return e===null||e.length>
1001?0:e.length},ui=function(e){var t=this.pos,i=this.match(/^\[\^[^\]]+\]/);if(i){
var n=new d("footnote_reference");return n._label=i.slice(2,-1),e.appendChild(n),
!0}this.pos+=1;var r=v("[");return e.appendChild(r),this.addBracket(r,t,!1),!0},
hi=function(e){var t=this.pos;if(this.pos+=1,this.peek()===Ee){this.pos+=1;var i=v(
"![");e.appendChild(i),this.addBracket(i,t+1,!0)}else e.appendChild(v("!"));return!0},
ci=function(e){var t,i,n,r,s=!1,l,a;if(this.pos+=1,t=this.pos,a=this.brackets,a===
null)return e.appendChild(v("]")),!0;if(!a.active)return e.appendChild(v("]")),this.
removeBracket(),!0;i=a.image;var o=this.pos;if(this.peek()===we&&(this.pos++,this.
spnl()&&(n=this.parseLinkDestination())!==null&&this.spnl()&&(Se.test(this.subject.
charAt(this.pos-1))&&(r=this.parseLinkTitle())||!0)&&this.spnl()&&this.peek()===
Q?(this.pos+=1,s=!0):this.pos=o),!s){var u=this.pos,c=this.parseLinkLabel();if(c>
2?l=this.subject.slice(u,u+c):a.bracketAfter||(l=this.subject.slice(a.index,t)),
c===0&&(this.pos=o),l){var _=this.refmap[Be(l)];_&&(n=_.destination,r=_.title,s=
!0)}}if(s){var f=new d(i?"image":"link");f._destination=n,f._title=r||"";var m,L;
for(m=a.node._next;m;)L=m._next,m.unlink(),f.appendChild(m),m=L;if(e.appendChild(
f),this.processEmphasis(a.previousDelimiter),this.removeBracket(),a.node.unlink(),
!i)for(a=this.brackets;a!==null;)a.image||(a.active=!1),a=a.previous;return!0}else
return this.removeBracket(),this.pos=t,e.appendChild(v("]")),!0},fi=function(e,t,i){
this.brackets!==null&&(this.brackets.bracketAfter=!0),this.brackets={node:e,previous:this.
brackets,previousDelimiter:this.delimiters,index:t,image:i,active:!0}},pi=function(){
this.brackets=this.brackets.previous},di=function(e){var t;return(t=this.match(Ut))?
(e.appendChild(v((0,ye.decodeHTMLStrict)(t))),!0):!1},vi=function(e){var t;return(t=
this.match(Xt))?(this.options.smart?e.appendChild(v(t.replace(Ht,"\u2026").replace(
Mt,function(i){var n=0,r=0;return i.length%3===0?r=i.length/3:i.length%2===0?n=i.
length/2:i.length%3===2?(n=1,r=(i.length-2)/3):(n=2,r=(i.length-4)/3),"\u2014".repeat(
r)+"\u2013".repeat(n)}))):e.appendChild(v(t)),!0):!1},_i=function(e){this.pos+=1;
var t=e._lastChild;if(t&&t.type==="text"&&t._literal[t._literal.length-1]===" "){
var i=t._literal[t._literal.length-2]===" ";t._literal=t._literal.replace(Zt,""),
e.appendChild(new d(i?"linebreak":"softbreak"))}else e.appendChild(new d("softbr\
eak"));return this.match(Gt),!0},mi=function(e,t){this.subject=e,this.pos=0;var i,
n,r,s,l=this.pos;if(s=this.parseLinkLabel(),s===0)return 0;if(i=this.subject.slice(
0,s),this.peek()===St)this.pos++;else return this.pos=l,0;if(this.spnl(),n=this.
parseLinkDestination(),n===null)return this.pos=l,0;var a=this.pos;this.spnl(),this.
pos!==a&&(r=this.parseLinkTitle()),r===null&&(this.pos=a);var o=!0;if(this.match(
be)===null&&(r===null?o=!1:(r=null,this.pos=a,o=this.match(be)!==null)),!o)return this.
pos=l,0;var u=Be(i);return u===""?(this.pos=l,0):(t[u]||(t[u]={destination:n,title:r===
null?"":r}),this.pos-l)},gi=function(e){var t=!1,i=this.peek();if(i===-1)return!1;
switch(i){case Ne:t=this.parseNewline(e);break;case Te:t=this.parseBackslash(e);
break;case Tt:t=this.parseBackticks(e);break;case W:case P:case V:t=this.handleDelim(
i,e);break;case k:case b:t=this.options.smart&&this.handleDelim(i,e);break;case Ee:
t=this.parseOpenBracket(e);break;case Ot:t=this.parseBang(e);break;case wt:t=this.
parseCloseBracket(e);break;case Ae:t=this.parseAutolink(e)||this.parseHtmlTag(e);
break;case Dt:t=this.parseEntity(e);break;default:t=this.parseString(e);break}return t||
(this.pos+=1,e.appendChild(v(A(i)))),!0},Ci=function(e){for(this.subject=e._string_content.
trim(),this.pos=0,this.delimiters=null,this.brackets=null;this.parseInline(e););
e._string_content=null,this.processEmphasis(null)};Pe=xi});var qe={};te(qe,{default:()=>Yi});function Vi(e){return{doc:new $e,blocks:Fe,blockStarts:$i,
tip:this.doc,oldtip:this.doc,currentLine:"",lineNumber:0,offset:0,column:0,nextNonspace:0,
nextNonspaceColumn:0,indent:0,indented:!1,blank:!1,partiallyConsumedTab:!1,allClosed:!0,
lastMatchedContainer:this.doc,refmap:{},lastLineLength:0,inlineParser:new Pe(e),
findNextNonspace:Gi,advanceOffset:qi,advanceNextNonspace:Zi,addLine:Ui,addChild:ji,
incorporateLine:Ki,finalize:Xi,processInlines:Wi,closeUnmatchedBlocks:Mi,parse:Qi,
options:e||{}}}var z,Ue,ki,je,bi,Ie,He,Li,yi,Ni,Ei,Ai,R,Ti,Me,wi,Oi,Di,Si,Bi,Pi,
zi,Ri,T,g,Re,Ui,ji,Ii,Hi,Mi,Fi,Fe,$i,qi,Zi,Gi,Ki,Xi,Wi,$e,Qi,Yi,Ze=x(()=>{"use s\
trict";I();S();ze();z=4,Ue=9,ki=10,je=62,bi=60,Ie=32,He=91,Li=[/./,/^<(?:script|pre|textarea|style)(?:\s|>|$)/i,
/^<!--/,/^<[?]/,/^<![A-Za-z]/,/^<!\[CDATA\[/,/^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|search|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i,
new RegExp("^(?:"+F+"|"+$+")\\s*$","i")],yi=[/./,/<\/(?:script|pre|textarea|style)>/i,
/-->/,/\?>/,/>/,/\]\]>/],Ni=/^(?:\*[ \t]*){3,}$|^(?:_[ \t]*){3,}$|^(?:-[ \t]*){3,}$/,
Ei=/^\[\^([^\]]+)\]:[ \t]*/,Ai=/^\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/,
R=function(e){var t=[],i="",n,r;for(e=e.trim().replace(/^\|/,"").replace(/\|[ \t]*$/,
""),n=0;n<e.length;n++)r=e.charAt(n),r==="\\"&&e.charAt(n+1)==="|"?(i+="|",n++):
r==="|"?(t.push(i.trim()),i=""):i+=r;return t.push(i.trim()),t},Ti=/^[#`~*+_=<>0-9|:[-]/,
Me=/[^ \t\f\v\r\n]/,wi=/^[*+-]/,Oi=/^(\d{1,9})([.)])/,Di=/^#{1,6}(?:[ \t]+|$)/,Si=
/^`{3,}(?!.*`)|^~{3,}/,Bi=/^(?:`{3,}|~{3,})(?=[ \t]*$)/,Pi=/^(?:=+|-+)[ \t]*$/,zi=
/\r\n|\n|\r/,Ri=function(e){return!Me.test(e)},T=function(e){return e===Ie||e===
Ue},g=function(e,t){return t<e.length?e.charCodeAt(t):-1},Re=function(e){return e.
next&&e.sourcepos[1][0]!==e.next.sourcepos[0][0]-1},Ui=function(){if(this.partiallyConsumedTab){
this.offset+=1;var e=4-this.column%4;this.tip._string_content+=" ".repeat(e)}this.
tip._string_content+=this.currentLine.slice(this.offset)+`
`},ji=function(e,t){for(;!this.blocks[this.tip.type].canContain(e);)this.finalize(
this.tip,this.lineNumber-1);var i=t+1,n=new d(e,[[this.lineNumber,i],[0,0]]);return n.
_string_content="",this.tip.appendChild(n),this.tip=n,n},Ii=function(e,t){var i=e.
currentLine.slice(e.nextNonspace),n,r,s,l,a={type:null,tight:!0,bulletChar:null,
start:null,delimiter:null,padding:null,markerOffset:e.indent};if(e.indent>=4)return null;
if(n=i.match(wi))a.type="bullet",a.bulletChar=n[0][0];else if((n=i.match(Oi))&&(t.
type!=="paragraph"||n[1]==1))a.type="ordered",a.start=parseInt(n[1]),a.delimiter=
n[2];else return null;if(r=g(e.currentLine,e.nextNonspace+n[0].length),!(r===-1||
r===Ue||r===Ie)||t.type==="paragraph"&&!e.currentLine.slice(e.nextNonspace+n[0].
length).match(Me))return null;e.advanceNextNonspace(),e.advanceOffset(n[0].length,
!0),s=e.column,l=e.offset;do e.advanceOffset(1,!0),r=g(e.currentLine,e.offset);while(e.
column-s<5&&T(r));var o=g(e.currentLine,e.offset)===-1,u=e.column-s;return u>=5||
u<1||o?(a.padding=n[0].length+1,e.column=s,e.offset=l,T(g(e.currentLine,e.offset))&&
e.advanceOffset(1,!0)):a.padding=n[0].length+u,a},Hi=function(e,t){return e.type===
t.type&&e.delimiter===t.delimiter&&e.bulletChar===t.bulletChar},Mi=function(){if(!this.
allClosed){for(;this.oldtip!==this.lastMatchedContainer;){var e=this.oldtip._parent;
this.finalize(this.oldtip,this.lineNumber-1),this.oldtip=e}this.allClosed=!0}},Fi=
function(e,t){for(var i,n,r=t.walker(),s=[];i=r.next();)if(n=i.node,i.entering&&
n.type==="paragraph"){for(var l,a=!1;g(n._string_content,0)===He&&(l=e.inlineParser.
parseReference(n._string_content,e.refmap));){let o=n._string_content.slice(0,l);
n._string_content=n._string_content.slice(l),a=!0;let u=o.split(`
`);n.sourcepos[0][0]+=u.length-1}a&&Ri(n._string_content)&&s.push(n)}for(n of s)
n.unlink()},Fe={document:{continue:function(){return 0},finalize:function(e,t){Fi(
e,t)},canContain:function(e){return e!=="item"},acceptsLines:!1},list:{continue:function(){
return 0},finalize:function(e,t){for(var i=t._firstChild;i;){if(i._next&&Re(i)){
t._listData.tight=!1;break}for(var n=i._firstChild;n;){if(n._next&&Re(n)){t._listData.
tight=!1;break}n=n._next}i=i._next}t.sourcepos[1]=t._lastChild.sourcepos[1]},canContain:function(e){
return e==="item"},acceptsLines:!1},block_quote:{continue:function(e){var t=e.currentLine;
if(!e.indented&&g(t,e.nextNonspace)===je)e.advanceNextNonspace(),e.advanceOffset(
1,!1),T(g(t,e.offset))&&e.advanceOffset(1,!0);else return 1;return 0},finalize:function(){},
canContain:function(e){return e!=="item"},acceptsLines:!1},item:{continue:function(e,t){
if(e.blank){if(t._firstChild==null)return 1;e.advanceNextNonspace()}else if(e.indent>=
t._listData.markerOffset+t._listData.padding)e.advanceOffset(t._listData.markerOffset+
t._listData.padding,!0);else return 1;return 0},finalize:function(e,t){t._lastChild?
t.sourcepos[1]=t._lastChild.sourcepos[1]:(t.sourcepos[1][0]=t.sourcepos[0][0],t.
sourcepos[1][1]=t._listData.markerOffset+t._listData.padding)},canContain:function(e){
return e!=="item"},acceptsLines:!1},heading:{continue:function(){return 1},finalize:function(){},
canContain:function(){return!1},acceptsLines:!1},thematic_break:{continue:function(){
return 1},finalize:function(){},canContain:function(){return!1},acceptsLines:!1},
code_block:{continue:function(e,t){var i=e.currentLine,n=e.indent;if(t._isFenced){
var r=n<=3&&i.charAt(e.nextNonspace)===t._fenceChar&&i.slice(e.nextNonspace).match(
Bi);if(r&&r[0].length>=t._fenceLength)return e.lastLineLength=e.offset+n+r[0].length,
e.finalize(t,e.lineNumber),2;for(var s=t._fenceOffset;s>0&&T(g(i,e.offset));)e.advanceOffset(
1,!0),s--}else if(n>=z)e.advanceOffset(z,!0);else if(e.blank)e.advanceNextNonspace();else
return 1;return 0},finalize:function(e,t){if(t._isFenced){var i=t._string_content,
n=i.indexOf(`
`),r=i.slice(0,n),s=i.slice(n+1);t.info=D(r.trim()),t._literal=s}else{for(var l=t.
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
return e.blank?1:0},finalize:function(e,t){var i=t._string_content.replace(/\n$/,
"").split(`
`),n=R(i[1]),r=n.map(function(c){var _=c.charAt(0)===":",f=c.charAt(c.length-1)===
":";return _&&f?"center":f?"right":_?"left":null}),s,l,a,o,u;for(s=0;s<i.length;s++)
if(s!==1){for(a=R(i[s]),o=new d("table_row"),o._isHeading=s===0,l=0;l<n.length;l++)
u=new d("table_cell"),u._align=r[l],u._string_content=a[l]===void 0?"":a[l],o.appendChild(
u);t.appendChild(o)}t._string_content=null},canContain:function(e){return e==="t\
able_row"},acceptsLines:!0},paragraph:{continue:function(e){return e.blank?1:0},
finalize:function(){},canContain:function(){return!1},acceptsLines:!0}},$i=[function(e){
if(e.indented)return 0;var t=e.currentLine.slice(e.nextNonspace).match(Ei);if(!t)
return 0;e.closeUnmatchedBlocks(),e.advanceNextNonspace(),e.advanceOffset(t[0].length,
!1);var i=e.addChild("footnote_definition",e.nextNonspace);return i._label=t[1],
1},function(e,t){if(e.indented||t.type!=="paragraph")return 0;var i=e.currentLine.
slice(e.nextNonspace);if(i.indexOf("|")===-1||!Ai.test(i))return 0;var n=t._string_content.
replace(/\n$/,"").split(`
`),r=n[n.length-1];if(!r||r.indexOf("|")===-1||R(r).length!==R(i).length)return 0;
var s=n.slice(0,n.length-1).join(`
`);t._string_content=s===""?"":s+`
`,e.closeUnmatchedBlocks();var l=s==="",a=e.addChild("table",e.nextNonspace);return l&&
t.unlink(),a._string_content=r+`
`,2},function(e){return!e.indented&&g(e.currentLine,e.nextNonspace)===je?(e.advanceNextNonspace(),
e.advanceOffset(1,!1),T(g(e.currentLine,e.offset))&&e.advanceOffset(1,!0),e.closeUnmatchedBlocks(),
e.addChild("block_quote",e.nextNonspace),1):0},function(e){var t;if(!e.indented&&
(t=e.currentLine.slice(e.nextNonspace).match(Di))){e.advanceNextNonspace(),e.advanceOffset(
t[0].length,!1),e.closeUnmatchedBlocks();var i=e.addChild("heading",e.nextNonspace);
return i.level=t[0].trim().length,i._string_content=e.currentLine.slice(e.offset).
replace(/^[ \t]*#+[ \t]*$/,"").replace(/[ \t]+#+[ \t]*$/,""),e.advanceOffset(e.currentLine.
length-e.offset),2}else return 0},function(e){var t;if(!e.indented&&(t=e.currentLine.
slice(e.nextNonspace).match(Si))){var i=t[0].length;e.closeUnmatchedBlocks();var n=e.
addChild("code_block",e.nextNonspace);return n._isFenced=!0,n._fenceLength=i,n._fenceChar=
t[0][0],n._fenceOffset=e.indent,e.advanceNextNonspace(),e.advanceOffset(i,!1),2}else
return 0},function(e,t){if(!e.indented&&g(e.currentLine,e.nextNonspace)===bi){var i=e.
currentLine.slice(e.nextNonspace),n;for(n=1;n<=7;n++)if(Li[n].test(i)&&(n<7||t.type!==
"paragraph"&&!(!e.allClosed&&!e.blank&&e.tip.type==="paragraph"))){e.closeUnmatchedBlocks();
var r=e.addChild("html_block",e.offset);return r._htmlBlockType=n,2}}return 0},function(e,t){
var i;if(!e.indented&&t.type==="paragraph"&&(i=e.currentLine.slice(e.nextNonspace).
match(Pi))){e.closeUnmatchedBlocks();for(var n;g(t._string_content,0)===He&&(n=e.
inlineParser.parseReference(t._string_content,e.refmap));)t._string_content=t._string_content.
slice(n);if(t._string_content.length>0){var r=new d("heading",t.sourcepos);return r.
level=i[0][0]==="="?1:2,r._string_content=t._string_content,t.insertAfter(r),t.unlink(),
e.tip=r,e.advanceOffset(e.currentLine.length-e.offset,!1),2}else return 0}else return 0},
function(e){return!e.indented&&Ni.test(e.currentLine.slice(e.nextNonspace))?(e.closeUnmatchedBlocks(),
e.addChild("thematic_break",e.nextNonspace),e.advanceOffset(e.currentLine.length-
e.offset,!1),2):0},function(e,t){var i;return(!e.indented||t.type==="list")&&(i=
Ii(e,t))?(e.closeUnmatchedBlocks(),(e.tip.type!=="list"||!Hi(t._listData,i))&&(t=
e.addChild("list",e.nextNonspace),t._listData=i),t=e.addChild("item",e.nextNonspace),
t._listData=i,1):0},function(e){return e.indented&&e.tip.type!=="paragraph"&&!e.
blank?(e.advanceOffset(z,!0),e.closeUnmatchedBlocks(),e.addChild("code_block",e.
offset),2):0}],qi=function(e,t){for(var i=this.currentLine,n,r,s;e>0&&(s=i[this.
offset]);)s==="	"?(n=4-this.column%4,t?(this.partiallyConsumedTab=n>e,r=n>e?e:n,
this.column+=r,this.offset+=this.partiallyConsumedTab?0:1,e-=r):(this.partiallyConsumedTab=
!1,this.column+=n,this.offset+=1,e-=1)):(this.partiallyConsumedTab=!1,this.offset+=
1,this.column+=1,e-=1)},Zi=function(){this.offset=this.nextNonspace,this.column=
this.nextNonspaceColumn,this.partiallyConsumedTab=!1},Gi=function(){for(var e=this.
currentLine,t=this.offset,i=this.column,n;(n=e.charAt(t))!=="";)if(n===" ")t++,i++;else if(n===
"	")t++,i+=4-i%4;else break;this.blank=n===`
`||n==="\r"||n==="",this.nextNonspace=t,this.nextNonspaceColumn=i,this.indent=this.
nextNonspaceColumn-this.column,this.indented=this.indent>=z},Ki=function(e){var t=!0,
i,n=this.doc;this.oldtip=this.tip,this.offset=0,this.column=0,this.blank=!1,this.
partiallyConsumedTab=!1,this.lineNumber+=1,e.indexOf("\0")!==-1&&(e=e.replace(/\0/g,
"\uFFFD")),this.currentLine=e;for(var r;(r=n._lastChild)&&r._open;){switch(n=r,this.
findNextNonspace(),this.blocks[n.type].continue(this,n)){case 0:break;case 1:t=!1;
break;case 2:return;default:throw"continue returned illegal value, must be 0, 1,\
 or 2"}if(!t){n=n._parent;break}}this.allClosed=n===this.oldtip,this.lastMatchedContainer=
n;for(var s=n.type!=="paragraph"&&n.type!=="table"&&Fe[n.type].acceptsLines,l=this.
blockStarts,a=l.length;!s;){if(this.findNextNonspace(),!this.indented&&!Ti.test(
e.slice(this.nextNonspace))){this.advanceNextNonspace();break}for(var o=0;o<a;){
var u=l[o](this,n);if(u===1){n=this.tip;break}else if(u===2){n=this.tip,s=!0;break}else
o++}if(o===a){this.advanceNextNonspace();break}}!this.allClosed&&!this.blank&&this.
tip.type==="paragraph"?this.addLine():(this.closeUnmatchedBlocks(),i=n.type,this.
blocks[i].acceptsLines?(this.addLine(),i==="html_block"&&n._htmlBlockType>=1&&n.
_htmlBlockType<=5&&yi[n._htmlBlockType].test(this.currentLine.slice(this.offset))&&
(this.lastLineLength=e.length,this.finalize(n,this.lineNumber))):this.offset<e.length&&
!this.blank&&(n=this.addChild("paragraph",this.offset),this.advanceNextNonspace(),
this.addLine())),this.lastLineLength=e.length},Xi=function(e,t){var i=e._parent;
e._open=!1,e.sourcepos[1]=[t,this.lastLineLength],this.blocks[e.type].finalize(this,
e),this.tip=i},Wi=function(e){var t,i,n,r=e.walker();for(this.inlineParser.refmap=
this.refmap,this.inlineParser.options=this.options;i=r.next();)t=i.node,n=t.type,
!i.entering&&(n==="paragraph"||n==="heading"||n==="table_cell")&&this.inlineParser.
parse(t)},$e=function(){var e=new d("document",[[1,1],[0,0]]);return e},Qi=function(e){
this.doc=new $e,this.tip=this.doc,this.refmap={},this.lineNumber=0,this.lastLineLength=
0,this.offset=0,this.column=0,this.lastMatchedContainer=this.doc,this.currentLine=
"",this.options.time&&console.time("preparing input");var t=e.split(zi),i=t.length;
e.charCodeAt(e.length-1)===ki&&(i-=1),this.options.time&&console.timeEnd("prepar\
ing input"),this.options.time&&console.time("block parsing");for(var n=0;n<i;n++)
this.incorporateLine(t[n]);for(;this.tip;)this.finalize(this.tip,i);return this.
options.time&&console.timeEnd("block parsing"),this.options.time&&console.time("\
inline parsing"),this.processInlines(this.doc),this.options.time&&console.timeEnd(
"inline parsing"),this.doc};Yi=Vi});function N(){}function Ji(e){var t=e.walker(),i,n;for(this.buffer="",this.lastOut=
`
`;i=t.next();)n=i.node.type,this[n]&&this[n](i.node,i.entering);return this.buffer}
function en(e){this.buffer+=e,this.lastOut=e}function tn(){this.lastOut!==`
`&&this.lit(`
`)}function nn(e){this.lit(e)}function rn(e){return e}var Ge,Ke=x(()=>{"use stri\
ct";N.prototype.render=Ji;N.prototype.out=nn;N.prototype.lit=en;N.prototype.cr=tn;
N.prototype.esc=rn;Ge=N});var We={};te(We,{default:()=>wn});function ln(e,t,i){if(!(this.disableTags>0)){if(this.
buffer+="<"+e,t&&t.length>0)for(var n=0,r;(r=t[n])!==void 0;)this.buffer+=" "+r[0]+
'="'+r[1]+'"',n++;i&&(this.buffer+=" /"),this.buffer+=">",this.lastOut=">"}}function h(e){
e=e||{},e.softbreak=e.softbreak||`
`,this.esc=e.esc||Z,this.disableTags=0,this.lastOut=`
`,this.options=e}function on(e){this.out(e.literal)}function un(){this.lit(this.
options.softbreak)}function hn(){this.tag("br",[],!0),this.cr()}function cn(e,t){
var i=this.attrs(e);t?(this.options.safe&&Xe(e.destination)||i.push(["href",this.
esc(e.destination)]),e.title&&i.push(["title",this.esc(e.title)]),this.tag("a",i)):
this.tag("/a")}function fn(e,t){t?(this.disableTags===0&&(this.options.safe&&Xe(
e.destination)?this.lit('<img src="" alt="'):this.lit('<img src="'+this.esc(e.destination)+
'" alt="')),this.disableTags+=1):(this.disableTags-=1,this.disableTags===0&&(e.title&&
this.lit('" title="'+this.esc(e.title)),this.lit('" />')))}function pn(e,t){this.
tag(t?"em":"/em")}function dn(e,t){this.tag(t?"strong":"/strong")}function vn(e,t){
var i=e.parent.parent,n=this.attrs(e);i!==null&&i.type==="list"&&i.listTight||(t?
(this.cr(),this.tag("p",n)):(this.tag("/p"),this.cr()))}function _n(e,t){var i="\
h"+e.level,n=this.attrs(e);t?(this.cr(),this.tag(i,n)):(this.tag("/"+i),this.cr())}
function mn(e){this.tag("code"),this.out(e.literal),this.tag("/code")}function gn(e){
var t=e.info?e.info.split(/\s+/):[],i=this.attrs(e);if(t.length>0&&t[0].length>0){
var n=this.esc(t[0]);/^language-/.exec(n)||(n="language-"+n),i.push(["class",n])}
this.cr(),this.tag("pre"),this.tag("code",i),this.out(e.literal),this.tag("/code"),
this.tag("/pre"),this.cr()}function Cn(e){var t=this.attrs(e);this.cr(),this.tag(
"hr",t,!0),this.cr()}function xn(e,t){var i=this.attrs(e);t?(this.cr(),this.tag(
"blockquote",i),this.cr()):(this.cr(),this.tag("/blockquote"),this.cr())}function kn(e,t){
var i=e.listType==="bullet"?"ul":"ol",n=this.attrs(e);if(t){var r=e.listStart;r!==
null&&r!==1&&n.push(["start",r.toString()]),this.cr(),this.tag(i,n),this.cr()}else
this.cr(),this.tag("/"+i),this.cr()}function bn(e,t){var i=this.attrs(e);t?this.
tag("li",i):(this.tag("/li"),this.cr())}function Ln(e){this.options.safe?this.lit(
"<!-- raw HTML omitted -->"):this.lit(e.literal)}function yn(e){this.cr(),this.options.
safe?this.lit("<!-- raw HTML omitted -->"):this.lit(e.literal),this.cr()}function Nn(e,t){
t&&e.onEnter?this.lit(e.onEnter):!t&&e.onExit&&this.lit(e.onExit)}function En(e,t){
this.cr(),t&&e.onEnter?this.lit(e.onEnter):!t&&e.onExit&&this.lit(e.onExit),this.
cr()}function An(e){this.lit(this.esc(e))}function Tn(e){var t=[];if(this.options.
sourcepos){var i=e.sourcepos;i&&t.push(["data-sourcepos",String(i[0][0])+":"+String(
i[0][1])+"-"+String(i[1][0])+":"+String(i[1][1])])}return t}var sn,an,Xe,wn,Qe=x(
()=>{"use strict";S();Ke();sn=/^javascript:|vbscript:|file:|data:/i,an=/^data:image\/(?:png|gif|jpeg|webp)/i,
Xe=function(e){return sn.test(e)&&!an.test(e)};h.prototype=Object.create(Ge.prototype);
h.prototype.text=on;h.prototype.html_inline=Ln;h.prototype.html_block=yn;h.prototype.
softbreak=un;h.prototype.linebreak=hn;h.prototype.link=cn;h.prototype.image=fn;h.
prototype.emph=pn;h.prototype.strong=dn;h.prototype.paragraph=vn;h.prototype.heading=
_n;h.prototype.code=mn;h.prototype.code_block=gn;h.prototype.thematic_break=Cn;h.
prototype.block_quote=xn;h.prototype.list=kn;h.prototype.item=bn;h.prototype.custom_inline=
Nn;h.prototype.custom_block=En;h.prototype.esc=Z;h.prototype.out=An;h.prototype.
tag=ln;h.prototype.attrs=Tn;wn=h});var On=U((Zn,Ye)=>{var Y=(Ze(),ne(qe)),Ve=(Qe(),ne(We));Ye.exports={Parser:Y.Parser||
Y.default||Y,HtmlRenderer:Ve.default||Ve}});return On();})();
/*! Bundled license information:

commonmark/lib/from-code-point.js:
  (*! http://mths.be/fromcodepoint v0.2.1 by @mathias *)
*/
