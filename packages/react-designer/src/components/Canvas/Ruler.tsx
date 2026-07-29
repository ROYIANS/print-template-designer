import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { mmToPx, pxToMm } from '@ptd/core'
import type { GuideAxis } from '../../state'
import { useEditorStore } from '../../state'
import { createRulerMarks, type RulerMark } from './rulerMarks'
import styles from './Ruler.module.css'

type RulerVariables = CSSProperties & Record<`--${string}`, string>

interface RulerProps {
  widthMm: number
  heightMm: number
  scale: number
}

export function Ruler({ widthMm, heightMm, scale }: RulerProps) {
  useSignals()
  const store = useEditorStore()
  const horizontalRef = useRef<HTMLButtonElement>(null)
  const verticalRef = useRef<HTMLButtonElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const horizontalMarks = createRulerMarks(widthMm, scale)
  const verticalMarks = createRulerMarks(heightMm, scale)

  useEffect(() => () => cleanupRef.current?.(), [])

  const positionFromPointer = useCallback(
    (axis: GuideAxis, clientX: number, clientY: number) => {
      const ruler = axis === 'x' ? horizontalRef.current : verticalRef.current
      if (!ruler) return 0
      const rect = ruler.getBoundingClientRect()
      const screenPosition = axis === 'x' ? clientX - rect.left : clientY - rect.top
      const total = axis === 'x' ? widthMm : heightMm
      return Math.min(total, Math.max(0, Math.round(pxToMm(screenPosition / scale) * 10) / 10))
    },
    [heightMm, scale, widthMm],
  )

  const startGuideInteraction = useCallback(
    (axis: GuideAxis, event: PointerEvent<HTMLElement>, existingId?: string) => {
      if (store.guidesLocked.value) return
      event.preventDefault()
      event.stopPropagation()
      const initialPosition = positionFromPointer(axis, event.clientX, event.clientY)
      const guideId = existingId ?? store.addGuide(axis, initialPosition)
      if (!guideId) return
      store.selectGuide(guideId)
      store.moveGuide(guideId, initialPosition)

      cleanupRef.current?.()
      const move = (nextEvent: globalThis.PointerEvent) => {
        store.moveGuide(
          guideId,
          positionFromPointer(axis, nextEvent.clientX, nextEvent.clientY),
        )
      }
      const finish = () => {
        document.removeEventListener('pointermove', move)
        document.removeEventListener('pointerup', finish)
        document.removeEventListener('pointercancel', finish)
        cleanupRef.current = null
      }
      cleanupRef.current = finish
      document.addEventListener('pointermove', move)
      document.addEventListener('pointerup', finish)
      document.addEventListener('pointercancel', finish)
    },
    [positionFromPointer, store],
  )

  const addGuideAtCenter = (axis: GuideAxis) => {
    const total = axis === 'x' ? widthMm : heightMm
    store.addGuide(axis, Math.round((total / 2) * 10) / 10)
  }

  return (
    <div
      className={styles.rulers}
      role="group"
      aria-label="毫米标尺与参考线"
      data-ptd-ruler="millimetres"
    >
      <span className={styles.unit}>mm</span>
      <button
        ref={horizontalRef}
        type="button"
        className={styles.horizontal}
        aria-label="从水平标尺添加垂直参考线"
        disabled={store.guidesLocked.value}
        onPointerDown={(event) => startGuideInteraction('x', event)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            addGuideAtCenter('x')
          }
        }}
      >
        {horizontalMarks.map((mark) => (
          <RulerMarkView key={mark.value} mark={mark} axis="x" total={widthMm} />
        ))}
      </button>
      <button
        ref={verticalRef}
        type="button"
        className={styles.vertical}
        aria-label="从垂直标尺添加水平参考线"
        disabled={store.guidesLocked.value}
        onPointerDown={(event) => startGuideInteraction('y', event)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            addGuideAtCenter('y')
          }
        }}
      >
        {verticalMarks.map((mark) => (
          <RulerMarkView key={mark.value} mark={mark} axis="y" total={heightMm} />
        ))}
      </button>
      {store.guidesVisible.value &&
        store.guides.value.map((guide) => {
          const position = createGuidePosition(guide.positionMm, scale)
          const selected = store.selectedGuideId.value === guide.id
          return (
            <button
              type="button"
              key={guide.id}
              className={styles.guide}
              data-axis={guide.axis}
              data-color={guide.color}
              data-selected={selected || undefined}
              aria-label={`${guide.axis.toUpperCase()} 轴参考线 ${guide.positionMm.toFixed(1)} 毫米`}
              style={position}
              onClick={(event) => {
                event.stopPropagation()
                store.selectGuide(guide.id)
              }}
              onDoubleClick={() => store.removeGuide(guide.id)}
              onPointerDown={(event) => startGuideInteraction(guide.axis, event, guide.id)}
            >
              <span className={styles.guideStroke} />
              <span className={styles.guideMarker} />
              {selected && (
                <span className={styles.guideLabel}>
                  {guide.axis.toUpperCase()} {guide.positionMm.toFixed(1)} mm
                </span>
              )}
            </button>
          )
        })}
    </div>
  )
}

function createGuidePosition(positionMm: number, scale: number): RulerVariables {
  return { '--guide-position': `${mmToPx(positionMm) * scale}px` }
}

interface RulerMarkViewProps {
  mark: RulerMark
  axis: 'x' | 'y'
  total: number
}

function RulerMarkView({ mark, axis, total }: RulerMarkViewProps) {
  const variables: RulerVariables = {
    '--ruler-position': `${mark.position}px`,
  }
  const edge = mark.value === 0 ? 'start' : mark.value === total ? 'end' : undefined

  return (
    <span
      className={styles.mark}
      data-axis={axis}
      data-kind={mark.kind}
      data-edge={edge}
      style={variables}
    >
      {mark.label && <span className={styles.label}>{mark.label}</span>}
    </span>
  )
}
