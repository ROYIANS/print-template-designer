import RulerWrapper from "./RulerWrapper.js";
import RulerContextMenu from "./RulerContextMenu.js";

import { StyledRuler } from "./styles.js";

const DEFAULTMENU = {
  bgColor: "#fff",
  dividerColor: "#DBDBDB",
  listItem: {
    textColor: "#415058",
    hoverTextColor: "#298DF8",
    disabledTextColor: "rgba(65, 80, 88, 0.4)",
    bgColor: "#fff",
    hoverBgColor: "#F2F2F2",
  },
};

export default {
  name: "MbRuler",
  data() {
    return {
      state: {
        isShowMenu: false,
        vertical: false,
        positionObj: {
          x: 0,
          y: 0,
        },
      },
    };
  },
  props: {
    scale: {
      type: Number,
      default: 1,
    },
    ratio: {
      type: Number,
      default: window.devicePixelRatio || 1,
    },
    thick: {
      type: Number,
      default: 16,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    startX: {
      type: Number,
      default: 0,
    },
    startY: {
      type: Number,
      default: 0,
    },
    shadow: {
      type: Object,
      default: () => {
        return {
          x: 200,
          y: 100,
          width: 200,
          height: 400,
        };
      },
    },
    horLineArr: {
      type: Array,
      default: () => {
        return [100, 200];
      },
    },
    verLineArr: {
      type: Array,
      default: () => {
        return [100, 200];
      },
    },
    handleLine: {
      type: Function,
      default: () => {},
    },
    cornerActive: {
      type: Boolean,
      default: false,
    },
    onCornerClick: {
      type: Function,
      default: () => {},
    },
    lang: {
      type: String,
      default: "zh-CN",
    },
    isOpenMenuFeature: {
      type: Boolean,
      default: true,
    },
    handleShowRuler: {
      type: Function,
      default: () => {},
    },
    isShowReferLine: {
      type: Boolean,
      default: true,
    },
    handleShowReferLine: {
      type: Function,
      default: () => {},
    },
    palette: {
      type: Object,
      default: () => {
        return {
          bgColor: "rgba(225,225,225, 0)", // ruler bg color
          longfgColor: "#BABBBC", // ruler longer mark color
          shortfgColor: "#C8CDD0", // ruler shorter mark color
          fontColor: "#7D8694", // ruler font color
          shadowColor: "#E8E8E8", // ruler shadow color
          lineColor: "#EB5648",
          borderColor: "#DADADC",
          cornerActiveColor: "rgb(235, 86, 72, 0.6)",
          menu: DEFAULTMENU,
        };
      },
    },
  },
  methods: {
    setState(obj = {}) {
      for (let key of Object.keys(obj)) {
        this.$set(this.state, key, obj[key]);
      }
    },
    handleLineChange(arr, vertical) {
      const newLines = vertical
        ? { h: this.horLineArr, v: [...arr] }
        : { h: [...arr], v: this.verLineArr };
      this.handleLine(newLines);
    },
    // 展示右键菜单
    doShowRightMenu(left, top, vertical) {
      this.setState({
        isShowMenu: true,
        vertical: vertical,
        positionObj: {
          x: left,
          y: top,
        },
      });
    },
    onhandlecloseMenu() {
      this.setState({ isShowMenu: false });
    },
    // 取消默认菜单事件
    preventDefault(e) {
      e.preventDefault();
    },
  },
  created() {
    const { ratio, palette } = {
      ratio: this.ratio,
      palette: this.palette,
    };
    const menu = palette.menu || DEFAULTMENU;
    this.canvasConfigs = {
      ratio,
      bgColor: palette.bgColor,
      longfgColor: palette.longfgColor,
      shortfgColor: palette.shortfgColor,
      fontColor: palette.fontColor,
      shadowColor: palette.shadowColor,
      lineColor: palette.lineColor,
      borderColor: palette.borderColor,
      cornerActiveColor: palette.cornerActiveColor,
    };
    this.menuConfigs = {
      bgColor: menu.bgColor,
      dividerColor: menu.dividerColor,
      listItem: menu.listItem,
    };
  },
  render() {
    const {
      width,
      height,
      scale,
      handleLine,
      thick,
      shadow,
      startX,
      startY,
      cornerActive,
      horLineArr,
      verLineArr,
      onCornerClick,
      palette: { bgColor },
      lang,
      isOpenMenuFeature,
      handleShowRuler,
      isShowReferLine,
      handleShowReferLine,
    } = this._props;

    const { positionObj, vertical, isShowMenu } = this.state;

    const { x, y, width: w, height: shadowH } = shadow;

    const menuPosition = {
      left: positionObj.x,
      top: positionObj.y,
    };

    return (
      <StyledRuler
        id="mb-ruler"
        className="mb-ruler"
        isShowReferLine={isShowReferLine}
        thick={thick}
        ratio={this.canvasConfigs.ratio}
        bgColor={this.canvasConfigs.bgColor}
        longfgColor={this.canvasConfigs.longfgColor}
        shortfgColor={this.canvasConfigs.shortfgColor}
        fontColor={this.canvasConfigs.fontColor}
        shadowColor={this.canvasConfigs.shadowColor}
        lineColor={this.canvasConfigs.lineColor}
        borderColor={this.canvasConfigs.borderColor}
        cornerActiveColor={this.canvasConfigs.cornerActiveColor}
        onContextMenu={this.preventDefault}
      >
        {/* 水平方向 */}
        <RulerWrapper
          width={width}
          height={thick}
          start={startX}
          lines={horLineArr}
          selectStart={x}
          selectLength={w}
          scale={scale}
          canvasConfigs={this.canvasConfigs}
          doLineChange={this.handleLineChange}
          doShowRightMenu={this.doShowRightMenu}
          isShowReferLine={isShowReferLine}
          handleShowReferLine={handleShowReferLine}
        />
        {/* 竖直方向 */}
        <RulerWrapper
          width={thick}
          height={height}
          start={startY}
          lines={verLineArr}
          selectStart={y}
          selectLength={shadowH}
          vertical
          scale={scale}
          canvasConfigs={this.canvasConfigs}
          doLineChange={this.handleLineChange}
          doShowRightMenu={this.doShowRightMenu}
          isShowReferLine={isShowReferLine}
          handleShowReferLine={handleShowReferLine}
        />
        <a
          className={`corner${cornerActive ? " active" : ""}`}
          style={{ backgroundColor: bgColor }}
          onClick={onCornerClick}
        />
        {isOpenMenuFeature && isShowMenu && (
          <RulerContextMenu
            key={String(menuPosition.left) + String(menuPosition.top)}
            lang={lang}
            vertical={vertical}
            handleLine={handleLine}
            horLineArr={horLineArr}
            verLineArr={verLineArr}
            menuPosition={menuPosition}
            handleShowRuler={handleShowRuler}
            isShowReferLine={isShowReferLine}
            handleShowReferLine={handleShowReferLine}
            oncloseMenu={this.onhandlecloseMenu}
            menuConfigs={this.menuConfigs}
          />
        )}
      </StyledRuler>
    );
  },
};
