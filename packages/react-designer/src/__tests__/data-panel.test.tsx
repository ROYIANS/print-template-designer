/** @vitest-environment jsdom */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  DATA_SOURCE_LIMITS,
  createSimpleTableProps,
  type ComponentSchema,
  type TemplateSchema,
} from '@ptd/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DataPanel } from '../components/DataPanel/DataPanel'
import { EditorStore, EditorStoreProvider } from '../state'

function baseComponent(
  id: string,
  component: ComponentSchema['component'],
  propValue: unknown,
): ComponentSchema {
  return {
    id,
    component,
    name: component === 'RoySimpleText' ? '订单文本' : '自由表格',
    propValue,
    style: { left: 0, top: 0, width: 200, height: 50, rotate: 0, opacity: 1 },
    groupStyle: {},
    position: {},
  }
}

function dataTemplate(): TemplateSchema {
  return {
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
      title: '冷链出库标签',
      scale: 1,
      background: '#ffffff',
      color: '#222222',
      fontSize: 12,
      fontFamily: 'sans-serif',
      lineHeight: 1.2,
    },
    pages: [
      {
        id: 'page-1',
        componentData: [
          baseComponent('text', 'RoySimpleText', '出库单：'),
          baseComponent('table', 'RoySimpleTable', createSimpleTableProps()),
        ],
      },
    ],
    data: {
      version: 1,
      fields: [
        {
          id: 'field-order',
          name: '订单',
          path: ['order'],
          valueType: 'object',
          children: [
            { id: 'field-order-no', name: '出库单号', path: ['order', 'no'], valueType: 'string' },
            { id: 'field-amount', name: '货值', path: ['order', 'amount'], valueType: 'number' },
          ],
        },
      ],
      sampleRecords: [{ order: { no: 'CC-2026-0815', amount: 12800 } }],
    },
  }
}

