import { describe, expect, it } from 'vitest'
import { isProductCaptureSearch, workspaceViewFromSearch } from '../navigation'

describe('protected workspace routing', () => {
  it('separates Home, new document and saved document URLs', () => {
    expect(workspaceViewFromSearch('')).toEqual({ kind: 'home' })
    expect(workspaceViewFromSearch('?new=blank')).toEqual({ kind: 'new' })
    expect(workspaceViewFromSearch('?template=42')).toEqual({ kind: 'template', templateId: 42 })
    expect(workspaceViewFromSearch('?new=blank&template=42')).toEqual({
      kind: 'template',
      templateId: 42,
    })
    expect(workspaceViewFromSearch('?template=delivery-note')).toEqual({
      kind: 'invalid-template',
    })
  })

  it('keeps product capture strictly DEV-only and independent from document routing', () => {
    const search = '?capture=product&template=delivery-note'
    expect(isProductCaptureSearch(search, true)).toBe(true)
    expect(isProductCaptureSearch(search, false)).toBe(false)
  })
})
