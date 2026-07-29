import { calculateRotatedPointCoordinate, getCenterPoint, type Point } from './index'

const MIN_WIDTH = 30
const MIN_HEIGHT = 1

export interface ResizeStyle {
  width: number
  height: number
  left: number
  top: number
  rotate: number
}

export interface PointInfo {
  center: Point
  curPoint: Point
  symmetricPoint: Point
}

type HandleName = 'lt' | 't' | 'rt' | 'r' | 'rb' | 'b' | 'lb' | 'l'

function calculateLeftTop(
  style: ResizeStyle,
  curPosition: Point,
  proportion: number,
  needLockProportion: boolean,
  pointInfo: PointInfo,
): void {
  const { symmetricPoint } = pointInfo
  let newCenterPoint = getCenterPoint(curPosition, symmetricPoint)
  let newTopLeftPoint = calculateRotatedPointCoordinate(curPosition, newCenterPoint, -style.rotate)
  let newBottomRightPoint = calculateRotatedPointCoordinate(
    symmetricPoint,
    newCenterPoint,
    -style.rotate,
  )

  let newWidth = newBottomRightPoint.x - newTopLeftPoint.x
  let newHeight = newBottomRightPoint.y - newTopLeftPoint.y

  if (needLockProportion) {
    if (newWidth / newHeight > proportion) {
      newTopLeftPoint.x += Math.abs(newWidth - newHeight * proportion)
      newWidth = newHeight * proportion
    } else {
      newTopLeftPoint.y += Math.abs(newHeight - newWidth / proportion)
      newHeight = newWidth / proportion
    }
    const rotatedTopLeftPoint = calculateRotatedPointCoordinate(
      newTopLeftPoint,
      newCenterPoint,
      style.rotate,
    )
    newCenterPoint = getCenterPoint(rotatedTopLeftPoint, symmetricPoint)
    newTopLeftPoint = calculateRotatedPointCoordinate(
      rotatedTopLeftPoint,
      newCenterPoint,
      -style.rotate,
    )
    newBottomRightPoint = calculateRotatedPointCoordinate(
      symmetricPoint,
      newCenterPoint,
      -style.rotate,
    )
    newWidth = newBottomRightPoint.x - newTopLeftPoint.x
    newHeight = newBottomRightPoint.y - newTopLeftPoint.y
  }

  if (newWidth > 0 && newHeight > 0) {
    style.width = Math.max(Math.round(newWidth), MIN_WIDTH)
    style.height = Math.max(Math.round(newHeight), MIN_HEIGHT)
    style.left = Math.round(newTopLeftPoint.x)
    style.top = Math.round(newTopLeftPoint.y)
  }
}

function calculateRightTop(
  style: ResizeStyle,
  curPosition: Point,
  proportion: number,
  needLockProportion: boolean,
  pointInfo: PointInfo,
): void {
  const { symmetricPoint } = pointInfo
  let newCenterPoint = getCenterPoint(curPosition, symmetricPoint)
  let newTopRightPoint = calculateRotatedPointCoordinate(curPosition, newCenterPoint, -style.rotate)
  let newBottomLeftPoint = calculateRotatedPointCoordinate(
    symmetricPoint,
    newCenterPoint,
    -style.rotate,
  )

  let newWidth = newTopRightPoint.x - newBottomLeftPoint.x
  let newHeight = newBottomLeftPoint.y - newTopRightPoint.y

  if (needLockProportion) {
    if (newWidth / newHeight > proportion) {
      newTopRightPoint.x -= Math.abs(newWidth - newHeight * proportion)
      newWidth = newHeight * proportion
    } else {
      newTopRightPoint.y += Math.abs(newHeight - newWidth / proportion)
      newHeight = newWidth / proportion
    }
    const rotatedTopRightPoint = calculateRotatedPointCoordinate(
      newTopRightPoint,
      newCenterPoint,
      style.rotate,
    )
    newCenterPoint = getCenterPoint(rotatedTopRightPoint, symmetricPoint)
    newTopRightPoint = calculateRotatedPointCoordinate(
      rotatedTopRightPoint,
      newCenterPoint,
      -style.rotate,
    )
    newBottomLeftPoint = calculateRotatedPointCoordinate(
      symmetricPoint,
      newCenterPoint,
      -style.rotate,
    )
    newWidth = newTopRightPoint.x - newBottomLeftPoint.x
    newHeight = newBottomLeftPoint.y - newTopRightPoint.y
  }

  if (newWidth > 0 && newHeight > 0) {
    style.width = Math.max(Math.round(newWidth), MIN_WIDTH)
    style.height = Math.max(Math.round(newHeight), MIN_HEIGHT)
    style.left = Math.round(newBottomLeftPoint.x)
    style.top = Math.round(newTopRightPoint.y)
  }
}

