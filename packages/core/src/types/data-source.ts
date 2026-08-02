/** Legacy datasource value/formatter names. Kept for v1 template compatibility only. */
export type DataFieldType =
  | 'String'
  | 'Array'
  | 'Money'
  | 'BigMoney'
  | 'BigNumber'
  | 'CurDateTime'
  | 'BigCurDate'

/** Legacy flat field definition. New templates use {@link DataFieldDefinition}. */
export interface DataSourceField {
  id: string
  title: string
  field: string
  typeName: DataFieldType
}

/** Legacy runtime/sample record. New APIs use the bounded JSON contracts below. */
export type DataSet = Record<string, unknown>

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
export interface JsonObject {
  readonly [key: string]: JsonValue
}

export type DataRecord = JsonObject

export type DataValueType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'object'
  | 'array'
  | 'unknown'

/** A serializable wildcard used by inferred children of array fields. */
export interface DataPathArrayItem {
  readonly kind: 'array-item'
}

export type DataPathSegment = string | number | DataPathArrayItem
export type DataPath = readonly DataPathSegment[]

export type DataFormatter =
  | { readonly kind: 'none' }
  | {
      readonly kind: 'number'
      readonly minimumFractionDigits?: number
      readonly maximumFractionDigits?: number
      readonly useGrouping?: boolean
      /** Compatibility-only opt-in for legacy numeric strings. */
      readonly coerceNumericString?: boolean
    }
  | {
      readonly kind: 'currency'
      readonly currency: string
      readonly minimumFractionDigits?: number
      readonly maximumFractionDigits?: number
      /** Compatibility-only opt-in for legacy numeric strings. */
      readonly coerceNumericString?: boolean
    }
  | { readonly kind: 'chinese-number'; readonly coerceNumericString?: boolean }
  | { readonly kind: 'chinese-currency'; readonly coerceNumericString?: boolean }
  | {
      readonly kind: 'date'
      readonly pattern?: string
      /** `now` is explicit and deterministic because it comes from RenderContext.now. */
      readonly source?: 'value' | 'now'
      readonly numerals?: 'arabic' | 'chinese'
    }
  | { readonly kind: 'json' }

export interface DataFieldDefinition {
  readonly id: string
  readonly name: string
  readonly path: DataPath
  readonly valueType: DataValueType
  readonly formatter?: DataFormatter
  readonly children?: readonly DataFieldDefinition[]
}

export interface TemplateDataDefinition {
  readonly version: 1
  readonly fields: readonly DataFieldDefinition[]
  /** Bounded design-time examples. Host runtime records never enter this property implicitly. */
  readonly sampleRecords?: readonly DataRecord[]
}

export type RenderMode = 'design' | 'proof' | 'print' | 'export'

export interface RenderContext {
  /** Complete runtime payload supplied by the Host. */
  readonly data: JsonValue
  /** Current record selected from data. Defaults to data when data is a single object. */
  readonly record?: DataRecord
  readonly recordIndex?: number
  readonly locale: string
  readonly timeZone: string
  /** Explicit ISO-8601 instant. Evaluators never read the system clock. */
  readonly now: string
  readonly mode: RenderMode
}

export interface LiteralBindingSegment {
  readonly kind: 'literal'
  readonly value: string
}

export interface FieldBindingExpression {
  readonly kind: 'field'
  readonly fieldId: string
  readonly formatter?: DataFormatter
  readonly fallback?: string
}

export interface TextBindingExpression {
  readonly kind: 'text'
  readonly segments: readonly (LiteralBindingSegment | FieldBindingExpression)[]
}

export type BindingExpression = FieldBindingExpression | TextBindingExpression

export type ComponentBindingTarget =
  | { readonly kind: 'text' }
  | { readonly kind: 'rich-text' }
  | { readonly kind: 'image-source' }
  | { readonly kind: 'code-content' }
  | { readonly kind: 'table-cell-text'; readonly cellId: string }

export interface ComponentBinding {
  readonly id: string
  readonly target: ComponentBindingTarget
  readonly expression: BindingExpression
}

export interface ComponentBindingTargetDefinition {
  readonly kind: ComponentBindingTarget['kind']
  readonly label: string
  readonly acceptedTypes: readonly DataValueType[]
  readonly supportsInterpolation: boolean
}

export type DataDiagnosticSeverity = 'info' | 'warning' | 'error'

export type DataDiagnosticCode =
  | 'invalid-root'
  | 'empty-records'
  | 'mixed-record-array'
  | 'mixed-array-items'
  | 'unsupported-value'
  | 'unsafe-key'
  | 'max-bytes'
  | 'max-records'
  | 'max-depth'
  | 'max-fields'
  | 'max-string-length'
  | 'max-diagnostics'
  | 'invalid-path'
  | 'array-item-context-required'
  | 'missing-value'
  | 'field-not-found'
  | 'invalid-binding-target'
  | 'type-mismatch'
  | 'invalid-formatter'
  | 'invalid-render-context'
  | 'legacy-field-type'

export interface DataDiagnostic {
  readonly code: DataDiagnosticCode
  readonly severity: DataDiagnosticSeverity
  readonly message: string
  readonly path?: DataPath
  readonly fieldId?: string
  readonly bindingId?: string
}

export interface DataSourceLimits {
  readonly maxBytes: number
  readonly maxRecords: number
  readonly maxDepth: number
  readonly maxFields: number
  readonly maxStringLength: number
  readonly maxDiagnostics: number
}

export const DATA_SOURCE_LIMITS: Readonly<DataSourceLimits> = Object.freeze({
  maxBytes: 512 * 1024,
  maxRecords: 500,
  maxDepth: 12,
  maxFields: 1_000,
  maxStringLength: 100_000,
  maxDiagnostics: 100,
})
