import { describe, expect, it } from 'vitest'
import {
  ARRAY_ITEM_PATH_SEGMENT,
  formatDataPath,
  parseDataPath,
  readDataPath,
} from '../data-binding/path'

describe('safe data paths', () => {
  it('round-trips nested keys, array indexes and dotted object keys', () => {
    const parsed = parseDataPath('orders[0]["line.item"].sku')
    expect(parsed).toMatchObject({
      ok: true,
      path: ['orders', 0, 'line.item', 'sku'],
    })
    expect(formatDataPath(parsed.path)).toBe('orders[0]["line.item"].sku')
    expect(readDataPath({ orders: [{ 'line.item': { sku: 'COLD-01' } }] }, parsed.path)).toEqual({
      status: 'ready',
      value: 'COLD-01',
      diagnostics: [],
    })
  })

  it('uses a structural array-item segment that cannot collide with a real star key', () => {
    expect(parseDataPath('items[].sku').path).toEqual(['items', ARRAY_ITEM_PATH_SEGMENT, 'sku'])
    expect(parseDataPath('["*"]').path).toEqual(['*'])
    expect(formatDataPath(['items', ARRAY_ITEM_PATH_SEGMENT, 'sku'])).toBe('items[].sku')
  })

  it.each(['__proto__.polluted', 'safe.prototype.value', 'constructor.name'])(
    'rejects prototype-pollution path %s',
    (path) => {
      expect(parseDataPath(path)).toMatchObject({ ok: false })
    },
  )

  it('does not traverse inherited properties or unresolved array-item paths', () => {
    const inherited = Object.create({ secret: 'nope' }) as Record<string, unknown>
    expect(readDataPath(inherited, ['secret']).status).toBe('missing')
    expect(
      readDataPath({ items: [{ sku: 'A' }] }, ['items', ARRAY_ITEM_PATH_SEGMENT, 'sku']),
    ).toMatchObject({
      status: 'invalid',
      diagnostics: [{ code: 'array-item-context-required' }],
    })
  })

  it.each(['', '.name', 'name.', 'items[-1]', 'items[foo]', 'a..b'])(
    'diagnoses malformed path %s',
    (path) => expect(parseDataPath(path).diagnostics[0]?.code).toBe('invalid-path'),
  )
})
