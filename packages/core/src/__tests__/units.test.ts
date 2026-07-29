import { describe, it, expect } from 'vitest'
import { mmToPx, pxToMm, getPageDimensions } from '../utils/units'
import { DEFAULT_PAGE_CONFIG } from '../types/page-config'

describe('unit utils', () => {
  it('mmToPx: 1mm = 5px', () => {
    expect(mmToPx(1)).toBe(5)
  })

  it('mmToPx: A4 width 210mm = 1050px', () => {
    expect(mmToPx(210)).toBe(1050)
  })

  it('pxToMm: 5px = 1mm', () => {
    expect(pxToMm(5)).toBe(1)
  })

  it('mmToPx and pxToMm are inverse', () => {
    expect(pxToMm(mmToPx(210))).toBe(210)
  })

  it('getPageDimensions portrait A4', () => {
    const dims = getPageDimensions({ ...DEFAULT_PAGE_CONFIG, pageDirection: 'p' })
    expect(dims.width).toBe(1050)
    expect(dims.height).toBe(1485)
  })

  it('getPageDimensions landscape A4 swaps width/height', () => {
    const dims = getPageDimensions({ ...DEFAULT_PAGE_CONFIG, pageDirection: 'l' })
    expect(dims.width).toBe(1485)
    expect(dims.height).toBe(1050)
  })
})
