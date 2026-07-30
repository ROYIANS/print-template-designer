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
    expect(
      defaultRegistry
        .getCatalogDefinitions()
        .every((definition) => definition.catalog.creationMode === 'draw'),
    ).toBe(true)
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

  it('keeps shape tools active after each completed frame', () => {
    const onChange = vi.fn()
    const store = createEditorStore(template(), { onChange })
    store.setActiveTool('RoyRect')

    const component = createDrawnComponentSchema(
      'RoyRect',
      { x: 20, y: 30 },
      { x: 180, y: 90 },
      PAGE,
    )
    expect(component).not.toBeNull()
    if (!component) return

    expect(store.completeDrawnComponent(component, 'RoyRect')).toBe(true)
    expect(store.activeTool.value).toBe('RoyRect')
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it.each(['RoySimpleText', 'RoyText'] as const)(
    'returns %s to Select and immediately enters content editing',
    (type) => {
      const onChange = vi.fn()
      const store = createEditorStore(template(), { onChange })
      store.setActiveTool(type)
      const component = createDrawnComponentSchema(type, { x: 20, y: 30 }, { x: 180, y: 90 }, PAGE)
      expect(component).not.toBeNull()
      if (!component) return

      expect(store.completeDrawnComponent(component, type)).toBe(true)
      expect(store.activeTool.value).toBe('select')
      expect(store.editingComponentId.value).toBe(component.id)
      expect(store.selectedIds.value).toEqual([component.id])
      expect(store.history.value).toHaveLength(2)
      expect(onChange).toHaveBeenCalledTimes(1)
    },
  )

  it.each(['RoyImage', 'RoyQRCode', 'RoyBarCode', 'RoySimpleTable', 'RoyComplexTable'] as const)(
    'returns one-shot %s to Select without opening a text editor',
    (type) => {
      const store = createEditorStore(template())
      store.setActiveTool(type)
      const component = createDrawnComponentSchema(type, { x: 20, y: 30 }, { x: 180, y: 90 }, PAGE)
      expect(component).not.toBeNull()
      if (!component) return

      expect(store.completeDrawnComponent(component, type)).toBe(true)
      expect(store.activeTool.value).toBe('select')
      expect(store.editingComponentId.value).toBeNull()
      expect(store.history.value).toHaveLength(2)
    },
  )

  it('creates media and code frames with independent structured content defaults', () => {
    const image = createDrawnComponentSchema('RoyImage', { x: 20, y: 30 }, { x: 180, y: 90 }, PAGE)
    const qr = createDrawnComponentSchema('RoyQRCode', { x: 20, y: 30 }, { x: 120, y: 130 }, PAGE)
    const barcode = createDrawnComponentSchema(
      'RoyBarCode',
      { x: 20, y: 30 },
      { x: 180, y: 90 },
      PAGE,
    )

    expect(image?.propValue).toMatchObject({ src: '', fit: 'contain', position: 'center' })
    expect(qr?.propValue).toMatchObject({ text: 'PTD-QR-0001', correctLevel: 'M', margin: 4 })
    expect(barcode?.propValue).toMatchObject({
      text: 'PTD-2026-0001',
      bcid: 'code128',
      includeText: true,
    })
    expect(image?.propValue).not.toBe(defaultRegistry.get('RoyImage')?.defaultProps)
  })

  it('does not create or switch tools when draw completion no longer matches the active tool', () => {
    const onChange = vi.fn()
    const store = createEditorStore(template(), { onChange })
    store.setActiveTool('RoyImage')
    const component = createDrawnComponentSchema(
      'RoyImage',
      { x: 20, y: 30 },
      { x: 180, y: 90 },
      PAGE,
    )
    expect(component).not.toBeNull()
    if (!component) return

    store.setActiveTool('select')
    expect(store.completeDrawnComponent(component, 'RoyImage')).toBe(false)
    expect(store.components.value).toHaveLength(0)
    expect(store.activeTool.value).toBe('select')
    expect(store.history.value).toHaveLength(1)
    expect(onChange).not.toHaveBeenCalled()
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
