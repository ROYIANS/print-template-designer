import type { ComponentSchema } from '@ptd/core'
import { calculateRotatedPointCoordinate } from './index'

const BASE_WIDTH = 'baseWidth'
const BASE_HEIGHT = 'baseHeight'

function finite(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function groupChildren(group: ComponentSchema): ComponentSchema[] {
  return group.component === 'RoyGroup' && Array.isArray(group.propValue)
    ? (group.propValue as ComponentSchema[])
    : []
}

export function createGroupMetrics(width: number, height: number): Record<string, unknown> {
  return { [BASE_WIDTH]: width, [BASE_HEIGHT]: height }
}

export function getScaledGroupChildren(group: ComponentSchema): ComponentSchema[] {
  const width = finite(group.style.width)
  const height = finite(group.style.height)
  const baseWidth = finite(group.groupStyle[BASE_WIDTH], width) || width || 1
  const baseHeight = finite(group.groupStyle[BASE_HEIGHT], height) || height || 1
  const scaleX = width / baseWidth
  const scaleY = height / baseHeight

  return groupChildren(group).map((child) => ({
    ...child,
    style: {
      ...child.style,
      left: finite(child.style.left) * scaleX,
      top: finite(child.style.top) * scaleY,
      width: finite(child.style.width) * scaleX,
      height: finite(child.style.height) * scaleY,
    },
  }))
}

export function getAbsoluteGroupChildren(group: ComponentSchema): ComponentSchema[] {
  const groupLeft = finite(group.style.left)
  const groupTop = finite(group.style.top)
  const groupWidth = finite(group.style.width)
  const groupHeight = finite(group.style.height)
  const groupRotate = finite(group.style.rotate)
  const groupCenter = { x: groupWidth / 2, y: groupHeight / 2 }

  return getScaledGroupChildren(group).map((child) => {
    const childWidth = finite(child.style.width)
    const childHeight = finite(child.style.height)
    const childCenter = {
      x: finite(child.style.left) + childWidth / 2,
      y: finite(child.style.top) + childHeight / 2,
    }
    const rotatedCenter = calculateRotatedPointCoordinate(childCenter, groupCenter, groupRotate)
    return {
      ...child,
      style: {
        ...child.style,
        left: groupLeft + rotatedCenter.x - childWidth / 2,
        top: groupTop + rotatedCenter.y - childHeight / 2,
        rotate: finite(child.style.rotate) + groupRotate,
      },
    }
  })
}
