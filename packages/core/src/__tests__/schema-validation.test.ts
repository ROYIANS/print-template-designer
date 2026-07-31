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
})
