import { useSignals } from '@preact/signals-react/runtime'
import { getPageDimensions, pxToMm } from '@ptd/core'
import { useEditorStore } from '../../state'
import styles from './StatusBar.module.css'

export function StatusBar() {
  useSignals()
  const store = useEditorStore()
  const page = getPageDimensions(store.pageConfig.value)
  const selectedCount = store.selectedIds.value.length
  return (
    <footer className={styles.status} aria-label="设计器状态" data-ptd-region="status-bar">
      <span>{selectedCount ? `已选择 ${selectedCount} 个对象` : '未选择对象'}</span>
      <span className={styles.divider} />
      <span>
        {pxToMm(page.width)} × {pxToMm(page.height)} mm
      </span>
      <span className={styles.grow} />
      <span>{Math.round(store.scale.value * 100)}%</span>
      <span className={styles.signal} aria-hidden="true" />
      <span>本地编辑</span>
    </footer>
  )
}
