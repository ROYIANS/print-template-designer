import type { ComponentBinding } from './data-source'
import type { PlainTextWhiteSpace, TextColumnFill } from './text'

export type ComponentType =
  | 'RoySimpleText'
  | 'RoyText'
  | 'RoySimpleTable'
  | 'RoyComplexTable'
  | 'RoyLine'
  | 'RoyRect'
  | 'RoyCircle'
  | 'RoyStar'
  | 'RoyImage'
  | 'RoyQRCode'
  | 'RoyBarCode'
  | 'RoyGroup'

export type CreatableComponentType = Exclude<ComponentType, 'RoyGroup'>

export type ComponentCategory = 'common' | 'data' | 'shape'

export type ComponentCatalogGroup = 'text' | 'table' | 'image' | 'code' | 'shape'

export type ComponentMaturity = 'basic' | 'complex'

export type ComponentCreationMode = 'insert' | 'draw'

export interface ComponentStyle {
  width: number
  height: number
  rotate: number
  opacity: number
  left?: number
  top?: number
  fontSize?: number
  fontFamily?: string
  color?: string
  background?: string | null
  borderWidth?: number
  borderColor?: string
  borderType?: string
  borderRadius?: string
  padding?: string
  margin?: string
  lineHeight?: string
  letterSpacing?: string
  /** Plain-text whitespace policy; omitted legacy values default to pre-wrap. */
  whiteSpace?: PlainTextWhiteSpace
  /** Number of columns in a text frame; omitted legacy values default to one. */
  columnCount?: number
  /** Gap between text columns in canvas pixels. */
  columnGap?: number
  /** CSS multi-column fill strategy. */
  columnFill?: TextColumnFill
  justifyContent?: string
  alignItems?: string
  fontWeight?: string
  fontStyle?: string
  isUnderLine?: boolean
  isDelLine?: boolean
  elementPosition?: string
  [key: string]: unknown
}

export interface ComponentPosition {
  x?: number
  y?: number
  [key: string]: unknown
}

export interface ComponentSchema {
  id: string
  component: ComponentType
  icon?: string
  code?: string
  name?: string
  group?: ComponentCategory
  propValue: unknown
  style: ComponentStyle
  groupStyle: Record<string, unknown>
  position: ComponentPosition
  isLock?: boolean
  request?: unknown
  /** Canonical Datasource v2 bindings. Static content remains in propValue. */
  bindings?: readonly ComponentBinding[]
}
