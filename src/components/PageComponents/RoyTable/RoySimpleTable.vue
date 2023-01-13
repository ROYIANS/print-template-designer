<template>
  <div class="roy-simple-table">
    <Context ref="simple-table-contextmenu" :theme="contextTheme">
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
    <StyledSimpleTable v-bind="style">
      <table ref="royTable">
        <tbody>
          <tr v-for="(row, index) in tableConfig.rows" :key="index">
            <td
              v-for="(col, index) in tableConfig.cols"
              v-contextmenu="'simple-table-contextmenu'"
              v-show="isNeedShow(row - 1, col - 1)"
              :class="{
                'roy-simple-table-cell--selected': getIsActiveCell(row, col)
              }"
              :key="index"
              :colspan="getItColSpan(row, col)"
              :rowspan="getItRowSpan(row, col)"
              :style="{
                width: `${tableData[`${row}-${col}`].width}px`,
                height: `${tableData[`${row}-${col}`].height}px`,
                padding: '0',
                overflow: 'hidden'
              }"
              @mousedown.stop="(e) => handleCellMousedown(e, row, col)"
              @mouseenter.stop.prevent="handleCellMouseenter(row, col)"
              @mouseup="handleMouseUp"
              @contextmenu="handleContendMenu"
            >
              <component
                v-if="tableData[`${row}-${col}`]"
                :is="
                  tableData[`${row}-${col}`] &&
                  tableData[`${row}-${col}`].component
                "
                :id="`roy-component-${tableData[`${row}-${col}`].id}`"
                :cur-id="curClickedId"
                :element="tableData[`${row}-${col}`]"
                :prop-value.sync="tableData[`${row}-${col}`].propValue"
                :bind-value.sync="tableData[`${row}-${col}`].bindValue"
                :style="{
                  width: `${tableData[`${row}-${col}`].width}px`,
                  height: `${tableData[`${row}-${col}`].height}px`
                }"
                @activeCell="onCellActive"
                @componentUpdated="
                  (value) => {
                    componentUpdated(row, col, value)
                  }
                "
              />
              <div
                v-if="getIsActiveCell(row, col) && selectedCells.length === 1"
                class="roy-simple-table__cell__corner"
                @mousedown="handleMouseDownOnResize(row, col, $event)"
              ></div>
            </td>
          </tr>
        </tbody>
      </table>
    </StyledSimpleTable>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { Context, ContextItem, directive } from '@/components/RoyContext'
import RoySimpleTextIn from './RoySimpleTextInTable.vue'
import RoyTextIn from '@/components/PageComponents/RoyTable/RoyTextInTable'
import commonMixin from '@/mixin/commonMixin'
import toast from '@/utils/toast'
import { StyledSimpleTable } from '@/components/PageComponents/style'

const defaultTableCell = {
  icon: 'ri-text',
  code: 'text',
  name: '文本',
  component: 'RoySimpleTextIn',
  propValue: '',
  width: 100,
  height: 30,
  textStyle: {
    width: '100%',
    height: '100%',
    fontSize: 12,
    background: null,
    rotate: 0,
    padding: '0'
  },
  simpleTextStyle: {},
  style: {
    color: '#212121',
    borderRadius: 'inherit',
    padding: '0',
    margin: '0',
    fontFamily: 'default',
    lineHeight: '1',
    letterSpacing: '0',
    borderWidth: 0,
    borderColor: '#212121',
    borderType: 'none',
    width: '100%',
    height: '100%',
    fontSize: 12,
    background: null,
    rotate: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    fontWeight: 'normal',
    fontStyle: 'normal',
    isUnderLine: false,
    isDelLine: false
  },
  groupStyle: {}
}

