# `@ptd/components`

框架无关的画布渲染组件包。组件使用原生 DOM 创建节点，通过 CSS Custom Properties 应用 `ComponentSchema.style`，并复用 `@ptd/core` 的模型与数据绑定能力。

它不依赖 React，但以 `@preact/signals-core` 作为 peer dependency。v2 package 当前尚未发布到 npm。

## 公开渲染器

| 类别 | 导出                                                     |
| ---- | -------------------------------------------------------- |
| 文本 | `RoySimpleText`、`RoyText`                               |
| 表格 | `RoySimpleTable`；`RoyComplexTable` 仅用于旧模板只读兼容 |
| 图像 | `RoyImage`                                               |
| 编码 | `RoyQRCode`、`RoyBarCode`                                |
| 图形 | `RoyLine`、`RoyRect`、`RoyCircle`、`RoyStar`             |
| 结构 | `RoyGroup`                                               |

`RoyGroup` 用于组合结构与内部渲染，不应作为普通组件目录 Tile 向用户宣传。

包还导出：

- `BaseComponent` 生命周期基类。
- `applyCssVars` 与 `injectStylesheet`。
- Legacy 简单表格输入类型；规范自由表格内容类型与命令由 `@ptd/core` 导出。

## 生命周期

所有渲染器遵循相同的最小生命周期：

```ts
import { RoySimpleText } from '@ptd/components'

const component = new RoySimpleText(schema)
component.mount(canvasElement)
component.update(nextSchema)
component.destroy()
```

- 构造时创建容器、注入基础样式并完成第一次 render。
- `mount(parent)` 把容器挂到 Host DOM。
- `update(schema)` 重新应用样式并渲染内容。
- `destroy()` 移除 DOM；Host 必须在卸载时调用。

组件只负责把 Schema 渲染成 DOM，不拥有选区、拖拽、历史、工具栏或页面管理；这些属于 `@ptd/react-designer`。

图片 Renderer 兼容旧字符串 URL 与结构化图片内容，并显示未设置、载入中和载入失败状态。二维码和
条形码 Renderer 使用 `@ptd/core` 的统一规范化/校验，在动态渲染模块尚未完成、内容非法或模块失败时
显示明确状态；异步结果通过实例 render token 防止旧 Promise 覆盖新内容。

`RoySimpleTable` 按 Core 的规范网格确定性渲染行列、合并区域、纯文本和单元格样式；读取旧表格时
先完成安全归一化，不执行旧单元格 HTML。`RoyComplexTable` 仍可显示已有静态 header/body/footer
Schema，但在数据流、分区编辑和自动分页合同完成前不属于可创作目录项。

## 数据与安全

普通文本与表格单元格只按文本渲染；富文本在保存边界和 Renderer 入口使用相同白名单清洗。Host
仍应在远程数据进入模板前完成业务层授权与长度限制，但不能依赖浏览器执行任意 Schema HTML。

## 开发

```bash
corepack pnpm --filter @ptd/core build
corepack pnpm --filter @ptd/components typecheck
corepack pnpm --filter @ptd/components test
corepack pnpm --filter @ptd/components build
```

DOM 测试使用 Vitest + jsdom。新增渲染器时，应先在 `@ptd/core` 注册类型/目录元数据，再在本包实现渲染，最后由 Designer 决定其创建方式和 Inspector 控件。
