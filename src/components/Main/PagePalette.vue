<template>
  <div class="roy-page-tools">
    <div v-if="curClickComponent"></div>
    <div
      v-else
      class="roy-page-tools__empty animate__animated animate__headShake"
    >
      <i
        class="ri-door-lock-box-line animate__backInUp"
        style="color: var(--roy-color-warning)"
      />
      <div>请先选定一个组件，再进行该组件的属性设置</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PagePalette",
  data() {
    return {
      curClickComponent: null,
    };
  },
};
</script>

<style lang="scss" scoped>
.roy-page-tools {
  overflow: auto;
  height: calc(100% - 16px);
  padding: 8px;
  .roy-page-tools__empty {
    font-size: 10px;
    height: 100%;
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    i {
      font-size: 28px;
      width: 100%;
      align-self: end;
      text-align: center;
    }
    div {
      text-align: center;
    }
  }
}
</style>
