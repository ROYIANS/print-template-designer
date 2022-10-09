import { drawHorizontalRuler, drawVerticalRuler } from "./utils";

const getValueByOffset = (offset, start, scale) =>
  Math.round(start + offset / scale);

export default {
  name: "CanvasRuler",
  data() {
    return {};
  },
  props: {
    vertical: Boolean,
    start: Number,
    scale: Number,
    width: Number,
    height: Number,
    canvasConfigs: Object,
    selectStart: Number,
    selectLength: Number,
    doAddLine: Function,
    doIndicatorShow: Function,
    doIndicatorMove: Function,
    doIndicatorHide: Function,
    doHandleShowRightMenu: Function,
  },
  methods: {
    drawRuler() {
      const options = {
        scale: this.scale,
        width: this.width,
        height: this.height,
        canvasConfigs: this.canvasConfigs,
      };
      if (this.vertical) {
        drawVerticalRuler(
          this.$refs.canvas.getContext("2d"),
          this.start,
          { y: this.selectStart, height: this.selectLength },
          options
        );
      } else {
        drawHorizontalRuler(
          this.$refs.canvas.getContext("2d"),
          this.start,
          { x: this.selectStart, width: this.selectLength },
          options
        );
      }
    },
    updateCanvasContext() {
      const { ratio } = this.canvasConfigs;
      // 比例宽高
      this.$refs.canvas.width = this.width * ratio;
      this.$refs.canvas.height = this.height * ratio;

      const ctx = this.$refs.canvas.getContext("2d");
      ctx.font = `${
        12 * ratio
      }px -apple-system, "Helvetica Neue", ".SFNSText-Regular", "SF UI Text", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Zen Hei", sans-serif`;
      ctx.lineWidth = 1;
      ctx.textBaseline = "middle";
    },
    handleClick(e) {
      const offset = this.vertical ? e.offsetY : e.offsetX;
      this.doAddLine(getValueByOffset(offset, this.start, this.scale));
    },
    handleEnter(e) {
      const offset = this.vertical ? e.offsetY : e.offsetX;
      this.doIndicatorShow(getValueByOffset(offset, this.start, this.scale));
    },
    handleMove(e) {
      const offset = this.vertical ? e.offsetY : e.offsetX;
      this.doIndicatorMove(getValueByOffset(offset, this.start, this.scale));
    },
    handleLeave() {
      this.doIndicatorHide();
    },
    handleRightMenu(e) {
      e.stopPropagation();
      if (e.button === 2) {
        const clickLeft = e.clientX;
        const clickTop = e.clientY;
        this.doHandleShowRightMenu(clickLeft, clickTop);
      }
    },
  },
  mounted() {
    debugger;
    this.updateCanvasContext();
    this.drawRuler();
  },
  watch: {
    width(newval, oldval) {
      debugger;
      if (newval !== oldval) {
        this.updateCanvasContext();
      }
      this.drawRuler();
    },
    height(newval, oldval) {
      debugger;
      if (newval !== oldval) {
        this.updateCanvasContext();
      }
      this.drawRuler();
    },
  },
  render(h) {
    return h("canvas", {
      props: {},
      on: {
        click: this.handleClick,
        mouseEnter: this.handleEnter,
        mouseDown: this.handleRightMenu,
        mouseMove: this.handleMove,
        mouseLeave: this.handleLeave,
      },
      ref: "canvas",
      class: "ruler",
    });
  },
};
