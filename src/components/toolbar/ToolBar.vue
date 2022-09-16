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
        effect="dark"
        :content="tool.name"
        placement="bottom"
        :visible-arrow="false"
        :open-delay="600"
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
        effect="dark"
        :content="tool.name"
        placement="bottom"
        :visible-arrow="false"
        :open-delay="600"
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
