import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { getPageDimensions, mmToPx } from '@ptd/core'
import {
  createDrawnComponentSchema,
  drawnComponentGeometry,
  isDrawnComponentType,
  isDrawingGestureLongEnough,
  type ComponentPoint,
  type DrawnComponentType,
  type ShapeDrawGeometry,
} from '../../catalog'
import { useEditorStore } from '../../state'
import { getComponentRotatedStyle } from '../../utils'
import {
  areaAutoScrollDelta,
  canvasPointFromClient,
  selectionAreaBetween,
  type SelectionPoint,
} from '../../utils/areaSelection'
import { Area } from './Area'
import { ComponentAdjuster } from './ComponentAdjuster'
import { ComponentRenderer } from './ComponentRenderer'
import { EditorLine, type EditorLineHandle } from './EditorLine'
import { Ruler } from './Ruler'
import { CanvasContextMenu } from './CanvasContextMenu'
import styles from './Canvas.module.css'

type CanvasVariables = CSSProperties & Record<`--${string}`, string>
type ShapePreviewVariables = CSSProperties & Record<`--${string}`, string>

interface DrawSession {
  pointerId: number
  tool: DrawnComponentType
  start: ComponentPoint
  end: ComponentPoint
  clientStart: ComponentPoint
  clientEnd: ComponentPoint
  constrain: boolean
}

interface PanSession {
  pointerId: number
  viewport: HTMLElement
  clientStart: ComponentPoint
  scrollStart: ComponentPoint
}

