import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { getPageDimensions, mmToPx } from '@ptd/core'
import { componentCatalog, createComponentSchema, PTD_COMPONENT_MIME } from '../../catalog'
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

export function Canvas({ onOpenInspector }: { onOpenInspector: () => void }) {
  useSignals()
  const store = useEditorStore()
  const editorRef = useRef<HTMLDivElement>(null)
  const editorLineRef = useRef<EditorLineHandle>(null)
  const selectionCleanupRef = useRef<(() => void) | null>(null)
  const contextPointRef = useRef<SelectionPoint>({ x: 0, y: 0 })

  const components = store.components.value
  const pageConfig = store.pageConfig.value
  const scale = store.scale.value
  const selectedIds = store.selectedIds.value
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

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const componentType =
        event.dataTransfer.getData(PTD_COMPONENT_MIME) ||
        event.dataTransfer.getData('componentType')
      const item = componentCatalogItem(componentType)
      const editor = editorRef.current
      if (!item || !editor) return
      const rect = editor.getBoundingClientRect()
      store.addComponent(
        createComponentSchema(
          item.type,
          {
            x: (event.clientX - rect.left) / scale,
            y: (event.clientY - rect.top) / scale,
          },
          { width: pageWidthPx, height: pageHeightPx },
        ),
      )
    },
    [pageHeightPx, pageWidthPx, scale, store],
  )

  const handleMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.button !== 0 || event.target !== event.currentTarget) return
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
    [pageHeightPx, pageWidthPx, scale, store],
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

  return (
    <div className={styles.canvasWrapper} style={canvasStyle}>
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
            aria-label="设计纸张"
            tabIndex={0}
            onContextMenu={handleContextMenu}
            onKeyDown={handleContextMenuKeyDown}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onMouseDown={handleMouseDown}
          >
            {components.map((schema) => (
              <ComponentAdjuster
                key={schema.id}
                schema={schema}
                isActive={selectedIds.includes(schema.id)}
                editorRef={editorRef}
                scale={scale}
                onMove={handleMove}
                onMoveEnd={() => editorLineRef.current?.hideLines()}
              >
                <ComponentRenderer schema={schema} />
              </ComponentAdjuster>
            ))}
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

function componentCatalogItem(type: string) {
  return componentCatalog.find((item) => item.type === type)
}
