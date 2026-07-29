import { describe, expect, it } from 'vitest'
import { getToolGuidance } from '../components/Toolbar/toolGuidance'

describe('drawing tool context guidance', () => {
  it('restores the normal context for Select', () => {
    expect(getToolGuidance('select')).toBeNull()
  })

  it('provides names and relevant Shift guidance for every drawing tool', () => {
    expect(getToolGuidance('RoyLine')).toMatchObject({
      tool: 'RoyLine',
      kind: 'DRAW',
      name: '直线工具',
      shiftHint: null,
    })
    expect(getToolGuidance('RoyRect')).toMatchObject({ name: '矩形工具', shiftHint: '等比' })
    expect(getToolGuidance('RoyCircle')).toMatchObject({ name: '椭圆工具', shiftHint: '等比' })
    expect(getToolGuidance('RoyStar')).toMatchObject({ name: '星形工具', shiftHint: '等比' })
  })

  it('explains drawn Text and persistent or temporary Hand modes', () => {
    expect(getToolGuidance('RoySimpleText')).toMatchObject({
      kind: 'TEXT',
      name: '文本框工具',
      instruction: '拖动画布创建文本框',
      shiftHint: null,
    })
    expect(getToolGuidance('hand')).toMatchObject({
      kind: 'HAND',
      name: '抓手工具',
      instruction: '拖动画布平移',
      secondaryHint: { key: 'Space', label: '临时抓手' },
    })
    expect(getToolGuidance('hand', true)).toMatchObject({
      name: '临时抓手工具',
      secondaryHint: { key: 'Space', label: '松开返回' },
    })
  })
})
