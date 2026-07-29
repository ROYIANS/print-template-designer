export type PageSize = 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'B7' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'custom'

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
  title: '新建模板',
  scale: 1,
  background: '#ffffff',
  color: '#212121',
  fontSize: 12,
  fontFamily: 'simhei',
  lineHeight: 1,
}
