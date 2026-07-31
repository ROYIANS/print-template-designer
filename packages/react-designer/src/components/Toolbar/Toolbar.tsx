import type { ReactNode } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import * as Tooltip from '@radix-ui/react-tooltip'
import { formatMeasurement, getPageDimensions, mmToPx } from '@ptd/core'
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
  RiClipboardLine,
  RiContractLeftRightLine,
  RiContractUpDownLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiGroupLine,
  RiHand,
  RiLandscapeLine,
  RiLayoutLeftLine,
  RiLayoutRightLine,
  RiLockLine,
  RiLockUnlockLine,
  RiRuler2Line,
  RiSendBackward,
  RiSplitCellsHorizontal,
} from '@remixicon/react'
import type { Alignment, Distribution, GuideColor } from '../../state'
import { useEditorStore } from '../../state'
import { findAvailableCatalogItem } from '../../catalog'
import { ptdThemeClass } from '../Theme'
import { getToolGuidance, type ToolGuidance } from './toolGuidance'
import styles from './Toolbar.module.css'

interface ToolbarProps {
  resourcesOpen: boolean
  inspectorOpen: boolean
  onToggleResource: () => void
  onToggleInspector: () => void
}

interface ToolButtonProps {
  label: string
  shortcut?: string
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  pressed?: boolean
  danger?: boolean
  secondary?: boolean
}

const GUIDE_COLORS: Array<{ value: GuideColor; label: string }> = [
  { value: 'cobalt', label: '墨蓝参考线' },
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
  danger,
  secondary,
}: ToolButtonProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className={`${styles.toolButton} ${secondary ? styles.secondaryAction : ''}`}
          aria-label={label}
          aria-pressed={pressed}
          data-danger={danger || undefined}
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

