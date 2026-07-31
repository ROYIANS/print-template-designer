export type ImageFit = 'contain' | 'cover' | 'fill'

export type ImagePosition = 'center' | 'top' | 'right' | 'bottom' | 'left'

export interface ImageProps {
  src: string
  alt: string
  fit: ImageFit
  position: ImagePosition
}

export type QRCodeErrorCorrection = 'L' | 'M' | 'Q' | 'H'

export interface QRCodeProps {
  text: string
  colorDark: string
  colorLight: string
  correctLevel: QRCodeErrorCorrection
  margin: number
}

export const BAR_CODE_FORMATS = ['code128', 'code39', 'ean13', 'ean8', 'upca', 'itf14'] as const

export type BarCodeFormat = (typeof BAR_CODE_FORMATS)[number]

export interface BarCodeProps {
  text: string
  bcid: BarCodeFormat
  colorDark: string
  includeText: boolean
}

export const DEFAULT_IMAGE_PROPS: Readonly<ImageProps> = Object.freeze({
  src: '',
  alt: '',
  fit: 'contain',
  position: 'center',
})

export const DEFAULT_QR_CODE_PROPS: Readonly<QRCodeProps> = Object.freeze({
  text: 'FOLIQ-QR-0001',
  colorDark: '#1d2735',
  colorLight: '#ffffff',
  correctLevel: 'M',
  margin: 4,
})

export const DEFAULT_BAR_CODE_PROPS: Readonly<BarCodeProps> = Object.freeze({
  text: 'FOLIQ-2026-0001',
  bcid: 'code128',
  colorDark: '#1d2735',
  includeText: true,
})

const IMAGE_FITS = new Set<ImageFit>(['contain', 'cover', 'fill'])
const IMAGE_POSITIONS = new Set<ImagePosition>(['center', 'top', 'right', 'bottom', 'left'])
const QR_CORRECTION_LEVELS = new Set<QRCodeErrorCorrection>(['L', 'M', 'Q', 'H'])
const BAR_CODE_FORMAT_SET = new Set<BarCodeFormat>(BAR_CODE_FORMATS)
const HEX_COLOR = /^#[0-9a-f]{6}$/i

export function isImageProps(value: unknown): value is ImageProps {
  const source = record(value)
  return Boolean(
    source &&
    typeof source['src'] === 'string' &&
    typeof source['alt'] === 'string' &&
    typeof source['fit'] === 'string' &&
    IMAGE_FITS.has(source['fit'] as ImageFit) &&
    typeof source['position'] === 'string' &&
    IMAGE_POSITIONS.has(source['position'] as ImagePosition),
  )
}

export function isQRCodeProps(value: unknown): value is QRCodeProps {
  const source = record(value)
  return Boolean(
    source &&
    typeof source['text'] === 'string' &&
    typeof source['colorDark'] === 'string' &&
    HEX_COLOR.test(source['colorDark']) &&
    typeof source['colorLight'] === 'string' &&
    HEX_COLOR.test(source['colorLight']) &&
    typeof source['correctLevel'] === 'string' &&
    QR_CORRECTION_LEVELS.has(source['correctLevel'] as QRCodeErrorCorrection) &&
    typeof source['margin'] === 'number' &&
    Number.isInteger(source['margin']) &&
    source['margin'] >= 0 &&
    source['margin'] <= 32,
  )
}

export function isBarCodeProps(value: unknown): value is BarCodeProps {
  const source = record(value)
  return Boolean(
    source &&
    typeof source['text'] === 'string' &&
    typeof source['bcid'] === 'string' &&
    BAR_CODE_FORMAT_SET.has(source['bcid'] as BarCodeFormat) &&
    typeof source['colorDark'] === 'string' &&
    HEX_COLOR.test(source['colorDark']) &&
    typeof source['includeText'] === 'boolean',
  )
}

export function normalizeImageProps(value: unknown): ImageProps {
  if (typeof value === 'string') return { ...DEFAULT_IMAGE_PROPS, src: value }
  const source = record(value)
  return {
    src: stringValue(source?.['src'], DEFAULT_IMAGE_PROPS.src),
    alt: stringValue(source?.['alt'], DEFAULT_IMAGE_PROPS.alt),
    fit: member(source?.['fit'], IMAGE_FITS, DEFAULT_IMAGE_PROPS.fit),
    position: member(source?.['position'], IMAGE_POSITIONS, DEFAULT_IMAGE_PROPS.position),
  }
}

