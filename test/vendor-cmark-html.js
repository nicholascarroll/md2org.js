/*
 * Test only: not shipped and not referenced by src/.
 *
 * Upstream's HTML renderer, used by test/conformance.js to compare against the
 * spec's 652 Markdown/HTML pairs. Conformance parses with src/vendor/commonmark.js,
 * the shipped parser, not the one bundled here.
 *
 * Regenerate: node tools/build-vendor.js
 */
var CM=(()=>{var Jt=Object.create;var w=Object.defineProperty;var te=Object.getOwnPropertyDescriptor;var ee=Object.getOwnPropertyNames;var ie=Object.getPrototypeOf,ne=Object.prototype.hasOwnProperty;var x=(t,e,i)=>()=>{if(i)throw i[0];try{return t&&(e=t(t=0)),e}catch(n){throw i=
[n],n}};var j=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(i){
throw e=0,i}},et=(t,e)=>{for(var i in e)w(t,i,{get:e[i],enumerable:!0})},it=(t,e,i,n)=>{
if(e&&typeof e=="object"||typeof e=="function")for(let r of ee(e))!ne.call(t,r)&&
r!==i&&w(t,r,{get:()=>e[r],enumerable:!(n=te(e,r))||n.enumerable});return t};var z=(t,e,i)=>(i=t!=null?Jt(ie(t)):{},it(e||!t||!t.__esModule?w(i,"default",{value:t,
enumerable:!0}):i,t)),nt=t=>it(w({},"__esModule",{value:!0}),t);function rt(t){switch(t._type){case"document":case"block_quote":case"list":case"\
item":case"paragraph":case"heading":case"emph":case"strong":case"strikethrough":case"\
table":case"table_row":case"table_cell":case"footnote_definition":case"link":case"\
image":case"custom_inline":case"custom_block":return!0;default:return!1}}var re,
se,ae,C,d,u,I=x(()=>{"use strict";re=function(t,e){this.current=t,this.entering=
e===!0},se=function(){var t=this.current,e=this.entering;if(t===null)return null;
var i=rt(t);return e&&i?t._firstChild?(this.current=t._firstChild,this.entering=
!0):this.entering=!1:t===this.root?this.current=null:t._next===null?(this.current=
t._parent,this.entering=!1):(this.current=t._next,this.entering=!0),{entering:e,
node:t}},ae=function(t){return{current:t,root:t,entering:!0,next:se,resumeAt:re}},
C=function(t,e){this._type=t,this._parent=null,this._firstChild=null,this._lastChild=
null,this._prev=null,this._next=null,this._sourcepos=e,this._open=!0,this._string_content=
null,this._literal=null,this._listData={},this._info=null,this._destination=null,
this._title=null,this._isFenced=!1,this._fenceChar=null,this._fenceLength=0,this.
_fenceOffset=null,this._level=null,this._onEnter=null,this._onExit=null},d=C.prototype;
Object.defineProperty(d,"isContainer",{get:function(){return rt(this)}});Object.
defineProperty(d,"type",{get:function(){return this._type}});Object.defineProperty(
d,"firstChild",{get:function(){return this._firstChild}});Object.defineProperty(
d,"lastChild",{get:function(){return this._lastChild}});Object.defineProperty(d,
"next",{get:function(){return this._next}});Object.defineProperty(d,"prev",{get:function(){
return this._prev}});Object.defineProperty(d,"parent",{get:function(){return this.
_parent}});Object.defineProperty(d,"sourcepos",{get:function(){return this._sourcepos}});
Object.defineProperty(d,"literal",{get:function(){return this._literal},set:function(t){
this._literal=t}});Object.defineProperty(d,"destination",{get:function(){return this.
_destination},set:function(t){this._destination=t}});Object.defineProperty(d,"ti\
tle",{get:function(){return this._title},set:function(t){this._title=t}});Object.
defineProperty(d,"info",{get:function(){return this._info},set:function(t){this.
_info=t}});Object.defineProperty(d,"level",{get:function(){return this._level},set:function(t){
this._level=t}});Object.defineProperty(d,"listType",{get:function(){return this.
_listData.type},set:function(t){this._listData.type=t}});Object.defineProperty(d,
"listTight",{get:function(){return this._listData.tight},set:function(t){this._listData.
tight=t}});Object.defineProperty(d,"listStart",{get:function(){return this._listData.
start},set:function(t){this._listData.start=t}});Object.defineProperty(d,"listDe\
limiter",{get:function(){return this._listData.delimiter},set:function(t){this._listData.
delimiter=t}});Object.defineProperty(d,"onEnter",{get:function(){return this._onEnter},
set:function(t){this._onEnter=t}});Object.defineProperty(d,"onExit",{get:function(){
return this._onExit},set:function(t){this._onExit=t}});C.prototype.appendChild=function(t){
t.unlink(),t._parent=this,this._lastChild?(this._lastChild._next=t,t._prev=this.
_lastChild,this._lastChild=t):(this._firstChild=t,this._lastChild=t)};C.prototype.
prependChild=function(t){t.unlink(),t._parent=this,this._firstChild?(this._firstChild.
_prev=t,t._next=this._firstChild,this._firstChild=t):(this._firstChild=t,this._lastChild=
t)};C.prototype.unlink=function(){this._prev?this._prev._next=this._next:this._parent&&
(this._parent._firstChild=this._next),this._next?this._next._prev=this._prev:this.
_parent&&(this._parent._lastChild=this._prev),this._parent=null,this._next=null,
this._prev=null};C.prototype.insertAfter=function(t){t.unlink(),t._next=this._next,
t._next&&(t._next._prev=t),t._prev=this,this._next=t,t._parent=this._parent,t._next||
(t._parent._lastChild=t)};C.prototype.insertBefore=function(t){t.unlink(),t._prev=
this._prev,t._prev&&(t._prev._next=t),t._next=this,this._prev=t,t._parent=this._parent,
t._prev||(t._parent._firstChild=t)};C.prototype.walker=function(){var t=new ae(this);
return t};u=C});var lt=j((Pn,at)=>{"use strict";var st={};function le(t){var e,i,n=st[t];if(n)return n;
for(n=st[t]=[],e=0;e<128;e++)i=String.fromCharCode(e),/^[0-9a-z]$/i.test(i)?n.push(
i):n.push("%"+("0"+e.toString(16).toUpperCase()).slice(-2));for(e=0;e<t.length;e++)
n[t.charCodeAt(e)]=t[e];return n}function O(t,e,i){var n,r,s,l,a,o="";for(typeof e!=
"string"&&(i=e,e=O.defaultChars),typeof i>"u"&&(i=!0),a=le(e),n=0,r=t.length;n<r;n++){
if(s=t.charCodeAt(n),i&&s===37&&n+2<r&&/^[0-9a-f]{2}$/i.test(t.slice(n+1,n+3))){
o+=t.slice(n,n+3),n+=2;continue}if(s<128){o+=a[s];continue}if(s>=55296&&s<=57343){
if(s>=55296&&s<=56319&&n+1<r&&(l=t.charCodeAt(n+1),l>=56320&&l<=57343)){o+=encodeURIComponent(
t[n]+t[n+1]),n++;continue}o+="%EF%BF%BD";continue}o+=encodeURIComponent(t[n])}return o}
O.defaultChars=";/?:@&=+$,-_.!~*'()#";O.componentChars="-_.!~*'()";at.exports=O});var H=j((Rn,ht)=>{function ot(t){return t}ht.exports={decodeHTML:ot,decodeHTMLStrict:ot,
encodeHTML:t=>t,escape:t=>t.replace(/[&<>"]/g,e=>({"&":"&amp;","<":"&lt;",">":"&\
gt;",'"':"&quot;"})[e])}});var ut,ft,oe,M,pt,he,ce,ue,fe,pe,de,ve,$,F,_e,me,ge,Ce,xe,dt,ke,Z,Le,be,ct,ye,S,
vt,Ne,q,B=x(()=>{"use strict";ut=z(lt(),1),ft=z(H(),1),oe=92,M="&(?:#x[a-f0-9]{1\
,6}|#[0-9]{1,7}|[a-z][a-z0-9]{1,31});",pt="[A-Za-z][A-Za-z0-9-]*",he="[a-zA-Z_:]\
[a-zA-Z0-9:._-]*",ce="[^\"'=<>`\\x00-\\x20]+",ue="'[^']*'",fe='"[^"]*"',pe="(?:"+
ce+"|"+ue+"|"+fe+")",de="(?:\\s*=\\s*"+pe+")",ve="(?:\\s+"+he+de+"?)",$="<"+pt+ve+
"*\\s*/?>",F="</"+pt+"\\s*[>]",_e="<!-->|<!--->|<!--[\\s\\S]*?-->",me="[<][?][\\s\
\\S]*?[?][>]",ge="<![A-Za-z]+[^>]*>",Ce="<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",xe="(?:"+
$+"|"+F+"|"+_e+"|"+me+"|"+ge+"|"+Ce+")",dt=new RegExp("^"+xe),ke=/[\\&]/,Z="[!\"#\
$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]",Le=new RegExp("\\\\"+Z+"|"+M,"gi"),be='[&<>\
"]',ct=new RegExp(be,"g"),ye=function(t){return t.charCodeAt(0)===oe?t.charAt(1):
(0,ft.decodeHTMLStrict)(t)},S=function(t){return ke.test(t)?t.replace(Le,ye):t},
vt=function(t){try{return(0,ut.default)(t)}catch{return t}},Ne=function(t){switch(t){case"\
&":return"&amp;";case"<":return"&lt;";case">":return"&gt;";case'"':return"&quot;";default:
return t}},q=function(t){return ct.test(t)?t.replace(ct,Ne):t}});function A(t){return G(t)}var G,_t,mt,gt=x(()=>{"use strict";String.fromCodePoint?
G=function(t){try{return String.fromCodePoint(t)}catch(e){if(e instanceof RangeError)
return"\uFFFD";throw e}}:(_t=String.fromCharCode,mt=Math.floor,G=function(){var t=16384,
e=[],i,n,r=-1,s=arguments.length;if(!s)return"";for(var l="";++r<s;){var a=Number(
arguments[r]);if(!isFinite(a)||a<0||a>1114111||mt(a)!==a)return"\uFFFD";a<=65535?
e.push(a):(a-=65536,i=(a>>10)+55296,n=a%1024+56320,e.push(i,n)),(r+1===s||e.length>
t)&&(l+=_t.apply(null,e),e.length=0)}return l})});function ki(t){return{subject:"",delimiters:null,brackets:null,pos:0,refmap:{},match:Qe,
peek:Ve,spnl:Ye,parseBackticks:Je,parseBackslash:ti,parseAutolink:ei,parseHtmlTag:ii,
scanDelims:ni,handleDelim:ri,parseLinkTitle:li,parseLinkDestination:oi,parseLinkLabel:hi,
parseOpenBracket:ci,parseBang:ui,parseCloseBracket:fi,addBracket:pi,removeBracket:di,
parseEntity:vi,parseString:_i,parseNewline:mi,parseReference:gi,parseInline:Ci,processEmphasis:ai,
removeDelimiter:si,options:t||{},parse:xi}}var bt,D,W,yt,X,P,Ae,Nt,Te,Et,we,At,Oe,
Tt,Q,Se,k,L,V,wt,K,Be,De,Ct,Pe,Re,Ot,Ue,je,ze,Ie,He,Me,$e,Fe,St,xt,Ze,qe,kt,Ge,Ke,
We,Xe,v,Bt,Qe,Ve,Ye,Je,ti,ei,ii,ni,ri,si,Lt,ai,li,oi,hi,ci,ui,fi,pi,di,vi,_i,mi,
gi,Ci,xi,Dt,Pt=x(()=>{"use strict";I();B();gt();bt=z(H(),1),D=vt,W=S,yt=10,X=42,
P=95,Ae=96,Nt=91,Te=93,Et=60,we=33,At=92,Oe=38,Tt=40,Q=41,Se=58,k=39,L=34,V=126,
wt=Z,K="\\\\"+wt,Be=M,De=dt,Ct=new RegExp(/^[!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~\p{P}\p{S}]/u),
Pe=new RegExp('^(?:"('+K+`|\\\\[^\\\\]|[^\\\\"\\x00])*"|'(`+K+"|\\\\[^\\\\]|[^\\\\'\\x0\
0])*'|\\(("+K+"|\\\\[^\\\\]|[^\\\\()\\x00])*\\))"),Re=/^(?:<(?:[^<>\n\\\x00]|\\.)*>)/,
Ot=new RegExp("^"+wt),Ue=new RegExp("^"+Be,"i"),je=/`+/,ze=/^`+/,Ie=/\.\.\./g,He=
/--+/g,Me=/^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/,
$e=/^<[A-Za-z][A-Za-z0-9.+-]{1,31}:[^<>\x00-\x20]*>/i,Fe=/^ *(?:\n *)?/,St=/^[ \t\n\x0b\x0c\x0d]/,
xt=/^\s/,Ze=/ *$/,qe=/^ */,kt=/^ *(?:\n|$)/,Ge=/^\[(?:[^\\\[\]]|\\.){0,1000}\]/s,
Ke=/^\\\((?:(?!\\\))[\s\S])+\\\)/,We=/^\\\[(?:(?!\\\])[\s\S])+\\\](?=[ \t]*(?:\n|$))/,
Xe=/^[^\n`\[\]\\!<&*_'"~]+/m,v=function(t){var e=new u("text");return e._literal=
t,e},Bt=function(t){return t.slice(1,t.length-1).trim().replace(/[ \t\r\n]+/g," ").
toLowerCase().toUpperCase()},Qe=function(t){var e=t.exec(this.subject.slice(this.
pos));return e===null?null:(this.pos+=e.index+e[0].length,e[0])},Ve=function(){return this.
pos<this.subject.length?this.subject.charCodeAt(this.pos):-1},Ye=function(){return this.
match(Fe),!0},Je=function(t){var e=this.match(ze);if(e===null)return!1;for(var i=this.
pos,n,r,s;(n=this.match(je))!==null;)if(n===e)return r=new u("code"),s=this.subject.
slice(i,this.pos-e.length).replace(/\n/gm," "),s.length>0&&s.match(/[^ ]/)!==null&&
s[0]==" "&&s[s.length-1]==" "?r._literal=s.slice(1,s.length-1):r._literal=s,t.appendChild(
r),!0;return this.pos=i,t.appendChild(v(e)),!0},ti=function(t){var e=this.subject,
i,n=e.charAt(this.pos+1),r=n==="("?this.match(Ke):n==="["&&(this.pos===0||e.charAt(
this.pos-1)===`
`)?this.match(We):null;return r?(i=new u("math"),i._literal=r,t.appendChild(i),!0):
(this.pos+=1,this.peek()===yt?(this.pos+=1,i=new u("linebreak"),t.appendChild(i)):
Ot.test(e.charAt(this.pos))?(t.appendChild(v(e.charAt(this.pos))),this.pos+=1):t.
appendChild(v("\\")),!0)},ei=function(t){var e,i,n;return(e=this.match(Me))?(i=e.
slice(1,e.length-1),n=new u("link"),n._destination=D("mailto:"+i),n._title="",n.
appendChild(v(i)),t.appendChild(n),!0):(e=this.match($e))?(i=e.slice(1,e.length-
1),n=new u("link"),n._destination=D(i),n._title="",n.appendChild(v(i)),t.appendChild(
n),!0):!1},ii=function(t){var e=this.match(De);if(e===null)return!1;var i=new u(
"html_inline");return i._literal=e,t.appendChild(i),!0},ni=function(t){var e=0,i,
n,r,s=this.pos,l,a,o,h,f,_,p,m;if(t===k||t===L)e++,this.pos++;else for(;this.peek()===
t;)e++,this.pos++;return e===0?null:(i=s===0?`
`:this.subject.charAt(s-1),r=this.peek(),r===-1?n=`
`:n=A(r),f=xt.test(n),_=Ct.test(n),p=xt.test(i),m=Ct.test(i),l=!f&&(!_||p||m),a=
!p&&(!m||f||_),t===P?(o=l&&(!a||m),h=a&&(!l||_)):t===k||t===L?(o=l&&!a,h=a):(o=l,
h=a),this.pos=s,{numdelims:e,can_open:o,can_close:h})},ri=function(t,e){var i=this.
scanDelims(t);if(!i)return!1;var n=i.numdelims,r=this.pos,s;this.pos+=n,t===k?s=
"\u2019":t===L?s="\u201C":s=this.subject.slice(r,this.pos);var l=v(s);return e.appendChild(
l),(i.can_open||i.can_close)&&(this.options.smart||t!==k&&t!==L)&&(this.delimiters=
{cc:t,numdelims:n,origdelims:n,node:l,previous:this.delimiters,next:null,can_open:i.
can_open,can_close:i.can_close},this.delimiters.previous!==null&&(this.delimiters.
previous.next=this.delimiters)),!0},si=function(t){t.previous!==null&&(t.previous.
next=t.next),t.next===null?this.delimiters=t.previous:t.next.previous=t.previous},
Lt=function(t,e){t.next!==e&&(t.next=e,e.previous=t)},ai=function(t){for(var e,i,
n,r,s,l,a,o,h,f,_=[],p,m=!1,b=0;b<14;b++)_[b]=t;for(i=this.delimiters;i!==null&&
i.previous!==t;)i=i.previous;for(;i!==null;){var y=i.cc;if(!i.can_close)i=i.next;else{
switch(e=i.previous,f=!1,y){case k:p=0;break;case L:p=1;break;case P:p=2+(i.can_open?
3:0)+i.origdelims%3;break;case X:p=8+(i.can_open?3:0)+i.origdelims%3;break;case V:
p=14;break}for(;e!==null&&e!==t&&e!==_[p];){if(m=(i.can_open||e.can_close)&&i.origdelims%
3!==0&&(e.origdelims+i.origdelims)%3===0,e.cc===i.cc&&e.can_open&&!m){f=!0;break}
e=e.previous}if(n=i,y===V)if(!f||i.numdelims<2||e.numdelims<2)i=i.next;else{r=e.
node,s=i.node,e.numdelims-=2,i.numdelims-=2,r._literal=r._literal.slice(0,r._literal.
length-2),s._literal=s._literal.slice(0,s._literal.length-2);for(var J=new u("st\
rikethrough"),E=r._next;E&&E!==s;){var Yt=E._next;J.appendChild(E),E=Yt}r.insertAfter(
J),Lt(e,i),e.numdelims===0&&(r.unlink(),this.removeDelimiter(e)),i.numdelims===0&&
(s.unlink(),l=i.next,this.removeDelimiter(i),i=l)}else if(y===X||y===P)if(!f)i=i.
next;else{a=i.numdelims>=2&&e.numdelims>=2?2:1,r=e.node,s=i.node,e.numdelims-=a,
i.numdelims-=a,r._literal=r._literal.slice(0,r._literal.length-a),s._literal=s._literal.
slice(0,s._literal.length-a);var tt=new u(a===1?"emph":"strong");for(o=r._next;o&&
o!==s;)h=o._next,o.unlink(),tt.appendChild(o),o=h;r.insertAfter(tt),Lt(e,i),e.numdelims===
0&&(r.unlink(),this.removeDelimiter(e)),i.numdelims===0&&(s.unlink(),l=i.next,this.
removeDelimiter(i),i=l)}else y===k?(i.node._literal="\u2019",f&&(e.node._literal=
"\u2018"),i=i.next):y===L&&(i.node._literal="\u201D",f&&(e.node.literal="\u201C"),
i=i.next);f||(_[p]=n.previous,n.can_open||this.removeDelimiter(n))}}for(;this.delimiters!==
null&&this.delimiters!==t;)this.removeDelimiter(this.delimiters)},li=function(){
var t=this.match(Pe);return t===null?null:W(t.slice(1,-1))},oi=function(){var t=this.
match(Re);if(t===null){if(this.peek()===Et)return null;for(var e=this.pos,i=0,n;(n=
this.peek())!==-1;)if(n===At&&Ot.test(this.subject.charAt(this.pos+1)))this.pos+=
1,this.peek()!==-1&&(this.pos+=1);else if(n===Tt)this.pos+=1,i+=1;else if(n===Q){
if(i<1)break;this.pos+=1,i-=1}else{if(St.exec(A(n))!==null)break;this.pos+=1}return this.
pos===e&&n!==Q||i!==0?null:(t=this.subject.slice(e,this.pos),D(W(t)))}else return D(
W(t.slice(1,-1)))},hi=function(){var t=this.match(Ge);return t===null||t.length>
1001?0:t.length},ci=function(t){var e=this.pos,i=this.match(/^\[\^[^\]]+\]/);if(i){
var n=new u("footnote_reference");return n._label=i.slice(2,-1),t.appendChild(n),
!0}this.pos+=1;var r=v("[");return t.appendChild(r),this.addBracket(r,e,!1),!0},
ui=function(t){var e=this.pos;if(this.pos+=1,this.peek()===Nt){this.pos+=1;var i=v(
"![");t.appendChild(i),this.addBracket(i,e+1,!0)}else t.appendChild(v("!"));return!0},
fi=function(t){var e,i,n,r,s=!1,l,a;if(this.pos+=1,e=this.pos,a=this.brackets,a===
null)return t.appendChild(v("]")),!0;if(!a.active)return t.appendChild(v("]")),this.
removeBracket(),!0;i=a.image;var o=this.pos;if(this.peek()===Tt&&(this.pos++,this.
spnl()&&(n=this.parseLinkDestination())!==null&&this.spnl()&&(St.test(this.subject.
charAt(this.pos-1))&&(r=this.parseLinkTitle())||!0)&&this.spnl()&&this.peek()===
Q?(this.pos+=1,s=!0):this.pos=o),!s){var h=this.pos,f=this.parseLinkLabel();if(f>
2?l=this.subject.slice(h,h+f):a.bracketAfter||(l=this.subject.slice(a.index,e)),
f===0&&(this.pos=o),l){var _=this.refmap[Bt(l)];_&&(n=_.destination,r=_.title,s=
!0)}}if(s){var p=new u(i?"image":"link");p._destination=n,p._title=r||"";var m,b;
for(m=a.node._next;m;)b=m._next,m.unlink(),p.appendChild(m),m=b;if(t.appendChild(
p),this.processEmphasis(a.previousDelimiter),this.removeBracket(),a.node.unlink(),
!i)for(a=this.brackets;a!==null;)a.image||(a.active=!1),a=a.previous;return!0}else
return this.removeBracket(),this.pos=e,t.appendChild(v("]")),!0},pi=function(t,e,i){
this.brackets!==null&&(this.brackets.bracketAfter=!0),this.brackets={node:t,previous:this.
brackets,previousDelimiter:this.delimiters,index:e,image:i,active:!0}},di=function(){
this.brackets=this.brackets.previous},vi=function(t){var e;return(e=this.match(Ue))?
(t.appendChild(v((0,bt.decodeHTMLStrict)(e))),!0):!1},_i=function(t){var e;return(e=
this.match(Xe))?(this.options.smart?t.appendChild(v(e.replace(Ie,"\u2026").replace(
He,function(i){var n=0,r=0;return i.length%3===0?r=i.length/3:i.length%2===0?n=i.
length/2:i.length%3===2?(n=1,r=(i.length-2)/3):(n=2,r=(i.length-4)/3),"\u2014".repeat(
r)+"\u2013".repeat(n)}))):t.appendChild(v(e)),!0):!1},mi=function(t){this.pos+=1;
var e=t._lastChild;if(e&&e.type==="text"&&e._literal[e._literal.length-1]===" "){
var i=e._literal[e._literal.length-2]===" ";e._literal=e._literal.replace(Ze,""),
t.appendChild(new u(i?"linebreak":"softbreak"))}else t.appendChild(new u("softbr\
eak"));return this.match(qe),!0},gi=function(t,e){this.subject=t,this.pos=0;var i,
n,r,s,l=this.pos;if(s=this.parseLinkLabel(),s===0)return 0;if(i=this.subject.slice(
0,s),this.peek()===Se)this.pos++;else return this.pos=l,0;if(this.spnl(),n=this.
parseLinkDestination(),n===null)return this.pos=l,0;var a=this.pos;this.spnl(),this.
pos!==a&&(r=this.parseLinkTitle()),r===null&&(this.pos=a);var o=!0;if(this.match(
kt)===null&&(r===null?o=!1:(r=null,this.pos=a,o=this.match(kt)!==null)),!o)return this.
pos=l,0;var h=Bt(i);return h===""?(this.pos=l,0):(e[h]||(e[h]={destination:n,title:r===
null?"":r}),this.pos-l)},Ci=function(t){var e=!1,i=this.peek();if(i===-1)return!1;
switch(i){case yt:e=this.parseNewline(t);break;case At:e=this.parseBackslash(t);
break;case Ae:e=this.parseBackticks(t);break;case X:case P:case V:e=this.handleDelim(
i,t);break;case k:case L:e=this.options.smart&&this.handleDelim(i,t);break;case Nt:
e=this.parseOpenBracket(t);break;case we:e=this.parseBang(t);break;case Te:e=this.
parseCloseBracket(t);break;case Et:e=this.parseAutolink(t)||this.parseHtmlTag(t);
break;case Oe:e=this.parseEntity(t);break;default:e=this.parseString(t);break}return e||
(this.pos+=1,t.appendChild(v(A(i)))),!0},xi=function(t){for(this.subject=t._string_content.
trim(),this.pos=0,this.delimiters=null,this.brackets=null;this.parseInline(t););
t._string_content=null,this.processEmphasis(null)};Dt=ki});var Ft={};et(Ft,{default:()=>Ji});function Yi(t){return{doc:new $t,blocks:Mt,blockStarts:Zi,
tip:this.doc,oldtip:this.doc,currentLine:"",lineNumber:0,offset:0,column:0,nextNonspace:0,
nextNonspaceColumn:0,indent:0,indented:!1,blank:!1,partiallyConsumedTab:!1,allClosed:!0,
lastMatchedContainer:this.doc,refmap:{},lastLineLength:0,inlineParser:new Dt(t),
findNextNonspace:Ki,advanceOffset:qi,advanceNextNonspace:Gi,addLine:zi,addChild:Ii,
incorporateLine:Wi,finalize:Xi,processInlines:Qi,closeUnmatchedBlocks:$i,parse:Vi,
options:t||{}}}var R,Ut,Li,jt,bi,zt,It,yi,Ni,Ei,Ai,Ti,U,wi,Ht,Oi,Si,Bi,Di,Pi,Ri,
Ui,ji,T,g,Rt,zi,Ii,Hi,Mi,$i,Fi,Mt,Zi,qi,Gi,Ki,Wi,Xi,Qi,$t,Vi,Ji,Zt=x(()=>{"use s\
trict";I();B();Pt();R=4,Ut=9,Li=10,jt=62,bi=60,zt=32,It=91,yi=[/./,/^<(?:script|pre|textarea|style)(?:\s|>|$)/i,
/^<!--/,/^<[?]/,/^<![A-Za-z]/,/^<!\[CDATA\[/,/^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|search|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i,
new RegExp("^(?:"+$+"|"+F+")\\s*$","i")],Ni=[/./,/<\/(?:script|pre|textarea|style)>/i,
/-->/,/\?>/,/>/,/\]\]>/],Ei=/^(?:\*[ \t]*){3,}$|^(?:_[ \t]*){3,}$|^(?:-[ \t]*){3,}$/,
Ai=/^\[\^([^\]]+)\]:[ \t]*/,Ti=/^\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/,
U=function(t){var e=[],i="",n,r;for(t=t.trim().replace(/^\|/,"").replace(/\|[ \t]*$/,
""),n=0;n<t.length;n++)r=t.charAt(n),r==="\\"&&t.charAt(n+1)==="|"?(i+="|",n++):
r==="|"?(e.push(i.trim()),i=""):i+=r;return e.push(i.trim()),e},wi=/^[#`~*+_=<>0-9|:[-]/,
Ht=/[^ \t\f\v\r\n]/,Oi=/^[*+-]/,Si=/^(\d{1,9})([.)])/,Bi=/^#{1,6}(?:[ \t]+|$)/,Di=
/^`{3,}(?!.*`)|^~{3,}/,Pi=/^(?:`{3,}|~{3,})(?=[ \t]*$)/,Ri=/^(?:=+|-+)[ \t]*$/,Ui=
/\r\n|\n|\r/,ji=function(t){return!Ht.test(t)},T=function(t){return t===zt||t===
Ut},g=function(t,e){return e<t.length?t.charCodeAt(e):-1},Rt=function(t){return t.
next&&t.sourcepos[1][0]!==t.next.sourcepos[0][0]-1},zi=function(){if(this.partiallyConsumedTab){
this.offset+=1;var t=4-this.column%4;this.tip._string_content+=" ".repeat(t)}this.
tip._string_content+=this.currentLine.slice(this.offset)+`
`},Ii=function(t,e){for(;!this.blocks[this.tip.type].canContain(t);)this.finalize(
this.tip,this.lineNumber-1);var i=e+1,n=new u(t,[[this.lineNumber,i],[0,0]]);return n.
_string_content="",this.tip.appendChild(n),this.tip=n,n},Hi=function(t,e){var i=t.
currentLine.slice(t.nextNonspace),n,r,s,l,a={type:null,tight:!0,bulletChar:null,
start:null,delimiter:null,padding:null,markerOffset:t.indent};if(t.indent>=4)return null;
if(n=i.match(Oi))a.type="bullet",a.bulletChar=n[0][0];else if((n=i.match(Si))&&(e.
type!=="paragraph"||n[1]==1))a.type="ordered",a.start=parseInt(n[1]),a.delimiter=
n[2];else return null;if(r=g(t.currentLine,t.nextNonspace+n[0].length),!(r===-1||
r===Ut||r===zt)||e.type==="paragraph"&&!t.currentLine.slice(t.nextNonspace+n[0].
length).match(Ht))return null;t.advanceNextNonspace(),t.advanceOffset(n[0].length,
!0),s=t.column,l=t.offset;do t.advanceOffset(1,!0),r=g(t.currentLine,t.offset);while(t.
column-s<5&&T(r));var o=g(t.currentLine,t.offset)===-1,h=t.column-s;return h>=5||
h<1||o?(a.padding=n[0].length+1,t.column=s,t.offset=l,T(g(t.currentLine,t.offset))&&
t.advanceOffset(1,!0)):a.padding=n[0].length+h,a},Mi=function(t,e){return t.type===
e.type&&t.delimiter===e.delimiter&&t.bulletChar===e.bulletChar},$i=function(){if(!this.
allClosed){for(;this.oldtip!==this.lastMatchedContainer;){var t=this.oldtip._parent;
this.finalize(this.oldtip,this.lineNumber-1),this.oldtip=t}this.allClosed=!0}},Fi=
function(t,e){for(var i,n,r=e.walker(),s=[];i=r.next();)if(n=i.node,i.entering&&
n.type==="paragraph"){for(var l,a=!1;g(n._string_content,0)===It&&(l=t.inlineParser.
parseReference(n._string_content,t.refmap));){let o=n._string_content.slice(0,l);
n._string_content=n._string_content.slice(l),a=!0;let h=o.split(`
`);n.sourcepos[0][0]+=h.length-1}a&&ji(n._string_content)&&s.push(n)}for(n of s)
n.unlink()},Mt={document:{continue:function(){return 0},finalize:function(t,e){Fi(
t,e)},canContain:function(t){return t!=="item"},acceptsLines:!1},list:{continue:function(){
return 0},finalize:function(t,e){for(var i=e._firstChild;i;){if(i._next&&Rt(i)){
e._listData.tight=!1;break}for(var n=i._firstChild;n;){if(n._next&&Rt(n)){e._listData.
tight=!1;break}n=n._next}i=i._next}e.sourcepos[1]=e._lastChild.sourcepos[1]},canContain:function(t){
return t==="item"},acceptsLines:!1},block_quote:{continue:function(t){var e=t.currentLine;
if(!t.indented&&g(e,t.nextNonspace)===jt)t.advanceNextNonspace(),t.advanceOffset(
1,!1),T(g(e,t.offset))&&t.advanceOffset(1,!0);else return 1;return 0},finalize:function(){},
canContain:function(t){return t!=="item"},acceptsLines:!1},item:{continue:function(t,e){
if(t.blank){if(e._firstChild==null)return 1;t.advanceNextNonspace()}else if(t.indent>=
e._listData.markerOffset+e._listData.padding)t.advanceOffset(e._listData.markerOffset+
e._listData.padding,!0);else return 1;return 0},finalize:function(t,e){e._lastChild?
e.sourcepos[1]=e._lastChild.sourcepos[1]:(e.sourcepos[1][0]=e.sourcepos[0][0],e.
sourcepos[1][1]=e._listData.markerOffset+e._listData.padding)},canContain:function(t){
return t!=="item"},acceptsLines:!1},heading:{continue:function(){return 1},finalize:function(){},
canContain:function(){return!1},acceptsLines:!1},thematic_break:{continue:function(){
return 1},finalize:function(){},canContain:function(){return!1},acceptsLines:!1},
code_block:{continue:function(t,e){var i=t.currentLine,n=t.indent;if(e._isFenced){
var r=n<=3&&i.charAt(t.nextNonspace)===e._fenceChar&&i.slice(t.nextNonspace).match(
Pi);if(r&&r[0].length>=e._fenceLength)return t.lastLineLength=t.offset+n+r[0].length,
t.finalize(e,t.lineNumber),2;for(var s=e._fenceOffset;s>0&&T(g(i,t.offset));)t.advanceOffset(
1,!0),s--}else if(n>=R)t.advanceOffset(R,!0);else if(t.blank)t.advanceNextNonspace();else
return 1;return 0},finalize:function(t,e){if(e._isFenced){var i=e._string_content,
n=i.indexOf(`
`),r=i.slice(0,n),s=i.slice(n+1);e.info=S(r.trim()),e._literal=s}else{for(var l=e.
_string_content.split(`
`);/^[ \t]*$/.test(l[l.length-1]);)l.pop();e._literal=l.join(`
`)+`
`,e.sourcepos[1][0]=e.sourcepos[0][0]+l.length-1,e.sourcepos[1][1]=e.sourcepos[0][1]+
l[l.length-1].length-1}e._string_content=null},canContain:function(){return!1},acceptsLines:!0},
html_block:{continue:function(t,e){return t.blank&&(e._htmlBlockType===6||e._htmlBlockType===
7)?1:0},finalize:function(t,e){e._literal=e._string_content.replace(/\n$/,""),e.
_string_content=null},canContain:function(){return!1},acceptsLines:!0},footnote_definition:{
continue:function(t){return t.blank?0:t.indent>=4?(t.advanceOffset(4,!0),0):t.tip.
type==="paragraph"?0:1},finalize:function(){},canContain:function(t){return t!==
"item"&&t!=="footnote_definition"},acceptsLines:!1},table:{continue:function(t){
return t.blank?1:0},finalize:function(t,e){var i=e._string_content.replace(/\n$/,
"").split(`
`),n=U(i[1]),r=n.map(function(f){var _=f.charAt(0)===":",p=f.charAt(f.length-1)===
":";return _&&p?"center":p?"right":_?"left":null}),s,l,a,o,h;for(s=0;s<i.length;s++)
if(s!==1){for(a=U(i[s]),o=new u("table_row"),o._isHeading=s===0,l=0;l<n.length;l++)
h=new u("table_cell"),h._align=r[l],h._string_content=a[l]===void 0?"":a[l],o.appendChild(
h);e.appendChild(o)}e._string_content=null},canContain:function(t){return t==="t\
able_row"},acceptsLines:!0},paragraph:{continue:function(t){return t.blank?1:0},
finalize:function(){},canContain:function(){return!1},acceptsLines:!0}},Zi=[function(t){
if(t.indented)return 0;var e=t.currentLine.slice(t.nextNonspace).match(Ai);if(!e)
return 0;t.closeUnmatchedBlocks(),t.advanceNextNonspace(),t.advanceOffset(e[0].length,
!1);var i=t.addChild("footnote_definition",t.nextNonspace);return i._label=e[1],
1},function(t,e){if(t.indented||e.type!=="paragraph")return 0;var i=t.currentLine.
slice(t.nextNonspace);if(i.indexOf("|")===-1||!Ti.test(i))return 0;var n=e._string_content.
replace(/\n$/,"").split(`
`),r=n[n.length-1];if(!r||r.indexOf("|")===-1||U(r).length!==U(i).length)return 0;
var s=n.slice(0,n.length-1).join(`
`);e._string_content=s===""?"":s+`
`,t.closeUnmatchedBlocks();var l=s==="",a=t.addChild("table",t.nextNonspace);return l&&
e.unlink(),a._string_content=r+`
`,2},function(t){return!t.indented&&g(t.currentLine,t.nextNonspace)===jt?(t.advanceNextNonspace(),
t.advanceOffset(1,!1),T(g(t.currentLine,t.offset))&&t.advanceOffset(1,!0),t.closeUnmatchedBlocks(),
t.addChild("block_quote",t.nextNonspace),1):0},function(t){var e;if(!t.indented&&
(e=t.currentLine.slice(t.nextNonspace).match(Bi))){t.advanceNextNonspace(),t.advanceOffset(
e[0].length,!1),t.closeUnmatchedBlocks();var i=t.addChild("heading",t.nextNonspace);
return i.level=e[0].trim().length,i._string_content=t.currentLine.slice(t.offset).
replace(/^[ \t]*#+[ \t]*$/,"").replace(/[ \t]+#+[ \t]*$/,""),t.advanceOffset(t.currentLine.
length-t.offset),2}else return 0},function(t){var e;if(!t.indented&&(e=t.currentLine.
slice(t.nextNonspace).match(Di))){var i=e[0].length;t.closeUnmatchedBlocks();var n=t.
addChild("code_block",t.nextNonspace);return n._isFenced=!0,n._fenceLength=i,n._fenceChar=
e[0][0],n._fenceOffset=t.indent,t.advanceNextNonspace(),t.advanceOffset(i,!1),2}else
return 0},function(t,e){if(!t.indented&&g(t.currentLine,t.nextNonspace)===bi){var i=t.
currentLine.slice(t.nextNonspace),n;for(n=1;n<=7;n++)if(yi[n].test(i)&&(n<7||e.type!==
"paragraph"&&!(!t.allClosed&&!t.blank&&t.tip.type==="paragraph"))){t.closeUnmatchedBlocks();
var r=t.addChild("html_block",t.offset);return r._htmlBlockType=n,2}}return 0},function(t,e){
var i;if(!t.indented&&e.type==="paragraph"&&(i=t.currentLine.slice(t.nextNonspace).
match(Ri))){t.closeUnmatchedBlocks();for(var n;g(e._string_content,0)===It&&(n=t.
inlineParser.parseReference(e._string_content,t.refmap));)e._string_content=e._string_content.
slice(n);if(e._string_content.length>0){var r=new u("heading",e.sourcepos);return r.
level=i[0][0]==="="?1:2,r._string_content=e._string_content,e.insertAfter(r),e.unlink(),
t.tip=r,t.advanceOffset(t.currentLine.length-t.offset,!1),2}else return 0}else return 0},
function(t){return!t.indented&&Ei.test(t.currentLine.slice(t.nextNonspace))?(t.closeUnmatchedBlocks(),
t.addChild("thematic_break",t.nextNonspace),t.advanceOffset(t.currentLine.length-
t.offset,!1),2):0},function(t,e){var i;return(!t.indented||e.type==="list")&&(i=
Hi(t,e))?(t.closeUnmatchedBlocks(),(t.tip.type!=="list"||!Mi(e._listData,i))&&(e=
t.addChild("list",t.nextNonspace),e._listData=i),e=t.addChild("item",t.nextNonspace),
e._listData=i,1):0},function(t){return t.indented&&t.tip.type!=="paragraph"&&!t.
blank?(t.advanceOffset(R,!0),t.closeUnmatchedBlocks(),t.addChild("code_block",t.
offset),2):0}],qi=function(t,e){for(var i=this.currentLine,n,r,s;t>0&&(s=i[this.
offset]);)s==="	"?(n=4-this.column%4,e?(this.partiallyConsumedTab=n>t,r=n>t?t:n,
this.column+=r,this.offset+=this.partiallyConsumedTab?0:1,t-=r):(this.partiallyConsumedTab=
!1,this.column+=n,this.offset+=1,t-=1)):(this.partiallyConsumedTab=!1,this.offset+=
1,this.column+=1,t-=1)},Gi=function(){this.offset=this.nextNonspace,this.column=
this.nextNonspaceColumn,this.partiallyConsumedTab=!1},Ki=function(){for(var t=this.
currentLine,e=this.offset,i=this.column,n;(n=t.charAt(e))!=="";)if(n===" ")e++,i++;else if(n===
"	")e++,i+=4-i%4;else break;this.blank=n===`
`||n==="\r"||n==="",this.nextNonspace=e,this.nextNonspaceColumn=i,this.indent=this.
nextNonspaceColumn-this.column,this.indented=this.indent>=R},Wi=function(t){var e=!0,
i,n=this.doc;this.oldtip=this.tip,this.offset=0,this.column=0,this.blank=!1,this.
partiallyConsumedTab=!1,this.lineNumber+=1,t.indexOf("\0")!==-1&&(t=t.replace(/\0/g,
"\uFFFD")),this.currentLine=t;for(var r;(r=n._lastChild)&&r._open;){switch(n=r,this.
findNextNonspace(),this.blocks[n.type].continue(this,n)){case 0:break;case 1:e=!1;
break;case 2:return;default:throw"continue returned illegal value, must be 0, 1,\
 or 2"}if(!e){n=n._parent;break}}this.allClosed=n===this.oldtip,this.lastMatchedContainer=
n;for(var s=n.type!=="paragraph"&&n.type!=="table"&&Mt[n.type].acceptsLines,l=this.
blockStarts,a=l.length;!s;){if(this.findNextNonspace(),!this.indented&&!wi.test(
t.slice(this.nextNonspace))){this.advanceNextNonspace();break}for(var o=0;o<a;){
var h=l[o](this,n);if(h===1){n=this.tip;break}else if(h===2){n=this.tip,s=!0;break}else
o++}if(o===a){this.advanceNextNonspace();break}}!this.allClosed&&!this.blank&&this.
tip.type==="paragraph"?this.addLine():(this.closeUnmatchedBlocks(),i=n.type,this.
blocks[i].acceptsLines?(this.addLine(),i==="html_block"&&n._htmlBlockType>=1&&n.
_htmlBlockType<=5&&Ni[n._htmlBlockType].test(this.currentLine.slice(this.offset))&&
(this.lastLineLength=t.length,this.finalize(n,this.lineNumber))):this.offset<t.length&&
!this.blank&&(n=this.addChild("paragraph",this.offset),this.advanceNextNonspace(),
this.addLine())),this.lastLineLength=t.length},Xi=function(t,e){var i=t._parent;
t._open=!1,t.sourcepos[1]=[e,this.lastLineLength],this.blocks[t.type].finalize(this,
t),this.tip=i},Qi=function(t){var e,i,n,r=t.walker();for(this.inlineParser.refmap=
this.refmap,this.inlineParser.options=this.options;i=r.next();)e=i.node,n=e.type,
!i.entering&&(n==="paragraph"||n==="heading"||n==="table_cell")&&this.inlineParser.
parse(e)},$t=function(){var t=new u("document",[[1,1],[0,0]]);return t},Vi=function(t){
this.doc=new $t,this.tip=this.doc,this.refmap={},this.lineNumber=0,this.lastLineLength=
0,this.offset=0,this.column=0,this.lastMatchedContainer=this.doc,this.currentLine=
"",this.options.time&&console.time("preparing input");var e=t.split(Ui),i=e.length;
t.charCodeAt(t.length-1)===Li&&(i-=1),this.options.time&&console.timeEnd("prepar\
ing input"),this.options.time&&console.time("block parsing");for(var n=0;n<i;n++)
this.incorporateLine(e[n]);for(;this.tip;)this.finalize(this.tip,i);return this.
options.time&&console.timeEnd("block parsing"),this.options.time&&console.time("\
inline parsing"),this.processInlines(this.doc),this.options.time&&console.timeEnd(
"inline parsing"),this.doc};Ji=Yi});function N(){}function tn(t){var e=t.walker(),i,n;for(this.buffer="",this.lastOut=
`
`;i=e.next();)n=i.node.type,this[n]&&this[n](i.node,i.entering);return this.buffer}
function en(t){this.buffer+=t,this.lastOut=t}function nn(){this.lastOut!==`
`&&this.lit(`
`)}function rn(t){this.lit(t)}function sn(t){return t}var qt,Gt=x(()=>{"use stri\
ct";N.prototype.render=tn;N.prototype.out=rn;N.prototype.lit=en;N.prototype.cr=nn;
N.prototype.esc=sn;qt=N});var Wt={};et(Wt,{default:()=>On});function on(t,e,i){if(!(this.disableTags>0)){if(this.
buffer+="<"+t,e&&e.length>0)for(var n=0,r;(r=e[n])!==void 0;)this.buffer+=" "+r[0]+
'="'+r[1]+'"',n++;i&&(this.buffer+=" /"),this.buffer+=">",this.lastOut=">"}}function c(t){
t=t||{},t.softbreak=t.softbreak||`
`,this.esc=t.esc||q,this.disableTags=0,this.lastOut=`
`,this.options=t}function hn(t){this.out(t.literal)}function cn(){this.lit(this.
options.softbreak)}function un(){this.tag("br",[],!0),this.cr()}function fn(t,e){
var i=this.attrs(t);e?(this.options.safe&&Kt(t.destination)||i.push(["href",this.
esc(t.destination)]),t.title&&i.push(["title",this.esc(t.title)]),this.tag("a",i)):
this.tag("/a")}function pn(t,e){e?(this.disableTags===0&&(this.options.safe&&Kt(
t.destination)?this.lit('<img src="" alt="'):this.lit('<img src="'+this.esc(t.destination)+
'" alt="')),this.disableTags+=1):(this.disableTags-=1,this.disableTags===0&&(t.title&&
this.lit('" title="'+this.esc(t.title)),this.lit('" />')))}function dn(t,e){this.
tag(e?"em":"/em")}function vn(t,e){this.tag(e?"strong":"/strong")}function _n(t,e){
var i=t.parent.parent,n=this.attrs(t);i!==null&&i.type==="list"&&i.listTight||(e?
(this.cr(),this.tag("p",n)):(this.tag("/p"),this.cr()))}function mn(t,e){var i="\
h"+t.level,n=this.attrs(t);e?(this.cr(),this.tag(i,n)):(this.tag("/"+i),this.cr())}
function gn(t){this.tag("code"),this.out(t.literal),this.tag("/code")}function Cn(t){
var e=t.info?t.info.split(/\s+/):[],i=this.attrs(t);if(e.length>0&&e[0].length>0){
var n=this.esc(e[0]);/^language-/.exec(n)||(n="language-"+n),i.push(["class",n])}
this.cr(),this.tag("pre"),this.tag("code",i),this.out(t.literal),this.tag("/code"),
this.tag("/pre"),this.cr()}function xn(t){var e=this.attrs(t);this.cr(),this.tag(
"hr",e,!0),this.cr()}function kn(t,e){var i=this.attrs(t);e?(this.cr(),this.tag(
"blockquote",i),this.cr()):(this.cr(),this.tag("/blockquote"),this.cr())}function Ln(t,e){
var i=t.listType==="bullet"?"ul":"ol",n=this.attrs(t);if(e){var r=t.listStart;r!==
null&&r!==1&&n.push(["start",r.toString()]),this.cr(),this.tag(i,n),this.cr()}else
this.cr(),this.tag("/"+i),this.cr()}function bn(t,e){var i=this.attrs(t);e?this.
tag("li",i):(this.tag("/li"),this.cr())}function yn(t){this.options.safe?this.lit(
"<!-- raw HTML omitted -->"):this.lit(t.literal)}function Nn(t){this.cr(),this.options.
safe?this.lit("<!-- raw HTML omitted -->"):this.lit(t.literal),this.cr()}function En(t,e){
e&&t.onEnter?this.lit(t.onEnter):!e&&t.onExit&&this.lit(t.onExit)}function An(t,e){
this.cr(),e&&t.onEnter?this.lit(t.onEnter):!e&&t.onExit&&this.lit(t.onExit),this.
cr()}function Tn(t){this.lit(this.esc(t))}function wn(t){var e=[];if(this.options.
sourcepos){var i=t.sourcepos;i&&e.push(["data-sourcepos",String(i[0][0])+":"+String(
i[0][1])+"-"+String(i[1][0])+":"+String(i[1][1])])}return e}var an,ln,Kt,On,Xt=x(
()=>{"use strict";B();Gt();an=/^javascript:|vbscript:|file:|data:/i,ln=/^data:image\/(?:png|gif|jpeg|webp)/i,
Kt=function(t){return an.test(t)&&!ln.test(t)};c.prototype=Object.create(qt.prototype);
c.prototype.text=hn;c.prototype.html_inline=yn;c.prototype.html_block=Nn;c.prototype.
softbreak=cn;c.prototype.linebreak=un;c.prototype.link=fn;c.prototype.image=pn;c.
prototype.emph=dn;c.prototype.strong=vn;c.prototype.paragraph=_n;c.prototype.heading=
mn;c.prototype.code=gn;c.prototype.code_block=Cn;c.prototype.thematic_break=xn;c.
prototype.block_quote=kn;c.prototype.list=Ln;c.prototype.item=bn;c.prototype.custom_inline=
En;c.prototype.custom_block=An;c.prototype.esc=q;c.prototype.out=Tn;c.prototype.
tag=on;c.prototype.attrs=wn;On=c});var Sn=j((Gn,Vt)=>{var Y=(Zt(),nt(Ft)),Qt=(Xt(),nt(Wt));Vt.exports={Parser:Y.Parser||
Y.default||Y,HtmlRenderer:Qt.default||Qt}});return Sn();})();
/*! Bundled license information:

commonmark/lib/from-code-point.js:
  (*! http://mths.be/fromcodepoint v0.2.1 by @mathias *)
*/
