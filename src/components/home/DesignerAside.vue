<template>
  <section class="roy-designer-aside__main" :style="asideStyle">
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
        v-show="showRight"
        :is="curActiveComponent"
        :key="curActiveComponentCode"
        class="roy-designer-aside__right_panel"
      />
    </keep-alive>
  </section>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";

export default {
  name: "DesignerAside",
  mixins: [commonMixin],
  data() {
    return {
      showRight: true,
      menuList: [
        {
          name: "组件",
          code: "component",
          icon: "ri-pencil-ruler-2-line",
          component: () => import("./PageComponent.vue"),
        },
        {
          name: "区块",
          code: "blocks",
          icon: "ri-layout-5-line",
          component: () => import("./PageBlock.vue"),
        },
        {
          name: "页面",
          code: "page",
          icon: "ri-stack-line",
          component: () => import("./PageSetting.vue"),
        },
        {
          name: "大纲",
          code: "toc",
          icon: "ri-pages-line",
          component: () => import("./PageToc.vue"),
        },
        {
          name: "工具",
          code: "tools",
          icon: "ri-magic-line",
          component: () => import("./PageTools.vue"),
        },
        {
          name: "全局",
          code: "setting",
          icon: "ri-sound-module-line",
          component: () => import("./GlobalSetting.vue"),
        },
      ],
      curActiveComponent: null,
      curActiveComponentCode: "",
    };
  },
  computed: {
    asideStyle() {
      return this.showRight ? "width: 300px" : "width: 65px";
    },
  },
  methods: {
    onMenuSelect(index) {
      if (this.curActiveComponentCode === this.menuList[index].code) {
        this.showRight = !this.showRight;
      } else {
        this.showRight = true;
      }
      this.curActiveComponent = this.menuList[index].component;
      this.curActiveComponentCode = this.menuList[index].code;
    },
  },
  mounted() {
    this.curActiveComponent = this.menuList[0].component;
    this.curActiveComponentCode = this.menuList[0].code;
  },
};
</script>

<style lang="scss">
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
