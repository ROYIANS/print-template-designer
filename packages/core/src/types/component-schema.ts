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

export type ComponentCategory = 'common' | 'data' | 'shape'

export interface ComponentStyle {
  width: number
  height: number
  rotate: number
  opacity: number
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
}
