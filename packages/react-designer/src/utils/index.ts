import type { ComponentStyle } from '@ptd/core'

export function generateId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (const byte of array) {
    result += chars[byte % chars.length]
  }
  return result
}

export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}

// ── Geometry / math helpers ────────────────────────────────────────────────

function angleToRadian(angle: number): number {
  return (angle * Math.PI) / 180
}

export interface Point {
  x: number
  y: number
}

/** Rotate point around center by `rotate` degrees. */
export function calculateRotatedPointCoordinate(point: Point, center: Point, rotate: number): Point {
  const rad = angleToRadian(rotate)
  return {
    x: (point.x - center.x) * Math.cos(rad) - (point.y - center.y) * Math.sin(rad) + center.x,
    y: (point.x - center.x) * Math.sin(rad) + (point.y - center.y) * Math.cos(rad) + center.y,
  }
}

/** Midpoint between two points. */
export function getCenterPoint(p1: Point, p2: Point): Point {
  return { x: p1.x + (p2.x - p1.x) / 2, y: p1.y + (p2.y - p1.y) / 2 }
}

export function mod360(deg: number): number {
  return ((deg % 360) + 360) % 360
}

// ── Style helpers ──────────────────────────────────────────────────────────

const PX_FIELDS: (keyof ComponentStyle)[] = [
  'width', 'height', 'fontSize', 'borderWidth',
]

export function getShapeStyle(style: ComponentStyle): React.CSSProperties {
  const result: React.CSSProperties = {}
  const s = style as Record<string, unknown>

  for (const key of PX_FIELDS) {
    const val = s[key]
    if (val !== undefined && val !== '') {
      ;(result as Record<string, unknown>)[key] = typeof val === 'number' ? `${val}px` : val
    }
  }

  if (style.rotate !== undefined) {
    result.transform = `rotate(${style.rotate}deg)`
  }
  if (style.opacity !== undefined) {
    result.opacity = style.opacity
  }

  return result
}

export interface RotatedStyle {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

/** Get the bounding box of a component after rotation. */
export function getComponentRotatedStyle(style: ComponentStyle): RotatedStyle {
  const { width, height, rotate = 0 } = style
  const left = (style.left as number | undefined) ?? 0
  const top = (style.top as number | undefined) ?? 0

  if (rotate !== 0) {
    const center: Point = { x: left + width / 2, y: top + height / 2 }
    const corners: Point[] = [
      { x: left, y: top },
      { x: left + width, y: top },
      { x: left + width, y: top + height },
      { x: left, y: top + height },
    ]
    const rotated = corners.map((p) => calculateRotatedPointCoordinate(p, center, rotate))
    const xs = rotated.map((p) => p.x)
    const ys = rotated.map((p) => p.y)
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    const maxX = Math.max(...xs)
    const maxY = Math.max(...ys)
    return {
      left: minX,
      top: minY,
      right: maxX,
      bottom: maxY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }

  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
  }
}
