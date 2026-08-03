import {
  getPageDimensions,
  mmToPx,
  normalizeTemplateData,
  OUTPUT_PAGE_TOKENS,
  resolveComponentBindings,
  type ComponentSchema,
  type OutputBounds,
  type OutputDiagnostic,
  type OutputDocument,
  type OutputFragment,
  type OutputOptions,
  type OutputPage,
  type OutputPageContext,
  type OutputRegion,
  type PageMaster,
  type RenderContext,
  type TemplatePage,
  type TemplateSchema,
} from '@ptd/core'
import {
  defaultDetailTableMeasurer,
  resolveDetailTable,
  type DetailTableFragmentProps,
  type DetailTableMeasurer,
  type DetailTableMeasurement,
  type DetailTableOutputRow,
  type ResolvedDetailTable,
} from './detailTable'

const DEFAULT_PAGE_LIMIT = 200

export interface CompileOutputRequest {
  readonly template: TemplateSchema
  readonly renderContext: RenderContext
  readonly options: OutputOptions
  readonly measureDetailTable?: DetailTableMeasurer
}

interface PageLayout {
  readonly width: number
  readonly height: number
  readonly widthMm: number
  readonly heightMm: number
  readonly header: OutputBounds
  readonly body: OutputBounds
  readonly footer: OutputBounds
  readonly master?: PageMaster
}

interface DraftPage {
  readonly id: string
  readonly bodyFragments: readonly OutputFragment[]
}

interface CompilePageResult {
  readonly pages: readonly DraftPage[]
  readonly diagnostics: readonly OutputDiagnostic[]
}

export async function compileOutputDocument({
  template,
  renderContext,
  options,
  measureDetailTable = defaultDetailTableMeasurer,
}: CompileOutputRequest): Promise<OutputDocument> {
  const context: RenderContext = {
    ...renderContext,
    locale: options.locale,
    timeZone: options.timeZone,
    now: options.now,
  }
  const data = normalizeTemplateData(template).data
  const layout = pageLayout(template)
  const pageLimit = validPageLimit(options.pageLimit)
  const drafts: DraftPage[] = []
  const diagnostics: OutputDiagnostic[] = [...pageLayoutDiagnostics(layout)]

  for (const page of template.pages) {
    const remaining = pageLimit - drafts.length
    if (remaining <= 0) {
      diagnostics.push(pageLimitDiagnostic(pageLimit))
      break
    }
    const result = await compileTemplatePage(
      page,
      layout,
      data,
      context,
      measureDetailTable,
      remaining,
    )
    drafts.push(...result.pages)
    diagnostics.push(...result.diagnostics)
    if (result.pages.length >= remaining && page !== template.pages.at(-1)) {
      diagnostics.push(pageLimitDiagnostic(pageLimit))
      break
    }
  }

  const totalPages = drafts.length
  const pages = drafts.map((draft, index) =>
    finalizePage(template, layout, draft, { pageNumber: index + 1, totalPages }),
  )
  return {
    pages,
    diagnostics,
    metadata: {
      title: options.title?.trim() || template.pageConfig.title,
      generatedAt: options.now,
      locale: options.locale,
      timeZone: options.timeZone,
    },
  }
}

async function compileTemplatePage(
  page: TemplatePage,
  layout: PageLayout,
  data: ReturnType<typeof normalizeTemplateData>['data'],
  context: RenderContext,
  measureDetailTable: DetailTableMeasurer,
  pageLimit: number,
): Promise<CompilePageResult> {
  const detailTables = page.componentData.filter(
    (component) => component.component === 'RoyComplexTable',
  )
  const resolvedStatic = page.componentData
    .filter((component) => component.component !== 'RoyComplexTable')
    .map((component) => resolveFragment(component, data, context, 0, 'none'))

  if (detailTables.length === 0) {
    return {
      pages: [{ id: `${page.id}:output:1`, bodyFragments: resolvedStatic }],
      diagnostics: [],
    }
  }
  if (detailTables.length > 1) {
    return {
      pages: [{ id: `${page.id}:output:1`, bodyFragments: resolvedStatic }],
      diagnostics: [
        {
          severity: 'error',
          code: 'UNBREAKABLE_FRAGMENT',
          message: '确定性输出 v1 每张手工页只支持一个自动分页明细表。',
          sourceComponentId: detailTables[1]?.id,
        },
      ],
    }
  }

  const component = detailTables[0]!
  const resolved = resolveDetailTable(component, data, context)
  const measurement = await measureDetailTable({ component, ...resolved })
  return paginateDetailTable(
    page,
    component,
    resolved,
    measurement,
    resolvedStatic,
    layout,
    pageLimit,
  )
}

