/** @vitest-environment jsdom */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ComponentSchema, TemplateSchema } from '@ptd/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Designer } from '../components/Designer/Designer'
import { Toolbar } from '../components/Toolbar/Toolbar'
import { EditorStore, EditorStoreProvider } from '../state'

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
    title: 'Floating dock test',
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

const textComponent: ComponentSchema = {
  id: 'text-1',
  component: 'RoySimpleText',
  name: '客户名称',
  propValue: '正文',
  style: { left: 10, top: 12, width: 80, height: 24, rotate: 0, opacity: 1 },
  groupStyle: {},
  position: {},
}

class WideResizeObserver implements ResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  disconnect(): void {}

  observe(target: Element): void {
    this.callback(
      [
        {
          target,
          contentRect: new DOMRectReadOnly(0, 0, 1600, 1000),
        } as ResizeObserverEntry,
      ],
      this,
    )
  }

  unobserve(): void {}
}

function button(scope: ParentNode, name: string): HTMLButtonElement {
  const result = [...scope.querySelectorAll<HTMLButtonElement>('button')].find(
    (candidate) => candidate.getAttribute('aria-label') === name,
  )
  if (!result) throw new Error(`Missing button: ${name}`)
  return result
}

describe('floating tool dock workspace composition', () => {
  let container: HTMLDivElement
  let root: Root
  let rectSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    vi.stubGlobal('ResizeObserver', WideResizeObserver)
    rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      right: 1600,
      bottom: 1000,
      left: 0,
      width: 1600,
      height: 1000,
      toJSON: () => ({}),
    })
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    rectSpy.mockRestore()
    vi.unstubAllGlobals()
    document.body.replaceChildren()
  })

  it('keeps only resource panels in the left rail and moves canvas tools into the main island', async () => {
    await act(async () => root.render(<Designer value={template} />))

    const rail = container.querySelector<HTMLElement>('nav[aria-label="工作区资源面板"]')!
    expect(
      [...rail.querySelectorAll('button')].map((item) => item.getAttribute('aria-label')),
    ).toEqual(['打开素材面板', '关闭页面面板', '打开图层面板', '打开数据面板'])
    expect(rail.querySelector('[aria-label="选择工具"]')).toBeNull()
    expect(rail.querySelector('[aria-label="抓手工具"]')).toBeNull()

    const dock = container.querySelector<HTMLElement>('[data-ptd-region="floating-tool-dock"]')!
    expect(dock).not.toBeNull()
    expect(container.querySelector('[data-ptd-region="command-bar"]')).toBeNull()
    expect(dock.querySelector('[data-ptd-region="context-shelf"]')).not.toBeNull()
    expect(button(dock, '撤销').disabled).toBe(true)
    expect(button(dock, '重做').disabled).toBe(true)
    expect(button(dock, '选择工具').getAttribute('aria-pressed')).toBe('true')
    expect(button(dock, '图片工具')).not.toBeNull()
    expect(button(dock, '自由表格工具')).not.toBeNull()
    expect(button(dock, '更多组件')).not.toBeNull()
    expect(button(dock, '收起属性面板')).not.toBeNull()

    act(() => button(dock, '抓手工具').click())
    expect(button(dock, '抓手工具').getAttribute('aria-pressed')).toBe('true')
    expect(dock.textContent).toContain('拖动画布平移')
  })

  it('encodes the content-fit island and split selection hierarchy', () => {
    const dockCss = readFileSync(
      resolve(process.cwd(), 'src/components/FloatingToolDock/FloatingToolDock.module.css'),
      'utf8',
    )
    const contextCss = readFileSync(
      resolve(process.cwd(), 'src/components/Toolbar/Toolbar.module.css'),
      'utf8',
    )
    const themeCss = readFileSync(
      resolve(process.cwd(), 'src/components/Theme/Theme.module.css'),
      'utf8',
    )
    const designerCss = readFileSync(
      resolve(process.cwd(), 'src/components/Designer/Designer.module.css'),
      'utf8',
    )

    expect(dockCss).toMatch(/context-shelf[^}]*position:\s*absolute/)
    expect(dockCss).toMatch(/context-shelf[^}]*right:\s*24px/)
    expect(dockCss).toMatch(/context-shelf[^}]*bottom:\s*calc\(100% - 5px\)/)
    expect(dockCss).toMatch(/context-shelf[^}]*left:\s*24px/)
    expect(dockCss).toMatch(/context-shelf[^}]*width:\s*auto/)
    expect(dockCss).toMatch(/\.floatingDock\s*{[^}]*width:\s*max-content/)
    expect(dockCss).toMatch(/\.mainDock\s*{[^}]*width:\s*max-content/)
    expect(dockCss).toMatch(/\.mainDock\s*{[^}]*justify-content:\s*center/)
    expect(dockCss).toMatch(/\.mainDock\s*{[^}]*border:\s*0/)
    expect(dockCss).toMatch(/\.mainDock\s*{[^}]*background:\s*var\(--ptd-header-bg\)/)
    expect(dockCss).toMatch(/\.mainDock\s*{[^}]*border-radius:\s*var\(--ptd-radius-surface\)/)
    expect(dockCss).toMatch(/\.mainDock[\s\S]*box-shadow:\s*var\(--ptd-shadow-tool-dock\)/)
    expect(themeCss).toMatch(
      /--ptd-shadow-tool-dock:\s*0 3px 8px rgb\(0 0 0 \/ 35%\), 0 1px 3px rgb\(0 0 0 \/ 50%\),\s*inset 0 0\.5px 0 rgb\(255 255 255 \/ 8%\),\s*inset 0 0 0\.5px rgb\(255 255 255 \/ 30%\);/,
    )
    expect(dockCss).toMatch(/\.dockButton\s*{[^}]*border:\s*0/)
    expect(dockCss).toMatch(
      /\.dockButton\[aria-pressed='true'\]\s*{[^}]*color:\s*var\(--ptd-paper-0\)/,
    )
    expect(dockCss).toMatch(
      /\.dockButton\[aria-pressed='true'\]\s*{[^}]*background:\s*var\(--ptd-selection\)/,
    )
    expect(dockCss).toMatch(/\.dockButton\[aria-pressed='true'\]\s*{[^}]*box-shadow:\s*none/)
    expect(dockCss).toMatch(/\.groupedToolMenu\s*{[^}]*border:\s*0/)
    expect(dockCss).not.toMatch(/box-shadow:\s*inset 0 -/)
    expect(dockCss).not.toContain('var(--ptd-selection-subtle)')
    expect(contextCss).toMatch(/\.toolbar[\s\S]*background:\s*var\(--ptd-surface-sunken\)/)
    expect(contextCss).toMatch(/\.toolbar\s*{[^}]*border:\s*0/)
    expect(contextCss).toMatch(/\.toolbar\s*{[^}]*box-shadow:\s*none/)
    expect(contextCss).toMatch(/\.toolButton\s*{[^}]*border:\s*0/)
    expect(contextCss).toMatch(
      /\.toolButton\s*{[^}]*width:\s*var\(--ptd-control-xs\)[^}]*height:\s*var\(--ptd-control-xs\)/,
    )
    expect(contextCss).toMatch(
      /\.toolButton\[aria-pressed='true'\]\s*{[^}]*color:\s*var\(--ptd-text-strong\)/,
    )
    expect(contextCss).toMatch(
      /\.toolButton\[aria-pressed='true'\]\s*{[^}]*background:\s*var\(--ptd-context-active\)/,
    )
    expect(contextCss).toMatch(/\.toolButton\[aria-pressed='true'\]\s*{[^}]*box-shadow:\s*none/)
    expect(contextCss).not.toContain('var(--ptd-selection-subtle)')
    expect(designerCss).toMatch(
      /grid-template-rows:\s*auto minmax\(0, 1fr\) var\(--ptd-status-bar-height\)/,
    )
  })

  it('shows only the selected component type and geometry without duplicate actions', () => {
    const store = new EditorStore({
      ...template,
      pages: [{ id: 'page-1', componentData: [textComponent] }],
    })
    store.selectComponent(textComponent.id)

    act(() =>
      root.render(
        <EditorStoreProvider store={store}>
          <Toolbar />
        </EditorStoreProvider>,
      ),
    )

    const shelf = container.querySelector<HTMLElement>('[data-ptd-region="context-shelf"]')!
    expect(shelf.textContent).toContain('文本')
    expect(shelf.textContent).not.toContain('客户名称')
    expect(shelf.textContent).not.toContain('RoySimpleText')
    expect(shelf.querySelector('[aria-label="组件几何"]')).not.toBeNull()
    expect(shelf.querySelector('[aria-label="复制组件"]')).toBeNull()
    expect(shelf.querySelector('[aria-label="锁定组件"]')).toBeNull()
    expect(shelf.querySelector('[aria-label="下移一层"]')).toBeNull()
    expect(shelf.querySelector('[aria-label="上移一层"]')).toBeNull()
    expect(shelf.querySelector('[aria-label="删除组件"]')).toBeNull()
  })
})
