<!--
* @description 打印模板预览组件
* @filename PtdViewer.vue
* @author ROYIANS
* @date 2022/11/11 15:31
!-->
<template>
  <RoyModal
    v-if="visibleIn"
    :show.sync="visibleIn"
    title="打印预览"
    height="90%"
    width="90%"
    class="rptd-viewer"
  >
    <RoyLoading :loading="!initCompleted" :loading-text="loadingText">
      <div v-if="isBlankPage" class="roy-page-blank">
        <i class="ri-sticky-note-2-line"></i>
        <span>页面内容为空</span>
      </div>
      <div v-else ref="viewer" class="roy-viewer" id="roy-viewer"></div>
      <div ref="tempHolder" class="roy-temp-holder"></div>
      <div class="roy-viewer-right-conor">
        <div class="roy-viewer-btn" @click="exportPdf">
          <i class="ri-file-ppt-line"></i>
          <span>导出PDF</span>
        </div>
        <div class="roy-viewer-btn" v-print="printConfig">
          <i class="ri-printer-line"></i>
          <span>打印</span>
        </div>
      </div>
    </RoyLoading>
  </RoyModal>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import RoyModal from '@/components/RoyModal/RoyModal'
import RoyLoading from '@/components/RoyLoading'
import generateViewerElement from '@/components/Viewer/viewer'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import print from 'vue-print-nb'

/**
 * 打印模板预览组件
 */
export default {
  name: 'PtdViewer',
  mixins: [commonMixin],
  components: {
    RoyLoading,
    RoyModal
  },
  directives: {
    print
  },
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    componentData: {
      type: Array,
      default: () => {
        return []
      }
    },
    pageConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    dataSource: {
      type: Array,
      default: () => {
        return []
      }
    },
    dataSet: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  computed: {
    loadingText() {
      if (this.isExportPDF) {
        return `正在导出PDF，正在处理第${this.curPage}页/共${this.totalPage}页`
      } else {
        return '正在生成页面...'
      }
    }
  },
  data() {
    return {
      visibleIn: false,
      initCompleted: false,
      isBlankPage: false,
      isExportPDF: false,
      totalPage: 0,
      curPage: 0,
      printConfig: {
        id: 'roy-viewer'
      }
    }
  },
  methods: {
    initMounted() {
      this.$nextTick(async () => {
        this.initCompleted = false
        const renderPage = await generateViewerElement(
          this.componentData,
          this.pageConfig,
          this.dataSource,
          this.dataSet,
          this.$refs.tempHolder
        )
        if (renderPage.length) {
          const viewerElement = this.$refs.viewer
          renderPage.forEach((el) => {
            viewerElement.appendChild(el)
          })
        } else {
          this.isBlankPage = true
        }
        this.$nextTick(() => {
          this.initCompleted = true
        })
      })
    },
    async exportPdf() {
      const pages = this.$el.getElementsByClassName('roy-preview-page')
      if (!pages.length) {
        return
      }
      this.isExportPDF = true
      this.initCompleted = false
      let doc = new jsPDF({
        orientation: this.pageConfig.pageDirection,
        format: this.pageConfig.pageSize,
        unit: 'mm'
      })
      this.totalPage = pages.length
      for (let i = 0; i < pages.length; i++) {
        this.curPage = i + 1
        if (i !== 0) {
          doc.addPage(this.pageConfig.pageSize, this.pageConfig.pageDirection)
        }
        const canvas = await html2canvas(pages[i], {
          scale: '5'
        })
        doc.addImage({
          imageData: canvas.toDataURL('image/jpeg'),
          format: 'JPEG',
          x: 0,
          y: 0,
          width: this.pageConfig.pageWidth,
          height: this.pageConfig.pageHeight
        })
      }
      doc.save(`${this.pageConfig.title || '预览'}.pdf`)
      this.initCompleted = true
      this.isExportPDF = false
    }
  },
  created() {
    this.visibleIn = this.visible
  },
  mounted() {
    this.initMounted()
  },
  watch: {
    visibleIn(newVal) {
      this.$emit('update:visible', newVal)
    }
  }
}
</script>

<style lang="scss">
.rptd-viewer {
  height: 100%;
  padding: 0;
  margin: 0;
  .vxe-modal--body {
    background: #efefef;
  }
  .roy-viewer {
    height: 100%;
    width: 100%;
    background: #efefef;
    display: block;
    .roy-preview-page {
      margin-left: auto;
      margin-right: auto;
      border: solid 1px #000;
      margin-bottom: 0.2in;
    }
  }
  .roy-temp-holder {
    z-index: -1;
  }
  .roy-page-blank {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }
  .roy-viewer-right-conor {
    right: 15px;
    bottom: 15px;
    position: absolute;
    .roy-viewer-btn {
      width: 100px;
      height: 24px;
      font-size: 14px;
      line-height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #4579e1;
      border-radius: 4px;
      user-select: none;
      cursor: pointer;
      color: #fff;
      box-shadow: rgba(69, 121, 225, 0.1) 0 4px 12px;
      & + .roy-viewer-btn {
        margin-top: 10px;
      }
      &:hover {
        box-shadow: none;
      }
    }
  }
}
@page {
  .roy-viewer {
    width: 0;
    height: 0;
    .roy-preview-page {
      margin: 0;
      padding: 0;
      border: none;
    }
  }
}
</style>
