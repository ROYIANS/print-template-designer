import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'
import type { ComponentSchema } from '@ptd/core'
import { useEditorStore } from '../../state'
import { getComponentRotatedStyle, mod360, type Point } from '../../utils'
import { calculateComponentPositionAndSize } from '../../utils/calculateComponentPositionAndSize'
import styles from './ComponentAdjuster.module.css'

type HandleName = 'lt' | 't' | 'rt' | 'r' | 'rb' | 'b' | 'lb' | 'l'
type Variables = CSSProperties & Record<`--${string}`, string>

const INITIAL_ANGLE: Record<HandleName, number> = {
  lt: 0,
  t: 45,
  rt: 90,
  r: 135,
  rb: 180,
  b: 225,
  lb: 270,
  l: 315,
}

function getCursor(point: HandleName, rotate: number): string {
  const index = Math.round(mod360(INITIAL_ANGLE[point] + rotate) / 45) % 8
  return `${['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'][index]}-resize`
}

function getPointList(component: string): HandleName[] {
  if (['RoySimpleTable', 'RoyComplexTable'].includes(component)) return ['b']
  if (component === 'RoyLine') return ['r', 'l']
  return ['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l']
}

function getPointVariables(
  point: HandleName,
  width: number,
  height: number,
  cursor: string,
): Variables {
  const vertical = point.length === 1 && (point === 't' || point === 'b')
  const horizontal = point.length === 1 && (point === 'l' || point === 'r')
  return {
    '--point-left': `${vertical ? width / 2 : point.includes('r') ? width : 0}px`,
    '--point-top': `${horizontal ? Math.floor(height / 2) : point.includes('b') ? height : 0}px`,
    '--point-cursor': cursor,
  }
}

interface ComponentAdjusterProps {
  schema: ComponentSchema
  isActive: boolean
  editorRef: React.RefObject<HTMLDivElement | null>
  scale: number
  onMove?: (isDownward: boolean, isRightward: boolean) => void
  onMoveEnd?: () => void
  children: ReactNode
}

