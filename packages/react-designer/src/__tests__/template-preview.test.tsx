/** @vitest-environment jsdom */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { TemplateSchema } from '@ptd/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TemplatePreview } from '../components/TemplatePreview'

function template(content: string): TemplateSchema {
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
      title: '真实模板',
      scale: 1,
      background: '#ffffff',
      color: '#222222',
      fontSize: 12,
      fontFamily: 'sans-serif',
      lineHeight: 1.4,
    },
    pages: [
      {
        id: 'page-1',
        componentData: [
          {
            id: 'text-1',
            component: 'RoySimpleText',
            name: '标题',
            code: 'RoySimpleText',
            group: 'common',
            propValue: content,
            style: {
              left: 40,
              top: 50,
              width: 240,
              height: 42,
              rotate: 0,
              opacity: 1,
              fontSize: 18,
            },
            groupStyle: {},
            position: { x: 40, y: 50 },
          },
        ],
      },
    ],
    dataSource: [],
    dataSet: {},
  }
}

describe('TemplatePreview', () => {
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

  it('renders the real component renderer in a non-interactive page preview', async () => {
    await act(async () => root.render(<TemplatePreview template={template('采购验收单')} />))

    const preview = container.querySelector('[data-ptd-region="template-preview"]')
    expect(preview?.getAttribute('role')).toBe('img')
    expect(preview?.getAttribute('aria-label')).toContain('真实模板')
    expect(preview?.querySelector('.ptd-simple-text__inner')?.textContent).toBe('采购验收单')
  })

  it('updates renderer content when the host supplies a new schema', async () => {
    await act(async () => root.render(<TemplatePreview template={template('版本一')} />))
    await act(async () => root.render(<TemplatePreview template={template('版本二')} />))

    expect(container.querySelector('.ptd-simple-text__inner')?.textContent).toBe('版本二')
  })
})
