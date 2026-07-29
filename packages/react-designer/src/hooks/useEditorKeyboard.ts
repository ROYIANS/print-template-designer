import { useEffect, type RefObject } from 'react'
import type { EditorStore } from '../state'

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

export function useEditorKeyboard(
  store: EditorStore,
  rootRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return
      const root = rootRef.current
      if (!root || !root.contains(document.activeElement)) return
      const command = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()

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
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [rootRef, store])
}
