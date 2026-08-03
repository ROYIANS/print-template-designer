import { describe, expect, it } from 'vitest'
import { DEFAULT_PAGE_CONFIG } from '../types/page-config'
import { isTemplateSchema } from '../schema-validation'

function template() {
  return {
    _version: 1,
    pageConfig: { ...DEFAULT_PAGE_CONFIG },
    pages: [
      {
        id: 'page-1',
        componentData: [
          {
            id: 'text-1',
            component: 'RoySimpleText',
            propValue: '内容',
            style: { width: 100, height: 40, rotate: 0, opacity: 1 },
            groupStyle: {},
            position: { x: 0, y: 0 },
          },
        ],
      },
    ],
    dataSource: [],
    dataSet: {},
  }
}

describe('TemplateSchema runtime validation', () => {
  it('validates nested pages, components and data-source fields', () => {
    expect(isTemplateSchema(template())).toBe(true)

    const invalidStyle = template()
    invalidStyle.pages[0]!.componentData[0]!.style.width = Number.NaN
    expect(isTemplateSchema(invalidStyle)).toBe(false)

    const groupBase = template()
    const invalidGroup = {
      ...groupBase,
      pages: [
        {
          ...groupBase.pages[0]!,
          componentData: [
            {
              ...groupBase.pages[0]!.componentData[0]!,
              component: 'RoyGroup',
              propValue: [{ id: 'broken-child' }],
            },
          ],
        },
      ],
    }
    expect(isTemplateSchema(invalidGroup)).toBe(false)

    expect(
      isTemplateSchema({
        ...template(),
        dataSource: [{ id: 'field-1', title: '编号', field: 'code', typeName: 'Unknown' }],
      }),
    ).toBe(false)
  })

  it('accepts canonical v2 without legacy keys and validates bindings deeply', () => {
    const canonical = template()
    delete (canonical as Partial<typeof canonical>).dataSource
    delete (canonical as Partial<typeof canonical>).dataSet
    const value = {
      ...canonical,
      _version: 2,
      data: {
        version: 1,
        fields: [{ id: 'code', name: '编号', path: ['order', 'code'], valueType: 'string' }],
        sampleRecords: [{ order: { code: 'SO-001' } }],
      },
      pages: [
        {
          ...canonical.pages[0]!,
          componentData: [
            {
              ...canonical.pages[0]!.componentData[0]!,
              bindings: [
                {
                  id: 'text-binding',
                  target: { kind: 'text' },
                  expression: { kind: 'field', fieldId: 'code' },
                },
              ],
            },
          ],
        },
      ],
    }
    expect(isTemplateSchema(value)).toBe(true)
    expect(
      isTemplateSchema({
        ...value,
        data: { ...value.data, fields: [{ ...value.data.fields[0], path: ['__proto__'] }] },
      }),
    ).toBe(false)
    expect(
      isTemplateSchema({
        ...value,
        data: {
          ...value.data,
          fields: [{ ...value.data.fields[0] }, { ...value.data.fields[0], path: ['other'] }],
        },
      }),
    ).toBe(false)
    expect(
      isTemplateSchema({
        ...value,
        pages: [
          {
            ...value.pages[0],
            componentData: [
              {
                ...value.pages[0]!.componentData[0],
                bindings: [
                  {
                    id: 'invalid',
                    target: { kind: 'table-cell-text' },
                    expression: { kind: 'field', fieldId: 'code' },
                  },
                ],
              },
            ],
          },
        ],
      }),
    ).toBe(false)
  })

  it('rejects two editable data sources in one template', () => {
    expect(
      isTemplateSchema({
        ...template(),
        data: { version: 1, fields: [] },
        dataSource: [{ id: 'legacy', title: '旧字段', field: 'old', typeName: 'String' }],
      }),
    ).toBe(false)
  })

  it('does not reject legacy structured-table props before the explicit save migration boundary', () => {
    const base = template()
    expect(
      isTemplateSchema({
        ...base,
        pages: [
          {
            ...base.pages[0]!,
            componentData: [
              {
                ...base.pages[0]!.componentData[0]!,
                component: 'RoyComplexTable',
                propValue: {
                  tableDataSource: 'items',
                  tableRowHeight: 36,
                  tableCols: [{ title: '项目', field: 'name', width: 200 }],
                },
              },
            ],
          },
        ],
      }),
    ).toBe(true)
  })
})
