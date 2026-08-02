import { describe, expect, it } from 'vitest'
import { resolveComponentBindings } from '../data-binding/component-resolution'
import { normalizeTemplateData, parseLegacyBindingExpression } from '../data-binding/normalization'
import { deserialize, serialize } from '../serialization'
import { DEFAULT_PAGE_CONFIG } from '../types/page-config'
import type { ComponentSchema } from '../types/component-schema'
import type { RenderContext } from '../types/data-source'
import type { TemplateSchema } from '../types/template-schema'

function legacyTemplate(): TemplateSchema {
  return {
    _version: 1,
    pageConfig: { ...DEFAULT_PAGE_CONFIG },
    pages: [{ id: 'page-1', componentData: [] }],
    dataSource: [
      { id: 'amount', title: '金额', field: 'amount', typeName: 'Money' },
      { id: 'big-date', title: '大写日期', field: 'bigDate', typeName: 'BigCurDate' },
    ],
    dataSet: { amount: '1234.5', bigDate: true },
  }
}

const context: RenderContext = {
  data: { amount: '1234.5', bigDate: true },
  locale: 'zh-CN',
  timeZone: 'Asia/Shanghai',
  now: '2026-08-01T00:00:00.000Z',
  mode: 'proof',
}

function textComponent(value: string): ComponentSchema {
  return {
    id: 'legacy-text',
    component: 'RoySimpleText',
    propValue: value,
    style: { width: 100, height: 40, rotate: 0, opacity: 1 },
    groupStyle: {},
    position: {},
  }
}

describe('legacy data normalization', () => {
  it('creates one canonical read view without mutating the legacy template', () => {
    const template = legacyTemplate()
    const snapshot = JSON.stringify(template)
    const normalized = normalizeTemplateData(template)
    expect(normalized).toMatchObject({
      source: 'legacy',
      data: {
        version: 1,
        fields: [
          {
            id: 'amount',
            valueType: 'number',
            formatter: { kind: 'number', coerceNumericString: true },
          },
          {
            id: 'big-date',
            valueType: 'date',
            formatter: { kind: 'date', source: 'now', numerals: 'chinese' },
          },
        ],
      },
    })
    expect(JSON.stringify(template)).toBe(snapshot)
    expect(template.data).toBeUndefined()
  })

  it('preserves numeric-string and Chinese current-date legacy semantics through v2 evaluation', () => {
    const normalized = normalizeTemplateData(legacyTemplate())
    const resolved = resolveComponentBindings(
      textComponent('金额：[::amount::]；日期：[::bigDate::]'),
      normalized.data,
      context,
    )
    expect(resolved).toMatchObject({
      status: 'ready',
      component: { propValue: '金额：1,234.50；日期：二〇二六年八月一日' },
    })
  })

  it('keeps legacy tokens resolvable after save to v2 and deserialize', () => {
    const template = legacyTemplate()
    template.pages[0]!.componentData.push(textComponent('金额：[::amount::]；日期：[::bigDate::]'))
    const restored = deserialize(serialize(template))
    expect(restored.dataSource).toBeUndefined()
    expect(restored.dataSet).toBeUndefined()
    const normalized = normalizeTemplateData(restored)
    expect(normalized.source).toBe('canonical')
    expect(
      resolveComponentBindings(restored.pages[0]!.componentData[0]!, normalized.data, context)
        .component.propValue,
    ).toBe('金额：1,234.50；日期：二〇二六年八月一日')
    expect(restored.pages[0]!.componentData[0]!.propValue).toContain('[::amount::]')
  })

  it('parses old placeholders into stable field references and diagnoses removed fields', () => {
    const fields = normalizeTemplateData(legacyTemplate()).data.fields
    expect(parseLegacyBindingExpression('¥[::amount::]', fields)).toEqual({
      kind: 'text',
      segments: [
        { kind: 'literal', value: '¥' },
        { kind: 'field', fieldId: 'amount' },
      ],
    })
    expect(parseLegacyBindingExpression('[::removed::]', fields)).toEqual({
      kind: 'field',
      fieldId: 'legacy-missing:removed',
    })
  })

  it('always prefers canonical data when empty legacy compatibility keys are present', () => {
    const template: TemplateSchema = {
      ...legacyTemplate(),
      data: {
        version: 1,
        fields: [{ id: 'code', name: '编号', path: ['code'], valueType: 'string' }],
      },
      dataSource: [],
      dataSet: {},
    }
    expect(normalizeTemplateData(template)).toMatchObject({
      source: 'canonical',
      data: { fields: [{ id: 'code' }] },
    })
  })
})
