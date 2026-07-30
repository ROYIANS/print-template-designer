import type { ComponentSchema } from '@ptd/core'

type EditableTextValue = string | number

const TEXT_COMPONENTS = new Set<ComponentSchema['component']>(['RoySimpleText', 'RoyText'])

export function isEditableTextPropValue(
  component: ComponentSchema,
): component is ComponentSchema & { propValue: EditableTextValue } {
  return (
    TEXT_COMPONENTS.has(component.component) &&
    (typeof component.propValue === 'string' ||
      (typeof component.propValue === 'number' && Number.isFinite(component.propValue)))
  )
}

export function parseTextPropValue(
  currentValue: EditableTextValue,
  draft: string,
): EditableTextValue | null {
  if (typeof currentValue === 'string') return draft
  if (draft.trim() === '') return null
  const parsed = Number(draft)
  return Number.isFinite(parsed) ? parsed : null
}

export function parseFiniteNumber(
  draft: string,
  limits: { min?: number; max?: number } = {},
): number | null {
  if (draft.trim() === '') return null
  const parsed = Number(draft)
  if (!Number.isFinite(parsed)) return null
  if (limits.min !== undefined && parsed < limits.min) return null
  if (limits.max !== undefined && parsed > limits.max) return null
  return parsed
}

export function scrubNumberValue(
  start: number,
  deltaX: number,
  options: {
    step?: number
    min?: number
    max?: number
    shiftKey?: boolean
    altKey?: boolean
    pixelsPerStep?: number
  } = {},
): number {
  const baseStep = options.step ?? 1
  const multiplier = (options.shiftKey ? 10 : 1) * (options.altKey ? 0.1 : 1)
  const ticks = Math.trunc(deltaX / (options.pixelsPerStep ?? 2))
  const next = Math.round((start + ticks * baseStep * multiplier) * 10_000) / 10_000
  return Math.min(
    options.max ?? Number.POSITIVE_INFINITY,
    Math.max(options.min ?? Number.NEGATIVE_INFINITY, next),
  )
}

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
}

export function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  if (/^#[0-9a-f]{6}$/.test(normalized)) return normalized
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(normalized)
  return short ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}` : null
}
