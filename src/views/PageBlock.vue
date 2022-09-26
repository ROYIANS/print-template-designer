<template>
  <div class="roy-page-block">
    <section v-for="(block, index) in blocks" :key="index">
      <el-col
        v-for="(span, bIndex) in block"
        :key="bIndex"
        :span="span"
      ></el-col>
    </section>
  </div>
</template>

<script>
export default {
  name: "PageBlock",
  data() {
    return {
      blocks: [
        [24],
        [12, 12],
        [8, 8, 8],
        [6, 6, 6, 6],
        [8, 16],
        [16, 8],
        [4, 8, 4, 8],
        [8, 4, 8, 4],
      ],
    };
  },
};
</script>

<style scoped lang="scss">
.roy-page-block {
  overflow: auto;
  height: calc(100% - 16px);
  padding: 8px;
  section {
    padding: 0;
    background: var(--roy-bg-block-color);
    height: 50px;
    width: 100%;
    user-select: none;
    margin: 5px 0;
    &:hover {
      cursor: grab;
      box-shadow: var(--roy-box-shadow-light);
      transform: scale3d(1.05, 1.05, 1.05);
    }
    .el-col {
      height: 100%;
      border: 2px solid var(--roy-border-block-color);
      & + .el-col {
        border-left: none;
      }
    }
  }
}
</style>
