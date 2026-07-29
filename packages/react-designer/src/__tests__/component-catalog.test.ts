import { describe, expect, it, vi } from 'vitest'
import { defaultRegistry, type TemplateSchema } from '@ptd/core'
import { componentCatalog, createComponentSchema } from '../catalog'
import { createEditorStore } from '../state'

const PAGE = { width: 794, height: 1123 }

describe('component catalog', () => {
  it('exposes every creatable built-in but excludes the command-created group', () => {
    expect(componentCatalog).toHaveLength(11)
    expect(componentCatalog.map((item) => String(item.type))).not.toContain('RoyGroup')
    expect(new Set(componentCatalog.map((item) => item.type)).size).toBe(componentCatalog.length)
  })

  it('creates complete schemas from registry defaults with unique ids', () => {
    const schemas = componentCatalog.map((item) =>
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
