<!--
* @description 页面大纲
* @filename PageToc.vue
* @author ROYIANS
* @date 2022/9/26 15:10
!-->
<template>
  <el-main class="roy-page-toc">
    <div
      v-for="(item, index) in componentData"
      :key="index"
      :class="{ actived: transformIndex(index) === curComponentIndex }"
      class="roy-page-toc__list"
      @click="onClick(transformIndex(index))"
    >
      <span :class="getComponent(index).icon" style="padding-right: 5px"></span>
      <span>{{ getComponent(index).label }}</span>
      <div class="roy-page-toc__buttons">
        <span
          class="ri-arrow-up-line"
          @click="upComponent(transformIndex(index))"
        ></span>
        <span
          class="ri-arrow-down-line"
          @click="downComponent(transformIndex(index))"
        ></span>
        <span
          class="ri-delete-bin-4-line"
          @click="deleteComponent(transformIndex(index))"
        ></span>
      </div>
    </div>
  </el-main>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import { mapState } from 'vuex'

/**
 * 页面大纲
 */
export default {
  name: 'PageToc',
  mixins: [commonMixin],
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {
    ...mapState({
      componentData: (state) => state.printTemplateModule.componentData,
      curComponent: (state) => state.printTemplateModule.curComponent,
      curComponentIndex: (state) => state.printTemplateModule.curComponentIndex
    })
  },
  methods: {
    initMounted() {},
    getComponent(index) {
      return this.componentData[this.componentData.length - 1 - index]
    },

    transformIndex(index) {
      return this.componentData.length - 1 - index
    },
    onClick(index) {
      this.setCurComponent(index)
    },
    deleteComponent() {
      setTimeout(() => {
        this.$store.commit('printTemplateModule/deleteComponent')
        this.$store.commit('printTemplateModule/recordSnapshot')
      })
    },

    upComponent() {
      setTimeout(() => {
        this.$store.commit('printTemplateModule/upComponent')
        this.$store.commit('printTemplateModule/recordSnapshot')
      })
    },

    downComponent() {
      setTimeout(() => {
        this.$store.commit('printTemplateModule/downComponent')
        this.$store.commit('printTemplateModule/recordSnapshot')
      })
    },

    setCurComponent(index) {
      this.$store.commit('printTemplateModule/setCurComponent', {
        component: this.componentData[index],
        index
      })
    }
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
.roy-page-toc {
  height: 100%;
  padding: 6px;

  .roy-page-toc__list {
    height: 30px;
    cursor: grab;
    text-align: center;
    color: var(--roy-text-color-primary);
    display: flex;
    align-items: center;
    font-size: 12px;
    padding: 0 10px;
    position: relative;
    user-select: none;

    &:active {
      cursor: grabbing;
    }

    &:hover {
      background-color: rgba(200, 200, 200, 0.2);

      .roy-page-toc__buttons {
        display: block;
      }
    }
  }

  .roy-page-toc__buttons {
    position: absolute;
    right: 10px;
    display: none;

    span {
      cursor: pointer;
      padding: 5px;

      &:hover {
        background: var(--roy-menu-item-hover-fill);
      }
    }
  }
}
</style>
