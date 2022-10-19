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
        :key="menu.code"
        :index="`${index}`"
      >
        <div class="roy-designer-aside__menu__icon">
          <i :class="menu.icon"></i>
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

export default {
  name: 'DesignerAside',
  mixins: [commonMixin],
  data() {
    return {
      menuList: [
        {
          name: '组件',
          code: 'component',
          icon: 'ri-drag-drop-fill',
          component: () => import('./PageComponent.vue')
        },
        {
          name: '结构',
          code: 'toc',
          icon: 'ri-node-tree',
          component: () => import('./PageToc.vue')
        },
        {
          name: '属性',
          code: 'palette',
          icon: 'ri-palette-line',
          component: () => import('./PagePalette.vue')
        },
        {
          name: '全局',
          code: 'setting',
          icon: 'ri-sound-module-line',
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
    }
  },
  mounted() {
    this.curActiveComponent = this.menuList[0].component
    this.curActiveComponentCode = this.menuList[0].code
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
      align-items: center;
      vertical-align: center;
      align-content: center;

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
