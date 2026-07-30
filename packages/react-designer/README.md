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

| 属性 | 约定 |
| --- | --- |
| `value` | 必填。Host 持有的模板真值；外部替换时编辑器会同步。 |
| `onChange` | 每次被提交到编辑历史的模板变更后通知 Host。 |
| `onSave` | App Bar 保存动作的集成点；编辑器本身不发 HTTP 请求。 |
| `onLoad` | App Bar 载入动作的集成点，可同步或异步返回完整模板。 |

当前没有 `onExport` 或 `onDataSource`。导出与数据源集成仍属于后续任务。

## 已实现交互

- 选择、多选、框选、拖动、缩放和旋转。
- 锁定、组合、图层、复制、剪切和定位粘贴。
- Undo/Redo、右键菜单和键盘菜单。
- 标尺 hover 预览、点击固定、彩色参考线和距离 badge。
- Typed Inspector、mixed value 和数值 label scrub。
- 多页面新增、复制、删除与排序。
- 文本、直线、矩形、椭圆、星形的拖拽绘制。
- Hand Tool 与按住 Space 的临时抓手。
- wide / standard / compact 响应式工作区。

组件目录按文本、表格、图像、编码、图形分组。目录元数据明确区分 `available` 与 `planned`；规划项可以展示产品方向，但不能实例化为伪组件。

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
