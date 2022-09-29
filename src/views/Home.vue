<!--
* @description 主页
* @filename Home.vue
* @author ROYIANS
* @date 2022/9/29 9:23
!-->
<template>
  <el-container class="roy-designer-container">
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
      <el-aside class="roy-designer-aside" width="300px">
        <DesignerAside />
      </el-aside>
      <el-main class="roy-designer-main">
        <DesignerMain />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { nightModeStore } from "@/stores/night-mode.js";
import DesignerAside from "@/views/DesignerAside.vue";
import DesignerMain from "@/views/DesignerMain.vue";

/**
 * 主页
 */
export default {
  name: "HomePage",
  components: {
    DesignerAside,
    DesignerMain,
  },
  props: {},
  data() {
    return {
      isNightMode: false,
    };
  },
  methods: {
    initMounted() {
      this.initConfig();
    },
    initConfig() {
      const nightMode = nightModeStore();
      nightMode.initNightMode();
      this.isNightMode = nightMode.isNightMode;
    },
    dayNightChange() {
      const nightMode = nightModeStore();
      this.isNightMode = !this.isNightMode;
      nightMode.toggleNightMode(this.isNightMode);
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

<style lang="scss">
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
    }

    .roy-fade-enter-active {
      animation: fadeIn 1s;
    }

    .roy-fade-leave-active {
      animation: fadeOut 1s;
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
  }

  .roy-designer-main {
    width: 60%;
    margin: 5px;
    border-radius: 2px;
    overflow: auto;
    padding: 0;
  }
}
</style>
