import { describe, expect, it, vi } from 'vitest'
import { defaultRegistry, type TemplateSchema } from '@ptd/core'
import {
  catalogGroups,
  componentCatalog,
  createComponentSchema,
  createDrawnComponentSchema,
  frequentCatalogItems,
  isAvailableCatalogItem,
  searchComponentCatalog,
} from '../catalog'
import { createEditorStore } from '../state'

const PAGE = { width: 794, height: 1123 }

describe('component catalog', () => {
  it('exposes every creatable built-in but excludes the command-created group', () => {
    const available = componentCatalog.filter(isAvailableCatalogItem)
    expect(componentCatalog).toHaveLength(18)
    expect(available).toHaveLength(11)
    expect(available.map((item) => String(item.type))).not.toContain('RoyGroup')
    expect(new Set(available.map((item) => item.type)).size).toBe(available.length)
    expect(componentCatalog.filter((item) => item.kind === 'planned')).toHaveLength(7)
    expect(
      componentCatalog.filter((item) => item.kind === 'planned').every((item) => !('type' in item)),
    ).toBe(true)
  })

  it('keeps the five groups in product order with exact available and planned counts', () => {
    expect(catalogGroups.map((group) => group.name)).toEqual([
      '文本',
      '表格',
      '图像',
      '编码',
      '图形',
    ])
    expect(
      catalogGroups.map((group) => {
        const items = componentCatalog.filter((item) => item.group === group.id)
        return [
          items.filter(isAvailableCatalogItem).length,
          items.filter((item) => item.kind === 'planned').length,
        ]
      }),
    ).toEqual([
      [2, 3],
      [2, 2],
      [1, 1],
      [2, 0],
      [4, 1],
    ])
    expect(catalogGroups.every((group) => group.introduction.length > 0)).toBe(true)
    expect(frequentCatalogItems.map((item) => item.type)).toEqual([
      'RoySimpleText',
      'RoyImage',
      'RoySimpleTable',
      'RoyQRCode',
    ])
    expect(defaultRegistry.get('RoySimpleText')?.catalog?.creationMode).toBe('draw')
    expect(defaultRegistry.get('RoyText')?.catalog?.creationMode).toBe('insert')
  })

  it('searches names, Chinese use cases, descriptions and technical types deterministically', () => {
    expect(searchComponentCatalog('富文本').map((item) => item.id)).toEqual(['rich-text'])
    expect(searchComponentCatalog('印章').map((item) => item.id)).toEqual([
      'bitmap-image',
      'ellipse',
    ])
    expect(searchComponentCatalog('自动分页').map((item) => item.id)).toEqual([
      'flowing-data-table',
    ])
    expect(searchComponentCatalog('royqrcode').map((item) => item.id)).toEqual(['qr-code'])
    expect(searchComponentCatalog('  ').map((item) => item.id)).toEqual(
      componentCatalog.map((item) => item.id),
    )
  })

  it('creates complete schemas from registry defaults with unique ids', () => {
    const schemas = componentCatalog
      .filter(isAvailableCatalogItem)
      .map((item) =>
        createComponentSchema(item.type, { x: PAGE.width / 2, y: PAGE.height / 2 }, PAGE),
      )

    expect(new Set(schemas.map((schema) => schema.id)).size).toBe(schemas.length)
    schemas.forEach((schema) => {
      const definition = defaultRegistry.get(schema.component)
      expect(definition).toBeDefined()
      expect(schema.name).toBe(definition?.name)
      expect(schema.group).toBe(definition?.category)
      expect(schema.code).toBe(definition?.type)
      expect(schema.style.left).toBeGreaterThanOrEqual(0)
      expect(schema.style.top).toBeGreaterThanOrEqual(0)
      expect(schema.groupStyle).toEqual({})
      expect(schema.position).toEqual({ x: schema.style.left, y: schema.style.top })
    })
  })

  it('centers and clamps geometry without mutating registry defaults', () => {
    const centered = createComponentSchema('RoyRect', { x: 397, y: 561 }, PAGE)
    expect(centered.style).toMatchObject({ width: 200, height: 100, left: 297, top: 511 })

    const clamped = createComponentSchema('RoyRect', { x: -100, y: 2_000 }, PAGE)
    expect(clamped.style.left).toBe(0)
    expect(clamped.style.top).toBe(PAGE.height - 100)

    clamped.style.width = 12
    expect(defaultRegistry.get('RoyRect')?.defaultStyle.width).toBe(200)
  })

  it('adds and selects through one history entry and one host change', () => {
    const onChange = vi.fn()
    const initial = template()
    const store = createEditorStore(initial, { onChange })
    const component = createComponentSchema('RoySimpleText', { x: 200, y: 100 }, PAGE)

    store.addComponent(component)

    expect(store.components.value).toHaveLength(1)
    expect(store.selectedIds.value).toEqual([component.id])
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)

    store.undo()
    expect(store.components.value).toHaveLength(0)
  })

  it('keeps draw-tool activation outside schema history and persists it after creation', () => {
    const onChange = vi.fn()
    const store = createEditorStore(template(), { onChange })
    const component = createComponentSchema('RoyRect', { x: 200, y: 100 }, PAGE)

    store.setActiveTool('RoyRect')
    expect(store.activeTool.value).toBe('RoyRect')
    expect(store.lastDrawingTool.value).toBe('RoyRect')
    expect(store.history.value).toHaveLength(1)
    expect(onChange).not.toHaveBeenCalled()

    store.addComponent(component)
    expect(store.activeTool.value).toBe('RoyRect')
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)

    store.setActiveTool('select')
    expect(store.lastDrawingTool.value).toBe('RoyRect')
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it.each(['select', 'RoySimpleText', 'RoyStar'] as const)(
    'temporarily overrides persistent %s with Hand and restores it without mutations',
    (persistentTool) => {
      const onChange = vi.fn()
      const store = createEditorStore(template(), { onChange })

      store.setActiveTool('RoyStar')
      store.setActiveTool(persistentTool)
      store.selectedIds.value = ['selection-sentinel']
      expect(store.activeTool.value).toBe(persistentTool)
      expect(store.effectiveTool.value).toBe(persistentTool)
      expect(store.lastDrawingTool.value).toBe('RoyStar')

      store.setTemporaryHand(true)
      expect(store.activeTool.value).toBe(persistentTool)
      expect(store.effectiveTool.value).toBe('hand')
      expect(store.lastDrawingTool.value).toBe('RoyStar')
      expect(store.selectedIds.value).toEqual(['selection-sentinel'])

      store.setTemporaryHand(false)
      expect(store.effectiveTool.value).toBe(persistentTool)
      expect(store.selectedIds.value).toEqual(['selection-sentinel'])
      expect(store.history.value).toHaveLength(1)
      expect(onChange).not.toHaveBeenCalled()
    },
  )

  it('keeps Text persistent while each valid frame adds one schema and history entry', () => {
    const onChange = vi.fn()
    const store = createEditorStore(template(), { onChange })
    store.setActiveTool('RoySimpleText')

    const first = createDrawnComponentSchema(
      'RoySimpleText',
      { x: 20, y: 30 },
      { x: 180, y: 90 },
      PAGE,
    )
    const second = createDrawnComponentSchema(
      'RoySimpleText',
      { x: 220, y: 160 },
      { x: 80, y: 110 },
      PAGE,
    )
    expect(first).not.toBeNull()
    expect(second).not.toBeNull()
    if (!first || !second) return

    store.addComponent(first)
    expect(store.activeTool.value).toBe('RoySimpleText')
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)

    store.addComponent(second)
    expect(store.components.value).toHaveLength(2)
    expect(store.activeTool.value).toBe('RoySimpleText')
    expect(store.history.value).toHaveLength(3)
    expect(onChange).toHaveBeenCalledTimes(2)

    store.setActiveTool('hand')
    store.setActiveTool('select')
    expect(store.history.value).toHaveLength(3)
    expect(onChange).toHaveBeenCalledTimes(2)
  })
})

function template(): TemplateSchema {
  return {
    _version: 1,
    pageConfig: {
      pageSize: 'A4',
      pageDirection: 'p',
      pageLayout: 'fixed',
      pageWidth: 210,
      pageHeight: 297,
      pageCurHeight: 297,
      pageMarginBottom: 8,
      pageMarginTop: 8,
      title: '测试模板',
      scale: 1,
      background: '#fcfdff',
      color: '#1d2735',
      fontSize: 12,
      fontFamily: 'sans-serif',
      lineHeight: 1.4,
    },
    pages: [{ id: 'page-1', componentData: [] }],
    dataSource: [],
    dataSet: {},
  }
}
