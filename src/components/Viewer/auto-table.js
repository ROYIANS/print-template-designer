/*
 * @Author: ROYIANS
 * @Date: 2022/11/22 15:32
 * @Description: 输入表格数据，自动生成分页表格
 * @sign:
 * ╦═╗╔═╗╦ ╦╦╔═╗╔╗╔╔═╗
 * ╠╦╝║ ║╚╦╝║╠═╣║║║╚═╗
 * ╩╚═╚═╝ ╩ ╩╩ ╩╝╚╝╚═╝
 */
import { CONFIG } from '@/components/Viewer/viewer-constant'
import { StyledSimpleText, StyledText } from '@/components/PageComponents/style'
import Vue from 'vue'
import { RenderUtil } from '@/components/Viewer/render-util'

export class AutoTable {
  constructor({
    type,
    propValue,
    pagerConfig,
    tempHolder,
    dataSet,
    dataSource
  }) {
    const { COMMON_SCALE } = CONFIG
    const {
      pageHeight,
      pageWidth,
      pageDirection,
      pageMarginBottom,
      pageMarginTop
    } = pagerConfig
    this.realPageHeight =
      (pageDirection === 'p' ? pageHeight : pageWidth) * COMMON_SCALE
    this.realPageMarginBottom = pageMarginBottom * COMMON_SCALE
    this.realPageMarginTop = pageMarginTop * COMMON_SCALE
    this.type = type
    this.propValue = propValue
    this.pagerConfig = pagerConfig
    this.tempHolder = tempHolder
    this.dataSet = dataSet
    this.dataSource = dataSource
  }

  getPagedTable() {
    return [this.getOriginTableItem()]
  }

  getOriginTableItem() {
    switch (this.type) {
      case 'RoySimpleTable':
        return this.generateSimpleTable()
      case 'RoyComplexTable':
        return this.generateComplexTable()
    }
  }

  generateSimpleTable() {
    const { tableConfig, tableData } = this.propValue
    const { rows, cols } = tableConfig
    const hiddenTdMap = this.getHiddenTd()
    const tableHeadStart = '<table>'
    const tableHeadEnd = '</table>'
    const tableBodyStart = '<tbody>'
    const tableBodyEnd = '</tbody>'
    const trHtml = Array.apply(null, Array(rows))
      .map((_, rI) => {
        const rowIndex = rI + 1
        const tdHtml = Array.apply(null, Array(cols))
          .map((_, cI) => {
            const colIndex = cI + 1
            const notShowThisTd = hiddenTdMap[`${rI}_${cI}`]
            const rowSpan = this.getItRowSpan(rowIndex, colIndex)
            const colSpan = this.getItColSpan(rowIndex, colIndex)
            const curTableData = tableData[`${rowIndex}-${colIndex}`]
            let innerHtml = ''
            switch (curTableData.component) {
              case 'RoySimpleTextIn':
                innerHtml = this.generateSimpleText(curTableData)
                break
              case 'RoyTextIn':
                innerHtml = this.generateRichText(curTableData)
                break
            }
            return `
              <td
                style='
                  ${notShowThisTd ? 'display: none;' : ''}
                  ${
                    curTableData.component !== 'RoyTextIn'
                      ? `height: ${curTableData.height}px;`
                      : ''
                  }
                  width: ${curTableData.width}px;
                  padding: 0;
                '
                rowspan='${rowSpan}'
                colspan='${colSpan}'
              >${innerHtml}</td>
            `
          })
          .join('')
        return `<tr class='roy-simple-table-row'>${tdHtml}</tr>`
      })
      .join('')
    return `${tableHeadStart}${tableBodyStart} ${trHtml} ${tableBodyEnd}${tableHeadEnd}`
  }

  generateComplexTable() {
    const { tableRowHeight, tableDataSource, tableCols, bodyTableWidth } =
      this.propValue
    const tableData = this.dataSet[tableDataSource] || []
    const tableHead = tableCols
      .map((item) => {
        return `<th style='width: ${item.width}px; height: ${tableRowHeight}px'>${item.title}</th>`
      })
      .join('')
    const tableBody = tableData
      .map((row) => {
        let tdEle = tableCols
          .map((col) => {
            const { field, formatter, align } = col
            return `<td height="${tableRowHeight}px" style="text-align: ${align}">${RenderUtil.getDataWithTypeConvertedByDataSource(
              row[field],
              formatter
            )}</td>`
          })
          .join('')
        return `<tr class="roy-complex-table-row">${tdEle}</tr>`
      })
      .join('')
    return {
      tableStart: `<table class="rendered-roy-complex-table__body" style="width: ${bodyTableWidth}px">`,
      tableHead: `<thead class="roy-complex-table-thead">${tableHead}</thead>`,
      tableBody: `<tbody>${tableBody}</tbody>`,
      tableEnd: '</table>',
      tableWidth: bodyTableWidth
    }
  }

  generateSimpleText(element) {
    let StyledSimpleTextConstructor = Vue.extend(StyledSimpleText)
    const { propValue, bindValue, style } = element
    let afterPropValue = propValue
    if (bindValue) {
      const { field } = bindValue
      afterPropValue = RenderUtil.getDataConvertedByDataSource(
        this.dataSet[field],
        field,
        this.dataSource
      )
    }
    const instance = new StyledSimpleTextConstructor({
      propsData: style
    })
    instance.$mount()
    const newElement = instance.$el
    newElement.style.width = '100%'
    newElement.style.height = `${element.height}px`
    newElement.style.position = 'static'
    newElement.innerHTML = afterPropValue
    newElement.style.height = `${element.height}px`
    const res = newElement.outerHTML
    instance.$destroy()
    return res
  }

  generateRichText(element) {
    let StyledTextConstructor = Vue.extend(StyledText)
    const { propValue, style } = element
    const afterPropValue = RenderUtil.replaceTextWithDataSource(
      propValue,
      this.dataSet,
      this.dataSource
    )
    const instance = new StyledTextConstructor({
      propsData: style
    })
    instance.$mount()
    const newElement = instance.$el
    newElement.style.width = '100%'
    newElement.style.position = 'static'
    newElement.innerHTML = afterPropValue
    const res = newElement.outerHTML
    instance.$destroy()
    return res
  }

  getHiddenTd() {
    let hiddenTdMaps = {}
    let { tableConfig } = this.propValue
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
  getItColSpan(row, col) {
    let { tableConfig } = this.propValue
    return (
      tableConfig.layoutDetail[(row - 1) * tableConfig.cols + col - 1] &&
      tableConfig.layoutDetail[(row - 1) * tableConfig.cols + col - 1].colSpan
    )
  }
  getItRowSpan(row, col) {
    let { tableConfig } = this.propValue
    return (
      tableConfig.layoutDetail[(row - 1) * tableConfig.cols + col - 1] &&
      tableConfig.layoutDetail[(row - 1) * tableConfig.cols + col - 1].rowSpan
    )
  }
}
