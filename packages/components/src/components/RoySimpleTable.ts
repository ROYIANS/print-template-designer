import type { ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'

export interface TableCellData {
  id: string
  propValue: string
  width: number
  height: number
  style: Record<string, unknown>
  bindValue?: unknown
}

export interface TableConfig {
  rows: number
  cols: number
  layoutDetail: Array<{
    uniId?: string
    colSpan?: number
    rowSpan?: number
    groupId?: string
  }>
}

export interface SimpleTablePropValue {
  tableConfig?: TableConfig
  tableData?: Record<string, TableCellData>
}

export class RoySimpleTable extends BaseComponent {

  constructor(schema: ComponentSchema) {
    super(schema)
  }

  protected render(): void {
    this.container.classList.add('ptd-simple-table')
    this.container.innerHTML = ''

    const propValue = this.schema.propValue as SimpleTablePropValue | null
    const tableConfig = propValue?.tableConfig ?? { rows: 2, cols: 2, layoutDetail: [] }
    const tableData = propValue?.tableData ?? {}

    const table = document.createElement('table')
    const tbody = document.createElement('tbody')
    table.appendChild(tbody)

    const hiddenMap = this.buildHiddenMap(tableConfig)

    for (let row = 1; row <= tableConfig.rows; row++) {
      const tr = document.createElement('tr')
      for (let col = 1; col <= tableConfig.cols; col++) {
        if (hiddenMap[`${row - 1}_${col - 1}`]) continue

        const td = document.createElement('td')
        const layoutIndex = (row - 1) * tableConfig.cols + col - 1
        const layout = tableConfig.layoutDetail[layoutIndex]

        if (layout?.colSpan && layout.colSpan > 1) td.colSpan = layout.colSpan
        if (layout?.rowSpan && layout.rowSpan > 1) td.rowSpan = layout.rowSpan

        const cellData = tableData[`${row}-${col}`]
        if (cellData) {
          td.style.width = `${cellData.width}px`
          td.style.height = `${cellData.height}px`
          td.style.padding = '0'
          td.style.overflow = 'hidden'
          const inner = document.createElement('div')
          inner.style.width = '100%'
          inner.style.height = '100%'
          inner.innerHTML = typeof cellData.propValue === 'string' ? cellData.propValue : ''
          td.appendChild(inner)
        }

        tr.appendChild(td)
      }
      tbody.appendChild(tr)
    }

    this.container.appendChild(table)
  }

  private buildHiddenMap(tableConfig: TableConfig): Record<string, boolean> {
    const hidden: Record<string, boolean> = {}
    for (let i = 0; i < tableConfig.rows; i++) {
      for (let j = 0; j < tableConfig.cols; j++) {
        const layout = tableConfig.layoutDetail[i * tableConfig.cols + j]
        if (layout && ((layout.colSpan && layout.colSpan > 1) || (layout.rowSpan && layout.rowSpan > 1))) {
          const rowSpan = layout.rowSpan ?? 1
          const colSpan = layout.colSpan ?? 1
          for (let r = i; r < i + rowSpan; r++) {
            for (let c = r === i ? j + 1 : j; c < j + colSpan; c++) {
              hidden[`${r}_${c}`] = true
            }
          }
        }
      }
    }
    return hidden
  }
}
