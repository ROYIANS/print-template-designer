import type {
  ComponentCatalogGroup,
  ComponentCategory,
  ComponentCreationMode,
  ComponentMaturity,
  ComponentStyle,
  ComponentType,
  CreatableComponentType,
} from '../types/component-schema'
import {
  DEFAULT_BAR_CODE_PROPS,
  DEFAULT_IMAGE_PROPS,
  DEFAULT_QR_CODE_PROPS,
} from '../types/component-content'
import { DEFAULT_SIMPLE_TABLE_PROPS } from '../types/table-content'

export interface ComponentCatalogMetadata {
  id: string
  group: ComponentCatalogGroup
  description: string
  keywords: readonly string[]
  maturity: ComponentMaturity
  creationMode: ComponentCreationMode
}

interface ComponentDefinitionBase<TType extends ComponentType> {
  type: TType
  name: string
  icon: string
  category: ComponentCategory
  defaultStyle: Partial<ComponentStyle>
  defaultProps: unknown
}

export type CatalogComponentDefinition = ComponentDefinitionBase<CreatableComponentType> & {
  internal?: false
  catalog: ComponentCatalogMetadata
}

export type ComponentDefinition =
  | CatalogComponentDefinition
  | (ComponentDefinitionBase<'RoyGroup' | 'RoyComplexTable'> & {
      internal: true
      catalog?: never
    })

