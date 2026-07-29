import type { ReactNode } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import * as Separator from '@radix-ui/react-separator'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  RiAlignItemBottomLine,
  RiAlignItemHorizontalCenterLine,
  RiAlignItemLeftLine,
  RiAlignItemRightLine,
  RiAlignItemTopLine,
  RiAlignItemVerticalCenterLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiBringForward,
  RiBringToFront,
  RiClipboardLine,
  RiContractLeftRightLine,
  RiContractUpDownLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiEyeOffLine,
  RiFileCopyLine,
  RiGroupLine,
  RiLandscapeLine,
  RiLockLine,
  RiLockUnlockLine,
  RiRuler2Line,
  RiScissorsLine,
  RiSendBackward,
  RiSendToBack,
  RiSplitCellsHorizontal,
  RiZoomInLine,
  RiZoomOutLine,
} from '@remixicon/react'
import type { Alignment, Distribution, GuideColor, LayerAction } from '../../state'
import { useEditorStore } from '../../state'
import { ptdThemeClass } from '../Theme'
import styles from './Toolbar.module.css'

interface ToolButtonProps {
  label: string
  shortcut?: string
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  pressed?: boolean
}

const GUIDE_COLORS: Array<{ value: GuideColor; label: string }> = [
  { value: 'cobalt', label: '钴蓝参考线' },
  { value: 'vermilion', label: '朱红参考线' },
  { value: 'emerald', label: '翠绿参考线' },
  { value: 'amber', label: '琥珀参考线' },
]

