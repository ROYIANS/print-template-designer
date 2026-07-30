import { describe, expect, it } from 'vitest'
import {
  createSimpleTableProps,
  deleteTableColumn,
  deleteTableRow,
  expandTableCellRange,
  getTableCellAt,
  getTableCellBounds,
  getTableCellIdsInRange,
  insertTableColumn,
  insertTableRow,
  isSimpleTableProps,
  mergeTableCells,
  normalizeSimpleTableProps,
  resizeTableColumn,
  resizeTableRow,
  splitTableCell,
  updateTableCellText,
  updateTableCellsStyle,
} from '../types/table-content'

describe('simple table content', () => {
  it('creates an addressable 2 x 2 table with independent cell ids', () => {
    const table = createSimpleTableProps()

    expect(table.grid).toEqual([
      ['cell-1', 'cell-2'],
      ['cell-3', 'cell-4'],
    ])
    expect(new Set(table.grid.flat()).size).toBe(4)
    expect(isSimpleTableProps(table)).toBe(true)
    expect(getTableCellAt(table, 1, 1)?.text).toBe('')
  })

  it('normalizes legacy layout data without retaining executable cell html', () => {
    const table = normalizeSimpleTableProps({
      tableConfig: {
        rows: 2,
        cols: 2,
        layoutDetail: [{ rowSpan: 2 }, {}, {}, {}],
      },
      tableData: {
        '1-1': {
          id: 'legacy-a',
          propValue: '<img src=x onerror=alert(1)><b>甲</b><br>乙',
          width: 120,
          height: 48,
          style: { background: '#ffeecc' },
        },
        '1-2': { id: 'legacy-b', propValue: '丙', width: 80, height: 48 },
        '2-2': { id: 'legacy-c', propValue: '丁', width: 80, height: 52 },
      },
    })

    expect(table.grid).toEqual([
      ['legacy-a', 'legacy-b'],
      ['legacy-a', 'legacy-c'],
    ])
    expect(table.cells['legacy-a']).toMatchObject({
      text: '甲\n乙',
      rowSpan: 2,
      colSpan: 1,
      style: { background: '#ffeecc' },
    })
    expect(isSimpleTableProps(table)).toBe(true)
  })

  it('updates text and a cell selection immutably', () => {
    const table = createSimpleTableProps()
    const withText = updateTableCellText(table, 'cell-1', '客户名称')
    const styled = updateTableCellsStyle(withText, ['cell-1', 'cell-2'], {
      fontWeight: 'bold',
      horizontalAlign: 'center',
      background: '#eef3f8',
    })

    expect(table.cells['cell-1']?.text).toBe('')
    expect(styled.cells['cell-1']).toMatchObject({
      text: '客户名称',
      style: { fontWeight: 'bold', horizontalAlign: 'center', background: '#eef3f8' },
    })
    expect(styled.cells['cell-2']?.style.fontWeight).toBe('bold')
    expect(styled.cells['cell-3']?.style.fontWeight).toBe('normal')
    expect(isSimpleTableProps(styled)).toBe(true)
  })

  it('merges a rectangular selection, expands partial merged selections, and splits it', () => {
    const table = createSimpleTableProps(3, 3)
    const merged = mergeTableCells(table, {
      startRow: 0,
      startColumn: 0,
      endRow: 1,
      endColumn: 1,
    })

    expect(merged.grid[0]?.slice(0, 2)).toEqual(['cell-1', 'cell-1'])
    expect(merged.grid[1]?.slice(0, 2)).toEqual(['cell-1', 'cell-1'])
    expect(merged.cells['cell-1']).toMatchObject({ rowSpan: 2, colSpan: 2 })
    expect(getTableCellBounds(merged, 'cell-1')).toEqual({
      startRow: 0,
      startColumn: 0,
      endRow: 1,
      endColumn: 1,
    })
    expect(
      expandTableCellRange(merged, {
        startRow: 1,
        startColumn: 1,
        endRow: 2,
        endColumn: 2,
      }),
    ).toEqual({ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 })

    const split = splitTableCell(merged, 'cell-1')
    expect(new Set(split.grid.flat()).size).toBe(9)
    expect(split.cells['cell-1']).toMatchObject({ rowSpan: 1, colSpan: 1 })
    expect(isSimpleTableProps(split)).toBe(true)
  })

  it('preserves spans when inserting through them and repairs spans when deleting', () => {
    const merged = mergeTableCells(createSimpleTableProps(3, 3), {
      startRow: 0,
      startColumn: 0,
      endRow: 1,
      endColumn: 1,
    })
    const withRow = insertTableRow(merged, 1)
    expect(withRow.cells['cell-1']).toMatchObject({ rowSpan: 3, colSpan: 2 })
    expect(withRow.grid[1]?.slice(0, 2)).toEqual(['cell-1', 'cell-1'])

    const withColumn = insertTableColumn(withRow, 1)
    expect(withColumn.cells['cell-1']).toMatchObject({ rowSpan: 3, colSpan: 3 })
    expect(
      withColumn.grid.slice(0, 3).every((row) => row.slice(0, 3).every((id) => id === 'cell-1')),
    ).toBe(true)

    const withoutRow = deleteTableRow(withColumn, 0)
    const withoutColumn = deleteTableColumn(withoutRow, 0)
    expect(withoutColumn.cells['cell-1']).toMatchObject({ rowSpan: 2, colSpan: 2 })
    expect(isSimpleTableProps(withoutColumn)).toBe(true)
  })

  it('keeps a minimum of one row and column and resizes tracks without touching cells', () => {
    const one = createSimpleTableProps(1, 1)
    expect(deleteTableRow(one, 0)).toBe(one)
    expect(deleteTableColumn(one, 0)).toBe(one)

    const resized = resizeTableColumn(resizeTableRow(one, 0, 64), 0, 180)
    expect(resized.rowHeights).toEqual([64])
    expect(resized.columnWidths).toEqual([180])
    expect(resized.cells).toBe(one.cells)
    expect(
      getTableCellIdsInRange(resized, {
        startRow: 0,
        startColumn: 0,
        endRow: 0,
        endColumn: 0,
      }),
    ).toEqual(['cell-1'])
  })
})
