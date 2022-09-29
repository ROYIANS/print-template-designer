<!--
* @description 主页
* @filename Home.vue
* @author ROYIANS
* @date 2022/9/29 9:23
!-->
<template>
  <el-container class="roy-designer-container">
    <el-header class="roy-designer-header" height="40px">
      <div class="roy-designer-header__text">
        <i class="ri-pen-nib-line"></i>
        <span>打印模板设计器</span>
      </div>
    </el-header>
    <el-container style="height: calc(100% - 40px)">
      <el-aside class="roy-designer-aside" width="300px">
        <DesignerAside />
      </el-aside>
      <el-main class="roy-designer-main">
        <DesignerMain />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import DesignerAside from "@/views/DesignerAside.vue";
import DesignerMain from "@/views/DesignerMain.vue";

/**
 * 主页
 */
export default {
  name: "HomePage",
  components: {
    DesignerAside,
    DesignerMain,
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

<style lang="scss">
.roy-designer-container {
  background: var(--prism-background);
  width: 100%;
  height: 100%;

  .roy-designer-header {
    background: var(--roy-menu-bar-background);
    width: 100%;

    .roy-designer-header__text {
      color: #fff;
      display: flex;
      height: 100%;
      align-items: center;
    }
  }

  .roy-designer-aside {
    margin: 10px 5px 10px 10px;
  }

  .roy-designer-main {
    width: 60%;
    margin: 5px;
    border-radius: 2px;
    overflow: auto;
    padding: 0;
  }
}
</style>