function calculateRightBottom(
  style: ResizeStyle,
  curPosition: Point,
  proportion: number,
  needLockProportion: boolean,
  pointInfo: PointInfo,
): void {
  const { symmetricPoint } = pointInfo
  let newCenterPoint = getCenterPoint(curPosition, symmetricPoint)
  let newTopLeftPoint = calculateRotatedPointCoordinate(
    symmetricPoint,
    newCenterPoint,
    -style.rotate,
  )
  let newBottomRightPoint = calculateRotatedPointCoordinate(
    curPosition,
    newCenterPoint,
    -style.rotate,
  )

  let newWidth = newBottomRightPoint.x - newTopLeftPoint.x
  let newHeight = newBottomRightPoint.y - newTopLeftPoint.y

  if (needLockProportion) {
    if (newWidth / newHeight > proportion) {
      newBottomRightPoint.x -= Math.abs(newWidth - newHeight * proportion)
      newWidth = newHeight * proportion
    } else {
      newBottomRightPoint.y -= Math.abs(newHeight - newWidth / proportion)
      newHeight = newWidth / proportion
    }
    const rotatedBottomRightPoint = calculateRotatedPointCoordinate(
      newBottomRightPoint,
      newCenterPoint,
      style.rotate,
    )
    newCenterPoint = getCenterPoint(rotatedBottomRightPoint, symmetricPoint)
    newTopLeftPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -style.rotate)
    newBottomRightPoint = calculateRotatedPointCoordinate(
      rotatedBottomRightPoint,
      newCenterPoint,
      -style.rotate,
    )
    newWidth = newBottomRightPoint.x - newTopLeftPoint.x
    newHeight = newBottomRightPoint.y - newTopLeftPoint.y
  }

  if (newWidth > 0 && newHeight > 0) {
    style.width = Math.max(Math.round(newWidth), MIN_WIDTH)
    style.height = Math.max(Math.round(newHeight), MIN_HEIGHT)
    style.left = Math.round(newTopLeftPoint.x)
    style.top = Math.round(newTopLeftPoint.y)
  }
}

