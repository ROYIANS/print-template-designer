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
      <strong>这是模板名称位置</strong>
    </section>
    <section class="roy-designer-main__toolbar_right">
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
      <div class="roy-designer-main__toolbar__setting">
        <span>{{ rectWidth }}/{{ rectHeight }}</span>
        <div class="roy-designer-main__toolbar__item" @click="showPagerConfig">
          <i class="ri-settings-2-line"></i>
        </div>
        <div class="roy-designer-main__toolbar__item" @click="rotatePage">
          <i class="ri-clockwise-line"></i>
        </div>
        <div v-show="showPager" class="roy-designer-main__toolbar__pages">
          <el-row>
            <el-col :span="6">纸张大小:</el-col>
            <el-col :span="18">
              <div class="roy-designer-main__toolbar__pages__container">
                <div
                  v-for="page in Object.values(pages)"
                  :key="page.name"
                  class="roy-designer-main__toolbar__pages__item"
                  :class="
                    currentPage === page.name
                      ? 'roy-designer-main__toolbar__pages__item--active'
                      : ''
                  "
                  @click="currentPage = page.name"
                >
                  {{ page.name }}
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </section>
  </el-header>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";
import { mapActions, mapState } from "vuex";
import Big from "big.js";

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
      showPager: false,
      toolbarLeftConfig: [
        {
          name: "撤销",
          icon: "ri-arrow-go-back-fill",
          event: () => {
            alert("撤销");
          },
        },
        {
          name: "恢复",
          icon: "ri-arrow-go-forward-fill",
          event: () => {},
        },
        {
          name: "预览",
          icon: "ri-eye-2-fill",
          event: () => {},
        },
        {
          name: "保存",
          icon: "ri-save-2-fill",
          event: () => {},
        },
        {
          name: "锁定",
          icon: "ri-lock-2-line",
          event: () => {},
        },
        {
          name: "组合/拆分",
          icon: "ri-collage-line",
          event: () => {},
        },
      ],
      pages: {
        A3: {
          name: "A3",
          w: 297,
          h: 420,
        },
        A4: {
          name: "A4",
          w: 210,
          h: 297,
        },
        B5: {
          name: "B5",
          w: 176,
          h: 250,
        },
      },
      currentPage: "A4",
    };
  },
  computed: {
    ...mapState({
      scale: (state) => state.printTemplateModule.rulerThings.scale,
      rectWidth: (state) => state.printTemplateModule.rulerThings.rectWidth,
      rectHeight: (state) => state.printTemplateModule.rulerThings.rectHeight,
    }),
    scale100() {
      let currentScale = new Big(this.scale);
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
    }),
    smallerScale() {
      this.setSmallerScale();
      this.reDrawRuler();
    },
    biggerScale() {
      this.setBiggerScale();
      this.reDrawRuler();
    },
    showPagerConfig() {
      this.showPager = !this.showPager;
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
  watch: {
    currentPage(newVal) {
      let page = this.pages[newVal];
      this.setRect(page);
      this.reDrawRuler();
    },
  },
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
      .roy-designer-main__toolbar__pages {
        position: absolute;
        background: var(--roy-bg-color);
        top: 30px;
        right: 0;
        width: 300px;
        padding: 20px;
        z-index: 1000;
        box-shadow: rgba(99, 99, 99, 0.2) 0 2px 8px 0;
        .roy-designer-main__toolbar__pages__container {
          display: flex;
          flex-flow: row wrap;
          place-content: flex-start;
        }
        .roy-designer-main__toolbar__pages__item {
          width: 40px;
          height: 50px;
          font-size: 16px;
          line-height: 50px;
          text-align: center;
          border: 1px solid #ccc;
          user-select: none;
          cursor: pointer;
          &:hover {
            border: 1px solid #4579e1;
            background: var(--prism-background);
          }
          & + .roy-designer-main__toolbar__pages__item {
            margin-left: 5px;
          }
          &.roy-designer-main__toolbar__pages__item--active {
            border: 1px solid #4579e1;
            color: #4579e1;
          }
        }
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

    i {
      padding: 0;
      margin: 0;
      font-size: 14px;
    }
  }
}
</style>
