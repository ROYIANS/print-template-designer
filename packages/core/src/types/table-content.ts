export type TableHorizontalAlign = 'left' | 'center' | 'right'

export type TableVerticalAlign = 'top' | 'middle' | 'bottom'

export type TableBorderStyle = 'solid' | 'dashed' | 'dotted' | 'none'

export type TableCellTextDecoration = 'none' | 'underline' | 'line-through'

export interface TableCellStyle {
  fontFamily: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  textDecoration: TableCellTextDecoration
  color: string
  background: string
  horizontalAlign: TableHorizontalAlign
  verticalAlign: TableVerticalAlign
  padding: number
  borderColor: string
  borderWidth: number
  borderStyle: TableBorderStyle
}

export interface SimpleTableCell {
  id: string
  text: string
  rowSpan: number
  colSpan: number
  style: TableCellStyle
}

/**
 * Every grid coordinate points to its owning cell. Merged regions repeat the
 * same cell id, making covered coordinates addressable without DOM geometry.
 */
export interface SimpleTableProps {
  rowHeights: number[]
  columnWidths: number[]
  grid: string[][]
  cells: Record<string, SimpleTableCell>
}

export interface TableCellRange {
  startRow: number
  startColumn: number
  endRow: number
  endColumn: number
}

export const DEFAULT_TABLE_CELL_STYLE: Readonly<TableCellStyle> = Object.freeze({
  fontFamily: '"Sarasa UI SC", "Microsoft YaHei UI", sans-serif',
  fontSize: 10,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  color: '#1d2735',
  background: '#ffffff',
  horizontalAlign: 'left',
  verticalAlign: 'middle',
  padding: 4,
  borderColor: '#8d99a8',
  borderWidth: 1,
  borderStyle: 'solid',
})

const DEFAULT_TABLE_WIDTH = 500
const DEFAULT_TABLE_HEIGHT = 200
const DEFAULT_COLUMN_WIDTH = 100
const DEFAULT_ROW_HEIGHT = 40
const MIN_TRACK_SIZE = 8
const MAX_DIMENSION = 100
const HEX_COLOR = /^#[0-9a-f]{6}$/i
const HORIZONTAL_ALIGNS = new Set<TableHorizontalAlign>(['left', 'center', 'right'])
const VERTICAL_ALIGNS = new Set<TableVerticalAlign>(['top', 'middle', 'bottom'])
const BORDER_STYLES = new Set<TableBorderStyle>(['solid', 'dashed', 'dotted', 'none'])
const FONT_WEIGHTS = new Set<TableCellStyle['fontWeight']>(['normal', 'bold'])
const FONT_STYLES = new Set<TableCellStyle['fontStyle']>(['normal', 'italic'])
const TEXT_DECORATIONS = new Set<TableCellTextDecoration>(['none', 'underline', 'line-through'])

export function createSimpleTableProps(rows = 2, columns = 2): SimpleTableProps {
  const rowCount = dimension(rows, 2)
  const columnCount = dimension(columns, 2)
  const cells: Record<string, SimpleTableCell> = {}
  const grid = Array.from({ length: rowCount }, (_, row) =>
    Array.from({ length: columnCount }, (_, column) => {
      const id = `cell-${row * columnCount + column + 1}`
      cells[id] = createCell(id)
      return id
    }),
  )
  return {
    rowHeights: Array.from({ length: rowCount }, () => DEFAULT_TABLE_HEIGHT / rowCount),
    columnWidths: Array.from({ length: columnCount }, () => DEFAULT_TABLE_WIDTH / columnCount),
    grid,
    cells,
  }
}

export const DEFAULT_SIMPLE_TABLE_PROPS: Readonly<SimpleTableProps> =
  Object.freeze(createSimpleTableProps())

