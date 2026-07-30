import { normalizePageConfig } from '../types/page-config'
import type { TemplateSchema } from '../types/template-schema'

const CURRENT_VERSION = 1

// Version migration hook — add cases as schema evolves
function migrate(version: number, data: Record<string, unknown>): TemplateSchema {
  // Future: add migration logic per version increment
  void version
  return data as unknown as TemplateSchema
}

export function serialize(template: TemplateSchema): string {
  return JSON.stringify({
    ...template,
    _version: CURRENT_VERSION,
    pageConfig: normalizePageConfig(template.pageConfig),
  })
}

export function deserialize(json: string): TemplateSchema {
  const raw = JSON.parse(json) as Record<string, unknown>
  const version = typeof raw['_version'] === 'number' ? raw['_version'] : 0
  const normalized = { ...raw, pageConfig: normalizePageConfig(raw['pageConfig']) }
  if (version === CURRENT_VERSION) {
    return normalized as unknown as TemplateSchema
  }
  return migrate(version, normalized)
}
