import type { ComponentSchema } from '@ptd/core'
import {
  createComponentSchema,
  isDrawingComponentType,
  type ComponentPoint,
  type DrawnComponentType,
  type DrawingComponentType,
  type PageBounds,
} from './componentCatalog'

export const DRAWING_THRESHOLD_CSS_PX = 4

export interface ShapeDrawGeometry {
  left: number
  top: number
  width: number
  height: number
  rotate: number
}

export function isDrawingGestureLongEnough(
  start: ComponentPoint,
  end: ComponentPoint,
  threshold = DRAWING_THRESHOLD_CSS_PX,
): boolean {
  return Math.hypot(end.x - start.x, end.y - start.y) >= threshold
}

export function shapeDrawGeometry(
  type: DrawingComponentType,
  start: ComponentPoint,
  end: ComponentPoint,
  bounds: PageBounds,
  constrain = false,
): ShapeDrawGeometry | null {
  const from = clampPoint(start, bounds)
  let to = clampPoint(end, bounds)

  if (type !== 'RoyLine' && constrain) {
    const size = Math.min(Math.abs(to.x - from.x), Math.abs(to.y - from.y))
    to = {
      x: from.x + signedSize(to.x - from.x, size),
      y: from.y + signedSize(to.y - from.y, size),
    }
  }

  const dx = to.x - from.x
  const dy = to.y - from.y
  if (type === 'RoyLine') {
    const length = Math.hypot(dx, dy)
    if (length === 0) return null
    const height = 2
    const midpoint = { x: from.x + dx / 2, y: from.y + dy / 2 }
    return {
      left: midpoint.x - length / 2,
      top: midpoint.y - height / 2,
      width: length,
      height,
      rotate: (Math.atan2(dy, dx) * 180) / Math.PI,
    }
  }

  const width = Math.abs(dx)
  const height = Math.abs(dy)
  if (width === 0 || height === 0) return null
  return {
    left: Math.min(from.x, to.x),
    top: Math.min(from.y, to.y),
    width,
    height,
    rotate: 0,
  }
}

export function textFrameDrawGeometry(
  start: ComponentPoint,
  end: ComponentPoint,
  bounds: PageBounds,
): ShapeDrawGeometry | null {
  const from = clampPoint(start, bounds)
  const to = clampPoint(end, bounds)
  const width = Math.abs(to.x - from.x)
  const height = Math.abs(to.y - from.y)
  if (width === 0 || height === 0) return null
  return {
    left: Math.min(from.x, to.x),
    top: Math.min(from.y, to.y),
    width,
    height,
    rotate: 0,
  }
}

export function drawnComponentGeometry(
  type: DrawnComponentType,
  start: ComponentPoint,
  end: ComponentPoint,
  bounds: PageBounds,
  constrain = false,
): ShapeDrawGeometry | null {
  if (type === 'RoyQRCode') {
    return shapeDrawGeometry('RoyRect', start, end, bounds, true)
  }
  return isDrawingComponentType(type)
    ? shapeDrawGeometry(type, start, end, bounds, constrain)
    : textFrameDrawGeometry(start, end, bounds)
}

export function createDrawnComponentSchema(
  type: DrawnComponentType,
  start: ComponentPoint,
  end: ComponentPoint,
  bounds: PageBounds,
  constrain = false,
): ComponentSchema | null {
  const geometry = drawnComponentGeometry(type, start, end, bounds, constrain)
  if (!geometry) return null
  const schema = createComponentSchema(
    type,
    { x: geometry.left + geometry.width / 2, y: geometry.top + geometry.height / 2 },
    bounds,
  )
  return {
    ...schema,
    style: { ...schema.style, ...geometry },
    position: { x: geometry.left, y: geometry.top },
  }
}

function clampPoint(point: ComponentPoint, bounds: PageBounds): ComponentPoint {
  return {
    x: clamp(point.x, 0, Math.max(0, bounds.width)),
    y: clamp(point.y, 0, Math.max(0, bounds.height)),
  }
}

function signedSize(delta: number, size: number): number {
  return delta < 0 ? -size : size
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}
