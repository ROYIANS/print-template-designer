import { useCallback, useRef, type DragEvent, type MouseEvent } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import type { ComponentSchema, TemplateSchema } from '@ptd/core'
import { mmToPx, getPageDimensions } from '@ptd/core'
import {
  componentDataSignal,
  pageConfigSignal,
  scaleSignal,
  curComponentSignal,
  curComponentIndexSignal,
  isClickComponentSignal,
  areaDataSignal,
  isShowAreaSignal,
  addComponent,
} from '../../state'
import { recordSnapshot } from '../../state/snapshot'
import { generateId, getComponentRotatedStyle } from '../../utils'
import { ComponentAdjuster } from './ComponentAdjuster'
import { ComponentRenderer } from './ComponentRenderer'
import { Area } from './Area'
import { EditorLine, type EditorLineHandle } from './EditorLine'
import styles from './Canvas.module.css'

interface CanvasProps {
  onChange?: (value: TemplateSchema) => void
}

export function Canvas({ onChange }: CanvasProps) {
  useSignals()

  const editorRef = useRef<HTMLDivElement>(null)
  const editorLineRef = useRef<EditorLineHandle>(null)

  const componentData = componentDataSignal.value
  const pageConfig = pageConfigSignal.value
  const scale = scaleSignal.value
  const curComponent = curComponentSignal.value

  const { width: pageWidthPx, height: pageHeightPx } = getPageDimensions(pageConfig)
  const marginTopPx = mmToPx(pageConfig.pageMarginTop) * scale
  const marginBottomPx = mmToPx(pageConfig.pageMarginBottom) * scale

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const componentType = e.dataTransfer.getData('componentType') as ComponentSchema['component']
      if (!componentType) return

      const editorRect = editorRef.current!.getBoundingClientRect()
      const left = Math.round((e.clientX - editorRect.left) / scale)
      const top = Math.round((e.clientY - editorRect.top) / scale)

      const newSchema: ComponentSchema = {
        id: generateId(),
        component: componentType,
        name: componentType,
        propValue: '',
        style: {
          width: 100,
          height: 40,
          rotate: 0,
          opacity: 1,
          left,
          top,
        },
        groupStyle: {},
        position: {},
      }

      addComponent(newSchema, onChange)
      recordSnapshot()
    },
    [scale, onChange],
  )

  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isClickComponentSignal.value) {
        isClickComponentSignal.value = false
        return
      }

      // Click on empty canvas — deselect
      curComponentSignal.value = null
      curComponentIndexSignal.value = null

      const editorRect = editorRef.current!.getBoundingClientRect()
      const startX = e.clientX
      const startY = e.clientY
      const startLeft = (startX - editorRect.left) / scale
      const startTop = (startY - editorRect.top) / scale

      isShowAreaSignal.value = true
      areaDataSignal.value = {
        style: { left: startLeft, top: startTop, width: 0, height: 0 },
        components: [],
      }

      const move = (ev: globalThis.MouseEvent) => {
        const w = Math.abs((ev.clientX - startX) / scale)
        const h = Math.abs((ev.clientY - startY) / scale)
        const left = ev.clientX < startX ? (ev.clientX - editorRect.left) / scale : startLeft
        const top = ev.clientY < startY ? (ev.clientY - editorRect.top) / scale : startTop
        areaDataSignal.value = { ...areaDataSignal.value, style: { left, top, width: w, height: h } }
      }

      const up = (ev: globalThis.MouseEvent) => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)

        if (ev.clientX === startX && ev.clientY === startY) {
          isShowAreaSignal.value = false
          return
        }

        // Compute selected components
        const { style } = areaDataSignal.value
        const selected = componentData.filter((c) => {
          if (c.isLock) return false
          const cs = getComponentRotatedStyle(c.style)
          return (
            style.left <= cs.left &&
            style.top <= cs.top &&
            cs.left + cs.width <= style.left + style.width &&
            cs.top + cs.height <= style.top + style.height
          )
        })

        if (selected.length <= 1) {
          isShowAreaSignal.value = false
          areaDataSignal.value = { style: { left: 0, top: 0, width: 0, height: 0 }, components: [] }
          return
        }

        areaDataSignal.value = { ...areaDataSignal.value, components: selected }
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
    [scale, componentData],
  )

  const handleMove = useCallback(
    (isDownward: boolean, isRightward: boolean) => {
      editorLineRef.current?.showLines(isDownward, isRightward, componentData, curComponent, onChange)
    },
    [componentData, curComponent, onChange],
  )

  const handleMoveEnd = useCallback(() => {
    editorLineRef.current?.hideLines()
  }, [])

  const areaData = areaDataSignal.value
  const isShowArea = isShowAreaSignal.value

  return (
    <div className={styles.canvasWrapper}>
      <div
        ref={editorRef}
        id="ptd-designer-canvas"
        className={styles.canvas}
        style={{
          width: `${pageWidthPx}px`,
          height: `${pageHeightPx}px`,
          transform: `scale(${scale})`,
          transformOrigin: '50% 0',
          background: pageConfig.background,
          color: pageConfig.color,
          fontFamily: pageConfig.fontFamily,
          fontSize: `${pageConfig.fontSize}px`,
          lineHeight: String(pageConfig.lineHeight),
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseDown={handleMouseDown}
      >
        {componentData.map((schema, index) => (
          <ComponentAdjuster
            key={schema.id}
            schema={schema}
            index={index}
            isActive={schema.id === curComponent?.id}
            editorRef={editorRef}
            scale={scale}
            onChange={onChange}
            onMove={handleMove}
            onMoveEnd={handleMoveEnd}
          >
            <ComponentRenderer schema={schema} />
          </ComponentAdjuster>
        ))}

        {isShowArea && (
          <Area
            left={areaData.style.left}
            top={areaData.style.top}
            width={areaData.style.width}
            height={areaData.style.height}
          />
        )}

        <EditorLine ref={editorLineRef} />

        {/* Top margin line */}
        <div
          className={styles.marginLine}
          style={{ top: `${marginTopPx / scale}px` }}
        />
        {/* Bottom margin line */}
        <div
          className={styles.marginLine}
          style={{ bottom: `${marginBottomPx / scale}px` }}
        />
      </div>
    </div>
  )
}
