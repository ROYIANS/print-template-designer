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
    const edit = trigger('编辑')

    act(() => file.click())
    expect(file.getAttribute('aria-expanded')).toBe('true')
    expect(panel().getAttribute('aria-hidden')).toBe('false')

    act(() => edit.click())
    expect(file.getAttribute('aria-expanded')).toBe('false')
    expect(edit.getAttribute('aria-expanded')).toBe('true')
    expect(panel().textContent).toContain('撤销')

    act(() => edit.click())
    expect(edit.getAttribute('aria-expanded')).toBe('false')
    expect(panel().getAttribute('aria-hidden')).toBe('true')
  })

  it('moves keyboard focus without opening, then switches categories while open', () => {
    const file = trigger('文件')
    const edit = trigger('编辑')

    act(() => {
      file.focus()
      file.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    })
    expect(document.activeElement).toBe(edit)
    expect(panel().getAttribute('aria-hidden')).toBe('true')

    act(() => file.click())
    act(() => {
      file.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    })
    expect(document.activeElement).toBe(edit)
    expect(edit.getAttribute('aria-expanded')).toBe('true')
    expect(panel().textContent).toContain('撤销')
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

  it('executes real EditorStore commands and disables unavailable ones', async () => {
    act(() => store.addPage())
    expect(store.template.value.pages).toHaveLength(2)

    act(() => trigger('编辑').click())
    expect(command('撤销').disabled).toBe(false)
    expect(command('剪切').disabled).toBe(true)

    await act(async () => command('撤销').click())
    expect(store.template.value.pages).toHaveLength(1)
    expect(panel().getAttribute('aria-hidden')).toBe('true')
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

  it('opens real workspace panels and leaves planned commands disabled', async () => {
    const openResource = vi.fn()
    renderAppBar({
      workspace: {
        resourcesOpen: false,
        inspectorOpen: false,
        openResource,
        toggleInspector: vi.fn(),
      },
    })

    act(() => trigger('窗口').click())
    await act(async () => command('页面面板').click())
    expect(openResource).toHaveBeenCalledWith('pages')

    act(() => trigger('视图').click())
    expect(command('适合页面').disabled).toBe(true)
    expect(command('适合页面').getAttribute('aria-label')).toContain('等待画布可视区域测量合同')
  })
})
