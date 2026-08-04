import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ComponentSchema } from '@ptd/core'
import { RoyBarCode } from '../components/RoyBarCode'
import { RoyImage } from '../components/RoyImage'
import { RoyQRCode } from '../components/RoyQRCode'

vi.mock('easyqrcodejs', () => ({
  default: class QRCodeMock {
    constructor(element: HTMLElement) {
      element.append(document.createElement('canvas'))
    }
  },
}))

vi.mock('bwip-js', () => ({
  default: {
    toCanvas(canvas: HTMLCanvasElement) {
      canvas.dataset['mockBarcode'] = 'ready'
    },
  },
}))

function schema(
  component: 'RoyImage' | 'RoyQRCode' | 'RoyBarCode',
  propValue: unknown,
): ComponentSchema {
  return {
    id: `test-${component}`,
    component,
    propValue,
    style: {
      width: 160,
      height: 100,
      rotate: 0,
      opacity: 1,
      background: '#ffffff',
      borderType: 'none',
    },
    groupStyle: {},
    position: {},
  }
}

function mount(component: { mount: (parent: HTMLElement) => void }): HTMLElement {
  const parent = document.createElement('div')
  component.mount(parent)
  return parent.firstElementChild as HTMLElement
}

describe('media component render states', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders an actionable empty image state instead of a broken image icon', () => {
    const component = new RoyImage(schema('RoyImage', null))
    const element = mount(component)

    expect(element.dataset['renderState']).toBe('empty')
    expect(element.querySelector('img')).toBeNull()
    expect(element.querySelector('.ptd-render-state')?.textContent).toContain('选择图片')
  })

  it('keeps image loading states mutually exclusive and ignores stale callbacks', () => {
    const createdImages: HTMLImageElement[] = []
    const createElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation(((
      tagName: string,
      options?: ElementCreationOptions,
    ) => {
      const element = createElement(tagName, options)
      if (tagName.toLowerCase() === 'img') createdImages.push(element as HTMLImageElement)
      return element
    }) as typeof document.createElement)

    const component = new RoyImage(
      schema('RoyImage', { src: 'https://example.test/a.png', alt: 'A' }),
    )
    const element = mount(component)
    const imageA = createdImages[0]
    const lateLoadA = imageA?.onload

    expect(element.dataset['renderState']).toBe('loading')
    expect(element.children).toHaveLength(1)
    expect(element.querySelector('.ptd-render-state')?.textContent).toContain('正在载入')
    expect(element.querySelector('img')).toBeNull()

    component.update(
      schema('RoyImage', {
        src: 'https://example.test/b.png',
        alt: 'B',
        fit: 'cover',
        position: 'top',
      }),
    )
    const imageB = createdImages[1]

    expect(imageA?.onload).toBeNull()
    expect(element.children).toHaveLength(1)
    expect(element.querySelector('.ptd-render-state')?.textContent).toContain('正在载入')
    lateLoadA?.call(imageA, new Event('load'))
    expect(element.dataset['renderState']).toBe('loading')
    expect(element.querySelector('img')).toBeNull()

    imageB?.dispatchEvent(new Event('load'))
    expect(element.dataset['renderState']).toBe('ready')
    expect(element.children).toHaveLength(1)
    expect(element.querySelector('img')).toBe(imageB)
    expect(element.querySelector('img')?.alt).toBe('B')
    expect(element.querySelector('img')?.style.objectFit).toBe('cover')
    expect(element.querySelector('img')?.style.objectPosition).toBe('top')
    expect(element.querySelector('.ptd-render-state')).toBeNull()
  })

  it('exposes unsafe source errors without retaining an image node', () => {
    const component = new RoyImage(
      schema('RoyImage', {
        src: 'blob:https://example.test/temporary',
        alt: '公司 Logo',
        fit: 'cover',
        position: 'top',
      }),
    )
    const element = mount(component)
    const image = element.querySelector('img')

    expect(image).toBeNull()
    expect(element.dataset['renderState']).toBe('error')
    expect(element.textContent).toContain('blob')
  })

  it('shows a QR validation error when persisted content is empty', () => {
    const component = new RoyQRCode(schema('RoyQRCode', { text: '' }))
    const element = mount(component)

    expect(element.dataset['renderState']).toBe('error')
    expect(element.textContent).toContain('二维码内容不能为空')
  })

  it('completes the initial QR render started during the base constructor', async () => {
    const component = new RoyQRCode(
      schema('RoyQRCode', { text: 'https://example.test/reports/2026-q3' }),
    )
    const element = mount(component)

    await vi.waitFor(() => expect(element.dataset['renderState']).toBe('ready'))
    expect(element.querySelector('canvas')).not.toBeNull()
    expect(element.querySelector('.ptd-render-state')).toBeNull()
  })

  it('shows format-specific barcode validation instead of silently rendering blank', () => {
    const component = new RoyBarCode(
      schema('RoyBarCode', { text: '1234', bcid: 'ean13', includeText: true }),
    )
    const element = mount(component)

    expect(element.dataset['renderState']).toBe('error')
    expect(element.textContent).toContain('12 或 13 位数字')
  })

  it('completes the initial barcode render started during the base constructor', async () => {
    const component = new RoyBarCode(
      schema('RoyBarCode', { text: 'FOLIQ-2026-Q3', bcid: 'code128', includeText: true }),
    )
    const element = mount(component)

    await vi.waitFor(() => expect(element.dataset['renderState']).toBe('ready'))
    expect(element.querySelector('canvas')?.dataset['mockBarcode']).toBe('ready')
    expect(element.querySelector('.ptd-render-state')).toBeNull()
  })
})
