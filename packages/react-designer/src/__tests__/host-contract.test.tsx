/** @vitest-environment jsdom */

import { act, createElement, Fragment, useRef, type ComponentProps } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { TemplateSchema } from '@ptd/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StatusBar } from '../components/StatusBar/StatusBar'
import { resolveDesignerHostCommand, useDesignerHostCommands, type DesignerHost } from '../host'
import { useEditorKeyboard } from '../hooks/useEditorKeyboard'
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
    title: 'Host contract',
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

function HostCommandButton({ name, host }: { name: string; host: DesignerHost }) {
  const controller = useDesignerHostCommands(host, () => template)
  const state = controller.getState('save')
  return createElement(
    'button',
    {
      type: 'button',
      'data-name': name,
      'aria-busy': state.pending,
      disabled: !state.enabled || state.pending,
      onClick: () => void controller.execute('save'),
    },
    name,
  )
}

function KeyboardHarness({ host, store }: { host: DesignerHost; store: EditorStore }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const controller = useDesignerHostCommands(host, () => store.template.value)
  useEditorKeyboard(store, rootRef, { hostCommands: controller })
  return (
    <div ref={rootRef} tabIndex={-1} data-keyboard-root>
      <input aria-label="标题" />
    </div>
  )
}

describe('Designer Host contract', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
  })

  it('requires both a declared capability and one shared Host handler', () => {
    expect(resolveDesignerHostCommand(undefined, 'save')).toEqual({
      enabled: false,
      pending: false,
      reason: '功能待接入',
    })
    expect(resolveDesignerHostCommand({ commands: { save: {} } }, 'save')).toEqual({
      enabled: false,
      pending: false,
      reason: '宿主未提供命令处理器',
    })
    expect(
      resolveDesignerHostCommand(
        { commands: { save: { enabled: false, reason: '只读文档' } }, onCommand: vi.fn() },
        'save',
      ),
    ).toEqual({ enabled: false, pending: false, reason: '只读文档' })
  })

  it('prevents duplicate async execution and keeps pending state instance-local', async () => {
    let releaseFirst: (() => void) | undefined
    const firstHandler = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          releaseFirst = resolve
        }),
    )
    const secondHandler = vi.fn(async () => undefined)
    const firstHost: DesignerHost = { commands: { save: {} }, onCommand: firstHandler }
    const secondHost: DesignerHost = { commands: { save: {} }, onCommand: secondHandler }

    act(() => {
      root.render(
        createElement(
          Fragment,
          null,
          createElement(HostCommandButton, { name: 'first', host: firstHost }),
          createElement(HostCommandButton, { name: 'second', host: secondHost }),
        ),
      )
    })
    const first = container.querySelector<HTMLButtonElement>('[data-name="first"]')!
    const second = container.querySelector<HTMLButtonElement>('[data-name="second"]')!

    act(() => {
      first.click()
      first.click()
    })
    expect(firstHandler).toHaveBeenCalledTimes(1)
    expect(first.getAttribute('aria-busy')).toBe('true')
    expect(second.disabled).toBe(false)

    await act(async () => {
      releaseFirst?.()
      await Promise.resolve()
    })
    expect(first.disabled).toBe(false)
  })

  it('passes the current template and document metadata to the Host', async () => {
    const onCommand = vi.fn(async () => undefined)
    const host: DesignerHost = {
      document: { id: 'template-7', title: '出库单', version: 3, status: 'dirty' },
      commands: { save: {} },
      onCommand,
    }
    act(() => root.render(createElement(HostCommandButton, { name: 'save', host })))

    await act(async () => container.querySelector<HTMLButtonElement>('button')!.click())
    expect(onCommand).toHaveBeenCalledWith('save', {
      template,
      document: host.document,
    })
  })

  it('runs enabled Host shortcuts and yields to editable controls', async () => {
    const onCommand = vi.fn(async () => undefined)
    const host: DesignerHost = { commands: { save: {} }, onCommand }
    const store = createEditorStore(template)
    act(() => root.render(createElement(KeyboardHarness, { host, store })))
    const keyboardRoot = container.querySelector<HTMLElement>('[data-keyboard-root]')!

    await act(async () => {
      keyboardRoot.focus()
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        }),
      )
      await Promise.resolve()
    })
    expect(onCommand).toHaveBeenCalledWith('save', { template, document: undefined })

    onCommand.mockClear()
    await act(async () => {
      const input = container.querySelector<HTMLInputElement>('input')!
      input.focus()
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        }),
      )
      await Promise.resolve()
    })
    expect(onCommand).not.toHaveBeenCalled()
  })

  it('renders document title, version and explicit conflict state in the Chrome', () => {
    const store = createEditorStore(template)
    act(() => {
      root.render(
        createElement(
          EditorStoreProvider,
          { store } as ComponentProps<typeof EditorStoreProvider>,
          createElement(StatusBar, {
            document: {
              id: 'template-7',
              title: '出库单',
              version: 3,
              status: 'conflict',
              message: '服务端已有更新',
            },
          }),
        ),
      )
    })
    expect(container.textContent).toContain('出库单')
    expect(container.textContent).toContain('v3')
    expect(container.textContent).toContain('版本冲突')
    expect(container.querySelector('[data-status="conflict"]')?.getAttribute('title')).toBe(
      '服务端已有更新',
    )
  })
})