const BUILT_IN_COMPONENTS = [
  {
    type: 'RoySimpleText',
    name: '文本',
    icon: 'ri-text',
    category: 'common',
    catalog: {
      id: 'basic-text',
      group: 'text',
      description: '创建标题、标签与简短字段内容',
      keywords: ['标题', '标签', '字段', '文字', '短文本'],
      maturity: 'basic',
      creationMode: 'draw',
    },
    defaultStyle: { width: 200, height: 50, fontSize: 10, rotate: 0, opacity: 1 },
    defaultProps: '',
  },
  {
    type: 'RoyText',
    name: '富文本',
    icon: 'ri-t-box-line',
    category: 'common',
    catalog: {
      id: 'rich-text',
      group: 'text',
      description: '创建多段落、可排版的富文本内容',
      keywords: ['段落', '长文本', 'HTML', '排版', '说明'],
      maturity: 'complex',
      creationMode: 'draw',
    },
    defaultStyle: { width: 500, height: 200, fontSize: 12, rotate: 0, opacity: 1 },
    defaultProps: '<p></p>',
  },
  {
    type: 'RoySimpleTable',
    name: '自由表格',
    icon: 'ri-table-2',
    category: 'data',
    catalog: {
      id: 'free-table',
      group: 'table',
      description: '创建可合并单元格的固定网格表格',
      keywords: ['网格', '单元格', '合并', '固定表格', '清单'],
      maturity: 'complex',
      creationMode: 'draw',
    },
    defaultStyle: { width: 500, height: 200, rotate: 0, opacity: 1 },
    defaultProps: DEFAULT_SIMPLE_TABLE_PROPS,
  },
  {
    type: 'RoyComplexTable',
    name: '结构表格',
    icon: 'ri-table-line',
    category: 'data',
    internal: true,
    defaultStyle: { width: 500, height: 200, rotate: 0, opacity: 1 },
    defaultProps: null,
  },
  {
    type: 'RoyImage',
    name: '图片',
    icon: 'ri-image-line',
    category: 'common',
    catalog: {
      id: 'bitmap-image',
      group: 'image',
      description: '放置 Logo、印章、照片与位图素材',
      keywords: ['Logo', '印章', '照片', '位图', '品牌'],
      maturity: 'basic',
      creationMode: 'draw',
    },
    defaultStyle: { width: 200, height: 150, rotate: 0, opacity: 1 },
    defaultProps: DEFAULT_IMAGE_PROPS,
  },
  {
    type: 'RoyQRCode',
    name: '二维码',
    icon: 'ri-qr-code-line',
    category: 'common',
    catalog: {
      id: 'qr-code',
      group: 'code',
      description: '将网址、文本或业务标识生成二维码',
      keywords: ['网址', '链接', '扫码', '业务标识', 'QR'],
      maturity: 'basic',
      creationMode: 'draw',
    },
    defaultStyle: { width: 100, height: 100, rotate: 0, opacity: 1 },
    defaultProps: DEFAULT_QR_CODE_PROPS,
  },
  {
    type: 'RoyBarCode',
    name: '条形码',
    icon: 'ri-barcode-line',
    category: 'common',
    catalog: {
      id: 'bar-code',
      group: 'code',
      description: '将单号、商品码与业务编号生成条形码',
      keywords: ['单号', '商品码', '编号', '一维码', 'barcode'],
      maturity: 'basic',
      creationMode: 'draw',
    },
    defaultStyle: { width: 200, height: 80, rotate: 0, opacity: 1 },
    defaultProps: DEFAULT_BAR_CODE_PROPS,
  },
  {
    type: 'RoyLine',
    name: '直线',
    icon: 'ri-separator',
    category: 'shape',
    catalog: {
      id: 'line',
      group: 'shape',
      description: '绘制分隔线、连接线与版面辅助线',
      keywords: ['线段', '分隔', '连接', '横线', '竖线'],
      maturity: 'basic',
      creationMode: 'draw',
    },
    defaultStyle: { width: 200, height: 2, rotate: 0, opacity: 1, background: '#647184' },
    defaultProps: null,
  },
  {
    type: 'RoyRect',
    name: '矩形',
    icon: 'ri-rectangle-line',
    category: 'shape',
    catalog: {
      id: 'rectangle',
      group: 'shape',
      description: '绘制边框、色块与矩形底形',
      keywords: ['方形', '边框', '色块', '背景', '底形'],
      maturity: 'basic',
      creationMode: 'draw',
    },
    defaultStyle: {
      width: 200,
      height: 100,
      rotate: 0,
      opacity: 1,
      background: 'transparent',
      borderWidth: 1,
      borderType: 'solid',
      borderColor: '#647184',
      borderRadius: '0',
    },
    defaultProps: null,
  },
  {
    type: 'RoyCircle',
    name: '椭圆',
    icon: 'ri-circle-line',
    category: 'shape',
    catalog: {
      id: 'ellipse',
      group: 'shape',
      description: '绘制圆形、椭圆与印章底形',
      keywords: ['圆形', '椭圆形', '印章', '圆环', '底形'],
      maturity: 'basic',
      creationMode: 'draw',
    },
    defaultStyle: {
      width: 100,
      height: 100,
      rotate: 0,
      opacity: 1,
      background: 'transparent',
      borderWidth: 1,
      borderType: 'solid',
      borderColor: '#647184',
    },
    defaultProps: null,
  },
  {
    type: 'RoyStar',
    name: '星形',
    icon: 'ri-star-line',
    category: 'shape',
    catalog: {
      id: 'star',
      group: 'shape',
      description: '绘制用于强调、评级与标记的星形',
      keywords: ['强调', '评级', '标记', '装饰', '五角星'],
      maturity: 'basic',
      creationMode: 'draw',
    },
    defaultStyle: { width: 100, height: 100, rotate: 0, opacity: 1, background: '#647184' },
    defaultProps: null,
  },
  {
    type: 'RoyGroup',
    name: '组合',
    icon: 'ri-group-line',
    category: 'common',
    internal: true,
    defaultStyle: { width: 200, height: 200, rotate: 0, opacity: 1 },
    defaultProps: [],
  },
] satisfies readonly ComponentDefinition[]

export class ComponentRegistry {
  private readonly registry = new Map<ComponentType, ComponentDefinition>()

  constructor(definitions: readonly ComponentDefinition[] = BUILT_IN_COMPONENTS) {
    for (const definition of definitions) this.registry.set(definition.type, definition)
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
    return this.getAll().filter((definition) => definition.category === category)
  }

  getCatalogDefinitions(): CatalogComponentDefinition[] {
    return this.getAll().filter(
      (definition): definition is CatalogComponentDefinition => !definition.internal,
    )
  }
}

export const defaultRegistry = new ComponentRegistry()
