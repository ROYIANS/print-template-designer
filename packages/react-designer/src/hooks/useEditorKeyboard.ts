import { useEffect, type RefObject } from 'react'
import type { DesignerHostCommandController, DesignerHostCommandId } from '../host'
import type { EditorStore } from '../state'
import type { ResourcePanelId } from './useWorkspaceLayout'

const EDITOR_INTERACTIVE_SELECTOR = [
  '[data-ptd-editor-interactive]',
  '[data-ptd-portal-interactive]',
  '[role="menu"]',
  '[role="menuitem"]',
].join(',')

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') return false
  const element = target as {
    tagName?: string
    isContentEditable?: boolean
    closest?: (selector: string) => unknown
  }
  const tagName = element.tagName?.toLowerCase()
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    Boolean(element.isContentEditable) ||
    Boolean(element.closest?.('[contenteditable="true"]'))
  )
}

export function isEditorInteractiveTarget(target: EventTarget | null): boolean {
  if (isEditableTarget(target)) return true
  if (!target || typeof target !== 'object') return false
  const element = target as { closest?: (selector: string) => unknown }
  return Boolean(element.closest?.(EDITOR_INTERACTIVE_SELECTOR))
}

export function isSelectToolShortcut(
  key: string,
  modifiers: { command?: boolean; alt?: boolean } = {},
): boolean {
  if (modifiers.command || modifiers.alt) return false
  const normalized = key.toLowerCase()
  return normalized === 'v' || normalized === 'escape'
}

export function isHandToolShortcut(
  key: string,
  modifiers: { command?: boolean; alt?: boolean } = {},
): boolean {
  return !modifiers.command && !modifiers.alt && key.toLowerCase() === 'h'
}

export function isTemporaryHandKey(key: string, code = ''): boolean {
  return key === ' ' || key === 'Space' || key === 'Spacebar' || code === 'Space'
}

export function getHostCommandShortcut(
  key: string,
  modifiers: { command?: boolean; shift?: boolean } = {},
): DesignerHostCommandId | null {
  if (!modifiers.command) return null
  const normalized = key.toLowerCase()
  if (normalized === 's') return modifiers.shift ? 'saveAs' : 'save'
  if (!modifiers.shift && normalized === 'n') return 'new'
  if (!modifiers.shift && normalized === 'o') return 'open'
  return null
}

interface EditorKeyboardActions {
  hostCommands?: DesignerHostCommandController
  openResource?: (panel: ResourcePanelId) => void
  toggleInspector?: () => void
}

export function useEditorKeyboard(
  store: EditorStore,
  rootRef: RefObject<HTMLElement | null>,
  actions: EditorKeyboardActions = {},
): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditorInteractiveTarget(event.target)) return
      const root = rootRef.current
      if (!root || !root.contains(document.activeElement)) return
      const command = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()

      const hostCommand = getHostCommandShortcut(key, { command, shift: event.shiftKey })
      if (hostCommand && actions.hostCommands) {
        const state = actions.hostCommands.getState(hostCommand)
        if (state.enabled && !state.pending) {
          event.preventDefault()
          void actions.hostCommands.execute(hostCommand)
        }
        return
      }

      if (command && key === 'z') {
        event.preventDefault()
        if (event.shiftKey) store.redo()
        else store.undo()
        return
      }
      if (command && key === 'y') {
        event.preventDefault()
        store.redo()
        return
      }
      if (command && key === 'c') {
        event.preventDefault()
        store.copy()
        return
      }
      if (command && key === 'x') {
        event.preventDefault()
        store.cut()
        return
      }
      if (command && key === 'v') {
        event.preventDefault()
        store.paste()
        return
      }
      if (command && key === 'g') {
        event.preventDefault()
        if (event.shiftKey) store.ungroup()
        else store.group()
        return
      }
      if (command && key === 'l') {
        event.preventDefault()
        store.toggleLock()
        return
      }
      if (command && key === ']') {
        event.preventDefault()
        store.moveLayer('forward')
        return
      }
      if (command && key === '[') {
        event.preventDefault()
        store.moveLayer('backward')
        return
      }
      if (command && key === 'r') {
        event.preventDefault()
        store.toggleRuler()
        return
      }
      if (command && key === ';') {
        event.preventDefault()
        store.toggleGuidesVisible()
        return
      }
      if (command && (key === '+' || key === '=')) {
        event.preventDefault()
        store.setZoom(store.scale.value + 0.25)
        return
      }
      if (command && key === '-') {
        event.preventDefault()
        store.setZoom(store.scale.value - 0.25)
        return
      }
      if (!command && !event.altKey && !event.shiftKey) {
        const panelByKey: Partial<Record<string, ResourcePanelId>> = {
          f6: 'assets',
          f7: 'pages',
          f8: 'layers',
        }
        const panel = panelByKey[key]
        if (panel && actions.openResource) {
          event.preventDefault()
          actions.openResource(panel)
          return
        }
        if (key === 'f9' && actions.toggleInspector) {
          event.preventDefault()
          actions.toggleInspector()
          return
        }
      }
      if (!command && !event.altKey && isTemporaryHandKey(event.key, event.code)) {
        event.preventDefault()
        store.setTemporaryHand(true)
        return
      }
      if (isHandToolShortcut(key, { command, alt: event.altKey })) {
        event.preventDefault()
        store.setActiveTool('hand')
        return
      }
      if (isSelectToolShortcut(key, { command, alt: event.altKey })) {
        event.preventDefault()
        store.setActiveTool('select')
        return
      }
      if (key === 'delete' || key === 'backspace') {
        event.preventDefault()
        if (store.selectedGuideId.value) store.removeSelectedGuide()
        else store.deleteSelected()
        return
      }
      const distance = event.shiftKey ? 10 : 1
      const movement: Partial<Record<string, [number, number]>> = {
        arrowleft: [-distance, 0],
        arrowright: [distance, 0],
        arrowup: [0, -distance],
        arrowdown: [0, distance],
      }
      const delta = movement[key]
      if (delta) {
        const selectedGuide = store.guides.value.find(
          (guide) => guide.id === store.selectedGuideId.value,
        )
        if (selectedGuide) {
          const guideDelta = selectedGuide.axis === 'x' ? delta[0] : delta[1]
          if (guideDelta !== 0) {
            event.preventDefault()
            store.moveGuide(
              selectedGuide.id,
              Math.max(0, selectedGuide.positionMm + guideDelta / 10),
            )
          }
          return
        }
        event.preventDefault()
        store.moveSelection(delta[0], delta[1])
      }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (!store.temporaryHand.value || !isTemporaryHandKey(event.key, event.code)) return
      event.preventDefault()
      store.setTemporaryHand(false)
    }
    const handleBlur = () => store.setTemporaryHand(false)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
      store.setTemporaryHand(false)
    }
  }, [actions, rootRef, store])
}
