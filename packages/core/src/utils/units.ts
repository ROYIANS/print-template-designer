import { COMMON_SCALE, PAGE_SIZES } from '../constants/page-sizes'
import type { PageConfig } from '../types/page-config'

export type MeasurementUnit = 'mm' | 'px'
export type MeasurementStepMode = 'fine' | 'normal' | 'coarse'

export interface MeasurementUnitDefinition {
  unit: MeasurementUnit
  label: string
  accessibleLabel: string
  precision: number
  step: number
  fineStep: number
  coarseStep: number
  rulerMinorStep: number
  rulerMajorStep: number
  rulerLabelStep: number
}

export interface FormatMeasurementOptions {
  precision?: number
  trailingZeros?: boolean
}

export const MEASUREMENT_UNIT_DEFINITIONS: Readonly<
  Record<MeasurementUnit, MeasurementUnitDefinition>
> = {
  mm: {
    unit: 'mm',
    label: 'mm',
    accessibleLabel: '毫米',
    precision: 2,
    step: 0.1,
    fineStep: 0.01,
    coarseStep: 1,
    rulerMinorStep: 5,
    rulerMajorStep: 10,
    rulerLabelStep: 20,
  },
  px: {
    unit: 'px',
    label: 'px',
    accessibleLabel: 'PTD 画布像素',
    precision: 1,
    step: 1,
    fineStep: 0.1,
    coarseStep: 10,
    rulerMinorStep: 25,
    rulerMajorStep: 50,
    rulerLabelStep: 100,
  },
}

export function mmToPx(mm: number): number {
  return mm * COMMON_SCALE
}

export function pxToMm(px: number): number {
  return px / COMMON_SCALE
}

export function toDisplayMeasurement(canvasPx: number, unit: MeasurementUnit): number {
  return unit === 'mm' ? pxToMm(canvasPx) : canvasPx
}

export function fromDisplayMeasurement(value: number, unit: MeasurementUnit): number {
  return unit === 'mm' ? mmToPx(value) : value
}

export function convertMeasurement(
  value: number,
  from: MeasurementUnit,
  to: MeasurementUnit,
): number {
  if (from === to) return value
  return toDisplayMeasurement(fromDisplayMeasurement(value, from), to)
}

export function getMeasurementStep(
  unit: MeasurementUnit,
  mode: MeasurementStepMode = 'normal',
): number {
  const definition = MEASUREMENT_UNIT_DEFINITIONS[unit]
  if (mode === 'fine') return definition.fineStep
  if (mode === 'coarse') return definition.coarseStep
  return definition.step
}

export function formatMeasurement(
  canvasPx: number,
  unit: MeasurementUnit,
  options: FormatMeasurementOptions = {},
): string {
  if (!Number.isFinite(canvasPx)) return ''
  const definition = MEASUREMENT_UNIT_DEFINITIONS[unit]
  const precision = options.precision ?? definition.precision
  const rounded = roundToPrecision(toDisplayMeasurement(canvasPx, unit), precision)
  const normalized = Object.is(rounded, -0) ? 0 : rounded
  const formatted = normalized.toFixed(precision)
  return options.trailingZeros ? formatted : formatted.replace(/\.0+$|(\.\d*?)0+$/, '$1')
}

export function parseMeasurement(draft: string, unit: MeasurementUnit): number | null {
  const normalized = draft.trim()
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null
  const value = Number(normalized)
  if (!Number.isFinite(value)) return null
  return fromDisplayMeasurement(value, unit)
}

export function snapMeasurement(
  canvasPx: number,
  unit: MeasurementUnit,
  mode: MeasurementStepMode = 'normal',
): number {
  if (!Number.isFinite(canvasPx)) return canvasPx
  const step = getMeasurementStep(unit, mode)
  const displayValue = toDisplayMeasurement(canvasPx, unit)
  return fromDisplayMeasurement(Math.round(displayValue / step) * step, unit)
}

function roundToPrecision(value: number, precision: number): number {
  const factor = 10 ** precision
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export interface PageDimensions {
  width: number
  height: number
}

export function getPageDimensions(config: PageConfig): PageDimensions {
  const { pageDirection, pageWidth, pageHeight } = config
  const isLandscape = pageDirection === 'l'
  return {
    width: mmToPx(isLandscape ? pageHeight : pageWidth),
    height: mmToPx(isLandscape ? pageWidth : pageHeight),
  }
}

export function getPageSizeDimensions(sizeName: string): PageDimensions | null {
  const size = PAGE_SIZES[sizeName]
  if (!size) return null
  return { width: mmToPx(size.w), height: mmToPx(size.h) }
}
