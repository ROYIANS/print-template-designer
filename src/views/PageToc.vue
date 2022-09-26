<!--
* @description 页面大纲
* @filename PageToc.vue
* @author ROYIANS
* @date 2022/9/26 15:10
!-->
<template>
  <el-main class="PageToc">
    <v-tree :data="tocData" :radio="true" />
  </el-main>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";
import bigData from "@/mock/bigTree.json";

/**
 * 页面大纲
 */
export default {
  name: "PageToc",
  mixins: [commonMixin],
  components: {},
  props: {},
  data() {
    return {
      tocData: [],
    };
  },
  methods: {
    initMounted() {
      let treeData = bigData.data;
      treeData[0].expanded = true;
      this.tocData = treeData;
    },
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