function calculateLeftBottom(
  style: ResizeStyle,
  curPosition: Point,
  proportion: number,
  needLockProportion: boolean,
  pointInfo: PointInfo,
): void {
  const { symmetricPoint } = pointInfo
  let newCenterPoint = getCenterPoint(curPosition, symmetricPoint)
  let newTopRightPoint = calculateRotatedPointCoordinate(
    symmetricPoint,
    newCenterPoint,
    -style.rotate,
  )
  let newBottomLeftPoint = calculateRotatedPointCoordinate(
    curPosition,
    newCenterPoint,
    -style.rotate,
  )

  let newWidth = newTopRightPoint.x - newBottomLeftPoint.x
  let newHeight = newBottomLeftPoint.y - newTopRightPoint.y

  if (needLockProportion) {
    if (newWidth / newHeight > proportion) {
      newBottomLeftPoint.x += Math.abs(newWidth - newHeight * proportion)
      newWidth = newHeight * proportion
    } else {
      newBottomLeftPoint.y -= Math.abs(newHeight - newWidth / proportion)
      newHeight = newWidth / proportion
    }
    const rotatedBottomLeftPoint = calculateRotatedPointCoordinate(
      newBottomLeftPoint,
      newCenterPoint,
      style.rotate,
    )
    newCenterPoint = getCenterPoint(rotatedBottomLeftPoint, symmetricPoint)
    newTopRightPoint = calculateRotatedPointCoordinate(
      symmetricPoint,
      newCenterPoint,
      -style.rotate,
    )
    newBottomLeftPoint = calculateRotatedPointCoordinate(
      rotatedBottomLeftPoint,
      newCenterPoint,
      -style.rotate,
    )
    newWidth = newTopRightPoint.x - newBottomLeftPoint.x
    newHeight = newBottomLeftPoint.y - newTopRightPoint.y
  }

  if (newWidth > 0 && newHeight > 0) {
    style.width = Math.max(Math.round(newWidth), MIN_WIDTH)
    style.height = Math.max(Math.round(newHeight), MIN_HEIGHT)
    style.left = Math.round(newBottomLeftPoint.x)
    style.top = Math.round(newTopRightPoint.y)
  }
}

function calculateTop(
  style: ResizeStyle,
  curPosition: Point,
  proportion: number,
  needLockProportion: boolean,
  pointInfo: PointInfo,
): void {
  const { symmetricPoint, curPoint } = pointInfo
  const rotatedCurPosition = calculateRotatedPointCoordinate(curPosition, curPoint, -style.rotate)
  const rotatedTopMiddlePoint = calculateRotatedPointCoordinate(
    { x: curPoint.x, y: rotatedCurPosition.y },
    curPoint,
    style.rotate,
  )
  const newHeight = Math.sqrt(
    (rotatedTopMiddlePoint.x - symmetricPoint.x) ** 2 +
      (rotatedTopMiddlePoint.y - symmetricPoint.y) ** 2,
  )
  const newCenter: Point = {
    x: rotatedTopMiddlePoint.x - (rotatedTopMiddlePoint.x - symmetricPoint.x) / 2,
    y: rotatedTopMiddlePoint.y + (symmetricPoint.y - rotatedTopMiddlePoint.y) / 2,
  }
  let width = style.width
  if (needLockProportion) width = newHeight * proportion
  style.width = Math.max(width, MIN_WIDTH)
  style.height = Math.max(Math.round(newHeight), MIN_HEIGHT)
  style.top = Math.round(newCenter.y - newHeight / 2)
  style.left = Math.round(newCenter.x - style.width / 2)
}

function calculateRight(
  style: ResizeStyle,
  curPosition: Point,
  proportion: number,
  needLockProportion: boolean,
  pointInfo: PointInfo,
): void {
  const { symmetricPoint, curPoint } = pointInfo
  const rotatedCurPosition = calculateRotatedPointCoordinate(curPosition, curPoint, -style.rotate)
  const rotatedRightMiddlePoint = calculateRotatedPointCoordinate(
    { x: rotatedCurPosition.x, y: curPoint.y },
    curPoint,
    style.rotate,
  )
  const newWidth = Math.sqrt(
    (rotatedRightMiddlePoint.x - symmetricPoint.x) ** 2 +
      (rotatedRightMiddlePoint.y - symmetricPoint.y) ** 2,
  )
  const newCenter: Point = {
    x: rotatedRightMiddlePoint.x - (rotatedRightMiddlePoint.x - symmetricPoint.x) / 2,
    y: rotatedRightMiddlePoint.y + (symmetricPoint.y - rotatedRightMiddlePoint.y) / 2,
  }
  let height = style.height
  if (needLockProportion) height = newWidth / proportion
  style.height = Math.max(height, MIN_HEIGHT)
  style.width = Math.max(Math.round(newWidth), MIN_WIDTH)
  style.top = Math.round(newCenter.y - style.height / 2)
  style.left = Math.round(newCenter.x - newWidth / 2)
}