function click(element: Element): void {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

function button(container: HTMLElement, name: string): HTMLButtonElement {
  const result = [...container.querySelectorAll('button')].find(
    (item) => item.textContent?.trim() === name || item.getAttribute('aria-label') === name,
  )
  if (!result) throw new Error(`Missing button: ${name}`)
  return result
}

function inputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
  setter?.call(element, value)
  element.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('DataPanel', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    container.style.width = '280px'
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  function render(store: EditorStore) {
    act(() =>
      root.render(
        <EditorStoreProvider store={store}>
          <DataPanel onClose={() => undefined} />
        </EditorStoreProvider>,
      ),
    )
  }

  it('preflights pasted JSON and applies inferred fields plus samples as one history step', () => {
    const onChange = vi.fn()
    const store = new EditorStore(dataTemplate(), { onChange })
    render(store)

    act(() => click(button(container, '导入 JSON')))
    const textarea = container.querySelector('textarea')!
    const json = JSON.stringify([{ shipment: { code: 'SH-001', cold: true } }])
    act(() => inputValue(textarea, json))
    act(() => click(button(container, '检查数据结构')))

    expect(container.textContent).toContain('导入检查')
    expect(container.textContent).toContain('记录')
    expect(container.textContent).toContain('字段')
    expect(button(container, '应用字段与样例').disabled).toBe(false)
    act(() => click(button(container, '应用字段与样例')))

    expect(store.normalizedTemplateData.value.data.sampleRecords).toEqual([
      { shipment: { code: 'SH-001', cold: true } },
    ])
    expect(store.normalizedTemplateData.value.data.fields[0]?.name).toBe('shipment')
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('keeps invalid and oversized paste drafts visible and prevents applying them', () => {
    const store = new EditorStore(dataTemplate())
    render(store)
    act(() => click(button(container, '导入 JSON')))
    const textarea = container.querySelector('textarea')!
    act(() => inputValue(textarea, '{not json'))
    act(() => click(button(container, '检查数据结构')))
    expect(container.textContent).toContain('JSON 解析失败')
    expect(button(container, '应用字段与样例').disabled).toBe(true)
    act(() => click(button(container, '返回修改')))
    expect(container.querySelector('textarea')?.value).toBe('{not json')

    const oversized = `{"value":"${'x'.repeat(DATA_SOURCE_LIMITS.maxBytes)}"}`
    act(() => inputValue(container.querySelector('textarea')!, oversized))
    act(() => click(button(container, '检查数据结构')))
    expect(container.textContent).toContain('超过上限')
    expect(button(container, '应用字段与样例').disabled).toBe(true)
  })

  it('rejects an oversized dropped file before FileReader loads it into memory', () => {
    const store = new EditorStore(dataTemplate())
    const read = vi.spyOn(FileReader.prototype, 'readAsText')
    render(store)
    const dropControl = button(container, '选择文件').parentElement!
    const file = new File([new Uint8Array(DATA_SOURCE_LIMITS.maxBytes + 1)], 'too-large.json', {
      type: 'application/json',
    })
    const event = new Event('drop', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'dataTransfer', { value: { files: [file] } })

    act(() => dropControl.dispatchEvent(event))
    expect(container.textContent).toContain('超过上限')
    expect(read).not.toHaveBeenCalled()
    read.mockRestore()
  })

  it('searches nested fields and edits display name plus formatter without changing identity', () => {
    const onChange = vi.fn()
    const store = new EditorStore(dataTemplate(), { onChange })
    render(store)

    const search = container.querySelector<HTMLInputElement>('input[placeholder="搜索名称或路径"]')!
    act(() => inputValue(search, 'amount'))
    expect(container.textContent).toContain('货值')
    expect(container.textContent).not.toContain('出库单号')
    act(() => click(button(container, '清除字段搜索')))

    act(() => click(button(container, '编辑字段 货值')))
    const name = container.querySelector<HTMLInputElement>('input:not([placeholder]):not([type])')!
    act(() => inputValue(name, '申报货值'))
    act(() => click(button(container, '人民币')))
    act(() => click(button(container, '保存字段')))

    const field = store.normalizedTemplateData.value.data.fields[0]?.children?.[1]
    expect(field).toMatchObject({
      id: 'field-amount',
      path: ['order', 'amount'],
      name: '申报货值',
      formatter: { kind: 'currency', currency: 'CNY' },
    })
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('composes literal and multiple field tokens, then unbinds through explicit controls', () => {
    const store = new EditorStore(dataTemplate(), { idFactory: () => 'binding-1' })
    store.selectComponent('text')
    render(store)

    act(() => click(button(container, '加入组合文本：出库单号，路径 order.no')))
    act(() => click(button(container, '加入组合文本：货值，路径 order.amount')))
    expect(container.textContent).toContain('出库单号')
    expect(container.textContent).toContain('货值')
    act(() => click(button(container, '应用组合文本')))

    expect(store.components.value[0]?.bindings?.[0]?.expression).toEqual({
      kind: 'text',
      segments: [
        { kind: 'literal', value: '出库单：' },
        { kind: 'field', fieldId: 'field-order-no' },
        { kind: 'field', fieldId: 'field-amount' },
      ],
    })
    expect(store.history.value).toHaveLength(2)
    act(() => click(button(container, '解除文本内容绑定')))
    expect(store.components.value[0]?.bindings).toEqual([])
  })

  it('explains multi-select, locked and table-cell states instead of exposing false actions', () => {
    const store = new EditorStore(dataTemplate())
    store.selectComponents(['text', 'table'])
    render(store)
    expect(container.textContent).toContain('多选状态不能建立字段绑定')

    act(() => store.selectComponent('text'))
    act(() => store.setLock(true))
    expect(container.textContent).toContain('当前组件已锁定')

    act(() => store.selectComponent('table'))
    expect(container.textContent).toContain('选择自由表格中的一个单元格')
    act(() => store.selectTableCell('table', 0, 0))
    expect(container.textContent).toContain('单元格')
  })

  it('switches proof records with zero template history and exposes a narrow, non-overflow region contract', () => {
    const onChange = vi.fn()
    const store = new EditorStore(dataTemplate(), { onChange })
    container.style.width = '390px'
    render(store)
    const region = container.querySelector('[data-ptd-region="data-panel"]')
    expect(region).not.toBeNull()
    expect(container.style.width).toBe('390px')

    act(() => click(button(container, '数据校样')))
    expect(store.proofMode.value).toBe(true)
    expect(container.textContent).toContain('1 / 1')
    expect(store.history.value).toHaveLength(1)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('lets Escape close only the import surface and restores focus to its trigger', async () => {
    const store = new EditorStore(dataTemplate())
    render(store)
    const trigger = button(container, '导入 JSON')
    act(() => click(trigger))
    expect(container.textContent).toContain('粘贴 JSON 数据')

    act(() =>
      container
        .querySelector('[data-ptd-region="data-panel"]')
        ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
    )
    await act(async () => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))))
    expect(container.textContent).not.toContain('粘贴 JSON 数据')
    expect(document.activeElement?.textContent).toContain('导入 JSON')
  })

  it('preserves import drafts across internal mutations and clears them for external templates', () => {
    const store = new EditorStore(dataTemplate())
    render(store)
    act(() => click(button(container, '导入 JSON')))
    const textarea = container.querySelector('textarea')!
    act(() => inputValue(textarea, '{"draft":true}'))

    act(() => store.updateDataField('field-order-no', { name: '业务单号' }))
    expect(container.querySelector('textarea')?.value).toBe('{"draft":true}')

    act(() =>
      store.syncExternal({
        ...dataTemplate(),
        pageConfig: { ...dataTemplate().pageConfig, title: '外部模板' },
      }),
    )
    expect(container.textContent).not.toContain('粘贴 JSON 数据')
    expect(container.textContent).toContain('数据来源')
  })
})
