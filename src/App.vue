<template>
  <el-container class="roy-designer-container">
    <el-header class="roy-designer-header" height="40px">
      <div class="roy-designer-header__text">
        <i class="ri-pen-nib-line"></i>
        <span>打印模板设计器</span>
      </div>
    </el-header>
    <el-container style="height: calc(100% - 40px)">
      <el-aside width="300px" class="roy-designer-aside">
        <DesignerAside />
      </el-aside>
      <el-main class="roy-designer-main">213</el-main>
    </el-container>
  </el-container>
</template>

<script>
import DesignerAside from "@/views/DesignerAside.vue";
export default {
  name: "PrintDesigner",
  components: {
    DesignerAside,
  },
};
</script>