export function isSimpleTableProps(value: unknown): value is SimpleTableProps {
  const source = record(value)
  if (!source) return false
  const rowHeights = source['rowHeights']
  const columnWidths = source['columnWidths']
  const grid = source['grid']
  const cells = record(source['cells'])
  if (
    !isTrackArray(rowHeights) ||
    !isTrackArray(columnWidths) ||
    !Array.isArray(grid) ||
    grid.length !== rowHeights.length ||
    !cells
  )
    return false
  if (
    !grid.every(
      (row) =>
        Array.isArray(row) &&
        row.length === columnWidths.length &&
        row.every((id) => typeof id === 'string'),
    )
  )
    return false

  const referenced = new Set(grid.flat() as string[])
  if (referenced.size !== Object.keys(cells).length) return false
  for (const [id, valueCell] of Object.entries(cells)) {
    if (!referenced.has(id) || !isSimpleTableCell(valueCell, id)) return false
    const bounds = boundsForId(grid as string[][], id)
    if (
      !bounds ||
      bounds.rowSpan !== valueCell.rowSpan ||
      bounds.colSpan !== valueCell.colSpan ||
      !isFilledRectangle(grid as string[][], id, bounds)
    )
      return false
  }
  return true
}

export function normalizeSimpleTableProps(value: unknown): SimpleTableProps {
  if (isSimpleTableProps(value)) return cloneTable(value)
  const source = record(value)
  if (source && ('tableConfig' in source || 'tableData' in source)) {
    return normalizeLegacyTable(source)
  }
  if (source && ('grid' in source || 'cells' in source)) return normalizeGridTable(source)
  return createSimpleTableProps()
}

export function getTableCellAt(
  value: SimpleTableProps,
  row: number,
  column: number,
): SimpleTableCell | null {
  const id = value.grid[row]?.[column]
  return id ? (value.cells[id] ?? null) : null
}

export function getTableCellBounds(value: SimpleTableProps, cellId: string): TableCellRange | null {
  const bounds = boundsForId(value.grid, cellId)
  return bounds
    ? {
        startRow: bounds.startRow,
        startColumn: bounds.startColumn,
        endRow: bounds.endRow,
        endColumn: bounds.endColumn,
      }
    : null
}

export function normalizeTableCellRange(
  value: SimpleTableProps,
  range: TableCellRange,
): TableCellRange {
  const lastRow = value.grid.length - 1
  const lastColumn = value.columnWidths.length - 1
  const startRow = clamp(Math.min(range.startRow, range.endRow), 0, lastRow)
  const endRow = clamp(Math.max(range.startRow, range.endRow), 0, lastRow)
  const startColumn = clamp(Math.min(range.startColumn, range.endColumn), 0, lastColumn)
  const endColumn = clamp(Math.max(range.startColumn, range.endColumn), 0, lastColumn)
  return { startRow, startColumn, endRow, endColumn }
}

export function expandTableCellRange(
  value: SimpleTableProps,
  requested: TableCellRange,
): TableCellRange {
  let range = normalizeTableCellRange(value, requested)
  let changed = true
  while (changed) {
    changed = false
    for (const id of getTableCellIdsInRange(value, range)) {
      const bounds = getTableCellBounds(value, id)
      if (!bounds) continue
      const expanded = {
        startRow: Math.min(range.startRow, bounds.startRow),
        startColumn: Math.min(range.startColumn, bounds.startColumn),
        endRow: Math.max(range.endRow, bounds.endRow),
        endColumn: Math.max(range.endColumn, bounds.endColumn),
      }
      if (!sameRange(range, expanded)) {
        range = expanded
        changed = true
      }
    }
  }
  return range
}

export function getTableCellIdsInRange(
  value: SimpleTableProps,
  requested: TableCellRange,
): string[] {
  const range = normalizeTableCellRange(value, requested)
  const ids = new Set<string>()
  for (let row = range.startRow; row <= range.endRow; row += 1) {
    for (let column = range.startColumn; column <= range.endColumn; column += 1) {
      const id = value.grid[row]?.[column]
      if (id) ids.add(id)
    }
  }
  return [...ids]
}

export function updateTableCellText(
  value: SimpleTableProps,
  cellId: string,
  text: string,
): SimpleTableProps {
  const current = value.cells[cellId]
  if (!current || current.text === text) return value
  return {
    ...value,
    cells: { ...value.cells, [cellId]: { ...current, text } },
  }
}

