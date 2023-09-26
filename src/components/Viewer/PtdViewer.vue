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
    :title="directExport ? '打印导出' : '打印预览'"
    class="rptd-viewer"
    height="90%"
    width="90%"
  >
    <RoyLoading :loading="!initCompleted" :loading-text="loadingText">
      <div v-if="isBlankPage" class="roy-page-blank">
        <i class="ri-sticky-note-2-line"></i>
        <span>页面内容为空</span>
      </div>
      <div
        v-else
        id="roy-viewer"
        ref="viewer"
        :class="isExportPDF ? '' : 'is-show-border'"
        class="roy-viewer"
      ></div>
      <div ref="tempHolder" class="roy-temp-holder"></div>
      <div class="roy-viewer-right-conor">
        <div class="roy-viewer-btn" @click="exportPdf">
          <i class="ri-file-ppt-line"></i>
          <span>导出PDF</span>
        </div>
        <div v-print="printConfig" class="roy-viewer-btn">
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
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import print from 'vue-print-nb'
import toast from '@/utils/toast'
import { getPageGenerator } from '@/components/Viewer/page-generator'

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
    },
    fileName: {
      type: String,
      default: ''
    },
    directExport: {
      type: Boolean,
      default: false
    },
    needToast: {
      type: [Boolean, String],
      default: '建议导出PDF后再打印，更精准'
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
        const renderer = getPageGenerator({
          renderElements: this.componentData,
          pagerConfig: this.pageConfig,
          dataSet: this.dataSet,
          dataSource: this.dataSource
        })
        const renderPageHTML = await renderer.render()
        if (renderPageHTML.length) {
          const viewerElement = this.$refs.viewer
          viewerElement.innerHTML = renderPageHTML
          if (this.needToast) {
            toast(this.needToast, 'info', 5000)
          }
        } else {
          this.isBlankPage = true
        }
        this.$el.querySelector('.roy-temp-holder').style.display = 'none'
        this.$nextTick(() => {
          if (this.directExport) {
            this.exportPdf()
          } else {
            this.initCompleted = true
          }
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
        const isNormalPage = this.pageConfig.pageDirection === 'p'
        doc.addImage({
          imageData: canvas.toDataURL('image/jpeg'),
          format: 'JPEG',
          x: 0,
          y: 0,
          width: isNormalPage ? this.pageConfig.pageWidth : this.pageConfig.pageHeight,
          height: isNormalPage ? this.pageConfig.pageHeight : this.pageConfig.pageWidth
        })
      }
      doc.save(`${this.fileName || this.pageConfig.title || '预览'}.pdf`)
      this.initCompleted = true
      this.isExportPDF = false
      if (this.directExport) {
        this.$emit('update:visible', false)
      }
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
    overflow: auto;

    .roy-preview-page {
      margin: 20px auto;
    }
  }

  .is-show-border {
    .roy-preview-page {
      border: solid 1px #000;
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
    right: 25px;
    bottom: 25px;
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

::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background-color: #f4f4f4;
  border-radius: 8px;
}

::-webkit-scrollbar-track-piece {
  background-color: #f4f4f4;
  border-radius: 8px;
}

::-webkit-scrollbar-thumb {
  border-radius: 2px;
  background: #e2e2e2;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #d9d9d9;
}

::selection {
  background: #3e6dcb;
  color: #fff;
}
</style>
