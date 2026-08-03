import { describe, expect, it } from 'vitest'
import { isTemplateSchema } from '../schema-validation'
import { DEFAULT_PAGE_CONFIG } from '../types/page-config'
import { OUTPUT_PAGE_TOKENS, type OutputDocument } from '../types/output'
import type { TemplateSchema } from '../types/template-schema'

function template(): TemplateSchema {
  return {
    _version: 2,
    pageConfig: { ...DEFAULT_PAGE_CONFIG },
    pages: [{ id: 'page-1', componentData: [] }],
    data: { version: 1, fields: [] },
    output: {
      defaultPageMasterId: 'master-default',
      pageMasters: [
        {
          id: 'master-default',
          name: '默认版式',
          header: {
            heightMm: 12,
            componentData: [
              {
                id: 'page-number',
                component: 'RoySimpleText',
                propValue: `第 ${OUTPUT_PAGE_TOKENS.pageNumber} / ${OUTPUT_PAGE_TOKENS.totalPages} 页`,
                style: { width: 120, height: 24, rotate: 0, opacity: 1 },
                groupStyle: {},
                position: { x: 0, y: 0 },
              },
            ],
          },
          footer: { heightMm: 8, componentData: [] },
        },
      ],
    },
  }
}

describe('print output contracts', () => {
  it('accepts a default page master with component regions', () => {
    expect(isTemplateSchema(template())).toBe(true)
  })

  it('rejects missing default masters, duplicate ids and invalid region heights', () => {
    const missing = template()
    missing.output = { ...missing.output!, defaultPageMasterId: 'missing' }
    expect(isTemplateSchema(missing)).toBe(false)

    const duplicate = template()
    duplicate.output = {
      ...duplicate.output!,
      pageMasters: [...duplicate.output!.pageMasters, duplicate.output!.pageMasters[0]!],
    }
    expect(isTemplateSchema(duplicate)).toBe(false)

    const invalidHeight = template()
    invalidHeight.output = {
      ...invalidHeight.output!,
      pageMasters: [
        {
          ...invalidHeight.output!.pageMasters[0]!,
          header: { ...invalidHeight.output!.pageMasters[0]!.header, heightMm: -1 },
        },
      ],
    }
    expect(isTemplateSchema(invalidHeight)).toBe(false)
  })

  it('keeps the derived document JSON serializable and separate from the template', () => {
    const document: OutputDocument = {
      pages: [],
      diagnostics: [],
      metadata: {
        title: '测试输出',
        generatedAt: '2026-08-03T00:00:00.000Z',
        locale: 'zh-CN',
        timeZone: 'Asia/Shanghai',
      },
    }
    expect(JSON.parse(JSON.stringify(document))).toEqual(document)
    expect(template().pages).toHaveLength(1)
  })
})
