import { describe, expect, it } from 'vitest'
import { inferDataDefinition } from '../data-binding/inference'
import { parseRuntimeRecordsJson, validateRuntimeRecords } from '../data-binding/validation'
import { DATA_SOURCE_LIMITS, type DataRecord } from '../types/data-source'

describe('runtime JSON validation and field inference', () => {
  it('accepts one object or an object array and returns isolated JSON records', () => {
    const input = { shipment: { code: 'CC-2026-001' }, temperature: -18 }
    const single = validateRuntimeRecords(input)
    expect(single).toMatchObject({ ok: true, summary: { root: 'object', recordCount: 1 } })
    expect(single.records).not.toBe(input)
    expect(single.records[0]).toEqual(input)

    const multiple = validateRuntimeRecords([input, { shipment: { code: 'CC-2026-002' } }])
    expect(multiple).toMatchObject({ ok: true, summary: { root: 'array', recordCount: 2 } })
  })

  it('accepts an empty array with an actionable warning', () => {
    expect(validateRuntimeRecords([])).toMatchObject({
      ok: true,
      records: [],
      diagnostics: [{ code: 'empty-records', severity: 'warning' }],
    })
  })

  it('reports nested mixed arrays by path without pretending their item type is reliable', () => {
    expect(validateRuntimeRecords({ items: [{ sku: 'A' }, 'unexpected', null] })).toMatchObject({
      ok: true,
      diagnostics: [{ code: 'mixed-array-items', path: ['items'] }],
    })
  })

  it.each([null, 1, 'record', true, [null], [{ code: 'A' }, 2]])(
    'rejects invalid root input %#',
    (input) => {
      const result = validateRuntimeRecords(input)
      expect(result.ok).toBe(false)
      expect(result.records).toEqual([])
    },
  )

  it('rejects unsupported values, cycles, dangerous keys and non-plain prototypes', () => {
    const circular: Record<string, unknown> = {}
    circular['self'] = circular
    const dangerous = JSON.parse('{"__proto__":"polluted"}') as unknown
    class CustomRecord {
      code = 'A'
    }
    for (const input of [
      { value: undefined },
      { value: () => 'unsafe' },
      { value: BigInt(1) },
      circular,
      dangerous,
      new CustomRecord(),
    ]) {
      expect(validateRuntimeRecords(input).ok).toBe(false)
    }
  })

  it('uses the shared limits for bytes, records, depth, fields, strings and diagnostics', () => {
    expect(DATA_SOURCE_LIMITS.maxBytes).toBeGreaterThan(0)
    const limits = {
      maxBytes: 80,
      maxRecords: 1,
      maxDepth: 1,
      maxFields: 1,
      maxStringLength: 3,
      maxDiagnostics: 3,
    }
    const result = validateRuntimeRecords(
      [{ first: 'long', nested: { deep: true } }, { second: 'also long' }],
      limits,
    )
    expect(result.ok).toBe(false)
    expect(result.diagnostics.length).toBeLessThanOrEqual(limits.maxDiagnostics)
    expect(result.diagnostics.some(({ code }) => code === 'max-records')).toBe(true)
  })

  it('rejects oversized source text before parsing and reports JSON syntax errors', () => {
    const limits = { ...DATA_SOURCE_LIMITS, maxBytes: 4 }
    expect(parseRuntimeRecordsJson('{"a":1}', limits).diagnostics[0]?.code).toBe('max-bytes')
    expect(parseRuntimeRecordsJson('{broken').diagnostics[0]?.message).toContain('JSON 解析失败')
  })

  it('infers nested object/array fields with deterministic IDs independent of record order', () => {
    const records: DataRecord[] = [
      {
        order: { code: 'SO-001', createdAt: '2026-08-01T10:00:00Z' },
        items: [{ sku: 'ICE-01', quantity: 2 }],
      },
      {
        order: { code: 'SO-002', createdAt: 'not-always-a-date' },
        items: [{ sku: 'ICE-02', quantity: 3 }],
      },
    ]
    const forward = inferDataDefinition(records)
    const reversed = inferDataDefinition([...records].reverse())
    expect(forward).toEqual(reversed)

    const order = forward.fields.find(({ name }) => name === 'order')
    const items = forward.fields.find(({ name }) => name === 'items')
    expect(order).toMatchObject({ valueType: 'object' })
    expect(order?.children?.find(({ name }) => name === 'createdAt')).toMatchObject({
      valueType: 'string',
    })
    expect(items).toMatchObject({ valueType: 'array' })
    expect(items?.children?.find(({ name }) => name === 'sku')?.path).toEqual([
      'items',
      { kind: 'array-item' },
      'sku',
    ])
    expect(
      new Set(
        forward.fields.flatMap((field) => [
          field.id,
          ...(field.children?.map(({ id }) => id) ?? []),
        ]),
      ).size,
    ).toBeGreaterThan(4)
  })
})
