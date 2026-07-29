# @ptd/react-designer 设计器 React 包

## Goal

将打印模板设计器的核心编辑器功能从 Vue 2 迁移并封装为独立的 React 组件包 `@ptd/react-designer`，**功能对齐 legacy Vue2 版本**，供 `apps/web` 及未来其他宿主应用消费。

## What I already know

* `packages/react-designer/` 已存在，`package.json` 已配置（ESM + CJS 双出口，peer deps: react >=18, @preact/signals-react ^2）
* `packages/core/` 已实现：类型系统（`ComponentSchema`, `TemplateSchema`, `PageConfig`）、`ComponentRegistry`、`DataBindingEngine`、`serialize/deserialize`
* `packages/components/` 已实现：所有渲染组件（`BaseComponent` 抽象类 + 12 个具体组件），均为 **Vanilla JS class**，通过 `mount(parent)` 挂载到 DOM
* `apps/web/src/App.tsx` 目前只是 Hello World 占位
* 状态管理：`@preact/signals-react` 已作为 peer dep 声明，是项目选定的响应式方案
* 构建：`tsc` 直接编译（无 Vite/Rollup），输出 `dist/index.js` + `dist/index.cjs`
* **Legacy 功能清单**（来自 `legacy/src/`）：
  * 布局：顶部 header（标题 + 夜间模式）+ 左侧 sidebar（图标菜单 + 面板区）+ 中间画布 + 右侧属性面板
  * 左侧 sidebar 面板：组件、结构（TOC）、属性、数据源、全局设置（5 个标签页）
  * 顶部工具栏（ToolBar）：标尺开关、参考线颜色/显隐/锁定/清空、组件锁定/解锁、对齐/分布、组合/拆分、层级、复制/粘贴/删除、缩放比例
  * 画布（Editor）：真实毫米标尺与多色参考线、ComponentAdjuster（选中/移动/缩放/旋转）、Area 框选、EditorLine 辅助线、上下边距线、右键菜单
  * 属性面板（PagePalette）：按组件类型动态渲染表单（样式 + propValue），使用 vxe-table 表单（迁移后改为原生 React 表单）
  * 状态：Vuex 模块（global/snapshot/compose/copy/layer/lock/night-mode/ruler-things）→ 迁移为 signals
  * 撤销/重做：snapshot 模块，MAX_SNAP_SHOT_LENGTH=3

## Assumptions (temporary)

* `<Designer>` 是受控组件（controlled），宿主传入 `value: TemplateSchema` + `onChange` 回调，预留 `onSave`/`onLoad` 空接口供 `05-21-integration-hooks` 扩展
* 画布内组件渲染复用 `@ptd/components` 的 Vanilla JS class，通过 React ref + useEffect 桥接
* 标尺采用轻量 DOM Overlay，由 `PageConfig` 毫米尺寸、页面方向和画布缩放直接生成，避免为当前
  只读刻度需求引入一套带额外交互状态的第三方标尺库
* 组合/拆分、框选多组件等复杂交互：本任务实现核心逻辑，如工作量过大可拆出独立子任务

## Open Questions

（暂无阻塞性问题）

## Requirements (evolving)

**功能目标：对齐 legacy Vue2 版本所有功能**

* 导出 `<Designer value={TemplateSchema} onChange={fn} />` 受控组件
* **布局**：顶部 header + 左侧 sidebar（图标菜单 + 可折叠面板）+ 中间画布 + 右侧属性面板
* **左侧 Tool Dock / Resource Panel**：
  * Components：按 category 分组，支持拖拽与点击创建
  * Pages：展示真实页面状态并可切换；增删、复制与排序由 `05-21-multi-page-support` 完成
  * Layers：展示真实组件结构并可选择对象；结构编辑复用统一 Store 命令
  * Data：展示真实 `dataSource` 摘要；编辑、导入与预览由 `05-21-datasource-refactor` 完成
  * Assets：展示可创建资产入口，不维护重复的组件属性表单
* 页面/全局属性统一由无选择时的 Page Inspector 承担；组件属性统一由 Single/Multi Inspector
  承担，不再复制一套左侧属性或全局设置表单
