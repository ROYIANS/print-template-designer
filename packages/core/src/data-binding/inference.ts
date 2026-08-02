import type {
  DataFieldDefinition,
  DataPath,
  DataPathSegment,
  DataRecord,
  DataValueType,
  JsonValue,
  TemplateDataDefinition,
} from '../types/data-source'
import { ARRAY_ITEM_PATH_SEGMENT, formatDataPath, isDataPathArrayItem } from './path'

interface MutableField {
  readonly encodedPath: string
  readonly name: string
  readonly path: DataPath
  readonly childPaths: Set<string>
  valueType: DataValueType
}

function encodePath(path: DataPath): string {
  return JSON.stringify(
    path.map((segment) => (isDataPathArrayItem(segment) ? { kind: 'array-item' } : segment)),
  )
}

function observedType(value: JsonValue): DataValueType {
  if (value === null) return 'unknown'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) && !Number.isNaN(Date.parse(value))) return 'date'
  return 'string'
}

function mergeType(current: DataValueType, next: DataValueType): DataValueType {
  if (current === 'unknown') return next
  if (next === 'unknown' || current === next) return current
  if ((current === 'date' && next === 'string') || (current === 'string' && next === 'date')) {
    return 'string'
  }
  return 'unknown'
}

function fieldName(path: DataPath): string {
  const segment = path[path.length - 1]
  if (typeof segment === 'string') return segment
  if (typeof segment === 'number') return `[${segment}]`
  return '数组项'
}

function parentPathOf(path: DataPath): DataPath | null {
  if (path.length <= 1) return null
  const parent = path.slice(0, -1)
  if (isDataPathArrayItem(parent[parent.length - 1])) return parent.slice(0, -1)
  return parent
}

function registerValue(fields: Map<string, MutableField>, path: DataPath, value: JsonValue): void {
  const encoded = encodePath(path)
  const existing = fields.get(encoded)
  const nextType = observedType(value)
  if (existing) existing.valueType = mergeType(existing.valueType, nextType)
  else {
    fields.set(encoded, {
      encodedPath: encoded,
      name: fieldName(path),
      path,
      childPaths: new Set(),
      valueType: nextType,
    })
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
        for (const [key, child] of Object.entries(item)) {
          registerValue(fields, [...path, ARRAY_ITEM_PATH_SEGMENT, key], child)
        }
      }
    }
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) registerValue(fields, [...path, key], child)
  }
}

function fnv1a(value: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36).padStart(7, '0')
}

function assignStableIds(fields: readonly MutableField[]): ReadonlyMap<string, string> {
  const collisions = new Map<string, string[]>()
  for (const field of fields) {
    const base = `field-${fnv1a(field.encodedPath)}`
    const paths = collisions.get(base) ?? []
    paths.push(field.encodedPath)
    collisions.set(base, paths)
  }
  const result = new Map<string, string>()
  for (const [base, paths] of collisions) {
    paths.sort()
    paths.forEach((path, index) => result.set(path, index === 0 ? base : `${base}-${index + 1}`))
  }
  return result
}

function buildDefinitions(
  fields: readonly MutableField[],
  ids: ReadonlyMap<string, string>,
): readonly DataFieldDefinition[] {
  const byPath = new Map(fields.map((field) => [field.encodedPath, field]))
  const roots: MutableField[] = []
  for (const field of fields) {
    const parentPath = parentPathOf(field.path)
    const parent = parentPath ? byPath.get(encodePath(parentPath)) : undefined
    if (parent) parent.childPaths.add(field.encodedPath)
    else roots.push(field)
  }
  const toDefinition = (field: MutableField): DataFieldDefinition => {
    const children = [...field.childPaths]
      .map((path) => byPath.get(path))
      .filter((child): child is MutableField => child !== undefined)
      .sort((left, right) => formatDataPath(left.path).localeCompare(formatDataPath(right.path)))
      .map(toDefinition)
    return {
      id: ids.get(field.encodedPath) ?? `field-${fnv1a(field.encodedPath)}`,
      name: field.name,
      path: field.path,
      valueType: field.valueType,
      ...(children.length > 0 ? { children } : {}),
    }
  }
  return roots
    .sort((left, right) => formatDataPath(left.path).localeCompare(formatDataPath(right.path)))
    .map(toDefinition)
}

/** Infers a deterministic candidate field tree. It never mutates records or an existing template. */
export function inferDataDefinition(records: readonly DataRecord[]): TemplateDataDefinition {
  const fields = new Map<string, MutableField>()
  for (const record of records) {
    for (const [key, value] of Object.entries(record)) registerValue(fields, [key], value)
  }
  const allFields = [...fields.values()]
  const ids = assignStableIds(allFields)
  return {
    version: 1,
    fields: buildDefinitions(allFields, ids),
  }
}

export function flattenDataFields(
  fields: readonly DataFieldDefinition[],
): readonly DataFieldDefinition[] {
  const result: DataFieldDefinition[] = []
  const visit = (field: DataFieldDefinition): void => {
    result.push(field)
    field.children?.forEach(visit)
  }
  fields.forEach(visit)
  return result
}

/** Public deterministic identity helper used when importing a legacy field path. */
export function dataFieldIdForPath(path: readonly DataPathSegment[]): string {
  return `field-${fnv1a(encodePath(path))}`
}
