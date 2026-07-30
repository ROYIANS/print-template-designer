import { describe, it, expect } from 'vitest'
import {
  ComponentRegistry,
  defaultRegistry,
  type ComponentDefinition,
} from '../registry/component-registry'

const AVAILABLE_TYPES = [
  'RoySimpleText',
  'RoyText',
  'RoySimpleTable',
  'RoyImage',
  'RoyQRCode',
  'RoyBarCode',
  'RoyLine',
  'RoyRect',
  'RoyCircle',
  'RoyStar',
]

describe('ComponentRegistry', () => {
  it('defaultRegistry has all 12 built-in components', () => {
    expect(defaultRegistry.getAll()).toHaveLength(12)
  })

  it('exposes exactly 10 honest catalog definitions and keeps read-only components internal', () => {
    expect(defaultRegistry.getCatalogDefinitions().map((definition) => definition.type)).toEqual(
      AVAILABLE_TYPES,
    )
    expect(defaultRegistry.get('RoyGroup')).toMatchObject({ internal: true })
    expect(defaultRegistry.get('RoyGroup')?.catalog).toBeUndefined()
    expect(defaultRegistry.get('RoyComplexTable')).toMatchObject({ internal: true })
    expect(defaultRegistry.get('RoyComplexTable')?.catalog).toBeUndefined()
  })

  it('provides complete canonical metadata for every creatable definition', () => {
    for (const definition of defaultRegistry.getCatalogDefinitions()) {
      expect(definition.catalog.id).not.toBe('')
      expect(definition.catalog.description).not.toBe('')
      expect(definition.catalog.keywords.length).toBeGreaterThanOrEqual(3)
      expect(['text', 'table', 'image', 'code', 'shape']).toContain(definition.catalog.group)
      expect(['basic', 'complex']).toContain(definition.catalog.maturity)
      expect(definition.catalog.creationMode).toBe('draw')
    }
    expect(
      new Set(defaultRegistry.getCatalogDefinitions().map(({ catalog }) => catalog.id)).size,
    ).toBe(10)
  })

  it('preserves persisted categories while clarifying product names', () => {
    expect(defaultRegistry.get('RoyText')).toMatchObject({ name: '富文本', category: 'common' })
    expect(defaultRegistry.get('RoySimpleTable')).toMatchObject({
      name: '自由表格',
      category: 'data',
    })
    expect(defaultRegistry.get('RoyCircle')).toMatchObject({ name: '椭圆', category: 'shape' })
    expect(
      defaultRegistry
        .getCatalogDefinitions()
        .every((definition) => definition.catalog.creationMode === 'draw'),
    ).toBe(true)
  })

  it('get returns definition for known type', () => {
    const def = defaultRegistry.get('RoySimpleText')
    expect(def).toBeDefined()
    expect(def?.name).toBe('文本')
  })

  it('keeps new text content empty so editor placeholders never persist into templates', () => {
    expect(defaultRegistry.get('RoySimpleText')?.defaultProps).toBe('')
    expect(defaultRegistry.get('RoyText')?.defaultProps).toBe('<p></p>')
  })

  it('gives media and code components usable structured defaults', () => {
    expect(defaultRegistry.get('RoyImage')?.defaultProps).toMatchObject({
      src: '',
      fit: 'contain',
    })
    expect(defaultRegistry.get('RoyQRCode')?.defaultProps).toMatchObject({
      text: 'PTD-QR-0001',
      correctLevel: 'M',
    })
    expect(defaultRegistry.get('RoyBarCode')?.defaultProps).toMatchObject({
      text: 'PTD-2026-0001',
      bcid: 'code128',
      includeText: true,
    })
  })

  it('gives a new free table a real independent 2 x 2 cell model', () => {
    const value = defaultRegistry.get('RoySimpleTable')?.defaultProps
    expect(value).toMatchObject({
      rowHeights: [100, 100],
      columnWidths: [250, 250],
      grid: [
        ['cell-1', 'cell-2'],
        ['cell-3', 'cell-4'],
      ],
    })
  })

  it('gives every new shape an immediately visible neutral default', () => {
    expect(defaultRegistry.get('RoyLine')?.defaultStyle).toMatchObject({
      height: 2,
      background: '#647184',
    })
    for (const type of ['RoyRect', 'RoyCircle'] as const) {
      expect(defaultRegistry.get(type)?.defaultStyle).toMatchObject({
        background: 'transparent',
        borderWidth: 1,
        borderType: 'solid',
        borderColor: '#647184',
      })
    }
    expect(defaultRegistry.get('RoyStar')?.defaultStyle).toMatchObject({
      background: '#647184',
    })
  })

  it('get returns undefined for unknown type', () => {
    expect(defaultRegistry.get('Unknown' as never)).toBeUndefined()
  })

  it('has returns true for registered type', () => {
    expect(defaultRegistry.has('RoyImage')).toBe(true)
  })

  it('getByCategory returns correct components', () => {
    const shapes = defaultRegistry.getByCategory('shape')
    const types = shapes.map((d: ComponentDefinition) => d.type)
    expect(types).toContain('RoyLine')
    expect(types).toContain('RoyRect')
    expect(types).toContain('RoyCircle')
    expect(types).toContain('RoyStar')
  })

  it('register adds a new component', () => {
    const registry = new ComponentRegistry()
    registry.register({
      type: 'RoySimpleText',
      name: 'Custom',
      icon: '',
      category: 'common',
      catalog: {
        id: 'custom-text',
        group: 'text',
        description: 'Custom description',
        keywords: ['custom', 'text', 'label'],
        maturity: 'basic',
        creationMode: 'insert',
      },
      defaultStyle: { width: 100, height: 50, rotate: 0, opacity: 1 },
      defaultProps: '',
    })
    expect(registry.get('RoySimpleText')?.name).toBe('Custom')
  })
})
