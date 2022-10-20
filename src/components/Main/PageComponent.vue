<template>
  <div class="roy-page-component" @dragstart="handleDragStart">
    <div
      v-for="(item, index) in componentItems"
      :key="item.code"
      :data-index="index"
      class="roy-page-component__item"
      draggable="true"
    >
      <i :class="item.icon"></i>
      <span>{{ item.name }}</span>
    </div>
  </div>
</template>

<script>
import { componentList } from '@/components/config/componentList.js'

export default {
  name: 'PageComponent',
  data() {
    return {
      componentItems: componentList
    }
  },
  methods: {
    handleDragStart(e) {
      e.dataTransfer.setData('index', e.target.dataset.index)
    }
  }
}
</script>

<style lang="scss" scoped>
.roy-page-component {
  overflow: auto;
  height: calc(100% - 16px);
  padding: 8px;
  display: flex;
  flex-flow: row wrap;
  place-content: flex-start;
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
  margin: 0 4px 10px 0;
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
