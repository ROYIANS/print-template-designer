import { describe, expect, it } from 'vitest'
import { componentToolPickerGeometry } from '../components/Sidebar/componentToolPickerGeometry'

describe('component tool picker geometry', () => {
  it('centers the picker above the floating dock trigger', () => {
    expect(
      componentToolPickerGeometry(
        { top: 700, right: 520, left: 490 },
        { top: 0, right: 1024, bottom: 768, left: 0, width: 1024, height: 768 },
        420,
      ),
    ).toEqual({ left: 373, top: 272, width: 264, maxHeight: 684 })
  })

  it('clamps a tall upward picker inside the Designer', () => {
    expect(
      componentToolPickerGeometry(
        { top: 350, right: 330, left: 300 },
        { top: 0, right: 640, bottom: 400, left: 0, width: 640, height: 400 },
        600,
      ),
    ).toEqual({ left: 183, top: 8, width: 264, maxHeight: 334 })
  })

  it('uses and clamps to the available width for a narrow embedded Designer', () => {
    expect(
      componentToolPickerGeometry(
        { top: 450, right: 240, left: 210 },
        { top: 40, right: 300, bottom: 500, left: 100, width: 200, height: 460 },
        240,
      ),
    ).toEqual({ left: 108, top: 202, width: 184, maxHeight: 394 })
  })
})
