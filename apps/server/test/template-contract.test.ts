import { BadRequestException } from '@nestjs/common'
import { DEFAULT_PAGE_CONFIG, type TemplateSchema } from '@ptd/core'
import { describe, expect, it } from 'vitest'
import {
  parseCreateTemplateBody,
  TEMPLATE_JSON_BODY_LIMIT_BYTES,
} from '../src/templates/template-contract.js'

const canonicalTemplate: TemplateSchema = {
  _version: 2,
  pageConfig: { ...DEFAULT_PAGE_CONFIG, title: 'Canonical datasource template' },
  pages: [
    {
      id: 'page-1',
      componentData: [
        {
          id: 'customer-name',
          component: 'RoySimpleText',
          propValue: '客户',
          style: { width: 120, height: 30, rotate: 0, opacity: 1 },
          groupStyle: {},
          position: { x: 10, y: 10 },
          bindings: [
            {
              id: 'customer-name-binding',
              target: { kind: 'text' },
              expression: { kind: 'field', fieldId: 'customer-name-field' },
            },
          ],
        },
      ],
    },
  ],
  data: {
    version: 1,
    fields: [
      {
        id: 'customer-name-field',
        name: '客户名称',
        path: ['customer', 'name'],
        valueType: 'string',
      },
    ],
    sampleRecords: [{ customer: { name: '华东冷链' } }],
  },
}

describe('template request contract', () => {
  it('accepts canonical v2 and legacy v0/v1 through the Core authority', () => {
    expect(
      parseCreateTemplateBody({ title: 'Canonical', content: canonicalTemplate }).content,
    ).toEqual(canonicalTemplate)

    const legacyV0 = {
      pageConfig: { ...DEFAULT_PAGE_CONFIG },
      pages: [{ id: 'legacy-page', componentData: [] }],
      dataSource: [],
      dataSet: {},
    }
    expect(
      parseCreateTemplateBody({ title: 'Legacy v0', content: legacyV0 }).content,
    ).toMatchObject({
      _version: 0,
      dataSource: [],
      dataSet: {},
    })

    expect(
      parseCreateTemplateBody({
        title: 'Legacy v1',
        content: { ...legacyV0, _version: 1 },
      }).content,
    ).toMatchObject({ _version: 1, dataSource: [], dataSet: {} })
  })

  it('rejects dual canonical/legacy truth and deeply invalid datasource contracts', () => {
    expect(() =>
      parseCreateTemplateBody({
        title: 'Dual truth',
        content: {
          ...canonicalTemplate,
          dataSource: [{ id: 'legacy', title: 'Legacy', field: 'legacy', typeName: 'String' }],
          dataSet: { legacy: 'stale' },
        },
      }),
    ).toThrow(BadRequestException)

    const page = canonicalTemplate.pages[0]!
    const component = page.componentData[0]!
    const binding = component.bindings?.[0]
    const invalidBinding = {
      ...canonicalTemplate,
      pages: [
        {
          ...page,
          componentData: [
            {
              ...component,
              bindings: [
                {
                  ...binding,
                  expression: { kind: 'field', fieldId: '' },
                },
              ],
            },
          ],
        },
      ],
    }
    expect(() =>
      parseCreateTemplateBody({ title: 'Invalid binding', content: invalidBinding }),
    ).toThrow(BadRequestException)

    const invalidSamples = {
      ...canonicalTemplate,
      data: { ...canonicalTemplate.data, sampleRecords: [null] },
    }
    expect(() =>
      parseCreateTemplateBody({ title: 'Invalid samples', content: invalidSamples }),
    ).toThrow(BadRequestException)
  })

  it('publishes the complete template JSON request limit as exactly 4 MiB', () => {
    expect(TEMPLATE_JSON_BODY_LIMIT_BYTES).toBe(4 * 1024 * 1024)
  })
})
