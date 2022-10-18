<template>
  <div class="roy-designer-main__page" :style="panelWidth">
    <SketchRuler
      ref="sketchRuler"
      v-show="showRuler"
      :lang="lang"
      :thick="thick"
      :scale="realScale"
      :width="rulerWidth"
      :height="rulerHeight"
      :startX="startX"
      :startY="startY"
      :shadow="shadow"
      :horLineArr="lines.h"
      :verLineArr="lines.v"
      :cornerActive="false"
      :palette="palette"
      @handleLine="handleLine"
      @onCornerClick="handleCornerClick"
    >
    </SketchRuler>
    <div
      ref="screensRef"
      id="screens"
      @wheel="handleWheel"
      @scroll="handleScroll"
    >
      <div ref="containerRef" class="screen-container">
        <div
          v-contextmenu="'contextmenu'"
          id="designer-page"
          :style="canvasStyle"
          @mousedown="handleMouseDown"
          @contextmenu="doing"
        >
          <ComponentAdjuster
            v-for="(item, index) in componentData"
            :key="item.id"
            :style="getShapeStyle(item.style)"
            :default-style="item.style"
            :active="item.id === (curComponent || {}).id"
            :element="item"
            :index="index"
            :class="{ lock: item.isLock }"
          >
            <component
              :is="item.component"
              :id="'roy-component-' + item.id"
              :prop-value="item.propValue"
              :element="item"
            />
          </ComponentAdjuster>
        </div>
      </div>
    </div>
    <Context ref="contextmenu" :theme="contextTheme">
      <ContextItem @click="doing">
        <i class="ri-list-settings-line"></i>
        <span>属性</span>
      </ContextItem>
      <ContextItem @click="doing">
        <i class="ri-file-copy-line"></i>
        <span>复制</span>
      </ContextItem>
      <ContextItem @click="doing">
        <i class="ri-clipboard-line"></i>
        <span>粘贴</span>
      </ContextItem>
      <ContextItem @click="doing">
        <i class="ri-scissors-cut-line"></i>
        <span>剪切</span>
      </ContextItem>
      <ContextItem @click="doing">
        <i class="ri-delete-bin-line"></i>
        <span>删除</span>
      </ContextItem>
      <ContextItem @click="doing">
        <i class="ri-lock-line"></i>
        <span>锁定</span>
      </ContextItem>
      <ContextItem @click="doing">
        <i class="ri-lock-unlock-line"></i>
        <span>解锁</span>
      </ContextItem>
      <ContextItem @click="doing">
        <i class="ri-align-top"></i>
        <span>置顶</span>
      </ContextItem>
      <ContextItem @click="doing">
        <i class="ri-align-bottom"></i>
        <span>置底</span>
      </ContextItem>
      <ContextItem @click="doing">
        <i class="ri-arrow-up-line"></i>
        <span>上移</span>
      </ContextItem>
      <ContextItem @click="doing">
        <i class="ri-arrow-down-line"></i>
        <span>下移</span>
      </ContextItem>
    </Context>
  </div>
</template>
<script>
import SketchRuler from "vue-sketch-ruler";
import CONSTANT from "@/utils/constant.js";
import { mapState, mapActions } from "vuex";
import { directive, Context, ContextItem } from "@/components/RoyContext";
import ComponentAdjuster from "@/components/Editor/ComponentAdjuster";
import { getShapeStyle, getComponentRotatedStyle } from "@/utils/style-util.js";
import Big from "big.js";
import toast from "@/utils/toast";
import RoyText from "@/components/PageComponents/RoyText";
import commonMixin from "@/mixin/commonMixin";
import { $, isPreventDrop } from "@/utils/html-util.js";

const { MIN_SCALE, MAX_SCALE } = CONSTANT;

