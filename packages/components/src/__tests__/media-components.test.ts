import { describe, expect, it } from 'vitest'
import type { ComponentSchema } from '@ptd/core'
import { RoyBarCode } from '../components/RoyBarCode'
import { RoyImage } from '../components/RoyImage'
import { RoyQRCode } from '../components/RoyQRCode'

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
  it('renders an actionable empty image state instead of a broken image icon', () => {
    const component = new RoyImage(schema('RoyImage', null))
    const element = mount(component)

    expect(element.dataset['renderState']).toBe('empty')
    expect(element.querySelector('img')?.hidden).toBe(true)
    expect(element.querySelector('.ptd-render-state')?.textContent).toContain('选择图片')
  })

  it('supports structured image semantics and exposes unsafe source errors', () => {
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

    expect(image?.alt).toBe('公司 Logo')
    expect(image?.style.objectFit).toBe('cover')
    expect(image?.style.objectPosition).toBe('top')
    expect(element.dataset['renderState']).toBe('error')
    expect(element.textContent).toContain('blob')
  })

  it('shows a QR validation error when persisted content is empty', () => {
    const component = new RoyQRCode(schema('RoyQRCode', { text: '' }))
    const element = mount(component)

    expect(element.dataset['renderState']).toBe('error')
    expect(element.textContent).toContain('二维码内容不能为空')
  })

  it('shows format-specific barcode validation instead of silently rendering blank', () => {
    const component = new RoyBarCode(
      schema('RoyBarCode', { text: '1234', bcid: 'ean13', includeText: true }),
    )
    const element = mount(component)

    expect(element.dataset['renderState']).toBe('error')
    expect(element.textContent).toContain('12 或 13 位数字')
  })
})
