/** @vitest-environment jsdom */

import { act, createElement, type ComponentProps } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { TemplateSchema } from '@ptd/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppBar } from '../components/AppBar/AppBar'
import type { DesignerHostCommandController } from '../host'
import { isEditorInteractiveTarget } from '../hooks/useEditorKeyboard'
import { createEditorStore, EditorStoreProvider, type EditorStore } from '../state'

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
    title: 'AppBar test',
    scale: 1,
    background: '#ffffff',
    color: '#222222',
    fontSize: 12,
    fontFamily: 'sans-serif',
    lineHeight: 1,
  },
  pages: [{ id: 'page-1', componentData: [] }],
  dataSource: [],
  dataSet: {},
}

function pointerEvent(type: string): Event {
  const event = new Event(type, { bubbles: true })
  Object.defineProperty(event, 'pointerType', { value: 'mouse' })
  return event
}

describe('AppBar application menu', () => {
  let container: HTMLDivElement
  let root: Root
  let store: EditorStore

  const trigger = (label: string): HTMLButtonElement => {
    const button = Array.from(
      container.querySelectorAll<HTMLButtonElement>('nav[aria-label="应用菜单"] > button'),
    ).find((candidate) => candidate.textContent?.startsWith(label))
    if (!button) throw new Error(`Missing ${label} menu trigger`)
    return button
  }

  const panel = (): HTMLDivElement => {
    const element = container.querySelector<HTMLDivElement>('#ptd-application-menu')
    if (!element) throw new Error('Missing application menu panel')
    return element
  }

  const command = (label: string): HTMLButtonElement => {
    const button = Array.from(
      panel().querySelectorAll<HTMLButtonElement>('.commandGrid button, button'),
    ).find((candidate) => candidate.querySelector('strong')?.textContent === label)
    if (!button) throw new Error(`Missing ${label} command`)
    return button
  }

  const renderAppBar = (props: ComponentProps<typeof AppBar> = {}) => {
    act(() => {
      root.render(
        createElement(
          EditorStoreProvider,
          { store } as ComponentProps<typeof EditorStoreProvider>,
          createElement(AppBar, props),
        ),
      )
    })
  }

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    store = createEditorStore(template)
    renderAppBar()
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
  })

  it('uses the public Foliq brand without changing technical DOM contracts', () => {
    const brand = container.querySelector('[aria-label="Foliq 结构化文档设计器"]')
    expect(brand?.textContent).toContain('Foliq')
    expect(brand?.textContent).toContain('结构化文档设计器')
    expect(panel().id).toBe('ptd-application-menu')
    expect(container.textContent).not.toContain('用户账户（由宿主应用提供）')
  })

  it('uses one control family for workspace and save while preserving hierarchy', () => {
    const hostCommands: DesignerHostCommandController = {
      configured: true,
      document: { id: 'template-1', status: 'clean' },
      getState: () => ({ enabled: true, pending: false }),
      execute: vi.fn(async () => true),
    }
    renderAppBar({ hostCommands })

    const actions = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[data-ptd-control-family="document-action"]'),
    )
    expect(actions).toHaveLength(2)
    expect(actions.map((action) => action.dataset.ptdControlFamily)).toEqual([
      'document-action',
      'document-action',
    ])
    expect(actions.map((action) => action.dataset.variant)).toEqual(['secondary', 'primary'])
    expect(container.querySelector('[aria-label="用户账户（由宿主应用提供）"]')).toBeNull()
  })

  it('ignores hover and focus until a menu trigger is clicked', () => {
    const file = trigger('文件')

    expect(isEditorInteractiveTarget(file)).toBe(true)
    act(() => file.dispatchEvent(pointerEvent('pointerover')))
    expect(panel().getAttribute('aria-hidden')).toBe('true')

    act(() => file.focus())
    expect(panel().getAttribute('aria-hidden')).toBe('true')
  })

  it('opens, switches and closes desktop menus by click', () => {
    const file = trigger('文件')
    const templateMenu = trigger('模板')

    act(() => file.click())
    expect(file.getAttribute('aria-expanded')).toBe('true')
    expect(panel().getAttribute('aria-hidden')).toBe('false')

    act(() => templateMenu.click())
    expect(file.getAttribute('aria-expanded')).toBe('false')
    expect(templateMenu.getAttribute('aria-expanded')).toBe('true')
    expect(panel().textContent).toContain('页面设置')

    act(() => templateMenu.click())
    expect(templateMenu.getAttribute('aria-expanded')).toBe('false')
    expect(panel().getAttribute('aria-hidden')).toBe('true')
  })

  it('moves keyboard focus without opening, then switches categories while open', () => {
    const file = trigger('文件')
    const templateMenu = trigger('模板')

    act(() => {
      file.focus()
      file.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    })
    expect(document.activeElement).toBe(templateMenu)
    expect(panel().getAttribute('aria-hidden')).toBe('true')

    act(() => file.click())
    act(() => {
      file.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    })
    expect(document.activeElement).toBe(templateMenu)
    expect(templateMenu.getAttribute('aria-expanded')).toBe('true')
    expect(panel().textContent).toContain('页面管理')
  })

  it('closes through outside pointer input, focus leaving the header and Escape', () => {
    const file = trigger('文件')
    const outside = document.createElement('button')
    document.body.append(outside)

    act(() => file.click())
    act(() => document.body.dispatchEvent(pointerEvent('pointerdown')))
    expect(panel().getAttribute('aria-hidden')).toBe('true')

    act(() => {
      file.click()
      file.focus()
      outside.focus()
    })
    expect(panel().getAttribute('aria-hidden')).toBe('true')

    act(() => file.click())
    act(() => {
      file.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })
    expect(panel().getAttribute('aria-hidden')).toBe('true')

    outside.remove()
  })

  it('executes real workspace and canvas-assistance commands', async () => {
    const openResource = vi.fn()
    const openInspector = vi.fn()
    renderAppBar({ workspace: { openResource, openInspector } })

    act(() => trigger('模板').click())
    await act(async () => command('数据源').click())
    expect(openResource).toHaveBeenCalledWith('data')
    expect(panel().getAttribute('aria-hidden')).toBe('true')

    act(() => {
      store.addGuide('x', 20)
      trigger('视图').click()
    })
    expect(command('清除全部参考线').disabled).toBe(false)
    await act(async () => command('清除全部参考线').click())
    expect(store.guides.value).toHaveLength(0)
  })

  it('dispatches declared Host commands and exposes pending state', async () => {
    const execute = vi.fn(async () => true)
    const hostCommands: DesignerHostCommandController = {
      configured: true,
      document: { id: 'template-1', status: 'dirty' },
      getState: (id) =>
        id === 'save'
          ? { enabled: true, pending: false }
          : { enabled: false, pending: id === 'open', reason: '功能待接入' },
      execute,
    }
    renderAppBar({ hostCommands })

    act(() => trigger('文件').click())
    expect(command('打开模板').disabled).toBe(true)
    expect(command('打开模板').getAttribute('aria-busy')).toBe('true')

    await act(async () => command('保存模板').click())
    expect(execute).toHaveBeenCalledWith('save')
    expect(panel().getAttribute('aria-hidden')).toBe('true')
  })

  it('organizes low-frequency workflows without duplicating object commands', () => {
    const hostCommands: DesignerHostCommandController = {
      configured: true,
      document: { id: 'template-1', status: 'clean' },
      getState: () => ({ enabled: true, pending: false }),
      execute: vi.fn(async () => true),
    }
    renderAppBar({ hostCommands })

    const menuLabels = Array.from(
      container.querySelectorAll<HTMLButtonElement>('nav[aria-label="应用菜单"] > button'),
    ).map((button) => button.textContent)
    expect(menuLabels.some((label) => label?.startsWith('编辑'))).toBe(false)
    expect(menuLabels.some((label) => label?.startsWith('对象'))).toBe(false)
    expect(menuLabels.some((label) => label?.startsWith('窗口'))).toBe(false)
    expect(menuLabels.some((label) => label?.startsWith('模板'))).toBe(true)
    expect(menuLabels.some((label) => label?.startsWith('帮助'))).toBe(true)

    act(() => trigger('文件').click())
    expect(panel().textContent).toContain('打开模板')
    expect(panel().textContent).toContain('保存模板')
    expect(panel().textContent).toContain('另存为')
    expect(panel().textContent).toContain('版本历史')
    expect(command('版本历史').disabled).toBe(false)

    act(() => trigger('模板').click())
    expect(panel().textContent).toContain('页面设置')
    expect(panel().textContent).toContain('页面管理')
    expect(panel().textContent).toContain('素材资源')
    expect(panel().textContent).toContain('数据源')
    expect(command('模板检查').disabled).toBe(true)

    act(() => trigger('视图').click())
    expect(panel().textContent).toContain('显示标尺')
    expect(panel().textContent).toContain('显示参考线')
    expect(panel().textContent).toContain('锁定 / 解锁参考线')
    expect(panel().textContent).toContain('清除全部参考线')
    expect(command('适合页面').disabled).toBe(true)

    act(() => trigger('帮助').click())
    expect(panel().textContent).toContain('快捷键')
    expect(panel().textContent).toContain('产品介绍')
    expect(panel().textContent).toContain('关于 Foliq')
  })
})