function paginateDetailTable(
  page: TemplatePage,
  component: ComponentSchema,
  resolved: ResolvedDetailTable,
  measurement: DetailTableMeasurement,
  staticFragments: readonly OutputFragment[],
  layout: PageLayout,
  pageLimit: number,
): CompilePageResult {
  const pages: DraftPage[] = []
  const diagnostics: OutputDiagnostic[] = []
  const rows = resolved.rows
  let rowIndex = 0
  let fragmentIndex = 0
  let firstPage = true

  while (
    (rowIndex < rows.length || (rows.length === 0 && fragmentIndex === 0)) &&
    pages.length < pageLimit
  ) {
    const top = firstPage ? Math.max(layout.body.top, finite(component.style.top)) : layout.body.top
    const available = layout.body.top + layout.body.height - top
    const includeHeader = firstPage || resolved.props.header.repeat
    const headerHeight = includeHeader ? measurement.headerHeight : 0
    const minimumRowHeight =
      rows.length === 0 ? resolved.props.body.minHeight : measurement.rowHeights[rowIndex]!

    if (headerHeight + minimumRowHeight > available) {
      if (firstPage && staticFragments.length > 0) {
        pages.push({ id: `${page.id}:output:${pages.length + 1}`, bodyFragments: staticFragments })
        firstPage = false
        continue
      }
      diagnostics.push({
        severity: 'error',
        code: 'ROW_TOO_TALL',
        message: '明细表表头与至少一行内容无法放入完整正文区域。',
        sourceComponentId: component.id,
        fragmentIndex,
      })
      break
    }

    const selected: DetailTableOutputRow[] = []
    const selectedHeights: number[] = []
    let used = headerHeight
    if (rows.length === 0) {
      used += resolved.props.body.minHeight
    } else {
      while (rowIndex < rows.length) {
        const rowHeight = measurement.rowHeights[rowIndex] ?? resolved.props.body.minHeight
        if (selected.length > 0 && used + rowHeight > available) break
        if (used + rowHeight > available) {
          diagnostics.push({
            severity: 'error',
            code: 'ROW_TOO_TALL',
            message: `明细表第 ${rowIndex + 1} 行高于当前正文区域，无法保持整行。`,
            sourceComponentId: component.id,
            fragmentIndex,
          })
          break
        }
        selected.push(rows[rowIndex]!)
        selectedHeights.push(rowHeight)
        used += rowHeight
        rowIndex += 1
      }
    }

    const lastRows = rowIndex >= rows.length
    let footer = lastRows ? resolved.props.footer : undefined
    let footerHeight = footer ? measurement.footerHeight : 0
    if (footer && used + footerHeight > available) {
      footer = undefined
      footerHeight = 0
    }
    const props: DetailTableFragmentProps = {
      kind: 'foliq-detail-table-fragment',
      columns: resolved.props.columns,
      rows: selected,
      includeHeader,
      footer,
      emptyText: rows.length === 0 ? resolved.props.emptyText : undefined,
      headerHeight,
      rowHeights: selectedHeights,
      footerHeight,
    }
    const continuation = continuationFor(
      fragmentIndex,
      lastRows && Boolean(!resolved.props.footer || footer),
    )
    const fragment = fragmentForComponent(
      {
        ...component,
        propValue: props,
        style: { ...component.style, height: used + footerHeight },
      },
      fragmentIndex,
      continuation,
      {
        left: finite(component.style.left),
        top,
        width: component.style.width,
        height: used + footerHeight,
      },
    )
    pages.push({
      id: `${page.id}:output:${pages.length + 1}`,
      bodyFragments: firstPage ? [...staticFragments, fragment] : [fragment],
    })
    fragmentIndex += 1
    firstPage = false

    if (lastRows && resolved.props.footer && !footer) {
      if (pages.length >= pageLimit) {
        diagnostics.push(pageLimitDiagnostic(pageLimit, component.id))
        break
      }
      const footerHeaderHeight = measurement.headerHeight
      const footerPageHeight = footerHeaderHeight + measurement.footerHeight
      if (footerPageHeight > layout.body.height) {
        diagnostics.push({
          severity: 'error',
          code: 'UNBREAKABLE_FRAGMENT',
          message: '明细表表头与汇总行无法放入完整正文区域。',
          sourceComponentId: component.id,
          fragmentIndex,
        })
        break
      }
      const footerProps: DetailTableFragmentProps = {
        ...props,
        rows: [],
        includeHeader: true,
        emptyText: undefined,
        footer: resolved.props.footer,
        headerHeight: footerHeaderHeight,
        rowHeights: [],
        footerHeight: measurement.footerHeight,
      }
      const footerFragment = fragmentForComponent(
        {
          ...component,
          propValue: footerProps,
          style: {
            ...component.style,
            height: footerPageHeight,
          },
        },
        fragmentIndex,
        fragmentIndex === 0 ? 'none' : 'end',
        {
          left: finite(component.style.left),
          top: layout.body.top,
          width: component.style.width,
          height: footerPageHeight,
        },
      )
      pages.push({ id: `${page.id}:output:${pages.length + 1}`, bodyFragments: [footerFragment] })
      fragmentIndex += 1
    }

    if (rows.length === 0 || lastRows) break
  }

  if (rowIndex < rows.length || (pages.length >= pageLimit && rowIndex < rows.length)) {
    diagnostics.push(pageLimitDiagnostic(pageLimit, component.id))
  }
  return { pages, diagnostics }
}

