import type { ComponentSchema } from '../types/component-schema'
import {
  normalizeBarCodeProps,
  normalizeImageProps,
  normalizeQRCodeProps,
} from '../types/component-content'
import type {
  BindingExpression,
  ComponentBinding,
  DataDiagnostic,
  DataFormatter,
  FieldBindingExpression,
  TemplateDataDefinition,
  RenderContext,
} from '../types/data-source'
import { normalizeSimpleTableProps, updateTableCellText } from '../types/table-content'
import { getComponentBindingTargets } from '../registry/component-registry'
import { evaluateBinding, type BindingEvaluationResult } from './evaluator'
import { flattenDataFields } from './inference'
import { parseLegacyBindingExpression } from './normalization'

export interface ComponentBindingResolution {
  readonly status: 'ready' | 'missing' | 'invalid'
  readonly component: ComponentSchema
  readonly diagnostics: readonly DataDiagnostic[]
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function evaluateRichTextBinding(
  expression: BindingExpression,
  data: TemplateDataDefinition,
  context: RenderContext,
): BindingEvaluationResult {
  if (expression.kind === 'field') {
    const result = evaluateBinding(expression, data.fields, context)
    return { ...result, value: escapeHtml(result.value) }
  }
  const values: string[] = []
  const diagnostics: DataDiagnostic[] = []
  let status: BindingEvaluationResult['status'] = 'ready'
  for (const segment of expression.segments) {
    if (segment.kind === 'literal') {
      values.push(segment.value)
      continue
    }
    const result = evaluateBinding(segment, data.fields, context)
    values.push(escapeHtml(result.value))
    diagnostics.push(...result.diagnostics)
    if (result.status === 'invalid') status = 'invalid'
    else if (result.status === 'missing' && status === 'ready') status = 'missing'
  }
  return { status, value: values.join(''), diagnostics }
}

function targetKey(binding: ComponentBinding): string {
  return binding.target.kind === 'table-cell-text'
    ? `${binding.target.kind}:${binding.target.cellId}`
    : binding.target.kind
}

function targetDiagnostic(component: ComponentSchema, binding: ComponentBinding): DataDiagnostic {
  return {
    code: 'invalid-binding-target',
    severity: 'error',
    message: `组件 ${component.component} 不支持绑定目标“${binding.target.kind}”。`,
    bindingId: binding.id,
  }
}

function hasLegacyToken(value: string): boolean {
  return /\[::[^\[\]:]*::]/.test(value)
}

function legacyBindingsForComponent(
  component: ComponentSchema,
  data: TemplateDataDefinition,
): readonly ComponentBinding[] {
  if (component.component === 'RoySimpleText' && typeof component.propValue === 'string') {
    return hasLegacyToken(component.propValue)
      ? [
          {
            id: `legacy:${component.id}:text`,
            target: { kind: 'text' },
            expression: parseLegacyBindingExpression(component.propValue, data.fields),
          },
        ]
      : []
  }
  if (component.component === 'RoyText' && typeof component.propValue === 'string') {
    return hasLegacyToken(component.propValue)
      ? [
          {
            id: `legacy:${component.id}:rich-text`,
            target: { kind: 'rich-text' },
            expression: parseLegacyBindingExpression(component.propValue, data.fields),
          },
        ]
      : []
  }
  if (component.component === 'RoyImage') {
    const source = normalizeImageProps(component.propValue).src
    return hasLegacyToken(source)
      ? [
          {
            id: `legacy:${component.id}:image-source`,
            target: { kind: 'image-source' },
            expression: parseLegacyBindingExpression(source, data.fields),
          },
        ]
      : []
  }
  if (component.component === 'RoyQRCode' || component.component === 'RoyBarCode') {
    const text =
      component.component === 'RoyQRCode'
        ? normalizeQRCodeProps(component.propValue).text
        : normalizeBarCodeProps(component.propValue).text
    return hasLegacyToken(text)
      ? [
          {
            id: `legacy:${component.id}:code-content`,
            target: { kind: 'code-content' },
            expression: parseLegacyBindingExpression(text, data.fields),
          },
        ]
      : []
  }
  if (component.component === 'RoySimpleTable') {
    const table = normalizeSimpleTableProps(component.propValue)
    return Object.values(table.cells)
      .filter((cell) => hasLegacyToken(cell.text))
      .map((cell) => ({
        id: `legacy:${component.id}:cell:${cell.id}`,
        target: { kind: 'table-cell-text' as const, cellId: cell.id },
        expression: parseLegacyBindingExpression(cell.text, data.fields),
      }))
  }
  return []
}

function fieldExpressions(expression: BindingExpression): readonly FieldBindingExpression[] {
  return expression.kind === 'field'
    ? [expression]
    : expression.segments.filter(
        (segment): segment is FieldBindingExpression => segment.kind === 'field',
      )
}

function formatterAllowsStructuredText(formatter: DataFormatter | undefined): boolean {
  return formatter?.kind === 'json'
}

function bindingTypeDiagnostic(
  component: ComponentSchema,
  binding: ComponentBinding,
  data: TemplateDataDefinition,
): DataDiagnostic | null {
  const target = getComponentBindingTargets(component.component).find(
    (candidate) => candidate.kind === binding.target.kind,
  )
  if (!target) return targetDiagnostic(component, binding)
  const fields = flattenDataFields(data.fields)
  for (const expression of fieldExpressions(binding.expression)) {
    const field = fields.find((candidate) => candidate.id === expression.fieldId)
    if (!field) continue
    const formatter = expression.formatter ?? field.formatter
    const structuredText =
      (binding.target.kind === 'text' ||
        binding.target.kind === 'rich-text' ||
        binding.target.kind === 'table-cell-text') &&
      formatterAllowsStructuredText(formatter)
    if (!target.acceptedTypes.includes(field.valueType) && !structuredText) {
      return {
        code: 'type-mismatch',
        severity: 'error',
        message: `字段“${field.name}”的 ${field.valueType} 类型不能绑定到“${target.label}”。`,
        fieldId: field.id,
        bindingId: binding.id,
      }
    }
  }
  return null
}

function applyBinding(
  component: ComponentSchema,
  binding: ComponentBinding,
  value: string,
): { component: ComponentSchema; diagnostic?: DataDiagnostic } {
  switch (binding.target.kind) {
    case 'text':
    case 'rich-text':
      return { component: { ...component, propValue: value } }
    case 'image-source': {
      const props = normalizeImageProps(component.propValue)
      return { component: { ...component, propValue: { ...props, src: value } } }
    }
    case 'code-content':
      if (component.component === 'RoyQRCode') {
        const props = normalizeQRCodeProps(component.propValue)
        return { component: { ...component, propValue: { ...props, text: value } } }
      }
      if (component.component === 'RoyBarCode') {
        const props = normalizeBarCodeProps(component.propValue)
        return { component: { ...component, propValue: { ...props, text: value } } }
      }
      return { component, diagnostic: targetDiagnostic(component, binding) }
    case 'table-cell-text': {
      const props = normalizeSimpleTableProps(component.propValue)
      if (!props.cells[binding.target.cellId]) {
        return {
          component,
          diagnostic: {
            code: 'invalid-binding-target',
            severity: 'error',
            message: `自由表格中不存在单元格“${binding.target.cellId}”。`,
            bindingId: binding.id,
          },
        }
      }
      return {
        component: {
          ...component,
          propValue: updateTableCellText(props, binding.target.cellId, value),
        },
      }
    }
  }
}

/** Resolves a read-only component view; input Schema and TemplateDataDefinition remain untouched. */
export function resolveComponentBindings(
  component: ComponentSchema,
  data: TemplateDataDefinition,
  context: RenderContext,
): ComponentBindingResolution {
  const bindings =
    component.bindings && component.bindings.length > 0
      ? component.bindings
      : legacyBindingsForComponent(component, data)
  if (bindings.length === 0) {
    return { status: 'ready', component, diagnostics: [] }
  }
  const supported = new Set(
    getComponentBindingTargets(component.component).map((target) => target.kind),
  )
  const seen = new Set<string>()
  const diagnostics: DataDiagnostic[] = []
  let resolved = component
  let status: ComponentBindingResolution['status'] = 'ready'

  for (const binding of bindings) {
    const key = targetKey(binding)
    if (!supported.has(binding.target.kind) || seen.has(key)) {
      diagnostics.push(targetDiagnostic(component, binding))
      status = 'invalid'
      continue
    }
    seen.add(key)
    const typeDiagnostic = bindingTypeDiagnostic(component, binding, data)
    if (typeDiagnostic) {
      diagnostics.push(typeDiagnostic)
      status = 'invalid'
      continue
    }
    const evaluation =
      binding.target.kind === 'rich-text'
        ? evaluateRichTextBinding(binding.expression, data, context)
        : evaluateBinding(binding.expression, data.fields, context)
    diagnostics.push(
      ...evaluation.diagnostics.map((diagnostic) => ({
        ...diagnostic,
        bindingId: binding.id,
      })),
    )
    if (evaluation.status === 'invalid') status = 'invalid'
    else if (evaluation.status === 'missing' && status === 'ready') status = 'missing'
    const applied = applyBinding(resolved, binding, evaluation.value)
    resolved = applied.component
    if (applied.diagnostic) {
      diagnostics.push(applied.diagnostic)
      status = 'invalid'
    }
  }

  return { status, component: resolved, diagnostics }
}
