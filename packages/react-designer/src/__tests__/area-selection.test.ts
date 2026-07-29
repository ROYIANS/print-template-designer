import { describe, expect, it } from 'vitest'
import {
  areaAutoScrollDelta,
  canvasPointFromClient,
  selectionAreaBetween,
} from '../utils/areaSelection'

describe('area selection geometry', () => {
  it('maps the live paper rectangle to unscaled canvas coordinates and clamps to the page', () => {
    expect(
      canvasPointFromClient({ left: 100, top: 50 }, 300, 250, 2, { width: 400, height: 300 }),
    ).toEqual({
      x: 100,
      y: 100,
    })
    expect(
      canvasPointFromClient({ left: 100, top: 50 }, 999, -20, 2, { width: 400, height: 300 }),
    ).toEqual({
      x: 400,
      y: 0,
    })
  })

  it('builds the same positive rectangle in every drag direction', () => {
    expect(selectionAreaBetween({ x: 80, y: 70 }, { x: 20, y: 10 })).toEqual({
      left: 20,
      top: 10,
      width: 60,
      height: 60,
    })
  })

  it('accelerates viewport scrolling near and beyond each edge', () => {
    const viewport = { left: 100, top: 50, right: 500, bottom: 350 }

    expect(areaAutoScrollDelta({ x: 300, y: 200 }, viewport)).toEqual({ x: 0, y: 0 })
    expect(areaAutoScrollDelta({ x: 101, y: 349 }, viewport)).toEqual({ x: -19, y: 19 })
    expect(areaAutoScrollDelta({ x: 40, y: 420 }, viewport)).toEqual({ x: -20, y: 20 })
  })
})