export function normalizeQRCodeProps(value: unknown): QRCodeProps {
  const source = record(value)
  return {
    text:
      typeof value === 'string' ? value : stringValue(source?.['text'], DEFAULT_QR_CODE_PROPS.text),
    colorDark: colorValue(source?.['colorDark'], DEFAULT_QR_CODE_PROPS.colorDark),
    colorLight: colorValue(source?.['colorLight'], DEFAULT_QR_CODE_PROPS.colorLight),
    correctLevel: normalizeCorrectionLevel(source?.['correctLevel']),
    margin: boundedInteger(source?.['margin'], DEFAULT_QR_CODE_PROPS.margin, 0, 32),
  }
}

export function normalizeBarCodeProps(value: unknown): BarCodeProps {
  const source = record(value)
  return {
    text:
      typeof value === 'string'
        ? value
        : stringValue(source?.['text'], DEFAULT_BAR_CODE_PROPS.text),
    bcid: member(source?.['bcid'], BAR_CODE_FORMAT_SET, DEFAULT_BAR_CODE_PROPS.bcid),
    colorDark: colorValue(source?.['colorDark'], DEFAULT_BAR_CODE_PROPS.colorDark),
    includeText:
      typeof source?.['includeText'] === 'boolean'
        ? source['includeText']
        : DEFAULT_BAR_CODE_PROPS.includeText,
  }
}

export function imageSourceError(src: string): string | null {
  const value = src.trim()
  if (value === '') return null
  const lower = value.toLowerCase()
  if (lower.startsWith('blob:')) return '临时 blob 地址不能保存，请重新选择图片文件'
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:')) return '图片地址协议不安全'
  if (lower.startsWith('data:') && !lower.startsWith('data:image/')) {
    return '仅支持图片类型的 Data URL'
  }
  return null
}

export function qrCodeContentError(value: QRCodeProps): string | null {
  return value.text.trim() === '' ? '二维码内容不能为空' : null
}

export function barCodeContentError(value: BarCodeProps): string | null {
  const text = value.text.trim()
  if (text === '') return '条形码内容不能为空'
  switch (value.bcid) {
    case 'code128':
      return /[\u0000-\u001f\u007f]/.test(text) ? 'Code 128 不支持控制字符' : null
    case 'code39':
      return /^[0-9A-Z .\-$/+%]+$/.test(text) ? null : 'Code 39 仅支持大写字母、数字和 . - $ / + %'
    case 'ean13':
      return /^\d{12,13}$/.test(text) ? null : 'EAN-13 需要 12 或 13 位数字'
    case 'ean8':
      return /^\d{7,8}$/.test(text) ? null : 'EAN-8 需要 7 或 8 位数字'
    case 'upca':
      return /^\d{11,12}$/.test(text) ? null : 'UPC-A 需要 11 或 12 位数字'
    case 'itf14':
      return /^\d{13,14}$/.test(text) ? null : 'ITF-14 需要 13 或 14 位数字'
  }
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

function colorValue(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX_COLOR.test(value) ? value.toLowerCase() : fallback
}

function member<T extends string>(value: unknown, values: Set<T>, fallback: T): T {
  return typeof value === 'string' && values.has(value as T) ? (value as T) : fallback
}

function boundedInteger(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, Math.round(value)))
    : fallback
}

function normalizeCorrectionLevel(value: unknown): QRCodeErrorCorrection {
  if (typeof value === 'string' && QR_CORRECTION_LEVELS.has(value as QRCodeErrorCorrection)) {
    return value as QRCodeErrorCorrection
  }
  // easyqrcodejs legacy numeric constants: M=0, L=1, H=2, Q=3.
  if (value === 0) return 'M'
  if (value === 1) return 'L'
  if (value === 2) return 'H'
  if (value === 3) return 'Q'
  return DEFAULT_QR_CODE_PROPS.correctLevel
}
