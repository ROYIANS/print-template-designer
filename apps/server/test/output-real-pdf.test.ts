import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { DEFAULT_PAGE_CONFIG, type ComponentSchema, type TemplateSchema } from '@ptd/core'
import { afterAll, describe, expect, it } from 'vitest'
import {
  OutputBrowserService,
  type OutputBrowserType,
} from '../src/output/output-browser.service.js'
import { OutputConfigService } from '../src/output/output-config.js'
import type { OutputPdfInput } from '../src/output/output-contract.js'

const NOW = '2026-08-03T08:30:00.000Z'
const RUN_REAL_PDF = process.env.PTD_REAL_PDF_TEST === 'true'
const PDF_DIRECTORY = fileURLToPath(new URL('../../../tmp/pdfs/', import.meta.url))
const PDF_PATH = fileURLToPath(new URL('../../../tmp/pdfs/foliq-output-smoke.pdf', import.meta.url))

function countPdfPages(pdf: Uint8Array): number {
  return (
    Buffer.from(pdf)
      .toString('latin1')
      .match(/\/Type\s*\/Page\b/g)?.length ?? 0
  )
}

function textComponent(id: string, value: string, top: number): ComponentSchema {
  return {
    id,
    component: 'RoySimpleText',
    name: value,
    propValue: value,
    style: {
      left: 72,
      top,
      width: 620,
      height: 60,
      rotate: 0,
      opacity: 1,
      color: '#1d2735',
      fontFamily: "'Noto Sans CJK SC', sans-serif",
      fontSize: 18,
      fontWeight: '600',
    },
    groupStyle: {},
    position: { x: 72, y: top },
  }
}

function input(): OutputPdfInput {
  const template: TemplateSchema = {
    _version: 2,
    pageConfig: {
      ...DEFAULT_PAGE_CONFIG,
      title: 'Foliq 确定性输出校样',
      fontFamily: "'Noto Sans CJK SC', sans-serif",
    },
    pages: [
      { id: 'page-1', componentData: [textComponent('title-1', 'Foliq 输出校样 / 第一页', 120)] },
      { id: 'page-2', componentData: [textComponent('title-2', '真实文本 / 第二页', 120)] },
    ],
    data: { version: 1, fields: [] },
  }
  return {
    template,
    renderContext: {
      data: {},
      locale: 'zh-CN',
      timeZone: 'Asia/Shanghai',
      now: NOW,
      mode: 'export',
    },
    options: {
      locale: 'zh-CN',
      timeZone: 'Asia/Shanghai',
      now: NOW,
      title: template.pageConfig.title,
    },
    fileName: template.pageConfig.title,
  }
}

describe.skipIf(!RUN_REAL_PDF)('real Chromium PDF output', () => {
  const service = new OutputBrowserService(chromium as OutputBrowserType, new OutputConfigService())

  afterAll(async () => {
    await service.onApplicationShutdown()
  })

  it('renders a two-page text-object PDF through the production render bundle', async () => {
    const result = await service.renderPdf(input())
    await mkdir(PDF_DIRECTORY, { recursive: true })
    await writeFile(PDF_PATH, result.pdf)

    expect(result.pageCount).toBe(2)
    expect(countPdfPages(result.pdf)).toBe(result.pageCount)
    expect(result.pdf.subarray(0, 5).toString('ascii')).toBe('%PDF-')
    expect(result.pdf.byteLength).toBeGreaterThan(1_000)
    expect(result.pdf.toString('latin1')).toContain('/ToUnicode')
  }, 30_000)
})