function finalizePage(
  template: TemplateSchema,
  layout: PageLayout,
  draft: DraftPage,
  context: OutputPageContext,
): OutputPage {
  const masterFragments = layout.master
    ? {
        header: layout.master.header.componentData.map((component, index) =>
          masterFragment(component, layout.header, context, index),
        ),
        footer: layout.master.footer.componentData.map((component, index) =>
          masterFragment(component, layout.footer, context, index),
        ),
      }
    : { header: [], footer: [] }
  return {
    id: draft.id,
    pageNumber: context.pageNumber,
    totalPages: context.totalPages,
    widthMm: layout.widthMm,
    heightMm: layout.heightMm,
    style: {
      background: template.pageConfig.background,
      color: template.pageConfig.color,
      fontSizePx: template.pageConfig.fontSize,
      fontFamily: template.pageConfig.fontFamily,
      lineHeight: template.pageConfig.lineHeight,
    },
    regions: {
      header: region('header', layout.header, masterFragments.header),
      body: region('body', layout.body, draft.bodyFragments),
      footer: region('footer', layout.footer, masterFragments.footer),
    },
  }
}

function pageLayout(template: TemplateSchema): PageLayout {
  const dimensions = getPageDimensions(template.pageConfig)
  const landscape = template.pageConfig.pageDirection === 'l'
  const widthMm = landscape ? template.pageConfig.pageHeight : template.pageConfig.pageWidth
  const heightMm = landscape ? template.pageConfig.pageWidth : template.pageConfig.pageHeight
  const master = template.output?.pageMasters.find(
    (candidate) => candidate.id === template.output?.defaultPageMasterId,
  )
  const left = mmToPx(template.pageConfig.pageMarginLeft)
  const right = mmToPx(template.pageConfig.pageMarginRight)
  const top = mmToPx(template.pageConfig.pageMarginTop)
  const bottom = mmToPx(template.pageConfig.pageMarginBottom)
  const headerHeight = mmToPx(master?.header.heightMm ?? 0)
  const footerHeight = mmToPx(master?.footer.heightMm ?? 0)
  const contentWidth = dimensions.width - left - right
  const footerTop = dimensions.height - bottom - footerHeight
  const bodyTop = top + headerHeight
  return {
    width: dimensions.width,
    height: dimensions.height,
    widthMm,
    heightMm,
    master,
    header: { left, top, width: contentWidth, height: headerHeight },
    body: { left, top: bodyTop, width: contentWidth, height: Math.max(0, footerTop - bodyTop) },
    footer: { left, top: footerTop, width: contentWidth, height: footerHeight },
  }
}