export default {
  name: "RoyEditor",
  directives: {
    contextmenu: directive,
  },
  mixins: [commonMixin],
  components: {
    SketchRuler,
    Context,
    ContextItem,
    ComponentAdjuster,
    RoyText,
  },
  props: {
    showRight: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      rulerWidth: 0,
      rulerHeight: 0,
      startX: -19,
      startY: -25,
      lines: {
        h: [],
        v: [],
      },
      thick: 20,
      lang: "zh-CN", // 中英文
      isShowRuler: true, // 显示标尺
      isShowReferLine: true, // 显示参考线
      palette: {
        bgColor: "rgba(225,225,225, 0)",
        longfgColor: "#BABBBC",
        shortfgColor: "#C8CDD0",
        fontColor: "#7D8694",
        shadowColor: "#E8E8E8",
        lineColor: "#4579e1",
        borderColor: "#DADADC",
        cornerActiveColor: "#4579e1",
      },
      editorX: 0,
      editorY: 0,
      start: {
        // 选中区域的起点
        x: 0,
        y: 0,
      },
      width: 0,
      height: 0,
      isShowArea: false,
      svgFilterAttrs: ["width", "height", "top", "left", "rotate"],
    };
  },
  computed: {
    ...mapState({
      realScale: (state) => state.printTemplateModule.rulerThings.scale,
      rectWidth: (state) => state.printTemplateModule.rulerThings.rectWidth,
      rectHeight: (state) => state.printTemplateModule.rulerThings.rectHeight,
      needReDrawRuler: (state) =>
        state.printTemplateModule.rulerThings.needReDrawRuler,
      showRuler: (state) => state.printTemplateModule.rulerThings.showRuler,
      componentData: (state) => state.printTemplateModule.componentData,
      curComponent: (state) => state.printTemplateModule.curComponent,
      editor: (state) => state.printTemplateModule.editor,
    }),
    contextTheme() {
      return this.isNightMode ? "dark" : "default";
    },
    scale() {
      return new Big(this.realScale).div(new Big(5));
    },
    shadow() {
      return {
        x: 0,
        y: 0,
        width: this.rectWidth,
        height: this.rectHeight,
      };
    },
    canvasStyle() {
      return {
        width: `${this.rectWidth * 5}px`,
        height: `${this.rectHeight * 5}px`,
        transform: `scale(${this.scale})`,
      };
    },
    isNightMode() {
      return this.$store.state.printTemplateModule.nightMode.isNightMode;
    },
    panelWidth() {
      return this.showRight
        ? "width: calc(100vw - 330px);"
        : "width: calc(100vw - 95px);";
    },
  },
  methods: {
    ...mapActions({
      reDrawRuler: "printTemplateModule/rulerThings/reDrawRuler",
      setScale: "printTemplateModule/rulerThings/setScale",
    }),
    getShapeStyle,
    handleMouseDown(e) {
      // 如果没有选中组件 在画布上点击时需要调用 e.preventDefault() 防止触发 drop 事件
      if (!this.curComponent || isPreventDrop(this.curComponent.component)) {
        e.preventDefault();
      }

      this.hideArea();

      // 获取编辑器的位移信息，每次点击时都需要获取一次。主要是为了方便开发时调试用。
      const rectInfo = this.editor.getBoundingClientRect();
      this.editorX = rectInfo.x;
      this.editorY = rectInfo.y;

      const startX = e.clientX;
      const startY = e.clientY;
      this.start.x = startX - this.editorX;
      this.start.y = startY - this.editorY;
      // 展示选中区域
      this.isShowArea = true;

      const move = (moveEvent) => {
        this.width = Math.abs(moveEvent.clientX - startX);
        this.height = Math.abs(moveEvent.clientY - startY);
        if (moveEvent.clientX < startX) {
          this.start.x = moveEvent.clientX - this.editorX;
        }

        if (moveEvent.clientY < startY) {
          this.start.y = moveEvent.clientY - this.editorY;
        }
      };

      const up = (e) => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);

        if (e.clientX === startX && e.clientY === startY) {
          this.hideArea();
          return;
        }

        this.createGroup();
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    },
    doing() {
      toast("正在制作中...");
    },
    hideArea() {
      this.isShowArea = 0;
      this.width = 0;
      this.height = 0;

      this.$store.commit("printTemplateModule/setAreaData", {
        style: {
          left: 0,
          top: 0,
          width: 0,
          height: 0,
        },
        components: [],
      });
    },
    createGroup() {
      // 获取选中区域的组件数据
      const areaData = this.getSelectArea();
      if (areaData.length <= 1) {
        this.hideArea();
        return;
      }

      // 根据选中区域和区域中每个组件的位移信息来创建 Group 组件
      // 要遍历选择区域的每个组件，获取它们的 left top right bottom 信息来进行比较
      let top = Infinity,
        left = Infinity;
      let right = -Infinity,
        bottom = -Infinity;
      areaData.forEach((component) => {
        let style = {};
        if (component.component === "Group") {
          component.propValue.forEach((item) => {
            const rectInfo = $(
              `#roy-component-${item.id}`
            ).getBoundingClientRect();
            style.left = rectInfo.left - this.editorX;
            style.top = rectInfo.top - this.editorY;
            style.right = rectInfo.right - this.editorX;
            style.bottom = rectInfo.bottom - this.editorY;

            if (style.left < left) left = style.left;
            if (style.top < top) top = style.top;
            if (style.right > right) right = style.right;
            if (style.bottom > bottom) bottom = style.bottom;
          });
        } else {
          style = getComponentRotatedStyle(component.style);
        }

        if (style.left < left) left = style.left;
        if (style.top < top) top = style.top;
        if (style.right > right) right = style.right;
        if (style.bottom > bottom) bottom = style.bottom;
      });

      this.start.x = left;
      this.start.y = top;
      this.width = right - left;
      this.height = bottom - top;

      // 设置选中区域位移大小信息和区域内的组件数据
      this.$store.commit("printTemplateModule/setAreaData", {
        style: {
          left,
          top,
          width: this.width,
          height: this.height,
        },
        components: areaData,
      });
    },
    getSelectArea() {
      const result = [];
      // 区域起点坐标
      const { x, y } = this.start;
      // 计算所有的组件数据，判断是否在选中区域内
      this.componentData.forEach((component) => {
        if (component.isLock) return;

        const { left, top, width, height } = getComponentRotatedStyle(
          component.style
        );
        if (
          x <= left &&
          y <= top &&
          left + width <= x + this.width &&
          top + height <= y + this.height
        ) {
          result.push(component);
        }
      });

      // 返回在选中区域内的所有组件
      return result;
    },
    handleLine(lines) {
      this.lines = lines;
    },
    handleCornerClick() {},
    handleScroll() {
      const screensRect = document
        .querySelector("#screens")
        .getBoundingClientRect();
      const canvasRect = document
        .querySelector("#designer-page")
        .getBoundingClientRect();
      // 标尺开始的刻度
      const startX =
        (screensRect.left + this.thick - canvasRect.left) / this.realScale;
      const startY =
        (screensRect.top + this.thick - canvasRect.top) / this.realScale;

      this.startX = startX;
      this.startY = startY;
    },
    // 控制缩放值
    handleWheel(e) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const nextScale = parseFloat(
          Math.max(0.2, this.scale - e.deltaY / 500).toFixed(2)
        );
        if (nextScale <= MAX_SCALE && nextScale >= MIN_SCALE) {
          this.setScale(nextScale);
        }
      }
      this.$nextTick(() => {
        this.handleScroll();
      });
    },
  },
  mounted() {
    this.rulerWidth = this.$el.offsetWidth;
    this.rulerHeight = this.$el.offsetHeight;
    this.$refs.screensRef.scrollLeft =
      this.$refs.containerRef.getBoundingClientRect().width / 2 -
      this.rectWidth;
    // 获取编辑器元素
    this.$store.commit("printTemplateModule/getEditor");
  },
  watch: {
    isNightMode: {
      handler(newVal) {
        this.palette = {
          bgColor: "rgba(225,225,225, 0)",
          longfgColor: "#BABBBC",
          shortfgColor: "#C8CDD0",
          fontColor: "#7D8694",
          shadowColor: newVal ? "#444444" : "#E8E8E8",
          lineColor: "#4579e1",
          borderColor: newVal ? "#636466" : "#DADADC",
          cornerActiveColor: "#4579e1",
        };
        this.reDrawRuler();
      },
    },
    showRight: {
      handler() {
        this.$nextTick(() => {
          this.rulerWidth = this.$el.offsetWidth;
          this.rulerHeight = this.$el.offsetHeight;
          this.$refs.screensRef.scrollLeft =
            this.$refs.containerRef.getBoundingClientRect().width / 2 -
            this.rectWidth;
          this.reDrawRuler();
        });
      },
    },
    needReDrawRuler: {
      handler() {
        this.$nextTick(() => {
          this.handleScroll();
          this.$refs.sketchRuler?.$children[0]?.$children[0]?.drawRuler();
          this.$refs.sketchRuler?.$children[1]?.$children[0]?.drawRuler();
        });
      },
    },
  },
};
</script>
<style lang="scss">
#screens {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: auto;
}
.screen-container {
  position: absolute;
  width: 5000px;
  height: 5000px;
}
.roy-designer-main__page {
  position: absolute;
  height: calc(100% - 100px);
  border: 1px solid var(--roy-border-color);
  padding: 0 !important;
  margin: 0;
  background-color: rgb(255, 255, 255);
  background-image: linear-gradient(
      45deg,
      rgb(247, 247, 247) 25%,
      transparent 25%
    ),
    linear-gradient(-45deg, rgb(247, 247, 247) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgb(247, 247, 247) 75%),
    linear-gradient(-45deg, transparent 75%, rgb(247, 247, 247) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  #designer-page {
    background: var(--roy-bg-color);
    box-shadow: rgba(0, 0, 0, 0.12) 0 1px 3px, rgba(0, 0, 0, 0.24) 0 1px 2px;
    position: absolute;
    top: 60px;
    transform-origin: 50% 0;
    margin-left: -80px;
    left: 50%;
    .lock {
      opacity: 0.5;

      &:hover {
        cursor: not-allowed;
      }
    }
  }
}
#roy-print-template-designer[theme="dark"] {
  .roy-designer-main__page {
    background-color: #1c1c1c;
    background-image: linear-gradient(45deg, #212121 25%, transparent 25%),
      linear-gradient(-45deg, #232323 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #232323 75%),
      linear-gradient(-45deg, transparent 75%, #232323 75%);
  }
}
</style>
