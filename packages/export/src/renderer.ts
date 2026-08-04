import {
  mmToPx,
  normalizeImageProps,
  type ComponentSchema,
  type DetailTableFooterCell,
  type OutputDocument,
  type OutputFragment,
} from '@ptd/core'
import { createComponentInstance, type BaseComponent } from '@ptd/components'
import { isDetailTableFragmentProps, type DetailTableFragmentProps } from './detailTable'

export interface MountedOutputDocument {
  readonly root: HTMLElement
  destroy(): void
}

const CSS_PIXELS_PER_MILLIMETER = 96 / 25.4
const OUTPUT_CANVAS_SCALE = CSS_PIXELS_PER_MILLIMETER / mmToPx(1)

export function mountOutputDocument(
  container: HTMLElement,
  output: OutputDocument,
): MountedOutputDocument {
  const root = document.createElement('div')
  root.className = 'ptd-output-document'
  root.dataset.ptdOutputDocument = 'ready'
  root.setAttribute('aria-label', `${output.metadata.title} 打印预览`)
  const instances: BaseComponent[] = []
  const style = outputStyle(output)
  root.append(style)

  output.pages.forEach((page) => {
    const pageElement = document.createElement('section')
    pageElement.className = 'ptd-output-page'
    pageElement.dataset.ptdOutputPage = String(page.pageNumber)
    pageElement.setAttribute('aria-label', `第 ${page.pageNumber} 页，共 ${page.totalPages} 页`)
    Object.assign(pageElement.style, {
      width: `${page.widthMm}mm`,
      height: `${page.heightMm}mm`,
      background: page.style.background,
      color: page.style.color,
      fontFamily: page.style.fontFamily,
      fontSize: `${page.style.fontSizePx}px`,
      lineHeight: String(page.style.lineHeight),
    })
    const pageCanvas = document.createElement('div')
    pageCanvas.className = 'ptd-output-page__canvas'
    pageCanvas.dataset.ptdOutputPageCanvas = String(page.pageNumber)
    Object.assign(pageCanvas.style, {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      contain: 'strict',
    })
    const logicalCanvas = document.createElement('div')
    logicalCanvas.className = 'ptd-output-page__logical-canvas'
    logicalCanvas.dataset.ptdOutputLogicalCanvas = String(page.pageNumber)
    Object.assign(logicalCanvas.style, {
      width: `${mmToPx(page.widthMm)}px`,
      height: `${mmToPx(page.heightMm)}px`,
      transform: `scale(${OUTPUT_CANVAS_SCALE})`,
    })
    pageCanvas.append(logicalCanvas)
    pageElement.append(pageCanvas)
    for (const region of [page.regions.header, page.regions.body, page.regions.footer]) {
      const regionElement = document.createElement('div')
      regionElement.className = `ptd-output-region ptd-output-region--${region.kind}`
      regionElement.dataset.ptdOutputRegion = region.kind
      setBounds(regionElement, region.bounds)
      logicalCanvas.append(regionElement)
      region.fragments.forEach((fragment) => mountFragment(logicalCanvas, fragment, instances))
    }
    root.append(pageElement)
  })
  container.replaceChildren(root)
  return {
    root,
    destroy() {
      instances.forEach((instance) => instance.destroy())
      instances.length = 0
      root.remove()
    },
  }
}

function mountFragment(
  page: HTMLElement,
  fragment: OutputFragment,
  instances: BaseComponent[],
): void {
  const wrapper = document.createElement('div')
  wrapper.className = 'ptd-output-fragment'
  wrapper.dataset.ptdOutputFragment = fragment.id
  wrapper.dataset.ptdSourceComponent = fragment.sourceComponentId
  wrapper.dataset.ptdContinuation = fragment.continuation
  // Fragment bounds are page-relative logical canvas coordinates.
  setBounds(wrapper, fragment.bounds)
  wrapper.style.transform = `rotate(${finite(fragment.component.style.rotate)}deg)`
  page.append(wrapper)

  if (isDetailTableFragmentProps(fragment.component.propValue)) {
    wrapper.append(renderDetailTable(fragment.component.propValue))
    return
  }
  if (mountBlockedImage(wrapper, fragment.component)) return
  if (fragment.component.component === 'RoyGroup' && Array.isArray(fragment.component.propValue)) {
    mountGroupChildren(wrapper, fragment.component, instances)
    return
  }
  const instance = createComponentInstance(withoutOuterTransform(fragment.component))
  if (!instance) return
  instance.mount(wrapper)
  instances.push(instance)
}

function mountGroupChildren(
  parent: HTMLElement,
  group: ComponentSchema,
  instances: BaseComponent[],
): void {
  const width = finite(group.style.width) || 1
  const height = finite(group.style.height) || 1
  const baseWidth = finite(group.groupStyle['baseWidth']) || width
  const baseHeight = finite(group.groupStyle['baseHeight']) || height
  const scaleX = width / baseWidth
  const scaleY = height / baseHeight
  for (const child of group.propValue as ComponentSchema[]) {
    const wrapper = document.createElement('div')
    wrapper.className = 'ptd-output-group-child'
    wrapper.dataset.ptdSourceComponent = child.id
    setBounds(wrapper, {
      left: finite(child.style.left) * scaleX,
      top: finite(child.style.top) * scaleY,
      width: child.style.width * scaleX,
      height: child.style.height * scaleY,
    })
    wrapper.style.transform = `rotate(${finite(child.style.rotate)}deg)`
    parent.append(wrapper)
    if (child.component === 'RoyGroup' && Array.isArray(child.propValue)) {
      mountGroupChildren(wrapper, child, instances)
      continue
    }
    if (mountBlockedImage(wrapper, child)) continue
    const instance = createComponentInstance(
      withoutOuterTransform({
        ...child,
        style: {
          ...child.style,
          width: child.style.width * scaleX,
          height: child.style.height * scaleY,
        },
      }),
    )
    if (!instance) continue
    instance.mount(wrapper)
    instances.push(instance)
  }
}