function pageLayoutDiagnostics(layout: PageLayout): readonly OutputDiagnostic[] {
  if (layout.body.height > 0) return []
  return [
    {
      severity: 'error',
      code: 'UNBREAKABLE_FRAGMENT',
      message: '页眉、页脚与页面边距占满了纸张，正文区域必须保留大于 0 的高度。',
    },
  ]
}

function resolveFragment(
  component: ComponentSchema,
  data: ReturnType<typeof normalizeTemplateData>['data'],
  context: RenderContext,
  fragmentIndex: number,
  continuation: OutputFragment['continuation'],
): OutputFragment {
  const resolution = resolveComponentBindings(component, data, context)
  return fragmentForComponent(resolution.component, fragmentIndex, continuation)
}

function masterFragment(
  component: ComponentSchema,
  regionBounds: OutputBounds,
  context: OutputPageContext,
  index: number,
): OutputFragment {
  const resolved = resolvePageTokens(component, context)
  return fragmentForComponent(resolved, index, 'none', {
    left: regionBounds.left + finite(component.style.left),
    top: regionBounds.top + finite(component.style.top),
    width: component.style.width,
    height: component.style.height,
  })
}

function resolvePageTokens(
  component: ComponentSchema,
  context: OutputPageContext,
): ComponentSchema {
  if (component.component !== 'RoySimpleText' && component.component !== 'RoyText') return component
  if (typeof component.propValue !== 'string') return component
  return {
    ...component,
    propValue: component.propValue
      .replaceAll(OUTPUT_PAGE_TOKENS.pageNumber, String(context.pageNumber))
      .replaceAll(OUTPUT_PAGE_TOKENS.totalPages, String(context.totalPages)),
  }
}

function fragmentForComponent(
  component: ComponentSchema,
  fragmentIndex: number,
  continuation: OutputFragment['continuation'],
  bounds: OutputBounds = {
    left: finite(component.style.left),
    top: finite(component.style.top),
    width: component.style.width,
    height: component.style.height,
  },
): OutputFragment {
  return {
    id: `${component.id}:fragment:${fragmentIndex}`,
    sourceComponentId: component.id,
    fragmentIndex,
    continuation,
    bounds,
    component,
  }
}

function continuationFor(index: number, isLast: boolean): OutputFragment['continuation'] {
  if (index === 0 && isLast) return 'none'
  if (index === 0) return 'start'
  return isLast ? 'end' : 'middle'
}

function region(
  kind: OutputRegion['kind'],
  bounds: OutputBounds,
  fragments: readonly OutputFragment[],
): OutputRegion {
  return { kind, bounds, fragments }
}

function finite(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function validPageLimit(value: number | undefined): number {
  return Number.isInteger(value) && value !== undefined && value > 0
    ? Math.min(DEFAULT_PAGE_LIMIT, value)
    : DEFAULT_PAGE_LIMIT
}

function pageLimitDiagnostic(limit: number, sourceComponentId?: string): OutputDiagnostic {
  return {
    severity: 'error',
    code: 'PAGE_LIMIT_EXCEEDED',
    message: `输出页数超过 ${limit} 页限制。`,
    sourceComponentId,
  }
}
