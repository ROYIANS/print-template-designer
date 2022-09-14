<!--
* @description 主操作视图
* @filename DesignerMain.vue
* @author ROYIANS
* @date 2022/9/13 9:36
!-->
<template>
  <div class="height-all">
    <el-header :height="'30px'" class="roy-designer-main__toolbar">
      <el-tooltip
        class="item"
        effect="dark"
        content="撤销"
        placement="bottom"
        :visible-arrow="false"
        :open-delay="1000"
      >
        <div class="roy-designer-main__toolbar__item">
          <i class="ri-arrow-go-back-fill"></i>
        </div>
      </el-tooltip>
      <el-tooltip
        class="item"
        effect="dark"
        content="恢复"
        placement="bottom"
        :visible-arrow="false"
        :open-delay="1000"
      >
        <div class="roy-designer-main__toolbar__item">
          <i class="ri-arrow-go-forward-line"></i>
        </div>
      </el-tooltip>
    </el-header>
    <el-main class="roy-designer-main__page">
      <div id="designer-page">
        <div>123456</div>
      </div>
    </el-main>
  </div>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";

/**
 * 主操作视图
 */
export default {
  name: "DesignerMain",
  mixins: [commonMixin],
  components: {},
  props: {},
  data() {
    return {};
  },
  methods: {
    initMounted() {},
  },
  created() {},
  mounted() {
    this.initMounted();
  },
  watch: {},
};
</script>

<style lang="scss">
.roy-designer-main__page {
  height: calc(100% - 50px);
  padding: 0;
  &.el-main {
    padding: 4px;
  }
  #designer-page {
    margin: auto;
    background: var(--roy-bg-color);
    box-shadow: rgba(0, 0, 0, 0.12) 0 1px 3px, rgba(0, 0, 0, 0.24) 0 1px 2px;
    width: calc(210mm * 1.25);
    height: calc(297mm * 1.25);
  }
}
.roy-designer-main__toolbar {
  display: flex;
  justify-content: center;
  align-items: center;
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
