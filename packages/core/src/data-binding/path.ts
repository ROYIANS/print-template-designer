import type {
  DataDiagnostic,
  DataPath,
  DataPathArrayItem,
  DataPathSegment,
} from '../types/data-source'

const DANGEROUS_KEYS: ReadonlySet<string> = new Set(['__proto__', 'prototype', 'constructor'])

export const ARRAY_ITEM_PATH_SEGMENT: Readonly<DataPathArrayItem> = Object.freeze({
  kind: 'array-item',
})

export interface DataPathParseResult {
  readonly ok: boolean
  readonly path: DataPath
  readonly diagnostics: readonly DataDiagnostic[]
}

export interface DataPathReadResult {
  readonly status: 'ready' | 'missing' | 'invalid'
  readonly value?: unknown
  readonly diagnostics: readonly DataDiagnostic[]
}

export function isDataPathArrayItem(value: unknown): value is DataPathArrayItem {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const keys = Object.keys(value)
  return keys.length === 1 && keys[0] === 'kind' && Reflect.get(value, 'kind') === 'array-item'
}

export function isSafeDataKey(key: string): boolean {
  return !DANGEROUS_KEYS.has(key)
}

export function isDataPath(value: unknown): value is DataPath {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (segment) =>
        (typeof segment === 'string' && segment.length > 0 && isSafeDataKey(segment)) ||
        (typeof segment === 'number' && Number.isSafeInteger(segment) && segment >= 0) ||
        isDataPathArrayItem(segment),
    )
  )
}

function invalidPath(message: string): DataPathParseResult {
  return {
    ok: false,
    path: [],
    diagnostics: [{ code: 'invalid-path', severity: 'error', message }],
  }
}

function appendStringSegment(
  segments: DataPathSegment[],
  value: string,
): DataPathParseResult | null {
  if (value.length === 0) return invalidPath('数据路径不能包含空字段名。')
  if (!isSafeDataKey(value)) return invalidPath(`数据路径包含不安全字段“${value}”。`)
  segments.push(value)
  return null
}

/**
 * Parses a JSONPath-like subset without evaluating code.
 * Supports `order.code`, `items[0].sku`, `order["line.item"]` and inferred `items[].sku`.
 */
export function parseDataPath(source: string): DataPathParseResult {
  const input = source.trim()
  if (input === '') return invalidPath('数据路径不能为空。')
  const segments: DataPathSegment[] = []
  let index = 0
  let expectsSegment = true

  while (index < input.length) {
    const character = input[index]
    if (character === '.') {
      if (expectsSegment) return invalidPath('数据路径中的点号位置无效。')
      expectsSegment = true
      index += 1
      continue
    }

    if (character === '[') {
      const closing = input.indexOf(']', index + 1)
      if (closing < 0) return invalidPath('数据路径缺少右方括号。')
      const content = input.slice(index + 1, closing).trim()
      if (content === '') {
        segments.push(ARRAY_ITEM_PATH_SEGMENT)
      } else if (/^\d+$/.test(content)) {
        const numeric = Number(content)
        if (!Number.isSafeInteger(numeric)) return invalidPath('数组索引超出安全整数范围。')
        segments.push(numeric)
      } else if (content.startsWith('"') && content.endsWith('"')) {
        try {
          const parsed: unknown = JSON.parse(content)
          if (typeof parsed !== 'string') return invalidPath('方括号字段名必须是字符串。')
          const error = appendStringSegment(segments, parsed)
          if (error) return error
        } catch {
          return invalidPath('方括号字段名不是有效的 JSON 字符串。')
        }
      } else {
        return invalidPath('方括号只支持非负数组索引、空数组项或 JSON 字符串字段名。')
      }
      expectsSegment = false
      index = closing + 1
      continue
    }

    if (!expectsSegment) return invalidPath('相邻字段之间需要点号或方括号。')
    let end = index
    while (end < input.length && input[end] !== '.' && input[end] !== '[') end += 1
    const error = appendStringSegment(segments, input.slice(index, end))
    if (error) return error
    expectsSegment = false
    index = end
  }

  if (expectsSegment || segments.length === 0) return invalidPath('数据路径结尾无效。')
  return { ok: true, path: segments, diagnostics: [] }
}

function isIdentifier(value: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value) && isSafeDataKey(value)
}

export function formatDataPath(path: DataPath): string {
  return path.reduce<string>((result, segment, index) => {
    if (isDataPathArrayItem(segment)) return `${result}[]`
    if (typeof segment === 'number') return `${result}[${segment}]`
    if (isIdentifier(segment)) return `${result}${index === 0 ? '' : '.'}${segment}`
    return `${result}[${JSON.stringify(segment)}]`
  }, '')
}

function plainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const prototype: unknown = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

export function readDataPath(source: unknown, path: DataPath | string): DataPathReadResult {
  const parsed =
    typeof path === 'string' ? parseDataPath(path) : { ok: isDataPath(path), path, diagnostics: [] }
  if (!parsed.ok) {
    return {
      status: 'invalid',
      diagnostics:
        parsed.diagnostics.length > 0
          ? parsed.diagnostics
          : [{ code: 'invalid-path', severity: 'error', message: '数据路径结构无效。' }],
    }
  }

  let current = source
  for (const segment of parsed.path) {
    if (isDataPathArrayItem(segment)) {
      return {
        status: 'invalid',
        diagnostics: [
          {
            code: 'array-item-context-required',
            severity: 'error',
            message: '数组项字段需要重复记录上下文，不能在单记录校样中直接读取。',
            path: parsed.path,
          },
        ],
      }
    }
    if (typeof segment === 'number') {
      if (!Array.isArray(current) || segment >= current.length) {
        return {
          status: 'missing',
          diagnostics: [
            {
              code: 'missing-value',
              severity: 'warning',
              message: `数据路径“${formatDataPath(parsed.path)}”没有对应值。`,
              path: parsed.path,
            },
          ],
        }
      }
      current = current[segment]
      continue
    }
    if (!isSafeDataKey(segment)) {
      return {
        status: 'invalid',
        diagnostics: [
          {
            code: 'unsafe-key',
            severity: 'error',
            message: `拒绝读取不安全字段“${segment}”。`,
            path: parsed.path,
          },
        ],
      }
    }
    if (!plainRecord(current) || !Object.prototype.hasOwnProperty.call(current, segment)) {
      return {
        status: 'missing',
        diagnostics: [
          {
            code: 'missing-value',
            severity: 'warning',
            message: `数据路径“${formatDataPath(parsed.path)}”没有对应值。`,
            path: parsed.path,
          },
        ],
      }
    }
    current = current[segment]
  }
  return { status: 'ready', value: current, diagnostics: [] }
}
