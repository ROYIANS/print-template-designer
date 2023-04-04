<!--
* @description 页面大纲
* @filename PageToc.vue
* @author ROYIANS
* @date 2022/9/26 15:10
!-->
<template>
  <roy-main class="roy-page-toc">
    <div v-if="componentData.length">
      <div
        v-for="(item, index) in componentData"
        :key="index"
        :class="{ activated: transformIndex(index) === curComponentIndex }"
        class="roy-page-toc__list"
        @click="onClick(transformIndex(index))"
      >
        <i :class="getComponent(index).icon" style="padding-right: 5px"></i>
        <span class="roy-page-toc__label">{{ getComponent(index).label }}</span>
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
    </div>
    <div
      v-else
      class="roy-page-toc__empty animate__animated animate__headShake"
    >
      <i
        class="ri-door-lock-box-line animate__backInUp"
        style="color: var(--roy-color-warning)"
      />
      <div>当前没有组件，您可以通过拖拽添加组件</div>
    </div>
  </roy-main>
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

  .roy-page-toc__empty {
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

    .roy-page-toc__label {
      text-align: left;
      white-space: nowrap;
      text-overflow: ellipsis;
      width: 50%;
      overflow: hidden;
    }

    i {
      font-size: 12px;
    }

    &.activated {
      color: var(--roy-color-primary);
      background: var(--roy-color-primary-light-7);
    }

    &:active {
      cursor: grabbing;
    }

    &:hover {
      background-color: rgba(200, 200, 200, 0.2);
      color: var(--roy-text-color-primary);

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
