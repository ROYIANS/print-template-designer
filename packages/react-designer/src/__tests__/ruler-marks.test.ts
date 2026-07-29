import { describe, expect, it } from 'vitest'
import { mmToPx } from '@ptd/core'
import { createRulerMarks } from '../components/Canvas/rulerMarks'

describe('ruler marks', () => {
  it('uses real millimetre positions and preserves the exact page endpoint', () => {
    const marks = createRulerMarks(297, 1)

    expect(marks[0]).toMatchObject({ value: 0, position: 0, kind: 'endpoint', label: '0' })
    expect(marks.find((mark) => mark.value === 20)).toMatchObject({
      position: mmToPx(20),
      kind: 'major',
      label: '20',
    })
    expect(marks.at(-1)).toMatchObject({
      value: 297,
      position: mmToPx(297),
      kind: 'endpoint',
      label: '297',
    })
  })

  it('scales positions with the canvas without changing millimetre labels', () => {
    const mark = createRulerMarks(210, 0.5).find((item) => item.value === 100)

    expect(mark).toMatchObject({ value: 100, position: mmToPx(100) * 0.5, label: '100' })
  })

  it('rejects invalid dimensions and scales', () => {
    expect(createRulerMarks(0, 1)).toEqual([])
    expect(createRulerMarks(210, 0)).toEqual([])
    expect(createRulerMarks(Number.NaN, 1)).toEqual([])
  })
})