export function Canvas({ onOpenInspector }: { onOpenInspector: () => void }) {
  useSignals()
  const store = useEditorStore()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const editorLineRef = useRef<EditorLineHandle>(null)
  const selectionCleanupRef = useRef<(() => void) | null>(null)
  const drawSessionRef = useRef<DrawSession | null>(null)
  const panSessionRef = useRef<PanSession | null>(null)
  const contextPointRef = useRef<SelectionPoint>({ x: 0, y: 0 })
  const [drawSession, setDrawSession] = useState<DrawSession | null>(null)
  const [isPanning, setIsPanning] = useState(false)

  const components = store.components.value
  const pageConfig = store.pageConfig.value
  const scale = store.scale.value
  const selectedIds = store.selectedIds.value
  const effectiveTool = store.effectiveTool.value
  const { width: pageWidthPx, height: pageHeightPx } = getPageDimensions(pageConfig)
  const pageWidthMm =
    pageConfig.pageDirection === 'l' ? pageConfig.pageHeight : pageConfig.pageWidth
  const pageHeightMm =
    pageConfig.pageDirection === 'l' ? pageConfig.pageWidth : pageConfig.pageHeight

  useEffect(
    () => () => {
      selectionCleanupRef.current?.()
    },
    [],
  )

  const cancelDrawing = useCallback(() => {
    drawSessionRef.current = null
    setDrawSession(null)
  }, [])

  const cancelPanning = useCallback(() => {
    panSessionRef.current = null
    setIsPanning(false)
  }, [])

  useEffect(() => {
    const drawing = drawSessionRef.current
    if (drawing && drawing.tool !== effectiveTool) cancelDrawing()
    if (panSessionRef.current && effectiveTool !== 'hand') cancelPanning()
  }, [cancelDrawing, cancelPanning, effectiveTool])

  useEffect(() => {
    const cancelInteractions = () => {
      cancelDrawing()
      cancelPanning()
    }
    window.addEventListener('blur', cancelInteractions)
    return () => window.removeEventListener('blur', cancelInteractions)
  }, [cancelDrawing, cancelPanning])

  const handleMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (effectiveTool !== 'select' || event.button !== 0 || event.target !== event.currentTarget)
        return
      const editor = editorRef.current
      if (!editor) return
      event.preventDefault()
      selectionCleanupRef.current?.()
      store.clearSelection()
      const viewport = editor.closest<HTMLElement>('[data-ptd-region="canvas-viewport"]')
      const canvasBounds = { width: pageWidthPx, height: pageHeightPx }
      const startPoint = canvasPointFromClient(
        editor.getBoundingClientRect(),
        event.clientX,
        event.clientY,
        scale,
        canvasBounds,
      )
      let lastPointer: SelectionPoint = { x: event.clientX, y: event.clientY }
      let hasMoved = false
      let frame = 0
      store.startAreaSelection(startPoint.x, startPoint.y)

      const updateArea = () => {
        const currentPoint = canvasPointFromClient(
          editor.getBoundingClientRect(),
          lastPointer.x,
          lastPointer.y,
          scale,
          canvasBounds,
        )
        store.updateAreaSelection(selectionAreaBetween(startPoint, currentPoint))
      }

      const scrollViewport = () => {
        if (!viewport || !hasMoved) return
        const delta = areaAutoScrollDelta(lastPointer, viewport.getBoundingClientRect())
        const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
        const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight)
        const nextScrollLeft = Math.min(maxScrollLeft, Math.max(0, viewport.scrollLeft + delta.x))
        const nextScrollTop = Math.min(maxScrollTop, Math.max(0, viewport.scrollTop + delta.y))
        if (nextScrollLeft === viewport.scrollLeft && nextScrollTop === viewport.scrollTop) return
        viewport.scrollLeft = nextScrollLeft
        viewport.scrollTop = nextScrollTop
        updateArea()
      }

      const tick = () => {
        scrollViewport()
        frame = requestAnimationFrame(tick)
      }

      const cleanup = () => {
        cancelAnimationFrame(frame)
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
        window.removeEventListener('blur', cancel)
        selectionCleanupRef.current = null
      }
      const move = (nextEvent: globalThis.MouseEvent) => {
        nextEvent.preventDefault()
        hasMoved = true
        lastPointer = { x: nextEvent.clientX, y: nextEvent.clientY }
        updateArea()
      }
      const up = (nextEvent: globalThis.MouseEvent) => {
        lastPointer = { x: nextEvent.clientX, y: nextEvent.clientY }
        updateArea()
        cleanup()
        const area = store.areaSelection.value.style
        const ids = store.components.value
          .filter((component) => {
            if (component.isLock) return false
            const box = getComponentRotatedStyle(component.style)
            return (
              area.left <= box.left &&
              area.top <= box.top &&
              box.right <= area.left + area.width &&
              box.bottom <= area.top + area.height
            )
          })
          .map((component) => component.id)
        store.finishAreaSelection(ids)
      }
      const cancel = () => {
        cleanup()
        store.cancelAreaSelection()
      }
      selectionCleanupRef.current?.()
      selectionCleanupRef.current = cancel
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
      window.addEventListener('blur', cancel)
      frame = requestAnimationFrame(tick)
    },
    [effectiveTool, pageHeightPx, pageWidthPx, scale, store],
  )

  const canvasPoint = useCallback(
    (clientX: number, clientY: number): ComponentPoint => {
      const editor = editorRef.current
      if (!editor) return { x: 0, y: 0 }
      return canvasPointFromClient(editor.getBoundingClientRect(), clientX, clientY, scale, {
        width: pageWidthPx,
        height: pageHeightPx,
      })
    },
    [pageHeightPx, pageWidthPx, scale],
  )

  const handlePanPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (effectiveTool !== 'hand' || event.button !== 0) return
      const viewport = event.currentTarget.closest<HTMLElement>(
        '[data-ptd-region="canvas-viewport"]',
      )
      if (!viewport) return
      event.preventDefault()
      event.stopPropagation()
      event.currentTarget.setPointerCapture(event.pointerId)
      panSessionRef.current = {
        pointerId: event.pointerId,
        viewport,
        clientStart: { x: event.clientX, y: event.clientY },
        scrollStart: { x: viewport.scrollLeft, y: viewport.scrollTop },
      }
      setIsPanning(true)
    },
    [effectiveTool],
  )

  const handlePanPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const current = panSessionRef.current
    if (!current || current.pointerId !== event.pointerId) return
    event.preventDefault()
    current.viewport.scrollLeft = current.scrollStart.x - (event.clientX - current.clientStart.x)
    current.viewport.scrollTop = current.scrollStart.y - (event.clientY - current.clientStart.y)
  }, [])

  const handlePanPointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (panSessionRef.current?.pointerId !== event.pointerId) return
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      cancelPanning()
    },
    [cancelPanning],
  )

  const handleDrawPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDrawnComponentType(effectiveTool) || event.button !== 0) return
      event.preventDefault()
      event.stopPropagation()
      event.currentTarget.focus({ preventScroll: true })
      event.currentTarget.setPointerCapture(event.pointerId)
      const start = canvasPoint(event.clientX, event.clientY)
      const session: DrawSession = {
        pointerId: event.pointerId,
        tool: effectiveTool,
        start,
        end: start,
        clientStart: { x: event.clientX, y: event.clientY },
        clientEnd: { x: event.clientX, y: event.clientY },
        constrain: event.shiftKey,
      }
      drawSessionRef.current = session
      setDrawSession(session)
    },
    [canvasPoint, effectiveTool],
  )

  const handleDrawPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const current = drawSessionRef.current
      if (!current || current.pointerId !== event.pointerId) return
      event.preventDefault()
      const next: DrawSession = {
        ...current,
        end: canvasPoint(event.clientX, event.clientY),
        clientEnd: { x: event.clientX, y: event.clientY },
        constrain: event.shiftKey,
      }
      drawSessionRef.current = next
      setDrawSession(next)
    },
    [canvasPoint],
  )

  const handleDrawPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const current = drawSessionRef.current
      if (!current || current.pointerId !== event.pointerId) return
      event.preventDefault()
      const end = canvasPoint(event.clientX, event.clientY)
      const clientEnd = { x: event.clientX, y: event.clientY }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      cancelDrawing()
      if (store.effectiveTool.value !== current.tool) return
      if (!isDrawingGestureLongEnough(current.clientStart, clientEnd)) return
      const component = createDrawnComponentSchema(
        current.tool,
        current.start,
        end,
        { width: pageWidthPx, height: pageHeightPx },
        event.shiftKey,
      )
      if (component) store.completeDrawnComponent(component, current.tool)
    },
    [cancelDrawing, canvasPoint, pageHeightPx, pageWidthPx, store],
  )

  const handleDrawPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (drawSessionRef.current?.pointerId !== event.pointerId) return
      cancelDrawing()
    },
    [cancelDrawing],
  )

  const handleContextMenu = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const editor = editorRef.current
      if (!editor) return
      contextPointRef.current = canvasPointFromClient(
        editor.getBoundingClientRect(),
        event.clientX,
        event.clientY,
        scale,
        { width: pageWidthPx, height: pageHeightPx },
      )
      const target = (event.target as Element).closest<HTMLElement>('[data-ptd-component-id]')
      const componentId = target?.dataset.ptdComponentId
      if (!componentId) {
        store.clearSelection()
        return
      }
      if (!store.selectedIds.value.includes(componentId)) store.selectComponent(componentId)
    },
    [pageHeightPx, pageWidthPx, scale, store],
  )

  const handleContextMenuKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (!((event.shiftKey && event.key === 'F10') || event.key === 'ContextMenu')) return
    event.preventDefault()
    const target = event.target instanceof HTMLElement ? event.target : event.currentTarget
    const rect = target.getBoundingClientRect()
    target.dispatchEvent(
      new globalThis.MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      }),
    )
  }, [])

  const handleMove = useCallback((isDownward: boolean, isRightward: boolean) => {
    editorLineRef.current?.showLines(isDownward, isRightward)
  }, [])

  const canvasStyle: CanvasVariables = {
    '--canvas-width': `${pageWidthPx}px`,
    '--canvas-height': `${pageHeightPx}px`,
    '--canvas-scaled-width': `${pageWidthPx * scale}px`,
    '--canvas-scaled-height': `${pageHeightPx * scale}px`,
    '--canvas-scale': String(scale),
    '--canvas-background': pageConfig.background,
    '--canvas-color': pageConfig.color,
    '--canvas-font-family': pageConfig.fontFamily,
    '--canvas-font-size': `${pageConfig.fontSize}px`,
    '--canvas-line-height': String(pageConfig.lineHeight),
    '--margin-top': `${mmToPx(pageConfig.pageMarginTop)}px`,
    '--margin-bottom': `${mmToPx(pageConfig.pageMarginBottom)}px`,
  }
  const area = store.areaSelection.value.style
  const previewGeometry: ShapeDrawGeometry | null = drawSession
    ? drawnComponentGeometry(
        drawSession.tool,
        drawSession.start,
        drawSession.end,
        { width: pageWidthPx, height: pageHeightPx },
        drawSession.constrain,
      )
    : null
  const previewStyle: ShapePreviewVariables | undefined = previewGeometry
    ? {
        '--preview-left': `${previewGeometry.left}px`,
        '--preview-top': `${previewGeometry.top}px`,
        '--preview-width': `${previewGeometry.width}px`,
        '--preview-height': `${previewGeometry.height}px`,
        '--preview-rotate': `${previewGeometry.rotate}deg`,
      }
    : undefined

  return (
    <div
      ref={wrapperRef}
      className={styles.canvasWrapper}
      style={canvasStyle}
      data-effective-tool={effectiveTool}
      data-panning={isPanning || undefined}
      onPointerDown={handlePanPointerDown}
      onPointerMove={handlePanPointerMove}
      onPointerUp={handlePanPointerEnd}
      onPointerCancel={handlePanPointerEnd}
      onLostPointerCapture={handlePanPointerEnd}
    >
      <div className={styles.canvasStage}>
        {store.showRuler.value && (
          <Ruler widthMm={pageWidthMm} heightMm={pageHeightMm} scale={scale} />
        )}
        <CanvasContextMenu
          onOpenInspector={onOpenInspector}
          onPasteAtContext={() =>
            store.pasteAt(contextPointRef.current.x, contextPointRef.current.y)
          }
        >
          <div
            ref={editorRef}
            id="ptd-designer-canvas"
            className={styles.canvas}
            data-ptd-region="paper"
            data-effective-tool={effectiveTool}
            aria-label="设计纸张"
            tabIndex={0}
            onContextMenu={handleContextMenu}
            onKeyDown={handleContextMenuKeyDown}
            onMouseDown={handleMouseDown}
            onPointerDown={handleDrawPointerDown}
            onPointerMove={handleDrawPointerMove}
            onPointerUp={handleDrawPointerUp}
            onPointerCancel={handleDrawPointerCancel}
            onLostPointerCapture={handleDrawPointerCancel}
          >
            {components.map((schema) => (
              <ComponentAdjuster
                key={schema.id}
                schema={schema}
                isActive={selectedIds.includes(schema.id)}
                isEditing={
                  store.editingComponentId.value === schema.id ||
                  store.editingTableCell.value?.componentId === schema.id
                }
                editorRef={editorRef}
                scale={scale}
                onMove={handleMove}
                onMoveEnd={() => editorLineRef.current?.hideLines()}
              >
                <ComponentRenderer schema={schema} />
              </ComponentAdjuster>
            ))}
            {previewGeometry && drawSession && (
              <div
                className={styles.drawPreview}
                data-tool={drawSession.tool}
                style={previewStyle}
                aria-hidden="true"
              />
            )}
            {store.isSelectingArea.value && <Area {...area} />}
            <EditorLine ref={editorLineRef} />
            <div className={`${styles.marginLine} ${styles.marginTop}`} />
            <div className={`${styles.marginLine} ${styles.marginBottom}`} />
          </div>
        </CanvasContextMenu>
      </div>
    </div>
  )
}
