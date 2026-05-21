import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import type { ComponentSchema } from '@ptd/core'
import {
  curComponentSignal,
  curComponentIndexSignal,
  isClickComponentSignal,
  isInEditorSignal,
  setShapeStyle,
} from '../../state'
import { recordSnapshot } from '../../state/snapshot'
import {
  mod360,
  type Point,
} from '../../utils'
import { calculateComponentPositionAndSize } from '../../utils/calculateComponentPositionAndSize'
import styles from './ComponentAdjuster.module.css'

type HandleName = 'lt' | 't' | 'rt' | 'r' | 'rb' | 'b' | 'lb' | 'l'

const INITIAL_ANGLE: Record<HandleName, number> = {
  lt: 0, t: 45, rt: 90, r: 135, rb: 180, b: 225, lb: 270, l: 315,
}

const ANGLE_TO_CURSOR = [
  { start: 338, end: 23, cursor: 'nw' },
  { start: 23, end: 68, cursor: 'n' },
  { start: 68, end: 113, cursor: 'ne' },
  { start: 113, end: 158, cursor: 'e' },
  { start: 158, end: 203, cursor: 'se' },
  { start: 203, end: 248, cursor: 's' },
  { start: 248, end: 293, cursor: 'sw' },
  { start: 293, end: 338, cursor: 'w' },
]

function getCursorForPoint(point: HandleName, rotate: number): string {
  const angle = mod360(INITIAL_ANGLE[point] + rotate)
  for (const { start, end, cursor } of ANGLE_TO_CURSOR) {
    if (angle < 23 || angle >= 338) return 'nw-resize'
    if (start <= angle && angle < end) return cursor + '-resize'
  }
  return 'nw-resize'
}

function getPointList(component: string): HandleName[] {
  if (['RoySimpleTable', 'RoyComplexTable'].includes(component)) return ['b']
  if (component === 'RoyLine') return ['r', 'l']
  return ['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l']
}

function getPointStyle(
  point: HandleName,
  width: number,
  height: number,
  cursor: string,
): React.CSSProperties {
  const hasT = /t/.test(point)
  const hasB = /b/.test(point)
  const hasL = /l/.test(point)
  const hasR = /r/.test(point)
  let left = 0
  let top = 0

  if (point.length === 2) {
    left = hasL ? 0 : width
    top = hasT ? 0 : height
  } else {
    if (hasT || hasB) { left = width / 2; top = hasT ? 0 : height }
    if (hasL || hasR) { left = hasL ? 0 : width; top = Math.floor(height / 2) }
  }

  return { marginLeft: '-4px', marginTop: '-4px', left: `${left}px`, top: `${top}px`, cursor }
}

interface ComponentAdjusterProps {
  schema: ComponentSchema
  index: number
  isActive: boolean
  editorRef: React.RefObject<HTMLDivElement | null>
  scale: number
  onChange?: (value: import('@ptd/core').TemplateSchema) => void
  onMove?: (isDownward: boolean, isRightward: boolean) => void
  onMoveEnd?: () => void
  children: ReactNode
}

