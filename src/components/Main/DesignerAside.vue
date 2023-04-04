<template>
  <section :style="asideStyle" class="roy-designer-aside__main">
    <roy-sidebar-menu
      ref="sideMenu"
      :collapsed="true"
      :menu="menuList"
      :theme="isNightMode ? '' : 'white-theme'"
      width="150px"
      @item-click="onMenuSelect"
    />
    <keep-alive>
      <component
        :is="curActiveComponent"
        v-show="showRight"
        :key="curActiveComponentCode"
        class="roy-designer-aside__right_panel"
      />
    </keep-alive>
  </section>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import { mapState } from 'vuex'

export default {
  name: 'DesignerAside',
  mixins: [commonMixin],
  data() {
    return {
      menuList: [
        {
          title: '组件',
          code: 'component',
          icon: 'ri-drag-drop-line',
          activeIcon: 'ri-drag-drop-fill',
          isActive: true,
          relativeComponent: () => import('./PageComponent.vue')
        },
        {
          title: '结构',
          code: 'toc',
          icon: 'ri-building-2-line',
          activeIcon: 'ri-building-2-fill',
          relativeComponent: () => import('./PageToc.vue')
        },
        {
          title: '属性',
          code: 'palette',
          icon: 'ri-palette-line',
          activeIcon: 'ri-palette-fill',
          relativeComponent: () => import('./PagePalette.vue')
        },
        {
          title: '数据源',
          code: 'datasource',
          icon: 'ri-database-2-line',
          activeIcon: 'ri-database-2-fill',
          relativeComponent: () => import('./DataSource.vue')
        },
        {
          title: '全局',
          code: 'setting',
          icon: 'ri-settings-6-line',
          activeIcon: 'ri-settings-6-fill',
          relativeComponent: () => import('./GlobalSetting.vue')
        }
      ],
      curActiveComponent: null,
      curActiveComponentCode: ''
    }
  },
  props: {
    showRight: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapState({
      paletteCount: (state) => state.printTemplateModule.paletteCount,
      globalCount: (state) => state.printTemplateModule.globalCount,
      isNightMode: (state) => state.printTemplateModule.nightMode.isNightMode
    }),
    asideStyle() {
      return this.showRight ? 'width: 300px' : 'width: 65px'
    }
  },
  methods: {
    onMenuSelect(e, item) {
      this.curActiveComponent = item.relativeComponent
      this.curActiveComponentCode = item.code
      this.menuList.forEach((mItem) => {
        let isActive = false
        if (item.code === mItem.code) {
          isActive = true
        }
        this.$set(mItem, 'isActive', isActive)
      })
    },
    clickPaletteMenu() {
      this.$refs.sideMenu.$refs.menuItems.forEach((item) => {
        if (item.item.code === 'palette' && this.curActiveComponentCode !== 'palette') {
          this.onMenuSelect(null, item.item)
        }
      })
    },
    clickGlobalMenu() {
      this.$refs.sideMenu.$refs.menuItems.forEach((item) => {
        if (item.item.code === 'setting' && this.curActiveComponentCode !== 'setting') {
          this.onMenuSelect(null, item.item)
        }
      })
    }
  },
  mounted() {
    this.curActiveComponent = this.menuList[0].relativeComponent
    this.curActiveComponentCode = this.menuList[0].code
  },
  watch: {
    paletteCount() {
      this.clickPaletteMenu()
    },
    globalCount() {
      this.clickGlobalMenu()
    }
  }
}
</script>

<style lang="scss" scoped>
.roy-designer-aside__main {
  height: 100%;
  width: 100%;
  display: flex;
  position: relative;
  background: var(--roy-bg-color-overlay);

  .roy-designer-aside__menu {
    height: 100%;
    z-index: 1;

    .roy-designer-aside__menu__icon {
      display: grid;
      top: -7px;
      position: relative;

      i {
        padding: 0;
        margin: 0;
        font-size: 20px;
      }

      span {
        line-height: 14px;
        visibility: visible;
        height: auto;
        width: auto;
        font-size: 8px;
        top: -14px;
        position: relative;
      }
    }
  }

  .roy-designer-aside__right_panel {
    width: calc(100% - 64px);
    background: var(--roy-bg-color-overlay);
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
