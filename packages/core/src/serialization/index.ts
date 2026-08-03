import { canonicalizeTemplateData } from '../data-binding/normalization'
import { isTemplateSchema } from '../schema-validation'
import { normalizePageConfig } from '../types/page-config'
import type { TemplateSchema } from '../types/template-schema'

export const CURRENT_TEMPLATE_VERSION = 2
export const TEMPLATE_SCHEMA_JSON_LIMIT_BYTES = 4 * 1024 * 1024

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Serialization is an explicit save boundary: legacy v0/v1 data is written once as canonical v2.
 * The supplied template object is never mutated.
 */
export function serialize(template: TemplateSchema): string {
  const canonical = canonicalizeTemplateData(template)
  const output: TemplateSchema = {
    ...canonical,
    _version: CURRENT_TEMPLATE_VERSION,
    pageConfig: normalizePageConfig(template.pageConfig),
  }
  if (!isTemplateSchema(output)) throw new TypeError('TemplateSchema 无法序列化：运行时结构无效。')
  return JSON.stringify(output)
}

/**
 * Deserialization validates but deliberately preserves legacy dataSource/dataSet input.
 * Consumers use normalizeTemplateData for a read view; migration only happens on explicit save.
 */
export function deserialize(json: string): TemplateSchema {
  const parsed: unknown = JSON.parse(json)
  if (!record(parsed)) throw new TypeError('模板 JSON 根节点必须是对象。')
  const version = typeof parsed['_version'] === 'number' ? parsed['_version'] : 0
  if (!Number.isInteger(version) || version < 0 || version > CURRENT_TEMPLATE_VERSION) {
    throw new TypeError(`不支持的模板版本：${String(version)}。`)
  }
  const normalized: Record<string, unknown> = {
    ...parsed,
    _version: version,
    pageConfig: normalizePageConfig(parsed['pageConfig']),
  }
  if (!isTemplateSchema(normalized))
    throw new TypeError('模板 JSON 不符合 TemplateSchema 运行时合同。')
  return normalized
}
