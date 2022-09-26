<!--
* @description 页面大纲
* @filename PageToc.vue
* @author ROYIANS
* @date 2022/9/26 15:10
!-->
<template>
  <el-main class="PageToc"> 1 </el-main>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";

/**
 * 页面大纲
 */
export default {
  name: "PageToc",
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
.PageToc {
  height: 100%;
  padding: 6px;
}
</style>
