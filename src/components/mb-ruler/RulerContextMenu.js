import Teleport from "./Teleport.vue";
import { i18nObj } from "./constant.js";
import { StyleMenu } from "./styles.js";

export default {
  name: "RulerContextMenu",
  data() {
    return {
      state: {},
      el: null,
    };
  },
  props: {
    vertical: Boolean,
    menuPosition: Object,
    handleShowRuler: Function,
    isShowReferLine: Boolean,
    handleShowReferLine: Function,
    horLineArr: Array,
    verLineArr: Array,
    handleLine: Function,
    oncloseMenu: Function,
    lang: String,
    menuConfigs: Object,
  },
  created() {
    this.el = document.createElement("div");
  },
  mounted() {
    document.body.appendChild(this.el);
    document.addEventListener("click", this.closeMenu);
    document.addEventListener("mousedown", this.closeMenuMouse);
  },
  destroyed() {
    document.removeEventListener("mousedown", this.closeMenuMouse);
    document.removeEventListener("click", this.closeMenu);
    document.body.removeChild(this.el);
  },
  // click事件只响应左键，menu里的每部分的点击事件使用的是click，
  // 所以mousedown只能响应右键，否则内部点击事件失效
  closeMenu() {
    this.oncloseMenu();
  },
  closeMenuMouse(e) {
    if (e.button !== 2) return;
    this.closeMenu();
  },
  // 显示/影藏 ruler
  onhandleShowRuler() {
    this.handleShowRuler();
  },
  // 显示/影藏 参考线
  onhandleShowReferLine() {
    this.handleShowReferLine();
  },
  // 删除横向/纵向参考线
  onhandleShowSpecificRuler() {
    const newLines = this.vertical
      ? { h: this.horLineArr, v: [] }
      : { h: [], v: this.verLineArr };
    this.handleLine(newLines);
    this.closeMenu();
  },
  render() {
    const { left, top } = this.menuPosition;
    const isDisabled = this.vertical
      ? !this.verLineArr.length
      : !this.horLineArr.length;
    const SELECT_SVG = (
      <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1 5.066c0 .211.07.39.212.538L3.346 7.78A.699.699 0 0 0 3.872 8a.69.69 0 0 0 .517-.221l4.39-4.49A.731.731 0 0 0 9 2.753a.717.717 0 0 0-.22-.532A.714.714 0 0 0 8.255 2a.714.714 0 0 0-.524.221l-3.86 3.955L2.26 4.528a.714.714 0 0 0-.524-.221.714.714 0 0 0-.524.221.749.749 0 0 0-.212.538z"
          fill="#415058"
          fillRule="evenodd"
        />
      </svg>
    );

    return (
      <Teleport to={this.el}>
        <StyleMenu
          style={{ left: left, top: top }}
          showReferLine={this.isShowReferLine}
          lang={this.lang}
          menuConfigs={this.menuConfigs}
          id="contextMenu"
        >
          <a class="menu-content" onClick={this.onhandleShowRuler}>
            {i18nObj[this.lang].show_ruler}
            {SELECT_SVG}
          </a>
          <a class="menu-content" onClick={this.onhandleShowReferLine}>
            {i18nObj[this.lang].show_refer_line}
            {this.isShowReferLine && SELECT_SVG}
          </a>
          <div class="divider" />
          <a
            class={`menu-content${isDisabled ? " disabled" : ""}`}
            onClick={this.onhandleShowSpecificRuler}
          >
            {i18nObj[this.lang].remove_all}
            {this.vertical
              ? i18nObj[this.lang].horizontal
              : i18nObj[this.lang].vertical}
            {i18nObj[this.lang].refer_line}
          </a>
        </StyleMenu>
      </Teleport>
    );
  },
};
