import {
  getTableCellBounds,
  normalizeSimpleTableProps,
  type ComponentSchema,
  type SimpleTableProps,
  type TableCellStyle,
} from '@ptd/core'
import { BaseComponent } from '../base/base-component'

/** @deprecated Legacy v1 table cell input accepted by the normalizer. */
export interface TableCellData {
  id: string
  propValue: string
  width: number
  height: number
  style: Record<string, unknown>
  bindValue?: unknown
}

/** @deprecated Legacy v1 table layout input accepted by the normalizer. */
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

export interface LegacySimpleTablePropValue {
  tableConfig?: TableConfig
  tableData?: Record<string, TableCellData>
}

export type SimpleTablePropValue = SimpleTableProps | LegacySimpleTablePropValue

export class RoySimpleTable extends BaseComponent {
  constructor(schema: ComponentSchema) {
    super(schema)
  }

  protected render(): void {
    this.container.classList.add('ptd-simple-table')
    this.container.innerHTML = ''

    const value = normalizeSimpleTableProps(this.schema.propValue)

    const table = document.createElement('table')
    table.setAttribute('aria-label', this.schema.name ?? '自由表格')
    table.dataset.ptdTable = 'simple'
    const colgroup = document.createElement('colgroup')
    const totalWidth = sum(value.columnWidths)
    value.columnWidths.forEach((width) => {
      const column = document.createElement('col')
      column.style.width = `${(width / totalWidth) * 100}%`
      colgroup.appendChild(column)
    })
    table.appendChild(colgroup)

    const tbody = document.createElement('tbody')
    table.appendChild(tbody)
    const totalHeight = sum(value.rowHeights)

    for (let row = 0; row < value.grid.length; row += 1) {
      const tr = document.createElement('tr')
      tr.style.height = `${((value.rowHeights[row] ?? 0) / totalHeight) * 100}%`
      for (let column = 0; column < value.columnWidths.length; column += 1) {
        const cellId = value.grid[row]?.[column]
        if (!cellId) continue
        const bounds = getTableCellBounds(value, cellId)
        if (!bounds || bounds.startRow !== row || bounds.startColumn !== column) continue
        const cell = value.cells[cellId]
        if (!cell) continue

        const td = document.createElement('td')
        td.dataset.cellId = cellId
        td.dataset.row = String(row)
        td.dataset.column = String(column)
        if (cell.colSpan > 1) td.colSpan = cell.colSpan
        if (cell.rowSpan > 1) td.rowSpan = cell.rowSpan
        applyCellVariables(td, cell.style)

        const inner = document.createElement('div')
        inner.className = 'ptd-simple-table__cell-content'
        inner.textContent = cell.text
        td.appendChild(inner)

        tr.appendChild(td)
      }
      tbody.appendChild(tr)
    }

    this.container.appendChild(table)
  }
}

function applyCellVariables(cell: HTMLTableCellElement, style: TableCellStyle): void {
  cell.style.setProperty('--ptd-table-font-family', style.fontFamily)
  cell.style.setProperty('--ptd-table-font-size', `${style.fontSize}px`)
  cell.style.setProperty('--ptd-table-font-weight', style.fontWeight)
  cell.style.setProperty('--ptd-table-font-style', style.fontStyle)
  cell.style.setProperty('--ptd-table-text-decoration', style.textDecoration)
  cell.style.setProperty('--ptd-table-color', style.color)
  cell.style.setProperty('--ptd-table-background', style.background)
  cell.style.setProperty('--ptd-table-horizontal-align', style.horizontalAlign)
  cell.style.setProperty('--ptd-table-vertical-align', style.verticalAlign)
  cell.style.setProperty('--ptd-table-padding', `${style.padding}px`)
  cell.style.setProperty('--ptd-table-border-color', style.borderColor)
  cell.style.setProperty('--ptd-table-border-width', `${style.borderWidth}px`)
  cell.style.setProperty('--ptd-table-border-style', style.borderStyle)
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) || 1
}