export function ComponentAdjuster({
  schema,
  index,
  isActive,
  editorRef,
  scale,
  onChange,
  onMove,
  onMoveEnd,
  children,
}: ComponentAdjusterProps) {
  const adjusterRef = useRef<HTMLDivElement>(null)
  const [cursors, setCursors] = useState<Partial<Record<HandleName, string>>>({})

  const style = schema.style
  const isLocked = schema.isLock ?? false
  const showActive = isActive && !isLocked
  const pointList = getPointList(schema.component)

  const updateCursors = useCallback(() => {
    const rotate = mod360(style.rotate ?? 0)
    const next: Partial<Record<HandleName, string>> = {}
    for (const point of pointList) {
      next[point] = getCursorForPoint(point, rotate)
    }
    setCursors(next)
  }, [style.rotate, pointList])

  useEffect(() => {
    updateCursors()
  }, [updateCursors])

  const handleClick = useCallback((e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }, [])

  const handleMouseDownOnShape = useCallback(
    (e: MouseEvent) => {
      isInEditorSignal.value = true
      isClickComponentSignal.value = true
      e.stopPropagation()

      curComponentSignal.value = schema
      curComponentIndexSignal.value = index
      updateCursors()
    },
    [schema, index, updateCursors],
  )

  const handleRotate = useCallback(
    (e: MouseEvent) => {
      if (isLocked) return
      isClickComponentSignal.value = true
      e.preventDefault()
      e.stopPropagation()

      const pos = { ...style }
      const startY = e.clientY
      const startX = e.clientX
      const startRotate = pos.rotate ?? 0

      const rect = adjusterRef.current!.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const rotateDegreeBefore = Math.atan2(startY - centerY, startX - centerX) / (Math.PI / 180)

      let hasMove = false

      const move = (ev: globalThis.MouseEvent) => {
        hasMove = true
        const rotateDegreeAfter = Math.atan2(ev.clientY - centerY, ev.clientX - centerX) / (Math.PI / 180)
        const newRotate = startRotate + rotateDegreeAfter - rotateDegreeBefore
        setShapeStyle(schema.id, { rotate: newRotate }, onChange)
      }

      const up = () => {
        if (hasMove) recordSnapshot()
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
        updateCursors()
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
    [isLocked, style, schema.id, onChange, updateCursors],
  )

  const handleMouseDownOnPoint = useCallback(
    (point: HandleName, e: MouseEvent) => {
      if (isLocked) return
      isInEditorSignal.value = true
      isClickComponentSignal.value = true
      e.stopPropagation()
      e.preventDefault()

      const currentStyle = { ...style }
      const adjEl = adjusterRef.current
      const w = isNaN(currentStyle.width) ? (adjEl?.clientWidth ?? 0) : currentStyle.width
      const h = isNaN(currentStyle.height) ? (adjEl?.clientHeight ?? 0) : currentStyle.height
      const resizeStyle: import('../../utils/calculateComponentPositionAndSize').ResizeStyle = {
        width: w,
        height: h,
        left: (currentStyle.left as number | undefined) ?? 0,
        top: (currentStyle.top as number | undefined) ?? 0,
        rotate: currentStyle.rotate ?? 0,
      }
      const proportion = w / h

      const center: Point = {
        x: resizeStyle.left + w / 2,
        y: resizeStyle.top + h / 2,
      }

      const editorRect = editorRef.current!.getBoundingClientRect()
      const pointRect = (e.target as HTMLElement).getBoundingClientRect()
      const curPoint: Point = {
        x: Math.round(pointRect.left / scale - editorRect.left / scale + (e.target as HTMLElement).offsetWidth / scale / 2),
        y: Math.round(pointRect.top / scale - editorRect.top / scale + (e.target as HTMLElement).offsetHeight / scale / 2),
      }
      const symmetricPoint: Point = {
        x: center.x - (curPoint.x - center.x),
        y: center.y - (curPoint.y - center.y),
      }

      const isTable = ['RoySimpleTable', 'RoyComplexTable'].includes(schema.component)
      const needLockProportion = schema.component === 'RoyGroup'

      let needSave = false
      let isFirst = true

      const move = (ev: globalThis.MouseEvent) => {
        if (isFirst) { isFirst = false; return }
        needSave = true
        const curPosition: Point = {
          x: (ev.clientX - Math.round(editorRect.left)) / scale,
          y: (ev.clientY - Math.round(editorRect.top)) / scale,
        }
        calculateComponentPositionAndSize(
          point,
          resizeStyle,
          curPosition,
          proportion,
          needLockProportion,
          { center, curPoint, symmetricPoint },
          isTable ? (adjEl?.clientHeight ?? 0) : 0,
        )
        setShapeStyle(schema.id, {
          width: resizeStyle.width,
          height: resizeStyle.height,
          left: resizeStyle.left,
          top: resizeStyle.top,
        }, onChange)
      }

      const up = () => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
        if (needSave) recordSnapshot()
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
    [isLocked, style, schema, editorRef, scale, onChange],
  )

  const handleMouseMoveItem = useCallback(
    (e: MouseEvent) => {
      if (!showActive) return
      e.stopPropagation()
      e.preventDefault()

      const startY = e.clientY
      const startX = e.clientX
      const startTop = (style.top as number | undefined) ?? 0
      const startLeft = (style.left as number | undefined) ?? 0

      let hasMove = false

      const move = (ev: globalThis.MouseEvent) => {
        hasMove = true
        const editorEl = editorRef.current
        if (!editorEl) return
        const curX = ev.clientX
        const curY = ev.clientY
        const newTop = Math.min(
          Math.max(0, (curY - startY) / scale + startTop),
          editorEl.offsetHeight - (adjusterRef.current?.offsetHeight ?? 0),
        )
        const newLeft = Math.min(
          Math.max(0, (curX - startX) / scale + startLeft),
          editorEl.offsetWidth - (adjusterRef.current?.offsetWidth ?? 0),
        )
        setShapeStyle(schema.id, { top: newTop, left: newLeft }, onChange)
        onMove?.(curY - startY > 0, curX - startX > 0)
      }

      const up = () => {
        if (hasMove) recordSnapshot()
        onMoveEnd?.()
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
    [showActive, style, schema.id, editorRef, scale, onChange, onMove, onMoveEnd],
  )

  const adjusterStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${(style.left as number | undefined) ?? 0}px`,
    top: `${(style.top as number | undefined) ?? 0}px`,
    width: `${style.width}px`,
    height: `${style.height}px`,
    transform: style.rotate ? `rotate(${style.rotate}deg)` : undefined,
    opacity: isLocked ? 0.5 : undefined,
    border: showActive
      ? '0.5px solid var(--ptd-color-primary, #4579e1)'
      : '0.5px dashed rgba(100,100,100,0.4)',
    userSelect: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div
      ref={adjusterRef}
      style={adjusterStyle}
      className={styles.adjuster}
      onClick={handleClick}
      onMouseDown={handleMouseDownOnShape}
    >
      {/* Rotate handle */}
      {showActive && !['RoySimpleTable', 'RoyComplexTable'].includes(schema.component) && (
        <span
          className={styles.rotate}
          onMouseDown={handleRotate}
          title="Rotate"
        />
      )}

      {/* Lock indicator */}
      {isLocked && <span className={styles.lock} title="Locked" />}

      {/* Move handle */}
      <span
        className={styles.move}
        onMouseDown={handleMouseMoveItem}
        title="Move"
      />

      {/* Resize points */}
      {showActive &&
        pointList.map((point) => (
          <div
            key={point}
            className={styles.point}
            style={getPointStyle(point, style.width, style.height, cursors[point] ?? 'pointer')}
            onMouseDown={(e) => handleMouseDownOnPoint(point, e)}
          />
        ))}

      {/* Component content */}
      <div className={styles.container}>{children}</div>
    </div>
  )
}
