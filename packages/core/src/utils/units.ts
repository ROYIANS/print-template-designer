import { COMMON_SCALE, PAGE_SIZES } from '../constants/page-sizes'
import type { PageConfig } from '../types/page-config'

export function mmToPx(mm: number): number {
  return mm * COMMON_SCALE
}

export function pxToMm(px: number): number {
  return px / COMMON_SCALE
}

export interface PageDimensions {
  width: number
  height: number
}

export function getPageDimensions(config: PageConfig): PageDimensions {
  const { pageDirection, pageWidth, pageHeight } = config
  const isLandscape = pageDirection === 'l'
  return {
    width: mmToPx(isLandscape ? pageHeight : pageWidth),
    height: mmToPx(isLandscape ? pageWidth : pageHeight),
  }
}

export function getPageSizeDimensions(sizeName: string): PageDimensions | null {
  const size = PAGE_SIZES[sizeName]
  if (!size) return null
  return { width: mmToPx(size.w), height: mmToPx(size.h) }
}
