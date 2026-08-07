import { pageConfigError, type PageConfig } from './types/page-config'
import type { ComponentSchema, ComponentStyle, ComponentType } from './types/component-schema'
import type {
  BindingExpression,
  ComponentBinding,
  DataFieldDefinition,
  DataFormatter,
  DataSourceField,
  DataFieldType,
  TemplateDataDefinition,
} from './types/data-source'
import type { TemplatePage, TemplateSchema } from './types/template-schema'
import type { TemplateOutputDefinition } from './types/output'
import { isDataPath } from './data-binding/path'
import { validateRuntimeRecords } from './data-binding/validation'
import type { PlainTextWhiteSpace, TextColumnFill } from './types/text'

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

const WHITE_SPACE_VALUES: ReadonlySet<PlainTextWhiteSpace> = new Set([
  'normal',
  'pre-wrap',
  'pre-line',
  'nowrap',
])

const TEXT_COLUMN_FILL_VALUES: ReadonlySet<TextColumnFill> = new Set(['auto', 'balance'])

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
  if (
    value['whiteSpace'] !== undefined &&
    !WHITE_SPACE_VALUES.has(value['whiteSpace'] as PlainTextWhiteSpace)
  ) {
    return false
  }
  const columnCount = value['columnCount']
  if (
    columnCount !== undefined &&
    (!isFiniteNumber(columnCount) ||
      !Number.isInteger(columnCount) ||
      columnCount < 1 ||
      columnCount > 6)
  ) {
    return false
  }
  const columnGap = value['columnGap']
  if (columnGap !== undefined && (!isFiniteNumber(columnGap) || columnGap < 0)) return false
  if (
    value['columnFill'] !== undefined &&
    !TEXT_COLUMN_FILL_VALUES.has(value['columnFill'] as TextColumnFill)
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
  if (
    !hasOptionalType(
      value,
      'bindings',
      (item) =>
        Array.isArray(item) &&
        item.every(isComponentBinding) &&
        new Set(item.map((binding) => binding.id)).size === item.length,
    )
  ) {
    return false
  }
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

function isFormatter(value: unknown): value is DataFormatter {
  if (!isRecord(value) || typeof value['kind'] !== 'string') return false
  switch (value['kind']) {
    case 'none':
    case 'json':
      return true
    case 'chinese-number':
    case 'chinese-currency':
      return hasOptionalType(value, 'coerceNumericString', (item) => typeof item === 'boolean')
    case 'number':
      return (
        hasOptionalType(value, 'minimumFractionDigits', isNonNegativeInteger) &&
        hasOptionalType(value, 'maximumFractionDigits', isNonNegativeInteger) &&
        hasOptionalType(value, 'useGrouping', (item) => typeof item === 'boolean') &&
        hasOptionalType(value, 'coerceNumericString', (item) => typeof item === 'boolean')
      )
    case 'currency':
      return (
        isNonEmptyString(value['currency']) &&
        hasOptionalType(value, 'minimumFractionDigits', isNonNegativeInteger) &&
        hasOptionalType(value, 'maximumFractionDigits', isNonNegativeInteger) &&
        hasOptionalType(value, 'coerceNumericString', (item) => typeof item === 'boolean')
      )
    case 'date':
      return (
        hasOptionalType(value, 'pattern', (item) => typeof item === 'string') &&
        hasOptionalType(value, 'source', (item) => item === 'value' || item === 'now') &&
        hasOptionalType(value, 'numerals', (item) => item === 'arabic' || item === 'chinese')
      )
    default:
      return false
  }
}

function isNonNegativeInteger(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 20
}

function isBindingExpression(value: unknown): value is BindingExpression {
  if (!isRecord(value)) return false
  if (value['kind'] === 'field') {
    return (
      isNonEmptyString(value['fieldId']) &&
      hasOptionalType(value, 'formatter', isFormatter) &&
      hasOptionalType(value, 'fallback', (item) => typeof item === 'string')
    )
  }
  if (value['kind'] !== 'text' || !Array.isArray(value['segments'])) return false
  return value['segments'].every(
    (segment) =>
      isRecord(segment) &&
      ((segment['kind'] === 'literal' && typeof segment['value'] === 'string') ||
        (segment['kind'] === 'field' &&
          isNonEmptyString(segment['fieldId']) &&
          hasOptionalType(segment, 'formatter', isFormatter) &&
          hasOptionalType(segment, 'fallback', (item) => typeof item === 'string'))),
  )
}

function isComponentBinding(value: unknown): value is ComponentBinding {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value['id']) ||
    !isRecord(value['target']) ||
    !isBindingExpression(value['expression'])
  ) {
    return false
  }
  const kind = value['target']['kind']
  return (
    kind === 'text' ||
    kind === 'rich-text' ||
    kind === 'image-source' ||
    kind === 'code-content' ||
    (kind === 'table-cell-text' && isNonEmptyString(value['target']['cellId']))
  )
}

