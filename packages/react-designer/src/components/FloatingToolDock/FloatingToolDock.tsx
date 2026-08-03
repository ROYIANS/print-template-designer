import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  RiArrowDownSLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiCursorLine,
  RiHand,
  RiLayoutRightLine,
  RiMore2Line,
} from '@remixicon/react'
import {
  findAvailableCatalogItem,
  isDrawnComponentType,
  isDrawingComponentType,
  rememberRecentComponentType,
  type AvailableCatalogItem,
  type CreatableComponentType,
} from '../../catalog'
import type { WorkspaceMode } from '../../hooks/useWorkspaceLayout'
import { useEditorStore } from '../../state'
import { ComponentToolPicker } from '../Sidebar/ComponentToolPicker'
import { ptdThemeClass } from '../Theme'
import { Toolbar } from '../Toolbar/Toolbar'
import styles from './FloatingToolDock.module.css'

interface FloatingToolDockProps {
  mode: WorkspaceMode
  inspectorOpen: boolean
  onToggleInspector: () => void
}

interface DockButtonProps {
  label: string
  children: ReactNode
  onClick: () => void
  buttonRef?: Ref<HTMLButtonElement>
  shortcut?: string
  disabled?: boolean
  pressed?: boolean
  expanded?: boolean
  controls?: string
  popupKind?: 'menu' | 'dialog'
  detailActive?: boolean
  compactOptional?: boolean
  className?: string
}

const DOCK_COMPONENT_TOOL_TYPES = [
  'RoyImage',
  'RoySimpleTable',
] satisfies readonly CreatableComponentType[]

const DRAW_TOOL_TYPES = [
  'RoyLine',
  'RoyRect',
  'RoyCircle',
  'RoyStar',
] satisfies readonly CreatableComponentType[]

const TEXT_TOOL_TYPES = [
  'RoySimpleText',
  'RoyText',
] as const satisfies readonly CreatableComponentType[]
type TextToolType = (typeof TEXT_TOOL_TYPES)[number]

function isTextToolType(type: string): type is TextToolType {
  return type === 'RoySimpleText' || type === 'RoyText'
}

export function FloatingToolDock({
  mode,
  inspectorOpen,
  onToggleInspector,
}: FloatingToolDockProps) {
  useSignals()
  const store = useEditorStore()
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const pickerId = useId()
  const [lastTextTool, setLastTextTool] = useState<TextToolType>('RoySimpleText')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [recentTypes, setRecentTypes] = useState<readonly CreatableComponentType[]>([])
  const activeTool = store.activeTool.value
  const effectiveTool = store.effectiveTool.value
  const textTools = TEXT_TOOL_TYPES.map(findAvailableCatalogItem).filter(
    (item): item is AvailableCatalogItem => Boolean(item),
  )
  const dockComponentTools = DOCK_COMPONENT_TOOL_TYPES.map(findAvailableCatalogItem).filter(
    (item): item is AvailableCatalogItem => Boolean(item),
  )
  const pickerDetailActive =
    activeTool === 'RoyQRCode' ||
    activeTool === 'RoyBarCode' ||
    (mode === 'compact' && (activeTool === 'RoyImage' || activeTool === 'RoySimpleTable'))

  const activate = (item: AvailableCatalogItem, remember = false) => {
    if (!isDrawnComponentType(item.type)) return
    store.setActiveTool(item.type)
    if (isTextToolType(item.type)) setLastTextTool(item.type)
    if (remember) {
      setRecentTypes((current) => rememberRecentComponentType(current, item.type))
    }
  }

  const closePicker = useCallback((restoreFocus: boolean) => {
    setPickerOpen(false)
    if (restoreFocus) requestAnimationFrame(() => moreButtonRef.current?.focus())
  }, [])

  return (
    <div className={styles.floatingDock} data-mode={mode} data-ptd-region="floating-tool-dock">
      <Toolbar />
      <Tooltip.Provider delayDuration={400} skipDelayDuration={120}>
        <nav className={styles.mainDock} aria-label="画布工具与历史">
          <div className={styles.group} role="group" aria-label="历史">
            <DockButton
              label="撤销"
              shortcut="Ctrl Z"
              disabled={!store.canUndo.value}
              onClick={() => store.undo()}
            >
              <RiArrowGoBackLine />
            </DockButton>
            <DockButton
              label="重做"
              shortcut="Ctrl Y"
              disabled={!store.canRedo.value}
              onClick={() => store.redo()}
            >
              <RiArrowGoForwardLine />
            </DockButton>
          </div>

          <span className={styles.separator} aria-hidden="true" />

          <div className={styles.group} role="group" aria-label="交互工具">
            <DockButton
              label="选择工具"
              shortcut="V"
              pressed={effectiveTool === 'select'}
              onClick={() => store.setActiveTool('select')}
            >
              <RiCursorLine />
            </DockButton>
            <DockButton
              label="抓手工具"
              shortcut="H"
              pressed={effectiveTool === 'hand'}
              onClick={() => store.setActiveTool('hand')}
            >
              <RiHand />
            </DockButton>
          </div>

          <span className={styles.separator} aria-hidden="true" />

          <div className={styles.group} role="group" aria-label="创建工具">
            {textTools.length > 0 && (
              <GroupedDockTool
                groupLabel="文本工具"
                activeType={lastTextTool}
                items={textTools}
                pressed={isTextToolType(effectiveTool)}
                onSelect={(type) => {
                  const item = findAvailableCatalogItem(type)
                  if (item) activate(item)
                }}
              />
            )}
            <ShapeToolGroup />
            {dockComponentTools.map((item) => {
              const Icon = item.icon
              return (
                <DockButton
                  key={item.type}
                  label={`${item.name}工具`}
                  compactOptional
                  pressed={effectiveTool === item.type}
                  onClick={() => activate(item)}
                >
                  <Icon />
                </DockButton>
              )
            })}
            <DockButton
              buttonRef={moreButtonRef}
              label={
                pickerDetailActive
                  ? `更多组件，当前为${findAvailableCatalogItem(activeTool)?.name ?? '组件'}工具`
                  : '更多组件'
              }
              className={styles.moreButton}
              expanded={pickerOpen}
              controls={pickerId}
              popupKind="dialog"
              detailActive={pickerDetailActive}
              onClick={() => setPickerOpen((current) => !current)}
            >
              <RiMore2Line />
            </DockButton>
          </div>

          <span className={styles.separator} aria-hidden="true" />

          <div className={styles.group} role="group" aria-label="工作区">
            <DockButton
              label={inspectorOpen ? '收起属性面板' : '打开属性面板'}
              pressed={inspectorOpen}
              onClick={onToggleInspector}
            >
              <RiLayoutRightLine />
            </DockButton>
          </div>
        </nav>
        {pickerOpen && (
          <ComponentToolPicker
            id={pickerId}
            activeTool={activeTool}
            recentTypes={recentTypes}
            triggerRef={moreButtonRef}
            onSelect={(item) => activate(item, true)}
            onClose={closePicker}
          />
        )}
      </Tooltip.Provider>
    </div>
  )
}