export function updateTableCellsStyle(
  value: SimpleTableProps,
  cellIds: readonly string[],
  patch: Partial<TableCellStyle>,
): SimpleTableProps {
  const normalizedPatch = normalizeCellStyle({ ...DEFAULT_TABLE_CELL_STYLE, ...patch })
  const requestedKeys = Object.keys(patch) as Array<keyof TableCellStyle>
  const ids = new Set(cellIds)
  let changed = false
  const cells = Object.fromEntries(
    Object.entries(value.cells).map(([id, cell]) => {
      if (!ids.has(id)) return [id, cell]
      const stylePatch = Object.fromEntries(
        requestedKeys.map((key) => [key, normalizedPatch[key]]),
      ) as Partial<TableCellStyle>
      if (!requestedKeys.some((key) => cell.style[key] !== stylePatch[key])) return [id, cell]
      changed = true
      return [id, { ...cell, style: { ...cell.style, ...stylePatch } }]
    }),
  )
  return changed ? { ...value, cells } : value
}

export function insertTableRow(value: SimpleTableProps, requestedIndex: number): SimpleTableProps {
  const index = clamp(Math.round(requestedIndex), 0, value.grid.length)
  const makeId = cellIdFactory(value.cells)
  const cells = cloneCells(value.cells)
  const row = Array.from({ length: value.columnWidths.length }, (_, column) => {
    const above = index > 0 ? value.grid[index - 1]?.[column] : undefined
    const below = index < value.grid.length ? value.grid[index]?.[column] : undefined
    if (above && above === below) return above
    const id = makeId()
    cells[id] = createCell(id)
    return id
  })
  const grid = value.grid.map((gridRow) => [...gridRow])
  grid.splice(index, 0, row)
  const rowHeights = [...value.rowHeights]
  rowHeights.splice(index, 0, neighboringSize(value.rowHeights, index, DEFAULT_ROW_HEIGHT))
  return finalizeTable(grid, rowHeights, [...value.columnWidths], cells)
}

export function deleteTableRow(value: SimpleTableProps, requestedIndex: number): SimpleTableProps {
  if (value.grid.length <= 1) return value
  const index = clamp(Math.round(requestedIndex), 0, value.grid.length - 1)
  const grid = value.grid.map((row) => [...row])
  grid.splice(index, 1)
  const rowHeights = [...value.rowHeights]
  rowHeights.splice(index, 1)
  return finalizeTable(grid, rowHeights, [...value.columnWidths], cloneCells(value.cells))
}

export function insertTableColumn(
  value: SimpleTableProps,
  requestedIndex: number,
): SimpleTableProps {
  const index = clamp(Math.round(requestedIndex), 0, value.columnWidths.length)
  const makeId = cellIdFactory(value.cells)
  const cells = cloneCells(value.cells)
  const grid = value.grid.map((sourceRow, row) => {
    const next = [...sourceRow]
    const left = index > 0 ? sourceRow[index - 1] : undefined
    const right = index < value.columnWidths.length ? sourceRow[index] : undefined
    if (left && left === right) next.splice(index, 0, left)
    else {
      const id = makeId()
      cells[id] = createCell(id)
      next.splice(index, 0, id)
    }
    void row
    return next
  })
  const columnWidths = [...value.columnWidths]
  columnWidths.splice(index, 0, neighboringSize(value.columnWidths, index, DEFAULT_COLUMN_WIDTH))
  return finalizeTable(grid, [...value.rowHeights], columnWidths, cells)
}

export function deleteTableColumn(
  value: SimpleTableProps,
  requestedIndex: number,
): SimpleTableProps {
  if (value.columnWidths.length <= 1) return value
  const index = clamp(Math.round(requestedIndex), 0, value.columnWidths.length - 1)
  const grid = value.grid.map((row) => row.filter((_, column) => column !== index))
  const columnWidths = [...value.columnWidths]
  columnWidths.splice(index, 1)
  return finalizeTable(grid, [...value.rowHeights], columnWidths, cloneCells(value.cells))
}

