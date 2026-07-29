import { useMemo, useState, type DragEvent } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { getPageDimensions, type ComponentCategory } from '@ptd/core'
import * as Tabs from '@radix-ui/react-tabs'
import {
  RiDatabase2Line,
  RiDragDropLine,
  RiFileList2Line,
  RiLock2Line,
  RiPaletteLine,
  RiSearchLine,
  RiSettings4Line,
  RiStackLine,
} from '@remixicon/react'
import {
  componentCatalog,
  createComponentSchema,
  PTD_COMPONENT_MIME,
  type CatalogItem,
} from '../../catalog'
import { useEditorStore } from '../../state'
import { PanelBody, PanelFooter, PanelHeader, PanelRoot, PanelTools } from '../Panel'
import styles from './Sidebar.module.css'

type SidebarTab = 'components' | 'structure' | 'properties' | 'data' | 'global'

const TABS = [
  { value: 'components', label: '组件', icon: RiDragDropLine },
  { value: 'structure', label: '结构', icon: RiStackLine },
  { value: 'properties', label: '属性', icon: RiPaletteLine },
  { value: 'data', label: '数据源', icon: RiDatabase2Line },
  { value: 'global', label: '全局设置', icon: RiSettings4Line },
] satisfies Array<{ value: SidebarTab; label: string; icon: typeof RiDragDropLine }>

const CATEGORY_NAMES: Record<ComponentCategory, string> = {
  common: '通用',
  data: '数据',
  shape: '形状',
}

export function Sidebar() {
  const [tab, setTab] = useState<SidebarTab>('components')

  return (
    <Tabs.Root
      className={styles.sidebar}
      value={tab}
      onValueChange={(value) => setTab(value as SidebarTab)}
      orientation="vertical"
      data-ptd-region="left-sidebar"
    >
      <Tabs.List className={styles.rail} aria-label="工作区面板">
        {TABS.map(({ value, label, icon: Icon }) => (
          <Tabs.Trigger key={value} className={styles.railButton} value={value} title={label}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <div className={styles.panelSlot}>
        <Tabs.Content className={styles.tabContent} value="components">
          <ComponentPanel />
        </Tabs.Content>
        <Tabs.Content className={styles.tabContent} value="structure">
          <StructurePanel />
        </Tabs.Content>
        <Tabs.Content className={styles.tabContent} value="properties">
          <SelectionPanel />
        </Tabs.Content>
        <Tabs.Content className={styles.tabContent} value="data">
          <DataPanel />
        </Tabs.Content>
        <Tabs.Content className={styles.tabContent} value="global">
          <GlobalPanel />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  )
}

function ComponentPanel() {
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
    store.addComponent(
      createComponentSchema(
        item.type,
        { x: page.width / 2 + offset, y: page.height / 2 + offset },
        page,
      ),
    )
  }

  const drag = (item: CatalogItem) => (event: DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData(PTD_COMPONENT_MIME, item.type)
    event.dataTransfer.setData('componentType', item.type)
    event.dataTransfer.setData('text/plain', item.name)
  }

  return (
    <PanelRoot data-ptd-region="component-panel">
      <PanelHeader title="组件" meta={`${filtered.length} 项`} />
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
              <div className={styles.catalogGrid}>
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

function StructurePanel() {
  useSignals()
  const store = useEditorStore()
  const components = store.components.value
  const selected = new Set(store.selectedIds.value)
  return (
    <PanelRoot data-ptd-region="structure-panel">
      <PanelHeader title="结构" meta={`${components.length} 层`} />
      <PanelBody>
        {components.length > 0 ? (
          <ol className={styles.layerList}>
            {[...components].reverse().map((component, reverseIndex) => (
              <li key={component.id}>
                <button
                  type="button"
                  className={styles.layerRow}
                  data-selected={selected.has(component.id)}
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
          <PanelEmpty title="画布中还没有组件" detail="从“组件”面板添加一个对象开始制版。" />
        )}
      </PanelBody>
      <PanelFooter>列表顶部对应纸张最上层</PanelFooter>
    </PanelRoot>
  )
}

function SelectionPanel() {
  useSignals()
  const store = useEditorStore()
  const selected = store.selectedComponents.value
  return (
    <PanelRoot data-ptd-region="selection-panel">
      <PanelHeader
        title="属性摘要"
        meta={selected.length ? `${selected.length} 个对象` : '未选择'}
      />
      <PanelBody>
        {selected.length ? (
          <div className={styles.summaryList}>
            {selected.map((component) => (
              <button
                key={component.id}
                type="button"
                onClick={() => store.selectComponent(component.id)}
              >
                <span>{component.name || component.component}</span>
                <small>
                  {Math.round(component.style.width)} × {Math.round(component.style.height)} px
                </small>
              </button>
            ))}
            <p>完整内容、几何与外观编辑位于右侧属性检查器。</p>
          </div>
        ) : (
          <PanelEmpty title="尚未选择对象" detail="在画布或结构列表中选择组件以查看属性。" />
        )}
      </PanelBody>
    </PanelRoot>
  )
}

function DataPanel() {
  useSignals()
  const fields = useEditorStore().template.value.dataSource
  return (
    <PanelRoot data-ptd-region="data-panel">
      <PanelHeader title="数据源" meta={`${fields.length} 个字段`} />
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
          <PanelEmpty
            title="还没有数据字段"
            detail="数据字段连接业务数据，并供文本、条码与表格绑定。"
          />
        )}
      </PanelBody>
      <PanelFooter>数据源编辑将在后续切片开放</PanelFooter>
    </PanelRoot>
  )
}

function GlobalPanel() {
  useSignals()
  const page = useEditorStore().pageConfig.value
  return (
    <PanelRoot data-ptd-region="global-panel">
      <PanelHeader title="全局设置" meta={page.pageSize} />
      <PanelBody>
        <dl className={styles.globalList}>
          <div>
            <dt>页面方向</dt>
            <dd>{page.pageDirection === 'p' ? '纵向' : '横向'}</dd>
          </div>
          <div>
            <dt>纸张尺寸</dt>
            <dd>
              {page.pageWidth} × {page.pageHeight} mm
            </dd>
          </div>
          <div>
            <dt>上边距</dt>
            <dd>{page.pageMarginTop} mm</dd>
          </div>
          <div>
            <dt>下边距</dt>
            <dd>{page.pageMarginBottom} mm</dd>
          </div>
          <div>
            <dt>布局模式</dt>
            <dd>{page.pageLayout === 'fixed' ? '固定页面' : '连续页面'}</dd>
          </div>
        </dl>
      </PanelBody>
      <PanelFooter>页面方向可在上方命令栏快速切换</PanelFooter>
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
