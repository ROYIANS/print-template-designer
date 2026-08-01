import { describe, expect, it } from 'vitest'
import { evaluateBinding, formatDataValue } from '../data-binding/evaluator'
import type {
  DataFieldDefinition,
  RenderContext,
  TextBindingExpression,
} from '../types/data-source'

const fields: DataFieldDefinition[] = [
  { id: 'customer-name', name: '客户名称', path: ['customer', 'name'], valueType: 'string' },
  { id: 'amount', name: '金额', path: ['amount'], valueType: 'number' },
  { id: 'created-at', name: '创建时间', path: ['createdAt'], valueType: 'date' },
]

const context: RenderContext = {
  data: {
    customer: { name: '北方冷链' },
    amount: 1234.5,
    createdAt: '2026-08-01T02:03:04.000Z',
  },
  locale: 'zh-CN',
  timeZone: 'Asia/Shanghai',
  now: '2026-08-01T02:03:04.000Z',
  mode: 'proof',
}

describe('binding evaluation', () => {
  it('evaluates mixed text from stable field IDs', () => {
    const expression: TextBindingExpression = {
      kind: 'text',
      segments: [
        { kind: 'literal', value: '客户：' },
        { kind: 'field', fieldId: 'customer-name' },
        { kind: 'literal', value: '；金额：' },
        {
          kind: 'field',
          fieldId: 'amount',
          formatter: {
            kind: 'number',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true,
          },
        },
      ],
    }
    expect(evaluateBinding(expression, fields, context)).toMatchObject({
      status: 'ready',
      value: '客户：北方冷链；金额：1,234.50',
    })
  })

  it('uses explicit locale, timezone and now without reading the system clock', () => {
    expect(formatDataValue('ignored', { kind: 'date', source: 'now' }, context).value).toBe(
      '2026-08-01 10:03:04',
    )
    expect(
      formatDataValue(
        'ignored',
        { kind: 'date', source: 'now', pattern: 'YYYY年M月D日', numerals: 'chinese' },
        context,
      ).value,
    ).toBe('二〇二六年八月一日')
    expect(
      formatDataValue(
        'ignored',
        { kind: 'date', source: 'now', pattern: 'YYYY-MM-DD HH:mm:ss' },
        { ...context, timeZone: 'UTC' },
      ).value,
    ).toBe('2026-08-01 02:03:04')
  })

  it('diagnoses missing fields, invalid references, type mismatches and invalid context', () => {
    expect(
      evaluateBinding({ kind: 'field', fieldId: 'customer-name' }, fields, {
        ...context,
        data: {},
      }),
    ).toMatchObject({ status: 'missing', diagnostics: [{ code: 'missing-value' }] })
    expect(evaluateBinding({ kind: 'field', fieldId: 'gone' }, fields, context)).toMatchObject({
      status: 'invalid',
      diagnostics: [{ code: 'field-not-found' }],
    })
    expect(
      evaluateBinding({ kind: 'field', fieldId: 'amount' }, fields, {
        ...context,
        data: { amount: '1234.5' },
      }),
    ).toMatchObject({ status: 'invalid', diagnostics: [{ code: 'type-mismatch' }] })
    expect(
      formatDataValue(1, { kind: 'none' }, { ...context, timeZone: 'Invalid/Zone' }),
    ).toMatchObject({ status: 'invalid', diagnostics: [{ code: 'invalid-render-context' }] })
  })

  it('only coerces numeric strings when an explicit legacy formatter opts in', () => {
    expect(
      formatDataValue(
        '1234.5',
        {
          kind: 'number',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          coerceNumericString: true,
        },
        context,
      ).value,
    ).toBe('1,234.50')
    expect(formatDataValue('1234.5', { kind: 'number' }, context).status).toBe('invalid')
  })

  it('uses a fallback but retains a field diagnostic', () => {
    expect(
      evaluateBinding({ kind: 'field', fieldId: 'customer-name', fallback: '未提供' }, fields, {
        ...context,
        data: {},
      }),
    ).toMatchObject({
      status: 'ready',
      value: '未提供',
      diagnostics: [{ fieldId: 'customer-name' }],
    })
  })
})
