import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { getPageDimensions, type ComponentSchema, type TemplateSchema } from '@ptd/core'
import { createEditorStore, EditorStoreProvider } from '../../state'
import { ComponentRenderer } from '../Canvas/ComponentRenderer'
import styles from './TemplatePreview.module.css'

type PreviewVariables = CSSProperties & Record<`--${string}`, string>

export interface TemplatePreviewProps {
  template: TemplateSchema
  pageIndex?: number
  label?: string
  className?: string
}

function componentVariables(component: ComponentSchema): PreviewVariables {
  return {
    '--preview-component-left': `${component.style.left}px`,
    '--preview-component-top': `${component.style.top}px`,
    '--preview-component-width': `${component.style.width}px`,
    '--preview-component-height': `${component.style.height}px`,
    '--preview-component-rotate': `${component.style.rotate ?? 0}deg`,
  }
}

export function TemplatePreview({
  template,
  pageIndex = 0,
  label = `${template.pageConfig.title} 模板预览`,
  className,
}: TemplatePreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [store] = useState(() => createEditorStore(template))
  const initialDimensions = getPageDimensions(template.pageConfig)
  const [viewportSize, setViewportSize] = useState(() => ({
    width: 320,
    height: (320 * initialDimensions.height) / initialDimensions.width,
  }))

  useEffect(() => {
    store.syncExternal(template)
  }, [store, template])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const updateSize = () => {
      const bounds = root.getBoundingClientRect()
      if (bounds.width > 0 && bounds.height > 0) {
        setViewportSize({ width: bounds.width, height: bounds.height })
      }
    }
    updateSize()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(updateSize)
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const safePageIndex = Math.min(Math.max(0, pageIndex), template.pages.length - 1)
  const page = template.pages[safePageIndex] ?? template.pages[0]
  const { width, height } = getPageDimensions(template.pageConfig)
  const scale = Math.min(viewportSize.width / width, viewportSize.height / height)
  const renderedWidth = width * scale
  const renderedHeight = height * scale
  const variables: PreviewVariables = {
    '--preview-page-width': `${width}px`,
    '--preview-page-height': `${height}px`,
    '--preview-page-scale': String(scale),
    '--preview-page-left': `${Math.max(0, (viewportSize.width - renderedWidth) / 2)}px`,
    '--preview-page-top': `${Math.max(0, (viewportSize.height - renderedHeight) / 2)}px`,
    '--preview-page-ratio': `${width} / ${height}`,
    '--preview-page-background': template.pageConfig.background,
    '--preview-page-color': template.pageConfig.color,
    '--preview-page-font-size': `${template.pageConfig.fontSize}px`,
    '--preview-page-font-family': template.pageConfig.fontFamily,
    '--preview-page-line-height': String(template.pageConfig.lineHeight),
  }

  return (
    <EditorStoreProvider store={store}>
      <div
        ref={rootRef}
        className={className ? `${styles.preview} ${className}` : styles.preview}
        style={variables}
        role="img"
        aria-label={label}
        data-ptd-region="template-preview"
      >
        <div className={styles.paper} aria-hidden="true">
          {page?.componentData.map((component) => (
            <div
              key={component.id}
              className={styles.component}
              style={componentVariables(component)}
            >
              <ComponentRenderer schema={component} />
            </div>
          ))}
        </div>
      </div>
    </EditorStoreProvider>
  )
}
