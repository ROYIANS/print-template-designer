import type { OutputDiagnostic, OutputDocument } from '@ptd/core'
import { waitForOutputReady } from './readiness'
import { measureTextOverflow, TEXT_OVERFLOW_TOLERANCE_PX } from './textOverflow'

export interface OutputPreflightOptions {
  readonly timeoutMs?: number
  readonly overflowTolerancePx?: number
}

/** The single browser-side preflight used by proof preview and Chromium PDF output. */
export async function preflightOutputDocument(
  root: HTMLElement,
  output: OutputDocument,
  options: OutputPreflightOptions = {},
): Promise<readonly OutputDiagnostic[]> {
  const readiness = await waitForOutputReady(root, options.timeoutMs)
  return [
    ...output.diagnostics,
    ...readiness,
    ...measureTextOverflow(root, options.overflowTolerancePx ?? TEXT_OVERFLOW_TOLERANCE_PX),
    ...pageDiagnostics(root),
  ]
}

function pageDiagnostics(root: HTMLElement): readonly OutputDiagnostic[] {
  const diagnostics: OutputDiagnostic[] = []
  for (const page of root.querySelectorAll<HTMLElement>('[data-ptd-output-page]')) {
    const pageNumber = positiveInteger(page.dataset.ptdOutputPage)
    const fragments = Array.from(page.querySelectorAll<HTMLElement>('[data-ptd-output-fragment]'))
    if (fragments.length === 0) {
      diagnostics.push({
        severity: 'warning',
        code: 'EMPTY_PAGE',
        message: '输出页面没有可打印组件。',
        ...(pageNumber === undefined ? {} : { pageNumber }),
      })
    }
    const canvas = page.querySelector<HTMLElement>('[data-ptd-output-logical-canvas]')
    if (!canvas) continue
    const canvasBounds = canvas.getBoundingClientRect()
    if (canvasBounds.width <= 0 || canvasBounds.height <= 0) continue
    for (const fragment of fragments) {
      const bounds = fragment.getBoundingClientRect()
      if (bounds.width <= 0 || bounds.height <= 0 || inside(bounds, canvasBounds)) continue
      const sourceComponentId = fragment.dataset.ptdSourceComponent
      const fragmentIndex = nonNegativeInteger(fragment.dataset.ptdFragmentIndex)
      diagnostics.push({
        severity: 'error',
        code: 'PAGE_BOUNDS_EXCEEDED',
        message: '组件的实际边界超出输出页面；请调整位置、尺寸或旋转角度。',
        ...(sourceComponentId ? { sourceComponentId } : {}),
        ...(pageNumber === undefined ? {} : { pageNumber }),
        ...(fragmentIndex === undefined ? {} : { fragmentIndex }),
      })
    }
  }
  return diagnostics
}

function inside(value: DOMRect, container: DOMRect): boolean {
  const tolerance = TEXT_OVERFLOW_TOLERANCE_PX
  return (
    value.left >= container.left - tolerance &&
    value.top >= container.top - tolerance &&
    value.right <= container.right + tolerance &&
    value.bottom <= container.bottom + tolerance
  )
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
