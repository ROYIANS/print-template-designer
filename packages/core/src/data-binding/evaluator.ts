import type {
  BindingExpression,
  DataDiagnostic,
  DataFieldDefinition,
  DataFormatter,
  DataValueType,
  FieldBindingExpression,
  RenderContext,
} from '../types/data-source'
import { convertByType } from './type-converters'
import { flattenDataFields } from './inference'
import { readDataPath } from './path'

export interface BindingEvaluationResult {
  readonly status: 'ready' | 'missing' | 'invalid'
  readonly value: string
  readonly diagnostics: readonly DataDiagnostic[]
}

function invalid(message: string, fieldId?: string): BindingEvaluationResult {
  return {
    status: 'invalid',
    value: '',
    diagnostics: [
      {
        code: 'invalid-formatter',
        severity: 'error',
        message,
        ...(fieldId ? { fieldId } : {}),
      },
    ],
  }
}

function validTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone }).format(0)
    return true
  } catch {
    return false
  }
}

function validLocale(locale: string): boolean {
  try {
    return Intl.getCanonicalLocales(locale).length === 1
  } catch {
    return false
  }
}

export function renderContextError(context: RenderContext): DataDiagnostic | null {
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(context.now) ||
    !Number.isFinite(Date.parse(context.now))
  ) {
    return {
      code: 'invalid-render-context',
      severity: 'error',
      message: 'RenderContext.now 必须是有效的 ISO-8601 日期时间。',
    }
  }
  if (context.locale.trim() === '' || !validLocale(context.locale)) {
    return {
      code: 'invalid-render-context',
      severity: 'error',
      message: 'RenderContext.locale 不能为空。',
    }
  }
  if (!validTimeZone(context.timeZone)) {
    return {
      code: 'invalid-render-context',
      severity: 'error',
      message: `RenderContext.timeZone“${context.timeZone}”无效。`,
    }
  }
  if (!['design', 'proof', 'print', 'export'].includes(context.mode)) {
    return {
      code: 'invalid-render-context',
      severity: 'error',
      message: `RenderContext.mode“${String(context.mode)}”无效。`,
    }
  }
  if (
    context.recordIndex !== undefined &&
    (!Number.isInteger(context.recordIndex) || context.recordIndex < 0)
  ) {
    return {
      code: 'invalid-render-context',
      severity: 'error',
      message: 'RenderContext.recordIndex 必须是非负整数。',
    }
  }
  return null
}

const CHINESE_DIGITS = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'] as const

function chineseInteger(value: number): string {
  if (value < 10) return CHINESE_DIGITS[value] ?? String(value)
  if (value < 20) return `十${value === 10 ? '' : (CHINESE_DIGITS[value % 10] ?? '')}`
  if (value < 100) {
    const remainder = value % 10
    return `${CHINESE_DIGITS[Math.floor(value / 10)] ?? ''}十${remainder === 0 ? '' : (CHINESE_DIGITS[remainder] ?? '')}`
  }
  return String(value)
}

function formatDate(
  date: Date,
  pattern: string,
  locale: string,
  timeZone: string,
  numerals: 'arabic' | 'chinese',
): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )
  const year = parts['year'] ?? ''
  const month = parts['month'] ?? ''
  const day = parts['day'] ?? ''
  const hour = parts['hour'] ?? ''
  const minute = parts['minute'] ?? ''
  const second = parts['second'] ?? ''
  const numeral = (value: string): string =>
    numerals === 'chinese' ? chineseInteger(Number(value)) : value
  const yearNumeral =
    numerals === 'chinese'
      ? year.replace(/\d/g, (digit) => CHINESE_DIGITS[Number(digit)] ?? digit)
      : year
  const tokens: Record<string, string> = {
    YYYY: yearNumeral,
    YY: yearNumeral.slice(-2),
    MM: numeral(month),
    M: numeral(String(Number(month))),
    DD: numeral(day),
    D: numeral(String(Number(day))),
    HH: numeral(hour),
    H: numeral(String(Number(hour))),
    hh: numeral(hour),
    h: numeral(String(Number(hour))),
    mm: numeral(minute),
    m: numeral(String(Number(minute))),
    ss: numeral(second),
    s: numeral(String(Number(second))),
  }
  return pattern.replace(
    /YYYY|YY|MM|DD|HH|hh|mm|ss|M|D|H|h|m|s/g,
    (token) => tokens[token] ?? token,
  )
}