export function mergeTableCells(
  value: SimpleTableProps,
  requested: TableCellRange,
): SimpleTableProps {
  const range = expandTableCellRange(value, requested)
  const anchorId = value.grid[range.startRow]?.[range.startColumn]
  if (!anchorId) return value
  const ids = getTableCellIdsInRange(value, range)
  if (ids.length === 1) return value
  const grid = value.grid.map((row) => [...row])
  for (let row = range.startRow; row <= range.endRow; row += 1) {
    for (let column = range.startColumn; column <= range.endColumn; column += 1) {
      grid[row]![column] = anchorId
    }
  }
  return finalizeTable(
    grid,
    [...value.rowHeights],
    [...value.columnWidths],
    cloneCells(value.cells),
  )
}

export function splitTableCell(value: SimpleTableProps, cellId: string): SimpleTableProps {
  const bounds = getTableCellBounds(value, cellId)
  const source = value.cells[cellId]
  if (!bounds || !source || (source.rowSpan === 1 && source.colSpan === 1)) return value
  const makeId = cellIdFactory(value.cells)
  const cells = cloneCells(value.cells)
  const grid = value.grid.map((row) => [...row])
  for (let row = bounds.startRow; row <= bounds.endRow; row += 1) {
    for (let column = bounds.startColumn; column <= bounds.endColumn; column += 1) {
      if (row === bounds.startRow && column === bounds.startColumn) continue
      const id = makeId()
      cells[id] = createCell(id, { ...source.style })
      grid[row]![column] = id
    }
  }
  return finalizeTable(grid, [...value.rowHeights], [...value.columnWidths], cells)
}

export function resizeTableRow(
  value: SimpleTableProps,
  requestedIndex: number,
  height: number,
): SimpleTableProps {
  const index = clamp(Math.round(requestedIndex), 0, value.rowHeights.length - 1)
  const next = positiveSize(height, value.rowHeights[index] ?? DEFAULT_ROW_HEIGHT)
  if (value.rowHeights[index] === next) return value
  const rowHeights = [...value.rowHeights]
  rowHeights[index] = next
  return { ...value, rowHeights }
}

export function resizeTableColumn(
  value: SimpleTableProps,
  requestedIndex: number,
  width: number,
): SimpleTableProps {
  const index = clamp(Math.round(requestedIndex), 0, value.columnWidths.length - 1)
  const next = positiveSize(width, value.columnWidths[index] ?? DEFAULT_COLUMN_WIDTH)
  if (value.columnWidths[index] === next) return value
  const columnWidths = [...value.columnWidths]
  columnWidths[index] = next
  return { ...value, columnWidths }
}

function normalizeGridTable(source: Record<string, unknown>): SimpleTableProps {
  const rawGrid = Array.isArray(source['grid']) ? source['grid'] : []
  const rawRows = Array.isArray(source['rowHeights']) ? source['rowHeights'] : []
  const rawColumns = Array.isArray(source['columnWidths']) ? source['columnWidths'] : []
  const rowCount = dimension(rawRows.length || rawGrid.length, 2)
  const maxGridColumns = rawGrid.reduce(
    (maximum, row) => (Array.isArray(row) ? Math.max(maximum, row.length) : maximum),
    0,
  )
  const columnCount = dimension(rawColumns.length || maxGridColumns, 2)
  const rawCells = record(source['cells']) ?? {}
  const candidates = Array.from({ length: rowCount }, (_, row) =>
    Array.from({ length: columnCount }, (_, column) => {
      const rawRow = rawGrid[row]
      const id = Array.isArray(rawRow) ? rawRow[column] : undefined
      return typeof id === 'string' && record(rawCells[id]) ? id : null
    }),
  )
  const cells: Record<string, SimpleTableCell> = {}
  const grid = Array.from({ length: rowCount }, () => Array<string>(columnCount).fill(''))
  const makeId = cellIdFactory(rawCells)

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      if (grid[row]![column]) continue
      const candidate = candidates[row]![column]
      const candidateBounds = candidate ? boundsForNullableId(candidates, candidate) : null
      const rectangular =
        candidate !== null &&
        candidateBounds !== null &&
        candidateBounds.startRow === row &&
        candidateBounds.startColumn === column &&
        isFilledRectangle(candidates, candidate, candidateBounds)
      const requestedId = candidate && rectangular ? candidate : makeId()
      const id = uniqueId(requestedId, cells)
      const rawCell = candidate ? rawCells[candidate] : undefined
      cells[id] = normalizeCell(rawCell, id)
      const endRow = rectangular ? candidateBounds.endRow : row
      const endColumn = rectangular ? candidateBounds.endColumn : column
      for (let fillRow = row; fillRow <= endRow; fillRow += 1) {
        for (let fillColumn = column; fillColumn <= endColumn; fillColumn += 1) {
          grid[fillRow]![fillColumn] = id
        }
      }
    }
  }

  return finalizeTable(
    grid,
    normalizeTracks(rawRows, rowCount, DEFAULT_TABLE_HEIGHT / rowCount),
    normalizeTracks(rawColumns, columnCount, DEFAULT_TABLE_WIDTH / columnCount),
    cells,
  )
}

