<!--
* @description Area
* @filename Area.vue
* @author ROYIANS
* @date 2022/10/19 9:27
!-->
<template>
  <div
    :style="{
      left: start.x + 'px',
      top: start.y + 'px',
      width: width + 'px',
      height: height + 'px'
    }"
    class="roy-designer-area"
  ></div>
</template>

<script>
export default {
  name: 'RoyArea',
  props: {
    start: {
      type: Object,
      default: () => {}
    },
    width: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style lang="scss" scoped>
.roy-designer-area {
  border: 1px solid var(--roy-color-primary-light-5);
  background: rgba(var(--roy-color-primary-rgb), 0.1);
  position: absolute;
}
</style>
