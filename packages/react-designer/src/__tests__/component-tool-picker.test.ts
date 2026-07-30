import { describe, expect, it } from 'vitest'
import { componentToolPickerGeometry } from '../components/Sidebar/componentToolPickerGeometry'

describe('component tool picker geometry', () => {
  it('anchors a compact picker to the dock without matching the inspector width', () => {
    expect(
      componentToolPickerGeometry(
        { top: 180, right: 42 },
        { top: 0, right: 1024, bottom: 768, left: 0, width: 1024, height: 768 },
        420,
      ),
    ).toEqual({ left: 50, top: 180, width: 264, maxHeight: 752 })
  })

  it('clamps a tall picker inside the Designer instead of overflowing below it', () => {
    expect(
      componentToolPickerGeometry(
        { top: 330, right: 42 },
        { top: 0, right: 640, bottom: 400, left: 0, width: 640, height: 400 },
        600,
      ),
    ).toEqual({ left: 50, top: 8, width: 264, maxHeight: 384 })
  })

  it('uses the available side width for a narrow embedded Designer', () => {
    expect(
      componentToolPickerGeometry(
        { top: 80, right: 136 },
        { top: 40, right: 300, bottom: 500, left: 100, width: 200, height: 460 },
        240,
      ),
    ).toEqual({ left: 116, top: 80, width: 176, maxHeight: 444 })
  })
})