function formatterDigits(value: number | undefined): boolean {
  return value === undefined || (Number.isInteger(value) && value >= 0 && value <= 20)
}

function numericValue(value: unknown, coerce: boolean | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (
    coerce &&
    typeof value === 'string' &&
    value.trim() !== '' &&
    Number.isFinite(Number(value))
  ) {
    return Number(value)
  }
  return null
}

export function formatDataValue(
  value: unknown,
  formatter: DataFormatter = { kind: 'none' },
  context: RenderContext,
): BindingEvaluationResult {
  const contextDiagnostic = renderContextError(context)
  if (contextDiagnostic) return { status: 'invalid', value: '', diagnostics: [contextDiagnostic] }
  if (value === null || value === undefined) {
    return {
      status: 'missing',
      value: '',
      diagnostics: [
        { code: 'missing-value', severity: 'warning', message: '绑定字段没有可显示的值。' },
      ],
    }
  }

  try {
    switch (formatter.kind) {
      case 'none':
        return {
          status: 'ready',
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          diagnostics: [],
        }
      case 'json':
        return { status: 'ready', value: JSON.stringify(value), diagnostics: [] }
      case 'number': {
        const numeric = numericValue(value, formatter.coerceNumericString)
        if (numeric === null) {
          return invalid('数字格式化器只能处理有限数值。')
        }
        if (
          !formatterDigits(formatter.minimumFractionDigits) ||
          !formatterDigits(formatter.maximumFractionDigits) ||
          (formatter.minimumFractionDigits ?? 0) > (formatter.maximumFractionDigits ?? 20)
        ) {
          return invalid('数字格式化器的小数位设置无效。')
        }
        return {
          status: 'ready',
          value: new Intl.NumberFormat(context.locale, {
            minimumFractionDigits: formatter.minimumFractionDigits,
            maximumFractionDigits: formatter.maximumFractionDigits,
            useGrouping: formatter.useGrouping,
          }).format(numeric),
          diagnostics: [],
        }
      }
      case 'currency': {
        const numeric = numericValue(value, formatter.coerceNumericString)
        if (numeric === null) {
          return invalid('货币格式化器只能处理有限数值。')
        }
        if (formatter.currency.trim() === '') return invalid('货币格式化器需要有效货币代码。')
        return {
          status: 'ready',
          value: new Intl.NumberFormat(context.locale, {
            style: 'currency',
            currency: formatter.currency,
            minimumFractionDigits: formatter.minimumFractionDigits,
            maximumFractionDigits: formatter.maximumFractionDigits,
          }).format(numeric),
          diagnostics: [],
        }
      }
      case 'chinese-number':
        if (numericValue(value, formatter.coerceNumericString) === null) {
          return invalid('中文大写数字格式化器只能处理有限数值。')
        }
        return {
          status: 'ready',
          value: convertByType(numericValue(value, formatter.coerceNumericString), 'BigNumber'),
          diagnostics: [],
        }
      case 'chinese-currency':
        if (numericValue(value, formatter.coerceNumericString) === null) {
          return invalid('中文大写金额格式化器只能处理有限数值。')
        }
        return {
          status: 'ready',
          value: convertByType(numericValue(value, formatter.coerceNumericString), 'BigMoney'),
          diagnostics: [],
        }
      case 'date': {
        const source = formatter.source === 'now' ? context.now : value
        if (typeof source !== 'string' && typeof source !== 'number') {
          return invalid('日期格式化器只能处理日期字符串、时间戳或 RenderContext.now。')
        }
        const date = new Date(source)
        if (Number.isNaN(date.getTime())) return invalid('绑定值不是有效日期。')
        return {
          status: 'ready',
          value: formatDate(
            date,
            formatter.pattern ?? 'YYYY-MM-DD HH:mm:ss',
            context.locale,
            context.timeZone,
            formatter.numerals ?? 'arabic',
          ),
          diagnostics: [],
        }
      }
      default:
        return invalid('模板包含当前版本不支持的格式化器。')
    }
  } catch {
    return invalid('格式化设置无效，无法生成稳定文本。')
  }
}

