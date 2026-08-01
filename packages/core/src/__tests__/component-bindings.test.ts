import { describe, expect, it } from 'vitest'
import { resolveComponentBindings } from '../data-binding/component-resolution'
import { createSimpleTableProps } from '../types/table-content'
import type { ComponentSchema } from '../types/component-schema'
import type { RenderContext, TemplateDataDefinition } from '../types/data-source'

const data: TemplateDataDefinition = {
  version: 1,
  fields: [
    { id: 'name', name: '客户', path: ['name'], valueType: 'string' },
    { id: 'image', name: '图片', path: ['image'], valueType: 'string' },
    { id: 'count', name: '数量', path: ['count'], valueType: 'number' },
    {
      id: 'details',
      name: '明细',
      path: ['details'],
      valueType: 'array',
      formatter: { kind: 'json' },
    },
  ],
}

const context: RenderContext = {
  data: {
    name: '<b>北方冷链</b>',
    image: 'https://example.com/logo.png',
    count: 18,
    details: [{ sku: 'ICE-01' }],
  },
  locale: 'zh-CN',
  timeZone: 'Asia/Shanghai',
  now: '2026-08-01T00:00:00.000Z',
  mode: 'proof',
}

function component(
  type: ComponentSchema['component'],
  propValue: unknown,
  binding: ComponentSchema['bindings'],
): ComponentSchema {
  return {
    id: `component-${type}`,
    component: type,
    propValue,
    style: { width: 100, height: 40, rotate: 0, opacity: 1 },
    groupStyle: {},
    position: {},
    ...(binding ? { bindings: binding } : {}),
  }
}

describe('component binding resolution', () => {
  it('derives text and escapes runtime values inserted into rich-text HTML', () => {
    const plain = component('RoySimpleText', '静态', [
      { id: 'text', target: { kind: 'text' }, expression: { kind: 'field', fieldId: 'name' } },
    ])
    expect(resolveComponentBindings(plain, data, context).component.propValue).toBe(
      '<b>北方冷链</b>',
    )

    const rich = component('RoyText', '<p>静态</p>', [
      {
        id: 'rich',
        target: { kind: 'rich-text' },
        expression: {
          kind: 'text',
          segments: [
            { kind: 'literal', value: '<p>客户：' },
            { kind: 'field', fieldId: 'name' },
            { kind: 'literal', value: '</p>' },
          ],
        },
      },
    ])
    expect(resolveComponentBindings(rich, data, context).component.propValue).toBe(
      '<p>客户：&lt;b&gt;北方冷链&lt;/b&gt;</p>',
    )
  })

  it('patches image, QR, barcode and one free-table cell without mutating inputs', () => {
    const image = component(
      'RoyImage',
      { src: '', alt: 'Logo', fit: 'contain', position: 'center' },
      [
        {
          id: 'image-source',
          target: { kind: 'image-source' },
          expression: { kind: 'field', fieldId: 'image' },
        },
      ],
    )
    expect(resolveComponentBindings(image, data, context).component.propValue).toMatchObject({
      src: 'https://example.com/logo.png',
      alt: 'Logo',
    })
    expect(image.propValue).toMatchObject({ src: '' })

    for (const type of ['RoyQRCode', 'RoyBarCode'] as const) {
      const code = component(type, null, [
        {
          id: `code-${type}`,
          target: { kind: 'code-content' },
          expression: { kind: 'field', fieldId: 'count' },
        },
      ])
      expect(resolveComponentBindings(code, data, context).component.propValue).toMatchObject({
        text: '18',
      })
    }

    const tableValue = createSimpleTableProps(2, 2)
    const cellId = tableValue.grid[0]?.[0] ?? ''
    const table = component('RoySimpleTable', tableValue, [
      {
        id: 'cell',
        target: { kind: 'table-cell-text', cellId },
        expression: { kind: 'field', fieldId: 'name' },
      },
    ])
    expect(
      (resolveComponentBindings(table, data, context).component.propValue as typeof tableValue)
        .cells[cellId]?.text,
    ).toBe('<b>北方冷链</b>')
    expect(tableValue.cells[cellId]?.text).toBe('')
  })

  it('resolves legacy tokens ephemerally and keeps them usable after canonical data migration', () => {
    const legacyText = component('RoySimpleText', '客户：[::name::] / [::details::]', undefined)
    expect(resolveComponentBindings(legacyText, data, context)).toMatchObject({
      status: 'ready',
      component: { propValue: '客户：<b>北方冷链</b> / [{"sku":"ICE-01"}]' },
    })

    const rich = component('RoyText', '<p>[::name::]</p>', undefined)
    expect(resolveComponentBindings(rich, data, context).component.propValue).toBe(
      '<p>&lt;b&gt;北方冷链&lt;/b&gt;</p>',
    )

    const tableValue = createSimpleTableProps(1, 1)
    const cellId = tableValue.grid[0]?.[0] ?? ''
    tableValue.cells[cellId]!.text = '[::name::]'
    const table = component('RoySimpleTable', tableValue, undefined)
    expect(
      (resolveComponentBindings(table, data, context).component.propValue as typeof tableValue)
        .cells[cellId]?.text,
    ).toBe('<b>北方冷链</b>')
  })

  it('rejects persisted incompatible fields, unsupported targets and missing table cells', () => {
    const imageFromNumber = component('RoyImage', '', [
      {
        id: 'bad-type',
        target: { kind: 'image-source' },
        expression: { kind: 'field', fieldId: 'count' },
      },
    ])
    expect(resolveComponentBindings(imageFromNumber, data, context)).toMatchObject({
      status: 'invalid',
      diagnostics: [{ code: 'type-mismatch', bindingId: 'bad-type' }],
    })

    const unsupported = component('RoyImage', '', [
      {
        id: 'bad-target',
        target: { kind: 'text' },
        expression: { kind: 'field', fieldId: 'name' },
      },
    ])
    expect(resolveComponentBindings(unsupported, data, context).diagnostics[0]?.code).toBe(
      'invalid-binding-target',
    )

    const table = component('RoySimpleTable', createSimpleTableProps(1, 1), [
      {
        id: 'gone-cell',
        target: { kind: 'table-cell-text', cellId: 'missing' },
        expression: { kind: 'field', fieldId: 'name' },
      },
    ])
    expect(resolveComponentBindings(table, data, context).diagnostics[0]?.code).toBe(
      'invalid-binding-target',
    )
  })
})