function ToolButton({
  label,
  shortcut,
  children,
  onClick,
  disabled = false,
  pressed,
}: ToolButtonProps) {
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
        <Tooltip.Content className={`${styles.tooltip} ${ptdThemeClass}`} sideOffset={7}>
          <span>{label}</span>
          {shortcut && <kbd>{shortcut}</kbd>}
          <Tooltip.Arrow className={styles.tooltipArrow} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

function ToolSeparator() {
  return <Separator.Root className={styles.separator} orientation="vertical" decorative />
}

function GuideColorButton({
  color,
  label,
  active,
  onClick,
}: {
  color: GuideColor
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className={styles.guideColor}
          data-color={color}
          data-active={active || undefined}
          aria-label={label}
          aria-pressed={active}
          onClick={onClick}
        >
          <span />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className={`${styles.tooltip} ${ptdThemeClass}`} sideOffset={7}>
          <span>{label}</span>
          <Tooltip.Arrow className={styles.tooltipArrow} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
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
  const hasGuides = store.guides.value.length > 0
  const align = (value: Alignment) => () => store.align(value)
  const distribute = (value: Distribution) => () => store.distribute(value)
  const layer = (value: LayerAction) => () => store.moveLayer(value)

  return (
    <Tooltip.Provider delayDuration={450} skipDelayDuration={150}>
      <nav className={styles.toolbar} aria-label="模板编辑命令" data-ptd-region="command-bar">
        <div className={styles.commands}>
          <div className={styles.group} aria-label="历史">
            <ToolButton
              label="撤销"
              shortcut="Ctrl Z"
              onClick={() => store.undo()}
              disabled={!store.canUndo.value}
            >
              <RiArrowGoBackLine />
            </ToolButton>
            <ToolButton
              label="重做"
              shortcut="Ctrl Y"
              onClick={() => store.redo()}
              disabled={!store.canRedo.value}
            >
              <RiArrowGoForwardLine />
            </ToolButton>
          </div>
          <ToolSeparator />
          <div className={styles.group} aria-label="剪贴板">
            <ToolButton
              label="复制"
              shortcut="Ctrl C"
              onClick={() => store.copy()}
              disabled={selectedCount === 0}
            >
              <RiFileCopyLine />
            </ToolButton>
            <ToolButton
              label="剪切"
              shortcut="Ctrl X"
              onClick={() => store.cut()}
              disabled={!canModify}
            >
              <RiScissorsLine />
            </ToolButton>
            <ToolButton
              label="粘贴"
              shortcut="Ctrl V"
              onClick={() => store.paste()}
              disabled={!store.clipboard.value}
            >
              <RiClipboardLine />
            </ToolButton>
            <ToolButton
              label={`删除${selectedCount > 1 ? ` ${selectedCount} 个组件` : '组件'}`}
              shortcut="Delete"
              onClick={() => store.deleteSelected()}
              disabled={!canModify}
            >
              <RiDeleteBinLine />
            </ToolButton>
          </div>
          <ToolSeparator />
          <div className={styles.group} aria-label="层级与锁定">
            <ToolButton
              label={hasLocked ? '解锁所选组件' : '锁定所选组件'}
              onClick={() => store.setLock(!hasLocked)}
              disabled={selectedCount === 0}
              pressed={hasLocked}
            >
              {hasLocked ? <RiLockUnlockLine /> : <RiLockLine />}
            </ToolButton>
            <ToolButton label="下移一层" onClick={layer('backward')} disabled={!canModify}>
              <RiSendBackward />
            </ToolButton>
            <ToolButton label="上移一层" onClick={layer('forward')} disabled={!canModify}>
              <RiBringForward />
            </ToolButton>
            <ToolButton label="置于底层" onClick={layer('back')} disabled={!canModify}>
              <RiSendToBack />
            </ToolButton>
            <ToolButton label="置于顶层" onClick={layer('front')} disabled={!canModify}>
              <RiBringToFront />
            </ToolButton>
          </div>
          <ToolSeparator />
          <div className={styles.group} aria-label="对齐与分布">
            <ToolButton label="左对齐" onClick={align('left')} disabled={!canAlign}>
              <RiAlignItemLeftLine />
            </ToolButton>
            <ToolButton label="水平居中" onClick={align('center')} disabled={!canAlign}>
              <RiAlignItemHorizontalCenterLine />
            </ToolButton>
            <ToolButton label="右对齐" onClick={align('right')} disabled={!canAlign}>
              <RiAlignItemRightLine />
            </ToolButton>
            <ToolButton label="顶部对齐" onClick={align('top')} disabled={!canAlign}>
              <RiAlignItemTopLine />
            </ToolButton>
            <ToolButton label="垂直居中" onClick={align('middle')} disabled={!canAlign}>
              <RiAlignItemVerticalCenterLine />
            </ToolButton>
            <ToolButton label="底部对齐" onClick={align('bottom')} disabled={!canAlign}>
              <RiAlignItemBottomLine />
            </ToolButton>
            <ToolButton
              label="水平等距分布"
              onClick={distribute('horizontal')}
              disabled={!canDistribute}
            >
              <RiContractLeftRightLine />
            </ToolButton>
            <ToolButton
              label="垂直等距分布"
              onClick={distribute('vertical')}
              disabled={!canDistribute}
            >
              <RiContractUpDownLine />
            </ToolButton>
          </div>
          <ToolSeparator />
          <div className={styles.group} aria-label="组合">
            <ToolButton
              label="组合所选组件"
              shortcut="Ctrl G"
              onClick={() => store.group()}
              disabled={!canAlign}
            >
              <RiGroupLine />
            </ToolButton>
            <ToolButton
              label="拆分组合"
              shortcut="Ctrl Shift G"
              onClick={() => store.ungroup()}
              disabled={!canUngroup}
            >
              <RiSplitCellsHorizontal />
            </ToolButton>
          </div>
        </div>

        <div className={styles.viewStrip}>
          <div className={styles.direction} aria-label="页面方向">
            <ToolButton
              label="纵向页面"
              onClick={() => store.setPageDirection('p')}
              pressed={store.pageConfig.value.pageDirection === 'p'}
            >
              <RiLandscapeLine className={styles.portraitIcon} />
            </ToolButton>
            <ToolButton
              label="横向页面"
              onClick={() => store.setPageDirection('l')}
              pressed={store.pageConfig.value.pageDirection === 'l'}
            >
              <RiLandscapeLine />
            </ToolButton>
          </div>
          <ToolButton
            label="显示或隐藏标尺"
            onClick={() => store.toggleRuler()}
            pressed={store.showRuler.value}
          >
            <RiRuler2Line />
          </ToolButton>
          <div className={styles.guideTools} aria-label="参考线设置">
            <div className={styles.guideColors} aria-label="参考线颜色">
              {GUIDE_COLORS.map((item) => (
                <GuideColorButton
                  key={item.value}
                  color={item.value}
                  label={item.label}
                  active={store.activeGuideColor.value === item.value}
                  onClick={() => store.setGuideColor(item.value)}
                />
              ))}
            </div>
            <ToolButton
              label={store.guidesVisible.value ? '隐藏参考线' : '显示参考线'}
              onClick={() => store.toggleGuidesVisible()}
              disabled={!hasGuides}
              pressed={store.guidesVisible.value && hasGuides}
            >
              {store.guidesVisible.value ? <RiEyeLine /> : <RiEyeOffLine />}
            </ToolButton>
            <ToolButton
              label={store.guidesLocked.value ? '解锁参考线' : '锁定参考线'}
              onClick={() => store.toggleGuidesLocked()}
              disabled={!hasGuides}
              pressed={store.guidesLocked.value}
            >
              {store.guidesLocked.value ? <RiLockUnlockLine /> : <RiLockLine />}
            </ToolButton>
            <ToolButton
              label="清空参考线"
              onClick={() => store.clearGuides()}
              disabled={!hasGuides || store.guidesLocked.value}
            >
              <RiDeleteBinLine />
            </ToolButton>
          </div>
          <ToolButton
            label="缩小画布"
            shortcut="Ctrl -"
            onClick={() => store.setZoom(store.scale.value - 0.25)}
          >
            <RiZoomOutLine />
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
          <ToolButton
            label="放大画布"
            shortcut="Ctrl +"
            onClick={() => store.setZoom(store.scale.value + 0.25)}
          >
            <RiZoomInLine />
          </ToolButton>
        </div>
      </nav>
    </Tooltip.Provider>
  )
}
