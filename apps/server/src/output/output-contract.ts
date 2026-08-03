import { BadRequestException } from '@nestjs/common'
import {
  deserialize,
  isTemplateSchema,
  type DataRecord,
  type JsonValue,
  type OutputOptions,
  type RenderContext,
  type TemplateSchema,
} from '@ptd/core'

const MAX_FILE_NAME_LENGTH = 120
const MAX_TITLE_LENGTH = 120
const MAX_PAGE_LIMIT = 200
const MAX_JSON_DEPTH = 32

export interface OutputPdfInput {
  readonly template: TemplateSchema
  readonly renderContext: RenderContext
  readonly options: OutputOptions
  readonly fileName: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function bodyRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new BadRequestException('Request body must be an object')
  return value
}

function requiredText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string') throw new BadRequestException(`${field} must be a string`)
  const result = value.trim()
  if (result.length === 0 || result.length > maxLength) {
    throw new BadRequestException(`${field} must contain 1-${maxLength} characters`)
  }
  return result
}

function optionalText(value: unknown, field: string, maxLength: number): string | undefined {
  if (value === undefined) return undefined
  return requiredText(value, field, maxLength)
}

function isoInstant(value: unknown, field: string): string {
  const result = requiredText(value, field, 40)
  if (!Number.isFinite(Date.parse(result)) || new Date(result).toISOString() !== result) {
    throw new BadRequestException(`${field} must be a canonical ISO-8601 instant`)
  }
  return result
}

function locale(value: unknown): string {
  const result = requiredText(value, 'locale', 35)
  try {
    return new Intl.Locale(result).toString()
  } catch {
    throw new BadRequestException('locale must be a valid BCP 47 locale')
  }
}

function timeZone(value: unknown): string {
  const result = requiredText(value, 'timeZone', 80)
  try {
    new Intl.DateTimeFormat('en', { timeZone: result }).format(0)
    return result
  } catch {
    throw new BadRequestException('timeZone must be a valid IANA time zone')
  }
}

function jsonValue(value: unknown, field: string, depth = 0): JsonValue {
  if (depth > MAX_JSON_DEPTH) throw new BadRequestException(`${field} exceeds maximum JSON depth`)
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value))
      throw new BadRequestException(`${field} contains a non-finite number`)
    return value
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => jsonValue(item, `${field}[${index}]`, depth + 1))
  }
  if (isRecord(value)) {
    const result: Record<string, JsonValue> = {}
    for (const [key, item] of Object.entries(value)) {
      result[key] = jsonValue(item, `${field}.${key}`, depth + 1)
    }
    return result
  }
  throw new BadRequestException(`${field} must contain JSON values only`)
}

function dataRecord(value: unknown, field: string): DataRecord {
  const result = jsonValue(value, field)
  if (!isRecord(result)) throw new BadRequestException(`${field} must be an object`)
  return result
}

function template(value: unknown): TemplateSchema {
  try {
    const source = JSON.stringify(value)
    if (source === undefined) throw new TypeError('Template is not JSON serializable')
    const result = deserialize(source)
    if (!isTemplateSchema(result)) throw new TypeError('TemplateSchema is invalid')
    return result
  } catch {
    throw new BadRequestException('template must be a valid TemplateSchema')
  }
}

function renderContext(value: unknown): RenderContext {
  const context = bodyRecord(value)
  if (context['mode'] !== 'export') {
    throw new BadRequestException('renderContext.mode must be export')
  }
  const data = jsonValue(context['data'], 'renderContext.data')
  const record =
    context['record'] === undefined
      ? undefined
      : dataRecord(context['record'], 'renderContext.record')
  const recordIndex = context['recordIndex']
  if (
    recordIndex !== undefined &&
    (typeof recordIndex !== 'number' || !Number.isSafeInteger(recordIndex) || recordIndex < 0)
  ) {
    throw new BadRequestException('renderContext.recordIndex must be a non-negative integer')
  }
  return {
    data,
    ...(record ? { record } : {}),
    ...(recordIndex === undefined ? {} : { recordIndex }),
    locale: locale(context['locale']),
    timeZone: timeZone(context['timeZone']),
    now: isoInstant(context['now'], 'renderContext.now'),
    mode: 'export',
  }
}

function outputOptions(value: unknown, context: RenderContext): OutputOptions {
  const options = bodyRecord(value)
  const parsedLocale = locale(options['locale'])
  const parsedTimeZone = timeZone(options['timeZone'])
  const now = isoInstant(options['now'], 'options.now')
  if (
    parsedLocale !== context.locale ||
    parsedTimeZone !== context.timeZone ||
    now !== context.now
  ) {
    throw new BadRequestException('options locale, timeZone and now must match renderContext')
  }
  const pageLimit = options['pageLimit']
  const title = optionalText(options['title'], 'options.title', MAX_TITLE_LENGTH)
  if (
    pageLimit !== undefined &&
    (typeof pageLimit !== 'number' ||
      !Number.isInteger(pageLimit) ||
      pageLimit < 1 ||
      pageLimit > MAX_PAGE_LIMIT)
  ) {
    throw new BadRequestException(`options.pageLimit must be an integer from 1-${MAX_PAGE_LIMIT}`)
  }
  return {
    locale: parsedLocale,
    timeZone: parsedTimeZone,
    now,
    ...(title ? { title } : {}),
    ...(pageLimit === undefined ? {} : { pageLimit }),
  }
}

export function parseOutputPdfBody(body: unknown): OutputPdfInput {
  const value = bodyRecord(body)
  const parsedTemplate = template(value['template'])
  const context = renderContext(value['renderContext'])
  const options = outputOptions(value['options'], context)
  const fileName =
    optionalText(value['fileName'], 'fileName', MAX_FILE_NAME_LENGTH) ??
    options.title ??
    parsedTemplate.pageConfig.title
  return { template: parsedTemplate, renderContext: context, options, fileName }
}

export function pdfFileName(value: string): string {
  const withoutExtension = value.replace(/\.pdf$/i, '')
  const safe = withoutExtension
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .trim()
    .slice(0, MAX_FILE_NAME_LENGTH - 4)
  return `${safe || 'foliq-output'}.pdf`
}

export function pdfContentDisposition(fileName: string): string {
  const normalized = pdfFileName(fileName)
  const asciiStem = normalized
    .slice(0, -4)
    .normalize('NFKD')
    .replace(/[^\x20-\x7e]/g, '')
    .replace(/["\\]/g, '-')
    .trim()
  const fallbackStem = /[a-z0-9]/i.test(asciiStem) ? asciiStem : 'foliq-output'
  const fallback = `${fallbackStem}.pdf`
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(normalized)}`
}
