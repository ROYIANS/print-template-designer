import { describe, it, expect } from 'vitest'
import {
  convertMeasurement,
  formatMeasurement,
  fromDisplayMeasurement,
  getMeasurementStep,
  getPageDimensions,
  mmToPx,
  parseMeasurement,
  pxToMm,
  snapMeasurement,
  toDisplayMeasurement,
} from '../utils/units'
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

  it('converts display units without changing the canonical canvas coordinate', () => {
    expect(toDisplayMeasurement(52.5, 'mm')).toBe(10.5)
    expect(toDisplayMeasurement(52.5, 'px')).toBe(52.5)
    expect(fromDisplayMeasurement(10.5, 'mm')).toBe(52.5)
    expect(fromDisplayMeasurement(52.5, 'px')).toBe(52.5)
    expect(convertMeasurement(10.5, 'mm', 'px')).toBe(52.5)
    expect(convertMeasurement(52.5, 'px', 'mm')).toBe(10.5)
  })

  it('formats measurements with stable unit precision without rounding storage', () => {
    expect(formatMeasurement(52.5, 'mm')).toBe('10.5')
    expect(formatMeasurement(52.56, 'px')).toBe('52.6')
    expect(formatMeasurement(50, 'mm', { trailingZeros: true })).toBe('10.00')
    expect(formatMeasurement(Number.NaN, 'mm')).toBe('')
  })

  it('parses valid local drafts and rejects incomplete or non-finite values', () => {
    expect(parseMeasurement(' 10.5 ', 'mm')).toBe(52.5)
    expect(parseMeasurement('.5', 'px')).toBe(0.5)
    expect(parseMeasurement('', 'mm')).toBeNull()
    expect(parseMeasurement('-', 'mm')).toBeNull()
    expect(parseMeasurement('12mm', 'mm')).toBeNull()
    expect(parseMeasurement('Infinity', 'px')).toBeNull()
  })

  it('provides unit-aware normal, fine and coarse steps', () => {
    expect(getMeasurementStep('mm')).toBe(0.1)
    expect(getMeasurementStep('mm', 'fine')).toBe(0.01)
    expect(getMeasurementStep('px', 'coarse')).toBe(10)
    expect(snapMeasurement(52.74, 'mm')).toBe(52.5)
    expect(snapMeasurement(52.74, 'px')).toBe(53)
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
