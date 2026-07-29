import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { TemplateSchema } from '@ptd/core'
import { createEditorStore, EditorStoreProvider } from '../../state'
import { isEditableTarget, useEditorKeyboard } from '../../hooks/useEditorKeyboard'
import { Canvas } from '../Canvas'
import { PropertyInspector } from '../PropertyInspector/PropertyInspector'
import { StatusBar } from '../StatusBar/StatusBar'
import { Toolbar } from '../Toolbar/Toolbar'
import styles from './Designer.module.css'

export interface DesignerProps {
  value: TemplateSchema
  onChange?: (value: TemplateSchema) => void
  onSave?: (value: TemplateSchema) => void
  onLoad?: () => TemplateSchema | Promise<TemplateSchema>
}

export function Designer({ value, onChange }: DesignerProps) {
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
        className={styles.designer}
        tabIndex={-1}
        onPointerDownCapture={(event: PointerEvent<HTMLDivElement>) => {
          if (!isEditableTarget(event.target)) rootRef.current?.focus({ preventScroll: true })
        }}
      >
        <Toolbar />
        <div className={styles.workspace}>
          <div className={styles.canvasArea}>
            <div className={styles.screens}>
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
