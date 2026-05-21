# @ptd/components 画布组件包

## Goal

实现框架无关的画布组件包 `@ptd/components`，将 legacy Vue 2 的 11 种 PageComponents 迁移为纯 TypeScript 实现，使用 CSS Custom Properties 驱动样式，`@preact/signals-core` 驱动响应式状态，供 `@ptd/react-designer` 消费。

## What I already know

- legacy 组件列表：RoySimpleText、RoyText（富文本）、RoySimpleTable、RoyComplexTable、RoyLine、RoyRect、RoyCircle、RoyStar、RoyImage、RoyQRCode（easyqrcodejs）、RoyBarCode（bwip-js）、RoyGroup
- legacy 样式方案：`vue-styled-components`（CSS-in-JS），新版改为 CSS Custom Properties
- 蓝图决策：`@preact/signals-core`（~3KB）作为响应式核心，`@preact/signals-react` 让 React 设计器接入
- `packages/components/package.json` 已有 `@preact/signals-core: ^1` 作为 peerDependency
- legacy `page-generator.js` 用纯 DOM API 渲染（`document.createElement`），说明渲染层可以是纯 DOM
- legacy `auto-table.js` / `auto-split-text.js` 依赖 DOM，归属本包
- `@ptd/core` 已提供：ComponentSchema、DataBindingEngine、mmToPx 等

## Open Questions

- [x] 组件渲染模型：**纯 DOM class**（imperative），API: `new SimpleText(schema, signals).mount(el)` ✓

## Requirements（已知部分）

### 1. 组件渲染
- 11 种组件 1:1 迁移
- CSS Custom Properties 驱动动态样式（宽高/颜色/字体/边框）
- `@preact/signals-core` 驱动响应式状态更新

### 2. 数据绑定集成
- 接入 `@ptd/core` 的 `DataBindingEngine`，渲染时替换 `[::field::]` 变量

### 3. 自动分页
- auto-table 和 auto-split-text 均放在 `@ptd/components` 内部，不对外暴露
- auto-table：SimpleTable/ComplexTable 组件内部渲染逻辑
- auto-split-text：RoyText 组件内部分页辅助（html2canvas 依赖）

### 4. 构建
- tsup 双格式（ESM + CJS）
- vitest 测试

## Acceptance Criteria（待完善）

- [ ] `pnpm --filter @ptd/components build` 成功
- [ ] `pnpm --filter @ptd/components typecheck` 无错误
- [ ] 所有 11 种组件可被 `@ptd/react-designer` 消费

## Out of Scope

- 设计器交互（拖拽、选中、缩放）— 属于 react-designer
- 数据源直连 — 属于 datasource-refactor
- 导出逻辑 — 属于 export 包

## Technical Notes

- 参考：`legacy/src/components/PageComponents/style.js` — CSS-in-JS 到 CSS Variables 的迁移参考
- 参考：`legacy/src/components/PageComponents/*.vue` — 各组件逻辑
- 参考：`legacy/src/components/Viewer/auto-table.js` / `auto-split-text.js` — 自动分页
- 富文本编辑器：**Tiptap**（框架无关，基于 ProseMirror，替换 legacy WangEditor）
- BarCode 库：**bwip-js**（沿用 legacy）
- 蓝图：`.trellis/tasks/archive/2026-05/05-20-refc-blueprint/prd.md`
