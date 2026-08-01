/** @vitest-environment jsdom */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  createSimpleTableProps,
  type ComponentBinding,
  type ComponentSchema,
  type RenderContext,
  type TemplateSchema,
} from '@ptd/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ComponentRenderer } from '../components/Canvas/ComponentRenderer'
import { createEditorStore, EditorStoreProvider } from '../state'

const fields = [
  { id: 'field-order', name: '订单号', path: ['orderNo'], valueType: 'string' as const },
  { id: 'field-logo', name: '品牌图片', path: ['logo'], valueType: 'string' as const },
  { id: 'field-cell', name: '冷链要求', path: ['coldChain'], valueType: 'string' as const },
  { id: 'field-rich', name: '客户备注', path: ['note'], valueType: 'string' as const },
  { id: 'field-missing', name: '缺失字段', path: ['missing'], valueType: 'string' as const },
  { id: 'field-count', name: '件数', path: ['count'], valueType: 'number' as const },
]

const context = (orderNo: string, note = '<img src=x onerror=alert(1)>'): RenderContext => ({
  data: {
    orderNo,
    logo: 'https://assets.example.com/cold-chain.png',
    coldChain: '2–8 ℃ 全程冷藏',
    note,
    count: 12,
  },
  record: {
    orderNo,
    logo: 'https://assets.example.com/cold-chain.png',
    coldChain: '2–8 ℃ 全程冷藏',
    note,
    count: 12,
  },
  recordIndex: 0,
  locale: 'zh-CN',
  timeZone: 'Asia/Shanghai',
  now: '2026-08-01T02:00:00.000Z',
  mode: 'proof',
})

function binding(
  id: string,
  target: ComponentBinding['target'],
  fieldId: string,
): ComponentBinding {
  return { id, target, expression: { kind: 'field', fieldId } }
}

function component(
  id: string,
  componentType: ComponentSchema['component'],
  propValue: unknown,
  bindings?: readonly ComponentBinding[],
): ComponentSchema {
  return {
    id,
    component: componentType,
    name: id,
    propValue,
    style: { left: 0, top: 0, width: 240, height: 80, rotate: 0, opacity: 1 },
    groupStyle: {},
    position: {},
    ...(bindings ? { bindings } : {}),
  }
}

function boundComponents(): ComponentSchema[] {
  const table = createSimpleTableProps()
  return [
    component('text', 'RoySimpleText', '静态订单', [
      {
        id: 'binding-text',
        target: { kind: 'text' },
        expression: {
          kind: 'text',
          segments: [
            { kind: 'literal', value: '订单：' },
            { kind: 'field', fieldId: 'field-order' },
          ],
        },
      },
    ]),
    component(
      'image',
      'RoyImage',
      { src: '', alt: '冷链标识', fit: 'contain', position: 'center' },
      [binding('binding-image', { kind: 'image-source' }, 'field-logo')],
    ),
    component('table', 'RoySimpleTable', table, [
      binding('binding-cell', { kind: 'table-cell-text', cellId: 'cell-1' }, 'field-cell'),
    ]),
    component('legacy', 'RoySimpleText', '旧合同：[::orderNo::]'),
    component('rich', 'RoyText', '<p>静态备注</p>', [
      binding('binding-rich', { kind: 'rich-text' }, 'field-rich'),
    ]),
    component('missing', 'RoySimpleText', '静态兜底', [
      binding('binding-missing', { kind: 'text' }, 'field-missing'),
    ]),
    component('invalid', 'RoyImage', { src: '', alt: '', fit: 'contain', position: 'center' }, [
      binding('binding-invalid', { kind: 'image-source' }, 'field-count'),
    ]),
    component('group', 'RoyGroup', [
      component('group-text', 'RoySimpleText', '组合静态内容', [
        binding('binding-group-text', { kind: 'text' }, 'field-order'),
      ]),
    ]),
  ]
}

