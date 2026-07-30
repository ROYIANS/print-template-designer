export type PageSize =
  | 'A1'
  | 'A2'
  | 'A3'
  | 'A4'
  | 'A5'
  | 'A6'
  | 'A7'
  | 'B1'
  | 'B2'
  | 'B3'
  | 'B4'
  | 'B5'
  | 'B6'
  | 'B7'
  | 'C1'
  | 'C2'
  | 'C3'
  | 'C4'
  | 'C5'
  | 'C6'
  | 'C7'
  | 'custom'

export type PageDirection = 'p' | 'l'

export type PageLayout = 'fixed' | 'relative'

export interface PageConfig {
  pageSize: PageSize
  pageDirection: PageDirection
  pageLayout: PageLayout
  pageWidth: number
  pageHeight: number
  pageCurHeight: number
  pageMarginBottom: number
  pageMarginTop: number
  pageMarginLeft: number
  pageMarginRight: number
  title: string
  scale: number
  background: string
  color: string
  fontSize: number
  fontFamily: string
  lineHeight: number
}

export const DEFAULT_PAGE_CONFIG: PageConfig = {
  pageSize: 'A4',
  pageDirection: 'p',
  pageLayout: 'fixed',
  pageWidth: 210,
  pageHeight: 297,
  pageCurHeight: 297,
  pageMarginBottom: 8,
  pageMarginTop: 8,
  pageMarginLeft: 8,
  pageMarginRight: 8,
  title: '新建模板',
  scale: 1,
  background: '#ffffff',
  color: '#212121',
  fontSize: 12,
  fontFamily: 'simhei',
  lineHeight: 1,
}

const PAGE_SIZE_VALUES: ReadonlySet<string> = new Set([
  'A1',
  'A2',
  'A3',
  'A4',
  'A5',
  'A6',
  'A7',
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'B6',
  'B7',
  'C1',
  'C2',
  'C3',
  'C4',
  'C5',
  'C6',
  'C7',
  'custom',
])

export function normalizePageConfig(value: unknown): PageConfig {
  const source = isRecord(value) ? value : {}
  return {
    pageSize: isPageSize(source['pageSize']) ? source['pageSize'] : DEFAULT_PAGE_CONFIG.pageSize,
    pageDirection:
      source['pageDirection'] === 'p' || source['pageDirection'] === 'l'
        ? source['pageDirection']
        : DEFAULT_PAGE_CONFIG.pageDirection,
    pageLayout:
      source['pageLayout'] === 'fixed' || source['pageLayout'] === 'relative'
        ? source['pageLayout']
        : DEFAULT_PAGE_CONFIG.pageLayout,
    pageWidth: positiveNumber(source['pageWidth'], DEFAULT_PAGE_CONFIG.pageWidth),
    pageHeight: positiveNumber(source['pageHeight'], DEFAULT_PAGE_CONFIG.pageHeight),
    pageCurHeight: positiveNumber(source['pageCurHeight'], DEFAULT_PAGE_CONFIG.pageCurHeight),
    pageMarginBottom: nonNegativeNumber(
      source['pageMarginBottom'],
      DEFAULT_PAGE_CONFIG.pageMarginBottom,
    ),
    pageMarginTop: nonNegativeNumber(source['pageMarginTop'], DEFAULT_PAGE_CONFIG.pageMarginTop),
    pageMarginLeft: nonNegativeNumber(source['pageMarginLeft'], DEFAULT_PAGE_CONFIG.pageMarginLeft),
    pageMarginRight: nonNegativeNumber(
      source['pageMarginRight'],
      DEFAULT_PAGE_CONFIG.pageMarginRight,
    ),
    title: stringValue(source['title'], DEFAULT_PAGE_CONFIG.title),
    scale: positiveNumber(source['scale'], DEFAULT_PAGE_CONFIG.scale),
    background: stringValue(source['background'], DEFAULT_PAGE_CONFIG.background),
    color: stringValue(source['color'], DEFAULT_PAGE_CONFIG.color),
    fontSize: positiveNumber(source['fontSize'], DEFAULT_PAGE_CONFIG.fontSize),
    fontFamily: stringValue(source['fontFamily'], DEFAULT_PAGE_CONFIG.fontFamily),
    lineHeight: positiveNumber(source['lineHeight'], DEFAULT_PAGE_CONFIG.lineHeight),
  }
}

export function pageConfigError(config: PageConfig): string | null {
  if (!Number.isFinite(config.pageWidth) || config.pageWidth <= 0) return '页面宽度必须大于 0'
  if (!Number.isFinite(config.pageHeight) || config.pageHeight <= 0) return '页面高度必须大于 0'
  const width = config.pageDirection === 'l' ? config.pageHeight : config.pageWidth
  const height = config.pageDirection === 'l' ? config.pageWidth : config.pageHeight
  const margins = [
    config.pageMarginTop,
    config.pageMarginRight,
    config.pageMarginBottom,
    config.pageMarginLeft,
  ]
  if (margins.some((margin) => !Number.isFinite(margin) || margin < 0)) {
    return '页面边距不能为负数'
  }
  if (config.pageMarginLeft + config.pageMarginRight >= width) {
    return `左右边距之和必须小于页面宽度 ${width} mm`
  }
  if (config.pageMarginTop + config.pageMarginBottom >= height) {
    return `上下边距之和必须小于页面高度 ${height} mm`
  }
  if (!Number.isFinite(config.fontSize) || config.fontSize <= 0) return '默认字号必须大于 0'
  if (!Number.isFinite(config.lineHeight) || config.lineHeight <= 0) return '默认行高必须大于 0'
  return null
}

function isPageSize(value: unknown): value is PageSize {
  return typeof value === 'string' && PAGE_SIZE_VALUES.has(value)
}

function positiveNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback
}

function nonNegativeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
