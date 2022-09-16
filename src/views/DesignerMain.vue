<!--
* @description 主操作视图
* @filename DesignerMain.vue
* @author ROYIANS
* @date 2022/9/13 9:36
!-->
<template>
  <section class="height-all">
    <ToolBar />
    <Editor />
  </section>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";
import ToolBar from "@/components/toolbar/ToolBar.vue";
import Editor from "@/components/editor/Editor.vue";

/**
 * 主操作视图
 */
export default {
  name: "DesignerMain",
  mixins: [commonMixin],
  components: {
    ToolBar,
    Editor,
  },
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
