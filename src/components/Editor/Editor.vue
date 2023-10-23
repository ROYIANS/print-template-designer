<template>
  <div :style="panelWidth" class="roy-designer-main__page">
    <SketchRuler
      v-show="showRuler"
      ref="sketchRuler"
      :cornerActive="false"
      :height="rulerHeight"
      :horLineArr="lines.h"
      :lang="lang"
      :palette="palette"
      :scale="realScale"
      :shadow="shadow"
      :startX="startX"
      :startY="startY"
      :thick="thick"
      :verLineArr="lines.v"
      :width="rulerWidth"
      @handleLine="handleLine"
      @onCornerClick="handleCornerClick"
    >
    </SketchRuler>
    <div id="screens" ref="screensRef" @scroll="handleScroll" @wheel="handleWheel">
      <div ref="containerRef" class="screen-container">
        <div
          id="designer-page"
          v-contextmenu="'contextmenu'"
          :style="canvasStyle"
          @contextmenu="handleContextMenu"
          @mousedown="handleMouseDown"
        >
          <ComponentAdjuster
            v-for="(item, index) in componentData"
            :key="item.id"
            :active="item.id === (curComponent || {}).id"
            :class="{ lock: item.isLock }"
            :default-style="item.style"
            :element="item"
            :index="index"
            :scale="scale"
            :style="getShapeStyle(item.style)"
          >
            <component
              :is="item.component"
              :id="'roy-component-' + item.id"
              :active="item.id === (curComponent || {}).id"
              :bind-value="item.bindValue"
              :element="item"
              :prop-value="item.propValue"
              :scale="scale"
            />
          </ComponentAdjuster>
          <!-- 选中区域 -->
          <Area v-show="isShowArea" :height="height" :start="start" :width="width" />
          <!-- 标线 -->
          <EditorLine />
          <!-- 上下边距线 -->
          <div
            :style="`top: ${pageConfig.pageMarginTop * realScale}px`"
            class="roy-margin-top-line"
          ></div>
          <div
            :style="`bottom: ${pageConfig.pageMarginBottom * realScale}px`"
            class="roy-margin-bottom-line"
          ></div>
        </div>
      </div>
    </div>
    <Context ref="contextmenu" :theme="contextTheme">
      <ContextItem
        v-for="item in contextMenu"
        :key="item.code"
        :class="`roy-context--${item.status}`"
        @click="item.event"
      >
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </ContextItem>
    </Context>
    <!-- 坐标-->
    <EditorCoordinate />
  </div>
</template>
<script>
import SketchRuler from '../SketchRuler/sketchRuler.vue'
import CONSTANT from '@/utils/constant.js'
import { mapActions, mapState } from 'vuex'
import { Context, ContextItem, directive } from '@/components/RoyContext'
import ComponentAdjuster from '@/components/Editor/ComponentAdjuster'
import { getComponentRotatedStyle, getShapeStyle } from '@/utils/style-util.js'
import Big from 'big.js'
import RoyText from '@/components/PageComponents/RoyText'
import RoySimpleText from '@/components/PageComponents/RoySimpleText'
import RoyRect from '@/components/PageComponents/RoyRect'
import RoyLine from '@/components/PageComponents/RoyLine'
import RoyImage from '@/components/PageComponents/RoyImage'
import RoyStar from '@/components/PageComponents/RoyStar'
import RoyCircle from '@/components/PageComponents/RoyCircle'
import RoySimpleTable from '@/components/PageComponents/RoyTable/RoySimpleTable.vue'
import RoyComplexTable from '@/components/PageComponents/RoyTable/RoyComplexTable'
import RoyGroup from '@/components/PageComponents/RoyGroup'
import RoyQRCode from '@/components/PageComponents/RoyQRCode.vue'
import RoyBarCode from '@/components/PageComponents/RoyBarCode.vue'
import Area from '@/components/Editor/Area'
import commonMixin from '@/mixin/commonMixin'
import { $, isPreventDrop } from '@/utils/html-util.js'
import EditorLine from '@/components/Editor/EditorLine'
import EditorCoordinate from '@/components/Editor/EditorCoordinate'

const { MIN_SCALE, MAX_SCALE } = CONSTANT

