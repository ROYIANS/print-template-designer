import { mmToPx } from '@ptd/core'

export type RulerMarkKind = 'minor' | 'major' | 'endpoint'

export interface RulerMark {
  value: number
  position: number
  kind: RulerMarkKind
  label?: string
}

const MINOR_STEP_MM = 5
const MAJOR_STEP_MM = 10
const LABEL_STEP_MM = 20

export function createRulerMarks(totalMm: number, scale: number): RulerMark[] {
  if (!Number.isFinite(totalMm) || totalMm <= 0 || !Number.isFinite(scale) || scale <= 0) return []

  const values: number[] = []
  for (let value = 0; value < totalMm; value += MINOR_STEP_MM) values.push(value)
  if (values.at(-1) !== totalMm) values.push(totalMm)

  return values.map((value) => {
    const endpoint = value === 0 || value === totalMm
    const major = endpoint || value % MAJOR_STEP_MM === 0
    return {
      value,
      position: mmToPx(value) * scale,
      kind: endpoint ? 'endpoint' : major ? 'major' : 'minor',
      label: endpoint || value % LABEL_STEP_MM === 0 ? formatMillimetres(value) : undefined,
    }
  })
}

function formatMillimetres(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '')
}
