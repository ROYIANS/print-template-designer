(function(){"use strict";var e={447:function(e,t,n){var i=n(6369),o=n(3822);i["default"].use(o.ZP);var r=new o.ZP.Store({modules:{}}),s=function(){var e=this,t=e._self._c;return t("PtdDesigner")},a=[],l={name:"App"},h=l,c=n(1001),d=(0,c.Z)(h,s,a,!1,null,null,null),u=d.exports,f=n(8499),g=n.n(f),p=n(2631);i["default"].use(p.ZP);const m=[],v=new p.ZP({mode:"history",base:"/",routes:m});var C=v,w=function(){var e=this,t=e._self._c;return t("el-container",{staticClass:"roy-designer-container",attrs:{id:"roy-print-template-designer",theme:"day"}},[t("el-header",{staticClass:"roy-designer-header",attrs:{height:"40px"}},[t("div",{staticClass:"roy-designer-header__text"},[t("i",{staticClass:"ri-pen-nib-line"}),t("span",[e._v("打印模板设计器")])]),t("div",{staticClass:"roy-night-mode"},[t("transition-group",{attrs:{name:"roy-fade",tag:"span"}},[e.isNightMode?t("i",{key:1,staticClass:"ri-haze-fill",on:{click:e.dayNightChange}}):t("i",{key:2,staticClass:"ri-moon-foggy-fill",on:{click:e.dayNightChange}})])],1)]),t("el-container",{staticStyle:{height:"calc(100% - 40px)"}},[t("el-aside",{staticClass:"roy-designer-aside",attrs:{width:"auto"}},[t("DesignerAside")],1),t("el-main",{staticClass:"roy-designer-main"},[t("DesignerMain")],1)],1)],1)},b=[],y={i8:"0.0.6"},S=function(){var e=this,t=e._self._c;return t("section",{staticClass:"roy-designer-aside__main",style:e.asideStyle},[t("el-menu",{staticClass:"roy-designer-aside__menu",attrs:{collapse:!0,"default-active":"0"},on:{select:e.onMenuSelect}},e._l(e.menuList,(function(n,i){return t("el-menu-item",{key:n.code,attrs:{index:`${i}`}},[t("div",{staticClass:"roy-designer-aside__menu__icon"},[t("i",{class:n.icon}),t("span",[e._v(e._s(n.name))])])])})),1),t("keep-alive",[t(e.curActiveComponent,{directives:[{name:"show",rawName:"v-show",value:e.showRight,expression:"showRight"}],key:e.curActiveComponentCode,tag:"component",staticClass:"roy-designer-aside__right_panel"})],1)],1)},x=[],M=n(1917),L={name:"DesignerAside",mixins:[M.Z],data(){return{showRight:!0,menuList:[{name:"组件",code:"component",icon:"ri-pencil-ruler-2-line",component:()=>n.e(945).then(n.bind(n,4945))},{name:"区块",code:"blocks",icon:"ri-layout-5-line",component:()=>n.e(565).then(n.bind(n,3565))},{name:"页面",code:"page",icon:"ri-stack-line",component:()=>n.e(377).then(n.bind(n,4377))},{name:"大纲",code:"toc",icon:"ri-pages-line",component:()=>n.e(502).then(n.bind(n,7502))},{name:"工具",code:"tools",icon:"ri-magic-line",component:()=>n.e(746).then(n.bind(n,2746))},{name:"全局",code:"setting",icon:"ri-sound-module-line",component:()=>n.e(205).then(n.bind(n,6205))}],curActiveComponent:null,curActiveComponentCode:""}},computed:{asideStyle(){return this.showRight?"width: 300px":"width: 65px"}},methods:{onMenuSelect(e){this.curActiveComponentCode===this.menuList[e].code?this.showRight=!this.showRight:this.showRight=!0,this.curActiveComponent=this.menuList[e].component,this.curActiveComponentCode=this.menuList[e].code}},mounted(){this.curActiveComponent=this.menuList[0].component,this.curActiveComponentCode=this.menuList[0].code}},R=L,_=(0,c.Z)(R,S,x,!1,null,"88bbf378",null),k=_.exports,N=function(){var e=this,t=e._self._c;return t("section",{staticClass:"height-all"},[t("ToolBar"),t("Editor")],1)},A=[],$=function(){var e=this,t=e._self._c;return t("el-header",{staticClass:"roy-designer-main__toolbar",attrs:{height:"45px"}},[t("section",{staticClass:"roy-designer-main__toolbar_left"},e._l(e.toolbarLeftConfig,(function(e,n){return t("el-tooltip",{key:n,attrs:{content:e.name,"open-delay":600,"visible-arrow":!1,effect:"dark",placement:"bottom"}},[t("div",{staticClass:"roy-designer-main__toolbar__item",on:{click:e.event}},[t("i",{class:e.icon})])])})),1),t("section",{staticClass:"roy-designer-main__toolbar_right"},e._l(e.toolbarRightConfig,(function(e,n){return t("el-tooltip",{key:n,attrs:{content:e.name,"open-delay":600,"visible-arrow":!1,effect:"dark",placement:"bottom"}},[t("div",{staticClass:"roy-designer-main__toolbar__item",on:{click:e.event}},[t("i",{class:e.icon})])])})),1)])},D=[],E={name:"ToolBar",mixins:[M.Z],components:{},props:{},data(){return{toolbarLeftConfig:[{name:"撤销",icon:"ri-arrow-go-back-fill",event:()=>{alert("撤销")}},{name:"恢复",icon:"ri-arrow-go-forward-fill",event:()=>{}}],toolbarRightConfig:[{name:"预览",icon:"ri-eye-2-fill",event:()=>{}},{name:"保存",icon:"ri-save-2-fill",event:()=>{}}]}},methods:{initMounted(){}},created(){},mounted(){this.initMounted()},watch:{}},T=E,I=(0,c.Z)(T,$,D,!1,null,"fc204622",null),O=I.exports,F=function(){var e=this,t=e._self._c;return t("el-main",{staticClass:"roy-designer-main__page"},[t("MbRuler",{attrs:{height:e.rulerHeight,width:e.rulerWidth,"is-open-menu-feature":!1}}),t("div",{attrs:{id:"designer-page"}},[t("div",[e._v("测试页面")])])],1)},P=[];n(7658);const j=e=>e<=.25?40:e<=.5?20:e<=1?10:e<=2?5:e<=4?2:1,B=.83,H=(e,t,n,i)=>{const{scale:o,width:r,height:s,canvasConfigs:a}=i,{bgColor:l,fontColor:h,shadowColor:c,ratio:d,longfgColor:u,shortfgColor:f}=a;if(e.scale(d,d),e.clearRect(0,0,r,s),e.fillStyle=l,e.fillRect(0,0,r,s),n){const i=(n.x-t)*o,r=n.width*o;e.fillStyle=c,e.fillRect(i,0,r,3*s/8)}const g=j(o),p=g*o,m=10*g,v=m*o,C=Math.floor(t/g)*g,w=Math.floor(t/m)*m,b=(C-t)/g*p,y=(w-t)/m*v,S=t+Math.ceil(r/o);e.beginPath(),e.fillStyle=h,e.strokeStyle=u;for(let x=w,M=0;x<S;x+=m,M++){const t=y+M*v+.5;e.moveTo(t,0),e.save(),e.translate(t,.4*s),e.scale(B/d,B/d),e.fillText(x,4*d,7*d),e.restore(),e.lineTo(t,9*s/16)}e.stroke(),e.closePath(),e.beginPath(),e.strokeStyle=f;for(let x=C,M=0;x<S;x+=g,M++){const t=b+M*p+.5;e.moveTo(t,0),x%m!==0&&e.lineTo(t,1*s/4)}e.stroke(),e.closePath(),e.setTransform(1,0,0,1,0,0)},Z=(e,t,n,i)=>{const{scale:o,width:r,height:s,canvasConfigs:a}=i,{bgColor:l,fontColor:h,shadowColor:c,ratio:d,longfgColor:u,shortfgColor:f}=a;if(e.scale(d,d),e.clearRect(0,0,r,s),e.fillStyle=l,e.fillRect(0,0,r,s),n){const i=(n.y-t)*o,s=n.height*o;e.fillStyle=c,e.fillRect(0,i,3*r/8,s)}const g=j(o),p=g*o,m=10*g,v=m*o,C=Math.floor(t/g)*g,w=Math.floor(t/m)*m,b=(C-t)/g*p,y=(w-t)/m*v,S=t+Math.ceil(s/o);e.beginPath(),e.fillStyle=h,e.strokeStyle=u;for(let x=w,M=0;x<S;x+=m,M++){const t=y+M*v+.5;e.moveTo(0,t),e.save(),e.translate(.4*r,t),e.rotate(-Math.PI/2),e.scale(B/d,B/d),e.fillText(x,4*d,7*d),e.restore(),e.lineTo(9*r/16,t)}e.stroke(),e.closePath(),e.beginPath(),e.strokeStyle=f;for(let x=C,M=0;x<S;x+=g,M++){const t=b+M*p+.5;e.moveTo(0,t),x%m!==0&&e.lineTo(1*r/4,t)}e.stroke(),e.closePath(),e.setTransform(1,0,0,1,0,0)},z=(e,t,n)=>Math.round(t+e/n);var Y,X,G={name:"CanvasRuler",data(){return{}},props:{vertical:Boolean,start:Number,scale:Number,width:Number,height:Number,canvasConfigs:Object,selectStart:Number,selectLength:Number,doAddLine:Function,doIndicatorShow:Function,doIndicatorMove:Function,doIndicatorHide:Function,doHandleShowRightMenu:Function},methods:{drawRuler(){const e={scale:this.scale,width:this.width,height:this.height,canvasConfigs:this.canvasConfigs};this.vertical?Z(this.$refs.canvas.getContext("2d"),this.start,{y:this.selectStart,height:this.selectLength},e):H(this.$refs.canvas.getContext("2d"),this.start,{x:this.selectStart,width:this.selectLength},e)},updateCanvasContext(){const{ratio:e}=this.canvasConfigs;this.$refs.canvas.width=this.width*e,this.$refs.canvas.height=this.height*e;const t=this.$refs.canvas.getContext("2d");t.font=12*e+'px -apple-system, "Helvetica Neue", ".SFNSText-Regular", "SF UI Text", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Zen Hei", sans-serif',t.lineWidth=1,t.textBaseline="middle"},handleClick(e){const t=this.vertical?e.offsetY:e.offsetX;this.doAddLine(z(t,this.start,this.scale))},handleEnter(e){const t=this.vertical?e.offsetY:e.offsetX;this.doIndicatorShow(z(t,this.start,this.scale))},handleMove(e){const t=this.vertical?e.offsetY:e.offsetX;this.doIndicatorMove(z(t,this.start,this.scale))},handleLeave(){this.doIndicatorHide()},handleRightMenu(e){if(e.stopPropagation(),2===e.button){const t=e.clientX,n=e.clientY;this.doHandleShowRightMenu(t,n)}}},mounted(){this.updateCanvasContext(),this.drawRuler()},watch:{width(e,t){e!==t&&this.updateCanvasContext(),this.drawRuler()},height(e,t){e!==t&&this.updateCanvasContext(),this.drawRuler()}},render(e){return e("canvas",{props:{},on:{click:this.handleClick,mouseEnter:this.handleEnter,mouseDown:this.handleRightMenu,mouseMove:this.handleMove,mouseLeave:this.handleLeave},ref:"canvas",class:"ruler"})}},W={name:"RulerLine",data(){return{state:{value:this.value}}},props:{index:Number,start:Number,vertical:Boolean,scale:Number,value:Number,doRemove:Function,doMouseDown:Function,doRelease:Function},methods:{handleDown(e){const{value:t}=this.state,n=this.vertical?e.clientY:e.clientX;this.doMouseDown();const i=e=>{const i=this.vertical?e.clientY:e.clientX,o=Math.round(t+(i-n)/this.scale);this.setState({value:o})},o=()=>{this.doRelease(this.state.value,this.index),document.removeEventListener("mousemove",i),document.removeEventListener("mouseup",o)};document.addEventListener("mousemove",i),document.addEventListener("mouseup",o)},handleRemove(){this.doRemove(this.index)},setState(e={}){for(let t of Object.keys(e))this.$set(this.state,t,e[t])}},created(){},render(){const e=arguments[0],{value:t}=this.state,n=(t-this.start)*this.scale;if(n<0)return null;const i=this.vertical?{top:n}:{left:n};return e("div",{class:"line",style:i,attrs:{doMouseDown:this.handleDown}},[e("div",{class:"action"},[e("span",{class:"del",on:{click:this.handleRemove}},["×"]),e("span",{class:"value"},[t])])])}},q={name:"RulerWrapper",data(){return{state:{isDraggingLine:!1,showIndicator:!1,value:0,lines:this.lines}}},props:{vertical:Boolean,scale:Number,width:Number,height:Number,start:Number,lines:{type:Array,default:()=>[]},selectStart:Number,selectLength:Number,canvasConfigs:Object,doLineChange:Function,doShowRightMenu:Function,isShowReferLine:Boolean,handleShowReferLine:Function},methods:{setState(e={}){for(let t of Object.keys(e))this.$set(this.state,t,e[t])},handleIndicatorShow(e){!this.state.isDraggingLine&&this.setState({showIndicator:!0,value:e})},handleIndicatorMove(e){this.state.showIndicator&&this.setState({value:e})},handleIndicatorHide(){this.setState({showIndicator:!1})},handleNewLine(e){const{lines:t}=this.state;t.push(e),this.setState({lines:this.lines}),this.doLineChange(t,this.vertical),!this.isShowReferLine&&this.handleShowReferLine()},handleLineDown(){this.setState({isDraggingLine:!0})},handleLineRelease(e,t){const{lines:n}=this.state;this.setState({isDraggingLine:!1});const i=e-this.start,o=(this.vertical?this.height:this.width)/this.scale;i<0||i>o?this.handleLineRemove(t):(n[t]=e,this.doLineChange(n,this.vertical),this.setState({lines:this.lines}))},handleLineRemove(e){const{lines:t}=this.state;t.splice(e,1),this.doLineChange(t,this.vertical),this.setState({isDraggingLine:!1})},doHandleShowRightMenu(e,t){this.doShowRightMenu(e,t,this.vertical)}},render(){const e=arguments[0],{showIndicator:t,value:n}=this.state,i=this.vertical?"v-container":"h-container",o=(n-this.start)*this.scale,r=this.vertical?{top:o}:{left:o};return e("div",{class:i},[e(G,{attrs:{vertical:this.vertical,scale:this.scale,width:this.width,height:this.height,start:this.start,selectStart:this.selectStart,selectLength:this.selectLength,canvasConfigs:this.canvasConfigs,doAddLine:this.handleNewLine,doIndicatorShow:this.handleIndicatorShow,doIndicatorMove:this.handleIndicatorMove,doIndicatorHide:this.handleIndicatorHide,doHandleShowRightMenu:this.doHandleShowRightMenu}}),this.isShowReferLine&&e("div",{class:"lines"},[this.state.lines.map(((t,n)=>e(W,{key:t+n,attrs:{index:n,value:t>>0,scale:this.scale,start:this.start,vertical:this.vertical,doRemove:this.handleLineRemove,doMouseDown:this.handleLineDown,doRelease:this.handleLineRelease}})))]),t&&e("div",{class:"indicator",style:r},[e("span",{class:"value"},[n])])])}},U={name:"Teleport",props:{to:{type:Element,required:!0},disabled:{type:Boolean,default:!0}},inject:["parent"],watch:{disabled(){this.disabled?this.to.appendChild(this.$el):this.parent.toSourceDom(this.$el)}},mounted(){this.disabled&&document.querySelector(this.to).appendChild(this.$el)},render(){const e=arguments[0];return e("div",{attrs:{className:"Teleport"}},[this.$scopedSlots.default()])}},J=U,V=(0,c.Z)(J,Y,X,!1,null,"3be01b56",null),K=V.exports;const Q={"zh-CN":{vertical:"纵向",horizontal:"横向",show_ruler:"显示标尺",show_refer_line:"显示参考线",remove_all:"删除所有",refer_line:"参考线"},en:{vertical:"vertical",horizontal:"horizontal",show_ruler:"show rulers",show_refer_line:"show all guides",remove_all:"remove all ",refer_line:" guides"}};var ee=n(3774);const te=ee.F4`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`,ne=ee.F4`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
`,ie=ee.ZP.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 2px 10px 0 rgba(39, 54, 78, 0.08),
    0 12px 40px 0 rgba(39, 54, 78, 0.1);
  background: ${e=>e.menuConfigs.bgColor};
  border-radius: 2px;
  padding: 6px 0;
  transition: opacity 0.2s ease-in-out;
  transform-origin: 0 0;
  animation: ${te} 0.2s;
  animation-fill-mode: forwards;
  z-index: 999;
  &.hide-menu {
    animation: ${ne} 0.1s;
    animation-fill-mode: forwards;
    z-index: -9999;
  }
  .divider {
    margin: 4px 12px;
    border-top: 1px solid ${e=>e.menuConfigs.dividerColor};
    min-width: ${e=>"ch"===e.lang?"82%":"87%"};
  }
  .menu-content {
    font-size: 12px;
    font-family: PingFangSC, sans-serif;
    color: ${e=>e.menuConfigs.listItem.textColor};
    background: ${e=>e.menuConfigs.listItem.bgColor};
    width: 100%;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    cursor: pointer;
    svg > path {
      fill: ${e=>e.menuConfigs.listItem.textColor};
    }
    &.disabled {
      color: ${e=>e.menuConfigs.listItem.disabledTextColor};
      &:hover {
        cursor: not-allowed;
        background: none;
        color: ${e=>e.menuConfigs.listItem.disabledTextColor};
      }
    }
  }
  .menu-content:hover {
    background: ${e=>e.menuConfigs.listItem.hoverBgColor};
    cursor: pointer;
    color: ${e=>e.menuConfigs.listItem.hoverTextColor};

    svg > path {
      fill: ${e=>e.menuConfigs.listItem.hoverTextColor};
    }
  }
`,oe=ee.ZP.div`
  position: absolute;
  width: 100%; /* scrollbar width */
  height: 100%;
  z-index: 3; /* 需要比resizer高 */
  pointer-events: none;
  font-size: 12px;
  overflow: hidden;
  span {
    line-height: 1;
  }

  .corner {
    position: absolute;
    left: 0;
    top: 0;
    width: ${e=>e.thick+"px"};
    height: ${e=>e.thick+"px"};
    border-right: 1px solid ${e=>e.borderColor};
    border-bottom: 1px solid ${e=>e.borderColor};
    pointer-events: auto;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    box-sizing: content-box;
    &.active {
      background-color: ${e=>e.cornerActiveColor} !important;
    }
  }

  .indicator {
    position: absolute;
    pointer-events: none;
    .value {
      position: absolute;
      background: white;
    }
  }

  .ruler {
    width: 100%;
    height: 100%;
    pointer-events: auto;
  }

  .line {
    position: absolute;
    .action {
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .value {
      pointer-events: none;
      transform: scale(0.83);
    }
    .del {
      cursor: pointer;
      padding: 3px 5px;
      visibility: hidden;
    }
    &:hover .del {
      visibility: visible;
    }
  }

  .h-container,
  .v-container {
    position: absolute;
    .lines {
      pointer-events: none;
    }
    &:hover .lines {
      pointer-events: auto;
    }
  }

  .h-container {
    left: ${e=>e.thick+"px"};
    top: 0;
    width: calc(100% - ${e=>e.thick+"px"});
    height: ${e=>`${e.thick+1}px`};

    .line {
      height: 100vh;
      top: 0;
      padding-left: 5px;
      border-left: 1px solid ${e=>e.lineColor};
      cursor: ${e=>e.isShowReferLine?"ew-resize":"none"};
      .action {
        top: ${e=>e.thick+"px"};
        transform: translateX(-24px);
        .value {
          margin-left: 4px;
        }
      }
    }

    .indicator {
      top: 0;
      border-left: 1px solid ${e=>e.lineColor};
      height: 100vw;
      .value {
        margin-left: 2px;
        margin-top: 4px;
      }
    }
  }

  .v-container {
    top: ${e=>e.thick+"px"};
    left: 0;
    width: ${e=>`${e.thick+1}px`};
    height: calc(100% - ${e=>e.thick+"px"});

    .line {
      width: 100vw;
      left: 0;
      padding-top: 5px;
      border-top: 1px solid ${e=>e.lineColor};
      cursor: ${e=>e.isShowReferLine?"ns-resize":"none"};
      .action {
        left: ${e=>e.thick+"px"};
        transform: translateY(-24px);
        flex-direction: column;
        .value {
          margin-top: 4px;
        }
      }
    }

    .indicator {
      border-bottom: 1px solid ${e=>e.lineColor};
      width: 100vw;
      .value {
        margin-left: 2px;
        margin-top: -5px;
        transform-origin: 0 0;
        transform: rotate(-90deg);
      }
    }
  }
`;var re={name:"RulerContextMenu",data(){return{state:{},el:null}},props:{vertical:Boolean,menuPosition:Object,handleShowRuler:Function,isShowReferLine:Boolean,handleShowReferLine:Function,horLineArr:Array,verLineArr:Array,handleLine:Function,oncloseMenu:Function,lang:String,menuConfigs:Object},created(){this.el=document.createElement("div")},mounted(){document.body.appendChild(this.el),document.addEventListener("click",this.closeMenu),document.addEventListener("mousedown",this.closeMenuMouse)},destroyed(){document.removeEventListener("mousedown",this.closeMenuMouse),document.removeEventListener("click",this.closeMenu),document.body.removeChild(this.el)},closeMenu(){this.oncloseMenu()},closeMenuMouse(e){2===e.button&&this.closeMenu()},onhandleShowRuler(){this.handleShowRuler()},onhandleShowReferLine(){this.handleShowReferLine()},onhandleShowSpecificRuler(){const e=this.vertical?{h:this.horLineArr,v:[]}:{h:[],v:this.verLineArr};this.handleLine(e),this.closeMenu()},render(){const e=arguments[0],{left:t,top:n}=this.menuPosition,i=this.vertical?!this.verLineArr.length:!this.horLineArr.length,o=e("svg",{attrs:{width:"10",height:"10",xmlns:"http://www.w3.org/2000/svg"}},[e("path",{attrs:{d:"M1 5.066c0 .211.07.39.212.538L3.346 7.78A.699.699 0 0 0 3.872 8a.69.69 0 0 0 .517-.221l4.39-4.49A.731.731 0 0 0 9 2.753a.717.717 0 0 0-.22-.532A.714.714 0 0 0 8.255 2a.714.714 0 0 0-.524.221l-3.86 3.955L2.26 4.528a.714.714 0 0 0-.524-.221.714.714 0 0 0-.524.221.749.749 0 0 0-.212.538z",fill:"#415058",fillRule:"evenodd"}})]);return e(K,{attrs:{to:this.el}},[e(ie,{style:{left:t,top:n},attrs:{showReferLine:this.isShowReferLine,lang:this.lang,menuConfigs:this.menuConfigs,id:"contextMenu"}},[e("a",{class:"menu-content",on:{click:this.onhandleShowRuler}},[Q[this.lang].show_ruler,o]),e("a",{class:"menu-content",on:{click:this.onhandleShowReferLine}},[Q[this.lang].show_refer_line,this.isShowReferLine&&o]),e("div",{class:"divider"}),e("a",{class:"menu-content"+(i?" disabled":""),on:{click:this.onhandleShowSpecificRuler}},[Q[this.lang].remove_all,this.vertical?Q[this.lang].horizontal:Q[this.lang].vertical,Q[this.lang].refer_line])])])}};const se={bgColor:"#fff",dividerColor:"#DBDBDB",listItem:{textColor:"#415058",hoverTextColor:"#298DF8",disabledTextColor:"rgba(65, 80, 88, 0.4)",bgColor:"#fff",hoverBgColor:"#F2F2F2"}};var ae={name:"MbRuler",data(){return{state:{isShowMenu:!1,vertical:!1,positionObj:{x:0,y:0}}}},props:{scale:{type:Number,default:1},ratio:{type:Number,default:window.devicePixelRatio||1},thick:{type:Number,default:16},width:{type:Number},height:{type:Number},startX:{type:Number,default:0},startY:{type:Number,default:0},shadow:{type:Object,default:()=>({x:200,y:100,width:200,height:400})},horLineArr:{type:Array,default:()=>[100,200]},verLineArr:{type:Array,default:()=>[100,200]},handleLine:{type:Function,default:()=>{}},cornerActive:{type:Boolean,default:!1},onCornerClick:{type:Function,default:()=>{}},lang:{type:String,default:"zh-CN"},isOpenMenuFeature:{type:Boolean,default:!0},handleShowRuler:{type:Function,default:()=>{}},isShowReferLine:{type:Boolean,default:!0},handleShowReferLine:{type:Function,default:()=>{}},palette:{type:Object,default:()=>({bgColor:"rgba(225,225,225, 0)",longfgColor:"#BABBBC",shortfgColor:"#C8CDD0",fontColor:"#7D8694",shadowColor:"#E8E8E8",lineColor:"#EB5648",borderColor:"#DADADC",cornerActiveColor:"rgb(235, 86, 72, 0.6)",menu:se})}},methods:{setState(e={}){for(let t of Object.keys(e))this.$set(this.state,t,e[t])},handleLineChange(e,t){const n=t?{h:this.horLineArr,v:[...e]}:{h:[...e],v:this.verLineArr};this.handleLine(n)},doShowRightMenu(e,t,n){this.setState({isShowMenu:!0,vertical:n,positionObj:{x:e,y:t}})},onhandlecloseMenu(){this.setState({isShowMenu:!1})},preventDefault(e){e.preventDefault()}},created(){const{ratio:e,palette:t}={ratio:this.ratio,palette:this.palette},n=t.menu||se;this.canvasConfigs={ratio:e,bgColor:t.bgColor,longfgColor:t.longfgColor,shortfgColor:t.shortfgColor,fontColor:t.fontColor,shadowColor:t.shadowColor,lineColor:t.lineColor,borderColor:t.borderColor,cornerActiveColor:t.cornerActiveColor},this.menuConfigs={bgColor:n.bgColor,dividerColor:n.dividerColor,listItem:n.listItem}},render(){const e=arguments[0],{width:t,height:n,scale:i,handleLine:o,thick:r,shadow:s,startX:a,startY:l,cornerActive:h,horLineArr:c,verLineArr:d,onCornerClick:u,palette:{bgColor:f},lang:g,isOpenMenuFeature:p,handleShowRuler:m,isShowReferLine:v,handleShowReferLine:C}=this._props,{positionObj:w,vertical:b,isShowMenu:y}=this.state,{x:S,y:x,width:M,height:L}=s,R={left:w.x,top:w.y};return e(oe,{attrs:{id:"mb-ruler",className:"mb-ruler",isShowReferLine:v,thick:r,ratio:this.canvasConfigs.ratio,bgColor:this.canvasConfigs.bgColor,longfgColor:this.canvasConfigs.longfgColor,shortfgColor:this.canvasConfigs.shortfgColor,fontColor:this.canvasConfigs.fontColor,shadowColor:this.canvasConfigs.shadowColor,lineColor:this.canvasConfigs.lineColor,borderColor:this.canvasConfigs.borderColor,cornerActiveColor:this.canvasConfigs.cornerActiveColor},on:{contextMenu:this.preventDefault}},[e(q,{attrs:{width:t,height:r,start:a,lines:c,selectStart:S,selectLength:M,scale:i,canvasConfigs:this.canvasConfigs,doLineChange:this.handleLineChange,doShowRightMenu:this.doShowRightMenu,isShowReferLine:v,handleShowReferLine:C}}),e(q,{attrs:{width:r,height:n,start:l,lines:d,selectStart:x,selectLength:L,vertical:!0,scale:i,canvasConfigs:this.canvasConfigs,doLineChange:this.handleLineChange,doShowRightMenu:this.doShowRightMenu,isShowReferLine:v,handleShowReferLine:C}}),e("a",{attrs:{className:"corner"+(h?" active":"")},style:{backgroundColor:f},on:{click:u}}),p&&y&&e(re,{key:String(R.left)+String(R.top),attrs:{lang:g,vertical:b,handleLine:o,horLineArr:c,verLineArr:d,menuPosition:R,handleShowRuler:m,isShowReferLine:v,handleShowReferLine:C,menuConfigs:this.menuConfigs},on:{closeMenu:this.onhandlecloseMenu}})])}},le={name:"RoyEditor",mixins:[M.Z],components:{MbRuler:ae},props:{},data(){return{rulerHeight:0,rulerWidth:0}},methods:{initMounted(){this.rulerHeight=this.$el.offsetHeight,this.rulerWidth=this.$el.offsetWidth}},created(){},mounted(){this.initMounted()},watch:{}},he=le,ce=(0,c.Z)(he,F,P,!1,null,"1c954d16",null),de=ce.exports,ue={name:"DesignerMain",mixins:[M.Z],components:{ToolBar:O,Editor:de},props:{},data(){return{}},methods:{initMounted(){}},created(){},mounted(){this.initMounted()},watch:{}},fe=ue,ge=(0,c.Z)(fe,N,A,!1,null,null,null),pe=ge.exports;const me=y.i8;var ve={name:"RoyPrintDesigner",components:{DesignerAside:k,DesignerMain:pe},props:{},data(){return{}},computed:{isNightMode(){return this.$store.state.printTemplateModule.nightMode.isNightMode}},methods:{...(0,o.nv)({initNightMode:"printTemplateModule/nightMode/initNightMode",toggleNightMode:"printTemplateModule/nightMode/toggleNightMode"}),initMounted(){console.log(`\n %c PrintTemplateDesigner® v${me} %c ${new Date(window.versionTime||(new Date).getTime()).toLocaleString()}`,"color:#fff;background:linear-gradient(90deg,#4579e1,#009688);padding:5px 0;","color:#000;background:linear-gradient(90deg,#009688,#ffffff);padding:5px 10px 5px 0px;"),this.initConfig()},initConfig(){this.initNightMode()},dayNightChange(){console.log(!this.isNightMode),this.toggleNightMode(!this.isNightMode)},enterFullScreen(){}},created(){},mounted(){this.initMounted()},watch:{}},Ce=ve,we=(0,c.Z)(Ce,w,b,!1,null,"7d013fe2",null),be=we.exports;const ye={},Se={},xe={},Me={};var Le={STORAGE_PREFIX:"_ROY_DESIGNER_"};const{STORAGE_PREFIX:Re}=Le;var _e={namespaced:!0,state:()=>({isNightMode:!1}),mutations:{setIsNightMode(e,t){e.isNightMode=t.isNightMode}},actions:{toggleNightMode({commit:e},t){window.localStorage.setItem(`${Re}NIGHT_MODE`,JSON.stringify(t)),document.getElementById("roy-print-template-designer").setAttribute("theme",t?"dark":"day"),e("setIsNightMode",{isNightMode:t})},async initNightMode({dispatch:e}){const t=window.localStorage.getItem(`${Re}NIGHT_MODE`);null!==t&&await e("toggleNightMode",JSON.parse(t))}}},ke={namespaced:!0,state:ye,mutations:xe,actions:Me,getters:Se,modules:{nightMode:_e}};const Ne={PtdDesigner:be},Ae=function(e,t={}){Ae.installed||(t.store?(t.store.registerModule(["printTemplateModule"],ke),Object.keys(Ne).forEach((t=>{e.component(t,Ne[t])}))):console.warn("[print-template-designer] 请提供store！"))},$e={version:"ROY-PRINT-DESIGNER@0.0.6",install:Ae};"undefined"!==typeof window&&window.Vue&&Ae(window.Vue);var De=$e;i["default"].use(g(),{size:"small"}),i["default"].use(De,{store:r}),i["default"].config.productionTip=!1,new i["default"]({router:C,store:r,render:e=>e(u)}).$mount("#roy-app")},1917:function(e,t,n){n(7658);t["Z"]={methods:{deepCopy(e,t=[]){if(null===e||"object"!==typeof e)return e;const n=Object.prototype.toString.call(e).slice(8,-1);if("RegExp"===n)return new RegExp(e);if("Date"===n)return new Date(e);if("Error"===n)return new Error(e);const i=t.filter((t=>t.original===e))[0];if(i)return i.copy;const o=Array.isArray(e)?[]:{};return t.push({original:e,copy:o}),Object.keys(e).forEach((n=>{o[n]=this.deepCopy(e[n],t)})),o},getUuid(e="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"){let t=[];for(let i=0;i<36;i++)t[i]=e.substr(Math.floor(16*Math.random()),1);t[14]="4",t[19]=e.substr(3&t[19]|8,1),t[8]=t[13]=t[18]=t[23]="";let n=t.join("");return n},isBlank(e){return void 0===e||null===e||""===e},findParentComponent(e,t){let n=e.$parent;while(n){let e=n.$options.componentName||n.$options.name;if(e===t)return n;n=n.$parent}return!1}}}}},t={};function n(i){var o=t[i];if(void 0!==o)return o.exports;var r=t[i]={exports:{}};return e[i].call(r.exports,r,r.exports,n),r.exports}n.m=e,function(){var e=[];n.O=function(t,i,o,r){if(!i){var s=1/0;for(c=0;c<e.length;c++){i=e[c][0],o=e[c][1],r=e[c][2];for(var a=!0,l=0;l<i.length;l++)(!1&r||s>=r)&&Object.keys(n.O).every((function(e){return n.O[e](i[l])}))?i.splice(l--,1):(a=!1,r<s&&(s=r));if(a){e.splice(c--,1);var h=o();void 0!==h&&(t=h)}}return t}r=r||0;for(var c=e.length;c>0&&e[c-1][2]>r;c--)e[c]=e[c-1];e[c]=[i,o,r]}}(),function(){n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,{a:t}),t}}(),function(){n.d=function(e,t){for(var i in t)n.o(t,i)&&!n.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})}}(),function(){n.f={},n.e=function(e){return Promise.all(Object.keys(n.f).reduce((function(t,i){return n.f[i](e,t),t}),[]))}}(),function(){n.u=function(e){return"js/"+e+"."+{205:"07c66e71",377:"83e43016",502:"549d4716",565:"d656503b",746:"543f3a2c",945:"12716093"}[e]+".js"}}(),function(){n.miniCssF=function(e){return"css/"+e+"."+{205:"a078fa9c",377:"8a5be450",502:"c37e4a67",565:"d6635a5f",746:"581fe9f6",945:"3ad803b4"}[e]+".css"}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={},t="print-template-designer:";n.l=function(i,o,r,s){if(e[i])e[i].push(o);else{var a,l;if(void 0!==r)for(var h=document.getElementsByTagName("script"),c=0;c<h.length;c++){var d=h[c];if(d.getAttribute("src")==i||d.getAttribute("data-webpack")==t+r){a=d;break}}a||(l=!0,a=document.createElement("script"),a.charset="utf-8",a.timeout=120,n.nc&&a.setAttribute("nonce",n.nc),a.setAttribute("data-webpack",t+r),a.src=i),e[i]=[o];var u=function(t,n){a.onerror=a.onload=null,clearTimeout(f);var o=e[i];if(delete e[i],a.parentNode&&a.parentNode.removeChild(a),o&&o.forEach((function(e){return e(n)})),t)return t(n)},f=setTimeout(u.bind(null,void 0,{type:"timeout",target:a}),12e4);a.onerror=u.bind(null,a.onerror),a.onload=u.bind(null,a.onload),l&&document.head.appendChild(a)}}}(),function(){n.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){n.p="/print-template-designer/"}(),function(){var e=function(e,t,n,i){var o=document.createElement("link");o.rel="stylesheet",o.type="text/css";var r=function(r){if(o.onerror=o.onload=null,"load"===r.type)n();else{var s=r&&("load"===r.type?"missing":r.type),a=r&&r.target&&r.target.href||t,l=new Error("Loading CSS chunk "+e+" failed.\n("+a+")");l.code="CSS_CHUNK_LOAD_FAILED",l.type=s,l.request=a,o.parentNode.removeChild(o),i(l)}};return o.onerror=o.onload=r,o.href=t,document.head.appendChild(o),o},t=function(e,t){for(var n=document.getElementsByTagName("link"),i=0;i<n.length;i++){var o=n[i],r=o.getAttribute("data-href")||o.getAttribute("href");if("stylesheet"===o.rel&&(r===e||r===t))return o}var s=document.getElementsByTagName("style");for(i=0;i<s.length;i++){o=s[i],r=o.getAttribute("data-href");if(r===e||r===t)return o}},i=function(i){return new Promise((function(o,r){var s=n.miniCssF(i),a=n.p+s;if(t(s,a))return o();e(i,a,o,r)}))},o={143:0};n.f.miniCss=function(e,t){var n={205:1,377:1,502:1,565:1,746:1,945:1};o[e]?t.push(o[e]):0!==o[e]&&n[e]&&t.push(o[e]=i(e).then((function(){o[e]=0}),(function(t){throw delete o[e],t})))}}(),function(){var e={143:0};n.f.j=function(t,i){var o=n.o(e,t)?e[t]:void 0;if(0!==o)if(o)i.push(o[2]);else{var r=new Promise((function(n,i){o=e[t]=[n,i]}));i.push(o[2]=r);var s=n.p+n.u(t),a=new Error,l=function(i){if(n.o(e,t)&&(o=e[t],0!==o&&(e[t]=void 0),o)){var r=i&&("load"===i.type?"missing":i.type),s=i&&i.target&&i.target.src;a.message="Loading chunk "+t+" failed.\n("+r+": "+s+")",a.name="ChunkLoadError",a.type=r,a.request=s,o[1](a)}};n.l(s,l,"chunk-"+t,t)}},n.O.j=function(t){return 0===e[t]};var t=function(t,i){var o,r,s=i[0],a=i[1],l=i[2],h=0;if(s.some((function(t){return 0!==e[t]}))){for(o in a)n.o(a,o)&&(n.m[o]=a[o]);if(l)var c=l(n)}for(t&&t(i);h<s.length;h++)r=s[h],n.o(e,r)&&e[r]&&e[r][0](),e[r]=0;return n.O(c)},i=self["webpackChunkprint_template_designer"]=self["webpackChunkprint_template_designer"]||[];i.forEach(t.bind(null,0)),i.push=t.bind(null,i.push.bind(i))}();var i=n.O(void 0,[998],(function(){return n(447)}));i=n.O(i)})();
//# sourceMappingURL=app.95e7c4b5.js.map