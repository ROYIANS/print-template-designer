import { describe, expect, it } from 'vitest'
import {
  ARRAY_ITEM_PATH_SEGMENT,
  DEFAULT_PAGE_CONFIG,
  OUTPUT_PAGE_TOKENS,
  type ComponentSchema,
  type RenderContext,
  type TemplateSchema,
} from '@ptd/core'
import { compileOutputDocument } from '../compiler'
import { isDetailTableFragmentProps } from '../detailTable'

const context: RenderContext = {
  data: {},
  locale: 'zh-CN',
  timeZone: 'Asia/Shanghai',
  now: '2026-08-03T08:00:00.000Z',
  mode: 'print',
}

const options = {
  locale: context.locale,
  timeZone: context.timeZone,
  now: context.now,
}

function text(id: string, value: string, top = 20): ComponentSchema {
  return {
    id,
    component: 'RoySimpleText',
    propValue: value,
    style: { left: 20, top, width: 180, height: 30, rotate: 0, opacity: 1 },
    groupStyle: {},
    position: { x: 20, y: top },
  }
}

function template(componentData: ComponentSchema[] = [text('title', '标题')]): TemplateSchema {
  return {
    _version: 2,
    pageConfig: { ...DEFAULT_PAGE_CONFIG },
    pages: [{ id: 'page-1', componentData }],
    data: { version: 1, fields: [] },
  }
}

function detailTable(
  id = 'items-table',
  options: { repeatHeader?: boolean; footer?: boolean; top?: number } = {},
): ComponentSchema {
  return {
    id,
    component: 'RoyComplexTable',
    propValue: {
      dataFieldId: 'items',
      columns: [
        {
          id: 'name',
          title: '项目',
          width: 200,
          fallback: '明细',
          horizontalAlign: 'left',
        },
      ],
      header: { repeat: options.repeatHeader ?? true, minHeight: 30 },
      body: { minHeight: 25, keepRowTogether: true },
      ...(options.footer
        ? {
            footer: {
              minHeight: 40,
              cells: [
                {
                  id: 'summary',
                  text: '合计',
                  colSpan: 1,
                  horizontalAlign: 'right' as const,
                },
              ],
            },
          }
        : {}),
      emptyText: '暂无明细',
    },
    style: {
      left: 20,
      top: options.top ?? 20,
      width: 200,
      height: 100,
      rotate: 0,
      opacity: 1,
    },
    groupStyle: {},
    position: { x: 20, y: options.top ?? 20 },
  }
}

function withItems(source: TemplateSchema): TemplateSchema {
  source.data = {
    version: 1,
    fields: [{ id: 'items', name: '明细', path: ['items'], valueType: 'array' }],
  }
  return source
}

