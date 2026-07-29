export interface SelectionPoint {
  x: number
  y: number
}

export interface SelectionBounds {
  width: number
  height: number
}

export interface SelectionArea {
  left: number
  top: number
  width: number
  height: number
}

export interface RectEdges {
  left: number
  top: number
  right: number
  bottom: number
}

export const AREA_SCROLL_EDGE = 36
export const AREA_SCROLL_MAX_SPEED = 20

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function canvasPointFromClient(
  editorRect: Pick<DOMRect, 'left' | 'top'>,
  clientX: number,
  clientY: number,
  scale: number,
  bounds: SelectionBounds,
): SelectionPoint {
  const safeScale = scale > 0 ? scale : 1
  return {
    x: clamp((clientX - editorRect.left) / safeScale, 0, bounds.width),
    y: clamp((clientY - editorRect.top) / safeScale, 0, bounds.height),
  }
}

export function selectionAreaBetween(
  start: SelectionPoint,
  current: SelectionPoint,
): SelectionArea {
  return {
    left: Math.min(start.x, current.x),
    top: Math.min(start.y, current.y),
    width: Math.abs(current.x - start.x),
    height: Math.abs(current.y - start.y),
  }
}

function edgeScrollDelta(
  pointer: number,
  start: number,
  end: number,
  threshold: number,
  maxSpeed: number,
): number {
  if (threshold <= 0 || maxSpeed <= 0) return 0

  const center = start + (end - start) / 2
  if (pointer <= center && pointer < start + threshold) {
    const intensity = clamp((start + threshold - pointer) / threshold, 0, 1)
    return -Math.ceil(maxSpeed * intensity * intensity)
  }
  if (pointer > center && pointer > end - threshold) {
    const intensity = clamp((pointer - (end - threshold)) / threshold, 0, 1)
    return Math.ceil(maxSpeed * intensity * intensity)
  }
  return 0
}

export function areaAutoScrollDelta(
  pointer: SelectionPoint,
  viewport: RectEdges,
  threshold = AREA_SCROLL_EDGE,
  maxSpeed = AREA_SCROLL_MAX_SPEED,
): SelectionPoint {
  return {
    x: edgeScrollDelta(pointer.x, viewport.left, viewport.right, threshold, maxSpeed),
    y: edgeScrollDelta(pointer.y, viewport.top, viewport.bottom, threshold, maxSpeed),
  }
}
