<!--
* @description 主编辑器
* @filename Editor.vue
* @author ROYIANS
* @date 2022/9/16 11:36
!-->
<template>
  <el-main class="roy-designer-main__page">
    <div id="designer-page">
      <div>测试页面</div>
    </div>
  </el-main>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";

/**
 * 主编辑器
 */
export default {
  name: "RoyEditor",
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
