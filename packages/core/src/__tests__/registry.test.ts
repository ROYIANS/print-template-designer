import { describe, it, expect } from 'vitest'
import { ComponentRegistry, defaultRegistry, type ComponentDefinition } from '../registry/component-registry'

describe('ComponentRegistry', () => {
  it('defaultRegistry has all 12 built-in components', () => {
    expect(defaultRegistry.getAll()).toHaveLength(12)
  })

  it('get returns definition for known type', () => {
    const def = defaultRegistry.get('RoySimpleText')
    expect(def).toBeDefined()
    expect(def?.name).toBe('文本')
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
      defaultStyle: { width: 100, height: 50, rotate: 0, opacity: 1 },
      defaultProps: '',
    })
    expect(registry.get('RoySimpleText')?.name).toBe('Custom')
  })
})