function normalizeLegacyTable(source: Record<string, unknown>): SimpleTableProps {
  const config = record(source['tableConfig'])
  const rowCount = dimension(config?.['rows'], 2)
  const columnCount = dimension(config?.['cols'], 2)
  const detail = Array.isArray(config?.['layoutDetail']) ? config['layoutDetail'] : []
  const data = record(source['tableData']) ?? {}
  const grid = Array.from({ length: rowCount }, () => Array<string>(columnCount).fill(''))
  const cells: Record<string, SimpleTableCell> = {}
  const makeId = cellIdFactory(data)
  const rowHeights = Array.from({ length: rowCount }, () => DEFAULT_TABLE_HEIGHT / rowCount)
  const columnWidths = Array.from({ length: columnCount }, () => DEFAULT_TABLE_WIDTH / columnCount)

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      if (grid[row]![column]) continue
      const legacyCell = record(data[`${row + 1}-${column + 1}`])
      const legacyLayout = record(detail[row * columnCount + column])
      const rowSpan = clamp(integer(legacyLayout?.['rowSpan'], 1), 1, rowCount - row)
      const colSpan = clamp(integer(legacyLayout?.['colSpan'], 1), 1, columnCount - column)
      const overlaps = rectangleHasValue(grid, row, column, rowSpan, colSpan)
      const finalRowSpan = overlaps ? 1 : rowSpan
      const finalColSpan = overlaps ? 1 : colSpan
      const legacyId = legacyCell?.['id']
      const id = uniqueId(typeof legacyId === 'string' && legacyId ? legacyId : makeId(), cells)
      cells[id] = normalizeCell(legacyCell, id)
      for (let fillRow = row; fillRow < row + finalRowSpan; fillRow += 1) {
        for (let fillColumn = column; fillColumn < column + finalColSpan; fillColumn += 1) {
          grid[fillRow]![fillColumn] = id
        }
      }
      const width = finiteNumber(legacyCell?.['width'])
      const height = finiteNumber(legacyCell?.['height'])
      if (width && finalColSpan === 1)
        columnWidths[column] = positiveSize(width, columnWidths[column]!)
      if (height && finalRowSpan === 1) rowHeights[row] = positiveSize(height, rowHeights[row]!)
    }
  }
  return finalizeTable(grid, rowHeights, columnWidths, cells)
}

function finalizeTable(
  grid: string[][],
  rowHeights: number[],
  columnWidths: number[],
  sourceCells: Record<string, SimpleTableCell>,
): SimpleTableProps {
  const cells: Record<string, SimpleTableCell> = {}
  for (const id of new Set(grid.flat())) {
    const bounds = boundsForId(grid, id)
    if (!bounds) continue
    const source = sourceCells[id] ?? createCell(id)
    cells[id] = {
      ...source,
      id,
      rowSpan: bounds.rowSpan,
      colSpan: bounds.colSpan,
      style: normalizeCellStyle(source.style),
    }
  }
  return {
    rowHeights: rowHeights.map((size) => positiveSize(size, DEFAULT_ROW_HEIGHT)),
    columnWidths: columnWidths.map((size) => positiveSize(size, DEFAULT_COLUMN_WIDTH)),
    grid,
    cells,
  }
}

function createCell(
  id: string,
  style: TableCellStyle = { ...DEFAULT_TABLE_CELL_STYLE },
): SimpleTableCell {
  return { id, text: '', rowSpan: 1, colSpan: 1, style }
}

