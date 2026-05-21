import type { ComponentType, ComponentCategory, ComponentStyle } from '../types/component-schema'

export interface ComponentDefinition {
  type: ComponentType
  name: string
  icon: string
  category: ComponentCategory
  defaultStyle: Partial<ComponentStyle>
  defaultProps: unknown
}

const BUILT_IN_COMPONENTS: ComponentDefinition[] = [
  {
    type: 'RoySimpleText',
    name: '文本',
    icon: 'ri-text',
    category: 'common',
    defaultStyle: { width: 200, height: 50, fontSize: 10, rotate: 0, opacity: 1 },
    defaultProps: '单击编辑文本',
  },
  {
    type: 'RoyText',
    name: '长文本',
    icon: 'ri-t-box-line',
    category: 'common',
    defaultStyle: { width: 500, height: 200, fontSize: 12, rotate: 0, opacity: 1 },
    defaultProps: '<p>双击编辑文本</p>',
  },
  {
    type: 'RoySimpleTable',
    name: '表格',
    icon: 'ri-table-2',
    category: 'data',
    defaultStyle: { width: 500, height: 200, rotate: 0, opacity: 1 },
    defaultProps: null,
  },
  {
    type: 'RoyComplexTable',
    name: '复杂表格',
    icon: 'ri-table-line',
    category: 'data',
    defaultStyle: { width: 500, height: 200, rotate: 0, opacity: 1 },
    defaultProps: null,
  },
  {
    type: 'RoyLine',
    name: '线段',
    icon: 'ri-separator',
    category: 'shape',
    defaultStyle: { width: 200, height: 2, rotate: 0, opacity: 1 },
    defaultProps: null,
  },
  {
    type: 'RoyRect',
    name: '矩形',
    icon: 'ri-rectangle-line',
    category: 'shape',
    defaultStyle: { width: 200, height: 100, rotate: 0, opacity: 1 },
    defaultProps: null,
  },
  {
    type: 'RoyCircle',
    name: '圆形',
    icon: 'ri-circle-line',
    category: 'shape',
    defaultStyle: { width: 100, height: 100, rotate: 0, opacity: 1 },
    defaultProps: null,
  },
  {
    type: 'RoyStar',
    name: '星形',
    icon: 'ri-star-line',
    category: 'shape',
    defaultStyle: { width: 100, height: 100, rotate: 0, opacity: 1 },
    defaultProps: null,
  },
  {
    type: 'RoyImage',
    name: '图片',
    icon: 'ri-image-line',
    category: 'common',
    defaultStyle: { width: 200, height: 150, rotate: 0, opacity: 1 },
    defaultProps: null,
  },
  {
    type: 'RoyQRCode',
    name: '二维码',
    icon: 'ri-qr-code-line',
    category: 'common',
    defaultStyle: { width: 100, height: 100, rotate: 0, opacity: 1 },
    defaultProps: null,
  },
  {
    type: 'RoyBarCode',
    name: '条形码',
    icon: 'ri-barcode-line',
    category: 'common',
    defaultStyle: { width: 200, height: 80, rotate: 0, opacity: 1 },
    defaultProps: null,
  },
  {
    type: 'RoyGroup',
    name: '组合',
    icon: 'ri-group-line',
    category: 'common',
    defaultStyle: { width: 200, height: 200, rotate: 0, opacity: 1 },
    defaultProps: [],
  },
]

export class ComponentRegistry {
  private readonly registry = new Map<ComponentType, ComponentDefinition>()

  constructor(definitions: ComponentDefinition[] = BUILT_IN_COMPONENTS) {
    for (const def of definitions) {
      this.registry.set(def.type, def)
    }
  }

  get(type: ComponentType): ComponentDefinition | undefined {
    return this.registry.get(type)
  }

  has(type: ComponentType): boolean {
    return this.registry.has(type)
  }

  register(definition: ComponentDefinition): void {
    this.registry.set(definition.type, definition)
  }

  getAll(): ComponentDefinition[] {
    return Array.from(this.registry.values())
  }

  getByCategory(category: ComponentCategory): ComponentDefinition[] {
    return this.getAll().filter((def) => def.category === category)
  }
}

export const defaultRegistry = new ComponentRegistry()
