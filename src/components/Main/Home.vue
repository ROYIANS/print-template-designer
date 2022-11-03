<!--
* @description 主页
* @filename Home.vue
* @author ROYIANS
* @date 2022/9/29 9:23
!-->
<template>
  <el-container
    id="roy-print-template-designer"
    class="roy-designer-container"
    theme="day"
  >
    <el-header class="roy-designer-header" height="40px">
      <div class="roy-designer-header__text">
        <i class="ri-pen-nib-line"></i>
        <span>打印模板设计器 | {{ pageConfig.title }}</span>
      </div>
      <div class="roy-designer__right">
        <div>
          <slot name="roy-designer-header-slot"></slot>
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
      </div>
    </el-header>
    <el-container style="height: calc(100% - 40px)">
      <el-aside class="roy-designer-aside" width="auto">
        <DesignerAside :show-right.sync="defaultExpendAside" />
      </el-aside>
      <el-main class="roy-designer-main">
        <DesignerMain :show-right="defaultExpendAside">
          <template v-slot:roy-designer-toolbar-slot>
            <slot name="roy-designer-toolbar-slot"></slot>
          </template>
        </DesignerMain>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import config from '../../../package.json'
import { mapActions, mapState } from 'vuex'
import DesignerAside from './DesignerAside.vue'
import DesignerMain from './DesignerMain.vue'

const VERSION = config.version

/**
 * 主页
 */
export default {
  name: 'RoyPrintDesigner',
  components: {
    DesignerAside,
    DesignerMain
  },
  props: {},
  data() {
    return {
      defaultExpendAside: true
    }
  },
  computed: {
    ...mapState({
      isNightMode: (state) => state.printTemplateModule.nightMode.isNightMode,
      pageConfig: (state) => state.printTemplateModule.pageConfig,
      componentData: (state) => state.printTemplateModule.componentData
    })
  },
  methods: {
    ...mapActions({
      initNightMode: 'printTemplateModule/nightMode/initNightMode',
      toggleNightMode: 'printTemplateModule/nightMode/toggleNightMode'
    }),
    initMounted() {
      console.log(
        `\n %c PrintTemplateDesigner® v${VERSION} %c ${new Date(
          window.printTemplateVersionTime || new Date().getTime()
        ).toLocaleString()}`,
        'color:#fff;background:linear-gradient(90deg,#4579e1,#009688);padding:5px 0;',
        'color:#000;background:linear-gradient(90deg,#009688,#ffffff);padding:5px 10px 5px 0px;'
      )
      this.initConfig()
    },
    initConfig() {
      this.initNightMode()
    },
    dayNightChange() {
      this.toggleNightMode(!this.isNightMode)
    },
    enterFullScreen() {}
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
.roy-designer-container {
  background: var(--prism-background);
  width: 100%;
  height: 100%;

  .roy-designer-header {
    background: var(--roy-menu-bar-background);
    width: 100%;
    display: flex;
    justify-content: space-between;

    .roy-designer-header__text {
      color: #fff;
      display: flex;
      height: 100%;
      align-items: center;

      i {
        margin-right: 5px;
      }
    }

    .roy-designer__right {
      float: right;
      color: #fff;
      width: 50%;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      height: 100%;
      line-height: 40px;
    }

    .roy-night-mode {
      color: #fff;
      line-height: 40px;
      height: 40px;
      overflow: hidden;
      padding: 0 20px;
      cursor: pointer;

      i {
        position: absolute;
        top: 0;
        right: 20px;
        padding: 0 8px;
        font-size: 14px;
        cursor: pointer;

        &:hover {
          background: var(--roy-color-primary-light-3);
        }
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
