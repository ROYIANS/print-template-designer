import type { DrawnComponentType } from '../../catalog'
import type { EditorTool } from '../../state'

export interface ToolGuidance {
  tool: Exclude<EditorTool, 'select'>
  kind: 'DRAW' | 'TEXT' | 'HAND'
  name: string
  instruction: string
  shiftHint: string | null
  secondaryHint: { key: string; label: string } | null
  escapeHint: string
}

const DRAWING_TOOL_GUIDANCE = {
  RoySimpleText: {
    tool: 'RoySimpleText',
    kind: 'TEXT',
    name: '文本框工具',
    instruction: '拖动画布创建文本框',
    shiftHint: null,
    secondaryHint: null,
    escapeHint: '取消',
  },
  RoyLine: {
    tool: 'RoyLine',
    kind: 'DRAW',
    name: '直线工具',
    instruction: '拖动画布创建',
    shiftHint: null,
    secondaryHint: null,
    escapeHint: '取消',
  },
  RoyRect: {
    tool: 'RoyRect',
    kind: 'DRAW',
    name: '矩形工具',
    instruction: '拖动画布创建',
    shiftHint: '等比',
    secondaryHint: null,
    escapeHint: '取消',
  },
  RoyCircle: {
    tool: 'RoyCircle',
    kind: 'DRAW',
    name: '椭圆工具',
    instruction: '拖动画布创建',
    shiftHint: '等比',
    secondaryHint: null,
    escapeHint: '取消',
  },
  RoyStar: {
    tool: 'RoyStar',
    kind: 'DRAW',
    name: '星形工具',
    instruction: '拖动画布创建',
    shiftHint: '等比',
    secondaryHint: null,
    escapeHint: '取消',
  },
} satisfies Record<DrawnComponentType, ToolGuidance>

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
  return DRAWING_TOOL_GUIDANCE[tool]
}
