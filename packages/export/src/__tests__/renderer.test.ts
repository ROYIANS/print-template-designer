import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ComponentSchema, OutputDocument, OutputFragment } from '@ptd/core'
import type { DetailTableFragmentProps } from '../detailTable'
import { waitForOutputReady } from '../readiness'
import { mountOutputDocument } from '../renderer'

function fragment(component: ComponentSchema): OutputFragment {
  return {
    id: `${component.id}:fragment:0`,
    sourceComponentId: component.id,
    fragmentIndex: 0,
    continuation: 'none',
    bounds: { left: 20, top: 30, width: component.style.width, height: component.style.height },
    component,
  }
}

function output(fragments: readonly OutputFragment[]): OutputDocument {
  return {
    metadata: {
      title: '输出测试',
      generatedAt: '2026-08-03T08:00:00.000Z',
      locale: 'zh-CN',
      timeZone: 'Asia/Shanghai',
    },
    diagnostics: [],
    pages: [
      {
        id: 'output-page-1',
        pageNumber: 1,
        totalPages: 1,
        widthMm: 210,
        heightMm: 297,
        style: {
          background: '#ffffff',
          color: '#1d2735',
          fontSizePx: 12,
          fontFamily: 'sans-serif',
          lineHeight: 1.5,
        },
        regions: {
          header: {
            kind: 'header',
            bounds: { left: 20, top: 20, width: 754, height: 40 },
            fragments: [],
          },
          body: {
            kind: 'body',
            bounds: { left: 20, top: 60, width: 754, height: 980 },
            fragments,
          },
          footer: {
            kind: 'footer',
            bounds: { left: 20, top: 1040, width: 754, height: 40 },
            fragments: [],
          },
        },
      },
    ],
  }
}