* **顶部工具栏**：标尺开关、参考线颜色/显隐/锁定/清空、组件锁定/解锁、对齐/分布（8 种）、组合/拆分、层级（上移/下移/置顶/置底）、复制/粘贴/删除、撤销/重做、缩放比例
* **画布**：真实毫米标尺与多色参考线、ComponentAdjuster（选中/移动/8 点缩放/旋转）、Area 框选、辅助线（EditorLine）、上下边距线、右键菜单
* **属性面板**：抛弃 `vxe-table`/`vxe-form`，由 Page/Single/Multi Inspector 按语义使用紧凑
  步进器、数值拖动热区、segmented control、Select 与色板编辑，避免退化成大量原始输入框
* **UI 组件库**：全面采用 `@radix-ui` Primitives，自定义样式。具体用到：
  * `@radix-ui/react-context-menu` — 右键菜单
  * `@radix-ui/react-tooltip` — 工具栏按钮 tooltip
  * `@radix-ui/react-tabs` — 左侧 sidebar 面板切换
  * `@radix-ui/react-scroll-area` — 面板滚动区域
  * `@radix-ui/react-separator` — 分隔线
* **状态管理**：用 `@preact/signals-react` 替代 Vuex，对应模块：editor state / snapshot（撤销/重做）/ compose（组合）/ copy（复制粘贴）/ layer / lock
* 组件渲染桥接：通过 React ref + useEffect 调用 `@ptd/components` 的 class 实例

### PR4 UI direction（已确认）

* 遵循 `.trellis/spec/monorepo/ptd-ui-system.md`：参考 Zed 的冷纸白/蓝石墨中性与克制钴蓝交互，
  保留稀少校样朱红；钴蓝不得扩散为大面积通用后台蓝
* 完整工作区使用 App Bar + Command Bar + 左侧 Rail/Panel + Canvas + Inspector + Status Bar
* 保留 Legacy 的组件/结构/属性/数据源/全局设置五入口，不复制 Vue/Vuex/vxe 实现
* 高密度、低装饰、薄边框、2px 低圆角；禁止营销页卡片、大阴影、持续动画和文字缩写伪图标
* 图标统一使用 Remix Icon line SVG；所有图标按钮提供 `aria-label`、Tooltip 和 focus-visible 状态
* 左侧组件面板首个切片同时支持拖拽与点击创建，统一通过 Catalog/Factory 生成 Schema
* 左右面板复用同一 PanelRoot/Header/Body/Footer 结构，每个面板只有一个主滚动容器
* Portal 内容必须继承共享 PTD theme token，并遵守统一 overlay layer 合同
* Paper 与 Starter/Demo Schema 使用冷中性白；工程网格和斜线装配材质只能出现在
  Pasteboard/Chrome，不进入模板或导出内容；禁止重复工作区外框、菱形角点和无尺寸语义的伪标尺
* 顶部/左侧标尺使用真实毫米尺寸：5mm 次刻度、10mm 主刻度、20mm 标签、明确 `mm` 单位和
  页面实际终点；随页面方向与画布缩放更新，并可由既有标尺命令完整开关
* 标尺支持点击/拖拽创建参考线；参考线可选择、拖动、多色标记、显隐、锁定、清空、双击/Delete
  删除和键盘微调；参考线只属于编辑器 UI 会话，不污染模板 Schema、打印导出或模板撤销历史
* 单选组件显示与选中框一体的浮动快捷条，包含名称、拖动、锁定/解锁、复制、上移一层和删除；
  快捷条独立于组件旋转和画布缩放，并自动限制在 Canvas viewport 内

## Acceptance Criteria (evolving)

* [x] `<Designer>` 可在 `apps/web` 中渲染，不报 TypeScript 错误
* [ ] 拖拽组件到画布后，`onChange` 被调用，`TemplateSchema` 中新增对应 `ComponentSchema`
  （标准 HTML5 drag/drop 已接线；浏览器助手无法产生完整 `DataTransfer` 链路，保留人工浏览器验收）
