import type {
  BindingExpression,
  DataDiagnostic,
  DataFieldDefinition,
  DataFieldType,
  DataFormatter,
  DataPath,
  DataSourceField,
  DataValueType,
  TemplateDataDefinition,
  TextBindingExpression,
} from '../types/data-source'
import type { TemplateSchema } from '../types/template-schema'
import { dataFieldIdForPath, flattenDataFields } from './inference'
import { parseDataPath } from './path'
import { validateRuntimeRecords } from './validation'

export interface NormalizedTemplateData {
  readonly source: 'canonical' | 'legacy' | 'empty'
  readonly data: TemplateDataDefinition
  readonly diagnostics: readonly DataDiagnostic[]
}

const LEGACY_BINDING_PATTERN = /\[::([^\[\]:]*)::]/g

function legacyType(
  typeName: DataFieldType,
  legacyPattern?: unknown,
): {
  valueType: DataValueType
  formatter?: DataFormatter
} {
  switch (typeName) {
    case 'String':
      return { valueType: 'string' }
    case 'Array':
      return { valueType: 'array', formatter: { kind: 'json' } }
    case 'Money':
      return {
        valueType: 'number',
        formatter: {
          kind: 'number',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: true,
          coerceNumericString: true,
        },
      }
    case 'BigMoney':
      return {
        valueType: 'number',
        formatter: { kind: 'chinese-currency', coerceNumericString: true },
      }
    case 'BigNumber':
      return {
        valueType: 'number',
        formatter: { kind: 'chinese-number', coerceNumericString: true },
      }
    case 'CurDateTime':
      return {
        valueType: 'date',
        formatter: {
          kind: 'date',
          source: 'now',
          pattern:
            typeof legacyPattern === 'string' && legacyPattern.trim() !== ''
              ? legacyPattern.replaceAll('hh', 'HH').replaceAll(':c', '')
              : 'YYYY-MM-DD HH:mm:ss',
        },
      }
    case 'BigCurDate':
      return {
        valueType: 'date',
        formatter: {
          kind: 'date',
          source: 'now',
          pattern: 'YYYY年M月D日',
          numerals: 'chinese',
        },
      }
  }
}

function uniqueId(requested: string, path: DataPath, used: Set<string>): string {
  const base = requested.trim() || dataFieldIdForPath(path)
  let id = base
  let suffix = 2
  while (used.has(id)) {
    id = `${base}-${suffix}`
    suffix += 1
  }
  used.add(id)
  return id
}

function normalizeLegacyFields(
  fields: readonly DataSourceField[],
  dataSet: Record<string, unknown>,
): { fields: readonly DataFieldDefinition[]; diagnostics: readonly DataDiagnostic[] } {
  const result: DataFieldDefinition[] = []
  const diagnostics: DataDiagnostic[] = []
  const used = new Set<string>()
  for (const legacy of fields) {
    const parsed = parseDataPath(legacy.field)
    if (!parsed.ok) {
      diagnostics.push(...parsed.diagnostics)
      continue
    }
    const converted = legacyType(legacy.typeName, dataSet[legacy.field])
    result.push({
      id: uniqueId(legacy.id, parsed.path, used),
      name: legacy.title || legacy.field,
      path: parsed.path,
      valueType: converted.valueType,
      ...(converted.formatter ? { formatter: converted.formatter } : {}),
    })
    if (!['String', 'Array'].includes(legacy.typeName)) {
      diagnostics.push({
        code: 'legacy-field-type',
        severity: 'info',
        message: `旧字段“${legacy.title || legacy.field}”的 ${legacy.typeName} 已拆分为值类型和格式化规则。`,
        fieldId: legacy.id,
        path: parsed.path,
      })
    }
  }
  return { fields: result, diagnostics }
}

/**
 * Returns the single canonical read view without changing the supplied template.
 * Callers must explicitly write the returned definition to cross the migration boundary.
 */
export function normalizeTemplateData(template: TemplateSchema): NormalizedTemplateData {
  if (template.data) return { source: 'canonical', data: template.data, diagnostics: [] }
  const legacyFields = template.dataSource ?? []
  const legacyDataSet = template.dataSet ?? {}
  if (legacyFields.length === 0 && Object.keys(legacyDataSet).length === 0) {
    return { source: 'empty', data: { version: 1, fields: [] }, diagnostics: [] }
  }
  const normalized = normalizeLegacyFields(legacyFields, legacyDataSet)
  const records = validateRuntimeRecords(legacyDataSet)
  return {
    source: 'legacy',
    data: {
      version: 1,
      fields: normalized.fields,
      ...(records.ok && records.records.length > 0 ? { sampleRecords: records.records } : {}),
    },
    diagnostics: [...normalized.diagnostics, ...records.diagnostics],
  }
}

/** Creates canonical save output while leaving the input object and legacy keys untouched. */
export function canonicalizeTemplateData(template: TemplateSchema): TemplateSchema {
  const normalized = normalizeTemplateData(template)
  const { dataSource: _legacyFields, dataSet: _legacyDataSet, ...rest } = template
  void _legacyFields
  void _legacyDataSet
  return { ...rest, data: normalized.data }
}

export function parseLegacyBindingExpression(
  template: string,
  fields: readonly DataFieldDefinition[],
): BindingExpression {
  const flatFields = flattenDataFields(fields)
  const segments: TextBindingExpression['segments'][number][] = []
  let previousIndex = 0
  for (const match of template.matchAll(LEGACY_BINDING_PATTERN)) {
    const index = match.index ?? 0
    if (index > previousIndex) {
      segments.push({ kind: 'literal', value: template.slice(previousIndex, index) })
    }
    const legacyPath = match[1] ?? ''
    const parsed = parseDataPath(legacyPath)
    const field = parsed.ok
      ? flatFields.find(
          (candidate) => JSON.stringify(candidate.path) === JSON.stringify(parsed.path),
        )
      : undefined
    segments.push({
      kind: 'field',
      fieldId: field?.id ?? `legacy-missing:${legacyPath}`,
    })
    previousIndex = index + match[0].length
  }
  if (previousIndex < template.length) {
    segments.push({ kind: 'literal', value: template.slice(previousIndex) })
  }
  if (segments.length === 1 && segments[0]?.kind === 'field') return segments[0]
  return { kind: 'text', segments }
}
