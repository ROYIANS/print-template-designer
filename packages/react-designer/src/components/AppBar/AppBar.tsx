import { useState } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { getPageDimensions, pxToMm, type TemplateSchema } from '@ptd/core'
import { RiDownload2Line, RiSave3Line } from '@remixicon/react'
import { useEditorStore } from '../../state'
import styles from './AppBar.module.css'

interface AppBarProps {
  onSave?: (value: TemplateSchema) => void
  onLoad?: () => TemplateSchema | Promise<TemplateSchema>
}

export function AppBar({ onSave, onLoad }: AppBarProps) {
  useSignals()
  const store = useEditorStore()
  const [isLoading, setIsLoading] = useState(false)
  const pageConfig = store.pageConfig.value
  const page = getPageDimensions(pageConfig)

  const load = async () => {
    if (!onLoad || isLoading) return
    setIsLoading(true)
    try {
      store.syncExternal(await onLoad())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <header className={styles.appBar} data-ptd-region="app-bar">
      <div className={styles.brand} aria-label="Print Template Designer">
        <span className={styles.legacyLogo} aria-hidden="true" />
        <span className={styles.wordmark}>PTD</span>
        <span className={styles.productName}>打印模板设计器</span>
      </div>
      <div className={styles.document}>
        <strong>{pageConfig.title || '未命名模板'}</strong>
        <span>
          {pageConfig.pageSize} · {pageConfig.pageDirection === 'p' ? '纵向' : '横向'} ·{' '}
          {pxToMm(page.width)} × {pxToMm(page.height)} mm
        </span>
      </div>
      <div className={styles.actions}>
        {onLoad && (
          <button type="button" className={styles.quietAction} disabled={isLoading} onClick={load}>
            <RiDownload2Line aria-hidden="true" />
            {isLoading ? '正在载入' : '载入模板'}
          </button>
        )}
        {onSave && (
          <button
            type="button"
            className={styles.primaryAction}
            onClick={() => onSave(store.template.value)}
          >
            <RiSave3Line aria-hidden="true" />
            保存模板
          </button>
        )}
      </div>
    </header>
  )
}
