import {
  DATA_SOURCE_LIMITS,
  type DataDiagnostic,
  type DataPath,
  type DataRecord,
  type DataSourceLimits,
  type JsonValue,
} from '../types/data-source'
import { ARRAY_ITEM_PATH_SEGMENT, formatDataPath, isSafeDataKey } from './path'

export interface RuntimeRecordsSummary {
  readonly root: 'object' | 'array' | 'invalid'
  readonly recordCount: number
  readonly fieldCount: number
  readonly byteCount: number
  readonly maxDepth: number
}

export interface RuntimeRecordsValidationResult {
  readonly ok: boolean
  readonly records: readonly DataRecord[]
  readonly diagnostics: readonly DataDiagnostic[]
  readonly summary: RuntimeRecordsSummary
}

interface ValidationState {
  readonly limits: DataSourceLimits
  readonly diagnostics: DataDiagnostic[]
  readonly fieldPaths: Set<string>
  readonly ancestors: Set<object>
  maxDepth: number
  capped: boolean
}

function addDiagnostic(state: ValidationState, diagnostic: DataDiagnostic): void {
  if (state.diagnostics.length < state.limits.maxDiagnostics) {
    state.diagnostics.push(diagnostic)
    return
  }
  if (!state.capped) {
    state.capped = true
    state.diagnostics[state.limits.maxDiagnostics - 1] = {
      code: 'max-diagnostics',
      severity: 'error',
      message: `问题数量超过 ${state.limits.maxDiagnostics} 条，已停止继续列出。`,
    }
  }
}

function plainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const prototype: unknown = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function observedArrayItemType(value: unknown): string | null {
  if (value === null) return null
  if (Array.isArray(value)) return 'array'
  if (plainRecord(value)) return 'object'
  return typeof value
}

function cloneJsonValue(
  value: unknown,
  path: DataPath,
  depth: number,
  state: ValidationState,
): JsonValue | undefined {
  state.maxDepth = Math.max(state.maxDepth, depth)
  if (depth > state.limits.maxDepth) {
    addDiagnostic(state, {
      code: 'max-depth',
      severity: 'error',
      message: `数据路径“${formatDataPath(path)}”超过最大嵌套深度 ${state.limits.maxDepth}。`,
      path,
    })
    return undefined
  }
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    if (typeof value === 'string' && value.length > state.limits.maxStringLength) {
      addDiagnostic(state, {
        code: 'max-string-length',
        severity: 'error',
        message: `数据路径“${formatDataPath(path)}”的文本超过 ${state.limits.maxStringLength} 个字符。`,
        path,
      })
      return undefined
    }
    return value
  }
  if (typeof value === 'number') {
    if (Number.isFinite(value)) return value
    addDiagnostic(state, {
      code: 'unsupported-value',
      severity: 'error',
      message: `数据路径“${formatDataPath(path)}”包含非有限数值。`,
      path,
    })
    return undefined
  }
  if (typeof value !== 'object') {
    addDiagnostic(state, {
      code: 'unsupported-value',
      severity: 'error',
      message: `数据路径“${formatDataPath(path)}”包含 JSON 不支持的值。`,
      path,
    })
    return undefined
  }
  if (state.ancestors.has(value)) {
    addDiagnostic(state, {
      code: 'unsupported-value',
      severity: 'error',
      message: `数据路径“${formatDataPath(path)}”包含循环引用。`,
      path,
    })
    return undefined
  }
  state.ancestors.add(value)
  if (Array.isArray(value)) {
    const observedTypes = new Set(
      value.map(observedArrayItemType).filter((type): type is string => type !== null),
    )
    if (observedTypes.size > 1) {
      addDiagnostic(state, {
        code: 'mixed-array-items',
        severity: 'warning',
        message: `数据路径“${formatDataPath(path)}”的数组包含混合类型，字段推断只描述已观察结构。`,
        path,
      })
    }
    const result: JsonValue[] = []
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.prototype.hasOwnProperty.call(value, index)) {
        addDiagnostic(state, {
          code: 'unsupported-value',
          severity: 'error',
          message: `数据路径“${formatDataPath(path)}”包含稀疏数组。`,
          path,
        })
        result.push(null)
        continue
      }
      const cloned = cloneJsonValue(value[index], [...path, index], depth + 1, state)
      result.push(cloned ?? null)
    }
    state.ancestors.delete(value)
    return result
  }
  if (!plainRecord(value)) {
    addDiagnostic(state, {
      code: 'unsupported-value',
      severity: 'error',
      message: `数据路径“${formatDataPath(path)}”不是普通 JSON 对象。`,
      path,
    })
    state.ancestors.delete(value)
    return undefined
  }

  const result: Record<string, JsonValue> = Object.create(null) as Record<string, JsonValue>
  for (const key of Object.keys(value)) {
    const childPath = [...path, key]
    if (!isSafeDataKey(key)) {
      addDiagnostic(state, {
        code: 'unsafe-key',
        severity: 'error',
        message: `数据路径“${formatDataPath(childPath)}”包含不安全字段名。`,
        path: childPath,
      })
      continue
    }
    const normalizedPath = childPath.map((segment) =>
      typeof segment === 'number' ? ARRAY_ITEM_PATH_SEGMENT : segment,
    )
    state.fieldPaths.add(JSON.stringify(normalizedPath))
    if (state.fieldPaths.size > state.limits.maxFields) {
      addDiagnostic(state, {
        code: 'max-fields',
        severity: 'error',
        message: `数据字段数量超过上限 ${state.limits.maxFields}。`,
        path: childPath,
      })
      continue
    }
    const cloned = cloneJsonValue(value[key], childPath, depth + 1, state)
    if (cloned !== undefined) result[key] = cloned
  }
  state.ancestors.delete(value)
  return result
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength
}

