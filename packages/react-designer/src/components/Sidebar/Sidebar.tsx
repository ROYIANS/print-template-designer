import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent,
  type Ref,
  type ReactNode,
} from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  RiAddLine,
  RiArrowDownLine,
  RiArrowDownSLine,
  RiArrowUpLine,
  RiCloseLine,
  RiCursorLine,
  RiDatabase2Line,
  RiDeleteBinLine,
  RiDraggable,
  RiFileList2Line,
  RiFileCopyLine,
  RiGalleryLine,
  RiHand,
  RiLock2Line,
  RiMore2Line,
  RiPagesLine,
  RiStackLine,
} from '@remixicon/react'
import {
  findAvailableCatalogItem,
  isDrawnComponentType,
  isDrawingComponentType,
  rememberRecentComponentType,
  type AvailableCatalogItem,
  type CreatableComponentType,
} from '../../catalog'
import type { ResourcePanelId, WorkspaceMode } from '../../hooks/useWorkspaceLayout'
import { useEditorStore } from '../../state'
import { PanelBody, PanelFooter, PanelHeader, PanelRoot } from '../Panel'
import { ptdThemeClass } from '../Theme'
import { ComponentToolPicker } from './ComponentToolPicker'
import { DataPanel } from '../DataPanel/DataPanel'
import styles from './Sidebar.module.css'

interface SidebarProps {
  mode: WorkspaceMode
  activePanel: ResourcePanelId
  open: boolean
  onTogglePanel: (panel: ResourcePanelId) => void
  onResizeStart: (event: PointerEvent<HTMLElement>) => void
}

const RESOURCE_PANELS = [
  { value: 'assets', label: '素材', icon: RiGalleryLine },
  { value: 'pages', label: '页面', icon: RiPagesLine },
  { value: 'layers', label: '图层', icon: RiStackLine },
  { value: 'data', label: '数据', icon: RiDatabase2Line },
] satisfies Array<{
  value: ResourcePanelId
  label: string
  icon: typeof RiPagesLine
}>

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

const PTD_PAGE_MIME = 'application/x-ptd-page'

export function Sidebar({ mode, activePanel, open, onTogglePanel, onResizeStart }: SidebarProps) {
  useSignals()
  const store = useEditorStore()
  const dockComponentTools = DOCK_COMPONENT_TOOL_TYPES.map(findAvailableCatalogItem).filter(
    (item): item is AvailableCatalogItem => Boolean(item),
  )
  const textTools = TEXT_TOOL_TYPES.map(findAvailableCatalogItem).filter(
    (item): item is AvailableCatalogItem => Boolean(item),
  )
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const pickerId = useId()
  const [lastTextTool, setLastTextTool] = useState<TextToolType>('RoySimpleText')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [recentTypes, setRecentTypes] = useState<readonly CreatableComponentType[]>([])
  const effectiveTool = store.effectiveTool.value
  const activeTool = store.activeTool.value
  const pickerOnlyToolActive = activeTool === 'RoyQRCode' || activeTool === 'RoyBarCode'

  const activate = (item: AvailableCatalogItem, remember = false) => {
    if (!isDrawnComponentType(item.type)) return
    store.setActiveTool(item.type)
    if (isTextToolType(item.type)) setLastTextTool(item.type)
    if (remember) {
      setRecentTypes((current) => rememberRecentComponentType(current, item.type))
    }
  }

  const closePicker = useCallback(
    (restoreFocus: boolean) => {
      setPickerOpen(false)
      if (restoreFocus) requestAnimationFrame(() => moreButtonRef.current?.focus())
    },
    [setPickerOpen],
  )

  return (
    <aside
      className={styles.sidebar}
      data-mode={mode}
      data-open={open}
      data-ptd-region="left-sidebar"
    >
      <Tooltip.Provider delayDuration={400} skipDelayDuration={120}>
        <nav className={styles.toolDock} aria-label="画布工具">
          <div className={styles.dockZone} role="group" aria-label="创建与交互工具">
            <DockButton
              label="选择工具"
              shortcut="V"
              stateKind="tool"
              pressed={effectiveTool === 'select'}
              onClick={() => store.setActiveTool('select')}
            >
              <RiCursorLine />
            </DockButton>
            <DockButton
              label="抓手工具"
              shortcut="H"
              stateKind="tool"
              pressed={effectiveTool === 'hand'}
              onClick={() => store.setActiveTool('hand')}
            >
              <RiHand />
            </DockButton>
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
                  stateKind="tool"
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
                pickerOnlyToolActive
                  ? `更多组件，当前为${findAvailableCatalogItem(activeTool)?.name ?? '组件'}工具`
                  : '更多组件'
              }
              stateKind="disclosure"
              className={styles.moreToolButton}
              expanded={pickerOpen}
              controls={pickerId}
              popupKind="dialog"
              detailActive={pickerOnlyToolActive}
              onClick={() => setPickerOpen((current) => !current)}
            >
              <RiMore2Line />
            </DockButton>
          </div>
          <span className={styles.dockGrow} />
          <div className={styles.dockZone} role="group" aria-label="工作区资源面板">
            {RESOURCE_PANELS.map(({ value, label, icon: Icon }) => (
              <DockButton
                key={value}
                label={`${open && activePanel === value ? '关闭' : '打开'}${label}面板`}
                stateKind="panel"
                pressed={open && activePanel === value}
                onClick={() => onTogglePanel(value)}
              >
                <Icon />
              </DockButton>
            ))}
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
        <div className={styles.panelSlot} hidden={!open} data-ptd-region="resource-panel">
          {activePanel === 'assets' && (
            <AssetsPanel
              onClose={() => onTogglePanel('assets')}
              onDrawImage={() => {
                const image = findAvailableCatalogItem('RoyImage')
                if (image) activate(image)
                if (mode === 'compact') onTogglePanel('assets')
              }}
            />
          )}
          {activePanel === 'pages' && <PagesPanel onClose={() => onTogglePanel('pages')} />}
          {activePanel === 'layers' && <LayersPanel onClose={() => onTogglePanel('layers')} />}
          {activePanel === 'data' && <DataPanel onClose={() => onTogglePanel('data')} />}
          <button
            type="button"
            className={styles.resizeHandle}
            aria-label="调整资源面板宽度"
            onPointerDown={onResizeStart}
          />
        </div>
      </Tooltip.Provider>
    </aside>
  )
}