export default {
  name: 'RoyEditor',
  directives: {
    contextmenu: directive
  },
  mixins: [commonMixin],
  components: {
    EditorCoordinate,
    EditorLine,
    SketchRuler,
    Context,
    ContextItem,
    ComponentAdjuster,
    RoyText,
    RoySimpleText,
    RoyGroup,
    RoyRect,
    RoyLine,
    RoyCircle,
    RoyStar,
    RoyImage,
    RoyQRCode,
    RoyBarCode,
    RoySimpleTable,
    RoyComplexTable,
    Area
  },
  props: {
    showRight: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      rulerWidth: 0,
      rulerHeight: 0,
      startX: -19,
      startY: -25,
      lines: {
        h: [],
        v: []
      },
      thick: 20,
      lang: 'zh-CN', // 中英文
      isShowRuler: true, // 显示标尺
      isShowReferLine: true, // 显示参考线
      palette: {
        bgColor: 'rgba(225,225,225, 0)',
        longfgColor: '#BABBBC',
        shortfgColor: '#C8CDD0',
        fontColor: '#7D8694',
        shadowColor: '#E8E8E8',
        lineColor: '#4579e1',
        borderColor: '#DADADC',
        cornerActiveColor: '#4579e1'
      },
      editorX: 0,
      editorY: 0,
      start: {
        // 选中区域的起点
        x: 0,
        y: 0
      },
      width: 0,
      height: 0,
      isShowArea: false,
      svgFilterAttrs: ['width', 'height', 'top', 'left', 'rotate']
    }
  },
  computed: {
    ...mapState({
      realScale: (state) => state.printTemplateModule.rulerThings.scale,
      rectWidth: (state) => state.printTemplateModule.rulerThings.rectWidth,
      rectHeight: (state) => state.printTemplateModule.rulerThings.rectHeight,
      needReDrawRuler: (state) => state.printTemplateModule.rulerThings.needReDrawRuler,
      showRuler: (state) => state.printTemplateModule.rulerThings.showRuler,
      componentData: (state) => state.printTemplateModule.componentData,
      curComponent: (state) => state.printTemplateModule.curComponent,
      editor: (state) => state.printTemplateModule.editor,
      pageConfig: (state) => state.printTemplateModule.pageConfig
    }),
    contextTheme() {
      return this.isNightMode ? 'dark' : 'default'
    },
    contextMenu() {
      if (!this.curComponent) {
        return [
          {
            code: 'setting',
            icon: 'ri-list-settings-line',
            label: '属性',
            status: 'default',
            event: () => {
              this.$store.commit('printTemplateModule/setGlobalCount')
            }
          },
          {
            code: 'paste',
            icon: 'ri-clipboard-line',
            label: '粘贴',
            status: 'default',
            event: () => {
              this.$store.commit('printTemplateModule/paste', true)
              this.$store.commit('printTemplateModule/recordSnapshot')
            }
          }
        ]
      }
      if (this.curComponent.isLock) {
        return [
          {
            code: 'unlock',
            icon: 'ri-lock-unlock-line',
            label: '解锁',
            status: 'default',
            event: () => {
              this.$store.commit('printTemplateModule/unlock')
            }
          }
        ]
      }
      return [
        {
          code: 'setting',
          icon: 'ri-list-settings-line',
          label: '属性',
          status: 'default',
          event: () => {
            this.$store.commit('printTemplateModule/setPaletteCount')
          }
        },
        {
          code: 'copy',
          icon: 'ri-file-copy-line',
          label: '复制',
          status: 'default',
          event: () => {
            this.$store.commit('printTemplateModule/copy')
          }
        },
        {
          code: 'cut',
          icon: 'ri-scissors-cut-line',
          label: '剪切',
          status: 'default',
          event: () => {
            this.$store.commit('printTemplateModule/cut')
          }
        },
        {
          code: 'del',
          icon: 'ri-delete-bin-line',
          label: '删除',
          status: 'danger',
          event: () => {
            this.$store.commit('printTemplateModule/deleteComponent')
            this.$store.commit('printTemplateModule/recordSnapshot')
          }
        },
        {
          code: 'lock',
          icon: 'ri-lock-line',
          label: '锁定',
          status: 'default',
          event: () => {
            this.$store.commit('printTemplateModule/lock')
          }
        },
        {
          code: 'top',
          icon: 'ri-align-top',
          label: '置顶',
          status: 'default',
          event: () => {
            this.$store.commit('printTemplateModule/topComponent')
            this.$store.commit('printTemplateModule/recordSnapshot')
          }
        },
        {
          code: 'bottom',
          icon: 'ri-align-bottom',
          label: '置底',
          status: 'default',
          event: () => {
            this.$store.commit('printTemplateModule/bottomComponent')
            this.$store.commit('printTemplateModule/recordSnapshot')
          }
        },
        {
          code: 'up',
          icon: 'ri-arrow-up-line',
          label: '上移',
          status: 'default',
          event: () => {
            this.$store.commit('printTemplateModule/upComponent')
            this.$store.commit('printTemplateModule/recordSnapshot')
          }
        },
        {
          code: 'down',
          icon: 'ri-arrow-down-line',
          label: '下移',
          status: 'default',
          event: () => {
            this.$store.commit('printTemplateModule/downComponent')
            this.$store.commit('printTemplateModule/recordSnapshot')
          }
        }
      ]
    },
    scale() {
      return new Big(this.realScale).div(new Big(5)).toNumber()
    },
    shadow() {
      return {
        x: 0,
        y: 0,
        width: this.rectWidth,
        height: this.rectHeight
      }
    },
    canvasStyle() {
      return {
        width: `${this.rectWidth * 5}px`,
        height: `${this.rectHeight * 5}px`,
        transform: `scale(${this.scale})`,
        background: this.pageConfig.background,
        color: this.pageConfig.color,
        fontFamily: this.pageConfig.fontFamily,
        fontSize: this.pageConfig.fontSize,
        lineHeight: this.pageConfig.lineHeight
      }
    },
    isNightMode() {
      return this.$store.state.printTemplateModule.nightMode.isNightMode
    },
    panelWidth() {
      return this.showRight ? 'width: calc(100% - 330px);' : 'width: calc(100% - 95px);'
    }
  },
  methods: {
    ...mapActions({
      reDrawRuler: 'printTemplateModule/rulerThings/reDrawRuler',
      setScale: 'printTemplateModule/rulerThings/setScale'
    }),
    getShapeStyle,
    handleMouseDown(e) {
      // 如果没有选中组件 在画布上点击时需要调用 e.preventDefault() 防止触发 drop 事件
      if (!this.curComponent || isPreventDrop(this.curComponent.component)) {
        e.preventDefault()
      }

      this.hideArea()

      // 获取编辑器的位移信息，每次点击时都需要获取一次。主要是为了方便开发时调试用。
      const rectInfo = this.editor.getBoundingClientRect()
      this.editorX = rectInfo.x
      this.editorY = rectInfo.y

      const startX = e.clientX
      const startY = e.clientY
      this.start.x = (startX - this.editorX) / this.scale
      this.start.y = (startY - this.editorY) / this.scale
      // 展示选中区域
      this.isShowArea = true

      const move = (moveEvent) => {
        this.width = Math.abs((moveEvent.clientX - startX) / this.scale)
        this.height = Math.abs((moveEvent.clientY - startY) / this.scale)
        if (moveEvent.clientX < startX) {
          this.start.x = (moveEvent.clientX - this.editorX) / this.scale
        }

        if (moveEvent.clientY < startY) {
          this.start.y = (moveEvent.clientY - this.editorY) / this.scale
        }
      }

      const up = (e) => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)

        if (e.clientX === startX && e.clientY === startY) {
          this.hideArea()
          return
        }

        this.createGroup()
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
    handleContextMenu(e) {
      e.stopPropagation()
      e.preventDefault()
      let top = e.offsetY
      let left = e.offsetX

      this.$store.commit('printTemplateModule/showContextMenu', { top, left })
    },
    hideArea() {
      this.isShowArea = 0
      this.width = 0
      this.height = 0

      this.$store.commit('printTemplateModule/setAreaData', {
        style: {
          left: 0,
          top: 0,
          width: 0,
          height: 0
        },
        components: []
      })
    },
    createGroup() {
      // 获取选中区域的组件数据
      const areaData = this.getSelectArea()
      if (areaData.length <= 1) {
        this.hideArea()
        return
      }

      // 根据选中区域和区域中每个组件的位移信息来创建 Group 组件
      // 要遍历选择区域的每个组件，获取它们的 left top right bottom 信息来进行比较
      let top = Infinity,
        left = Infinity
      let right = -Infinity,
        bottom = -Infinity
      areaData.forEach((component) => {
        let style = {}
        if (component.component === 'Group') {
          component.propValue.forEach((item) => {
            const rectInfo = $(`#roy-component-${item.id}`).getBoundingClientRect()
            style.left = rectInfo.left - this.editorX
            style.top = rectInfo.top - this.editorY
            style.right = rectInfo.right - this.editorX
            style.bottom = rectInfo.bottom - this.editorY

            if (style.left < left) {
              left = style.left
            }
            if (style.top < top) {
              top = style.top
            }
            if (style.right > right) {
              right = style.right
            }
            if (style.bottom > bottom) {
              bottom = style.bottom
            }
          })
        } else {
          style = getComponentRotatedStyle(component.style)
        }

        if (style.left < left) {
          left = style.left
        }
        if (style.top < top) {
          top = style.top
        }
        if (style.right > right) {
          right = style.right
        }
        if (style.bottom > bottom) {
          bottom = style.bottom
        }
      })

      this.start.x = left
      this.start.y = top
      this.width = right - left
      this.height = bottom - top

      // 设置选中区域位移大小信息和区域内的组件数据
      this.$store.commit('printTemplateModule/setAreaData', {
        style: {
          left,
          top,
          width: this.width,
          height: this.height
        },
        components: areaData
      })
    },
    getSelectArea() {
      const result = []
      // 区域起点坐标
      const { x, y } = this.start
      // 计算所有的组件数据，判断是否在选中区域内
      this.componentData.forEach((component) => {
        if (component.isLock) {
          return
        }

        const { left, top, width, height } = getComponentRotatedStyle(component.style)
        if (
          x <= left &&
          y <= top &&
          left + width <= x + this.width &&
          top + height <= y + this.height
        ) {
          result.push(component)
        }
      })

      // 返回在选中区域内的所有组件
      return result
    },
    handleLine(lines) {
      this.lines = lines
    },
    handleCornerClick() {},
    handleScroll() {
      const screensRect = document.querySelector('#screens').getBoundingClientRect()
      const canvasRect = document.querySelector('#designer-page').getBoundingClientRect()
      // 标尺开始的刻度
      const startX = (screensRect.left + this.thick - canvasRect.left) / this.realScale
      const startY = (screensRect.top + this.thick - canvasRect.top) / this.realScale

      this.startX = startX
      this.startY = startY
    },
    // 控制缩放值
    handleWheel(e) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const nextScale = parseFloat(Math.max(0.2, this.scale - e.deltaY / 500).toFixed(2))
        if (nextScale <= MAX_SCALE && nextScale >= MIN_SCALE) {
          this.setScale(nextScale)
        }
      }
      this.$nextTick(() => {
        this.handleScroll()
      })
    }
  },
  mounted() {
    this.rulerWidth = this.$el.offsetWidth
    this.rulerHeight = this.$el.offsetHeight
    this.$refs.screensRef.scrollLeft =
      this.$refs.containerRef.getBoundingClientRect().width / 2 - this.rectWidth
    // 获取编辑器元素
    this.$store.commit('printTemplateModule/getEditor')
  },
  watch: {
    isNightMode: {
      handler(newVal) {
        this.palette = {
          bgColor: 'rgba(225,225,225, 0)',
          longfgColor: '#BABBBC',
          shortfgColor: '#C8CDD0',
          fontColor: '#7D8694',
          shadowColor: newVal ? '#444444' : '#E8E8E8',
          lineColor: '#4579e1',
          borderColor: newVal ? '#636466' : '#DADADC',
          cornerActiveColor: '#4579e1'
        }
        this.reDrawRuler()
      }
    },
    showRight: {
      handler() {
        this.$nextTick(() => {
          this.rulerWidth = this.$el.offsetWidth
          this.rulerHeight = this.$el.offsetHeight
          this.$refs.screensRef.scrollLeft =
            this.$refs.containerRef.getBoundingClientRect().width / 2 - this.rectWidth
          this.reDrawRuler()
        })
      }
    },
    needReDrawRuler: {
      handler() {
        this.$nextTick(() => {
          this.handleScroll()
          this.$refs.sketchRuler?.$children[0]?.$children[0]?.drawRuler()
          this.$refs.sketchRuler?.$children[1]?.$children[0]?.drawRuler()
        })
      }
    }
  }
}
</script>
<style lang="scss">
#screens {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.screen-container {
  position: absolute;
  width: 5000px;
  height: 5000px;
}