export default {
  name: 'RoySimpleTable',
  mixins: [commonMixin],
  directives: {
    contextmenu: directive
  },
  components: {
    Context,
    ContextItem,
    RoyTextIn,
    RoySimpleTextIn,
    StyledSimpleTable
  },
  props: {
    element: {
      type: Object,
      default: () => {}
    },
    propValue: {
      type: Object,
      default: () => {
        return {}
      }
    },
    scale: {
      required: true,
      type: [Number, String],
      default: 1
    }
  },
  data() {
    return {
      curClickedId: '',
      // 这块其实初始设置 tableConfig： {cols: 3, rows: 2} 就可以 把tabelDate设置成计算属性，layoutDetail 用js生成更方便
      tableConfig: {
        cols: 2,
        rows: 2,
        layoutDetail: []
      },
      tableData: {
        '1-1': {
          ...this.deepCopy(defaultTableCell),
          id: this.getUuid()
        },
        '1-2': {
          ...this.deepCopy(defaultTableCell),
          id: this.getUuid()
        },
        '2-1': {
          ...this.deepCopy(defaultTableCell),
          id: this.getUuid()
        },
        '2-2': {
          ...this.deepCopy(defaultTableCell),
          id: this.getUuid()
        }
      },
      selectedCells: [],
      // mousedown的时候设置为其他值 否则都是-1
      selectionHold: -1,
      startX: -1,
      startY: -1,
      endX: -1,
      endY: -1,
      contextPos: {
        l: 0,
        t: 0
      },
      contextMenu: [
        {
          label: '添加行',
          code: 'addRow',
          icon: 'ri-insert-row-bottom',
          status: 'default',
          event: () => {
            this.menyItemCmd('addRow')
          }
        },
        {
          label: '添加列',
          code: 'addCol',
          icon: 'ri-insert-column-right',
          status: 'default',
          event: () => {
            this.menyItemCmd('addCol')
          }
        },
        {
          label: '删除行',
          code: 'delRow',
          icon: 'ri-delete-row',
          status: 'default',
          event: () => {
            this.menyItemCmd('delRow')
          }
        },
        {
          label: '删除列',
          code: 'delCol',
          icon: 'ri-delete-column',
          status: 'default',
          event: () => {
            this.menyItemCmd('delCol')
          }
        },
        {
          label: '合并',
          code: 'merge',
          icon: 'ri-merge-cells-horizontal',
          status: 'default',
          event: () => {
            this.menyItemCmd('merge')
          }
        },
        {
          label: '拆分',
          code: 'split',
          icon: 'ri-split-cells-horizontal',
          status: 'default',
          event: () => {
            this.menyItemCmd('split')
          }
        },
        {
          label: '清空选择',
          code: 'clearSelection',
          icon: 'ri-eraser-line',
          status: 'default',
          event: () => {
            this.menyItemCmd('clearSelection')
          }
        },
        {
          code: 'setting',
          icon: 'ri-list-settings-line',
          label: '属性',
          status: 'default',
          event: () => {
            this.$store.commit('printTemplateModule/setPaletteCount')
          }
        }
      ]
    }
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  computed: {
    ...mapState({
      editor: (state) => state.printTemplateModule.editor,
      isNightMode: (state) => state.printTemplateModule.nightMode.isNightMode
    }),
    style() {
      return this.element.style || {}
    },
    contextTheme() {
      return this.isNightMode ? 'dark' : 'default'
    },
    hiddenTdMaps() {
      let hiddenTdMaps = {}
      let tableConfig = this.tableConfig
      for (let i = 0; i < tableConfig.rows; i++) {
        for (let j = 0; j < tableConfig.cols; j++) {
          if (tableConfig.layoutDetail[i * tableConfig.cols + j]) {
            let colInfo = tableConfig.layoutDetail[i * tableConfig.cols + j]
            if (
              (colInfo.colSpan && colInfo.colSpan > 1) ||
              (colInfo.rowSpan && colInfo.rowSpan > 1)
            ) {
              for (let row = i; row < i + (colInfo.rowSpan || 1); row++) {
                // col = (row === i ? j + 1 : j) 是为了避开自己
                for (
                  let col = row === i ? j + 1 : j;
                  col < j + (colInfo.colSpan || 1);
                  col++
                ) {
                  hiddenTdMaps[`${row}_${col}`] = true
                }
              }
            }
          }
        }
      }
      return hiddenTdMaps
    }
  },
  methods: {
    initMounted() {
      let preSettled = false
      if (this.propValue.tableConfig) {
        preSettled = true
        this.tableConfig = this.deepCopy(this.propValue.tableConfig)
      }
      if (this.propValue.tableData) {
        preSettled = true
        this.tableData = this.deepCopy(this.propValue.tableData)
      }
      if (!preSettled) {
        this.reRenderTableLayout()
      }
    },
    clearSelection() {
      this.selectedCells = []
    },
    isNeedShow(row, col) {
      return !this.hiddenTdMaps[`${row}_${col}`]
    },
    getIsActiveCell(row, col) {
      return this.selectedCells.includes(
        (row - 1) * this.tableConfig.cols + col - 1
      )
    },
    getItColSpan(row, col) {
      return (
        this.tableConfig.layoutDetail[
          (row - 1) * this.tableConfig.cols + col - 1
        ] &&
        this.tableConfig.layoutDetail[
          (row - 1) * this.tableConfig.cols + col - 1
        ]['colSpan']
      )
    },
    getItRowSpan(row, col) {
      return (
        this.tableConfig.layoutDetail[
          (row - 1) * this.tableConfig.cols + col - 1
        ] &&
        this.tableConfig.layoutDetail[
          (row - 1) * this.tableConfig.cols + col - 1
        ]['rowSpan']
      )
    },
    handleCellMousedown(e, x, y) {
      this.$refs['simple-table-contextmenu'].hide()
      this.$store.commit('printTemplateModule/setInEditorStatus', true)
      this.$store.commit('printTemplateModule/setClickComponentStatus', true)
      this.$store.commit('printTemplateModule/setCurTableCell', {
        component: this.tableData[`${x}-${y}`]
      })
      // e.witch = 1 是鼠标左键
      if (e.which !== 1) {
        if (this.endX === -1 && this.endY === -1) {
          let cellIndex = (x - 1) * this.tableConfig.cols + y - 1
          this.startX = x
          this.startY = y
          this.selectedCells = [cellIndex]
        }
        return
      }
      let cellIndex = (x - 1) * this.tableConfig.cols + y - 1
      this.startX = x
      this.startY = y
      this.selectedCells = [cellIndex]
      this.endX = this.endY = -1
      // mousedown标志
      this.selectionHold = cellIndex
    },
    handleCellMouseenter(x, y) {
      if (this.selectionHold !== -1) {
        this.endX = x
        this.endY = y
        this.rendSelectedCell()
      }
    },
    rendSelectedCell() {
      let startX = Math.min(this.startX, this.endX)
      let startY = Math.min(this.startY, this.endY)
      let endX = Math.max(this.startX, this.endX)
      let endY = Math.max(this.startY, this.endY)
      let tableConfig = this.tableConfig
      let selectedCells = []
      for (let row = 1; row <= tableConfig.rows; row++) {
        for (let col = 1; col <= tableConfig.cols; col++) {
          if (row >= startX && row <= endX && col >= startY && col <= endY) {
            selectedCells.push((row - 1) * this.tableConfig.cols + col - 1)
          }
        }
      }
      this.selectedCells = selectedCells
    },
    handleMouseUp() {
      this.selectionHold = -1
    },
    handleContendMenu(e) {
      e.preventDefault()
      e.stopPropagation()
    },
    reRenderTableLayout() {
      let arr = []
      for (let i = 0; i < this.tableConfig.cols * this.tableConfig.rows; i++) {
        arr.push({
          uniId: this.getUuid(),
          colSpan: 1,
          rowSpan: 1
        })
      }
      this.tableConfig.layoutDetail = arr
    },
    menyItemCmd(cmd) {
      switch (cmd) {
        case 'merge':
          this.mergeCell()
          break
        case 'split':
          this.splitCell()
          break
        case 'delRow':
          if (this.tableConfig.rows === 1) {
            toast('只剩一行了')
            return
          }
          this.tableConfig.rows = this.tableConfig.rows - 1
          // 行号 列号变化时候  需要重新渲染 this.tableConfig.layoutDetail
          this.reRenderTableLayout()
          break
        case 'delCol':
          if (this.tableConfig.cols === 1) {
            toast('只剩一列了')
            return
          }
          this.tableConfig.cols = this.tableConfig.cols - 1
          this.reRenderTableLayout()
          break
        case 'addRow':
          this.addRow()
          break
        case 'addCol':
          this.addCol()
          break
        case 'clearSelection':
          this.clearSelection()
          break
      }
    },
    mergeCell() {
      let tableConfig = this.tableConfig
      const startX = Math.min(this.startX, this.endX)
      const startY = Math.min(this.startY, this.endY)
      const endX = Math.max(this.startX, this.endX)
      const endY = Math.max(this.startY, this.endY)
      const startIndex = (startX - 1) * tableConfig.cols + startY - 1
      const groupId = this.getUuid()
      if (
        startX === -1 ||
        startY === -1 ||
        endX === -1 ||
        endY === -1 ||
        (startX === endX && startY === endY)
      ) {
        toast('请选中要合并的单元格')
        return
      }
      for (let i = startX; i <= endX; i++) {
        for (let j = startY; j <= endY; j++) {
          const curIndex = (i - 1) * tableConfig.cols + j - 1
          this.tableConfig.layoutDetail[curIndex].groupId = groupId
          if (curIndex === startIndex) {
            let curTableData = this.tableData[`${i}-${j}`]
            let startCellData = this.tableData[`${startX}-${startY}`]
            let endCellData = this.tableData[`${endX}-${endY}`]
            let startComponent = document
              .getElementById(`roy-component-${startCellData.id}`)
              .getBoundingClientRect()
            let endComponent = document
              .getElementById(`roy-component-${endCellData.id}`)
              .getBoundingClientRect()
            const { x: startAriaX, y: startAriaY } = startComponent
            const {
              x: endAriaX,
              y: endAriaY,
              width: endWidth,
              height: endHeight
            } = endComponent
            curTableData.width = Math.abs(endAriaX - startAriaX) + endWidth
            curTableData.height = Math.abs(endAriaY - startAriaY) + endHeight
            this.tableConfig.layoutDetail[curIndex].rowSpan = endX - startX + 1
            this.tableConfig.layoutDetail[curIndex].colSpan = endY - startY + 1
          } else {
            this.tableConfig.layoutDetail[curIndex].rowSpan = 0
            this.tableConfig.layoutDetail[curIndex].colSpan = 0
          }
        }
      }
    },
    splitCell() {
      let tableConfig = this.tableConfig
      let startX = this.startX
      let startY = this.startY
      if (startX === -1 || startY === -1) {
        toast('请选中要拆分的单元格')
        return
      }
      let startIndex = (startX - 1) * tableConfig.cols + startY - 1
      const { groupId } = this.tableConfig.layoutDetail[startIndex]
      if (!groupId) {
        return
      }
      this.tableConfig.layoutDetail.forEach((v) => {
        if (v.groupId && v.groupId === groupId) {
          v.rowSpan = 1
          v.colSpan = 1
          v.groupId = undefined
        }
      })
    },
    addCol() {
      this.tableConfig.cols = this.tableConfig.cols + 1
      const colArray = [...new Array(this.tableConfig.cols).keys()]
      colArray.map((key) => {
        const firstCol = this.tableData[`${key + 1}-1`]
        this.tableData[`${key + 1}-${this.tableConfig.cols}`] = {
          ...defaultTableCell,
          height: firstCol ? firstCol.height : defaultTableCell.height,
          id: this.getUuid()
        }
      })
      this.reRenderTableLayout()
    },
    addRow() {
      this.tableConfig.rows = this.tableConfig.rows + 1
      const colArray = [...new Array(this.tableConfig.rows).keys()]
      colArray.map((key) => {
        const firstRow = this.tableData[`1-${key + 1}`]
        this.tableData[`${this.tableConfig.rows}-${key + 1}`] = {
          ...defaultTableCell,
          width: firstRow ? firstRow.width : defaultTableCell.width,
          id: this.getUuid()
        }
      })
      this.reRenderTableLayout()
    },
    onCellActive({ id }) {
      this.curClickedId = id
    },
    handleMouseDownOnResize(row, col, e) {
      e.stopPropagation()
      e.preventDefault()
      const element = this.tableData[`${row}-${col}`]
      const curIndex = (row - 1) * this.tableConfig.cols + col - 1
      const curTableConfig = this.tableConfig.layoutDetail[curIndex]
      if (!element) {
        return
      }
      const comEle = document.getElementById(`roy-component-${element.id}`)
      if (!comEle) {
        return
      }
      const move = (moveEvent) => {
        const { width, height } = comEle.getBoundingClientRect()
        const deltaX = moveEvent.movementX
        const deltaY = moveEvent.movementY

        for (let ir = 1; ir <= this.tableConfig.rows; ir++) {
          const irIndex = (ir - 1) * this.tableConfig.cols + col - 1
          const irCellConfig = this.tableConfig.layoutDetail[irIndex]
          if (irCellConfig.colSpan === curTableConfig.colSpan) {
            this.tableData[`${ir}-${col}`].width = (width + deltaX) / this.scale
          }
        }
        for (let ic = 1; ic <= this.tableConfig.cols; ic++) {
          const icIndex = (row - 1) * this.tableConfig.cols + ic - 1
          const icCellConfig = this.tableConfig.layoutDetail[icIndex]
          if (icCellConfig.rowSpan === curTableConfig.rowSpan) {
            this.tableData[`${row}-${ic}`].height =
              (height + deltaY) / this.scale
          }
        }
      }
      const up = () => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
    setTablePropValue() {
      const propValue = {
        tableData: this.deepCopy(this.tableData),
        tableConfig: this.deepCopy(this.tableConfig)
      }
      this.$store.commit('printTemplateModule/setPropValue', {
        id: this.element.id,
        propValue
      })
      // this.$emit('update:propValue', propValue)
      this.$store.commit('printTemplateModule/updateDataValue', {
        data: this.element,
        value: propValue,
        key: 'propValue'
      })
      this.$emit('componentUpdated', propValue)
    },
    componentUpdated(row, col, value) {
      let curTableCell = this.tableData[`${row}-${col}`]
      curTableCell.propValue = value
      this.setTablePropValue()
    }
  },
  watch: {
    tableData: {
      handler() {
        this.setTablePropValue()
      },
      deep: true,
      immediate: true
    },
    tableConfig: {
      handler() {
        this.setTablePropValue()
      },
      deep: true,
      immediate: true
    }
  }
}
</script>

<style lang="scss">
.roy-simple-table {
  user-select: none;
}
</style>
