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
      <div id="tttt" class="roy-designer-header__text">
        <i class="ri-pen-nib-line"></i>
        <span>打印模板设计器 | {{ pageConfig.title }}</span>
      </div>
      <div class="roy-designer__right">
        <div>
          <slot name="roy-designer-header-slot"></slot>
        </div>
        <div class="roy-night-mode">
          <i
            v-for="(tool, index) in headIconConfig"
            :key="index"
            :class="tool.icon"
            :title="tool.name"
            @click="tool.event"
          ></i>
          <i
            v-if="configIn.toolbarConfig.showNightMode && isNightMode"
            title="切换到日间模式"
            class="ri-haze-fill"
            @click="dayNightChange"
          ></i>
          <i
            v-if="configIn.toolbarConfig.showNightMode && !isNightMode"
            title="切换到夜间模式"
            class="ri-moon-foggy-fill"
            @click="dayNightChange"
          ></i>
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
import shepherd from '@/components/RoyUserTour/userTour'
import toast from '@/utils/toast'

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
  props: {
    preComponentData: {
      type: [Array, Boolean],
      default: false
    },
    prePageConfig: {
      type: [Object, Boolean],
      default: false
    },
    preDataSource: {
      type: [Array, Boolean],
      default: false
    },
    preDataSet: {
      type: [Object, Boolean],
      default: false
    },
    config: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      defaultExpendAside: true,
      configIn: {
        toolbarConfig: {
          buttons: ['guide', 'exportTemplate', 'importTemplate'],
          showNightMode: true
        }
      },
      headIcons: [
        {
          code: 'guide',
          name: '界面指引',
          icon: 'ri-question-line',
          event: this.showUserGuide
        },
        {
          code: 'exportTemplate',
          name: '导出配置信息',
          icon: 'ri-braces-line',
          event: this.exportJSON
        },
        {
          code: 'importTemplate',
          name: '导入模板数据',
          icon: 'ri-contacts-book-upload-line',
          event: this.importFile
        }
      ]
    }
  },
  computed: {
    ...mapState({
      isNightMode: (state) => state.printTemplateModule.nightMode.isNightMode,
      pageConfig: (state) => state.printTemplateModule.pageConfig,
      componentData: (state) => state.printTemplateModule.componentData
    }),
    headIconConfig() {
      return this.headIcons.filter((item) => {
        return (
          this.configIn.toolbarConfig.buttons &&
          this.configIn.toolbarConfig.buttons.includes(item.code)
        )
      })
    }
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
      this.configIn = Object.assign({}, this.configIn, this.config)
      if (this.preComponentData) {
        this.$store.commit(
          'printTemplateModule/setComponentData',
          this.preComponentData
        )
      }
      if (this.prePageConfig) {
        this.$store.commit(
          'printTemplateModule/setPageConfig',
          this.prePageConfig
        )
      }
      if (this.preDataSource) {
        this.$store.commit(
          'printTemplateModule/setDataSource',
          this.preDataSource
        )
      }
      if (this.preDataSet) {
        this.$store.commit('printTemplateModule/setDataSet', this.preDataSet)
      }
    },
    dayNightChange() {
      this.toggleNightMode(!this.isNightMode)
    },
    showUserGuide() {
      const driver = shepherd()
      driver.addSteps([
        {
          attachTo: {
            element: document.querySelector('#royians-guide'),
            on: 'auto'
          },
          title: '打印模板设计器界面指引',
          text: '欢迎使用！接下来介绍整个界面。',
          buttons: [
            {
              action() {
                return this.next()
              },
              text: '下一步'
            }
          ]
        },
        {
          attachTo: {
            element: this.$el.querySelector('.roy-designer-header'),
            on: 'auto'
          },
          title: '打印模板设计器界面指引',
          text: '这是标题栏，左侧显示”打印模板设计器”字样和当前模板名称，右侧是开发者自定义插槽和夜间模式切换按钮。',
          buttons: [
            {
              action() {
                return this.next()
              },
              text: '下一步'
            }
          ]
        },
        {
          attachTo: {
            element: this.$el.querySelector('.roy-designer-aside'),
            on: 'auto'
          },
          title: '打印模板设计器界面指引',
          text: '这是左侧面板，包含四个模块。',
          buttons: [
            {
              action() {
                return this.next()
              },
              text: '下一步'
            }
          ]
        },
        {
          attachTo: {
            element: this.$el.querySelector('.roy-designer-main'),
            on: 'bottom-start'
          },
          title: '打印模板设计器界面指引',
          text: '这是右侧面版，包含一个工具栏和一个主窗口。',
          buttons: [
            {
              action() {
                return this.next()
              },
              text: '下一步'
            }
          ]
        },
        {
          attachTo: {
            element: document.querySelector('#royians-guide'),
            on: 'auto'
          },
          title: '打印模板设计器界面指引',
          text: '本系统由ROYIANS设计，欢迎使用。',
          buttons: [
            {
              action() {
                return this.cancel()
              },
              text: '完成'
            }
          ]
        }
      ])
      driver.start()
    },
    readFile(options) {
      const opts = Object.assign({}, options)
      const parseFile = (file) => {
        const name = file.name
        const tIndex = name.lastIndexOf('.')
        const type = name.substring(tIndex + 1, name.length)
        const filename = name.substring(0, tIndex)
        return { filename, type }
      }
      let fileForm = document.createElement('form')
      let fileInput = document.createElement('input')
      fileInput.name = 'file'
      fileInput.type = 'file'
      fileForm.appendChild(fileInput)
      fileForm.style.display = 'none'
      document.body.appendChild(fileForm)
      return new Promise((resolve, reject) => {
        const types = opts.types || []
        const isAllType = !types.length || types.some((type) => type === '*')
        fileInput.multiple = !!opts.multiple
        fileInput.accept = isAllType ? '' : `.${types.join(', .')}`
        fileInput.onchange = (evnt) => {
          const { files } = evnt.target
          const file = files[0]
          let errType = ''
          // 校验类型
          if (!isAllType) {
            for (let fIndex = 0; fIndex < files.length; fIndex++) {
              const { type } = parseFile(files[fIndex])
              if (!types.includes(type)) {
                errType = type
                break
              }
            }
          }
          if (!errType) {
            resolve({ status: true, files, file })
          } else {
            if (opts.message !== false) {
              toast({
                message: `不支持上传此格式文件：${errType}`,
                status: 'error'
              })
            }
            const params = { status: false, files, file }
            reject(params)
          }
        }
        fileForm.reset()
        fileInput.click()
        document.body.removeChild(fileForm)
      })
    },
    async importFile() {
      try {
        const { file } = await this.readFile({ types: ['rptd'] })
        let reader = new FileReader()
        reader.readAsText(file, 'UTF-8')
        reader.onload = (e) => {
          this.$XModal
            .confirm('确定要读取该文件？将覆盖当前编辑内容！')
            .then((type) => {
              if (type === 'confirm') {
                const result = e.target.result.toString()
                let resultParsed = []
                try {
                  resultParsed = JSON.parse(result)
                  if (!resultParsed.pageConfig || !resultParsed.componentData) {
                    toast('文件格式错误，转换内容失败', 'warning')
                    return
                  }
                } catch (e) {
                  toast('文件损坏，转换内容失败', 'warning')
                }
                this.$store.commit(
                  'printTemplateModule/setComponentData',
                  resultParsed.componentData
                )
                this.$store.commit(
                  'printTemplateModule/setPageConfig',
                  resultParsed.pageConfig
                )
              }
            })
        }
      } catch (e) {
        toast(`读取文件错误：${e.message}`, 'warning')
      }
    },
    exportJSON() {
      let eleA = document.createElement('a')
      eleA.download = `${this.pageConfig.title}.rptd`

      eleA.style.display = 'none'

      const saveData = {
        pageConfig: this.pageConfig,
        componentData: this.componentData
      }

      const blob = new Blob([JSON.stringify(saveData)])
      eleA.href = URL.createObjectURL(blob)

      document.body.appendChild(eleA)

      eleA.click()
      document.body.removeChild(eleA)
      toast('导出成功！', 'success')
    },
    getTemplateData() {
      return {
        type: 'rptd',
        pageConfig: this.pageConfig,
        componentData: this.componentData
      }
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
      cursor: pointer;

      i {
        float: left;
        color: #fff;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        height: 100%;
        line-height: 40px;
        padding: 0 8px;
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