function DockButton({
  buttonRef,
  label,
  shortcut,
  pressed,
  stateKind,
  className,
  expanded,
  controls,
  popupKind,
  detailActive,
  children,
  onClick,
}: {
  buttonRef?: Ref<HTMLButtonElement>
  label: string
  shortcut?: string
  pressed?: boolean
  stateKind?: 'tool' | 'panel' | 'disclosure'
  className?: string
  expanded?: boolean
  controls?: string
  popupKind?: 'menu' | 'dialog'
  detailActive?: boolean
  children: ReactNode
  onClick: () => void
}) {
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
          data-state-kind={stateKind}
          data-detail-active={detailActive || undefined}
          onClick={onClick}
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className={`${styles.tooltip} ${ptdThemeClass}`}
          side="right"
          sideOffset={8}
        >
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

  const selectTool = (type: CreatableComponentType) => {
    onSelect(type)
    setOpen(false)
  }

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'),
    )
    const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement)
    if ((event.key === 'Enter' || event.key === ' ') && currentIndex >= 0) {
      event.preventDefault()
      event.stopPropagation()
      items[currentIndex]?.click()
      return
    }
    let nextIndex: number | null = null
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1 + items.length) % items.length
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + items.length) % items.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = items.length - 1
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      disclosureRef.current?.focus()
      return
    }
    if (nextIndex === null || items.length === 0) return
    event.preventDefault()
    event.stopPropagation()
    items[nextIndex]?.focus()
  }

  return (
    <div
      ref={rootRef}
      className={styles.shapeToolGroup}
      role="group"
      aria-label={groupLabel}
      data-active-tool={pressed || undefined}
    >
      <DockButton
        className={styles.shapePrimary}
        label={`使用${activeItem.name}工具`}
        stateKind="tool"
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
            className={styles.shapeDisclosure}
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
            side="right"
            sideOffset={8}
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
          className={styles.shapeToolMenu}
          role="menu"
          aria-label={`选择${groupLabel}`}
          onKeyDown={handleMenuKeyDown}
        >
          <span className={styles.shapeMenuTitle}>{groupLabel}</span>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.type}
                type="button"
                role="menuitemradio"
                aria-checked={activeType === item.type}
                data-tool-type={item.type}
                onClick={() => selectTool(item.type)}
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

function PanelCloseButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className={styles.closePanel} aria-label={label} onClick={onClick}>
      <RiCloseLine aria-hidden="true" />
    </button>
  )
}

