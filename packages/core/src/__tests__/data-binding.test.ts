import { describe, it, expect } from 'vitest'
import { DataBindingEngine } from '../data-binding/engine'
import type { DataSourceField } from '../types/data-source'

const dataSource: DataSourceField[] = [
  { id: '1', title: '姓名', field: 'name', typeName: 'String' },
  { id: '2', title: '金额', field: 'amount', typeName: 'Money' },
  { id: '3', title: '大写金额', field: 'bigAmount', typeName: 'BigMoney' },
  { id: '4', title: '列表', field: 'items', typeName: 'Array' },
]

describe('DataBindingEngine', () => {
  it('resolves a simple string field', () => {
    const engine = new DataBindingEngine({ name: 'Alice' }, dataSource)
    expect(engine.resolve('[::name::]')).toBe('Alice')
  })

  it('resolves multiple bindings in one template', () => {
    const engine = new DataBindingEngine({ name: 'Alice', amount: 1234.5 }, dataSource)
    const result = engine.resolve('姓名：[::name::]，金额：[::amount::]')
    expect(result).toContain('Alice')
    expect(result).toContain('1,234.50')
  })

  it('returns empty string for null/undefined field', () => {
    const engine = new DataBindingEngine({ name: null }, dataSource)
    expect(engine.resolve('[::name::]')).toBe('')
  })

  it('returns raw string for unknown field', () => {
    const engine = new DataBindingEngine({}, dataSource)
    expect(engine.resolve('[::unknown::]')).toBe('')
  })

  it('calls function values', () => {
    const engine = new DataBindingEngine({ name: () => 'Bob' }, dataSource)
    expect(engine.resolve('[::name::]')).toBe('Bob')
  })

  it('resolves Array type as JSON', () => {
    const engine = new DataBindingEngine({ items: [1, 2, 3] }, dataSource)
    expect(engine.resolve('[::items::]')).toBe('[1,2,3]')
  })

  it('passes through template with no bindings', () => {
    const engine = new DataBindingEngine({}, dataSource)
    expect(engine.resolve('hello world')).toBe('hello world')
  })
})
