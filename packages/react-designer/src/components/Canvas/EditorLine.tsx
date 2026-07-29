import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import type { ComponentSchema } from '@ptd/core'
import { useEditorStore } from '../../state'
import { getComponentRotatedStyle } from '../../utils'
import styles from './EditorLine.module.css'

type LineName = 'x' | 'y'
const DIFF = 3

export interface EditorLineHandle {
  showLines(isDownward: boolean, isRightward: boolean): void
  hideLines(): void
}

export const EditorLine = forwardRef<EditorLineHandle>(function EditorLine(_props, ref) {
  const store = useEditorStore()
  const lineRefs = useRef<Record<LineName, HTMLDivElement | null>>({ x: null, y: null })

  const hideLines = useCallback(() => {
    for (const line of Object.values(lineRefs.current)) {
      if (line) line.style.display = 'none'
    }
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      hideLines,
      showLines(_isDownward, _isRightward) {
        hideLines()
        if (store.selectedIds.value.length > 1) return
        const components = store.components.value
        const current = store.primaryComponent.value
        if (!current || current.isLock) return
        const currentBox = getComponentRotatedStyle(current.style)
        for (const component of components) {
          if (component.id === current.id) continue
          const box = getComponentRotatedStyle(component.style)
          const horizontal = [box.top, (box.top + box.bottom) / 2, box.bottom]
          const vertical = [box.left, (box.left + box.right) / 2, box.right]
          const currentHorizontal = [
            currentBox.top,
            (currentBox.top + currentBox.bottom) / 2,
            currentBox.bottom,
          ]
          const currentVertical = [
            currentBox.left,
            (currentBox.left + currentBox.right) / 2,
            currentBox.right,
          ]
          const yTarget = horizontal.find((target) =>
            currentHorizontal.some((value) => Math.abs(target - value) <= DIFF),
          )
          const xTarget = vertical.find((target) =>
            currentVertical.some((value) => Math.abs(target - value) <= DIFF),
          )
          if (yTarget !== undefined && lineRefs.current.x) {
            lineRefs.current.x.style.display = 'block'
            lineRefs.current.x.style.top = `${yTarget}px`
          }
          if (xTarget !== undefined && lineRefs.current.y) {
            lineRefs.current.y.style.display = 'block'
            lineRefs.current.y.style.left = `${xTarget}px`
          }
          if (yTarget !== undefined || xTarget !== undefined) {
            const patch: Partial<ComponentSchema['style']> = {}
            if (yTarget !== undefined) {
              const matched = currentHorizontal.findIndex(
                (value) => Math.abs(yTarget - value) <= DIFF,
              )
              patch.top = numeric(current.style.top) + yTarget - currentHorizontal[matched]!
            }
            if (xTarget !== undefined) {
              const matched = currentVertical.findIndex(
                (value) => Math.abs(xTarget - value) <= DIFF,
              )
              patch.left = numeric(current.style.left) + xTarget - currentVertical[matched]!
            }
            store.transformComponent(current.id, patch, true)
            return
          }
        }
      },
    }),
    [hideLines, store],
  )

  return (
    <div className={styles.markLine}>
      <div
        ref={(element) => {
          lineRefs.current.x = element
        }}
        className={`${styles.line} ${styles.xline}`}
      />
      <div
        ref={(element) => {
          lineRefs.current.y = element
        }}
        className={`${styles.line} ${styles.yline}`}
      />
    </div>
  )
})

function numeric(value: unknown): number {
  return typeof value === 'number' ? value : 0
}
