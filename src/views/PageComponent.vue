<template>
  <div class="roy-page-component">
    <div class="roy-page-component__item" draggable="true">
      <i class="ri-heading"></i>
      <span>标题</span>
    </div>
    <div class="roy-page-component__item">
      <i class="ri-emphasis-cn"></i>
      <span>文本</span>
    </div>
    <div class="roy-page-component__item">
      <i class="ri-separator"></i>
      <span>分割线</span>
    </div>
    <div class="roy-page-component__item">
      <i class="ri-table-2"></i>
      <span>表格</span>
    </div>
    <div class="roy-page-component__item">
      <i class="ri-link"></i>
      <span>链接</span>
    </div>
    <div class="roy-page-component__item">
      <i class="ri-image-2-line"></i>
      <span>图片</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "PageComponent",
};
</script>

<style lang="scss" scoped>
.roy-page-component {
  overflow: auto;
  height: calc(100% - 16px);
  padding: 8px;
  display: flex;
  flex-flow: row wrap;
  place-content: flex-start space-between;
}

.roy-page-component__item {
  background: var(--roy-bg-color);
  border-radius: 6px;
  box-shadow: rgba(99, 99, 99, 0.2) 0 2px 8px 0;
  display: grid;
  text-align: center;
  align-content: center;
  border: 1px solid var(--roy-border-color-dark);
  user-select: none;
  width: 30%;
  height: 95px;
  margin-bottom: 10px;
  color: var(--roy-text-color-regular);

  &:hover {
    box-shadow: rgba(0, 0, 0, 0.19) 0 10px 20px, rgba(0, 0, 0, 0.23) 0 6px 6px;
    cursor: grab;
    animation-name: pulse;
    animation-duration: 1s;
    animation-delay: 1.5s;
    animation-iteration-count: infinite;
  }

  i {
    font-size: 32px;
    margin: 0;
  }

  span {
    font-size: 10px;
    padding-top: 10px;
  }
}
</style>