function mountBlockedImage(parent: HTMLElement, component: ComponentSchema): boolean {
  if (component.component !== 'RoyImage') return false
  const source = normalizeImageProps(component.propValue).src.trim()
  if (source === '' || source.toLowerCase().startsWith('data:image/')) return false
  parent.dataset.ptdRemoteResourceBlocked = component.id
  const status = document.createElement('div')
  status.className = 'ptd-render-state'
  status.dataset.state = 'error'
  status.textContent = '远程图片已被确定性输出策略阻止'
  parent.append(status)
  return true
}

function renderDetailTable(props: DetailTableFragmentProps): HTMLTableElement {
  const table = document.createElement('table')
  table.className = 'ptd-output-detail-table'
  table.dataset.ptdOutputDetailTable = 'true'
  const colgroup = document.createElement('colgroup')
  const totalWidth = props.columns.reduce((total, column) => total + column.width, 0) || 1
  props.columns.forEach((column) => {
    const col = document.createElement('col')
    col.style.width = `${(column.width / totalWidth) * 100}%`
    colgroup.append(col)
  })
  table.append(colgroup)
  if (props.includeHeader) {
    const thead = document.createElement('thead')
    thead.dataset.ptdOutputTableHeader = 'true'
    const row = document.createElement('tr')
    row.style.height = `${props.headerHeight}px`
    props.columns.forEach((column) => {
      const cell = document.createElement('th')
      cell.scope = 'col'
      cell.textContent = column.title
      cell.style.textAlign = column.horizontalAlign
      row.append(cell)
    })
    thead.append(row)
    table.append(thead)
  }
  const tbody = document.createElement('tbody')
  if (props.rows.length === 0 && props.emptyText !== undefined) {
    const row = document.createElement('tr')
    row.style.height = `${props.rowHeights[0] ?? 32}px`
    const cell = document.createElement('td')
    cell.colSpan = props.columns.length
    cell.className = 'ptd-output-detail-table__empty'
    cell.textContent = props.emptyText
    row.append(cell)
    tbody.append(row)
  } else {
    props.rows.forEach((valueRow, rowIndex) => {
      const row = document.createElement('tr')
      row.dataset.ptdOutputTableRow = valueRow.id
      row.style.height = `${props.rowHeights[rowIndex] ?? 32}px`
      valueRow.cells.forEach((value, columnIndex) => {
        const cell = document.createElement('td')
        cell.textContent = value
        cell.style.textAlign = props.columns[columnIndex]?.horizontalAlign ?? 'left'
        row.append(cell)
      })
      tbody.append(row)
    })
  }
  table.append(tbody)
  if (props.footer) table.append(renderFooter(props.footer.cells, props.footerHeight))
  return table
}

function renderFooter(
  cells: readonly DetailTableFooterCell[],
  height: number,
): HTMLTableSectionElement {
  const footer = document.createElement('tfoot')
  const row = document.createElement('tr')
  row.style.height = `${height}px`
  cells.forEach((value) => {
    const cell = document.createElement('td')
    cell.colSpan = value.colSpan
    cell.textContent = value.text
    cell.style.textAlign = value.horizontalAlign
    row.append(cell)
  })
  footer.append(row)
  return footer
}

function outputStyle(output: OutputDocument): HTMLStyleElement {
  const style = document.createElement('style')
  const first = output.pages[0]
  const pageSize = first ? `${first.widthMm}mm ${first.heightMm}mm` : 'auto'
  style.textContent = `
    @page { size: ${pageSize}; margin: 0; }
    .ptd-output-document { display: flex; flex-direction: column; align-items: center; gap: 24px; }
    .ptd-output-page { position: relative; flex: none; overflow: hidden; box-sizing: border-box; break-after: page; }
    .ptd-output-page__canvas { position: absolute; inset: 0; }
    .ptd-output-page__logical-canvas { position: absolute; inset: 0 auto auto 0; transform-origin: top left; }
    .ptd-output-page:last-child { break-after: auto; }
    .ptd-output-region, .ptd-output-fragment, .ptd-output-group-child { position: absolute; box-sizing: border-box; }
    .ptd-output-fragment { transform-origin: center center; }
    .ptd-output-detail-table { width: 100%; height: 100%; table-layout: fixed; border-collapse: collapse; }
    .ptd-output-detail-table th, .ptd-output-detail-table td { box-sizing: border-box; border: 1px solid #8d99a8; padding: 4px; white-space: pre-wrap; overflow-wrap: anywhere; vertical-align: middle; }
    .ptd-output-detail-table th { font-weight: 700; }
    .ptd-output-detail-table__empty { text-align: center; color: #647184; }
    @media print {
      .ptd-output-document { display: block; }
      .ptd-output-page { margin: 0; }
    }
  `
  return style
}

function setBounds(
  element: HTMLElement,
  bounds: { left: number; top: number; width: number; height: number },
): void {
  Object.assign(element.style, {
    left: `${bounds.left}px`,
    top: `${bounds.top}px`,
    width: `${bounds.width}px`,
    height: `${bounds.height}px`,
  })
}

function withoutOuterTransform(component: ComponentSchema): ComponentSchema {
  return { ...component, style: { ...component.style, rotate: 0 } }
}

function finite(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}
