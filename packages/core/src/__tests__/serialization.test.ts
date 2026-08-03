import { describe, it, expect } from 'vitest'
import {
  CURRENT_TEMPLATE_VERSION,
  TEMPLATE_SCHEMA_JSON_LIMIT_BYTES,
  serialize,
  deserialize,
} from '../serialization'
import type { TemplateSchema } from '../types/template-schema'
import { DEFAULT_PAGE_CONFIG } from '../types/page-config'

const sampleTemplate: TemplateSchema = {
  _version: 1,
  pageConfig: { ...DEFAULT_PAGE_CONFIG },
  pages: [{ id: 'page-1', componentData: [] }],
  dataSource: [],
  dataSet: {},
}

describe('serialization', () => {
  it('publishes the shared 4 MiB template JSON persistence boundary', () => {
    expect(TEMPLATE_SCHEMA_JSON_LIMIT_BYTES).toBe(4 * 1024 * 1024)
  })

  it('serialize produces valid JSON', () => {
    const json = serialize(sampleTemplate)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('serialize includes the current canonical version', () => {
    const json = serialize(sampleTemplate)
    const parsed = JSON.parse(json) as Record<string, unknown>
    expect(parsed['_version']).toBe(CURRENT_TEMPLATE_VERSION)
    expect(parsed['data']).toEqual({ version: 1, fields: [] })
    expect(parsed).not.toHaveProperty('dataSource')
    expect(parsed).not.toHaveProperty('dataSet')
  })

  it('round-trip is lossless', () => {
    const json = serialize(sampleTemplate)
    const restored = deserialize(json)
    expect(restored.pageConfig.pageSize).toBe('A4')
    expect(restored.pages).toHaveLength(1)
    expect(restored.pages[0]?.id).toBe('page-1')
  })

  it('round-trips an optional default page master', () => {
    const withOutput: TemplateSchema = {
      ...sampleTemplate,
      output: {
        defaultPageMasterId: 'default',
        pageMasters: [
          {
            id: 'default',
            name: '默认版式',
            header: { heightMm: 12, componentData: [] },
            footer: { heightMm: 8, componentData: [] },
          },
        ],
      },
    }

    expect(deserialize(serialize(withOutput)).output).toEqual(withOutput.output)
  })

  it('deserialize handles missing _version as 0', () => {
    const raw = JSON.stringify({ ...sampleTemplate, _version: undefined })
    expect(() => deserialize(raw)).not.toThrow()
  })

  it('preserves legacy data on read and only migrates it at an explicit save boundary', () => {
    const legacy = {
      ...sampleTemplate,
      dataSource: [{ id: 'amount', title: '金额', field: 'amount', typeName: 'Money' as const }],
      dataSet: { amount: '1234.5' },
    }
    const read = deserialize(JSON.stringify(legacy))
    expect(read.data).toBeUndefined()
    expect(read.dataSource).toEqual(legacy.dataSource)

    const saved = JSON.parse(serialize(read)) as Record<string, unknown>
    expect(saved).not.toHaveProperty('dataSource')
    expect(saved).not.toHaveProperty('dataSet')
    expect(saved['data']).toMatchObject({
      version: 1,
      fields: [
        {
          id: 'amount',
          valueType: 'number',
          formatter: { kind: 'number', coerceNumericString: true },
        },
      ],
      sampleRecords: [{ amount: '1234.5' }],
    })
    expect(read.data).toBeUndefined()
    expect(read.dataSet).toEqual({ amount: '1234.5' })
  })

  it('rejects malformed and future templates instead of casting them', () => {
    expect(() => deserialize('[]')).toThrow('根节点')
    expect(() => deserialize(JSON.stringify({ ...sampleTemplate, _version: 999 }))).toThrow(
      '不支持的模板版本',
    )
    expect(() => deserialize(JSON.stringify({ ...sampleTemplate, pages: [] }))).toThrow(
      'TemplateSchema',
    )
  })

  it('deserialize fills legacy left and right page margins', () => {
    const legacy = JSON.parse(JSON.stringify(sampleTemplate)) as Record<string, unknown>
    const pageConfig = legacy['pageConfig'] as Record<string, unknown>
    delete pageConfig['pageMarginLeft']
    delete pageConfig['pageMarginRight']

    const result = deserialize(JSON.stringify(legacy))

    expect(result.pageConfig.pageMarginLeft).toBe(DEFAULT_PAGE_CONFIG.pageMarginLeft)
    expect(result.pageConfig.pageMarginRight).toBe(DEFAULT_PAGE_CONFIG.pageMarginRight)
  })
})