function PageActionButton({
  label,
  disabled = false,
  danger = false,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  danger?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className={styles.pageAction}
          aria-label={label}
          data-danger={danger || undefined}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className={`${styles.tooltip} ${ptdThemeClass}`} side="top" sideOffset={8}>
          <span>{label}</span>
          <Tooltip.Arrow className={styles.tooltipArrow} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

function AssetsPanel({ onClose, onDrawImage }: { onClose: () => void; onDrawImage: () => void }) {
  return (
    <PanelRoot data-ptd-region="asset-panel">
      <PanelHeader title="素材" meta="0 项">
        <PanelCloseButton label="关闭素材面板" onClick={onClose} />
      </PanelHeader>
      <PanelBody>
        <PanelEmpty
          title="还没有可复用素材"
          detail="先绘制图片框并在属性面板载入图片。素材持久化将在资产阶段接入。"
          actionLabel="绘制图片框"
          onAction={onDrawImage}
        />
      </PanelBody>
      <PanelFooter>未来用于图片、Logo、印章与 SVG 素材</PanelFooter>
    </PanelRoot>
  )
}

function PagesPanel({ onClose }: { onClose: () => void }) {
  useSignals()
  const store = useEditorStore()
  const pages = store.template.value.pages
  const currentIndex = store.currentPageIndex.value
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)

  const startPageDrag = (event: DragEvent<HTMLLIElement>, pageId: string) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData(PTD_PAGE_MIME, pageId)
    setDraggedPageId(pageId)
  }

  const dropPage = (event: DragEvent<HTMLLIElement>, targetIndex: number) => {
    event.preventDefault()
    const pageId = event.dataTransfer.getData(PTD_PAGE_MIME) || draggedPageId
    const sourceIndex = pages.findIndex((page) => page.id === pageId)
    if (sourceIndex >= 0) store.movePage(sourceIndex, targetIndex)
    setDraggedPageId(null)
    setDropTargetIndex(null)
  }

  return (
    <PanelRoot data-ptd-region="pages-panel">
      <PanelHeader title="页面" meta={`${pages.length} 页`}>
        <PanelCloseButton label="关闭页面面板" onClick={onClose} />
      </PanelHeader>
      <PanelBody>
        <ol className={styles.pageList}>
          {pages.map((page, index) => (
            <li
              key={page.id}
              className={styles.pageItem}
              draggable
              data-dragging={draggedPageId === page.id || undefined}
              data-drop-target={dropTargetIndex === index || undefined}
              onDragStart={(event) => startPageDrag(event, page.id)}
              onDragEnd={() => {
                setDraggedPageId(null)
                setDropTargetIndex(null)
              }}
              onDragOver={(event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                setDropTargetIndex(index)
              }}
              onDragLeave={() => {
                if (dropTargetIndex === index) setDropTargetIndex(null)
              }}
              onDrop={(event) => dropPage(event, index)}
            >
              <button
                type="button"
                className={styles.pageRow}
                data-selected={store.currentPageIndex.value === index || undefined}
                onClick={() => store.setCurrentPage(index)}
              >
                <RiDraggable className={styles.pageDragIcon} aria-hidden="true" />
                <span className={styles.pageNumber}>{String(index + 1).padStart(2, '0')}</span>
                <span>
                  <strong>{`页面 ${index + 1}`}</strong>
                  <small>{page.componentData.length} 个对象</small>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </PanelBody>
      <PanelFooter className={styles.pageActions} aria-label="页面结构操作">
        <PageActionButton label="添加空白页" onClick={() => store.addPage()}>
          <RiAddLine aria-hidden="true" />
        </PageActionButton>
        <PageActionButton label="复制当前页" onClick={() => store.duplicatePage()}>
          <RiFileCopyLine aria-hidden="true" />
        </PageActionButton>
        <PageActionButton
          label="当前页上移"
          disabled={currentIndex <= 0}
          onClick={() => store.movePage(currentIndex, currentIndex - 1)}
        >
          <RiArrowUpLine aria-hidden="true" />
        </PageActionButton>
        <PageActionButton
          label="当前页下移"
          disabled={currentIndex >= pages.length - 1}
          onClick={() => store.movePage(currentIndex, currentIndex + 1)}
        >
          <RiArrowDownLine aria-hidden="true" />
        </PageActionButton>
        <PageActionButton
          label="删除当前页"
          danger
          disabled={pages.length <= 1}
          onClick={() => store.deletePage()}
        >
          <RiDeleteBinLine aria-hidden="true" />
        </PageActionButton>
      </PanelFooter>
    </PanelRoot>
  )
}

function LayersPanel({ onClose }: { onClose: () => void }) {
  useSignals()
  const store = useEditorStore()
  const components = store.components.value
  const selected = new Set(store.selectedIds.value)
  return (
    <PanelRoot data-ptd-region="structure-panel">
      <PanelHeader title="图层" meta={`${components.length} 层`}>
        <PanelCloseButton label="关闭图层面板" onClick={onClose} />
      </PanelHeader>
      <PanelBody>
        {components.length > 0 ? (
          <ol className={styles.layerList}>
            {[...components].reverse().map((component, reverseIndex) => (
              <li key={component.id}>
                <button
                  type="button"
                  className={styles.layerRow}
                  data-selected={selected.has(component.id) || undefined}
                  onClick={(event) => store.selectComponent(component.id, event.shiftKey)}
                >
                  <span className={styles.layerIndex}>{components.length - reverseIndex}</span>
                  <RiFileList2Line aria-hidden="true" />
                  <span className={styles.layerName}>{component.name || component.component}</span>
                  {component.isLock && (
                    <RiLock2Line className={styles.lockIcon} aria-label="已锁定" />
                  )}
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <PanelEmpty
            title="画布中还没有对象"
            detail="使用左侧创建工具，或从更多组件选择器选择工具后在纸张上绘制。"
          />
        )}
      </PanelBody>
      <PanelFooter>列表顶部对应纸张最上层</PanelFooter>
    </PanelRoot>
  )
}

function PanelEmpty({
  title,
  detail,
  actionLabel,
  onAction,
}: {
  title: string
  detail: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className={styles.emptyState}>
      <strong>{title}</strong>
      <span>{detail}</span>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
