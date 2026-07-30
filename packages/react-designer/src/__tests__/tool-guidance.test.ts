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

  it.each([
    ['RoyText', 'TEXT', '富文本工具'],
    ['RoyImage', 'FRAME', '图片工具'],
    ['RoySimpleTable', 'FRAME', '自由表格工具'],
    ['RoyQRCode', 'FRAME', '二维码工具'],
  ] as const)('describes the %s creation tool', (tool, kind, name) => {
    expect(getToolGuidance(tool)).toMatchObject({ kind, name, shiftHint: null })
  })
})
