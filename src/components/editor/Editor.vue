<template>
  <div class="roy-designer-main__page">
    <SketchRuler
      ref="sketchRuler"
      :lang="lang"
      :thick="thick"
      :scale="scale"
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
        <div id="designer-page" :style="canvasStyle">
          <div>测试页面</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import SketchRuler from "vue-sketch-ruler";
import CONSTANT from "@/utils/constant.js";
import { mapState, mapActions } from "vuex";

const { MIN_SCALE, MAX_SCALE } = CONSTANT;

export default {
  name: "RoyEditor",
  data() {
    return {
      rulerWidth: 0,
      rulerHeight: 0,
      startX: -19,
      startY: -19,
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
    };
  },
  components: {
    SketchRuler,
  },
  computed: {
    ...mapState({
      scale: (state) => state.printTemplateModule.rulerThings.scale,
      rectWidth: (state) => state.printTemplateModule.rulerThings.rectWidth,
      rectHeight: (state) => state.printTemplateModule.rulerThings.rectHeight,
      needReDrawRuler: (state) =>
        state.printTemplateModule.rulerThings.needReDrawRuler,
    }),
    shadow() {
      return {
        x: 0,
        y: 0,
        width: this.rectWidth * 5,
        height: this.rectHeight * 5,
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
  },
  methods: {
    ...mapActions({
      reDrawRuler: "printTemplateModule/rulerThings/reDrawRuler",
      setScale: "printTemplateModule/rulerThings/setScale",
    }),
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
        (screensRect.left + this.thick - canvasRect.left) / this.scale;
      const startY =
        (screensRect.top + this.thick - canvasRect.top) / this.scale;

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
      this.$refs.containerRef.getBoundingClientRect().width / 2 - 300; // 300 = #screens.width / 2
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
  width: calc(100vw - 330px);
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
    top: 40px;
    transform-origin: 50% 0;
    margin-left: -80px;
    left: 50%;
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