function GuideColorButton({
  color,
  label,
  active,
}: {
  color: GuideColor
  label: string
  active: boolean
}) {
  const store = useEditorStore()
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
          onClick={() => store.setGuideColor(color)}
        >
          <span />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className={`${styles.tooltip} ${ptdThemeClass}`} sideOffset={7}>
          {label}
          <Tooltip.Arrow className={styles.tooltipArrow} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export function Toolbar({
  resourcesOpen,
  inspectorOpen,
  onToggleResource,
  onToggleInspector,
}: ToolbarProps) {
  useSignals()
  const store = useEditorStore()
  const selected = store.selectedComponents.value
  const selectedGuide = store.guides.value.find((guide) => guide.id === store.selectedGuideId.value)
  const toolGuidance = getToolGuidance(store.effectiveTool.value, store.temporaryHand.value)

  return (
    <Tooltip.Provider delayDuration={400} skipDelayDuration={120}>
      <nav className={styles.toolbar} aria-label="当前上下文命令" data-ptd-region="command-bar">
        <div className={styles.history} aria-label="历史">
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

        <div className={styles.context}>
          {toolGuidance ? (
            <ActiveToolContext guidance={toolGuidance} />
          ) : selectedGuide ? (
            <GuideContext />
          ) : selected.length > 1 ? (
            <MultiContext />
          ) : selected.length === 1 ? (
            <SingleContext />
          ) : (
            <PageContext />
          )}
        </div>

        <div className={styles.layoutTools} aria-label="工作区面板">
          <ToolButton
            label={resourcesOpen ? '收起资源面板' : '打开资源面板'}
            pressed={resourcesOpen}
            onClick={onToggleResource}
          >
            <RiLayoutLeftLine />
          </ToolButton>
          <ToolButton
            label={inspectorOpen ? '收起属性面板' : '打开属性面板'}
            pressed={inspectorOpen}
            onClick={onToggleInspector}
          >
            <RiLayoutRightLine />
          </ToolButton>
        </div>
      </nav>
    </Tooltip.Provider>
  )
}

function ActiveToolContext({ guidance }: { guidance: ToolGuidance }) {
  const item = guidance.tool === 'hand' ? null : findAvailableCatalogItem(guidance.tool)
  const Icon = item?.icon
  return (
    <>
      <ContextIdentity kind={guidance.kind} name={guidance.name} />
      <span className={styles.rule} />
      <div className={styles.toolGuidance} aria-label={`${guidance.name}操作提示`}>
        {Icon ? <Icon aria-hidden="true" /> : <RiHand aria-hidden="true" />}
        <strong>{guidance.instruction}</strong>
        {guidance.shiftHint && (
          <span>
            <kbd>Shift</kbd> {guidance.shiftHint}
          </span>
        )}
        {guidance.secondaryHint && (
          <span>
            <kbd>{guidance.secondaryHint.key}</kbd> {guidance.secondaryHint.label}
          </span>
        )}
        <span>
          <kbd>Esc</kbd> {guidance.escapeHint}
        </span>
      </div>
    </>
  )
}

function ContextIdentity({ kind, name }: { kind: string; name: string }) {
  return (
    <div className={styles.contextIdentity}>
      <span>{kind}</span>
      <strong className={styles.contextName}>{name}</strong>
    </div>
  )
}

function PageContext() {
  const store = useEditorStore()
  const page = store.pageConfig.value
  const dimensions = getPageDimensions(page)
  const unit = store.measurementUnit.value
  return (
    <>
      <ContextIdentity kind="PAGE" name={page.title || '未命名模板'} />
      <span className={styles.rule} />
      <div className={styles.group} aria-label="页面方向">
        <ToolButton
          label="纵向页面"
          pressed={page.pageDirection === 'p'}
          onClick={() => store.setPageDirection('p')}
        >
          <RiLandscapeLine className={styles.portraitIcon} />
        </ToolButton>
        <ToolButton
          label="横向页面"
          pressed={page.pageDirection === 'l'}
          onClick={() => store.setPageDirection('l')}
        >
          <RiLandscapeLine />
        </ToolButton>
      </div>
      <ToolButton
        label="显示或隐藏标尺"
        pressed={store.showRuler.value}
        onClick={() => store.toggleRuler()}
      >
        <RiRuler2Line />
      </ToolButton>
      {store.clipboard.value && (
        <ToolButton label="粘贴组件" shortcut="Ctrl V" onClick={() => store.paste()} secondary>
          <RiClipboardLine />
        </ToolButton>
      )}
      <span className={styles.pageMetric}>
        {formatMeasurement(dimensions.width, unit)} × {formatMeasurement(dimensions.height, unit)}{' '}
        {unit}
      </span>
    </>
  )
}

function SingleContext() {
  const store = useEditorStore()
  const component = store.primaryComponent.value!
  const locked = Boolean(component.isLock)
  const style = component.style
  return (
    <>
      <ContextIdentity kind={component.component} name={component.name || '未命名组件'} />
      <div className={styles.metrics} aria-label="组件几何">
        <Metric label="X" value={style.left} />
        <Metric label="Y" value={style.top} />
        <Metric label="W" value={style.width} />
        <Metric label="H" value={style.height} />
      </div>
      <span className={styles.rule} />
      <ToolButton label="复制组件" shortcut="Ctrl C" onClick={() => store.copy()}>
        <RiFileCopyLine />
      </ToolButton>
      <ToolButton
        label={locked ? '解锁组件' : '锁定组件'}
        pressed={locked}
        onClick={() => store.setLock(!locked)}
      >
        {locked ? <RiLockUnlockLine /> : <RiLockLine />}
      </ToolButton>
      <ToolButton
        label="下移一层"
        disabled={locked}
        onClick={() => store.moveLayer('backward')}
        secondary
      >
        <RiSendBackward />
      </ToolButton>
      <ToolButton
        label="上移一层"
        disabled={locked}
        onClick={() => store.moveLayer('forward')}
        secondary
      >
        <RiBringForward />
      </ToolButton>
      {component.component === 'RoyGroup' && (
        <ToolButton label="拆分组合" disabled={locked} onClick={() => store.ungroup()}>
          <RiSplitCellsHorizontal />
        </ToolButton>
      )}
      <ToolButton
        label="删除组件"
        shortcut="Delete"
        danger
        disabled={locked}
        onClick={() => store.deleteSelected()}
      >
        <RiDeleteBinLine />
      </ToolButton>
    </>
  )
}

function Metric({ label, value }: { label: string; value: unknown }) {
  const store = useEditorStore()
  const shown = typeof value === 'number' && Number.isFinite(value) ? value : 0
  return (
    <span className={styles.metric}>
      <small>{label}</small>
      {formatMeasurement(shown, store.measurementUnit.value)}
    </span>
  )
}

function MultiContext() {
  const store = useEditorStore()
  const selected = store.selectedComponents.value
  const locked = selected.some((component) => component.isLock)
  const alignments: Array<[Alignment, string, ReactNode]> = [
    ['left', '左对齐', <RiAlignItemLeftLine key="left" />],
    ['center', '水平居中', <RiAlignItemHorizontalCenterLine key="center" />],
    ['right', '右对齐', <RiAlignItemRightLine key="right" />],
    ['top', '顶部对齐', <RiAlignItemTopLine key="top" />],
    ['middle', '垂直居中', <RiAlignItemVerticalCenterLine key="middle" />],
    ['bottom', '底部对齐', <RiAlignItemBottomLine key="bottom" />],
  ]
  const distributions: Array<[Distribution, string, ReactNode]> = [
    ['horizontal', '水平等距分布', <RiContractLeftRightLine key="horizontal" />],
    ['vertical', '垂直等距分布', <RiContractUpDownLine key="vertical" />],
  ]
  return (
    <>
      <ContextIdentity kind="MULTI" name={`${selected.length} 个对象`} />
      <span className={styles.rule} />
      <div className={styles.group} aria-label="对齐">
        {alignments.map(([alignment, label, icon]) => (
          <ToolButton
            key={alignment}
            label={label}
            disabled={locked}
            onClick={() => store.align(alignment)}
          >
            {icon}
          </ToolButton>
        ))}
      </div>
      <div className={styles.group} aria-label="分布">
        {distributions.map(([direction, label, icon]) => (
          <ToolButton
            key={direction}
            label={label}
            disabled={locked || selected.length < 3}
            onClick={() => store.distribute(direction)}
            secondary
          >
            {icon}
          </ToolButton>
        ))}
      </div>
      <ToolButton
        label="组合所选对象"
        shortcut="Ctrl G"
        disabled={locked}
        onClick={() => store.group()}
      >
        <RiGroupLine />
      </ToolButton>
      <ToolButton
        label={`删除 ${selected.length} 个组件`}
        danger
        disabled={locked}
        onClick={() => store.deleteSelected()}
      >
        <RiDeleteBinLine />
      </ToolButton>
    </>
  )
}

function GuideContext() {
  const store = useEditorStore()
  const guide = store.guides.value.find((item) => item.id === store.selectedGuideId.value)!
  const unit = store.measurementUnit.value
  return (
    <>
      <ContextIdentity
        kind="GUIDE"
        name={`${guide.axis.toUpperCase()} ${formatMeasurement(mmToPx(guide.positionMm), unit)} ${unit}`}
      />
      <div className={styles.guideColors} aria-label="参考线颜色">
        {GUIDE_COLORS.map((item) => (
          <GuideColorButton
            key={item.value}
            color={item.value}
            label={item.label}
            active={guide.color === item.value}
          />
        ))}
      </div>
      <span className={styles.rule} />
      <ToolButton
        label={store.guidesLocked.value ? '解锁参考线' : '锁定参考线'}
        pressed={store.guidesLocked.value}
        onClick={() => store.toggleGuidesLocked()}
      >
        {store.guidesLocked.value ? <RiLockUnlockLine /> : <RiLockLine />}
      </ToolButton>
      <ToolButton
        label="删除参考线"
        shortcut="Delete"
        danger
        disabled={store.guidesLocked.value}
        onClick={() => store.removeSelectedGuide()}
      >
        <RiDeleteBinLine />
      </ToolButton>
    </>
  )
}
