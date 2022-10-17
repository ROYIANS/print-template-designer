<!--
* @description 主操作视图
* @filename DesignerMain.vue
* @author ROYIANS
* @date 2022/9/13 9:36
!-->
<template>
  <section class="height-all">
    <ToolBar>
      <template v-slot:roy-designer-toolbar-slot>
        <slot name="roy-designer-toolbar-slot"></slot>
      </template>
    </ToolBar>
    <Editor :show-right="showRight" />
  </section>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";
import ToolBar from "@/components/ToolBar/ToolBar.vue";
import Editor from "@/components/Editor/Editor.vue";

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
  props: {
    showRight: {
      type: Boolean,
      default: true,
    },
  },
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