* [x] 选中组件后，属性面板显示该组件的 style 属性，修改后画布实时更新
* [x] 撤销/重做功能正常工作
* [x] 对齐/分布、层级操作正常工作
* [x] 组合/拆分正常工作
* [x] 框选多组件正常工作
* [x] 右键菜单正常弹出并执行操作；支持空白/单选/多选/锁定上下文与鼠标位置粘贴
* [x] 真实毫米标尺正常显示并可开关；页面方向、50%/100%/150% 缩放与 A4 终点通过验收
* [x] 多色参考线可创建、拖动、选择、换色、显隐、锁定和删除，并始终限制在纸张物理边界内
* [x] 完整工作区在 1600×1000 与 1366×768 下具有清晰层级，画布保持主视觉
* [x] 左侧 Rail 五入口可键盘切换，组件面板不是空壳
* [x] 组件可通过拖拽或点击添加；两条路径均自动选中、产生一个历史节点并调用一次最终 `onChange`
* [x] 工具栏不再使用 Unicode/文字缩写伪图标，低频命令不会挤压画布视图控制
* [x] UI token、稳定 `data-ptd-region`、Portal 层级与 reduced-motion 合同通过检查
* [x] 单选 Quick Bar 在普通与旋转组件上保持水平，并在 Canvas viewport 内完成边界避让

## Definition of Done

* TypeScript 类型检查通过（`tsc --noEmit`）
* `apps/web` 能正常渲染设计器
* 核心交互（拖拽、选中、属性编辑）可用
* 无 console 错误

## Out of Scope

* 数据源绑定 UI（由 `05-21-datasource-refactor` 任务负责）
* 导出功能（由 `05-21-export-package` 任务负责）
* 多页管理 UI（由 `05-21-multi-page-support` 任务负责）
* 集成钩子（由 `05-21-integration-hooks` 任务负责）
* 服务端 API 集成

## Decision (ADR-lite)

**Context**: 需要将 legacy Vue2 设计器迁移为 React 包，涉及构建工具、UI 库、状态管理、属性面板等多项技术选型。

**Decisions**:
- 构建：tsup（与 `@ptd/core`/`@ptd/components` 保持一致）
- UI：`@radix-ui` Primitives 全面替换 legacy 自研 UI 组件，自定义样式
- 状态：`@preact/signals-react` 替代 Vuex（6 模块）
- 属性面板：原生 React 表单替换 `vxe-table`/`vxe-form`，通用样式编辑器
- 右键菜单：`@radix-ui/react-context-menu` 替换自研 `RoyContext`
- 标尺：使用由页面物理尺寸直接驱动的轻量 DOM Overlay；若后续需要拖拽辅助线或标尺原点，
  再基于实际交互需求评估专用库

**Consequences**: 零 Vue 依赖，完全 React 化；Radix UI 无样式，需自行实现所有视觉样式；signals 细粒度更新性能优于 Vuex。

## Implementation Plan

- [x] PR1：tsup 配置 + 目录骨架 + signals 状态层 + `<Designer>` 空壳
- [x] PR2：画布核心（ComponentAdjuster + 拖拽放置 + 选中/移动/缩放/旋转）
- [x] PR3：工具栏操作（对齐/分布/层级/组合/拆分/撤销重做）+ 属性面板
- [x] PR4-A：PTD UI tokens + 完整工作区外壳 + 左侧 Rail/组件面板 + 创建入口 + 图标工具栏
- [x] PR4-A.1：移除菱形/重复工作区外框 + 真实毫米标尺 + 多色参考线
- [x] PR4-B：工作区信息架构收口——Pages/Layers/Data/Assets 展示真实状态，Page/Global 归
  Page Inspector，组件属性归 Single/Multi Inspector；页面结构命令和数据编辑分别移交后续任务
- [x] PR4-C：右键菜单 + 响应式面板 + 浏览器交互验收
- [x] PR5：`apps/web` 受控示例、三档响应式与核心编辑交互验收（原生 HTML5 drag 的自动化限制
  单独记录，不把浏览器助手限制转化为非标准产品实现）

* `packages/react-designer/src/index.ts` 已导出 `<Designer>` 及相关公共类型
* `@ptd/components` 的组件是 Vanilla JS class，需要在 React 中通过 `useRef` + `useEffect` 桥接
* `@preact/signals-react` 用于细粒度响应式更新，避免整棵树重渲染
* **构建工具：tsup**（与 `@ptd/core`、`@ptd/components` 保持一致）；CSS 单独输出，并通过 `@ptd/react-designer/styles.css` 显式导入，不使用 `injectStyle`
* Legacy 布局参考截图：左侧数据源/字段树 + 中间画布（带标尺）+ 右侧属性面板，顶部双工具栏
* Legacy 状态模块对应关系：`global.js` → editor signal、`snapshot.js` → undo/redo signal、`compose.js` → group signal、`copy.js` → clipboard signal、`layer.js` → layer signal、`lock.js` → lock signal
