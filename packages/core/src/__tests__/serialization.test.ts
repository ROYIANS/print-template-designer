import { describe, it, expect } from 'vitest'
import { serialize, deserialize } from '../serialization'
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
  it('serialize produces valid JSON', () => {
    const json = serialize(sampleTemplate)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('serialize includes _version: 1', () => {
    const json = serialize(sampleTemplate)
    const parsed = JSON.parse(json) as Record<string, unknown>
    expect(parsed['_version']).toBe(1)
  })

  it('round-trip is lossless', () => {
    const json = serialize(sampleTemplate)
    const restored = deserialize(json)
    expect(restored.pageConfig.pageSize).toBe('A4')
    expect(restored.pages).toHaveLength(1)
    expect(restored.pages[0]?.id).toBe('page-1')
  })

  it('deserialize handles missing _version as 0', () => {
    const raw = JSON.stringify({ ...sampleTemplate, _version: undefined })
    expect(() => deserialize(raw)).not.toThrow()
  })
})
