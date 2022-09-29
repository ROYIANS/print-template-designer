<template>
  <section class="roy-designer-aside__main">
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
      menuList: [
        {
          name: "组件",
          code: "component",
          icon: "ri-pencil-ruler-2-line",
          component: () => import("@/views/PageComponent.vue"),
        },
        {
          name: "区块",
          code: "blocks",
          icon: "ri-layout-5-line",
          component: () => import("@/views/PageBlock.vue"),
        },
        {
          name: "页面",
          code: "page",
          icon: "ri-stack-line",
          component: () => import("@/views/PageSetting.vue"),
        },
        {
          name: "大纲",
          code: "toc",
          icon: "ri-pages-line",
          component: () => import("@/views/PageToc.vue"),
        },
        {
          name: "工具",
          code: "tools",
          icon: "ri-magic-line",
          component: () => import("@/views/PageTools.vue"),
        },
        {
          name: "全局",
          code: "setting",
          icon: "ri-sound-module-line",
          component: () => import("@/views/GlobalSetting.vue"),
        },
      ],
      curActiveComponent: null,
      curActiveComponentCode: "",
    };
  },
  methods: {
    onMenuSelect(index) {
      this.curActiveComponent = this.menuList[index].component;
      this.curActiveComponentCode = this.menuList[index].code;
    },
  },
  mounted() {
    this.$message({
      message: "欢迎！本系统由ROYIANS设计",
      type: "success",
      duration: 3000,
    });
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
