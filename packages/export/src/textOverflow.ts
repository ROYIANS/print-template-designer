import type { OutputDiagnostic } from '@ptd/core'

export const TEXT_OVERFLOW_TOLERANCE_PX = 0.5

const TEXT_CONTENT_SELECTOR = '.ptd-simple-text__inner, .ptd-text__inner'

/** Measures rendered text frames. Call only after output readiness and stable-layout checks complete. */
export function measureTextOverflow(
  root: HTMLElement,
  tolerancePx = TEXT_OVERFLOW_TOLERANCE_PX,
): readonly OutputDiagnostic[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TEXT_CONTENT_SELECTOR))
    .map((content) => textOverflowDiagnostic(content, tolerancePx))
    .filter((diagnostic): diagnostic is OutputDiagnostic => diagnostic !== null)
}

function textOverflowDiagnostic(
  content: HTMLElement,
  tolerancePx: number,
): OutputDiagnostic | null {
  const horizontalOverflowPx = positiveOverflow(content.scrollWidth, content.clientWidth)
  const verticalOverflowPx = positiveOverflow(content.scrollHeight, content.clientHeight)
  if (horizontalOverflowPx <= tolerancePx && verticalOverflowPx <= tolerancePx) return null

  const source = content.closest<HTMLElement>('[data-ptd-source-component]')
  const page = content.closest<HTMLElement>('[data-ptd-output-page]')
  const sourceComponentId = source?.dataset.ptdSourceComponent
  const pageNumber = positiveInteger(page?.dataset.ptdOutputPage)
  const fragmentIndex = nonNegativeInteger(source?.dataset.ptdFragmentIndex)
  const horizontal = roundMeasurement(horizontalOverflowPx)
  const vertical = roundMeasurement(verticalOverflowPx)
  return {
    severity: 'error',
    code: 'TEXT_OVERFLOW',
    message: `文字内容超出文本框：横向 ${horizontal}px，纵向 ${vertical}px。`,
    ...(sourceComponentId ? { sourceComponentId } : {}),
    ...(pageNumber === undefined ? {} : { pageNumber }),
    ...(fragmentIndex === undefined ? {} : { fragmentIndex }),
    horizontalOverflowPx: horizontal,
    verticalOverflowPx: vertical,
  }
}

function positiveOverflow(contentSize: number, frameSize: number): number {
  if (!Number.isFinite(contentSize) || !Number.isFinite(frameSize)) return 0
  return Math.max(0, contentSize - frameSize)
}

function roundMeasurement(value: number): number {
  return Math.round(value * 100) / 100
}

function positiveInteger(value: string | undefined): number | undefined {
  if (value === undefined) return undefined
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : undefined
}

function nonNegativeInteger(value: string | undefined): number | undefined {
  if (value === undefined) return undefined
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 ? number : undefined
}
