import { useState, type DragEvent, type PointerEvent, type ReactNode } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  RiAddLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiCloseLine,
  RiDatabase2Line,
  RiDeleteBinLine,
  RiDraggable,
  RiFileList2Line,
  RiFileCopyLine,
  RiGalleryLine,
  RiLock2Line,
  RiPagesLine,
  RiStackLine,
} from '@remixicon/react'
import { findAvailableCatalogItem } from '../../catalog'
import type { ResourcePanelId, WorkspaceMode } from '../../hooks/useWorkspaceLayout'
import { useEditorStore } from '../../state'
import { PanelBody, PanelFooter, PanelHeader, PanelRoot } from '../Panel'
import { ptdThemeClass } from '../Theme'
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

const PTD_PAGE_MIME = 'application/x-ptd-page'

export function Sidebar({ mode, activePanel, open, onTogglePanel, onResizeStart }: SidebarProps) {
  useSignals()
  const store = useEditorStore()

  return (
    <aside
      className={styles.sidebar}
      data-mode={mode}
      data-open={open}
      data-ptd-region="left-sidebar"
    >
      <Tooltip.Provider delayDuration={400} skipDelayDuration={120}>
        <nav className={styles.toolDock} aria-label="工作区资源面板">
          <div className={styles.dockZone} role="group" aria-label="资源面板">
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
          </div>
        </nav>
        <div className={styles.panelSlot} hidden={!open} data-ptd-region="resource-panel">
          {activePanel === 'assets' && (
            <AssetsPanel
              onClose={() => onTogglePanel('assets')}
              onDrawImage={() => {
                const image = findAvailableCatalogItem('RoyImage')
                if (image) store.setActiveTool(image.type)
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
  label,
  pressed,
  children,
  onClick,
}: {
  label: string
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
          data-state-kind="panel"
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
            detail="使用底部创建工具，或从更多组件选择器选择工具后在纸张上绘制。"
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