function template(components = boundComponents()): TemplateSchema {
  return {
    _version: 1,
    pageConfig: {
      pageSize: 'A4',
      pageDirection: 'p',
      pageLayout: 'fixed',
      pageWidth: 210,
      pageHeight: 297,
      pageCurHeight: 297,
      pageMarginBottom: 10,
      pageMarginTop: 10,
      pageMarginLeft: 10,
      pageMarginRight: 10,
      title: '冷链出库标签',
      scale: 1,
      background: '#ffffff',
      color: '#222222',
      fontSize: 12,
      fontFamily: 'sans-serif',
      lineHeight: 1.4,
    },
    pages: [{ id: 'page-1', componentData: components }],
    data: { version: 1, fields },
  }
}

function ProofHarness({ renderContext }: { renderContext: RenderContext }) {
  const currentTemplate = template()
  const store = createEditorStore(currentTemplate)
  return (
    <EditorStoreProvider store={store}>
      {currentTemplate.pages[0]!.componentData.map((schema) => (
        <div key={schema.id} data-component-id={schema.id}>
          <ComponentRenderer schema={schema} renderContext={renderContext} />
        </div>
      ))}
    </EditorStoreProvider>
  )
}

describe('ComponentRenderer data proof', () => {
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
    container.remove()
  })

  it('resolves text, media, table, legacy tokens and group children through Core', async () => {
    await act(async () => root.render(<ProofHarness renderContext={context('CC-2026-0815')} />))

    expect(
      container.querySelector('[data-component-id="text"] .ptd-simple-text__inner')?.textContent,
    ).toBe('订单：CC-2026-0815')
    expect(
      container.querySelector('[data-component-id="legacy"] .ptd-simple-text__inner')?.textContent,
    ).toBe('旧合同：CC-2026-0815')
    expect(
      container.querySelector('[data-component-id="table"] [data-cell-id="cell-1"]')?.textContent,
    ).toBe('2–8 ℃ 全程冷藏')
    expect(
      container
        .querySelector('[data-component-id="image"] .ptd-image')
        ?.getAttribute('data-render-state'),
    ).toBe('loading')
    expect(
      container.querySelector('[data-component-id="group"] .ptd-simple-text__inner')?.textContent,
    ).toBe('CC-2026-0815')
    expect(container.querySelectorAll('[data-binding-status="ready"]')).toHaveLength(6)
  })

  it('updates derived content with a new context without mutating the input Schema', async () => {
    const currentTemplate = template()
    const originalText = currentTemplate.pages[0]!.componentData[0]!
    const store = createEditorStore(currentTemplate)
    const render = (renderContext: RenderContext) => (
      <EditorStoreProvider store={store}>
        <ComponentRenderer schema={originalText} renderContext={renderContext} />
      </EditorStoreProvider>
    )

    await act(async () => root.render(render(context('CC-001'))))
    expect(container.querySelector('.ptd-simple-text__inner')?.textContent).toBe('订单：CC-001')
    await act(async () => root.render(render(context('CC-002'))))
    expect(container.querySelector('.ptd-simple-text__inner')?.textContent).toBe('订单：CC-002')
    expect(originalText.propValue).toBe('静态订单')
  })

  it('shows accessible missing and invalid diagnostics instead of a blank frame', async () => {
    await act(async () => root.render(<ProofHarness renderContext={context('CC-003')} />))

    const missing = container.querySelector('[data-component-id="missing"]')
    const invalid = container.querySelector('[data-component-id="invalid"]')
    expect(missing?.querySelector('[data-binding-status="missing"]')).not.toBeNull()
    expect(missing?.querySelector('[role="status"]')?.textContent).toBe('字段缺失')
    expect(invalid?.querySelector('[data-binding-status="invalid"]')).not.toBeNull()
    expect(invalid?.querySelector('[role="status"]')?.textContent).toBe('字段类型不匹配')
    expect(
      invalid
        ?.querySelector('[data-binding-status="invalid"]')
        ?.getAttribute('data-binding-diagnostics'),
    ).toContain('不能绑定')
  })

  it('renders rich-text field values as text and never injects runtime HTML', async () => {
    await act(async () => root.render(<ProofHarness renderContext={context('CC-004')} />))

    const rich = container.querySelector('[data-component-id="rich"]')
    expect(rich?.querySelector('img')).toBeNull()
    expect(rich?.querySelector('.ptd-text__inner')?.textContent).toContain('<img src=x')
  })
})
