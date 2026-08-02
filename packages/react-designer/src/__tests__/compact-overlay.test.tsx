/** @vitest-environment jsdom */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { TemplateSchema } from '@ptd/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Designer } from '../components/Designer/Designer'

const template: TemplateSchema = {
  _version: 1,
  pageConfig: {
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
    title: 'Compact overlay test',
    scale: 1,
    background: '#ffffff',
    color: '#222222',
    fontSize: 12,
    fontFamily: 'sans-serif',
    lineHeight: 1,
  },
  pages: [{ id: 'page-1', componentData: [] }],
  data: { version: 1, fields: [] },
}

class CompactResizeObserver implements ResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  disconnect(): void {}

  observe(target: Element): void {
    this.callback(
      [
        {
          target,
          contentRect: new DOMRectReadOnly(0, 0, 390, 844),
        } as ResizeObserverEntry,
      ],
      this,
    )
  }

  unobserve(): void {}
}

function button(container: HTMLElement, name: string): HTMLButtonElement {
  const result = [...container.querySelectorAll('button')].find(
    (candidate) =>
      candidate.textContent?.trim() === name || candidate.getAttribute('aria-label') === name,
  )
  if (!result) throw new Error(`Missing button: ${name}`)
  return result
}

describe('compact workspace overlay stacking', () => {
  let container: HTMLDivElement
  let root: Root
  let rectSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    vi.stubGlobal('ResizeObserver', CompactResizeObserver)
    rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      right: 390,
      bottom: 844,
      left: 0,
      width: 390,
      height: 844,
      toJSON: () => ({}),
    })
    container = document.createElement('div')
    container.style.width = '390px'
    container.style.height = '844px'
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    rectSpy.mockRestore()
    vi.unstubAllGlobals()
    container.remove()
  })

  it('keeps the open resource Sidebar above the scrim while the canvas scrim still closes it', async () => {
    await act(async () => root.render(<Designer value={template} />))
    const workspace = container.querySelector<HTMLElement>('[data-mode="compact"]')!
    expect(workspace.dataset.resourcesOpen).toBe('false')

    act(() => button(container, '打开数据面板').click())
    const sidebar = container.querySelector<HTMLElement>('[data-ptd-region="left-sidebar"]')!
    const scrim = button(container, '关闭工作区面板')

    expect(workspace.dataset.resourcesOpen).toBe('true')
    expect(sidebar.dataset.open).toBe('true')
    const css = readFileSync(
      resolve(process.cwd(), 'src/components/Designer/Designer.module.css'),
      'utf8',
    )
    expect(css).toMatch(
      /data-mode='compact'][\s\S]*data-resources-open='true'][\s\S]*left-sidebar[\s\S]*z-index:\s*var\(--ptd-layer-sticky\)/,
    )
    expect(css).toMatch(/\.overlayScrim[\s\S]*z-index:\s*var\(--ptd-layer-scrim\)/)

    act(() => button(container, '导入 JSON').click())
    expect(container.textContent).toContain('粘贴 JSON 数据')
    expect(button(container, '关闭工作区面板')).toBe(scrim)

    act(() => scrim.click())
    expect(workspace.dataset.resourcesOpen).toBe('false')
    expect(container.querySelector('[aria-label="关闭工作区面板"]')).toBeNull()
  })
})
