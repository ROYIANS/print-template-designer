import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { TemplateSchema } from '@ptd/core'
import {
  resolveDesignerHostCommand,
  type DesignerHost,
  type DesignerHostCommandId,
  type ResolvedDesignerHostCommand,
} from './types'

export interface DesignerHostCommandController {
  configured: boolean
  document: DesignerHost['document']
  getState: (command: DesignerHostCommandId) => ResolvedDesignerHostCommand
  execute: (command: DesignerHostCommandId) => Promise<boolean>
}

export function useDesignerHostCommands(
  host: DesignerHost | undefined,
  getTemplate: () => TemplateSchema,
): DesignerHostCommandController {
  const pendingRef = useRef(new Set<DesignerHostCommandId>())
  const mountedRef = useRef(true)
  const [pendingCommands, setPendingCommands] = useState<readonly DesignerHostCommandId[]>([])

  useEffect(
    () => () => {
      mountedRef.current = false
    },
    [],
  )

  const publishPending = useCallback(() => {
    if (mountedRef.current) setPendingCommands([...pendingRef.current])
  }, [])

  const getState = useCallback(
    (command: DesignerHostCommandId) =>
      resolveDesignerHostCommand(host, command, pendingCommands.includes(command)),
    [host, pendingCommands],
  )

  const execute = useCallback(
    async (command: DesignerHostCommandId): Promise<boolean> => {
      const state = resolveDesignerHostCommand(host, command, pendingRef.current.has(command))
      if (!state.enabled || state.pending || !host?.onCommand) return false

      pendingRef.current.add(command)
      publishPending()
      try {
        await host.onCommand(command, {
          template: getTemplate(),
          document: host.document,
        })
      } catch (error) {
        host.onCommandError?.(command, error)
      } finally {
        pendingRef.current.delete(command)
        publishPending()
      }
      return true
    },
    [getTemplate, host, publishPending],
  )

  return useMemo(
    () => ({ configured: Boolean(host), document: host?.document, getState, execute }),
    [execute, getState, host],
  )
}
