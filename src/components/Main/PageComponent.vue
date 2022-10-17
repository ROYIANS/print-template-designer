<template>
  <div class="roy-page-component">
    <div
      v-for="item in componentItems"
      :key="item.code"
      class="roy-page-component__item"
      draggable="true"
    >
      <i :class="item.icon"></i>
      <span>{{ item.name }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "PageComponent",
  data() {
    return {
      componentItems: [
        {
          icon: "ri-t-box-line",
          code: "heading",
          name: "文本",
        },
        {
          icon: "ri-table-line",
          code: "table",
          name: "表格",
        },
        {
          icon: "ri-layout-2-line",
          code: "form",
          name: "表单",
        },
        {
          icon: "iconfont icon-xianduan",
          code: "line",
          name: "直线",
        },
        {
          icon: "iconfont icon-xingzhuang-juxing",
          code: "rectangle",
          name: "矩形",
        },
        {
          icon: "iconfont icon-xingzhuang-sanjiaoxing",
          code: "triangle",
          name: "三角形",
        },
        {
          icon: "iconfont icon-xingzhuang-tuoyuanxing",
          code: "circle",
          name: "圆形",
        },
      ],
    };
  },
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
  width: 68px;
  min-width: 67px;
  max-width: 69px;
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
