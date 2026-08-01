# `@ptd/core`

Foliq 的框架无关核心包。它只包含 TypeScript 数据模型与纯逻辑，不依赖 React、NestJS 或浏览器 UI。

> v2 package 当前只在本仓库 workspace 中使用，尚未发布到 npm。

## 职责

- `TemplateSchema`、`TemplatePage`、`PageConfig` 和组件 Schema 类型。
- 页面尺寸、缩放常量与毫米/像素换算。
- 模板 JSON 序列化与反序列化。
- Datasource v2 的 JSON 边界验证、字段推断、安全路径、格式化、结构化绑定与确定性校样求值。
- 组件定义注册表和组件目录元数据。
- 可直接用于创建的 canonical 默认样式；基础图形默认使用可见的蓝石墨描边或填充。
- 图片、二维码与条形码的公开内容类型、默认值、运行时守卫、规范化和纯校验。
- 自由表格的规范网格模型、Legacy 输入归一化、单元格样式与不可变结构命令。

## 公共 API

所有公共符号只从 `src/index.ts` 导出：

| 分组               | 导出                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| Schema             | `TemplateSchema`、`TemplatePage`、`PageConfig`、`ComponentSchema`、`ComponentStyle`、数据源与目录类型 |
| Defaults/constants | `DEFAULT_PAGE_CONFIG`、`PAGE_SIZES`、`COMMON_SCALE`、`AUTO_PAGE_COMPONENTS`                           |
| Units              | `MeasurementUnit`、集中式格式化/解析/步进/吸附、`mmToPx`、`pxToMm`、页面尺寸工具                      |
| Data contract      | `TemplateDataDefinition`、`DataFieldDefinition`、`DataFormatter`、`ComponentBinding`、`RenderContext` |
| Data input         | `DATA_SOURCE_LIMITS`、`parseRuntimeRecordsJson`、`validateRuntimeRecords`、`inferDataDefinition`      |
| Data evaluation    | 安全路径工具、`evaluateBinding`、`resolveComponentBindings`、结构化诊断以及 v1 兼容 normalizer        |
| Legacy binding     | `DataBindingEngine`、`convertByType`；只用于读取仍未经过保存边界的 v1 调用方                          |
| Registry           | `ComponentRegistry`、`defaultRegistry`、`getComponentBindingTargets` 及组件定义类型                   |
| Component content  | `ImageProps`、`QRCodeProps`、`BarCodeProps`，对应默认值、守卫、规范化与校验函数                       |
| Free table         | `SimpleTableProps`、`TableCellStyle`、2×2 默认值、增删行列、合并拆分、尺寸与样式纯函数命令            |
| Serialization      | `CURRENT_TEMPLATE_VERSION`、`serialize`、`deserialize`                                                |

示例：

```ts
import { deserialize, getPageDimensions, mmToPx, serialize, type TemplateSchema } from '@ptd/core'

const json = serialize(template)
const restored: TemplateSchema = deserialize(json)
const page = getPageDimensions(restored.pageConfig)
const tenMillimeters = mmToPx(10)
```

`serialize` / `deserialize` 是模板跨应用、Server 与存储层传递时的规范化入口，不应由各 Host 自行维护另一套 Schema 转换。
当前 canonical 模板版本为 2：`TemplateSchema.data` 是唯一可编辑数据定义，`dataSource` / `dataSet`
仅是 v0/v1 兼容输入。`deserialize` 会验证并保留旧字段，不会因为打开或预览模板而偷偷迁移；
`normalizeTemplateData` 提供不修改输入的 canonical 读取视图；只有显式 `serialize` 保存边界会写入
`data` 并移除旧字段。旧内容中的 `[::field::]` 也由 `resolveComponentBindings` 走相同求值和诊断路径，
因此保存成 v2 后仍能稳定校样，而不需要把 token 悄悄写回为另一种内容。

Datasource v2 只接受 JSON object 或 object array。解析、Host 数据与模板示例数据应复用
`DATA_SOURCE_LIMITS` 和 `validateRuntimeRecords`，避免不同层维护不同体积、记录数、深度、字段数和
字符串限制。`inferDataDefinition` 生成带稳定 ID 的嵌套字段树；路径是无代码执行能力的 segment 数组，
数组项使用 `{ kind: 'array-item' }`，不会与真实对象 key 冲突，并明确拒绝 `__proto__`、`prototype`
和 `constructor`。

`RenderContext` 必须显式提供 `data`、`locale`、`timeZone`、ISO `now` 与 mode。日期求值只消费这个
上下文，不读取系统时钟。Host 临时记录不进入 `TemplateSchema`；只有用户明确保存的受限记录才进入
`TemplateDataDefinition.sampleRecords`。`resolveComponentBindings` 返回派生的 ComponentSchema 和
结构化诊断，不修改模板、数据定义或记录，也不会自行访问网络。富文本字段值按文本编码，不能注入
运行时 HTML。

PTD 的几何真值使用既有 Canvas 坐标，固定为 `1 mm = 5 PTD Canvas px`。`formatMeasurement`、
`parseMeasurement`、`toDisplayMeasurement`、`fromDisplayMeasurement` 和 `getMeasurementStep`
负责编辑器边界上的 `mm / px` 显示切换；它们不表示浏览器 96dpi 或导出 DPI/PPI。

`PageConfig` 的上、右、下、左边距表示整个模板共用的内容安全区。`normalizePageConfig` 会为旧模板
补齐左右边距，`pageConfigError` 用于拒绝负尺寸、负边距和没有合法内容区的配置。

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
