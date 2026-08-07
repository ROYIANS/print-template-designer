import { afterEach, describe, expect, it, vi } from 'vitest'
import type { OutputDocument } from '@ptd/core'
import { preflightOutputDocument } from '../preflight'
import { measureTextOverflow } from '../textOverflow'

afterEach(() => {
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

describe('output preflight', () => {
  it.each([
    ['plain text', 'ptd-simple-text__inner'],
    ['rich text', 'ptd-text__inner'],
  ])('reports measured overflow for %s with source and page context', (_label, className) => {
    const root = textFrame(className)
    const content = root.querySelector<HTMLElement>(`.${className}`)!
    dimensions(content, { scrollWidth: 128, clientWidth: 100, scrollHeight: 76, clientHeight: 40 })

    expect(measureTextOverflow(root)).toEqual([
      {
        severity: 'error',
        code: 'TEXT_OVERFLOW',
        message: '文字内容超出文本框：横向 28px，纵向 36px。',
        sourceComponentId: 'chinese-long-text',
        pageNumber: 2,
        fragmentIndex: 0,
        horizontalOverflowPx: 28,
        verticalOverflowPx: 36,
      },
    ])
  })

  it('ignores sub-pixel differences within the 0.5px tolerance', () => {
    const root = textFrame('ptd-simple-text__inner')
    const content = root.querySelector<HTMLElement>('.ptd-simple-text__inner')!
    dimensions(content, {
      scrollWidth: 100.5,
      clientWidth: 100,
      scrollHeight: 40.49,
      clientHeight: 40,
    })

    expect(measureTextOverflow(root)).toEqual([])
  })

  it('combines compiler, readiness, overflow and empty-page diagnostics in one entry point', async () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(performance.now())
      return 1
    })
    const root = textFrame('ptd-simple-text__inner')
    const content = root.querySelector<HTMLElement>('.ptd-simple-text__inner')!
    dimensions(content, { scrollWidth: 100, clientWidth: 100, scrollHeight: 60, clientHeight: 40 })
    const output = outputDocument()

    const diagnostics = await preflightOutputDocument(root, output, { timeoutMs: 1_000 })

    expect(diagnostics).toContainEqual(output.diagnostics[0])
    expect(diagnostics).toContainEqual(
      expect.objectContaining({ code: 'TEXT_OVERFLOW', sourceComponentId: 'chinese-long-text' }),
    )
  })

  it('reports overflow from the final multi-column frame with its semantic source identity', () => {
    const root = textFrame('ptd-simple-text__inner')
    const content = root.querySelector<HTMLElement>('.ptd-simple-text__inner')!
    content.dataset.ptdColumns = 'true'
    content.style.setProperty('--ptd-column-count', '2')
    content.style.setProperty('--ptd-column-gap', '16px')
    dimensions(content, {
      scrollWidth: 336,
      clientWidth: 320,
      scrollHeight: 120,
      clientHeight: 120,
    })

    expect(measureTextOverflow(root)).toContainEqual(
      expect.objectContaining({
        code: 'TEXT_OVERFLOW',
        sourceComponentId: 'chinese-long-text',
        horizontalOverflowPx: 16,
        verticalOverflowPx: 0,
      }),
    )
  })
})

function textFrame(className: string): HTMLElement {
  const root = document.createElement('div')
  root.innerHTML = `
    <section data-ptd-output-page="2">
      <div data-ptd-output-logical-canvas="2">
        <div data-ptd-output-fragment="text:fragment:0" data-ptd-source-component="chinese-long-text" data-ptd-fragment-index="0">
          <div class="${className}">这是用于跨层输出回归的中文长文本。</div>
        </div>
      </div>
    </section>
  `
  document.body.append(root)
  return root
}

function dimensions(
  element: HTMLElement,
  value: Pick<HTMLElement, 'scrollWidth' | 'clientWidth' | 'scrollHeight' | 'clientHeight'>,
): void {
  for (const [property, measurement] of Object.entries(value)) {
    Object.defineProperty(element, property, { configurable: true, value: measurement })
  }
}

function outputDocument(): OutputDocument {
  return {
    pages: [],
    diagnostics: [
      {
        severity: 'warning',
        code: 'ROW_TOO_TALL',
        message: '编译阶段诊断。',
        sourceComponentId: 'detail-row',
      },
    ],
    metadata: {
      title: '输出测试',
      generatedAt: '2026-08-07T00:00:00.000Z',
      locale: 'zh-CN',
      timeZone: 'Asia/Shanghai',
    },
  }
}