describe('compileOutputDocument', () => {
  it('compiles manual pages one-to-one without mutating the template', async () => {
    const source = template()
    const before = JSON.stringify(source)
    const output = await compileOutputDocument({
      template: source,
      renderContext: context,
      options,
    })

    expect(output.pages).toHaveLength(1)
    expect(output.pages[0]).toMatchObject({ pageNumber: 1, totalPages: 1 })
    expect(output.pages[0]?.regions.body.fragments[0]).toMatchObject({
      sourceComponentId: 'title',
      continuation: 'none',
      bounds: { left: 20, top: 20, width: 180, height: 30 },
    })
    expect(JSON.stringify(source)).toBe(before)
  })

  it('resolves page-master tokens only after total pages are known', async () => {
    const source = template()
    source.pages = [
      { id: 'page-1', componentData: [] },
      { id: 'page-2', componentData: [] },
      { id: 'page-3', componentData: [] },
    ]
    source.output = {
      defaultPageMasterId: 'default',
      pageMasters: [
        {
          id: 'default',
          name: '默认版式',
          header: {
            heightMm: 12,
            componentData: [
              text(
                'page-number',
                `第 ${OUTPUT_PAGE_TOKENS.pageNumber} / ${OUTPUT_PAGE_TOKENS.totalPages} 页`,
                0,
              ),
            ],
          },
          footer: { heightMm: 8, componentData: [] },
        },
      ],
    }

    const output = await compileOutputDocument({
      template: source,
      renderContext: context,
      options,
    })

    expect(output.pages).toHaveLength(3)
    expect(
      output.pages.map((page) => page.regions.header.fragments[0]?.component.propValue as string),
    ).toEqual(['第 1 / 3 页', '第 2 / 3 页', '第 3 / 3 页'])
  })

  it('paginates a semantic detail table and repeats its header without dropping rows', async () => {
    const table: ComponentSchema = {
      id: 'items-table',
      component: 'RoyComplexTable',
      propValue: {
        dataFieldId: 'items',
        columns: [
          {
            id: 'name-column',
            title: '项目',
            width: 220,
            fieldId: 'item-name',
            horizontalAlign: 'left',
          },
          {
            id: 'quantity-column',
            title: '数量',
            width: 100,
            fieldId: 'item-quantity',
            horizontalAlign: 'right',
          },
        ],
        header: { repeat: true, minHeight: 30 },
        body: { minHeight: 25, keepRowTogether: true },
        emptyText: '暂无明细',
      },
      style: { left: 20, top: 60, width: 320, height: 200, rotate: 0, opacity: 1 },
      groupStyle: {},
      position: { x: 20, y: 60 },
    }
    const source = template([text('document-title', '出库明细'), table])
    source.pageConfig = {
      ...DEFAULT_PAGE_CONFIG,
      pageSize: 'custom',
      pageWidth: 120,
      pageHeight: 100,
      pageCurHeight: 100,
      pageMarginTop: 5,
      pageMarginRight: 5,
      pageMarginBottom: 5,
      pageMarginLeft: 5,
    }
    source.data = {
      version: 1,
      fields: [
        {
          id: 'items',
          name: '明细',
          path: ['items'],
          valueType: 'array',
          children: [
            {
              id: 'item-name',
              name: '项目',
              path: ['items', ARRAY_ITEM_PATH_SEGMENT, 'name'],
              valueType: 'string',
            },
            {
              id: 'item-quantity',
              name: '数量',
              path: ['items', ARRAY_ITEM_PATH_SEGMENT, 'quantity'],
              valueType: 'number',
              formatter: { kind: 'number', useGrouping: true },
            },
          ],
        },
      ],
    }
    const rows = Array.from({ length: 40 }, (_, index) => ({
      name: `项目 ${index + 1}`,
      quantity: index + 1,
    }))
    const output = await compileOutputDocument({
      template: source,
      renderContext: { ...context, data: { items: rows } },
      options,
      measureDetailTable: ({ props, rows: measuredRows }) => ({
        headerHeight: props.header.minHeight,
        rowHeights: measuredRows.map(() => props.body.minHeight),
        footerHeight: 0,
      }),
    })

    expect(output.pages.length).toBeGreaterThan(2)
    const fragments = output.pages.flatMap((page) =>
      page.regions.body.fragments.filter((fragment) => fragment.sourceComponentId === table.id),
    )
    const props = fragments
      .map((fragment) => fragment.component.propValue)
      .filter(isDetailTableFragmentProps)
    expect(props).toHaveLength(fragments.length)
    expect(props.every((value) => value.includeHeader)).toBe(true)
    expect(props.flatMap((value) => value.rows).map((row) => row.cells[0])).toEqual(
      rows.map((row) => row.name),
    )
    expect(output.diagnostics).toEqual([])
    expect(fragments[0]?.continuation).toBe('start')
    expect(fragments.at(-1)?.continuation).toBe('end')
  })

  it('stops with a deterministic diagnostic when a row cannot fit', async () => {
    const table: ComponentSchema = {
      id: 'oversize-table',
      component: 'RoyComplexTable',
      propValue: {
        dataFieldId: 'items',
        columns: [
          {
            id: 'name',
            title: '项目',
            width: 200,
            horizontalAlign: 'left',
          },
        ],
        header: { repeat: true, minHeight: 30 },
        body: { minHeight: 30, keepRowTogether: true },
        emptyText: '暂无明细',
      },
      style: { left: 20, top: 20, width: 200, height: 100, rotate: 0, opacity: 1 },
      groupStyle: {},
      position: { x: 20, y: 20 },
    }
    const source = template([table])
    source.data = {
      version: 1,
      fields: [{ id: 'items', name: '明细', path: ['items'], valueType: 'array' }],
    }
    const output = await compileOutputDocument({
      template: source,
      renderContext: { ...context, data: { items: [{ name: '过高内容' }] } },
      options,
      measureDetailTable: () => ({ headerHeight: 30, rowHeights: [10_000], footerHeight: 0 }),
    })

    expect(output.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'ROW_TOO_TALL', sourceComponentId: table.id }),
    )
    expect(output.pages.length).toBeLessThan(3)
  })

  it('moves a table footer to a new page with its header even when ordinary headers do not repeat', async () => {
    const table = detailTable('footer-table', { repeatHeader: false, footer: true, top: 25 })
    const source = withItems(template([table]))
    source.pageConfig = {
      ...DEFAULT_PAGE_CONFIG,
      pageSize: 'custom',
      pageWidth: 100,
      pageHeight: 40,
      pageCurHeight: 40,
      pageMarginTop: 5,
      pageMarginRight: 5,
      pageMarginBottom: 5,
      pageMarginLeft: 5,
    }

    const output = await compileOutputDocument({
      template: source,
      renderContext: { ...context, data: { items: [{}] } },
      options,
      measureDetailTable: () => ({ headerHeight: 30, rowHeights: [80], footerHeight: 50 }),
    })

    expect(output.diagnostics).toEqual([])
    expect(output.pages).toHaveLength(2)
    const fragments = output.pages.map((page) => page.regions.body.fragments[0]!)
    const footerProps = fragments[1]?.component.propValue
    expect(isDetailTableFragmentProps(footerProps)).toBe(true)
    if (!isDetailTableFragmentProps(footerProps)) throw new Error('Expected footer fragment')
    expect(footerProps).toMatchObject({ includeHeader: true, headerHeight: 30, footerHeight: 50 })
    expect(footerProps.rows).toEqual([])
    expect(footerProps.footer?.cells[0]?.text).toBe('合计')
    expect(fragments.map((fragment) => fragment.continuation)).toEqual(['start', 'end'])
  })

  it('fails explicitly when a deferred table footer cannot fit or exceeds the page limit', async () => {
    const table = detailTable('limited-footer', { footer: true, top: 25 })
    const source = withItems(template([table]))
    source.pageConfig = {
      ...DEFAULT_PAGE_CONFIG,
      pageSize: 'custom',
      pageWidth: 100,
      pageHeight: 40,
      pageCurHeight: 40,
      pageMarginTop: 5,
      pageMarginRight: 5,
      pageMarginBottom: 5,
      pageMarginLeft: 5,
    }
    const request = {
      template: source,
      renderContext: { ...context, data: { items: [{}] } },
      measureDetailTable: () => ({ headerHeight: 30, rowHeights: [80], footerHeight: 140 }),
    }

    const oversized = await compileOutputDocument({ ...request, options })
    expect(oversized.pages).toHaveLength(1)
    expect(oversized.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'UNBREAKABLE_FRAGMENT',
        sourceComponentId: table.id,
      }),
    )

    const limited = await compileOutputDocument({
      ...request,
      options: { ...options, pageLimit: 1 },
    })
    expect(limited.pages).toHaveLength(1)
    expect(limited.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'PAGE_LIMIT_EXCEEDED', sourceComponentId: table.id }),
    )
  })

  it('keeps global page numbers across manual pages and automatic continuation pages', async () => {
    const table = detailTable('paged-table', { top: 25 })
    const source = withItems(template())
    source.pageConfig = {
      ...DEFAULT_PAGE_CONFIG,
      pageSize: 'custom',
      pageWidth: 100,
      pageHeight: 40,
      pageCurHeight: 40,
      pageMarginTop: 5,
      pageMarginRight: 5,
      pageMarginBottom: 5,
      pageMarginLeft: 5,
    }
    source.pages = [
      { id: 'manual-before', componentData: [text('before', '封面')] },
      { id: 'automatic', componentData: [table] },
      { id: 'manual-after', componentData: [text('after', '附页')] },
    ]
    source.output = {
      defaultPageMasterId: 'default',
      pageMasters: [
        {
          id: 'default',
          name: '默认版式',
          header: {
            heightMm: 2,
            componentData: [
              text(
                'page-number',
                `${OUTPUT_PAGE_TOKENS.pageNumber}/${OUTPUT_PAGE_TOKENS.totalPages}`,
                0,
              ),
            ],
          },
          footer: { heightMm: 0, componentData: [] },
        },
      ],
    }

    const output = await compileOutputDocument({
      template: source,
      renderContext: { ...context, data: { items: [{}, {}, {}] } },
      options,
      measureDetailTable: () => ({ headerHeight: 30, rowHeights: [60, 60, 60], footerHeight: 0 }),
    })

    expect(output.pages).toHaveLength(5)
    expect(output.pages.map((page) => [page.pageNumber, page.totalPages])).toEqual([
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [5, 5],
    ])
    expect(
      output.pages.map((page) => page.regions.header.fragments[0]?.component.propValue),
    ).toEqual(['1/5', '2/5', '3/5', '4/5', '5/5'])
  })

  it('reports a fatal layout diagnostic when the page master leaves no body area', async () => {
    const source = template()
    source.output = {
      defaultPageMasterId: 'invalid-master',
      pageMasters: [
        {
          id: 'invalid-master',
          name: '无正文版式',
          header: { heightMm: 150, componentData: [] },
          footer: { heightMm: 140, componentData: [] },
        },
      ],
    }

    const output = await compileOutputDocument({
      template: source,
      renderContext: context,
      options,
    })

    expect(output.pages[0]?.regions.body.bounds.height).toBe(0)
    expect(output.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'UNBREAKABLE_FRAGMENT', severity: 'error' }),
    )
  })
})
