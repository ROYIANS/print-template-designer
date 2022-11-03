<template>
  <PtdDesigner ref="designer">
    <template v-slot:roy-designer-header-slot>
      <div class="head-slot">
        <el-button
          id="royians-guide"
          icon="ri-question-line"
          size="mini"
          @click="showUserGuide"
        >
          界面指引
        </el-button>
        <el-button
          icon="ri-printer-cloud-line"
          size="mini"
          v-print="'#designer-page'"
        >
          打印预览
        </el-button>
        <el-button icon="ri-file-pdf-line" size="mini" @click="exportPDF">
          导出PDF
        </el-button>
        <el-button icon="ri-braces-line" size="mini" @click="exportJSON">
          导出配置信息
        </el-button>
        <el-upload
          class="roy-upload-file"
          action=""
          :file-list="fileList"
          :show-file-list="false"
          :auto-upload="false"
          :limit="1"
          :on-change="importFile"
          :accept="'.rptd'"
        >
          <el-button
            icon="ri-contacts-book-upload-line"
            size="mini"
            type="file"
            slot="trigger"
          >
            导入模板数据
          </el-button>
        </el-upload>
        <i
          v-for="(tool, index) in headIconConfig"
          :key="index"
          :class="tool.icon"
          class="roy-header-icon"
          @click="tool.event"
        ></i>
      </div>
    </template>
    <template v-slot:roy-designer-toolbar-slot>
      <el-tooltip
        v-for="(tool, index) in toolbarSlotConfig"
        :key="index"
        :content="tool.name"
        :open-delay="600"
        :visible-arrow="false"
        effect="dark"
        placement="bottom"
      >
        <div class="toolbar-slot-item" @click="tool.event">
          <i :class="tool.icon"></i>
        </div>
      </el-tooltip>
    </template>
  </PtdDesigner>
</template>

<script>
import toast from '@/utils/toast'
import shepherd from '@/components/RoyUserTour/userTour'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { mapState } from 'vuex'
import print from 'vue-print-nb'

export default {
  name: 'App',
  directives: {
    print
  },
  mounted() {
    toast('欢迎使用ROYIANS的打印模板设计器，仅个人学习使用', 'info')
    console.log('contributed by ROYIANS@Little-Dreamland﹢')
  },
  computed: {
    ...mapState({
      pageConfig: (state) => state.printTemplateModule.pageConfig,
      componentData: (state) => state.printTemplateModule.componentData
    })
  },
  data() {
    return {
      fileList: [],
      toolbarSlotConfig: [
        {
          name: '从报表配置拉取表格',
          icon: 'ri-table-line',
          event: () => {
            toast('从报表配置拉取表格(开发者自定义事件)')
          }
        }
      ],
      headIconConfig: [
        {
          name: 'Github',
          icon: 'ri-github-fill',
          event: () => {
            toast('跳转到Github', 'info')
            window.open(
              'https://github.com/ROYIANS/print-template-designer',
              '_blank'
            )
          }
        }
      ]
    }
  },
  methods: {
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
            element: this.$refs.designer.$el.querySelector(
              '.roy-designer-header'
            ),
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
            element: this.$refs.designer.$el.querySelector(
              '.roy-designer-aside'
            ),
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
            element:
              this.$refs.designer.$el.querySelector('.roy-designer-main'),
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
    importFile({ raw }) {
      let reader = new FileReader()
      reader.readAsText(raw, 'UTF-8')
      reader.onload = (e) => {
        this.$confirm('确定要读取该文件？将覆盖当前编辑内容！', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
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
        })
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
    exportPDF() {
      html2canvas(document.querySelector('#designer-page'), {
        scale: '5'
      }).then((canvas) => {
        let doc = new jsPDF({
          orientation: this.pageConfig.pageDirection,
          format: this.pageConfig.pageSize,
          unit: 'mm'
        })
        doc.addImage({
          imageData: canvas.toDataURL('image/jpeg'),
          format: 'JPEG',
          x: 0,
          y: 0,
          width: this.pageConfig.pageWidth,
          height: this.pageConfig.pageHeight
        })
        doc.save('打印预览.pdf')
      })
    },
    printPreview() {
      // this.print('designer-page')
    }
  }
}
</script>

<style lang="scss">
html,
body,
.height-all {
  height: 100%;
}

.head-slot {
  display: flex;
  height: 40px;
  align-items: center;

  .roy-upload-file {
    .el-upload {
      align-items: center;
      display: flex;
    }
  }

  .el-button,
  .el-button--mini {
    background: transparent !important;
    color: #fff !important;
    border: none !important;
    display: inline-flex !important;
    align-items: center !important;

    i {
      padding-right: 5px;
      font-size: 14px !important;
    }

    &:hover {
      background: var(--roy-color-primary-light-3) !important;
    }
  }

  .roy-header-icon {
    padding: 0 8px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background: var(--roy-color-primary-light-3);
    }
  }
}

.toolbar-slot-item {
  cursor: pointer;
  background: var(--roy-bg-color);
  display: grid;
  width: 18px;
  height: 18px;
  font-size: 10px;
  line-height: 18px;
  box-shadow: rgba(99, 99, 99, 0.2) 0 2px 8px 0;
  padding: 4px;
  text-align: center;
  border-radius: 4px;

  & + .roy-designer-main__toolbar__item {
    margin-left: 5px;
  }

  &:hover {
    background: var(--roy-bg-color-page);
  }

  i {
    padding: 0;
    margin: 0;
    font-size: 14px;
  }
}
</style>
