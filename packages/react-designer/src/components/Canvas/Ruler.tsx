import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import {
  MEASUREMENT_UNIT_DEFINITIONS,
  formatMeasurement,
  mmToPx,
  pxToMm,
  snapMeasurement,
  toDisplayMeasurement,
} from '@ptd/core'
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

interface HoverGuide {
  axis: GuideAxis
  positionMm: number
}

export function Ruler({ widthMm, heightMm, scale }: RulerProps) {
  useSignals()
  const store = useEditorStore()
  const horizontalRef = useRef<HTMLButtonElement>(null)
  const verticalRef = useRef<HTMLButtonElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const [hoverGuide, setHoverGuide] = useState<HoverGuide | null>(null)
  const measurementUnit = store.measurementUnit.value
  const unitDefinition = MEASUREMENT_UNIT_DEFINITIONS[measurementUnit]
  const horizontalMarks = createRulerMarks(widthMm, scale, measurementUnit)
  const verticalMarks = createRulerMarks(heightMm, scale, measurementUnit)
  const horizontalTotal = toDisplayMeasurement(mmToPx(widthMm), measurementUnit)
  const verticalTotal = toDisplayMeasurement(mmToPx(heightMm), measurementUnit)

  useEffect(() => () => cleanupRef.current?.(), [])

  const positionFromPointer = useCallback(
    (axis: GuideAxis, clientX: number, clientY: number) => {
      const ruler = axis === 'x' ? horizontalRef.current : verticalRef.current
      if (!ruler) return 0
      const rect = ruler.getBoundingClientRect()
      const screenPosition = axis === 'x' ? clientX - rect.left : clientY - rect.top
      const totalCanvasPx = mmToPx(axis === 'x' ? widthMm : heightMm)
      const canvasPosition = Math.min(totalCanvasPx, Math.max(0, screenPosition / scale))
      return pxToMm(snapMeasurement(canvasPosition, measurementUnit))
    },
    [heightMm, measurementUnit, scale, widthMm],
  )

  const startGuideInteraction = useCallback(
    (axis: GuideAxis, event: PointerEvent<HTMLElement>, existingId?: string) => {
      if (store.guidesLocked.value) return
      event.preventDefault()
      event.stopPropagation()
      setHoverGuide(null)
      const initialPosition = positionFromPointer(axis, event.clientX, event.clientY)
      const guideId = existingId ?? store.addGuide(axis, initialPosition)
      if (!guideId) return
      store.selectGuide(guideId)
      store.moveGuide(guideId, initialPosition)

      cleanupRef.current?.()
      const move = (nextEvent: globalThis.PointerEvent) => {
        store.moveGuide(guideId, positionFromPointer(axis, nextEvent.clientX, nextEvent.clientY))
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
    store.addGuide(axis, pxToMm(snapMeasurement(mmToPx(total / 2), measurementUnit)))
  }

  const previewGuide = (axis: GuideAxis, event: PointerEvent<HTMLElement>) => {
    if (store.guidesLocked.value || cleanupRef.current) return
    setHoverGuide({
      axis,
      positionMm: positionFromPointer(axis, event.clientX, event.clientY),
    })
  }

  return (
    <div
      className={styles.rulers}
      role="group"
      aria-label={`${unitDefinition.accessibleLabel}标尺与参考线`}
      data-ptd-ruler={measurementUnit}
    >
      <span className={styles.unit}>{unitDefinition.label}</span>
      <button
        ref={horizontalRef}
        type="button"
        className={styles.horizontal}
        aria-label="从水平标尺添加垂直参考线"
        disabled={store.guidesLocked.value}
        onPointerDown={(event) => startGuideInteraction('x', event)}
        onPointerMove={(event) => previewGuide('x', event)}
        onPointerLeave={() => setHoverGuide(null)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            addGuideAtCenter('x')
          }
        }}
      >
        {horizontalMarks.map((mark) => (
          <RulerMarkView key={mark.value} mark={mark} axis="x" total={horizontalTotal} />
        ))}
      </button>
      <button
        ref={verticalRef}
        type="button"
        className={styles.vertical}
        aria-label="从垂直标尺添加水平参考线"
        disabled={store.guidesLocked.value}
        onPointerDown={(event) => startGuideInteraction('y', event)}
        onPointerMove={(event) => previewGuide('y', event)}
        onPointerLeave={() => setHoverGuide(null)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            addGuideAtCenter('y')
          }
        }}
      >
        {verticalMarks.map((mark) => (
          <RulerMarkView key={mark.value} mark={mark} axis="y" total={verticalTotal} />
        ))}
      </button>
      {store.guidesVisible.value && hoverGuide && (
        <span
          className={`${styles.guide} ${styles.guidePreview}`}
          data-axis={hoverGuide.axis}
          data-color={store.activeGuideColor.value}
          style={createGuidePosition(hoverGuide.positionMm, scale)}
          aria-hidden="true"
        >
          <span className={styles.guideStroke} />
          <span className={styles.guideMarker} />
          <span className={styles.guideLabel}>
            {formatGuideLabel(hoverGuide.axis, hoverGuide.positionMm, measurementUnit)}
          </span>
        </span>
      )}
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
              aria-label={`${guide.axis.toUpperCase()} 轴参考线 ${formatMeasurement(mmToPx(guide.positionMm), measurementUnit)} ${unitDefinition.accessibleLabel}`}
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
              <span className={styles.guideLabel}>
                {formatGuideLabel(guide.axis, guide.positionMm, measurementUnit)}
              </span>
            </button>
          )
        })}
    </div>
  )
}

function formatGuideLabel(axis: GuideAxis, positionMm: number, unit: 'mm' | 'px'): string {
  return `${axis.toUpperCase()} ${formatMeasurement(mmToPx(positionMm), unit)} ${unit}`
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
