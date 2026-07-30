# `@ptd/core`

Print Template Designer 的框架无关核心包。它只包含 TypeScript 数据模型与纯逻辑，不依赖 React、NestJS 或浏览器 UI。

> v2 package 当前只在本仓库 workspace 中使用，尚未发布到 npm。

## 职责

- `TemplateSchema`、`TemplatePage`、`PageConfig` 和组件 Schema 类型。
- 页面尺寸、缩放常量与毫米/像素换算。
- 模板 JSON 序列化与反序列化。
- 数据绑定解析与基础类型转换。
- 组件定义注册表和组件目录元数据。
- 图片、二维码与条形码的公开内容类型、默认值、运行时守卫、规范化和纯校验。
- 自由表格的规范网格模型、Legacy 输入归一化、单元格样式与不可变结构命令。

## 公共 API

所有公共符号只从 `src/index.ts` 导出：

| 分组               | 导出                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| Schema             | `TemplateSchema`、`TemplatePage`、`PageConfig`、`ComponentSchema`、`ComponentStyle`、数据源与目录类型 |
| Defaults/constants | `DEFAULT_PAGE_CONFIG`、`PAGE_SIZES`、`COMMON_SCALE`、`AUTO_PAGE_COMPONENTS`                           |
| Units              | `mmToPx`、`pxToMm`、`getPageDimensions`、`getPageSizeDimensions`                                      |
| Data binding       | `DataBindingEngine`、`convertByType`                                                                  |
| Registry           | `ComponentRegistry`、`defaultRegistry` 及组件定义类型                                                 |
| Component content  | `ImageProps`、`QRCodeProps`、`BarCodeProps`，对应默认值、守卫、规范化与校验函数                       |
| Free table         | `SimpleTableProps`、`TableCellStyle`、2×2 默认值、增删行列、合并拆分、尺寸与样式纯函数命令            |
| Serialization      | `serialize`、`deserialize`                                                                            |

示例：

```ts
import { deserialize, getPageDimensions, mmToPx, serialize, type TemplateSchema } from '@ptd/core'

const json = serialize(template)
const restored: TemplateSchema = deserialize(json)
const page = getPageDimensions(restored.pageConfig)
const tenMillimeters = mmToPx(10)
```

`serialize` / `deserialize` 是模板跨应用、Server 与存储层传递时的规范化入口，不应由各 Host 自行维护另一套 Schema 转换。

自由表格使用 `grid` 中重复的 Cell ID 表达矩形合并区域，`cells` 保存唯一内容与样式；因此每个可见或
被合并覆盖的坐标都可寻址。`normalizeSimpleTableProps` 兼容旧 `tableConfig` / `tableData` 输入，并把
旧单元格 HTML 转成纯文本。结构命令不读取 DOM、不修改输入对象，调用方可把每次命令作为一个原子
历史节点。

## 页面语义

`TemplateSchema.pages` 只保存用户手工创建和管理的设计页面。未来由表格数据流产生的自动分页属于预览/打印/导出派生结果，不应写回 `pages`，也不参与普通编辑历史。

## 开发

```bash
corepack pnpm --filter @ptd/core typecheck
corepack pnpm --filter @ptd/core test
corepack pnpm --filter @ptd/core build
```

新增公共能力时必须：

- 保持框架无关和运行环境无关。
- 在 `src/index.ts` 显式导出。
- 为纯逻辑补充 `src/__tests__/` 下的 Vitest 测试。
- 避免把编辑器状态、DOM 渲染或网络持久化放入 Core。
