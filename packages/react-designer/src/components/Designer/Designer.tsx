import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import type { TemplateSchema } from '@ptd/core'
import { createEditorStore, EditorStoreProvider } from '../../state'
import { isEditorInteractiveTarget, useEditorKeyboard } from '../../hooks/useEditorKeyboard'
import { useWorkspaceLayout } from '../../hooks/useWorkspaceLayout'
import { AppBar } from '../AppBar'
import { Canvas } from '../Canvas'
import { PropertyInspector } from '../PropertyInspector/PropertyInspector'
import { Sidebar } from '../Sidebar'
import { StatusBar } from '../StatusBar/StatusBar'
import { ptdThemeClass } from '../Theme'
import { Toolbar } from '../Toolbar/Toolbar'
import styles from './Designer.module.css'

type WorkspaceVariables = CSSProperties & Record<`--${string}`, string>

export interface DesignerProps {
  value: TemplateSchema
  onChange?: (value: TemplateSchema) => void
  onSave?: (value: TemplateSchema) => void
  onLoad?: () => TemplateSchema | Promise<TemplateSchema>
}

export function Designer({ value, onChange, onSave, onLoad }: DesignerProps) {
  const [store] = useState(() => createEditorStore(value, { onChange }))
  const rootRef = useRef<HTMLDivElement>(null)
  const layout = useWorkspaceLayout(rootRef)
  useEditorKeyboard(store, rootRef)

  useEffect(() => {
    store.setOnChange(onChange)
    store.syncExternal(value)
  }, [onChange, store, value])

  const workspaceStyle: WorkspaceVariables = {
    '--ptd-resource-panel-width': `${layout.resourceWidth}px`,
    '--ptd-inspector-width': `${layout.inspectorWidth}px`,
  }
  const overlayOpen = layout.mode === 'compact' && (layout.resourcesOpen || layout.inspectorOpen)

  return (
    <EditorStoreProvider store={store}>
      <div
        ref={rootRef}
        className={`${styles.designer} ${ptdThemeClass}`}
        data-ptd-region="designer"
        tabIndex={-1}
        onPointerDownCapture={(event: PointerEvent<HTMLDivElement>) => {
          if (!isEditorInteractiveTarget(event.target)) {
            rootRef.current?.focus({ preventScroll: true })
          }
        }}
      >
        <AppBar onSave={onSave} onLoad={onLoad} />
        <Toolbar
          resourcesOpen={layout.resourcesOpen}
          inspectorOpen={layout.inspectorOpen}
          onToggleResource={() => layout.toggleResource(layout.activeResource)}
          onToggleInspector={layout.toggleInspector}
        />
        <div
          className={styles.workspace}
          data-mode={layout.mode}
          data-resources-open={layout.resourcesOpen}
          data-inspector-open={layout.inspectorOpen}
          style={workspaceStyle}
        >
          <Sidebar
            mode={layout.mode}
            activePanel={layout.activeResource}
            open={layout.resourcesOpen}
            onTogglePanel={layout.toggleResource}
            onResizeStart={(event) => layout.beginResize('resources', event)}
          />
          <div className={styles.canvasArea}>
            <div className={styles.screens} data-ptd-region="canvas-viewport">
              <Canvas onOpenInspector={layout.openInspector} />
            </div>
          </div>
          <div className={styles.inspectorRegion} hidden={!layout.inspectorOpen}>
            <button
              type="button"
              className={`${styles.resizeHandle} ${styles.resizeInspector}`}
              aria-label="调整属性面板宽度"
              onPointerDown={(event) => layout.beginResize('inspector', event)}
            />
            <PropertyInspector />
          </div>
          {overlayOpen && (
            <button
              type="button"
              className={styles.overlayScrim}
              aria-label="关闭工作区面板"
              onClick={layout.closeOverlay}
            />
          )}
        </div>
        <StatusBar />
      </div>
    </EditorStoreProvider>
  )
}
