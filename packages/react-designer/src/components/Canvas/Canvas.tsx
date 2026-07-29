import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type DragEvent,
  type MouseEvent,
} from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import type { ComponentSchema } from '@ptd/core'
import { defaultRegistry, getPageDimensions, mmToPx } from '@ptd/core'
import { useEditorStore } from '../../state'
import { generateId, getComponentRotatedStyle } from '../../utils'
import { Area } from './Area'
import { ComponentAdjuster } from './ComponentAdjuster'
import { ComponentRenderer } from './ComponentRenderer'
import { EditorLine, type EditorLineHandle } from './EditorLine'
import styles from './Canvas.module.css'

type CanvasVariables = CSSProperties & Record<`--${string}`, string>

export function Canvas() {
  useSignals()
  const store = useEditorStore()
  const editorRef = useRef<HTMLDivElement>(null)
  const editorLineRef = useRef<EditorLineHandle>(null)
  const selectionCleanupRef = useRef<(() => void) | null>(null)

  const components = store.components.value
  const pageConfig = store.pageConfig.value
  const scale = store.scale.value
  const selectedIds = store.selectedIds.value
  const { width: pageWidthPx, height: pageHeightPx } = getPageDimensions(pageConfig)

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
      const componentType = event.dataTransfer.getData(
        'componentType',
      ) as ComponentSchema['component']
      const definition = defaultRegistry.get(componentType)
      const editor = editorRef.current
      if (!definition || !editor) return
      const rect = editor.getBoundingClientRect()
      const schema: ComponentSchema = {
        id: generateId(),
        component: definition.type,
        name: definition.name,
        propValue: cloneValue(definition.defaultProps),
        style: {
          width: 100,
          height: 40,
          rotate: 0,
          opacity: 1,
          ...definition.defaultStyle,
          left: Math.round((event.clientX - rect.left) / scale),
          top: Math.round((event.clientY - rect.top) / scale),
        },
        groupStyle: {},
        position: {},
      }
      store.addComponent(schema)
    },
    [scale, store],
  )

  const handleMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return
      const editor = editorRef.current
      if (!editor) return
      store.clearSelection()
      const rect = editor.getBoundingClientRect()
      const startX = event.clientX
      const startY = event.clientY
      const startLeft = (startX - rect.left) / scale
      const startTop = (startY - rect.top) / scale
      store.startAreaSelection(startLeft, startTop)

      const cleanup = () => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
        window.removeEventListener('blur', cancel)
        selectionCleanupRef.current = null
      }
      const move = (nextEvent: globalThis.MouseEvent) => {
        const width = Math.abs((nextEvent.clientX - startX) / scale)
        const height = Math.abs((nextEvent.clientY - startY) / scale)
        const left =
          nextEvent.clientX < startX ? (nextEvent.clientX - rect.left) / scale : startLeft
        const top = nextEvent.clientY < startY ? (nextEvent.clientY - rect.top) / scale : startTop
        store.updateAreaSelection({ left, top, width, height })
      }
      const up = () => {
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
    },
    [scale, store],
  )

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
        <div
          ref={editorRef}
          id="ptd-designer-canvas"
          className={styles.canvas}
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
      </div>
    </div>
  )
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