function isTemplatePage(value: unknown): value is TemplatePage {
  return (
    isRecord(value) &&
    isNonEmptyString(value['id']) &&
    Array.isArray(value['componentData']) &&
    value['componentData'].every((component) => isComponentSchema(component))
  )
}

function isTemplateOutputDefinition(value: unknown): value is TemplateOutputDefinition {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value['defaultPageMasterId']) ||
    !Array.isArray(value['pageMasters']) ||
    value['pageMasters'].length === 0
  ) {
    return false
  }
  const ids = new Set<string>()
  for (const valueMaster of value['pageMasters']) {
    if (
      !isRecord(valueMaster) ||
      !isNonEmptyString(valueMaster['id']) ||
      ids.has(valueMaster['id']) ||
      !isNonEmptyString(valueMaster['name']) ||
      !isPageMasterRegion(valueMaster['header']) ||
      !isPageMasterRegion(valueMaster['footer'])
    ) {
      return false
    }
    ids.add(valueMaster['id'])
  }
  return ids.has(value['defaultPageMasterId'])
}

function isPageMasterRegion(value: unknown): boolean {
  return (
    isRecord(value) &&
    isFiniteNumber(value['heightMm']) &&
    value['heightMm'] >= 0 &&
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

const DATA_VALUE_TYPES = new Set([
  'string',
  'number',
  'boolean',
  'date',
  'object',
  'array',
  'unknown',
])

function isDataFieldDefinition(
  value: unknown,
  ids: Set<string>,
  depth = 0,
): value is DataFieldDefinition {
  if (
    depth > 100 ||
    !isRecord(value) ||
    !isNonEmptyString(value['id']) ||
    ids.has(value['id']) ||
    !isNonEmptyString(value['name']) ||
    !isDataPath(value['path']) ||
    typeof value['valueType'] !== 'string' ||
    !DATA_VALUE_TYPES.has(value['valueType']) ||
    !hasOptionalType(value, 'formatter', isFormatter)
  ) {
    return false
  }
  ids.add(value['id'])
  return (
    value['children'] === undefined ||
    (Array.isArray(value['children']) &&
      value['children'].every((child) => isDataFieldDefinition(child, ids, depth + 1)))
  )
}

function isTemplateDataDefinition(value: unknown): value is TemplateDataDefinition {
  if (!isRecord(value) || value['version'] !== 1 || !Array.isArray(value['fields'])) {
    return false
  }
  const allIds = new Set<string>()
  if (!value['fields'].every((field) => isDataFieldDefinition(field, allIds))) return false
  if (value['sampleRecords'] === undefined) return true
  if (!Array.isArray(value['sampleRecords'])) return false
  return validateRuntimeRecords(value['sampleRecords']).ok
}

function isEmptyRecord(value: unknown): boolean {
  return isRecord(value) && Object.keys(value).length === 0
}

export function isTemplateSchema(value: unknown): value is TemplateSchema {
  if (!isRecord(value)) return false
  const canonical =
    value['data'] !== undefined &&
    isTemplateDataDefinition(value['data']) &&
    (value['dataSource'] === undefined ||
      (Array.isArray(value['dataSource']) && value['dataSource'].length === 0)) &&
    (value['dataSet'] === undefined || isEmptyRecord(value['dataSet']))
  const legacy =
    value['data'] === undefined &&
    Array.isArray(value['dataSource']) &&
    value['dataSource'].every(isDataSourceField) &&
    isRecord(value['dataSet'])
  return (
    Number.isInteger(value['_version']) &&
    typeof value['_version'] === 'number' &&
    value['_version'] >= 0 &&
    isPageConfig(value['pageConfig']) &&
    Array.isArray(value['pages']) &&
    value['pages'].length > 0 &&
    value['pages'].every(isTemplatePage) &&
    (value['output'] === undefined || isTemplateOutputDefinition(value['output'])) &&
    (canonical || legacy)
  )
}
