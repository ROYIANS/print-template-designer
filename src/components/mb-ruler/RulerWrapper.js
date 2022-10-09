import CanvasRuler from "./canvas-ruler/index.js";
import Line from "./Line.js";

export default {
  name: "RulerWrapper",
  data() {
    return {
      state: {
        isDraggingLine: false,
        showIndicator: false,
        value: 0,
        lines: this.lines,
      },
    };
  },
  props: {
    vertical: Boolean,
    scale: Number,
    width: Number,
    height: Number,
    start: Number,
    lines: {
      type: Array,
      default: () => {
        return [];
      },
    },
    selectStart: Number,
    selectLength: Number,
    canvasConfigs: Object,
    doLineChange: Function,
    doShowRightMenu: Function,
    isShowReferLine: Boolean,
    handleShowReferLine: Function,
  },
  methods: {
    setState(obj = {}) {
      for (let key of Object.keys(obj)) {
        this.$set(this.state, key, obj[key]);
      }
    },
    handleIndicatorShow(value) {
      !this.state.isDraggingLine &&
        this.setState({ showIndicator: true, value });
    },
    handleIndicatorMove(value) {
      this.state.showIndicator && this.setState({ value });
    },
    handleIndicatorHide() {
      this.setState({ showIndicator: false });
    },
    handleNewLine(value) {
      const { lines } = this.state;
      lines.push(value);
      this.setState({ lines: this.lines });
      this.doLineChange(lines, this.vertical);
      !this.isShowReferLine && this.handleShowReferLine();
    },
    handleLineDown() {
      this.setState({ isDraggingLine: true });
    },
    handleLineRelease(value, index) {
      const { lines } = this.state;
      this.setState({ isDraggingLine: false });
      // 左右或上下超出时, 删除该条对齐线
      const offset = value - this.start;
      const maxOffset = (this.vertical ? this.height : this.width) / this.scale;

      if (offset < 0 || offset > maxOffset) {
        this.handleLineRemove(index);
      } else {
        lines[index] = value;
        this.doLineChange(lines, this.vertical);
        this.setState({ lines: this.lines });
      }
    },
    handleLineRemove(index) {
      const { lines } = this.state;
      lines.splice(index, 1);
      this.doLineChange(lines, this.vertical);
      this.setState({ isDraggingLine: false });
    },
    // 展示右键菜单
    doHandleShowRightMenu(left, top) {
      this.doShowRightMenu(left, top, this.vertical);
    },
  },
  render() {
    const { showIndicator, value } = this.state;
    const className = this.vertical ? "v-container" : "h-container";

    const indicatorOffset = (value - this.start) * this.scale;
    const indicatorStyle = this.vertical
      ? { top: indicatorOffset }
      : { left: indicatorOffset };

    return (
      <div class={className}>
        <CanvasRuler
          vertical={this.vertical}
          scale={this.scale}
          width={this.width}
          height={this.height}
          start={this.start}
          selectStart={this.selectStart}
          selectLength={this.selectLength}
          canvasConfigs={this.canvasConfigs}
          doAddLine={this.handleNewLine}
          doIndicatorShow={this.handleIndicatorShow}
          doIndicatorMove={this.handleIndicatorMove}
          doIndicatorHide={this.handleIndicatorHide}
          doHandleShowRightMenu={this.doHandleShowRightMenu}
        />
        {this.isShowReferLine && (
          <div class="lines">
            {this.state.lines.map((v, i) => (
              <Line
                key={v + i}
                index={i}
                value={v >> 0}
                scale={this.scale}
                start={this.start}
                vertical={this.vertical}
                doRemove={this.handleLineRemove}
                doMouseDown={this.handleLineDown}
                doRelease={this.handleLineRelease}
              />
            ))}
          </div>
        )}
        {showIndicator && (
          <div class="indicator" style={indicatorStyle}>
            <span class="value">{value}</span>
          </div>
        )}
      </div>
    );
  },
};