function DockButton({
  label,
  children,
  onClick,
  buttonRef,
  shortcut,
  disabled = false,
  pressed,
  expanded,
  controls,
  popupKind,
  detailActive,
  compactOptional,
  className,
}: DockButtonProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          ref={buttonRef}
          type="button"
          className={`${styles.dockButton} ${className ?? ''}`}
          aria-label={label}
          aria-pressed={pressed}
          aria-expanded={expanded}
          aria-controls={controls}
          aria-haspopup={popupKind}
          data-detail-active={detailActive || undefined}
          data-compact-optional={compactOptional || undefined}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className={`${styles.tooltip} ${ptdThemeClass}`} side="top" sideOffset={9}>
          <span>{label}</span>
          {shortcut && <kbd>{shortcut}</kbd>}
          <Tooltip.Arrow className={styles.tooltipArrow} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

function ShapeToolGroup() {
  useSignals()
  const store = useEditorStore()
  const activeShape = isDrawingComponentType(store.activeTool.value)
    ? store.activeTool.value
    : store.lastDrawingTool.value
  const shapeItems = DRAW_TOOL_TYPES.map(findAvailableCatalogItem).filter(
    (item): item is AvailableCatalogItem => Boolean(item),
  )

  return (
    <GroupedDockTool
      groupLabel="图形工具"
      activeType={activeShape}
      items={shapeItems}
      pressed={isDrawingComponentType(store.effectiveTool.value)}
      onSelect={(type) => {
        if (isDrawingComponentType(type)) store.setActiveTool(type)
      }}
    />
  )
}

function GroupedDockTool({
  groupLabel,
  activeType,
  items,
  pressed,
  onSelect,
}: {
  groupLabel: string
  activeType: CreatableComponentType
  items: readonly AvailableCatalogItem[]
  pressed: boolean
  onSelect: (type: CreatableComponentType) => void
}) {
  const menuId = useId()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const disclosureRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const activeItem = findAvailableCatalogItem(activeType)

  useEffect(() => {
    if (!open) return
    const selected = menuRef.current?.querySelector<HTMLButtonElement>(
      `[data-tool-type="${activeType}"]`,
    )
    selected?.focus()
    const closeOnOutsidePointer = (event: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [activeType, open])

  if (!activeItem) return null
  const ActiveIcon = activeItem.icon

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const menuItems = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'),
    )
    const currentIndex = menuItems.indexOf(document.activeElement as HTMLButtonElement)
    if ((event.key === 'Enter' || event.key === ' ') && currentIndex >= 0) {
      event.preventDefault()
      event.stopPropagation()
      menuItems[currentIndex]?.click()
      return
    }
    let nextIndex: number | null = null
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1 + menuItems.length) % menuItems.length
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + menuItems.length) % menuItems.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = menuItems.length - 1
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      disclosureRef.current?.focus()
      return
    }
    if (nextIndex === null || menuItems.length === 0) return
    event.preventDefault()
    event.stopPropagation()
    menuItems[nextIndex]?.focus()
  }

  return (
    <div
      ref={rootRef}
      className={styles.groupedTool}
      role="group"
      aria-label={groupLabel}
      data-active-tool={pressed || undefined}
    >
      <DockButton
        className={styles.groupedToolPrimary}
        label={`使用${activeItem.name}工具`}
        pressed={pressed}
        onClick={() => onSelect(activeType)}
      >
        <ActiveIcon />
      </DockButton>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            ref={disclosureRef}
            type="button"
            className={styles.groupedToolDisclosure}
            aria-label={`选择${groupLabel}`}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((current) => !current)}
          >
            <RiArrowDownSLine aria-hidden="true" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className={`${styles.tooltip} ${ptdThemeClass}`}
            side="top"
            sideOffset={9}
          >
            {`选择${groupLabel}`}
            <Tooltip.Arrow className={styles.tooltipArrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          className={styles.groupedToolMenu}
          role="menu"
          aria-label={`选择${groupLabel}`}
          data-ptd-editor-interactive="true"
          onKeyDown={handleMenuKeyDown}
        >
          <span className={styles.groupedToolMenuTitle}>{groupLabel}</span>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.type}
                type="button"
                role="menuitemradio"
                aria-checked={activeType === item.type}
                data-tool-type={item.type}
                onClick={() => {
                  onSelect(item.type)
                  setOpen(false)
                }}
              >
                <Icon aria-hidden="true" />
                <span>{item.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
