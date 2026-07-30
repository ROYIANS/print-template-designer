import type {
  ComponentCatalogGroup,
  ComponentCategory,
  ComponentCreationMode,
  ComponentMaturity,
  ComponentSchema,
  CreatableComponentType,
} from '@ptd/core'
import { defaultRegistry } from '@ptd/core'
import type { RemixiconComponentType } from '@remixicon/react'
import {
  RiBarcodeLine,
  RiBracesLine,
  RiCalendar2Line,
  RiCheckboxBlankCircleLine,
  RiImage2Line,
  RiLayoutGridLine,
  RiListCheck3,
  RiPagesLine,
  RiQrCodeLine,
  RiRectangleLine,
  RiShapesLine,
  RiStarLine,
  RiSubtractLine,
  RiTBoxLine,
  RiTable2,
  RiTableLine,
  RiTableView,
  RiText,
} from '@remixicon/react'
import { deepCopy, generateId } from '../utils'

export const PTD_COMPONENT_MIME = 'application/x-ptd-component'

export type { CreatableComponentType } from '@ptd/core'
export type DrawingComponentType = 'RoyLine' | 'RoyRect' | 'RoyCircle' | 'RoyStar'
export type DrawnComponentType = CreatableComponentType
export type CatalogMaturity = ComponentMaturity | 'planned'

interface CatalogItemBase {
  id: string
  name: string
  group: ComponentCatalogGroup
  icon: RemixiconComponentType
  description: string
  keywords: readonly string[]
  maturity: CatalogMaturity
}

export interface AvailableCatalogItem extends CatalogItemBase {
  kind: 'available'
  type: CreatableComponentType
  category: ComponentCategory
  maturity: ComponentMaturity
  creationMode: ComponentCreationMode
}

export interface PlannedCatalogItem extends CatalogItemBase {
  kind: 'planned'
  maturity: 'planned'
}

export type CatalogItem = AvailableCatalogItem | PlannedCatalogItem

export interface CatalogGroupDefinition {
  id: ComponentCatalogGroup
  name: string
  introduction: string
}

export interface ComponentPoint {
  x: number
  y: number
}

export interface PageBounds {
  width: number
  height: number
}

export const catalogGroups = [
  { id: 'text', name: '文本', introduction: '标题、标签与多段落排版内容' },
  { id: 'table', name: '表格', introduction: '固定网格、分区结构与重复数据' },
  { id: 'image', name: '图像', introduction: 'Logo、印章、照片与矢量素材' },
  { id: 'code', name: '编码', introduction: '将网址、单号与业务标识编码到纸面' },
  { id: 'shape', name: '图形', introduction: '分隔、边框、底形与视觉标记' },
] as const satisfies readonly CatalogGroupDefinition[]

const ICONS = {
  RoySimpleText: RiText,
  RoyText: RiTBoxLine,
  RoySimpleTable: RiTable2,
  RoyComplexTable: RiTableLine,
  RoyImage: RiImage2Line,
  RoyQRCode: RiQrCodeLine,
  RoyBarCode: RiBarcodeLine,
  RoyLine: RiSubtractLine,
  RoyRect: RiRectangleLine,
  RoyCircle: RiCheckboxBlankCircleLine,
  RoyStar: RiStarLine,
} satisfies Record<CreatableComponentType, RemixiconComponentType>

const plannedCatalogItems = [
  {
    kind: 'planned',
    id: 'data-expression-text',
    name: '数据字段 / 表达式文本',
    group: 'text',
    icon: RiBracesLine,
    description: '插入业务字段，并通过表达式组合动态文本',
    keywords: ['数据字段', '表达式', '变量', '绑定', '动态文本'],
    maturity: 'planned',
  },
  {
    kind: 'planned',
    id: 'page-number',
    name: '页码 / 总页数',
    group: 'text',
    icon: RiPagesLine,
    description: '在打印时显示当前页码与文档总页数',
    keywords: ['页码', '总页数', '分页', '打印上下文'],
    maturity: 'planned',
  },
  {
    kind: 'planned',
    id: 'date-time',
    name: '日期时间',
    group: 'text',
    icon: RiCalendar2Line,
    description: '按指定格式输出打印日期与时间',
    keywords: ['日期', '时间', '格式化', '打印时间'],
    maturity: 'planned',
  },
  {
    kind: 'planned',
    id: 'structured-table',
    name: '结构表格',
    group: 'table',
    icon: RiTableLine,
    description: '按表头、表体与表尾组织数据，并支持报表分页合同',
    keywords: ['表头', '表体', '表尾', '分区', '报表', '只读兼容'],
    maturity: 'planned',
  },
  {
    kind: 'planned',
    id: 'repeating-list',
    name: '重复明细 / 列表',
    group: 'table',
    icon: RiListCheck3,
    description: '使用行模板重复呈现集合与业务明细',
    keywords: ['重复明细', '列表', '集合', '行模板', '循环'],
    maturity: 'planned',
  },
  {
    kind: 'planned',
    id: 'flowing-data-table',
    name: '数据驱动表格 / 自动分页表格',
    group: 'table',
    icon: RiTableView,
    description: '根据数据生成表格，并在溢出时自动分页',
    keywords: ['数据表格', '自动分页', '表头重复', '行拆分', '溢出'],
    maturity: 'planned',
  },
  {
    kind: 'planned',
    id: 'vector-image',
    name: 'SVG / 图标',
    group: 'image',
    icon: RiShapesLine,
    description: '放置可无损缩放的矢量图形与图标',
    keywords: ['SVG', '矢量', '图标', '无损缩放'],
    maturity: 'planned',
  },
  {
    kind: 'planned',
    id: 'frame',
    name: '容器 / Frame',
    group: 'shape',
    icon: RiLayoutGridLine,
    description: '容纳、裁切并组织一组版面内容',
    keywords: ['容器', 'Frame', '裁切', '子元素', '布局'],
    maturity: 'planned',
  },
] as const satisfies readonly PlannedCatalogItem[]