export function ComponentAdjuster({
  schema,
  isActive,
  editorRef,
  scale,
  onMove,
  onMoveEnd,
  children,
}: ComponentAdjusterProps) {
  const store = useEditorStore()
  const adjusterRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const style = schema.style
  const isLocked = schema.isLock ?? false
  const hasLockedSelection = store.selectedComponents.value.some((component) => component.isLock)
  const showHandles = isActive && !isLocked && !hasLockedSelection
  const pointList = useMemo(() => getPointList(schema.component), [schema.component])
  const cursors = useMemo(
    () =>
      Object.fromEntries(
        pointList.map((point) => [point, getCursor(point, style.rotate ?? 0)]),
      ) as Record<HandleName, string>,
    [pointList, style.rotate],
  )

  useEffect(
    () => () => {
      cleanupRef.current?.()
    },
    [],
  )

  const startSession = useCallback(
    (move: (event: globalThis.MouseEvent) => void, finish: () => void) => {
      cleanupRef.current?.()
      let ended = false
      const end = () => {
        if (ended) return
        ended = true
        cleanup()
        finish()
      }
      const cleanup = () => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', end)
        window.removeEventListener('blur', end)
        cleanupRef.current = null
      }
      cleanupRef.current = end
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', end)
      window.addEventListener('blur', end)
    },
    [],
  )

  const handleMouseDownOnShape = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation()
      store.selectComponent(schema.id, event.shiftKey || event.metaKey || event.ctrlKey)
    },
    [schema.id, store],
  )

  const handleRotate = useCallback(
    (event: MouseEvent) => {
      if (isLocked) return
      event.preventDefault()
      event.stopPropagation()
      const rect = adjusterRef.current?.getBoundingClientRect()
      if (!rect) return
      store.beginGesture()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const before = (Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180) / Math.PI
      const initial = style.rotate ?? 0
      startSession(
        (nextEvent) => {
          const after =
            (Math.atan2(nextEvent.clientY - centerY, nextEvent.clientX - centerX) * 180) / Math.PI
          store.transformComponent(schema.id, { rotate: initial + after - before }, true)
        },
        () => store.commitGesture(),
      )
    },
    [isLocked, schema.id, startSession, store, style.rotate],
  )

  const handleResize = useCallback(
    (point: HandleName, event: MouseEvent) => {
      if (isLocked) return
      event.preventDefault()
      event.stopPropagation()
      const adjuster = adjusterRef.current
      const editor = editorRef.current
      if (!adjuster || !editor) return
      store.beginGesture()
      const resizeStyle = {
        width: Number.isFinite(style.width) ? style.width : adjuster.clientWidth,
        height: Number.isFinite(style.height) ? style.height : adjuster.clientHeight,
        left: typeof style.left === 'number' ? style.left : 0,
        top: typeof style.top === 'number' ? style.top : 0,
        rotate: style.rotate ?? 0,
      }
      const proportion = resizeStyle.width / resizeStyle.height
      const center: Point = {
        x: resizeStyle.left + resizeStyle.width / 2,
        y: resizeStyle.top + resizeStyle.height / 2,
      }
      const editorRect = editor.getBoundingClientRect()
      const pointRect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const curPoint: Point = {
        x: (pointRect.left - editorRect.left + pointRect.width / 2) / scale,
        y: (pointRect.top - editorRect.top + pointRect.height / 2) / scale,
      }
      const symmetricPoint = {
        x: center.x - (curPoint.x - center.x),
        y: center.y - (curPoint.y - center.y),
      }
      startSession(
        (nextEvent) => {
          calculateComponentPositionAndSize(
            point,
            resizeStyle,
            {
              x: (nextEvent.clientX - editorRect.left) / scale,
              y: (nextEvent.clientY - editorRect.top) / scale,
            },
            proportion,
            schema.component === 'RoyGroup',
            { center, curPoint, symmetricPoint },
            ['RoySimpleTable', 'RoyComplexTable'].includes(schema.component)
              ? adjuster.clientHeight
              : 0,
          )
          store.transformComponent(schema.id, { ...resizeStyle }, true)
        },
        () => store.commitGesture(),
      )
    },
    [editorRef, isLocked, scale, schema.component, schema.id, startSession, store, style],
  )

  const handleMove = useCallback(
    (event: MouseEvent) => {
      if (!showHandles) return
      event.preventDefault()
      event.stopPropagation()
      const editor = editorRef.current
      const adjuster = adjusterRef.current
      if (!editor || !adjuster) return
      store.beginGesture()
      const startX = event.clientX
      const startY = event.clientY
      const selectedBounds = store.selectedComponents.value.map((component) =>
        getComponentRotatedStyle(component.style),
      )
      const selectionLeft = Math.min(...selectedBounds.map((box) => box.left))
      const selectionTop = Math.min(...selectedBounds.map((box) => box.top))
      const selectionRight = Math.max(...selectedBounds.map((box) => box.right))
      const selectionBottom = Math.max(...selectedBounds.map((box) => box.bottom))
      let lastDeltaLeft = 0
      let lastDeltaTop = 0
      startSession(
        (nextEvent) => {
          const totalDeltaLeft = Math.min(
            editor.offsetWidth - selectionRight,
            Math.max(-selectionLeft, (nextEvent.clientX - startX) / scale),
          )
          const totalDeltaTop = Math.min(
            editor.offsetHeight - selectionBottom,
            Math.max(-selectionTop, (nextEvent.clientY - startY) / scale),
          )
          store.moveSelection(totalDeltaLeft - lastDeltaLeft, totalDeltaTop - lastDeltaTop, true)
          lastDeltaLeft = totalDeltaLeft
          lastDeltaTop = totalDeltaTop
          onMove?.(nextEvent.clientY > startY, nextEvent.clientX > startX)
        },
        () => {
          onMoveEnd?.()
          store.commitGesture()
        },
      )
    },
    [editorRef, onMove, onMoveEnd, scale, showHandles, startSession, store],
  )

  const variables: Variables = {
    '--adjuster-left': `${number(style.left)}px`,
    '--adjuster-top': `${number(style.top)}px`,
    '--adjuster-width': `${style.width}px`,
    '--adjuster-height': `${style.height}px`,
    '--adjuster-rotate': `${style.rotate ?? 0}deg`,
  }

  return (
    <div
      ref={adjusterRef}
      style={variables}
      className={`${styles.adjuster} ${isActive ? styles.active : ''} ${isLocked ? styles.locked : ''}`}
      onMouseDown={handleMouseDownOnShape}
    >
      {showHandles && !['RoySimpleTable', 'RoyComplexTable'].includes(schema.component) && (
        <button
          type="button"
          className={styles.rotate}
          onMouseDown={handleRotate}
          aria-label="旋转组件"
        />
      )}
      {isLocked && <span className={styles.lock} title="已锁定" />}
      {showHandles && (
        <button
          type="button"
          className={styles.move}
          onMouseDown={handleMove}
          aria-label="移动组件"
        />
      )}
      {showHandles &&
        pointList.map((point) => (
          <button
            type="button"
            key={point}
            className={styles.point}
            style={getPointVariables(point, style.width, style.height, cursors[point])}
            onMouseDown={(event) => handleResize(point, event)}
            aria-label={`从 ${point} 控点调整尺寸`}
          />
        ))}
      <div className={styles.container}>{children}</div>
    </div>
  )
}

function number(value: unknown): number {
  return typeof value === 'number' ? value : 0
}
