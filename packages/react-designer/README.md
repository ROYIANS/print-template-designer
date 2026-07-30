# `@ptd/react-designer`

Print Template Designer 的 React 专业编辑器。它把 `@ptd/core` 的模板模型和 `@ptd/components` 的 DOM 渲染器组合成可嵌入的 Canvas-first 工作区。

> v2 package 当前只在本仓库 workspace 中使用，尚未发布到 npm。

## 使用

```tsx
import { useState } from 'react'
import { Designer, type TemplateSchema } from '@ptd/react-designer'
import '@ptd/react-designer/styles.css'

export function Editor({ initialValue }: { initialValue: TemplateSchema }) {
  const [value, setValue] = useState(initialValue)

  return (
    <Designer
      value={value}
      onChange={setValue}
      onSave={(next) => saveTemplate(next)}
      onLoad={async () => loadTemplate()}
    />
  )
}
```

Host 需要为设计器提供一个具有明确高度的容器，并显式加载 `styles.css`。React、React DOM 和 `@preact/signals-react` 是 peer dependencies，使用方必须自行声明。

## `DesignerProps`

```ts
export interface DesignerProps {
  value: TemplateSchema
  onChange?: (value: TemplateSchema) => void
  onSave?: (value: TemplateSchema) => void
  onLoad?: () => TemplateSchema | Promise<TemplateSchema>
}
```

| 属性       | 约定                                                 |
| ---------- | ---------------------------------------------------- |
| `value`    | 必填。Host 持有的模板真值；外部替换时编辑器会同步。  |
| `onChange` | 每次被提交到编辑历史的模板变更后通知 Host。          |
| `onSave`   | App Bar 保存动作的集成点；编辑器本身不发 HTTP 请求。 |
| `onLoad`   | App Bar 载入动作的集成点，可同步或异步返回完整模板。 |

当前没有 `onExport` 或 `onDataSource`。导出与数据源集成仍属于后续任务。

## 已实现交互

- 选择、多选、框选、拖动、缩放和旋转。
- 锁定、组合、图层、复制、剪切和定位粘贴。
- Undo/Redo、右键菜单和键盘菜单。
- 标尺 hover 预览、点击固定、彩色参考线和距离 badge。
- 默认毫米、可切换 PTD Canvas px 的实例级显示单位；Inspector、标尺、参考线与状态读数同步切换。
- Typed Inspector、mixed value 和数值 label scrub。
- Page、Single 与 Table 业务面板统一组合 `InspectorControls`，原生 input/select/textarea/color 仅作为
  控件内部实现细节；数值、度量、文本、长文本、小枚举、长枚举、文件和颜色使用各自适合的交互。
- 颜色控件支持三位/六位 HEX 精确输入、透明色、恢复默认、实例级最近颜色和模板派生文档颜色；
  色板临时状态与最近颜色不会写入模板或历史。
- 越界或不完整数值草稿保持在控件本地并显示可访问错误，不会静默夹紧或写入 Schema；Escape
  恢复本次编辑的精确起点。
- 模板级页面标题、纸张预设/自定义尺寸、方向、四边内容安全区、纸张颜色和默认排版设置。
- 页面缩小后保留组件几何，并以派生警告与画布标记提示越界对象。
- 多页面新增、复制、删除与排序。
- 文本、富文本、图片、编码、自由表格和基础图形的工具式拖框创建。
- 普通文本与富文本画布内编辑；图片、二维码和条形码专用内容 Inspector。
- 富文本 Inspector 不暴露 HTML 源码输入框；选区级内容与格式在画布内工具栏维护，Inspector 只处理
  组件框级默认样式。
- 自由表格单元格拖选、双击纯文本编辑、键盘导航、行列增删与尺寸拖动、合并拆分和单元格排版。
- Hand Tool 与按住 Space 的临时抓手。
- 位置稳定的高频 Tool Dock、文本/图形工具组，以及带搜索、最近使用和键盘导航的完整组件 Picker。
- 页面、图层、数据与素材资源面板；素材面板当前提供真实图片框入口，资产持久化留待后续阶段。
- wide / standard / compact 响应式工作区。

组件目录按文本、表格、图像、编码、图形分组。画布中的“更多组件”Picker 只展示 `available`，
不会把 `planned` 能力伪装成禁用工具；规划项仍保留在 Catalog 元数据和产品文档中。
`RoyComplexTable` 只保留旧模板 Renderer，目录中作为规划能力展示；完整结构表格要等待数据绑定、
重复明细和派生分页合同，不冒充已经可创作的报表引擎。

## 状态与集成边界

Designer 内部持有交互状态和命令历史，但模板持久化的所有权在 Host：

```text
Host value ──► Designer store ──► 用户命令
    ▲                              │
    └──────── onChange ────────────┘

onSave / onLoad ──► Host integration
```

- Host 负责 API、保存状态、错误提示、冲突处理和身份信息。
- Designer 不应直接 import `apps/web` 或 `apps/server`。
- 外部 `value` 同步必须避免把纯 Host 回显制造成新的用户历史。
- `TemplateSchema.pages` 是持久化的手工页面；自动溢出页是未来导出层的派生数据。

详细命令、历史和同步约束见 [React Designer Contract](../../.trellis/spec/monorepo/react-designer-contract.md)，视觉与交互契约见 [PTD UI System](../../.trellis/spec/monorepo/ptd-ui-system.md)。

## 开发与验证

```bash
corepack pnpm --filter @ptd/core build
corepack pnpm --filter @ptd/components build
corepack pnpm --filter @ptd/react-designer typecheck
corepack pnpm --filter @ptd/react-designer test
corepack pnpm --filter @ptd/react-designer build
```

样式使用 CSS Modules，并由 tsup 提取为公开的 `./styles.css` subpath。不要改成运行时注入，也不要从 package 内部路径导入未公开模块。