export function validateRuntimeRecords(
  input: unknown,
  limits: DataSourceLimits = DATA_SOURCE_LIMITS,
): RuntimeRecordsValidationResult {
  const root = Array.isArray(input) ? 'array' : plainRecord(input) ? 'object' : 'invalid'
  const state: ValidationState = {
    limits,
    diagnostics: [],
    fieldPaths: new Set(),
    ancestors: new Set(),
    maxDepth: 0,
    capped: false,
  }
  let candidates: readonly unknown[] = []
  const sourceRecordCount = Array.isArray(input) ? input.length : plainRecord(input) ? 1 : 0

  if (root === 'invalid') {
    addDiagnostic(state, {
      code: 'invalid-root',
      severity: 'error',
      message: '数据根节点必须是一个 JSON 对象或对象数组。',
    })
  } else if (plainRecord(input)) {
    candidates = [input]
  } else if (Array.isArray(input) && input.length === 0) {
    addDiagnostic(state, {
      code: 'empty-records',
      severity: 'warning',
      message: '数据数组为空，没有可用于推断字段的记录。',
    })
  } else if (Array.isArray(input) && input.some((item: unknown) => !plainRecord(item))) {
    addDiagnostic(state, {
      code: 'mixed-record-array',
      severity: 'error',
      message: '数据根数组只能包含 JSON 对象，不能混合 primitive、null 或数组。',
    })
  } else if (Array.isArray(input)) {
    candidates = input
  }

  if (candidates.length > limits.maxRecords) {
    addDiagnostic(state, {
      code: 'max-records',
      severity: 'error',
      message: `记录数量 ${candidates.length} 超过上限 ${limits.maxRecords}。`,
    })
    candidates = candidates.slice(0, limits.maxRecords)
  }

  const records: DataRecord[] = []
  for (const candidate of candidates) {
    const cloned = cloneJsonValue(candidate, [], 0, state)
    if (plainRecord(cloned)) records.push(cloned as DataRecord)
  }

  let bytes = 0
  try {
    bytes = byteLength(JSON.stringify(input))
  } catch {
    addDiagnostic(state, {
      code: 'unsupported-value',
      severity: 'error',
      message: '数据无法序列化为 JSON。',
    })
  }
  if (bytes > limits.maxBytes) {
    addDiagnostic(state, {
      code: 'max-bytes',
      severity: 'error',
      message: `数据体积 ${bytes} 字节超过上限 ${limits.maxBytes} 字节。`,
    })
  }

  const ok = !state.diagnostics.some((diagnostic) => diagnostic.severity === 'error')
  return {
    ok,
    records: ok ? records : [],
    diagnostics: state.diagnostics,
    summary: {
      root,
      recordCount: sourceRecordCount,
      fieldCount: state.fieldPaths.size,
      byteCount: bytes,
      maxDepth: state.maxDepth,
    },
  }
}

export function parseRuntimeRecordsJson(
  source: string,
  limits: DataSourceLimits = DATA_SOURCE_LIMITS,
): RuntimeRecordsValidationResult {
  const bytes = byteLength(source)
  if (bytes > limits.maxBytes) {
    return {
      ok: false,
      records: [],
      diagnostics: [
        {
          code: 'max-bytes',
          severity: 'error',
          message: `JSON 文本体积 ${bytes} 字节超过上限 ${limits.maxBytes} 字节。`,
        },
      ],
      summary: {
        root: 'invalid',
        recordCount: 0,
        fieldCount: 0,
        byteCount: bytes,
        maxDepth: 0,
      },
    }
  }
  try {
    return validateRuntimeRecords(JSON.parse(source) as unknown, limits)
  } catch (error) {
    return {
      ok: false,
      records: [],
      diagnostics: [
        {
          code: 'invalid-root',
          severity: 'error',
          message: `JSON 解析失败：${error instanceof Error ? error.message : '未知语法错误'}`,
        },
      ],
      summary: {
        root: 'invalid',
        recordCount: 0,
        fieldCount: 0,
        byteCount: bytes,
        maxDepth: 0,
      },
    }
  }
}
