import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import type { RenderContext, TemplateSchema } from '@ptd/core'
import { useDesignerHostCommands, type DesignerHost } from '../../host'
import { createEditorStore, EditorStoreProvider } from '../../state'
import { isEditorInteractiveTarget, useEditorKeyboard } from '../../hooks/useEditorKeyboard'
import { useWorkspaceLayout } from '../../hooks/useWorkspaceLayout'
import { AppBar } from '../AppBar'
import { Canvas } from '../Canvas'
import { FloatingToolDock } from '../FloatingToolDock'
import { PropertyInspector } from '../PropertyInspector/PropertyInspector'
import { Sidebar } from '../Sidebar'
import { StatusBar } from '../StatusBar/StatusBar'
import { ptdThemeClass } from '../Theme'
import styles from './Designer.module.css'

type WorkspaceVariables = CSSProperties & Record<`--${string}`, string>

export interface DesignerProps {
  value: TemplateSchema
  onChange?: (value: TemplateSchema) => void
  host?: DesignerHost
  renderContext?: RenderContext
}

export function Designer({ value, onChange, host, renderContext }: DesignerProps) {
  const [store] = useState(() => createEditorStore(value, { onChange, renderContext }))
  const rootRef = useRef<HTMLDivElement>(null)
  const layout = useWorkspaceLayout(rootRef)
  const getTemplate = useCallback(() => store.template.value, [store])
  const hostCommands = useDesignerHostCommands(host, getTemplate)
  const keyboardActions = useMemo(
    () => ({
      hostCommands,
      openResource: layout.openResource,
      toggleInspector: layout.toggleInspector,
    }),
    [hostCommands, layout.openResource, layout.toggleInspector],
  )
  useEditorKeyboard(store, rootRef, keyboardActions)

  useEffect(() => {
    store.setOnChange(onChange)
    store.syncExternal(value)
    store.setHostRenderContext(renderContext)
  }, [onChange, renderContext, store, value])

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
        <AppBar
          hostCommands={hostCommands}
          workspace={{ openResource: layout.openResource, openInspector: layout.openInspector }}
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
            <FloatingToolDock
              mode={layout.mode}
              inspectorOpen={layout.inspectorOpen}
              onToggleInspector={layout.toggleInspector}
            />
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
        <StatusBar document={hostCommands.document} />
      </div>
    </EditorStoreProvider>
  )
}
