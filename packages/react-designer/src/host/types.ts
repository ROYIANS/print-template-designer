import type { TemplateSchema } from '@ptd/core'

export const DESIGNER_HOST_COMMAND_IDS = [
  'new',
  'open',
  'save',
  'saveAs',
  'templateBrowser',
  'versionHistory',
  'restoreVersion',
  'importTemplate',
  'exportTemplate',
  'preview',
  'print',
  'exportDocument',
  'keyboardShortcuts',
  'documentation',
  'about',
] as const

export type DesignerHostCommandId = (typeof DESIGNER_HOST_COMMAND_IDS)[number]

export type DesignerDocumentStatus = 'clean' | 'dirty' | 'saving' | 'loading' | 'error' | 'conflict'

export interface DesignerDocumentState {
  id?: string
  title?: string
  version?: string | number
  status: DesignerDocumentStatus
  message?: string
}

export interface DesignerHostCommandState {
  enabled?: boolean
  pending?: boolean
  reason?: string
}

export type DesignerHostCommandStates = Partial<
  Record<DesignerHostCommandId, DesignerHostCommandState>
>

export interface DesignerHostCommandContext {
  template: TemplateSchema
  document?: DesignerDocumentState
}

export type DesignerHostCommandHandler = (
  command: DesignerHostCommandId,
  context: DesignerHostCommandContext,
) => void | Promise<void>

export interface DesignerHost {
  document?: DesignerDocumentState
  commands?: DesignerHostCommandStates
  onCommand?: DesignerHostCommandHandler
  onCommandError?: (command: DesignerHostCommandId, error: unknown) => void
}

export interface ResolvedDesignerHostCommand {
  enabled: boolean
  pending: boolean
  reason?: string
}

export function resolveDesignerHostCommand(
  host: DesignerHost | undefined,
  command: DesignerHostCommandId,
  locallyPending = false,
): ResolvedDesignerHostCommand {
  const declared = Boolean(
    host?.commands && Object.prototype.hasOwnProperty.call(host.commands, command),
  )
  const state = host?.commands?.[command]
  const pending = locallyPending || Boolean(state?.pending)

  if (!declared) return { enabled: false, pending, reason: '功能待接入' }
  if (!host?.onCommand) return { enabled: false, pending, reason: '宿主未提供命令处理器' }
  if (state?.enabled === false) {
    return { enabled: false, pending, reason: state.reason ?? '当前不可用' }
  }
  if (pending) return { enabled: true, pending: true, reason: state?.reason ?? '正在执行' }
  return { enabled: true, pending: false, reason: state?.reason }
}