function normalizeCell(value: unknown, id: string): SimpleTableCell {
  const source = record(value)
  const rawText = source?.['text'] ?? source?.['propValue']
  return {
    id,
    text: typeof rawText === 'string' ? legacyHtmlToText(rawText) : '',
    rowSpan: 1,
    colSpan: 1,
    style: normalizeCellStyle(source?.['style']),
  }
}

function normalizeCellStyle(value: unknown): TableCellStyle {
  const source = record(value)
  return {
    fontFamily: stringValue(source?.['fontFamily'], DEFAULT_TABLE_CELL_STYLE.fontFamily),
    fontSize: positiveSize(source?.['fontSize'], DEFAULT_TABLE_CELL_STYLE.fontSize),
    fontWeight: member(source?.['fontWeight'], FONT_WEIGHTS, DEFAULT_TABLE_CELL_STYLE.fontWeight),
    fontStyle: member(source?.['fontStyle'], FONT_STYLES, DEFAULT_TABLE_CELL_STYLE.fontStyle),
    textDecoration: member(
      source?.['textDecoration'],
      TEXT_DECORATIONS,
      DEFAULT_TABLE_CELL_STYLE.textDecoration,
    ),
    color: colorValue(source?.['color'], DEFAULT_TABLE_CELL_STYLE.color),
    background: colorValue(source?.['background'], DEFAULT_TABLE_CELL_STYLE.background),
    horizontalAlign: member(
      source?.['horizontalAlign'],
      HORIZONTAL_ALIGNS,
      DEFAULT_TABLE_CELL_STYLE.horizontalAlign,
    ),
    verticalAlign: member(
      source?.['verticalAlign'],
      VERTICAL_ALIGNS,
      DEFAULT_TABLE_CELL_STYLE.verticalAlign,
    ),
    padding: nonNegativeNumber(source?.['padding'], DEFAULT_TABLE_CELL_STYLE.padding),
    borderColor: colorValue(source?.['borderColor'], DEFAULT_TABLE_CELL_STYLE.borderColor),
    borderWidth: nonNegativeNumber(source?.['borderWidth'], DEFAULT_TABLE_CELL_STYLE.borderWidth),
    borderStyle: member(
      source?.['borderStyle'],
      BORDER_STYLES,
      DEFAULT_TABLE_CELL_STYLE.borderStyle,
    ),
  }
}

function isSimpleTableCell(value: unknown, id: string): value is SimpleTableCell {
  const source = record(value)
  return Boolean(
    source &&
    source['id'] === id &&
    typeof source['text'] === 'string' &&
    Number.isInteger(source['rowSpan']) &&
    Number(source['rowSpan']) >= 1 &&
    Number.isInteger(source['colSpan']) &&
    Number(source['colSpan']) >= 1 &&
    isTableCellStyle(source['style']),
  )
}

function isTableCellStyle(value: unknown): value is TableCellStyle {
  const source = record(value)
  return Boolean(
    source &&
    typeof source['fontFamily'] === 'string' &&
    isPositiveNumber(source['fontSize']) &&
    FONT_WEIGHTS.has(source['fontWeight'] as TableCellStyle['fontWeight']) &&
    FONT_STYLES.has(source['fontStyle'] as TableCellStyle['fontStyle']) &&
    TEXT_DECORATIONS.has(source['textDecoration'] as TableCellTextDecoration) &&
    isColor(source['color']) &&
    isColor(source['background']) &&
    HORIZONTAL_ALIGNS.has(source['horizontalAlign'] as TableHorizontalAlign) &&
    VERTICAL_ALIGNS.has(source['verticalAlign'] as TableVerticalAlign) &&
    isNonNegativeNumber(source['padding']) &&
    isColor(source['borderColor']) &&
    isNonNegativeNumber(source['borderWidth']) &&
    BORDER_STYLES.has(source['borderStyle'] as TableBorderStyle),
  )
}

interface CellBounds {
  startRow: number
  startColumn: number
  endRow: number
  endColumn: number
  rowSpan: number
  colSpan: number
}

function boundsForId(grid: string[][], id: string): CellBounds | null {
  return boundsForNullableId(grid, id)
}

