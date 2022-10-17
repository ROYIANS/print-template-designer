<!--
* @description 顶部工具栏
* @filename ToolBar.vue
* @author ROYIANS
* @date 2022/9/16 10:40
!-->
<template>
  <el-header :height="'45px'" class="roy-designer-main__toolbar">
    <section class="roy-designer-main__toolbar_left">
      <el-tooltip
        v-for="(tool, index) in toolbarLeftConfig"
        :key="index"
        :content="tool.name"
        :open-delay="600"
        :visible-arrow="false"
        effect="dark"
        placement="bottom"
      >
        <div class="roy-designer-main__toolbar__item" @click="tool.event">
          <i :class="tool.icon"></i>
        </div>
      </el-tooltip>
    </section>
    <section>
      <slot name="roy-designer-toolbar-slot"></slot>
    </section>
    <section class="roy-designer-main__toolbar_right">
      <div class="roy-designer-main__toolbar__setting">
        <span>{{ rectWidth }}/{{ rectHeight }}</span>
      </div>
      <div class="roy-designer-main__toolbar__zoom">
        <div
          class="roy-designer-main__toolbar__item"
          @click.stop.prevent="smallerScale"
        >
          <i class="ri-zoom-out-line"></i>
        </div>
        <span>{{ scale100 }}%</span>
        <div
          class="roy-designer-main__toolbar__item"
          @click.stop.prevent="biggerScale"
        >
          <i class="ri-zoom-in-line"></i>
        </div>
      </div>
    </section>
  </el-header>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";
import { mapActions, mapState } from "vuex";
import Big from "big.js";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import toast from "@/utils/toast";

/**
 * 顶部工具栏
 */
export default {
  name: "ToolBar",
  mixins: [commonMixin],
  components: {},
  props: {},
  data() {
    return {
      toolbarLeftConfig: [
        {
          name: "撤销",
          icon: "ri-arrow-go-back-fill",
          event: () => {
            toast("撤销");
          },
        },
        {
          name: "恢复",
          icon: "ri-arrow-go-forward-fill",
          event: () => {
            toast("恢复");
          },
        },
        {
          name: "显示/隐藏标尺",
          icon: "ri-ruler-2-line",
          event: () => {
            this.toggleRuler();
          },
        },
        {
          name: "锁定",
          icon: "ri-lock-2-line",
          event: () => {
            toast("锁定");
            html2canvas(document.querySelector("#designer-page"), {
              scale: "5",
            }).then((canvas) => {
              let doc = new jsPDF();
              doc.addImage(
                canvas.toDataURL("image/jpeg"),
                "JPEG",
                0,
                0,
                210,
                297
              );
              doc.save("a4.pdf");
            });
          },
        },
        {
          name: "组合/拆分",
          icon: "ri-collage-line",
          event: () => {
            toast("组合/拆分");
          },
        },
        {
          name: "切换纸张方向",
          icon: "ri-clockwise-line",
          event: () => {
            this.rotatePage();
          },
        },
      ],
    };
  },
  computed: {
    ...mapState({
      scale: (state) => state.printTemplateModule.rulerThings.scale,
      rectWidth: (state) => state.printTemplateModule.rulerThings.rectWidth,
      rectHeight: (state) => state.printTemplateModule.rulerThings.rectHeight,
    }),
    scale100() {
      let currentScale = new Big(this.scale).div(new Big(5));
      let num100 = new Big(100);
      return currentScale.mul(num100).toNumber();
    },
  },
  methods: {
    ...mapActions({
      setBiggerScale: "printTemplateModule/rulerThings/setBiggerScale",
      setSmallerScale: "printTemplateModule/rulerThings/setSmallerScale",
      reDrawRuler: "printTemplateModule/rulerThings/reDrawRuler",
      setRect: "printTemplateModule/rulerThings/setRect",
      rotateRect: "printTemplateModule/rulerThings/rotateRect",
      toggleRuler: "printTemplateModule/rulerThings/toggleRuler",
    }),
    smallerScale() {
      this.setSmallerScale();
      this.reDrawRuler();
    },
    biggerScale() {
      this.setBiggerScale();
      this.reDrawRuler();
    },
    rotatePage() {
      this.rotateRect();
      this.reDrawRuler();
    },
    initMounted() {},
  },
  created() {},
  mounted() {
    this.initMounted();
  },
  watch: {},
};
</script>

<style lang="scss" scoped>
.roy-designer-main__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .roy-designer-main__toolbar_left {
    display: flex;
    justify-content: flex-start;
    .roy-designer-main__toolbar__divide {
      width: 1px;
      height: 18px;
      padding: 0 2px;
      border-right: 1px solid var(--roy-border-color-dark);
    }
  }

  .roy-designer-main__toolbar_right {
    display: flex;
    justify-content: flex-end;
    .roy-designer-main__toolbar__zoom,
    .roy-designer-main__toolbar__setting {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      position: relative;
      span {
        padding: 0 10px;
      }
    }
  }

  .roy-designer-main__toolbar__item {
    cursor: pointer;
    background: var(--roy-bg-color);
    display: grid;
    width: 18px;
    height: 18px;
    font-size: 10px;
    line-height: 18px;
    box-shadow: rgba(99, 99, 99, 0.2) 0 2px 8px 0;
    padding: 4px;
    text-align: center;
    border-radius: 4px;

    & + .roy-designer-main__toolbar__item {
      margin-left: 5px;
    }

    &:hover {
      background: var(--roy-bg-color-page);
    }

    &:active {
      color: var(--roy-color-primary);
      box-shadow: rgba(99, 99, 99, 0.4) 0 2px 8px 0;
    }

    i {
      padding: 0;
      margin: 0;
      font-size: 14px;
    }
  }
}
</style>
