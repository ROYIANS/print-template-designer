import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { TemplateSchema } from '@ptd/core'
import { createEditorStore, EditorStoreProvider } from '../../state'
import { isEditableTarget, useEditorKeyboard } from '../../hooks/useEditorKeyboard'
import { AppBar } from '../AppBar'
import { Canvas } from '../Canvas'
import { PropertyInspector } from '../PropertyInspector/PropertyInspector'
import { Sidebar } from '../Sidebar'
import { StatusBar } from '../StatusBar/StatusBar'
import { ptdThemeClass } from '../Theme'
import { Toolbar } from '../Toolbar/Toolbar'
import styles from './Designer.module.css'

export interface DesignerProps {
  value: TemplateSchema
  onChange?: (value: TemplateSchema) => void
  onSave?: (value: TemplateSchema) => void
  onLoad?: () => TemplateSchema | Promise<TemplateSchema>
}

export function Designer({ value, onChange, onSave, onLoad }: DesignerProps) {
  const [store] = useState(() => createEditorStore(value, { onChange }))
  const rootRef = useRef<HTMLDivElement>(null)
  useEditorKeyboard(store, rootRef)

  useEffect(() => {
    store.setOnChange(onChange)
    store.syncExternal(value)
  }, [onChange, store, value])

  return (
    <EditorStoreProvider store={store}>
      <div
        ref={rootRef}
        className={`${styles.designer} ${ptdThemeClass}`}
        data-ptd-region="designer"
        tabIndex={-1}
        onPointerDownCapture={(event: PointerEvent<HTMLDivElement>) => {
          if (!isEditableTarget(event.target)) rootRef.current?.focus({ preventScroll: true })
        }}
      >
        <AppBar onSave={onSave} onLoad={onLoad} />
        <Toolbar />
        <div className={styles.workspace}>
          <Sidebar />
          <div className={styles.canvasArea}>
            <div className={styles.screens} data-ptd-region="canvas-viewport">
              <Canvas />
            </div>
          </div>
          <PropertyInspector />
        </div>
        <StatusBar />
      </div>
    </EditorStoreProvider>
  )
}