function calculateBottom(
  style: ResizeStyle,
  curPosition: Point,
  proportion: number,
  needLockProportion: boolean,
  pointInfo: PointInfo,
  minHeight = 0,
): void {
  const { symmetricPoint, curPoint } = pointInfo
  const rotatedCurPosition = calculateRotatedPointCoordinate(curPosition, curPoint, -style.rotate)
  const rotatedBottomMiddlePoint = calculateRotatedPointCoordinate(
    { x: curPoint.x, y: rotatedCurPosition.y },
    curPoint,
    style.rotate,
  )
  const newHeight = Math.sqrt(
    (rotatedBottomMiddlePoint.x - symmetricPoint.x) ** 2 +
      (rotatedBottomMiddlePoint.y - symmetricPoint.y) ** 2,
  )
  const newCenter: Point = {
    x: rotatedBottomMiddlePoint.x - (rotatedBottomMiddlePoint.x - symmetricPoint.x) / 2,
    y: rotatedBottomMiddlePoint.y + (symmetricPoint.y - rotatedBottomMiddlePoint.y) / 2,
  }
  let width = style.width
  if (needLockProportion) width = newHeight * proportion
  style.width = Math.max(width, MIN_WIDTH)
  style.height = Math.max(Math.round(newHeight), MIN_HEIGHT, minHeight)
  style.top = Math.round(newCenter.y - newHeight / 2)
  style.left = Math.round(newCenter.x - style.width / 2)
}

function calculateLeft(
  style: ResizeStyle,
  curPosition: Point,
  proportion: number,
  needLockProportion: boolean,
  pointInfo: PointInfo,
): void {
  const { symmetricPoint, curPoint } = pointInfo
  const rotatedCurPosition = calculateRotatedPointCoordinate(curPosition, curPoint, -style.rotate)
  const rotatedLeftMiddlePoint = calculateRotatedPointCoordinate(
    { x: rotatedCurPosition.x, y: curPoint.y },
    curPoint,
    style.rotate,
  )
  const newWidth = Math.sqrt(
    (rotatedLeftMiddlePoint.x - symmetricPoint.x) ** 2 +
      (rotatedLeftMiddlePoint.y - symmetricPoint.y) ** 2,
  )
  const newCenter: Point = {
    x: rotatedLeftMiddlePoint.x - (rotatedLeftMiddlePoint.x - symmetricPoint.x) / 2,
    y: rotatedLeftMiddlePoint.y + (symmetricPoint.y - rotatedLeftMiddlePoint.y) / 2,
  }
  let height = style.height
  if (needLockProportion) height = newWidth / proportion
  style.height = Math.max(height, MIN_HEIGHT)
  style.width = Math.max(Math.round(newWidth), MIN_WIDTH)
  style.top = Math.round(newCenter.y - style.height / 2)
  style.left = Math.round(newCenter.x - newWidth / 2)
}

const funcs: Record<
  HandleName,
  (s: ResizeStyle, p: Point, pr: number, lp: boolean, pi: PointInfo, mh?: number) => void
> = {
  lt: calculateLeftTop,
  t: calculateTop,
  rt: calculateRightTop,
  r: calculateRight,
  rb: calculateRightBottom,
  b: calculateBottom,
  lb: calculateLeftBottom,
  l: calculateLeft,
}

export function calculateComponentPositionAndSize(
  name: HandleName,
  style: ResizeStyle,
  curPosition: Point,
  proportion: number,
  needLockProportion: boolean,
  pointInfo: PointInfo,
  minHeight = 0,
): void {
  funcs[name](style, curPosition, proportion, needLockProportion, pointInfo, minHeight)
}
