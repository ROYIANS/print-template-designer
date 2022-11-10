<template>
  <section :style="asideStyle" class="roy-designer-aside__main">
    <el-menu
      :collapse="true"
      class="roy-designer-aside__menu"
      default-active="0"
      @select="onMenuSelect"
    >
      <el-menu-item
        v-for="(menu, index) in menuList"
        ref="menuItem"
        style="padding: 0; text-align: center"
        :key="menu.code"
        :index="`${index}`"
      >
        <div class="roy-designer-aside__menu__icon">
          <i
            :class="
              curActiveComponentCode === menu.code ? menu.activeIcon : menu.icon
            "
          ></i>
          <span>{{ menu.name }}</span>
        </div>
      </el-menu-item>
    </el-menu>
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
          name: '组件',
          code: 'component',
          icon: 'ri-drag-drop-line',
          activeIcon: 'ri-drag-drop-fill',
          component: () => import('./PageComponent.vue')
        },
        {
          name: '结构',
          code: 'toc',
          icon: 'ri-building-2-line',
          activeIcon: 'ri-building-2-fill',
          component: () => import('./PageToc.vue')
        },
        {
          name: '属性',
          code: 'palette',
          icon: 'ri-palette-line',
          activeIcon: 'ri-palette-fill',
          component: () => import('./PagePalette.vue')
        },
        {
          name: '数据源',
          code: 'datasource',
          icon: 'ri-database-2-line',
          activeIcon: 'ri-database-2-fill',
          component: () => import('./DataSource.vue')
        },
        {
          name: '全局',
          code: 'setting',
          icon: 'ri-settings-6-line',
          activeIcon: 'ri-settings-6-fill',
          component: () => import('./GlobalSetting.vue')
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
      globalCount: (state) => state.printTemplateModule.globalCount
    }),
    asideStyle() {
      return this.showRight ? 'width: 300px' : 'width: 65px'
    }
  },
  methods: {
    onMenuSelect(index) {
      if (this.curActiveComponentCode === this.menuList[index].code) {
        this.$emit('update:showRight', !this.showRight)
      } else {
        this.$emit('update:showRight', true)
      }
      this.curActiveComponent = this.menuList[index].component
      this.curActiveComponentCode = this.menuList[index].code
    },
    clickPaletteMenu() {
      this.$refs.menuItem.forEach((item) => {
        if (
          item.$vnode.key === 'palette' &&
          this.curActiveComponentCode !== 'palette'
        ) {
          item.$el.click()
        }
      })
    },
    clickGlobalMenu() {
      this.$refs.menuItem.forEach((item) => {
        if (
          item.$vnode.key === 'setting' &&
          this.curActiveComponentCode !== 'setting'
        ) {
          item.$el.click()
        }
      })
    }
  },
  mounted() {
    this.curActiveComponent = this.menuList[0].component
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
  background: var(--roy-bg-color-overlay);

  .roy-designer-aside__menu {
    height: 100%;
    z-index: 1;

    .el-menu-item {
      overflow: hidden;
      padding: 0;
    }

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
  }
}
</style>
