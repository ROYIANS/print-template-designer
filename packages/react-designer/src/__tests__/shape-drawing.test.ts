import { describe, expect, it } from 'vitest'
import {
  createDrawnComponentSchema,
  drawnComponentGeometry,
  isDrawingGestureLongEnough,
  shapeDrawGeometry,
  textFrameDrawGeometry,
} from '../catalog'

const PAGE = { width: 100, height: 80 }

describe('shape drawing geometry', () => {
  it('normalizes closed shapes in forward and reverse drag directions', () => {
    const forward = shapeDrawGeometry('RoyRect', { x: 10, y: 15 }, { x: 60, y: 45 }, PAGE)
    const reverse = shapeDrawGeometry('RoyRect', { x: 60, y: 45 }, { x: 10, y: 15 }, PAGE)

    expect(forward).toEqual({ left: 10, top: 15, width: 50, height: 30, rotate: 0 })
    expect(reverse).toEqual(forward)
  })

  it('constrains closed shapes with Shift while preserving drag direction and bounds', () => {
    expect(
      shapeDrawGeometry('RoyCircle', { x: 90, y: 70 }, { x: 140, y: 100 }, PAGE, true),
    ).toEqual({ left: 90, top: 70, width: 10, height: 10, rotate: 0 })
    expect(shapeDrawGeometry('RoyStar', { x: 70, y: 60 }, { x: 20, y: 10 }, PAGE, true)).toEqual({
      left: 20,
      top: 10,
      width: 50,
      height: 50,
      rotate: 0,
    })
  })

  it('maps a line to midpoint, Euclidean length and rotation', () => {
    const line = shapeDrawGeometry('RoyLine', { x: 0, y: 0 }, { x: 3, y: 4 }, PAGE)
    expect(line?.width).toBe(5)
    expect(line?.height).toBe(2)
    expect(line?.left).toBe(-1)
    expect(line?.top).toBe(1)
    expect(line?.rotate).toBeCloseTo(53.1301, 4)
  })

  it('clamps pointer coordinates and rejects zero-area geometry', () => {
    expect(shapeDrawGeometry('RoyRect', { x: -20, y: -10 }, { x: 150, y: 100 }, PAGE)).toEqual({
      left: 0,
      top: 0,
      width: 100,
      height: 80,
      rotate: 0,
    })
    expect(shapeDrawGeometry('RoyRect', { x: 10, y: 10 }, { x: 10, y: 40 }, PAGE)).toBeNull()
    expect(shapeDrawGeometry('RoyLine', { x: 10, y: 10 }, { x: 10, y: 10 }, PAGE)).toBeNull()
  })

  it('uses the four CSS-pixel gesture threshold', () => {
    expect(isDrawingGestureLongEnough({ x: 0, y: 0 }, { x: 2, y: 3 })).toBe(false)
    expect(isDrawingGestureLongEnough({ x: 0, y: 0 }, { x: 0, y: 4 })).toBe(true)
  })

  it('creates a complete compatible schema without changing the persisted category', () => {
    const schema = createDrawnComponentSchema('RoyCircle', { x: 80, y: 60 }, { x: 20, y: 10 }, PAGE)

    expect(schema).toMatchObject({
      component: 'RoyCircle',
      code: 'RoyCircle',
      name: '椭圆',
      group: 'shape',
      style: { left: 20, top: 10, width: 60, height: 50, rotate: 0 },
      position: { x: 20, y: 10 },
      groupStyle: {},
    })
  })

  it('normalizes and clamps forward or reverse Text-frame geometry', () => {
    const forward = textFrameDrawGeometry({ x: 15, y: 12 }, { x: 70, y: 52 }, PAGE)
    const reverse = textFrameDrawGeometry({ x: 70, y: 52 }, { x: 15, y: 12 }, PAGE)
    expect(reverse).toEqual(forward)
    expect(forward).toEqual({ left: 15, top: 12, width: 55, height: 40, rotate: 0 })
    expect(textFrameDrawGeometry({ x: 120, y: 90 }, { x: -20, y: -10 }, PAGE)).toEqual({
      left: 0,
      top: 0,
      width: 100,
      height: 80,
      rotate: 0,
    })
  })

  it('ignores Shift for Text frames and creates the existing compatible text schema', () => {
    expect(
      drawnComponentGeometry('RoySimpleText', { x: 10, y: 10 }, { x: 80, y: 40 }, PAGE, true),
    ).toEqual({ left: 10, top: 10, width: 70, height: 30, rotate: 0 })

    const schema = createDrawnComponentSchema(
      'RoySimpleText',
      { x: 80, y: 40 },
      { x: 10, y: 10 },
      PAGE,
      true,
    )
    expect(schema).toMatchObject({
      component: 'RoySimpleText',
      name: '文本',
      group: 'common',
      style: { left: 10, top: 10, width: 70, height: 30, rotate: 0 },
      position: { x: 10, y: 10 },
    })
  })
})