const availableCatalogItems: AvailableCatalogItem[] = defaultRegistry
  .getCatalogDefinitions()
  .map((definition) => ({
    kind: 'available',
    id: definition.catalog.id,
    type: definition.type,
    name: definition.name,
    category: definition.category,
    group: definition.catalog.group,
    icon: ICONS[definition.type],
    description: definition.catalog.description,
    keywords: definition.catalog.keywords,
    maturity: definition.catalog.maturity,
    creationMode: definition.catalog.creationMode,
  }))

export const componentCatalog: readonly CatalogItem[] = catalogGroups.flatMap((group) => [
  ...availableCatalogItems.filter((item) => item.group === group.id),
  ...plannedCatalogItems.filter((item) => item.group === group.id),
])

export const frequentComponentTypes = [
  'RoySimpleText',
  'RoyImage',
  'RoySimpleTable',
  'RoyQRCode',
] as const satisfies readonly CreatableComponentType[]

export const frequentCatalogItems: readonly AvailableCatalogItem[] = frequentComponentTypes.map(
  (type) => {
    const item = findAvailableCatalogItem(type)
    if (!item) throw new Error(`Missing frequent catalog item: ${type}`)
    return item
  },
)

export function rememberRecentComponentType(
  current: readonly CreatableComponentType[],
  type: CreatableComponentType,
  limit = 4,
): CreatableComponentType[] {
  if (limit <= 0) return []
  return [type, ...current.filter((currentType) => currentType !== type)].slice(0, limit)
}

export function isAvailableCatalogItem(item: CatalogItem): item is AvailableCatalogItem {
  return item.kind === 'available'
}

export function isDrawingComponentType(type: string): type is DrawingComponentType {
  return type === 'RoyLine' || type === 'RoyRect' || type === 'RoyCircle' || type === 'RoyStar'
}

export function isDrawnComponentType(type: string): type is DrawnComponentType {
  return findAvailableCatalogItem(type)?.creationMode === 'draw'
}

export function findAvailableCatalogItem(type: string): AvailableCatalogItem | undefined {
  return componentCatalog.find(
    (item): item is AvailableCatalogItem => item.kind === 'available' && item.type === type,
  )
}

export function searchComponentCatalog(query: string): CatalogItem[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return [...componentCatalog]
  return componentCatalog.filter((item) => {
    const technicalType = item.kind === 'available' ? item.type : ''
    const searchable = [item.name, item.description, technicalType, ...item.keywords]
      .join('\n')
      .toLowerCase()
    return terms.every((term) => searchable.includes(term))
  })
}

export function searchAvailableComponentCatalog(query: string): AvailableCatalogItem[] {
  return searchComponentCatalog(query).filter(isAvailableCatalogItem)
}

export function createComponentSchema(
  type: CreatableComponentType,
  center: ComponentPoint,
  bounds: PageBounds,
): ComponentSchema {
  const definition = defaultRegistry.get(type)
  if (!definition || definition.internal) throw new Error(`Unknown component type: ${type}`)

  const width = finiteSize(definition.defaultStyle.width, 100)
  const height = finiteSize(definition.defaultStyle.height, 40)
  const left = clamp(Math.round(center.x - width / 2), 0, Math.max(0, bounds.width - width))
  const top = clamp(Math.round(center.y - height / 2), 0, Math.max(0, bounds.height - height))

  return {
    id: generateId(),
    component: definition.type,
    icon: definition.icon,
    code: definition.type,
    name: definition.name,
    group: definition.category,
    propValue: deepCopy(definition.defaultProps),
    style: {
      width,
      height,
      rotate: 0,
      opacity: 1,
      ...deepCopy(definition.defaultStyle),
      left,
      top,
    },
    groupStyle: {},
    position: { x: left, y: top },
  }
}

function finiteSize(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}
