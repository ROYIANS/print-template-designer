import {
  MEASUREMENT_UNIT_DEFINITIONS,
  formatMeasurement,
  fromDisplayMeasurement,
  mmToPx,
  toDisplayMeasurement,
  type MeasurementUnit,
} from '@ptd/core'

export type RulerMarkKind = 'minor' | 'major' | 'endpoint'

export interface RulerMark {
  value: number
  position: number
  kind: RulerMarkKind
  label?: string
}

export function createRulerMarks(
  totalMm: number,
  scale: number,
  unit: MeasurementUnit = 'mm',
): RulerMark[] {
  if (!Number.isFinite(totalMm) || totalMm <= 0 || !Number.isFinite(scale) || scale <= 0) return []

  const definition = MEASUREMENT_UNIT_DEFINITIONS[unit]
  const total = toDisplayMeasurement(mmToPx(totalMm), unit)
  const values: number[] = []
  for (let value = 0; value < total; value += definition.rulerMinorStep) values.push(value)
  if (values.at(-1) !== total) values.push(total)

  return values.map((value) => {
    const endpoint = value === 0 || value === total
    const major = endpoint || value % definition.rulerMajorStep === 0
    const canvasPosition = fromDisplayMeasurement(value, unit)
    return {
      value,
      position: canvasPosition * scale,
      kind: endpoint ? 'endpoint' : major ? 'major' : 'minor',
      label:
        endpoint || value % definition.rulerLabelStep === 0
          ? formatMeasurement(canvasPosition, unit)
          : undefined,
    }
  })
}
