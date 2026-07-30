import { describe, expect, it } from 'vitest'
import {
  createSimpleTableProps,
  mergeTableCells,
  updateTableCellText,
  updateTableCellsStyle,
  type ComponentSchema,
} from '@ptd/core'
import { RoySimpleTable } from '../components/RoySimpleTable'

function schema(propValue: unknown): ComponentSchema {
  return {
    id: 'table-1',
    component: 'RoySimpleTable',
    name: '交接明细',
    propValue,
    style: { width: 500, height: 200, rotate: 0, opacity: 1 },
    groupStyle: {},
    position: {},
  }
}

describe('RoySimpleTable', () => {
  it('renders canonical cells, spans and deterministic cell styles', () => {
    let value = createSimpleTableProps()
    value = updateTableCellText(value, 'cell-1', '客户名称')
    value = updateTableCellsStyle(value, ['cell-1'], {
      fontWeight: 'bold',
      horizontalAlign: 'center',
      background: '#eef3f8',
    })
    value = mergeTableCells(value, {
      startRow: 0,
      startColumn: 0,
      endRow: 0,
      endColumn: 1,
    })
    const component = new RoySimpleTable(schema(value))
    const parent = document.createElement('div')

    component.mount(parent)

    const table = parent.querySelector('table')
    const cells = [...parent.querySelectorAll('td')]
    expect(table?.getAttribute('aria-label')).toBe('交接明细')
    expect(cells).toHaveLength(3)
    expect(cells[0]?.colSpan).toBe(2)
    expect(cells[0]?.dataset.cellId).toBe('cell-1')
    expect(cells[0]?.textContent).toBe('客户名称')
    expect(cells[0]?.style.getPropertyValue('--ptd-table-font-weight')).toBe('bold')
    expect(cells[0]?.style.getPropertyValue('--ptd-table-background')).toBe('#eef3f8')
  })

  it('normalizes legacy html cells as text instead of executing markup', () => {
    const component = new RoySimpleTable(
      schema({
        tableConfig: { rows: 1, cols: 1, layoutDetail: [{}] },
        tableData: {
          '1-1': { id: 'legacy', propValue: '<b>安全文本</b><script>alert(1)</script>' },
        },
      }),
    )
    const parent = document.createElement('div')

    component.mount(parent)

    expect(parent.querySelector('td')?.textContent).toBe('安全文本alert(1)')
    expect(parent.querySelector('script')).toBeNull()
  })
})
