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
  * 顶部工具栏（ToolBar）：标尺开关、锁定/解锁、对齐/分布、组合/拆分、层级、复制/粘贴/删除、缩放比例
  * 画布（Editor）：SketchRuler 标尺、ComponentAdjuster（选中/移动/缩放/旋转）、Area 框选、EditorLine 辅助线、上下边距线、右键菜单
  * 属性面板（PagePalette）：按组件类型动态渲染表单（样式 + propValue），使用 vxe-table 表单（迁移后改为原生 React 表单）
  * 状态：Vuex 模块（global/snapshot/compose/copy/layer/lock/night-mode/ruler-things）→ 迁移为 signals
  * 撤销/重做：snapshot 模块，MAX_SNAP_SHOT_LENGTH=3

## Assumptions (temporary)

* `<Designer>` 是受控组件（controlled），宿主传入 `value: TemplateSchema` + `onChange` 回调，预留 `onSave`/`onLoad` 空接口供 `05-21-integration-hooks` 扩展
* 画布内组件渲染复用 `@ptd/components` 的 Vanilla JS class，通过 React ref + useEffect 桥接
* SketchRuler 使用现成 React 库（`react-sketch-ruler` 或同类），不自行实现
* 组合/拆分、框选多组件等复杂交互：本任务实现核心逻辑，如工作量过大可拆出独立子任务

## Open Questions

（暂无阻塞性问题）

## Requirements (evolving)

**功能目标：对齐 legacy Vue2 版本所有功能**

* 导出 `<Designer value={TemplateSchema} onChange={fn} />` 受控组件
* **布局**：顶部 header + 左侧 sidebar（图标菜单 + 可折叠面板）+ 中间画布 + 右侧属性面板
* **左侧 sidebar**（5 个面板，图标切换）：
  * 组件面板：按 category 分组，可拖拽到画布
  * 结构面板（TOC）：组件树，可选中/排序
  * 属性面板（左侧版）：同右侧属性面板（备用入口）
  * 数据源面板：展示 `dataSource` 字段列表（绑定逻辑由 `05-21-datasource-refactor` 完成，此处做 UI 骨架）
  * 全局设置面板：`PageConfig` 编辑（纸张大小、方向、边距、字体等）
* **顶部工具栏**：标尺开关、锁定/解锁、对齐/分布（8 种）、组合/拆分、层级（上移/下移/置顶/置底）、复制/粘贴/删除、撤销/重做、缩放比例
* **画布**：SketchRuler 标尺、ComponentAdjuster（选中/移动/8 点缩放/旋转）、Area 框选、辅助线（EditorLine）、上下边距线、右键菜单
* **属性面板**：抛弃 `vxe-table`/`vxe-form`，用通用 React 表单（原生 input/select/color picker）渲染 `ComponentStyle` 字段，所有组件共用一套面板
* **UI 组件库**：全面采用 `@radix-ui` Primitives，自定义样式。具体用到：
  * `@radix-ui/react-context-menu` — 右键菜单
  * `@radix-ui/react-tooltip` — 工具栏按钮 tooltip
  * `@radix-ui/react-tabs` — 左侧 sidebar 面板切换
  * `@radix-ui/react-scroll-area` — 面板滚动区域
  * `@radix-ui/react-separator` — 分隔线
* **状态管理**：用 `@preact/signals-react` 替代 Vuex，对应模块：editor state / snapshot（撤销/重做）/ compose（组合）/ copy（复制粘贴）/ layer / lock
* 组件渲染桥接：通过 React ref + useEffect 调用 `@ptd/components` 的 class 实例

## Acceptance Criteria (evolving)

* [x] `<Designer>` 可在 `apps/web` 中渲染，不报 TypeScript 错误
* [ ] 拖拽组件到画布后，`onChange` 被调用，`TemplateSchema` 中新增对应 `ComponentSchema`
* [x] 选中组件后，属性面板显示该组件的 style 属性，修改后画布实时更新
* [x] 撤销/重做功能正常工作
* [x] 对齐/分布、层级操作正常工作
* [x] 组合/拆分正常工作
* [x] 框选多组件正常工作
* [ ] 右键菜单正常弹出并执行操作
* [ ] SketchRuler 标尺正常显示，可开关

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
- SketchRuler：使用现成 React 库（`react-sketch-ruler` 或同类）

**Consequences**: 零 Vue 依赖，完全 React 化；Radix UI 无样式，需自行实现所有视觉样式；signals 细粒度更新性能优于 Vuex。

## Implementation Plan

- [x] PR1：tsup 配置 + 目录骨架 + signals 状态层 + `<Designer>` 空壳
- [x] PR2：画布核心（ComponentAdjuster + 拖拽放置 + 选中/移动/缩放/旋转）
- [x] PR3：工具栏操作（对齐/分布/层级/组合/拆分/撤销重做）+ 属性面板
- [ ] PR4（下一步）：左侧 sidebar 5 个面板 + SketchRuler + 右键菜单 + 组件拖拽入口
- [ ] PR5：`apps/web` 全量浏览器验收（受控示例已接入）

* `packages/react-designer/src/index.ts` 已导出 `<Designer>` 及相关公共类型
* `@ptd/components` 的组件是 Vanilla JS class，需要在 React 中通过 `useRef` + `useEffect` 桥接
* `@preact/signals-react` 用于细粒度响应式更新，避免整棵树重渲染
* **构建工具：tsup**（与 `@ptd/core`、`@ptd/components` 保持一致）；CSS 单独输出，并通过 `@ptd/react-designer/styles.css` 显式导入，不使用 `injectStyle`
* Legacy 布局参考截图：左侧数据源/字段树 + 中间画布（带标尺）+ 右侧属性面板，顶部双工具栏
* Legacy 状态模块对应关系：`global.js` → editor signal、`snapshot.js` → undo/redo signal、`compose.js` → group signal、`copy.js` → clipboard signal、`layer.js` → layer signal、`lock.js` → lock signal
