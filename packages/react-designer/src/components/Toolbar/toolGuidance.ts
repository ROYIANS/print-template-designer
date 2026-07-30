import { findAvailableCatalogItem, isDrawingComponentType } from '../../catalog'
import type { EditorTool } from '../../state'

export interface ToolGuidance {
  tool: Exclude<EditorTool, 'select'>
  kind: 'DRAW' | 'TEXT' | 'FRAME' | 'HAND'
  name: string
  instruction: string
  shiftHint: string | null
  secondaryHint: { key: string; label: string } | null
  escapeHint: string
}

export function getToolGuidance(tool: EditorTool, temporaryHand = false): ToolGuidance | null {
  if (tool === 'select') return null
  if (tool === 'hand') {
    return {
      tool: 'hand',
      kind: 'HAND',
      name: temporaryHand ? '临时抓手工具' : '抓手工具',
      instruction: '拖动画布平移',
      shiftHint: null,
      secondaryHint: temporaryHand
        ? { key: 'Space', label: '松开返回' }
        : { key: 'Space', label: '临时抓手' },
      escapeHint: '选择',
    }
  }

  const item = findAvailableCatalogItem(tool)
  if (!item) return null
  const isText = tool === 'RoySimpleText' || tool === 'RoyText'
  const isShape = isDrawingComponentType(tool)
  const name = tool === 'RoySimpleText' ? '文本框工具' : `${item.name}工具`

  return {
    tool,
    kind: isText ? 'TEXT' : isShape ? 'DRAW' : 'FRAME',
    name,
    instruction: `拖动画布创建${isText ? '文本框' : item.name}`,
    shiftHint: isShape && tool !== 'RoyLine' ? '等比' : null,
    secondaryHint: null,
    escapeHint: '取消',
  }
}
