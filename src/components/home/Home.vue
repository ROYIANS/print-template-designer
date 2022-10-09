<!--
* @description 主页
* @filename Home.vue
* @author ROYIANS
* @date 2022/9/29 9:23
!-->
<template>
  <el-container
    class="roy-designer-container"
    id="roy-print-template-designer"
    theme="day"
  >
    <el-header class="roy-designer-header" height="40px">
      <div class="roy-designer-header__text">
        <i class="ri-pen-nib-line"></i>
        <span>打印模板设计器</span>
      </div>
      <div class="roy-night-mode">
        <transition-group name="roy-fade" tag="span">
          <i
            v-if="isNightMode"
            :key="1"
            class="ri-haze-fill"
            @click="dayNightChange"
          ></i>
          <i
            v-else
            :key="2"
            class="ri-moon-foggy-fill"
            @click="dayNightChange"
          ></i>
        </transition-group>
      </div>
    </el-header>
    <el-container style="height: calc(100% - 40px)">
      <el-aside class="roy-designer-aside" width="auto">
        <DesignerAside />
      </el-aside>
      <el-main class="roy-designer-main">
        <DesignerMain />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import config from "../../../package.json";
import { mapActions } from "vuex";
import DesignerAside from "./DesignerAside.vue";
import DesignerMain from "./DesignerMain.vue";

const VERSION = config.version;

/**
 * 主页
 */
export default {
  name: "RoyPrintDesigner",
  components: {
    DesignerAside,
    DesignerMain,
  },
  props: {},
  data() {
    return {};
  },
  computed: {
    isNightMode() {
      return this.$store.state.printTemplateModule.nightMode.isNightMode;
    },
  },
  methods: {
    ...mapActions({
      initNightMode: "printTemplateModule/nightMode/initNightMode",
      toggleNightMode: "printTemplateModule/nightMode/toggleNightMode",
    }),
    initMounted() {
      console.log(
        `\n %c PrintTemplateDesigner® v${VERSION} %c ${new Date(
          window.versionTime || new Date().getTime()
        ).toLocaleString()}`,
        "color:#fff;background:linear-gradient(90deg,#4579e1,#009688);padding:5px 0;",
        "color:#000;background:linear-gradient(90deg,#009688,#ffffff);padding:5px 10px 5px 0px;"
      );
      this.initConfig();
    },
    initConfig() {
      this.initNightMode();
    },
    dayNightChange() {
      console.log(!this.isNightMode);
      this.toggleNightMode(!this.isNightMode);
    },
    enterFullScreen() {},
  },
  created() {},
  mounted() {
    this.initMounted();
  },
  watch: {},
};
</script>

<style lang="scss" scoped>
.roy-designer-container {
  background: var(--prism-background);
  width: 100%;
  height: 100%;

  .roy-designer-header {
    background: var(--roy-menu-bar-background);
    width: 100%;

    .roy-designer-header__text {
      color: #fff;
      display: flex;
      height: 100%;
      align-items: center;
      i {
        margin-right: 5px;
      }
    }

    .roy-night-mode {
      color: #fff;
      line-height: 40px;
      height: 40px;
      position: absolute;
      top: 0;
      right: 0;
      overflow: hidden;
      padding: 0 20px;
      cursor: pointer;
      i {
        position: absolute;
        top: 0;
        left: 0;
      }
    }
  }

  .roy-designer-aside {
    margin: 10px 5px 10px 10px;
    height: calc(100% - 20px);
  }

  .roy-designer-main {
    margin: 5px;
    border-radius: 2px;
    overflow: auto;
    padding: 0;
  }
}
</style>