afterEach(() => {
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

describe('output DOM renderer', () => {
  it('mounts framework-free components on fixed physical pages and destroys them', () => {
    const component: ComponentSchema = {
      id: 'title',
      component: 'RoySimpleText',
      propValue: 'Foliq 输出',
      style: { width: 200, height: 40, rotate: 0, opacity: 1 },
      groupStyle: {},
      position: { x: 20, y: 30 },
    }
    const container = document.createElement('div')
    document.body.append(container)

    const mounted = mountOutputDocument(container, output([fragment(component)]))

    const page = container.querySelector<HTMLElement>('[data-ptd-output-page="1"]')
    expect(page?.style.width).toBe('210mm')
    expect(page?.style.height).toBe('297mm')
    const canvas = container.querySelector<HTMLElement>('[data-ptd-output-page-canvas="1"]')
    expect(canvas?.style.width).toBe('100%')
    expect(canvas?.style.height).toBe('100%')
    expect(canvas?.style.overflow).toBe('hidden')
    expect(canvas?.style.contain).toBe('strict')
    const logicalCanvas = container.querySelector<HTMLElement>(
      '[data-ptd-output-logical-canvas="1"]',
    )
    expect(logicalCanvas?.style.width).toBe('1050px')
    expect(logicalCanvas?.style.height).toBe('1485px')
    expect(Number(logicalCanvas?.style.transform.match(/scale\(([^)]+)\)/)?.[1])).toBeCloseTo(
      96 / 25.4 / 5,
    )
    expect(logicalCanvas?.querySelector('[data-ptd-output-region="body"]')).not.toBeNull()
    expect(
      container.querySelector<HTMLElement>('[data-ptd-output-region="body"]')?.style.height,
    ).toBe('980px')
    expect(container.querySelector('.ptd-simple-text__inner')?.textContent).toBe('Foliq 输出')
    expect(container.querySelector('[data-ptd-source-component="title"]')).not.toBeNull()

    mounted.destroy()
    expect(container.childElementCount).toBe(0)
  })

  it('preserves one semantic text component while applying shared multi-column variables', () => {
    const plain: ComponentSchema = {
      id: 'columns-plain',
      component: 'RoySimpleText',
      propValue: '第一栏内容\n第二栏内容',
      style: {
        width: 320,
        height: 120,
        rotate: 0,
        opacity: 1,
        columnCount: 2,
        columnGap: 16,
        columnFill: 'balance',
      },
      groupStyle: {},
      position: { x: 20, y: 30 },
    }
    const rich: ComponentSchema = {
      ...plain,
      id: 'columns-rich',
      component: 'RoyText',
      propValue: '<p>富文本第一栏</p><p>富文本第二栏</p>',
    }
    const container = document.createElement('div')
    document.body.append(container)

    const mounted = mountOutputDocument(container, output([fragment(plain), fragment(rich)]))
    const plainInner = container.querySelector<HTMLElement>('.ptd-simple-text__inner')!
    const richInner = container.querySelector<HTMLElement>('.ptd-text__inner')!
    expect(plainInner.dataset.ptdColumns).toBe('true')
    expect(richInner).not.toBeNull()
    expect(container.querySelectorAll('[data-ptd-source-component]')).toHaveLength(2)
    expect(
      container
        .querySelector<HTMLElement>('[data-ptd-source-component="columns-plain"] .ptd-component')
        ?.style.getPropertyValue('--ptd-column-count'),
    ).toBe('2')
    expect(
      container
        .querySelector<HTMLElement>('[data-ptd-source-component="columns-rich"] .ptd-component')
        ?.style.getPropertyValue('--ptd-column-fill'),
    ).toBe('balance')
    mounted.destroy()
  })

  it('renders semantic detail fragments with an explicit repeated table header', () => {
    const props: DetailTableFragmentProps = {
      kind: 'foliq-detail-table-fragment',
      columns: [
        { id: 'name', title: '项目', width: 200, horizontalAlign: 'left' },
        { id: 'quantity', title: '数量', width: 100, horizontalAlign: 'right' },
      ],
      rows: [
        { id: 'row-1', cells: ['纸张', '2'] },
        { id: 'row-2', cells: ['油墨', '1'] },
      ],
      includeHeader: true,
      headerHeight: 32,
      rowHeights: [30, 30],
      footerHeight: 0,
    }
    const component: ComponentSchema = {
      id: 'detail-table',
      component: 'RoyComplexTable',
      propValue: props,
      style: { width: 300, height: 92, rotate: 0, opacity: 1 },
      groupStyle: {},
      position: { x: 20, y: 30 },
    }
    const container = document.createElement('div')
    document.body.append(container)

    const mounted = mountOutputDocument(container, output([fragment(component)]))

    expect(container.querySelector('[data-ptd-output-table-header="true"]')?.textContent).toBe(
      '项目数量',
    )
    expect(container.querySelectorAll('[data-ptd-output-table-row]')).toHaveLength(2)
    expect(container.textContent).toContain('纸张')
    mounted.destroy()
  })

  it('waits for two stable layout frames before declaring output ready', async () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(performance.now())
      return 1
    })
    const root = document.createElement('div')
    document.body.append(root)

    await expect(waitForOutputReady(root, 1_000)).resolves.toEqual([])
  })

  it('blocks non-embedded images before mounting and reports the source component', async () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(performance.now())
      return 1
    })
    const component: ComponentSchema = {
      id: 'remote-image',
      component: 'RoyImage',
      propValue: {
        src: 'https://example.com/private-image.png',
        alt: '远程图片',
        fit: 'contain',
        position: 'center',
      },
      style: { width: 200, height: 120, rotate: 0, opacity: 1 },
      groupStyle: {},
      position: { x: 20, y: 30 },
    }
    const container = document.createElement('div')
    document.body.append(container)

    const mounted = mountOutputDocument(container, output([fragment(component)]))
    const blocked = container.querySelector<HTMLElement>('[data-ptd-remote-resource-blocked]')

    expect(blocked?.dataset.ptdRemoteResourceBlocked).toBe(component.id)
    expect(container.querySelector('img')).toBeNull()
    await expect(waitForOutputReady(mounted.root, 1_000)).resolves.toContainEqual({
      severity: 'error',
      code: 'REMOTE_RESOURCE_BLOCKED',
      message: '远程图片不会在打印预览或 PDF 输出中加载，请改用已嵌入模板的图片。',
      sourceComponentId: component.id,
    })
    mounted.destroy()
  })

  it('waits for code renderers and converts their error states into stable diagnostics', async () => {
    let frame = 0
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frame += 1
      if (frame === 1) {
        document.querySelector<HTMLElement>('#pending-code')!.dataset.renderState = 'ready'
      }
      callback(performance.now())
      return frame
    })
    const root = document.createElement('div')
    root.innerHTML = `
      <div data-ptd-source-component="qr-ready">
        <div id="pending-code" class="ptd-qrcode" data-render-state="loading"></div>
      </div>
      <div data-ptd-source-component="qr-error">
        <div class="ptd-qrcode" data-render-state="error"></div>
      </div>
      <div data-ptd-source-component="barcode-error">
        <div class="ptd-barcode" data-render-state="error"></div>
      </div>
    `
    document.body.append(root)

    const diagnostics = await waitForOutputReady(root, 1_000)

    expect(diagnostics).toContainEqual(
      expect.objectContaining({ code: 'QRCODE_RENDER_FAILED', sourceComponentId: 'qr-error' }),
    )
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'BARCODE_RENDER_FAILED',
        sourceComponentId: 'barcode-error',
      }),
    )
    expect(diagnostics).not.toContainEqual(
      expect.objectContaining({ sourceComponentId: 'qr-ready' }),
    )
  })
})