.roy-designer-main__page {
  position: absolute;
  height: calc(100% - 100px);
  border: 1px solid var(--roy-border-color);
  padding: 0 !important;
  margin: 0;
  background-color: rgb(255, 255, 255);
  background-image: linear-gradient(45deg, rgb(247, 247, 247) 25%, transparent 25%),
    linear-gradient(-45deg, rgb(247, 247, 247) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgb(247, 247, 247) 75%),
    linear-gradient(-45deg, transparent 75%, rgb(247, 247, 247) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;

  #designer-page {
    background: #fff;
    box-shadow: rgba(0, 0, 0, 0.12) 0 1px 3px, rgba(0, 0, 0, 0.24) 0 1px 2px;
    position: absolute;
    top: 60px;
    transform-origin: 50% 0;
    margin-left: -80px;
    left: 50%;

    .lock {
      opacity: 0.5;

      &:hover {
        cursor: not-allowed;
      }
    }
  }

  .roy-margin-top-line,
  .roy-margin-bottom-line {
    position: absolute;
    height: 0;
    width: 100%;
    border-top: 1px dashed #ccc;
  }
}

#roy-print-template-designer[theme='dark'] {
  .roy-designer-main__page {
    background-color: #1c1c1c;
    background-image: linear-gradient(45deg, #212121 25%, transparent 25%),
      linear-gradient(-45deg, #232323 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #232323 75%),
      linear-gradient(-45deg, transparent 75%, #232323 75%);
  }

  #designer-page {
    filter: brightness(0.6);
  }
}
</style>
