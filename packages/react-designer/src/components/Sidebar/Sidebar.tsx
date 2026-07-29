import { useMemo, useState, type DragEvent, type PointerEvent, type ReactNode } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { getPageDimensions, type ComponentCategory, type ComponentType } from '@ptd/core'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  RiCloseLine,
  RiCursorLine,
  RiDatabase2Line,
  RiFileList2Line,
  RiFolderImageLine,
  RiLock2Line,
  RiPagesLine,
  RiSearchLine,
  RiStackLine,
} from '@remixicon/react'
import {
  componentCatalog,
  createComponentSchema,
  PTD_COMPONENT_MIME,
  type CatalogItem,
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
  { value: 'pages', label: '页面', icon: RiPagesLine },
  { value: 'layers', label: '图层', icon: RiStackLine },
  { value: 'data', label: '数据', icon: RiDatabase2Line },
  { value: 'assets', label: '资产与组件', icon: RiFolderImageLine },
] satisfies Array<{
  value: ResourcePanelId
  label: string
  icon: typeof RiPagesLine
}>

const CREATE_TYPES = [
  'RoySimpleText',
  'RoyImage',
  'RoySimpleTable',
  'RoyQRCode',
  'RoyBarCode',
  'RoyRect',
  'RoyLine',
] satisfies Array<Exclude<ComponentType, 'RoyGroup'>>

const CATEGORY_NAMES: Record<ComponentCategory, string> = {
  common: '通用',
  data: '数据',
  shape: '形状',
}

export function Sidebar({ mode, activePanel, open, onTogglePanel, onResizeStart }: SidebarProps) {
  useSignals()
  const store = useEditorStore()
  const page = getPageDimensions(store.pageConfig.value)
  const createTools = CREATE_TYPES.map((type) =>
    componentCatalog.find((item) => item.type === type),
  ).filter((item): item is CatalogItem => Boolean(item))

  const create = (item: CatalogItem) => {
    const offset = (store.components.value.length % 6) * 12
    const component = createComponentSchema(
      item.type,
      { x: page.width / 2 + offset, y: page.height / 2 + offset },
      page,
    )
    store.addComponent(component)
    store.requestComponentReveal(component.id)
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
          <DockButton label="选择工具" shortcut="V" pressed onClick={() => store.clearSelection()}>
            <RiCursorLine />
          </DockButton>
          <span className={styles.dockRule} />
          {createTools.map((item) => {
            const Icon = item.icon
            return (
              <DockButton key={item.type} label={`添加${item.name}`} onClick={() => create(item)}>
                <Icon />
              </DockButton>
            )
          })}
          <span className={styles.dockGrow} />
          <span className={styles.dockRule} />
          {RESOURCE_PANELS.map(({ value, label, icon: Icon }) => (
            <DockButton
              key={value}
              label={`${open && activePanel === value ? '关闭' : '打开'}${label}面板`}
              pressed={open && activePanel === value}
              onClick={() => onTogglePanel(value)}
            >
              <Icon />
            </DockButton>
          ))}
        </nav>
      </Tooltip.Provider>

      <div className={styles.panelSlot} hidden={!open} data-ptd-region="resource-panel">
        {activePanel === 'pages' && <PagesPanel onClose={() => onTogglePanel('pages')} />}
        {activePanel === 'layers' && <LayersPanel onClose={() => onTogglePanel('layers')} />}
        {activePanel === 'data' && <DataPanel onClose={() => onTogglePanel('data')} />}
        {activePanel === 'assets' && <AssetsPanel onClose={() => onTogglePanel('assets')} />}
        <button
          type="button"
          className={styles.resizeHandle}
          aria-label="调整资源面板宽度"
          onPointerDown={onResizeStart}
        />
      </div>
    </aside>
  )
}

function DockButton({
  label,
  shortcut,
  pressed,
  children,
  onClick,
}: {
  label: string
  shortcut?: string
  pressed?: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className={styles.dockButton}
          aria-label={label}
          aria-pressed={pressed}
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

function PanelCloseButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className={styles.closePanel} aria-label={label} onClick={onClick}>
      <RiCloseLine aria-hidden="true" />
    </button>
  )
}

function PagesPanel({ onClose }: { onClose: () => void }) {
  useSignals()
  const store = useEditorStore()
  const pages = store.template.value.pages
  return (
    <PanelRoot data-ptd-region="pages-panel">
      <PanelHeader title="页面" meta={`${pages.length} 页`}>
        <PanelCloseButton label="关闭页面面板" onClick={onClose} />
      </PanelHeader>
      <PanelBody>
        <ol className={styles.pageList}>
          {pages.map((page, index) => (
            <li key={page.id}>
              <button
                type="button"
                className={styles.pageRow}
                data-selected={store.currentPageIndex.value === index || undefined}
                onClick={() => store.setCurrentPage(index)}
              >
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
      <PanelFooter>页面结构命令将在多页阶段开放</PanelFooter>
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
          <PanelEmpty title="画布中还没有对象" detail="使用左侧创建工具，或从资产面板添加组件。" />
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

function AssetsPanel({ onClose }: { onClose: () => void }) {
  useSignals()
  const store = useEditorStore()
  const [query, setQuery] = useState('')
  const page = getPageDimensions(store.pageConfig.value)
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    return normalized
      ? componentCatalog.filter((item) =>
          `${item.name}${item.description}${item.type}`.toLocaleLowerCase().includes(normalized),
        )
      : componentCatalog
  }, [query])

  const create = (item: CatalogItem) => {
    const offset = (store.components.value.length % 6) * 12
    const component = createComponentSchema(
      item.type,
      { x: page.width / 2 + offset, y: page.height / 2 + offset },
      page,
    )
    store.addComponent(component)
    store.requestComponentReveal(component.id)
  }
  const drag = (item: CatalogItem) => (event: DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData(PTD_COMPONENT_MIME, item.type)
    event.dataTransfer.setData('componentType', item.type)
    event.dataTransfer.setData('text/plain', item.name)
  }

  return (
    <PanelRoot data-ptd-region="component-panel">
      <PanelHeader title="资产与组件" meta={`${filtered.length} 项`}>
        <PanelCloseButton label="关闭资产面板" onClick={onClose} />
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
        {(['common', 'data', 'shape'] as const).map((category) => {
          const items = filtered.filter((item) => item.category === category)
          if (items.length === 0) return null
          return (
            <section key={category} className={styles.catalogSection}>
              <h3>{CATEGORY_NAMES[category]}</h3>
              <div className={styles.catalogList}>
                {items.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.type}
                      type="button"
                      className={styles.catalogItem}
                      draggable
                      onClick={() => create(item)}
                      onDragStart={drag(item)}
                      title={`${item.name}：${item.description}`}
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.name}</span>
                      <small>{item.description}</small>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <strong>没有匹配的组件</strong>
            <span>换一个名称或组件类型试试。</span>
            <button type="button" onClick={() => setQuery('')}>
              清除搜索
            </button>
          </div>
        )}
      </PanelBody>
      <PanelFooter>点击添加到纸张中央，也可拖入画布定位</PanelFooter>
    </PanelRoot>
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
