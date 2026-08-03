import {
  flattenDataFields,
  formatDataValue,
  isDataPathArrayItem,
  normalizeDetailTableProps,
  readDataPath,
  type ComponentSchema,
  type DataFieldDefinition,
  type DetailTableColumn,
  type DetailTableFooter,
  type DetailTableProps,
  type JsonValue,
  type RenderContext,
  type TemplateDataDefinition,
} from '@ptd/core'

export interface DetailTableOutputRow {
  readonly id: string
  readonly cells: readonly string[]
}

export interface DetailTableFragmentProps {
  readonly kind: 'foliq-detail-table-fragment'
  readonly columns: readonly DetailTableColumn[]
  readonly rows: readonly DetailTableOutputRow[]
  readonly includeHeader: boolean
  readonly footer?: DetailTableFooter
  readonly emptyText?: string
  readonly headerHeight: number
  readonly rowHeights: readonly number[]
  readonly footerHeight: number
}

export interface DetailTableMeasurement {
  readonly headerHeight: number
  readonly rowHeights: readonly number[]
  readonly footerHeight: number
}

export interface DetailTableMeasureRequest {
  readonly component: ComponentSchema
  readonly props: DetailTableProps
  readonly rows: readonly DetailTableOutputRow[]
}

export type DetailTableMeasurer = (
  request: DetailTableMeasureRequest,
) => DetailTableMeasurement | Promise<DetailTableMeasurement>

export interface ResolvedDetailTable {
  readonly props: DetailTableProps
  readonly rows: readonly DetailTableOutputRow[]
}

export function isDetailTableFragmentProps(value: unknown): value is DetailTableFragmentProps {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Reflect.get(value, 'kind') === 'foliq-detail-table-fragment'
  )
}

export function resolveDetailTable(
  component: ComponentSchema,
  data: TemplateDataDefinition,
  context: RenderContext,
): ResolvedDetailTable {
  const props = normalizeDetailTableProps(component.propValue)
  const fields = flattenDataFields(data.fields)
  const sourceField = fields.find((field) => field.id === props.dataFieldId)
  const source = currentRecord(context)
  const read = sourceField ? readDataPath(source, sourceField.path) : null
  const items = read?.status === 'ready' && Array.isArray(read.value) ? read.value : []
  return {
    props,
    rows: items.map((item, index) => ({
      id: `${component.id}:row:${index}`,
      cells: props.columns.map((column) => resolveCell(column, item, fields, context)),
    })),
  }
}

export function defaultDetailTableMeasurer({
  component,
  props,
  rows,
}: DetailTableMeasureRequest): DetailTableMeasurement {
  if (typeof document === 'undefined' || !document.body) {
    return minimumMeasurement(props, rows.length)
  }
  const root = document.createElement('div')
  root.dataset.ptdOutputMeasure = 'detail-table'
  Object.assign(root.style, {
    position: 'fixed',
    left: '-100000px',
    top: '0',
    width: `${component.style.width}px`,
    visibility: 'hidden',
    contain: 'layout style',
    fontFamily: component.style.fontFamily ?? 'inherit',
    fontSize: `${component.style.fontSize ?? 12}px`,
  })
  const table = document.createElement('table')
  Object.assign(table.style, {
    width: '100%',
    tableLayout: 'fixed',
    borderCollapse: 'collapse',
  })
  const colgroup = document.createElement('colgroup')
  const width = props.columns.reduce((total, column) => total + column.width, 0) || 1
  props.columns.forEach((column) => {
    const col = document.createElement('col')
    col.style.width = `${(column.width / width) * 100}%`
    colgroup.append(col)
  })
  table.append(colgroup)
  const thead = document.createElement('thead')
  const headerRow = document.createElement('tr')
  headerRow.style.minHeight = `${props.header.minHeight}px`
  props.columns.forEach((column) => headerRow.append(measureCell(column.title)))
  thead.append(headerRow)
  table.append(thead)
  const tbody = document.createElement('tbody')
  const rowElements = rows.map((row) => {
    const element = document.createElement('tr')
    element.style.minHeight = `${props.body.minHeight}px`
    row.cells.forEach((cell) => element.append(measureCell(cell)))
    tbody.append(element)
    return element
  })
  table.append(tbody)
  let footerRow: HTMLTableRowElement | undefined
  if (props.footer) {
    const tfoot = document.createElement('tfoot')
    footerRow = document.createElement('tr')
    footerRow.style.minHeight = `${props.footer.minHeight}px`
    props.footer.cells.forEach((cell) => {
      const element = measureCell(cell.text)
      element.colSpan = cell.colSpan
      footerRow?.append(element)
    })
    tfoot.append(footerRow)
    table.append(tfoot)
  }
  root.append(table)
  document.body.append(root)
  try {
    return {
      headerHeight: positiveHeight(headerRow, props.header.minHeight),
      rowHeights: rowElements.map((row) => positiveHeight(row, props.body.minHeight)),
      footerHeight: footerRow ? positiveHeight(footerRow, props.footer?.minHeight ?? 0) : 0,
    }
  } finally {
    root.remove()
  }
}

function minimumMeasurement(props: DetailTableProps, rowCount: number): DetailTableMeasurement {
  return {
    headerHeight: props.header.minHeight,
    rowHeights: Array.from({ length: rowCount }, () => props.body.minHeight),
    footerHeight: props.footer?.minHeight ?? 0,
  }
}

function measureCell(text: string): HTMLTableCellElement {
  const cell = document.createElement('td')
  Object.assign(cell.style, {
    boxSizing: 'border-box',
    padding: '4px',
    border: '1px solid #8d99a8',
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-wrap',
  })
  cell.textContent = text
  return cell
}

function positiveHeight(element: HTMLElement, fallback: number): number {
  const height = element.getBoundingClientRect().height
  return Number.isFinite(height) && height > 0 ? Math.max(height, fallback) : fallback
}

function resolveCell(
  column: DetailTableColumn,
  item: JsonValue,
  fields: readonly DataFieldDefinition[],
  context: RenderContext,
): string {
  if (!column.fieldId) return column.fallback ?? ''
  const field = fields.find((candidate) => candidate.id === column.fieldId)
  if (!field) return column.fallback ?? ''
  const path = relativeItemPath(field.path)
  const read =
    path.length === 0 ? { status: 'ready' as const, value: item } : readDataPath(item, path)
  if (read.status !== 'ready') return column.fallback ?? ''
  const formatted = formatDataValue(read.value, field.formatter, context)
  return formatted.status === 'ready' ? formatted.value : (column.fallback ?? '')
}

function relativeItemPath(path: DataFieldDefinition['path']): DataFieldDefinition['path'] {
  const itemIndex = path.findIndex(isDataPathArrayItem)
  return itemIndex >= 0 ? path.slice(itemIndex + 1) : path
}

function currentRecord(context: RenderContext): JsonValue {
  if (context.record) return context.record
  return context.data
}
