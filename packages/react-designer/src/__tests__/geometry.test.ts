import { describe, expect, it } from 'vitest'
import { calculateComponentPositionAndSize } from '../utils/calculateComponentPositionAndSize'
import { getComponentRotatedStyle } from '../utils'

describe('editor geometry', () => {
  it('calculates the bounding box after rotation', () => {
    const box = getComponentRotatedStyle({
      left: 0,
      top: 0,
      width: 20,
      height: 10,
      rotate: 90,
      opacity: 1,
    })
    expect(box.left).toBeCloseTo(5)
    expect(box.top).toBeCloseTo(-5)
    expect(box.width).toBeCloseTo(10)
    expect(box.height).toBeCloseTo(20)
  })

  it('resizes from the right handle without moving the opposite edge', () => {
    const style = { left: 10, top: 10, width: 20, height: 10, rotate: 0 }
    calculateComponentPositionAndSize('r', style, { x: 40, y: 15 }, 2, false, {
      center: { x: 20, y: 15 },
      curPoint: { x: 30, y: 15 },
      symmetricPoint: { x: 10, y: 15 },
    })
    expect(style.left).toBe(10)
    expect(style.width).toBe(30)
  })
})
