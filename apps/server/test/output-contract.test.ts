import { BadRequestException } from '@nestjs/common'
import { DEFAULT_PAGE_CONFIG } from '@ptd/core'
import { describe, expect, it } from 'vitest'
import {
  parseOutputPdfBody,
  pdfContentDisposition,
  pdfFileName,
} from '../src/output/output-contract.js'

const NOW = '2026-08-03T08:30:00.000Z'

function body() {
  return {
    template: {
      _version: 2,
      pageConfig: { ...DEFAULT_PAGE_CONFIG, title: '采购送货单' },
      pages: [{ id: 'page-1', componentData: [] }],
      data: {
        version: 1,
        fields: [],
        sampleRecords: [{ orderNo: 'FQ-001' }],
      },
    },
    renderContext: {
      data: { orderNo: 'FQ-001' },
      record: { orderNo: 'FQ-001' },
      recordIndex: 0,
      locale: 'zh-CN',
      timeZone: 'Asia/Shanghai',
      now: NOW,
      mode: 'export',
    },
    options: {
      locale: 'zh-CN',
      timeZone: 'Asia/Shanghai',
      now: NOW,
      title: '采购送货单',
      pageLimit: 80,
    },
    fileName: '采购送货单 / 8月',
  }
}

describe('output PDF contract', () => {
  it('normalizes a structured export job without accepting HTML or a render URL', () => {
    const parsed = parseOutputPdfBody(body())

    expect(parsed.template.pageConfig.title).toBe('采购送货单')
    expect(parsed.renderContext).toMatchObject({
      mode: 'export',
      recordIndex: 0,
      now: NOW,
    })
    expect(parsed.options).toEqual({
      locale: 'zh-CN',
      timeZone: 'Asia/Shanghai',
      now: NOW,
      title: '采购送货单',
      pageLimit: 80,
    })
    expect(parsed).not.toHaveProperty('html')
    expect(parsed).not.toHaveProperty('renderUrl')
  })

  it.each([
    ['non-export mode', { renderContext: { ...body().renderContext, mode: 'print' } }],
    ['mismatched time', { options: { ...body().options, now: '2026-08-03T08:31:00.000Z' } }],
    ['invalid zone', { renderContext: { ...body().renderContext, timeZone: 'Mars/Olympus' } }],
    ['excessive page limit', { options: { ...body().options, pageLimit: 201 } }],
    ['non-JSON data', { renderContext: { ...body().renderContext, data: Number.NaN } }],
  ])('rejects %s', (_label, patch) => {
    expect(() => parseOutputPdfBody({ ...body(), ...patch })).toThrow(BadRequestException)
  })

  it('creates safe ASCII and UTF-8 download names', () => {
    expect(pdfFileName('采购/送货单?.PDF')).toBe('采购-送货单-.pdf')
    const disposition = pdfContentDisposition('采购/送货单')
    expect(disposition).toContain('filename="foliq-output.pdf"')
    expect(disposition).toContain(
      "filename*=UTF-8''%E9%87%87%E8%B4%AD-%E9%80%81%E8%B4%A7%E5%8D%95.pdf",
    )
    expect(disposition).not.toContain('/')
  })
})
