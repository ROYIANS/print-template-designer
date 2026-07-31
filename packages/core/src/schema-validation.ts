import { pageConfigError, type PageConfig } from './types/page-config'
import type { ComponentSchema, ComponentStyle, ComponentType } from './types/component-schema'
import type { DataSourceField, DataFieldType } from './types/data-source'
import type { TemplatePage, TemplateSchema } from './types/template-schema'

const COMPONENT_TYPES: ReadonlySet<string> = new Set<ComponentType>([
  'RoySimpleText',
  'RoyText',
  'RoySimpleTable',
  'RoyComplexTable',
  'RoyLine',
  'RoyRect',
  'RoyCircle',
  'RoyStar',
  'RoyImage',
  'RoyQRCode',
  'RoyBarCode',
  'RoyGroup',
])

const DATA_FIELD_TYPES: ReadonlySet<string> = new Set<DataFieldType>([
  'String',
  'Array',
  'Money',
  'BigMoney',
  'BigNumber',
  'CurDateTime',
  'BigCurDate',
])

const STYLE_NUMBER_KEYS = [
  'left',
  'top',
  'fontSize',
  'borderWidth',
] as const satisfies readonly (keyof ComponentStyle)[]

const STYLE_STRING_KEYS = [
  'fontFamily',
  'color',
  'borderColor',
  'borderType',
  'borderRadius',
  'padding',
  'margin',
  'lineHeight',
  'letterSpacing',
  'justifyContent',
  'alignItems',
  'fontWeight',
  'fontStyle',
  'elementPosition',
] as const satisfies readonly (keyof ComponentStyle)[]

const STYLE_BOOLEAN_KEYS = [
  'isUnderLine',
  'isDelLine',
] as const satisfies readonly (keyof ComponentStyle)[]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function hasOptionalType(
  source: Record<string, unknown>,
  key: string,
  guard: (value: unknown) => boolean,
): boolean {
  return source[key] === undefined || guard(source[key])
}

function isPageConfig(value: unknown): value is PageConfig {
  if (!isRecord(value)) return false
  const config = value as unknown as PageConfig
  return (
    typeof value['pageSize'] === 'string' &&
    (value['pageDirection'] === 'p' || value['pageDirection'] === 'l') &&
    (value['pageLayout'] === 'fixed' || value['pageLayout'] === 'relative') &&
    isFiniteNumber(value['pageWidth']) &&
    isFiniteNumber(value['pageHeight']) &&
    isFiniteNumber(value['pageCurHeight']) &&
    isFiniteNumber(value['pageMarginBottom']) &&
    isFiniteNumber(value['pageMarginTop']) &&
    isFiniteNumber(value['pageMarginLeft']) &&
    isFiniteNumber(value['pageMarginRight']) &&
    typeof value['title'] === 'string' &&
    isFiniteNumber(value['scale']) &&
    typeof value['background'] === 'string' &&
    typeof value['color'] === 'string' &&
    isFiniteNumber(value['fontSize']) &&
    typeof value['fontFamily'] === 'string' &&
    isFiniteNumber(value['lineHeight']) &&
    pageConfigError(config) === null
  )
}

function isComponentStyle(value: unknown): value is ComponentStyle {
  if (!isRecord(value)) return false
  if (
    !isFiniteNumber(value['width']) ||
    !isFiniteNumber(value['height']) ||
    !isFiniteNumber(value['rotate']) ||
    !isFiniteNumber(value['opacity'])
  ) {
    return false
  }
  if (STYLE_NUMBER_KEYS.some((key) => !hasOptionalType(value, key, isFiniteNumber))) return false
  if (
    STYLE_STRING_KEYS.some(
      (key) => !hasOptionalType(value, key, (item) => typeof item === 'string'),
    )
  ) {
    return false
  }
  if (
    value['background'] !== undefined &&
    value['background'] !== null &&
    typeof value['background'] !== 'string'
  ) {
    return false
  }
  return !STYLE_BOOLEAN_KEYS.some(
    (key) => !hasOptionalType(value, key, (item) => typeof item === 'boolean'),
  )
}

function isComponentSchema(value: unknown, depth = 0): value is ComponentSchema {
  if (!isRecord(value) || depth > 100) return false
  if (
    !isNonEmptyString(value['id']) ||
    typeof value['component'] !== 'string' ||
    !COMPONENT_TYPES.has(value['component']) ||
    !isComponentStyle(value['style']) ||
    !isRecord(value['groupStyle']) ||
    !isRecord(value['position'])
  ) {
    return false
  }
  if (!hasOptionalType(value, 'icon', (item) => typeof item === 'string')) return false
  if (!hasOptionalType(value, 'code', (item) => typeof item === 'string')) return false
  if (!hasOptionalType(value, 'name', (item) => typeof item === 'string')) return false
  if (
    !hasOptionalType(
      value,
      'group',
      (item) => item === 'common' || item === 'data' || item === 'shape',
    )
  ) {
    return false
  }
  if (!hasOptionalType(value, 'isLock', (item) => typeof item === 'boolean')) return false
  if (!hasOptionalType(value['position'], 'x', isFiniteNumber)) return false
  if (!hasOptionalType(value['position'], 'y', isFiniteNumber)) return false
  if (value['component'] === 'RoyGroup') {
    return (
      Array.isArray(value['propValue']) &&
      value['propValue'].every((child) => isComponentSchema(child, depth + 1))
    )
  }
  return true
}

function isTemplatePage(value: unknown): value is TemplatePage {
  return (
    isRecord(value) &&
    isNonEmptyString(value['id']) &&
    Array.isArray(value['componentData']) &&
    value['componentData'].every((component) => isComponentSchema(component))
  )
}

function isDataSourceField(value: unknown): value is DataSourceField {
  return (
    isRecord(value) &&
    isNonEmptyString(value['id']) &&
    typeof value['title'] === 'string' &&
    isNonEmptyString(value['field']) &&
    typeof value['typeName'] === 'string' &&
    DATA_FIELD_TYPES.has(value['typeName'])
  )
}

export function isTemplateSchema(value: unknown): value is TemplateSchema {
  return (
    isRecord(value) &&
    Number.isInteger(value['_version']) &&
    typeof value['_version'] === 'number' &&
    value['_version'] >= 0 &&
    isPageConfig(value['pageConfig']) &&
    Array.isArray(value['pages']) &&
    value['pages'].length > 0 &&
    value['pages'].every(isTemplatePage) &&
    Array.isArray(value['dataSource']) &&
    value['dataSource'].every(isDataSourceField) &&
    isRecord(value['dataSet'])
  )
}
