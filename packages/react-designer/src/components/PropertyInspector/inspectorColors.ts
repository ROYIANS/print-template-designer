import {
  normalizeBarCodeProps,
  normalizeQRCodeProps,
  normalizeSimpleTableProps,
  type ComponentSchema,
  type TemplateSchema,
} from '@ptd/core'
import { normalizeHexColor } from './propertyValue'

const STYLE_COLOR_KEYS = ['color', 'background', 'borderColor'] as const

export function deriveDocumentColors(template: TemplateSchema, limit = 24): string[] {
  const usage = new Map<string, { count: number; order: number }>()
  let order = 0
  const add = (value: unknown) => {
    const color = normalizeHexColor(value)
    if (!color) return
    const current = usage.get(color)
    if (current) {
      current.count += 1
      return
    }
    usage.set(color, { count: 1, order })
    order += 1
  }

  add(template.pageConfig.background)
  add(template.pageConfig.color)
  for (const page of template.pages) {
    for (const component of page.componentData) collectComponentColors(component, add)
  }

  return [...usage.entries()]
    .sort((left, right) => right[1].count - left[1].count || left[1].order - right[1].order)
    .slice(0, limit)
    .map(([color]) => color)
}

function collectComponentColors(component: ComponentSchema, add: (value: unknown) => void): void {
  for (const key of STYLE_COLOR_KEYS) add(component.style[key])

  if (component.component === 'RoyQRCode') {
    const value = normalizeQRCodeProps(component.propValue)
    add(value.colorDark)
    add(value.colorLight)
  } else if (component.component === 'RoyBarCode') {
    add(normalizeBarCodeProps(component.propValue).colorDark)
  } else if (component.component === 'RoySimpleTable') {
    const value = normalizeSimpleTableProps(component.propValue)
    for (const cell of Object.values(value.cells)) {
      add(cell.style.color)
      add(cell.style.background)
      add(cell.style.borderColor)
    }
  } else if (component.component === 'RoyGroup' && Array.isArray(component.propValue)) {
    for (const child of component.propValue) {
      if (isComponentSchema(child)) collectComponentColors(child, add)
    }
  }
}

function isComponentSchema(value: unknown): value is ComponentSchema {
  if (!value || typeof value !== 'object') return false
  const source = value as Partial<ComponentSchema>
  return typeof source.id === 'string' && typeof source.component === 'string' && !!source.style
}
