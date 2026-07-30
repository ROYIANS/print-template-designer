import { describe, expect, it } from 'vitest'
import {
  DEFAULT_BAR_CODE_PROPS,
  DEFAULT_IMAGE_PROPS,
  DEFAULT_QR_CODE_PROPS,
  barCodeContentError,
  imageSourceError,
  isBarCodeProps,
  isImageProps,
  isQRCodeProps,
  normalizeBarCodeProps,
  normalizeImageProps,
  normalizeQRCodeProps,
  qrCodeContentError,
} from '../types/component-content'

describe('component content contracts', () => {
  it('normalizes legacy image strings and rejects transient or unsafe persisted sources', () => {
    expect(normalizeImageProps('/assets/logo.png')).toEqual({
      ...DEFAULT_IMAGE_PROPS,
      src: '/assets/logo.png',
    })
    expect(
      normalizeImageProps({ src: 'data:image/png;base64,AA==', alt: 'Logo', fit: 'cover' }),
    ).toEqual({
      src: 'data:image/png;base64,AA==',
      alt: 'Logo',
      fit: 'cover',
      position: 'center',
    })
    expect(imageSourceError('blob:https://example.test/temporary')).toContain('blob')
    expect(imageSourceError('javascript:alert(1)')).toContain('不安全')
    expect(imageSourceError('data:text/html;base64,AA==')).toContain('图片类型')
    expect(imageSourceError('https://example.test/logo.png')).toBeNull()
    expect(isImageProps(normalizeImageProps('/assets/logo.png'))).toBe(true)
  })

  it('provides visible QR defaults and migrates legacy numeric correction levels', () => {
    expect(normalizeQRCodeProps(null)).toEqual(DEFAULT_QR_CODE_PROPS)
    expect(normalizeQRCodeProps({ text: '', correctLevel: 2, margin: 99 })).toMatchObject({
      text: '',
      correctLevel: 'H',
      margin: 32,
    })
    expect(qrCodeContentError(normalizeQRCodeProps({ text: '' }))).toBe('二维码内容不能为空')
    expect(isQRCodeProps(normalizeQRCodeProps(null))).toBe(true)
  })

  it('normalizes barcode content and validates format-specific payloads', () => {
    expect(normalizeBarCodeProps(null)).toEqual(DEFAULT_BAR_CODE_PROPS)
    expect(
      barCodeContentError(normalizeBarCodeProps({ text: 'PTD-2026', bcid: 'code128' })),
    ).toBeNull()
    expect(barCodeContentError(normalizeBarCodeProps({ text: 'abc', bcid: 'code39' }))).toContain(
      '大写字母',
    )
    expect(barCodeContentError(normalizeBarCodeProps({ text: '1234567', bcid: 'ean8' }))).toBeNull()
    expect(barCodeContentError(normalizeBarCodeProps({ text: '1234', bcid: 'ean13' }))).toContain(
      '12 或 13',
    )
    expect(isBarCodeProps(normalizeBarCodeProps(null))).toBe(true)
  })
})
