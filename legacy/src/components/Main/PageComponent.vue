<template>
  <div class="roy-page-component">
    <div
      class="roy-page-component-group"
      v-for="(g, gIndex) in groupListItems"
      :key="gIndex"
      @dragstart="handleDragStart"
    >
      <label>{{ g.name }}</label>
      <div
        v-for="item in componentItemsMap[g.code]"
        :key="item.code"
        :data-code="item.code"
        class="roy-page-component__item"
        draggable="true"
      >
        <i :class="item.icon"></i>
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { componentList, groupList } from '@/components/config/componentList.js'

export default {
  name: 'PageComponent',
  data() {
    return {
      groupListItems: groupList
    }
  },
  computed: {
    componentItemsMap() {
      let res = {}
      componentList.forEach((comp) => {
        const group = comp.group
        let groupData = res[group] || []
        groupData.push(comp)
        res[group] = groupData
      })
      return res
    }
  },
  methods: {
    handleDragStart(e) {
      e.dataTransfer.setData('code', e.target.dataset.code)
    }
  }
}
</script>

<style lang="scss" scoped>
.roy-page-component {
  align-items: center;
  overflow: auto;
  height: calc(100% - 16px);
  justify-content: center;
  padding: 8px;
}

.roy-page-component-group {
  padding: 8px;
  border-top: 1px solid var(--roy-disabled-border-color);
  align-items: center;
  grid-template-columns: auto auto auto;
  display: grid;
  justify-content: start;
  margin-top: 8px;
  position: relative;
  label {
    font-size: 10px;
    color: var(--roy-text-color-disabled);
    background: var(--roy-bg-color-overlay);
    padding: 0 4px;
    position: absolute;
    top: -5px;
    left: 5px;
  }
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
  min-width: 67px;
  max-width: 69px;
  height: 95px;
  margin: 4px;
  color: var(--roy-text-color-regular);

  &:hover {
    box-shadow: rgba(0, 0, 0, 0.19) 0 10px 20px, rgba(0, 0, 0, 0.23) 0 6px 6px;
    cursor: grab;
    animation-name: pulse;
    animation-duration: 1s;
    animation-delay: 1.5s;
    animation-iteration-count: infinite;
    border: 1px solid var(--roy-color-primary);
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
