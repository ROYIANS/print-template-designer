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
    <section class="roy-designer-main__toolbar_right">
      <el-tooltip
        v-for="(tool, index) in toolbarRightConfig"
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
  </el-header>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";

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
            alert("撤销");
          },
        },
        {
          name: "恢复",
          icon: "ri-arrow-go-forward-fill",
          event: () => {},
        },
      ],
      toolbarRightConfig: [
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
      ],
    };
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

<style lang="scss" scoped>
.roy-designer-main__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .roy-designer-main__toolbar_left {
    display: flex;
    justify-content: flex-start;
  }

  .roy-designer-main__toolbar_right {
    display: flex;
    justify-content: flex-end;
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