function boundsForNullableId(grid: Array<Array<string | null>>, id: string): CellBounds | null {
  let startRow = Number.POSITIVE_INFINITY
  let startColumn = Number.POSITIVE_INFINITY
  let endRow = -1
  let endColumn = -1
  grid.forEach((row, rowIndex) =>
    row.forEach((value, columnIndex) => {
      if (value !== id) return
      startRow = Math.min(startRow, rowIndex)
      startColumn = Math.min(startColumn, columnIndex)
      endRow = Math.max(endRow, rowIndex)
      endColumn = Math.max(endColumn, columnIndex)
    }),
  )
  if (endRow < 0) return null
  return {
    startRow,
    startColumn,
    endRow,
    endColumn,
    rowSpan: endRow - startRow + 1,
    colSpan: endColumn - startColumn + 1,
  }
}

function isFilledRectangle(
  grid: Array<Array<string | null>>,
  id: string,
  bounds: CellBounds,
): boolean {
  for (let row = bounds.startRow; row <= bounds.endRow; row += 1) {
    for (let column = bounds.startColumn; column <= bounds.endColumn; column += 1) {
      if (grid[row]?.[column] !== id) return false
    }
  }
  return true
}

function rectangleHasValue(
  grid: string[][],
  startRow: number,
  startColumn: number,
  rowSpan: number,
  colSpan: number,
): boolean {
  for (let row = startRow; row < startRow + rowSpan; row += 1) {
    for (let column = startColumn; column < startColumn + colSpan; column += 1) {
      if (grid[row]?.[column]) return true
    }
  }
  return false
}

function cloneTable(value: SimpleTableProps): SimpleTableProps {
  return {
    rowHeights: [...value.rowHeights],
    columnWidths: [...value.columnWidths],
    grid: value.grid.map((row) => [...row]),
    cells: cloneCells(value.cells),
  }
}

function cloneCells(cells: Record<string, SimpleTableCell>): Record<string, SimpleTableCell> {
  return Object.fromEntries(
    Object.entries(cells).map(([id, cell]) => [id, { ...cell, style: { ...cell.style } }]),
  )
}

function cellIdFactory(source: Record<string, unknown>): () => string {
  const ids = new Set(Object.keys(source))
  let counter = 1
  return () => {
    while (ids.has(`cell-${counter}`)) counter += 1
    const id = `cell-${counter}`
    ids.add(id)
    counter += 1
    return id
  }
}

function uniqueId(requested: string, cells: Record<string, unknown>): string {
  if (!cells[requested]) return requested
  const makeId = cellIdFactory(cells)
  return makeId()
}

function normalizeTracks(value: unknown[], count: number, fallback: number): number[] {
  return Array.from({ length: count }, (_, index) => positiveSize(value[index], fallback))
}

function isTrackArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.length >= 1 && value.every(isPositiveNumber)
}

function dimension(value: unknown, fallback: number): number {
  return clamp(integer(value, fallback), 1, MAX_DIMENSION)
}

function integer(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
}

function positiveSize(value: unknown, fallback: number): number {
  return isPositiveNumber(value) ? Math.max(MIN_TRACK_SIZE, value) : fallback
}

function neighboringSize(values: number[], index: number, fallback: number): number {
  const before = values[index - 1]
  const after = values[index]
  if (before !== undefined && after !== undefined) return (before + after) / 2
  return before ?? after ?? fallback
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function nonNegativeNumber(value: unknown, fallback: number): number {
  return isNonNegativeNumber(value) ? value : fallback
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function colorValue(value: unknown, fallback: string): string {
  return isColor(value) ? value.toLowerCase() : fallback
}

function isColor(value: unknown): value is string {
  return typeof value === 'string' && (HEX_COLOR.test(value) || value === 'transparent')
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function member<T extends string>(value: unknown, values: Set<T>, fallback: T): T {
  return typeof value === 'string' && values.has(value as T) ? (value as T) : fallback
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function sameRange(left: TableCellRange, right: TableCellRange): boolean {
  return (
    left.startRow === right.startRow &&
    left.startColumn === right.startColumn &&
    left.endRow === right.endRow &&
    left.endColumn === right.endColumn
  )
}

function legacyHtmlToText(value: string): string {
  return value
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li|tr|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd()
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}