function actualType(value: unknown): DataValueType {
  if (value === null || value === undefined) return 'unknown'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'string') return 'string'
  return 'unknown'
}

function compatibleType(
  expected: DataValueType,
  value: unknown,
  formatter: DataFormatter | undefined,
): boolean {
  if (expected === 'unknown') return true
  if (expected === 'date') return typeof value === 'string' || typeof value === 'number'
  if (
    expected === 'number' &&
    formatter &&
    'coerceNumericString' in formatter &&
    formatter.coerceNumericString &&
    typeof value === 'string' &&
    value.trim() !== '' &&
    Number.isFinite(Number(value))
  ) {
    return true
  }
  return actualType(value) === expected
}

function currentRecord(context: RenderContext): unknown {
  if (context.record) return context.record
  if (context.data !== null && typeof context.data === 'object' && !Array.isArray(context.data)) {
    return context.data
  }
  return undefined
}

function evaluateField(
  expression: FieldBindingExpression,
  fields: readonly DataFieldDefinition[],
  context: RenderContext,
): BindingEvaluationResult {
  const field = flattenDataFields(fields).find((candidate) => candidate.id === expression.fieldId)
  if (!field) {
    return {
      status: expression.fallback !== undefined ? 'ready' : 'invalid',
      value: expression.fallback ?? '',
      diagnostics: [
        {
          code: 'field-not-found',
          severity: 'error',
          message: `绑定引用的字段“${expression.fieldId}”不存在。`,
          fieldId: expression.fieldId,
        },
      ],
    }
  }
  const selectedFormatter = expression.formatter ?? field.formatter
  if (selectedFormatter?.kind === 'date' && selectedFormatter.source === 'now') {
    const formatted = formatDataValue(context.now, selectedFormatter, context)
    return {
      ...formatted,
      diagnostics: formatted.diagnostics.map((diagnostic) => ({
        ...diagnostic,
        fieldId: field.id,
      })),
    }
  }
  const read = readDataPath(currentRecord(context), field.path)
  if (read.status !== 'ready') {
    return {
      status: expression.fallback !== undefined ? 'ready' : read.status,
      value: expression.fallback ?? '',
      diagnostics: read.diagnostics.map((diagnostic) => ({ ...diagnostic, fieldId: field.id })),
    }
  }
  if (!compatibleType(field.valueType, read.value, selectedFormatter)) {
    return {
      status: expression.fallback !== undefined ? 'ready' : 'invalid',
      value: expression.fallback ?? '',
      diagnostics: [
        {
          code: 'type-mismatch',
          severity: 'error',
          message: `字段“${field.name}”期望 ${field.valueType}，实际值类型为 ${actualType(read.value)}。`,
          fieldId: field.id,
          path: field.path,
        },
      ],
    }
  }
  const formatted = formatDataValue(read.value, selectedFormatter, context)
  return {
    ...formatted,
    diagnostics: formatted.diagnostics.map((diagnostic) => ({ ...diagnostic, fieldId: field.id })),
  }
}

export function evaluateBinding(
  expression: BindingExpression,
  fields: readonly DataFieldDefinition[],
  context: RenderContext,
): BindingEvaluationResult {
  if (expression.kind === 'field') return evaluateField(expression, fields, context)
  const values: string[] = []
  const diagnostics: DataDiagnostic[] = []
  let status: BindingEvaluationResult['status'] = 'ready'
  for (const segment of expression.segments) {
    if (segment.kind === 'literal') {
      values.push(segment.value)
      continue
    }
    const evaluated = evaluateField(segment, fields, context)
    values.push(evaluated.value)
    diagnostics.push(...evaluated.diagnostics)
    if (evaluated.status === 'invalid') status = 'invalid'
    else if (evaluated.status === 'missing' && status === 'ready') status = 'missing'
  }
  return { status, value: values.join(''), diagnostics }
}
