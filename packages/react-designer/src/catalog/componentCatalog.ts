import type { ComponentCategory, ComponentSchema, ComponentType } from '@ptd/core'
import { defaultRegistry } from '@ptd/core'
import type { RemixiconComponentType } from '@remixicon/react'
import {
  RiBarcodeLine,
  RiCheckboxBlankCircleLine,
  RiImage2Line,
  RiQrCodeLine,
  RiRectangleLine,
  RiStarLine,
  RiSubtractLine,
  RiTBoxLine,
  RiTable2,
  RiTableLine,
  RiText,
} from '@remixicon/react'
import { deepCopy, generateId } from '../utils'

export const PTD_COMPONENT_MIME = 'application/x-ptd-component'

export interface CatalogItem {
  type: Exclude<ComponentType, 'RoyGroup'>
  name: string
  category: ComponentCategory
  icon: RemixiconComponentType
  description: string
}

export interface ComponentPoint {
  x: number
  y: number
}

export interface PageBounds {
  width: number
  height: number
}

const ICONS: Record<Exclude<ComponentType, 'RoyGroup'>, RemixiconComponentType> = {
  RoySimpleText: RiText,
  RoyText: RiTBoxLine,
  RoySimpleTable: RiTable2,
  RoyComplexTable: RiTableLine,
  RoyLine: RiSubtractLine,
  RoyRect: RiRectangleLine,
  RoyCircle: RiCheckboxBlankCircleLine,
  RoyStar: RiStarLine,
  RoyImage: RiImage2Line,
  RoyQRCode: RiQrCodeLine,
  RoyBarCode: RiBarcodeLine,
}

const DESCRIPTIONS: Record<Exclude<ComponentType, 'RoyGroup'>, string> = {
  RoySimpleText: '短文本与字段标签',
  RoyText: '多行富文本内容',
  RoySimpleTable: '规则数据表格',
  RoyComplexTable: '复杂表头与分组',
  RoyLine: '分隔与辅助线',
  RoyRect: '边框与色块',
  RoyCircle: '圆形与印章底形',
  RoyStar: '强调标记图形',
  RoyImage: '图片与品牌标识',
  RoyQRCode: '二维码数据',
  RoyBarCode: '一维条形码',
}

function isPaletteType(type: ComponentType): type is Exclude<ComponentType, 'RoyGroup'> {
  return type !== 'RoyGroup'
}

export const componentCatalog: CatalogItem[] = defaultRegistry
  .getAll()
  .filter((definition) => isPaletteType(definition.type))
  .map((definition) => ({
    type: definition.type as Exclude<ComponentType, 'RoyGroup'>,
    name: definition.name,
    category: definition.category,
    icon: ICONS[definition.type as Exclude<ComponentType, 'RoyGroup'>],
    description: DESCRIPTIONS[definition.type as Exclude<ComponentType, 'RoyGroup'>],
  }))

export function createComponentSchema(
  type: Exclude<ComponentType, 'RoyGroup'>,
  center: ComponentPoint,
  bounds: PageBounds,
): ComponentSchema {
  const definition = defaultRegistry.get(type)
  if (!definition) throw new Error(`Unknown component type: ${type}`)

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
