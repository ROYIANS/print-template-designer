import { useSignals } from '@preact/signals-react/runtime'
import { getPageDimensions, pxToMm } from '@ptd/core'
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLockLine,
  RiPagesLine,
  RiZoomInLine,
  RiZoomOutLine,
} from '@remixicon/react'
import { useEditorStore } from '../../state'
import styles from './StatusBar.module.css'

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]

export function StatusBar() {
  useSignals()
  const store = useEditorStore()
  const page = getPageDimensions(store.pageConfig.value)
  const selectedCount = store.selectedIds.value.length
  const guideCount = store.guides.value.length
  const pageNumber = store.currentPageIndex.value + 1
  const pageCount = store.template.value.pages.length
  const scale = store.scale.value

  return (
    <footer className={styles.status} aria-label="设计器状态" data-ptd-region="status-bar">
      <div className={styles.statusGroup} aria-label="文档状态">
        <span className={styles.pageStatus}>
          <RiPagesLine aria-hidden="true" />
          {pageNumber} / {pageCount}
        </span>
        <span className={styles.divider} aria-hidden="true" />
        <span>{selectedCount ? `已选择 ${selectedCount} 个对象` : '未选择对象'}</span>
        <span className={styles.divider} aria-hidden="true" />
        <span className={styles.pageMetric}>
          {pxToMm(page.width)} × {pxToMm(page.height)} mm
        </span>
      </div>

      <div className={styles.statusGroup} aria-label="参考线状态">
        <button
          type="button"
          className={styles.guideStatus}
          aria-label={store.guidesVisible.value ? '隐藏参考线' : '显示参考线'}
          aria-pressed={store.guidesVisible.value}
          onClick={() => store.toggleGuidesVisible()}
        >
          {store.guidesVisible.value ? (
            <RiEyeLine aria-hidden="true" />
          ) : (
            <RiEyeOffLine aria-hidden="true" />
          )}
          参考线 {guideCount}
          {store.guidesLocked.value && (
            <RiLockLine className={styles.lockIcon} aria-label="已锁定" />
          )}
        </button>
      </div>

      <span className={styles.grow} />

      <div className={styles.zoom} aria-label="画布缩放">
        <button
          type="button"
          aria-label="缩小画布"
          disabled={scale <= 0.25}
          onClick={() => store.setZoom(scale - 0.25)}
        >
          <RiZoomOutLine aria-hidden="true" />
        </button>
        <label>
          <span className={styles.visuallyHidden}>缩放比例</span>
          <select value={scale} onChange={(event) => store.setZoom(Number(event.target.value))}>
            {ZOOM_LEVELS.map((level) => (
              <option key={level} value={level}>
                {Math.round(level * 100)}%
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          aria-label="放大画布"
          disabled={scale >= 2}
          onClick={() => store.setZoom(scale + 0.25)}
        >
          <RiZoomInLine aria-hidden="true" />
        </button>
      </div>
    </footer>
  )
}
