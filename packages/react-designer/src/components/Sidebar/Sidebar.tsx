import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent,
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
  RiApps2Line,
  RiHand,
  RiLock2Line,
  RiPagesLine,
  RiSearchLine,
  RiStackLine,
} from '@remixicon/react'
import {
  catalogGroups,
  componentCatalog,
  findAvailableCatalogItem,
  frequentCatalogItems,
  isAvailableCatalogItem,
  isDrawnComponentType,
  isDrawingComponentType,
  searchComponentCatalog,
  type AvailableCatalogItem,
  type CreatableComponentType,
  type DrawingComponentType,
  type PlannedCatalogItem,
} from '../../catalog'
import type { ResourcePanelId, WorkspaceMode } from '../../hooks/useWorkspaceLayout'
import { useEditorStore } from '../../state'
import { PanelBody, PanelFooter, PanelHeader, PanelRoot, PanelTools } from '../Panel'
import { ptdThemeClass } from '../Theme'
import styles from './Sidebar.module.css'

interface SidebarProps {
  mode: WorkspaceMode
  activePanel: ResourcePanelId
  open: boolean
  onTogglePanel: (panel: ResourcePanelId) => void
  onResizeStart: (event: PointerEvent<HTMLElement>) => void
}

const RESOURCE_PANELS = [
  { value: 'components', label: '组件', icon: RiApps2Line },
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

const PTD_PAGE_MIME = 'application/x-ptd-page'

export function Sidebar({ mode, activePanel, open, onTogglePanel, onResizeStart }: SidebarProps) {
  useSignals()
  const store = useEditorStore()
  const dockComponentTools = DOCK_COMPONENT_TOOL_TYPES.map(findAvailableCatalogItem).filter(
    (item): item is AvailableCatalogItem => Boolean(item),
  )
  const textTool = findAvailableCatalogItem('RoySimpleText')
  const TextToolIcon = textTool?.icon
  const effectiveTool = store.effectiveTool.value

  const create = (item: AvailableCatalogItem) => {
    if (isDrawnComponentType(item.type)) store.setActiveTool(item.type)
  }

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
            {textTool && TextToolIcon && (
              <DockButton
                label="文本框工具"
                stateKind="tool"
                pressed={effectiveTool === 'RoySimpleText'}
                onClick={() => create(textTool)}
              >
                <TextToolIcon />
              </DockButton>
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
                  onClick={() => create(item)}
                >
                  <Icon />
                </DockButton>
              )
            })}
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
        <div className={styles.panelSlot} hidden={!open} data-ptd-region="resource-panel">
          {activePanel === 'pages' && <PagesPanel onClose={() => onTogglePanel('pages')} />}
          {activePanel === 'layers' && <LayersPanel onClose={() => onTogglePanel('layers')} />}
          {activePanel === 'data' && <DataPanel onClose={() => onTogglePanel('data')} />}
          {activePanel === 'components' && (
            <ComponentsPanel onClose={() => onTogglePanel('components')} />
          )}
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
  label,
  shortcut,
  pressed,
  stateKind,
  className,
  children,
  onClick,
}: {
  label: string
  shortcut?: string
  pressed?: boolean
  stateKind?: 'tool' | 'panel'
  className?: string
  children: ReactNode
  onClick: () => void
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className={`${styles.dockButton} ${className ?? ''}`}
          aria-label={label}
          aria-pressed={pressed}
          data-state-kind={stateKind}
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
  const menuId = useId()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const disclosureRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const activeShape = isDrawingComponentType(store.activeTool.value)
    ? store.activeTool.value
    : store.lastDrawingTool.value
  const activeItem = findAvailableCatalogItem(activeShape)
  const shapeItems = DRAW_TOOL_TYPES.map(findAvailableCatalogItem).filter(
    (item): item is AvailableCatalogItem => Boolean(item),
  )

  useEffect(() => {
    if (!open) return
    const selected = menuRef.current?.querySelector<HTMLButtonElement>(
      `[data-shape-type="${activeShape}"]`,
    )
    selected?.focus()
    const closeOnOutsidePointer = (event: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [activeShape, open])

  if (!activeItem) return null
  const ActiveIcon = activeItem.icon

  const selectShape = (type: DrawingComponentType) => {
    store.setActiveTool(type)
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
      aria-label="图形工具"
      data-active-tool={isDrawingComponentType(store.effectiveTool.value) || undefined}
    >
      <DockButton
        className={styles.shapePrimary}
        label={`使用${activeItem.name}工具`}
        stateKind="tool"
        pressed={isDrawingComponentType(store.effectiveTool.value)}
        onClick={() => store.setActiveTool(activeShape)}
      >
        <ActiveIcon />
      </DockButton>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            ref={disclosureRef}
            type="button"
            className={styles.shapeDisclosure}
            aria-label="选择图形工具"
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
            选择图形工具
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
          aria-label="选择图形工具"
          onKeyDown={handleMenuKeyDown}
        >
          <span className={styles.shapeMenuTitle}>图形工具</span>
          {shapeItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.type}
                type="button"
                role="menuitemradio"
                aria-checked={activeShape === item.type}
                data-shape-type={item.type}
                onClick={() => {
                  if (isDrawingComponentType(item.type)) selectShape(item.type)
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
          <PanelEmpty title="画布中还没有对象" detail="使用左侧创建工具，或从组件面板添加对象。" />
        )}
      </PanelBody>
      <PanelFooter>列表顶部对应纸张最上层</PanelFooter>
    </PanelRoot>
  )
}

function DataPanel({ onClose }: { onClose: () => void }) {
  useSignals()
  const fields = useEditorStore().template.value.dataSource
  return (
    <PanelRoot data-ptd-region="data-panel">
      <PanelHeader title="数据" meta={`${fields.length} 个字段`}>
        <PanelCloseButton label="关闭数据面板" onClick={onClose} />
      </PanelHeader>
      <PanelTools>
        <div className={styles.panelHint}>字段将在数据阶段支持拖拽绑定与表达式校样</div>
      </PanelTools>
      <PanelBody>
        {fields.length ? (
          <dl className={styles.dataList}>
            {fields.map((field) => (
              <div key={field.id}>
                <dt>{field.title}</dt>
                <dd>{field.field}</dd>
                <span>{field.typeName}</span>
              </div>
            ))}
          </dl>
        ) : (
          <PanelEmpty title="还没有数据字段" detail="数据字段将连接业务数据、文本、条码与表格。" />
        )}
      </PanelBody>
    </PanelRoot>
  )
}

function ComponentsPanel({ onClose }: { onClose: () => void }) {
  useSignals()
  const store = useEditorStore()
  const [query, setQuery] = useState('')
  const [plannedOpen, setPlannedOpen] = useState(false)
  const filtered = useMemo(() => searchComponentCatalog(query), [query])
  const effectiveTool = store.effectiveTool.value
  const searchActive = query.trim().length > 0
  const availableItems = filtered.filter(isAvailableCatalogItem)
  const plannedItems = filtered.filter(
    (item): item is PlannedCatalogItem => item.kind === 'planned',
  )
  const allAvailable = componentCatalog.filter(isAvailableCatalogItem)
  const allPlanned = componentCatalog.filter(
    (item): item is PlannedCatalogItem => item.kind === 'planned',
  )

  const create = (item: AvailableCatalogItem) => {
    if (isDrawnComponentType(item.type)) store.setActiveTool(item.type)
  }

  return (
    <PanelRoot data-ptd-region="component-panel">
      <PanelHeader
        title="组件"
        meta={`${availableItems.length} 可用 · ${plannedItems.length} 规划`}
      >
        <PanelCloseButton label="关闭组件面板" onClick={onClose} />
      </PanelHeader>
      <PanelTools>
        <label className={styles.search}>
          <RiSearchLine aria-hidden="true" />
          <span className={styles.visuallyHidden}>搜索组件</span>
          <input
            type="search"
            value={query}
            placeholder="搜索组件"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </PanelTools>
      <PanelBody>
        {searchActive ? (
          <>
            {availableItems.length > 0 && (
              <CatalogSection
                id="search-results"
                name="搜索结果"
                introduction={`${availableItems.length} 个可用组件`}
              >
                <div className={styles.catalogSearchList}>
                  {availableItems.map((item) => (
                    <CatalogSearchItem
                      key={item.id}
                      item={item}
                      active={effectiveTool === item.type}
                      onCreate={() => create(item)}
                    />
                  ))}
                </div>
              </CatalogSection>
            )}
            {plannedItems.length > 0 && (
              <PlannedCatalogSection
                items={plannedItems}
                open
                forceOpen
                onOpenChange={setPlannedOpen}
              />
            )}
          </>
        ) : (
          <>
            <CatalogSection
              id="frequent"
              name="常用"
              introduction="高频创建组件"
              meta={`${frequentCatalogItems.length} 项`}
            >
              <div className={styles.catalogTileGrid}>
                {frequentCatalogItems.map((item) => (
                  <CatalogAvailableButton
                    key={item.id}
                    item={item}
                    variant="tile"
                    active={effectiveTool === item.type}
                    onCreate={() => create(item)}
                  />
                ))}
              </div>
            </CatalogSection>
            {catalogGroups
              .filter((group) => group.id !== 'shape')
              .map((group) => {
                const items = allAvailable.filter((item) => item.group === group.id)
                return (
                  <CatalogSection
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    introduction={group.introduction}
                    meta={`${items.length} 项`}
                  >
                    <div className={styles.catalogTileGrid}>
                      {items.map((item) => (
                        <CatalogAvailableButton
                          key={item.id}
                          item={item}
                          variant="tile"
                          active={effectiveTool === item.type}
                          onCreate={() => create(item)}
                        />
                      ))}
                    </div>
                  </CatalogSection>
                )
              })}
            <CatalogSection
              id="shape"
              name="图形"
              introduction="选择工具后，在纸张上拖动绘制"
              meta="4 项"
            >
              <div className={styles.shapePresetGrid}>
                {allAvailable
                  .filter((item) => item.group === 'shape')
                  .map((item) => (
                    <CatalogAvailableButton
                      key={item.id}
                      item={item}
                      variant="shape"
                      active={effectiveTool === item.type}
                      onCreate={() => create(item)}
                    />
                  ))}
              </div>
            </CatalogSection>
            <PlannedCatalogSection
              items={allPlanned}
              open={plannedOpen}
              onOpenChange={setPlannedOpen}
            />
          </>
        )}
        {filtered.length === 0 && searchActive && (
          <div className={styles.emptyState}>
            <strong>没有匹配的组件</strong>
            <span>换一个名称或组件类型试试。</span>
            <button type="button" onClick={() => setQuery('')}>
              清除搜索
            </button>
          </div>
        )}
      </PanelBody>
      <PanelFooter>选择组件工具后，在纸张上拖动绘制</PanelFooter>
    </PanelRoot>
  )
}

function CatalogSection({
  id,
  name,
  introduction,
  meta,
  children,
}: {
  id: string
  name: string
  introduction: string
  meta?: string
  children: ReactNode
}) {
  const headingId = `catalog-section-${id}`
  return (
    <section className={styles.catalogSection} aria-labelledby={headingId}>
      <div className={styles.catalogGroupHeader}>
        <h3 id={headingId}>{name}</h3>
        {meta && <span>{meta}</span>}
      </div>
      <p className={styles.catalogGroupIntro}>{introduction}</p>
      {children}
    </section>
  )
}

function CatalogAvailableButton({
  item,
  variant,
  active,
  onCreate,
}: {
  item: AvailableCatalogItem
  variant: 'tile' | 'shape'
  active: boolean
  onCreate: () => void
}) {
  const Icon = item.icon
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className={variant === 'shape' ? styles.shapePreset : styles.catalogTile}
          data-active-tool={active || undefined}
          onClick={onCreate}
          aria-label={`${item.name}：${item.description}`}
        >
          <Icon aria-hidden="true" />
          <span>{item.name}</span>
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className={`${styles.catalogTooltip} ${ptdThemeClass}`}
          side="right"
          sideOffset={8}
        >
          <strong>{item.name}</strong>
          <span>{item.description}</span>
          <Tooltip.Arrow className={styles.tooltipArrow} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

function CatalogSearchItem({
  item,
  active,
  onCreate,
}: {
  item: AvailableCatalogItem
  active: boolean
  onCreate: () => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      className={styles.catalogSearchItem}
      data-active-tool={active || undefined}
      onClick={onCreate}
      aria-label={`${item.name}：${item.description}`}
    >
      <Icon aria-hidden="true" />
      <span>
        <strong>{item.name}</strong>
        <small>{item.description}</small>
      </span>
    </button>
  )
}

function PlannedCatalogSection({
  items,
  open,
  forceOpen = false,
  onOpenChange,
}: {
  items: readonly PlannedCatalogItem[]
  open: boolean
  forceOpen?: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <details
      className={styles.plannedSection}
      open={open}
      onToggle={(event) => onOpenChange(event.currentTarget.open)}
    >
      <summary onClick={forceOpen ? (event) => event.preventDefault() : undefined}>
        <span>
          <strong>即将支持</strong>
          <small>{items.length} 项 · 规划中</small>
        </span>
        <RiArrowDownSLine aria-hidden="true" />
      </summary>
      <div className={styles.plannedList}>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className={styles.plannedItem}
              disabled
              draggable={false}
              aria-label={`${item.name}：${item.description}，规划中`}
            >
              <Icon aria-hidden="true" />
              <span>
                <strong>{item.name}</strong>
                <small>{item.description}</small>
              </span>
              <em>规划中</em>
            </button>
          )
        })}
      </div>
    </details>
  )
}

function PanelEmpty({ title, detail }: { title: string; detail: string }) {
  return (
    <div className={styles.emptyState}>
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  )
}
