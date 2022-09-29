import{n as E,_ as N}from"./index.b788ddfc.js";const $={methods:{deepCopy(r,t=[]){if(r===null||typeof r!="object")return r;const e=Object.prototype.toString.call(r).slice(8,-1);if(e==="RegExp")return new RegExp(r);if(e==="Date")return new Date(r);if(e==="Error")return new Error(r);const n=t.filter(o=>o.original===r)[0];if(n)return n.copy;const i=Array.isArray(r)?[]:{};return t.push({original:r,copy:i}),Object.keys(r).forEach(o=>{i[o]=this.deepCopy(r[o],t)}),i},getUuid(r="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"){let t=[];for(let n=0;n<36;n++)t[n]=r.substr(Math.floor(Math.random()*16),1);return t[14]="4",t[19]=r.substr(t[19]&3|8,1),t[8]=t[13]=t[18]=t[23]="",t.join("")},isBlank(r){return r==null||r===""},findParentComponent(r,t){let e=r.$parent;for(;e;)if((e.$options.componentName||e.$options.name)!==t)e=e.$parent;else return e;return!1}}};const Je={name:"DesignerAside",mixins:[$],data(){return{menuList:[{name:"\u7EC4\u4EF6",code:"component",icon:"ri-pencil-ruler-2-line",component:()=>N(()=>import("./PageComponent.4dca4d48.js"),["assets/PageComponent.4dca4d48.js","assets/PageComponent.5b92461c.css","assets/index.b788ddfc.js","assets/index.830985ad.css"])},{name:"\u533A\u5757",code:"blocks",icon:"ri-layout-5-line",component:()=>N(()=>import("./PageBlock.168eafd3.js"),["assets/PageBlock.168eafd3.js","assets/PageBlock.1eb29ec9.css","assets/index.b788ddfc.js","assets/index.830985ad.css"])},{name:"\u9875\u9762",code:"page",icon:"ri-stack-line",component:()=>N(()=>import("./PageSetting.5dae411c.js"),["assets/PageSetting.5dae411c.js","assets/PageSetting.dc142315.css","assets/index.b788ddfc.js","assets/index.830985ad.css"])},{name:"\u5927\u7EB2",code:"toc",icon:"ri-pages-line",component:()=>N(()=>import("./PageToc.5d16b8b3.js"),["assets/PageToc.5d16b8b3.js","assets/PageToc.d327ddf4.css","assets/index.b788ddfc.js","assets/index.830985ad.css"])},{name:"\u5DE5\u5177",code:"tools",icon:"ri-magic-line",component:()=>N(()=>import("./PageTools.6c209cf4.js"),["assets/PageTools.6c209cf4.js","assets/PageTools.101a22b6.css","assets/index.b788ddfc.js","assets/index.830985ad.css"])},{name:"\u5168\u5C40",code:"setting",icon:"ri-sound-module-line",component:()=>N(()=>import("./GlobalSetting.37e75e02.js"),["assets/GlobalSetting.37e75e02.js","assets/GlobalSetting.b30e4e39.css","assets/index.b788ddfc.js","assets/index.830985ad.css"])}],curActiveComponent:null,curActiveComponentCode:""}},methods:{onMenuSelect(r){this.curActiveComponent=this.menuList[r].component,this.curActiveComponentCode=this.menuList[r].code}},mounted(){this.$message({message:"\u6B22\u8FCE\uFF01\u672C\u7CFB\u7EDF\u7531ROYIANS\u8BBE\u8BA1",type:"success",duration:3e3}),this.curActiveComponent=this.menuList[0].component,this.curActiveComponentCode=this.menuList[0].code}};var Ze=function(){var t=this,e=t._self._c;return e("section",{staticClass:"roy-designer-aside__main"},[e("el-menu",{staticClass:"roy-designer-aside__menu",attrs:{collapse:!0,"default-active":"0"},on:{select:t.onMenuSelect}},t._l(t.menuList,function(n,i){return e("el-menu-item",{key:n.code,attrs:{index:`${i}`}},[e("div",{staticClass:"roy-designer-aside__menu__icon"},[e("i",{class:n.icon}),e("span",[t._v(t._s(n.name))])])])}),1),e("keep-alive",[e(t.curActiveComponent,{key:t.curActiveComponentCode,tag:"component",staticClass:"roy-designer-aside__right_panel"})],1)],1)},qe=[],Qe=E(Je,Ze,qe,!1,null,null,null,null);const Ye=Qe.exports;const Xe={name:"ToolBar",mixins:[$],components:{},props:{},data(){return{toolbarLeftConfig:[{name:"\u64A4\u9500",icon:"ri-arrow-go-back-fill",event:()=>{alert("\u64A4\u9500")}},{name:"\u6062\u590D",icon:"ri-arrow-go-forward-fill",event:()=>{}}],toolbarRightConfig:[{name:"\u9884\u89C8",icon:"ri-eye-2-fill",event:()=>{}},{name:"\u4FDD\u5B58",icon:"ri-save-2-fill",event:()=>{}}]}},methods:{initMounted(){}},created(){},mounted(){this.initMounted()},watch:{}};var et=function(){var t=this,e=t._self._c;return e("el-header",{staticClass:"roy-designer-main__toolbar",attrs:{height:"45px"}},[e("section",{staticClass:"roy-designer-main__toolbar_left"},t._l(t.toolbarLeftConfig,function(n,i){return e("el-tooltip",{key:i,attrs:{content:n.name,"open-delay":600,"visible-arrow":!1,effect:"dark",placement:"bottom"}},[e("div",{staticClass:"roy-designer-main__toolbar__item",on:{click:n.event}},[e("i",{class:n.icon})])])}),1),e("section",{staticClass:"roy-designer-main__toolbar_right"},t._l(t.toolbarRightConfig,function(n,i){return e("el-tooltip",{key:i,attrs:{content:n.name,"open-delay":600,"visible-arrow":!1,effect:"dark",placement:"bottom"}},[e("div",{staticClass:"roy-designer-main__toolbar__item",on:{click:n.event}},[e("i",{class:n.icon})])])}),1)])},tt=[],nt=E(Xe,et,tt,!1,null,null,null,null);const rt=nt.exports;function pe(r,t){return function(e){e&&(r[t]=e)}}function it(r,t){return function(e){var n=e.prototype;r.forEach(function(i){t(n,i)})}}var ot=function(){function r(){this.keys=[],this.values=[]}var t=r.prototype;return t.get=function(e){return this.values[this.keys.indexOf(e)]},t.set=function(e,n){var i=this.keys,o=this.values,s=i.indexOf(e),a=s===-1?i.length:s;i[a]=e,o[a]=n},r}(),at=function(){function r(){this.object={}}var t=r.prototype;return t.get=function(e){return this.object[e]},t.set=function(e,n){this.object[e]=n},r}(),st=typeof Map=="function",ut=function(){function r(){}var t=r.prototype;return t.connect=function(e,n){this.prev=e,this.next=n,e&&(e.next=this),n&&(n.prev=this)},t.disconnect=function(){var e=this.prev,n=this.next;e&&(e.next=n),n&&(n.prev=e)},t.getIndex=function(){for(var e=this,n=-1;e;)e=e.prev,++n;return n},r}();function ct(r,t){var e=[],n=[];return r.forEach(function(i){var o=i[0],s=i[1],a=new ut;e[o]=a,n[s]=a}),e.forEach(function(i,o){i.connect(e[o-1])}),r.filter(function(i,o){return!t[o]}).map(function(i,o){var s=i[0],a=i[1];if(s===a)return[0,0];var u=e[s],c=n[a-1],f=u.getIndex();u.disconnect(),c?u.connect(c,c.next):u.connect(void 0,e[0]);var d=u.getIndex();return[f,d]})}var lt=function(){function r(e,n,i,o,s,a,u,c){this.prevList=e,this.list=n,this.added=i,this.removed=o,this.changed=s,this.maintained=a,this.changedBeforeAdded=u,this.fixed=c}var t=r.prototype;return Object.defineProperty(t,"ordered",{get:function(){return this.cacheOrdered||this.caculateOrdered(),this.cacheOrdered},enumerable:!0,configurable:!0}),Object.defineProperty(t,"pureChanged",{get:function(){return this.cachePureChanged||this.caculateOrdered(),this.cachePureChanged},enumerable:!0,configurable:!0}),t.caculateOrdered=function(){var e=ct(this.changedBeforeAdded,this.fixed),n=this.changed,i=[];this.cacheOrdered=e.filter(function(o,s){var a=o[0],u=o[1],c=n[s],f=c[0],d=c[1];if(a!==u)return i.push([f,d]),!0}),this.cachePureChanged=i},r}();function Le(r,t,e){var n=st?Map:e?at:ot,i=e||function(_){return _},o=[],s=[],a=[],u=r.map(i),c=t.map(i),f=new n,d=new n,p=[],y=[],b={},k=[],O=0,C=0;return u.forEach(function(_,h){f.set(_,h)}),c.forEach(function(_,h){d.set(_,h)}),u.forEach(function(_,h){var v=d.get(_);typeof v>"u"?(++C,s.push(h)):b[v]=C}),c.forEach(function(_,h){var v=f.get(_);typeof v>"u"?(o.push(h),++O):(a.push([v,h]),C=b[h]||0,p.push([v-C,h-O]),y.push(h===v),v!==h&&k.push([v,h]))}),s.reverse(),new lt(r,t,o,s,k,a,p,y)}var ft="function",dt="object",vt="string",ht="number",pt="undefined",Z={cm:function(r){return r*96/2.54},mm:function(r){return r*96/254},in:function(r){return r*96},pt:function(r){return r*96/72},pc:function(r){return r*96/6},"%":function(r,t){return r*t/100},vw:function(r,t){return t===void 0&&(t=window.innerWidth),r/100*t},vh:function(r,t){return t===void 0&&(t=window.innerHeight),r/100*t},vmax:function(r,t){return t===void 0&&(t=Math.max(window.innerWidth,window.innerHeight)),r/100*t},vmin:function(r,t){return t===void 0&&(t=Math.min(window.innerWidth,window.innerHeight)),r/100*t}};function _t(r){return typeof r===pt}function mt(r){return r&&typeof r===dt}function yt(r){return Array.isArray(r)}function j(r){return typeof r===vt}function gt(r){return typeof r===ht}function bt(r){return typeof r===ft}function Ct(r){var t=/^([^\d|e|\-|\+]*)((?:\d|\.|-|e-|e\+)+)(\S*)$/g.exec(r);if(!t)return{prefix:"",unit:"",value:NaN};var e=t[1],n=t[2],i=t[3];return{prefix:e,unit:i,value:parseFloat(n)}}function ue(r,t){return t===void 0&&(t="-"),r.replace(/([a-z])([A-Z])/g,function(e,n,i){return""+n+t+i.toLowerCase()})}function ce(r,t){var e=Ct(r),n=e.value,i=e.unit;if(mt(t)){var o=t[i];if(o){if(bt(o))return o(n);if(Z[i])return Z[i](n,o)}}else if(i==="%")return n*t/100;return Z[i]?Z[i](n):n}/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */var fe=function(r,t){return fe=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,n){e.__proto__=n}||function(e,n){for(var i in n)n.hasOwnProperty(i)&&(e[i]=n[i])},fe(r,t)};function S(r,t){fe(r,t);function e(){this.constructor=r}r.prototype=t===null?Object.create(t):(e.prototype=t.prototype,new e)}var P=function(){return P=Object.assign||function(t){for(var e,n=1,i=arguments.length;n<i;n++){e=arguments[n];for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])}return t},P.apply(this,arguments)};function Te(r,t){var e={};for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&t.indexOf(n)<0&&(e[n]=r[n]);if(r!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,n=Object.getOwnPropertySymbols(r);i<n.length;i++)t.indexOf(n[i])<0&&Object.prototype.propertyIsEnumerable.call(r,n[i])&&(e[n[i]]=r[n[i]]);return e}function xt(){for(var r=0,t=0,e=arguments.length;t<e;t++)r+=arguments[t].length;for(var n=Array(r),i=0,t=0;t<e;t++)for(var o=arguments[t],s=0,a=o.length;s<a;s++,i++)n[i]=o[s];return n}function de(r,t){if(r===t)return!1;for(var e in r)if(!(e in t))return!0;for(var e in t)if(r[e]!==t[e])return!0;return!1}function _e(r,t){var e=Object.keys(r),n=Object.keys(t),i=Le(e,n,function(u){return u}),o={},s={},a={};return i.added.forEach(function(u){var c=n[u];o[c]=t[c]}),i.removed.forEach(function(u){var c=e[u];s[c]=r[c]}),i.maintained.forEach(function(u){var c=u[0],f=e[c],d=[r[f],t[f]];r[f]!==t[f]&&(a[f]=d)}),{added:o,removed:s,changed:a}}function Ne(r){r.forEach(function(t){t()})}function $e(r){var t=0;return r.map(function(e){return e==null?"$compat"+ ++t:""+e})}function Se(r,t,e,n){if(j(r)||gt(r))return new Ot("text_"+r,t,e,n,null,{});var i=typeof r.type=="string"?Rt:r.type.prototype.render?St:$t;return new i(r.type,t,e,n,r.ref,r.props)}function De(r){var t=[];return r.forEach(function(e){t=t.concat(yt(e)?De(e):e)}),t}function ke(r){var t=r.className,e=Te(r,["className"]);return t!=null&&(e.class=t),delete e.style,delete e.children,e}function le(r,t){if(!t)return r;for(var e in t)_t(r[e])&&(r[e]=t[e]);return r}function Y(r,t){for(var e=[],n=2;n<arguments.length;n++)e[n-2]=arguments[n];var i=t||{},o=i.key,s=i.ref,a=Te(i,["key","ref"]);return{type:r,key:o,ref:s,props:P(P({},a),{children:De(e).filter(function(u){return u!=null&&u!==!1})})}}var H=function(){function r(e,n,i,o,s,a){a===void 0&&(a={}),this.type=e,this.key=n,this.index=i,this.container=o,this.ref=s,this.props=a,this._providers=[]}var t=r.prototype;return t._should=function(e,n){return!0},t._update=function(e,n,i,o){if(this.base&&!j(n)&&!o&&!this._should(n.props,i))return!1;this.original=n,this._setState(i);var s=this.props;return j(n)||(this.props=n.props,this.ref=n.ref),this._render(e,this.base?s:{},i),!0},t._mounted=function(){var e=this.ref;e&&e(this.base)},t._setState=function(e){},t._updated=function(){var e=this.ref;e&&e(this.base)},t._destroy=function(){var e=this.ref;e&&e(null)},r}();function wt(r,t,e){var n=_e(r,t),i=n.added,o=n.removed,s=n.changed;for(var a in i)e.setAttribute(a,i[a]);for(var a in s)e.setAttribute(a,s[a][1]);for(var a in o)e.removeAttribute(a)}function Pt(r,t,e){var n=_e(r,t),i=n.added,o=n.removed,s=n.changed;for(var a in o)e.removeEventListener(a);for(var a in i)e.addEventListener(a,i[a]);for(var a in s)e.removeEventListener(a),e.addEventListener(a,s[a][1]);for(var a in o)e.removeEventListener(a)}function Et(r,t,e){var n=e.style,i=_e(r,t),o=i.added,s=i.removed,a=i.changed;for(var u in o){var c=ue(u,"-");n.setProperty?n.setProperty(c,o[u]):n[c]=o[u]}for(var u in a){var c=ue(u,"-");n.setProperty?n.setProperty(c,a[u][1]):n[c]=a[u][1]}for(var u in s){var c=ue(u,"-");n.removeProperty?n.removeProperty(c):n[c]=""}}function Me(r){var t={},e={};for(var n in r)n.indexOf("on")===0?e[n.replace("on","").toLowerCase()]=r[n]:t[n]=r[n];return{attributes:t,events:e}}var Ot=function(r){S(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}var e=t.prototype;return e._render=function(n){var i=this,o=!this.base;return o&&(this.base=document.createTextNode(this.type.replace("text_",""))),n.push(function(){o?i._mounted():i._updated()}),!0},e._unmount=function(){this.base.parentNode.removeChild(this.base)},t}(H),Rt=function(r){S(t,r);function t(){var n=r!==null&&r.apply(this,arguments)||this;return n.events={},n._isSVG=!1,n}var e=t.prototype;return e.addEventListener=function(n,i){var o=this.events;o[n]=function(s){s.nativeEvent=s,i(s)},this.base.addEventListener(n,o[n])},e.removeEventListener=function(n){var i=this.events;this.base.removeEventListener(n,i[n]),delete i[n]},e._should=function(n){return de(this.props,n)},e._render=function(n,i){var o=this,s=!this.base;if(s){var a=this._hasSVG();this._isSVG=a;var u=this.props.portalContainer;if(!u){var c=this.type;a?u=document.createElementNS("http://www.w3.org/2000/svg",c):u=document.createElement(c)}this.base=u}F(this,this._providers,this.props.children,n,null);var f=this.base,d=Me(i),p=d.attributes,y=d.events,b=Me(this.props),k=b.attributes,O=b.events;return wt(ke(p),ke(k),f),Pt(y,O,this),Et(i.style||{},this.props.style||{},f),n.push(function(){s?o._mounted():o._updated()}),!0},e._unmount=function(){var n=this.events,i=this.base;for(var o in n)i.removeEventListener(o,n[o]);this._providers.forEach(function(s){s._unmount()}),this.events={},this.props.portalContainer||i.parentNode.removeChild(i)},e._hasSVG=function(){if(this._isSVG||this.type==="svg")return!0;var n=me(this.container);return n&&"ownerSVGElement"in n},t}(H);function me(r){if(!r)return null;var t=r.base;return t instanceof Node?t:me(r.container)}function U(r){if(!r)return null;if(r instanceof Node)return r;var t=r.$_provider._providers;return t.length?U(t[0].base):null}var $t=function(r){S(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}var e=t.prototype;return e._render=function(n){var i=this.type(this.props);return F(this,this._providers,i?[i]:[],n),!0},e._unmount=function(){this._providers.forEach(function(n){n._unmount()})},t}(H),Be=function(r){S(t,r);function t(n){var i=r.call(this,"container","container",0,null)||this;return i.base=n,i}var e=t.prototype;return e._render=function(){return!0},e._unmount=function(){},t}(H),St=function(r){S(t,r);function t(n,i,o,s,a,u){return u===void 0&&(u={}),r.call(this,n,i,o,s,a,le(u,n.defaultProps))||this}var e=t.prototype;return e._should=function(n,i){return this.base.shouldComponentUpdate(le(n,this.type.defaultProps),i||this.base.state)},e._render=function(n,i){var o=this;this.props=le(this.props,this.type.defaultProps);var s=!this.base;s?(this.base=new this.type(this.props),this.base.$_provider=this):this.base.props=this.props;var a=this.base,u=a.state,c=a.render();c&&c.props&&!c.props.children.length&&(c.props.children=this.props.children),F(this,this._providers,c?[c]:[],n),n.push(function(){s?(o._mounted(),a.componentDidMount()):(o._updated(),a.componentDidUpdate(i,u))})},e._setState=function(n){var i=this.base;!i||!n||(i.state=n)},e._unmount=function(){this._providers.forEach(function(n){n._unmount()}),clearTimeout(this.base.$_timer),this.base.componentWillUnmount()},t}(H),Ie=function(){function r(e){e===void 0&&(e={}),this.props=e,this.state={},this.$_timer=0,this.$_state={}}var t=r.prototype;return t.shouldComponentUpdate=function(e,n){return!0},t.render=function(){return null},t.setState=function(e,n,i){var o=this;this.$_timer||(this.$_state={}),clearTimeout(this.$_timer),this.$_timer=0,this.$_state=P(P({},this.$_state),e),i?this.$_setState(n,i):this.$_timer=setTimeout(function(){o.$_timer=0,o.$_setState(n,i)})},t.forceUpdate=function(e){this.setState({},e,!0)},t.componentDidMount=function(){},t.componentDidUpdate=function(e,n){},t.componentWillUnmount=function(){},t.$_setState=function(e,n){var i=[],o=this.$_provider,s=F(o.container,[o],[o.original],i,P(P({},this.state),this.$_state),n);s&&(e&&i.push(e),Ne(i))},r}(),ze=function(r){S(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}var e=t.prototype;return e.shouldComponentUpdate=function(n,i){return de(this.props,n)||de(this.state,i)},t}(Ie),kt=function(r){S(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}var e=t.prototype;return e.componentDidMount=function(){var n=this.props,i=n.element,o=n.container;this._portalProvider=new Be(o),q(i,o,this._portalProvider)},e.componentDidUpdate=function(){var n=this.props,i=n.element,o=n.container;q(i,o,this._portalProvider)},e.componentWillUnmount=function(){var n=this.props.container;q(null,n,this._portalProvider),this._portalProvider=null},t}(ze);function Mt(r,t,e){var n=[];F(r,r._providers,t,n,e),Ne(n)}function At(r,t){for(var e=r._providers,n=e.length,i=t.index+1;i<n;++i){var o=U(e[i].base);if(o)return o}return null}function Lt(r,t,e){var n=e.map(function(u){return j(u)?null:u.key}),i=$e(t.map(function(u){return u.key})),o=$e(n),s=Le(i,o,function(u){return u});s.removed.forEach(function(u){t.splice(u,1)[0]._unmount()}),s.ordered.forEach(function(u){var c=u[0],f=u[1],d=t.splice(c,1)[0];t.splice(f,0,d);var p=U(d.base),y=U(t[f+1]&&t[f+1].base);p&&p.parentNode.insertBefore(p,y)}),s.added.forEach(function(u){t.splice(u,0,Se(e[u],n[u],u,r))});var a=s.maintained.filter(function(u){u[0];var c=u[1],f=e[c],d=t[c],p=j(f)?"text_"+f:f.type;return p!==d.type?(d._unmount(),t.splice(c,1,Se(f,n[c],c,r)),!0):(d.index=c,!1)});return xt(s.added,a.map(function(u){u[0];var c=u[1];return c}))}function F(r,t,e,n,i,o){var s=Lt(r,t,e),a=t.filter(function(c,f){return c._update(n,e[f],i,o)}),u=me(r);return u&&s.reverse().forEach(function(c){var f=t[c],d=U(f.base);if(!!d&&u!==d&&!d.parentNode){var p=At(r,f);u.insertBefore(d,p)}}),a.length>0}function q(r,t,e){e===void 0&&(e=t.__REACT_COMPAT__);var n=!!e;return e||(e=new Be(t)),Mt(e,r?[r]:[]),n||(t.__REACT_COMPAT__=e),e}function Ae(r,t,e){var n=t.__REACT_COMPAT__;r&&!n&&(t.innerHTML=""),q(r,t,n),e&&e()}function Tt(r,t){return Y(kt,{element:r,container:t})}/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */var ve=function(r,t){return ve=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,n){e.__proto__=n}||function(e,n){for(var i in n)n.hasOwnProperty(i)&&(e[i]=n[i])},ve(r,t)};function Nt(r,t){ve(r,t);function e(){this.constructor=r}r.prototype=t===null?Object.create(t):(e.prototype=t.prototype,new e)}var Dt=function(r){Nt(t,r);function t(){var n=r!==null&&r.apply(this,arguments)||this;return n.state={scrollPos:0},n.width=0,n.height=0,n}var e=t.prototype;return e.render=function(){return Y("canvas",{ref:pe(this,"canvasElement"),style:this.props.style})},e.componentDidMount=function(){var n=this.canvasElement,i=n.getContext("2d");this.canvasContext=i,this.resize()},e.componentDidUpdate=function(){this.resize()},e.scroll=function(n){this.draw(n)},e.resize=function(){var n=this.canvasElement,i=this.props,o=i.width,s=i.height,a=i.scrollPos;this.width=o||n.offsetWidth,this.height=s||n.offsetHeight,n.width=this.width*2,n.height=this.height*2,this.draw(a)},e.draw=function(n){n===void 0&&(n=this.state.scrollPos);var i=this.props,o=i,s=o.unit,a=o.zoom,u=o.type,c=o.backgroundColor,f=o.lineColor,d=o.textColor,p=o.textBackgroundColor,y=o.direction,b=o.negativeRuler,k=b===void 0?!0:b,O=o.segment,C=O===void 0?10:O,_=o.textFormat,h=o.range,v=h===void 0?[-1/0,1/0]:h,ye=o.rangeBackgroundColor,D=this.width,B=this.height,Ue=this.state;Ue.scrollPos=n;var l=this.canvasContext,g=u==="horizontal",ge=k!==!1,He=i.font||"10px sans-serif",X=i.textAlign||"left",M=i.textOffset||[0,0],ee=g?B:D,te=ce(""+(i.mainLineSize||"100%"),ee),Fe=ce(""+(i.longLineSize||10),ee),Ve=ce(""+(i.shortLineSize||7),ee),x=i.lineOffset||[0,0];switch(c==="transparent"?l.clearRect(0,0,D*2,B*2):(l.rect(0,0,D*2,B*2),l.fillStyle=c,l.fill()),l.save(),l.scale(2,2),l.strokeStyle=f,l.lineWidth=1,l.font=He,l.fillStyle=d,y){case"start":l.textBaseline="top";break;case"center":l.textBaseline="middle";break;case"end":l.textBaseline="bottom";break}l.translate(.5,0),l.beginPath();var ne=g?D:B,V=a*s,re=Math.floor(n*a/V),We=Math.ceil((n*a+ne)/V),be=We-re,Ce=Math.max(["left","center","right"].indexOf(X)-1,-1),A=g?B:D;if(ye!=="transparent"&&v[0]!==-1/0&&v[1]!==1/0){var xe=(v[0]-n)*a,we=(v[1]-v[0])*a;l.save(),l.fillStyle=ye,g?l.fillRect(xe,0,we,A):l.fillRect(0,xe,A,we),l.restore()}for(var R=0;R<=be;++R){var I=R+re;if(!(!ge&&I<0))for(var w=I*s,L=(w-n)*a,T=0;T<C;++T){var W=L+T/C*V,Pe=w+T/C*s;if(!(W<0||W>=ne||Pe<v[0]||Pe>v[1])){var G=T===0?te:T%2===0?Fe:Ve,m=0;switch(y){case"start":m=0;break;case"center":m=A/2-G/2;break;case"end":m=A-G;break}var Ee=g?[W+x[0],m+x[1]]:[m+x[0],W+x[1]],ie=Ee[0],oe=Ee[1],Oe=g?[ie,oe+G]:[ie+G,oe],Ge=Oe[0],Ke=Oe[1];l.moveTo(ie+x[0],oe+x[1]),l.lineTo(Ge+x[0],Ke+x[1])}}}l.stroke();for(var R=0;R<=be;++R){var I=R+re;if(!(!ge&&I<0)){var w=I*s,L=(w-n)*a;if(!(L<-V||L>=ne+s*a||w<v[0]||w>v[1])){var m=0;switch(y){case"start":m=17;break;case"center":m=A/2;break;case"end":m=A-17;break}var Re=g?[L+Ce*-3,m]:[m,L+Ce*3],ae=Re[0],se=Re[1],K=""+w;_&&(K=_(w)),l.textAlign=X;var z=0,J=l.measureText(K).width;switch(X){case"left":z=0;break;case"center":z=-J/2;break;case"right":z=-J;break}g?(l.save(),l.fillStyle=p,l.fillRect(ae+M[0]+z,0,J,te),l.restore()):(l.save(),l.translate(0,se+M[1]),l.rotate(-Math.PI/2),l.fillStyle=p,l.fillRect(z,0,J,te),l.restore()),g?l.fillText(K,ae+M[0],se+M[1]):(l.save(),l.translate(ae+M[0],se+M[1]),l.rotate(-Math.PI/2),l.fillText(K,0,0),l.restore())}}}l.restore()},t.defaultProps={type:"horizontal",zoom:1,width:0,height:0,unit:50,negativeRuler:!0,mainLineSize:"100%",longLineSize:10,shortLineSize:7,segment:10,direction:"end",style:{width:"100%",height:"100%"},backgroundColor:"#333333",font:"10px sans-serif",textColor:"#ffffff",textBackgroundColor:"transparent",lineColor:"#777777",range:[-1/0,1/0],rangeBackgroundColor:"transparent"},t}(ze),Bt=["type","width","height","unit","zoom","direction","textAlign","font","segment","mainLineSize","longLineSize","shortLineSize","lineOffset","textOffset","negativeRuler","range","scrollPos","style","backgroundColor","rangeBackgroundColor","lineColor","textColor","textBackgroundColor","textFormat"];const It=Dt;/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */var he=function(r,t){return he=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,n){e.__proto__=n}||function(e,n){for(var i in n)n.hasOwnProperty(i)&&(e[i]=n[i])},he(r,t)};function zt(r,t){he(r,t);function e(){this.constructor=r}r.prototype=t===null?Object.create(t):(e.prototype=t.prototype,new e)}var Q=function(){return Q=Object.assign||function(t){for(var e,n=1,i=arguments.length;n<i;n++){e=arguments[n];for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])}return t},Q.apply(this,arguments)};function jt(r,t){var e={};for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&t.indexOf(n)<0&&(e[n]=r[n]);if(r!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,n=Object.getOwnPropertySymbols(r);i<n.length;i++)t.indexOf(n[i])<0&&Object.prototype.propertyIsEnumerable.call(r,n[i])&&(e[n[i]]=r[n[i]]);return e}function Ut(r,t,e,n){var i=arguments.length,o=i<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,e):n,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,n);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(i<3?s(o):i>3?s(t,e,o):s(t,e))||o);return i>3&&o&&Object.defineProperty(t,e,o),o}var Ht=Bt,Ft=function(r){zt(t,r);function t(n){var i=r.call(this,n)||this;return i.state={},i.state=i.props,i}var e=t.prototype;return e.render=function(){var n=this.state,i=n.parentElement,o=jt(n,["parentElement"]);return Tt(Y(It,Q({ref:pe(this,"ruler")},o)),i)},t}(Ie),Vt=function(){function r(e,n){n===void 0&&(n={}),this.tempElement=document.createElement("div"),Ae(Y(Ft,Q({ref:pe(this,"innerRuler")},n,{parentElement:e})),this.tempElement)}var t=r.prototype;return t.scroll=function(e){this.getRuler().scroll(e)},t.resize=function(){this.getRuler().resize()},t.destroy=function(){Ae(null,this.tempElement),this.tempElement=null,this.innerRuler=null},t.getRuler=function(){return this.innerRuler.ruler},r=Ut([it(Ht,function(e,n){Object.defineProperty(e,n,{get:function(){return this.getRuler().props[n]},set:function(i){var o;this.innerRuler.setState((o={},o[n]=i,o))},enumerable:!0,configurable:!0})})],r),r}();const je=Vt,Wt={name:"RulerHorizontal",mixins:[$],components:{},props:{scale:{type:Number},scroll:{type:Number}},data(){return{ruler:null}},methods:{initMounted(){let r=document.getElementsByClassName("roy-ruler-outer-box");r.length&&(this.ruler=new je(this.$refs.rulerDiv,{type:"horizontal",backgroundColor:window.getComputedStyle(r[0]).backgroundColor,textColor:window.getComputedStyle(r[0]).color,height:16,unit:1,zoom:50}))}},created(){},mounted(){this.initMounted()},watch:{}};var Gt=function(){var t=this,e=t._self._c;return e("div",{ref:"rulerDiv",staticClass:"roy-ruler"})},Kt=[],Jt=E(Wt,Gt,Kt,!1,null,null,null,null);const Zt=Jt.exports,qt={name:"RulerHorizontal",mixins:[$],components:{},props:{scale:{type:Number},scroll:{type:Number}},data(){return{ruler:null}},methods:{initMounted(){let r=document.getElementsByClassName("roy-ruler-outer-box");r.length&&(this.ruler=new je(this.$refs.rulerDiv,{type:"vertical",backgroundColor:window.getComputedStyle(r[0]).backgroundColor,textColor:window.getComputedStyle(r[0]).color,width:16,unit:1,zoom:50}))}},created(){},mounted(){this.initMounted()},watch:{}};var Qt=function(){var t=this,e=t._self._c;return e("div",{ref:"rulerDiv",staticClass:"roy-ruler"})},Yt=[],Xt=E(qt,Qt,Yt,!1,null,null,null,null);const en=Xt.exports;const tn={name:"RoyRuler",mixins:[$],components:{RulerHorizontal:Zt,RulerVertical:en},props:{},data(){return{}},methods:{initMounted(){}},created(){},mounted(){this.initMounted()},watch:{}};var nn=function(){var t=this,e=t._self._c;return e("div",{staticClass:"roy-ruler-box"},[e("div",{staticClass:"roy-ruler-outer-box"}),e("div",{staticClass:"roy-ruler-horizontal-wrapper"},[e("RulerHorizontal")],1),e("div",{staticClass:"roy-ruler-vertical-wrapper"},[e("RulerVertical")],1),e("div",{staticClass:"roy-ruler-inner-box"},[e("div",{staticClass:"roy-ruler-inner-box-content"},[t._t("default")],2)])])},rn=[],on=E(tn,nn,rn,!1,null,null,null,null);const an=on.exports;const sn={name:"RoyEditor",mixins:[$],components:{Ruler:an},props:{},data(){return{}},methods:{initMounted(){}},created(){},mounted(){this.initMounted()},watch:{}};var un=function(){var t=this,e=t._self._c;return e("el-main",{staticClass:"roy-designer-main__page"},[e("Ruler",[e("div",{attrs:{id:"designer-page"}},[e("div",[t._v("\u6D4B\u8BD5\u9875\u9762")])])])],1)},cn=[],ln=E(sn,un,cn,!1,null,null,null,null);const fn=ln.exports,dn={name:"DesignerMain",mixins:[$],components:{ToolBar:rt,Editor:fn},props:{},data(){return{}},methods:{initMounted(){}},created(){},mounted(){this.initMounted()},watch:{}};var vn=function(){var t=this,e=t._self._c;return e("section",{staticClass:"height-all"},[e("ToolBar"),e("Editor")],1)},hn=[],pn=E(dn,vn,hn,!1,null,null,null,null);const _n=pn.exports;const mn={name:"HomePage",components:{DesignerAside:Ye,DesignerMain:_n},props:{},data(){return{}},methods:{initMounted(){}},created(){},mounted(){this.initMounted()},watch:{}};var yn=function(){var t=this,e=t._self._c;return e("el-container",{staticClass:"roy-designer-container"},[e("el-header",{staticClass:"roy-designer-header",attrs:{height:"40px"}},[e("div",{staticClass:"roy-designer-header__text"},[e("i",{staticClass:"ri-pen-nib-line"}),e("span",[t._v("\u6253\u5370\u6A21\u677F\u8BBE\u8BA1\u5668")])])]),e("el-container",{staticStyle:{height:"calc(100% - 40px)"}},[e("el-aside",{staticClass:"roy-designer-aside",attrs:{width:"300px"}},[e("DesignerAside")],1),e("el-main",{staticClass:"roy-designer-main"},[e("DesignerMain")],1)],1)],1)},gn=[],bn=E(mn,yn,gn,!1,null,null,null,null);const Cn=bn.exports,wn=Object.freeze(Object.defineProperty({__proto__:null,default:Cn},Symbol.toStringTag,{value:"Module"}));export{wn as H,$ as c};
