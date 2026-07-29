import type { ReactNode } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import * as Separator from '@radix-ui/react-separator'
import * as Tooltip from '@radix-ui/react-tooltip'
import type { Alignment, Distribution, LayerAction } from '../../state'
import { useEditorStore } from '../../state'
import styles from './Toolbar.module.css'

interface ToolButtonProps {
  label: string
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  pressed?: boolean
}

function ToolButton({ label, children, onClick, disabled = false, pressed }: ToolButtonProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className={styles.toolButton}
          aria-label={label}
          aria-pressed={pressed}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className={styles.tooltip} sideOffset={7}>
          {label}
          <Tooltip.Arrow className={styles.tooltipArrow} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

function ToolSeparator() {
  return <Separator.Root className={styles.separator} orientation="vertical" decorative />
}

export function Toolbar() {
  useSignals()
  const store = useEditorStore()
  const selected = store.selectedComponents.value
  const selectedCount = selected.length
  const hasLocked = selected.some((component) => component.isLock)
  const canModify = selectedCount > 0 && !hasLocked
  const canAlign = selectedCount >= 2 && !hasLocked
  const canDistribute = selectedCount >= 3 && !hasLocked
  const canUngroup = Boolean(store.primaryComponent.value?.component === 'RoyGroup') && !hasLocked

  const align = (value: Alignment) => () => store.align(value)
  const distribute = (value: Distribution) => () => store.distribute(value)
  const layer = (value: LayerAction) => () => store.moveLayer(value)

  return (
    <Tooltip.Provider delayDuration={450} skipDelayDuration={150}>
      <header className={styles.toolbar} aria-label="模板编辑工具栏">
        <div className={styles.identity}>
          <span className={styles.productMark}>PT</span>
          <span className={styles.documentTitle}>
            {store.pageConfig.value.title || '未命名模板'}
          </span>
        </div>

        <nav className={styles.commandStrip} aria-label="编辑命令">
          <div className={styles.group}>
            <ToolButton label="撤销" onClick={() => store.undo()} disabled={!store.canUndo.value}>
              ↶
            </ToolButton>
            <ToolButton label="重做" onClick={() => store.redo()} disabled={!store.canRedo.value}>
              ↷
            </ToolButton>
          </div>
          <ToolSeparator />
          <div className={styles.group}>
            <ToolButton label="复制" onClick={() => store.copy()} disabled={selectedCount === 0}>
              复制
            </ToolButton>
            <ToolButton label="剪切" onClick={() => store.cut()} disabled={!canModify}>
              剪切
            </ToolButton>
            <ToolButton
              label="粘贴"
              onClick={() => store.paste()}
              disabled={!store.clipboard.value}
            >
              粘贴
            </ToolButton>
            <ToolButton label="删除" onClick={() => store.deleteSelected()} disabled={!canModify}>
              删除
            </ToolButton>
          </div>
          <ToolSeparator />
          <div className={styles.group}>
            <ToolButton
              label={hasLocked ? '解锁所选组件' : '锁定所选组件'}
              onClick={() => store.setLock(!hasLocked)}
              disabled={selectedCount === 0}
              pressed={hasLocked}
            >
              {hasLocked ? '解锁' : '锁定'}
            </ToolButton>
            <ToolButton label="下移一层" onClick={layer('backward')} disabled={!canModify}>
              下移
            </ToolButton>
            <ToolButton label="上移一层" onClick={layer('forward')} disabled={!canModify}>
              上移
            </ToolButton>
            <ToolButton label="置于底层" onClick={layer('back')} disabled={!canModify}>
              置底
            </ToolButton>
            <ToolButton label="置于顶层" onClick={layer('front')} disabled={!canModify}>
              置顶
            </ToolButton>
          </div>
          <ToolSeparator />
          <div className={styles.group}>
            <ToolButton label="左对齐" onClick={align('left')} disabled={!canAlign}>
              左齐
            </ToolButton>
            <ToolButton label="水平居中" onClick={align('center')} disabled={!canAlign}>
              中齐
            </ToolButton>
            <ToolButton label="右对齐" onClick={align('right')} disabled={!canAlign}>
              右齐
            </ToolButton>
            <ToolButton label="顶部对齐" onClick={align('top')} disabled={!canAlign}>
              顶齐
            </ToolButton>
            <ToolButton label="垂直居中" onClick={align('middle')} disabled={!canAlign}>
              中线
            </ToolButton>
            <ToolButton label="底部对齐" onClick={align('bottom')} disabled={!canAlign}>
              底齐
            </ToolButton>
            <ToolButton
              label="水平等距分布"
              onClick={distribute('horizontal')}
              disabled={!canDistribute}
            >
              横分
            </ToolButton>
            <ToolButton
              label="垂直等距分布"
              onClick={distribute('vertical')}
              disabled={!canDistribute}
            >
              纵分
            </ToolButton>
          </div>
          <ToolSeparator />
          <div className={styles.group}>
            <ToolButton label="组合所选组件" onClick={() => store.group()} disabled={!canAlign}>
              组合
            </ToolButton>
            <ToolButton label="拆分组合" onClick={() => store.ungroup()} disabled={!canUngroup}>
              拆分
            </ToolButton>
          </div>
        </nav>

        <div className={styles.viewStrip}>
          <div className={styles.segmented} aria-label="页面方向">
            <ToolButton
              label="纵向页面"
              onClick={() => store.setPageDirection('p')}
              pressed={store.pageConfig.value.pageDirection === 'p'}
            >
              纵
            </ToolButton>
            <ToolButton
              label="横向页面"
              onClick={() => store.setPageDirection('l')}
              pressed={store.pageConfig.value.pageDirection === 'l'}
            >
              横
            </ToolButton>
          </div>
          <ToolButton
            label="显示或隐藏标尺"
            onClick={() => store.toggleRuler()}
            pressed={store.showRuler.value}
          >
            标尺
          </ToolButton>
          <label className={styles.zoomLabel}>
            <span className={styles.visuallyHidden}>画布缩放</span>
            <select
              value={store.scale.value}
              onChange={(event) => store.setZoom(Number(event.target.value))}
            >
              <option value={0.5}>50%</option>
              <option value={0.75}>75%</option>
              <option value={1}>100%</option>
              <option value={1.25}>125%</option>
              <option value={1.5}>150%</option>
              <option value={2}>200%</option>
            </select>
          </label>
        </div>
      </header>
    </Tooltip.Provider>
  )
}
