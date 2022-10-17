<!--
* @description 全局设置
* @filename GlobalSetting.vue
* @author ROYIANS
* @date 2022/9/26 15:11
!-->
<template>
  <el-main class="roy-designer-global">
    <el-row class="roy-designer-global__pages">
      <el-col :span="24" class="roy-designer-global__title">模板名称:</el-col>
      <el-col :span="24"> 新建模板 </el-col>
    </el-row>
    <el-row class="roy-designer-global__pages">
      <el-col :span="24" class="roy-designer-global__title">纸张大小:</el-col>
      <el-col :span="24">
        <div class="roy-designer-global__pages__container">
          <div
            v-for="page in Object.values(pages)"
            :key="page.name"
            class="roy-designer-global__pages__item"
            :class="
              currentPage === page.name
                ? 'roy-designer-global__pages__item--active'
                : ''
            "
            @click="currentPage = page.name"
          >
            {{ page.name }}
          </div>
        </div>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";
import { mapActions } from "vuex";

/**
 * GlobalSetting
 */
export default {
  name: "GlobalSetting",
  mixins: [commonMixin],
  components: {},
  props: {},
  data() {
    return {
      pages: {
        A1: {
          name: "A1",
          w: 594,
          h: 841,
        },
        A2: {
          name: "A2",
          w: 420,
          h: 594,
        },
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
        A5: {
          name: "A5",
          w: 148,
          h: 210,
        },
        A6: {
          name: "A6",
          w: 105,
          h: 148,
        },
        A7: {
          name: "A7",
          w: 74,
          h: 105,
        },
        B1: {
          name: "B1",
          w: 707,
          h: 1000,
        },
        B2: {
          name: "B2",
          w: 500,
          h: 707,
        },
        B3: {
          name: "B3",
          w: 353,
          h: 500,
        },
        B4: {
          name: "B4",
          w: 250,
          h: 353,
        },
        B5: {
          name: "B5",
          w: 176,
          h: 250,
        },
        B6: {
          name: "B6",
          w: 125,
          h: 176,
        },
        B7: {
          name: "B7",
          w: 88,
          h: 125,
        },
        C1: {
          name: "C1",
          w: 648,
          h: 917,
        },
        C2: {
          name: "C2",
          w: 458,
          h: 648,
        },
        C3: {
          name: "C3",
          w: 324,
          h: 458,
        },
        C4: {
          name: "C4",
          w: 229,
          h: 324,
        },
        C5: {
          name: "C5",
          w: 162,
          h: 229,
        },
        C6: {
          name: "C6",
          w: 114,
          h: 162,
        },
        C7: {
          name: "C7",
          w: 81,
          h: 114,
        },
      },
      currentPage: "A4",
    };
  },
  methods: {
    ...mapActions({
      reDrawRuler: "printTemplateModule/rulerThings/reDrawRuler",
      setRect: "printTemplateModule/rulerThings/setRect",
    }),
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
.roy-designer-global {
  height: 100%;
  padding: 12px 8px;
  font-size: 12px;
  .roy-designer-global__pages {
    .roy-designer-global__pages__container {
      margin: 8px;
      display: grid;
      grid-template-columns: repeat(4, auto);
      grid-gap: 5px;
      grid-template-rows: 50px;
    }
    .roy-designer-global__pages__item {
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
      &.roy-designer-global__pages__item--active {
        border: 1px solid #4579e1;
        color: #4579e1;
      }
    }
  }
  .roy-designer-global__title {
    padding: 6px 5px;
    margin: 4px;
    &:before {
      content: "";
      width: 1px;
      height: 80%;
      margin-right: 5px;
      border-left: var(--roy-color-primary) 3px solid;
    }
  }
}
</style>
