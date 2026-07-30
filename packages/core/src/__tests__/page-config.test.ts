import { describe, expect, it } from 'vitest'
import { DEFAULT_PAGE_CONFIG, normalizePageConfig, pageConfigError } from '../types/page-config'

describe('page config compatibility and validation', () => {
  it('fills four-sided margins for legacy page configuration', () => {
    const legacy = { ...DEFAULT_PAGE_CONFIG } as Partial<typeof DEFAULT_PAGE_CONFIG>
    delete legacy.pageMarginLeft
    delete legacy.pageMarginRight

    const normalized = normalizePageConfig(legacy)

    expect(normalized.pageMarginTop).toBe(8)
    expect(normalized.pageMarginRight).toBe(8)
    expect(normalized.pageMarginBottom).toBe(8)
    expect(normalized.pageMarginLeft).toBe(8)
  })

  it('preserves valid custom dimensions and margin values', () => {
    const normalized = normalizePageConfig({
      ...DEFAULT_PAGE_CONFIG,
      pageSize: 'custom',
      pageWidth: 80,
      pageHeight: 50,
      pageMarginTop: 3,
      pageMarginRight: 4,
      pageMarginBottom: 5,
      pageMarginLeft: 6,
    })

    expect(normalized).toMatchObject({
      pageSize: 'custom',
      pageWidth: 80,
      pageHeight: 50,
      pageMarginTop: 3,
      pageMarginRight: 4,
      pageMarginBottom: 5,
      pageMarginLeft: 6,
    })
    expect(pageConfigError(normalized)).toBeNull()
  })

  it('reports invalid content areas without mutating values', () => {
    const horizontal = {
      ...DEFAULT_PAGE_CONFIG,
      pageWidth: 50,
      pageMarginLeft: 25,
      pageMarginRight: 25,
    }
    const vertical = {
      ...DEFAULT_PAGE_CONFIG,
      pageHeight: 40,
      pageMarginTop: 20,
      pageMarginBottom: 20,
    }

    expect(pageConfigError(horizontal)).toContain('左右边距之和')
    expect(pageConfigError(vertical)).toContain('上下边距之和')
    expect(horizontal.pageMarginLeft).toBe(25)
    expect(vertical.pageMarginTop).toBe(20)
  })
})
