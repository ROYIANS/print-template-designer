# Journal - ROYIANS (Part 1)

> AI development session journal
> Started: 2026-05-20

---



## Session 1: Bootstrap frontend spec guidelines

**Date**: 2026-05-20
**Task**: Bootstrap frontend spec guidelines
**Branch**: `feature/refc`

### Summary

Populated all six .trellis/spec/frontend/ files (directory-structure, component-guidelines, hook-guidelines, state-management, type-safety, quality-guidelines) by scanning the codebase. Documented Vue 2 Options API patterns, commonMixin, vue-styled-components usage, Vuex printTemplateModule namespace, JS-only type safety via prop validation, and ESLint/Prettier setup.

### Main Changes

(Add details)

### Git Commits

(No commits - planning session)

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 2: 重构蓝图讨论与子任务分解

**Date**: 2026-05-21
**Task**: 重构蓝图讨论与子任务分解
**Branch**: `feature/refc`

### Summary

完成 v2 重构完整蓝图讨论：确认分层架构（monorepo + @ptd/core + @ptd/components + @ptd/react-designer + @ptd/export + NestJS 后端），技术栈决策（React、Preact Signals、CSS Modules + CSS Variables、Radix UI、NestJS + Prisma + SQLite），MVP 功能边界，以及 11 个实施子任务的拆分与依赖关系梳理。

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `af87bac` | (see git log) |
| `e8b07b5` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 3: Monorepo 脚手架搭建

**Date**: 2026-05-21
**Task**: Monorepo 脚手架搭建
**Branch**: `feature/refc`

### Summary

搭建 pnpm monorepo 骨架：归档 Vue 2 旧代码到 legacy/，创建四个 @ptd/* 包（core/components/react-designer/export）和两个 app（web/server），所有包 typecheck + build 通过。更新 README 为 v2 架构说明，新建 .trellis/spec/monorepo/ 规范文档（5 个 spec 文件），旧 frontend spec 标记为 legacy。

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `76c9efc` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 4: @ptd/core 核心引擎包实现

**Date**: 2026-05-21
**Task**: @ptd/core 核心引擎包实现
**Branch**: `feature/refc`

### Summary

实现 @ptd/core 框架无关核心引擎包：Schema 类型系统（PageConfig/ComponentSchema/TemplateSchema）、DataBindingEngine（[::field::] 语法 + 7 种类型转换器）、ComponentRegistry（12 种内置组件）、serialize/deserialize（_version 版本标记）、单位换算工具（mmToPx/pxToMm）、PAGE_SIZES 常量。tsup 双格式构建（ESM+CJS），vitest 测试套件（23 个用例全绿）。同步更新 monorepo spec：tsup 构建规范、vitest 测试约定。

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `f10f6d0` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 5: @ptd/components 画布组件包实现

**Date**: 2026-05-21
**Task**: @ptd/components 画布组件包实现
**Branch**: `feature/refc`

### Summary

实现 @ptd/components 框架无关画布组件包：纯 DOM class 渲染模型（mount/update/destroy API）、CSS Custom Properties 驱动动态样式（--ptd-* 前缀）、单例 stylesheet 注入器（含 SSR guard）、11 种画布组件（SimpleText/Text-Tiptap/Line/Rect/Circle/Star/Image/QRCode-easyqrcodejs/BarCode-bwip-js/Group/SimpleTable/ComplexTable）、DataBindingEngine 集成。vitest jsdom 测试套件（30 个用例全绿）。更新 monorepo spec：jsdom 环境规则、CSS 变量命名约定、singleton stylesheet 注入模式。

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `0a538aa` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete

---

## 2026-05-21 — @ptd/react-designer PR1

### Task
`05-21-react-designer-package` — PR1: tsup 配置 + 状态层骨架 + Designer 空壳

### Done
- `package.json`：切换到 tsup，修正 exports 字段顺序（types 前置），添加 Radix UI + @ptd/components 依赖
- `tsup.config.ts`：新建，external react/react-dom/@preact/signals-react，jsx automatic
- `src/state/editor.ts`：signals 状态层（templateSignal、curComponentSignal、scaleSignal 等）
- `src/state/snapshot.ts`：撤销/重做（recordSnapshot/undo/redo），MAX_SNAP_SHOT_LENGTH=20
- `src/utils/index.ts`：generateId、getShapeStyle、deepCopy
- `src/components/Designer/Designer.tsx`：受控组件骨架，props: value/onChange/onSave/onLoad
- `src/types/css-modules.d.ts`：CSS Modules 类型声明
- 构建：ESM + CJS + CSS + d.ts 全部输出，typecheck 通过

### Status
[OK] **PR1 完成，进入 PR2（画布核心）**


## Session 6: Frontend Docker deployment completed

**Date**: 2026-07-29
**Task**: Frontend Docker deployment completed
**Branch**: `feature/refc`

### Summary

Completed the pull-only GHCR frontend deployment flow, fixed clean-runner workspace type resolution by interleaving upstream builds with typechecks, verified CI and target deployment, documented the contract, and archived 05-21-docker-finalize.

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `9c52002` | (see git log) |
| `4cff359` | (see git log) |
| `1ab8f7a` | (see git log) |
| `1655df8` | (see git log) |
| `f65a5f1` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 7: Refine professional designer UI

**Date**: 2026-07-29
**Task**: Refine professional designer UI
**Branch**: `feature/refc`

### Summary

Restyled the Tool Dock into a neutral structural surface, rebuilt Page/Single/Multi Inspector states on the shared Panel shell with typed compact controls, fixed Panel grid/class merging and compact scrim stacking, verified wide/standard/compact/locked/multi states, and passed typecheck, 36 tests, lint, package build and Web production build.

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `f462da0` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 8: Refine Inspector scrubbing and disclosure hierarchy

**Date**: 2026-07-29
**Task**: Refine Inspector scrubbing and disclosure hierarchy
**Branch**: `feature/refc`

### Summary

Added Photoshop-style numeric label scrubbing with Shift/Alt/Escape and cancellable editor gestures; kept frequent Inspector sections visible, reserved disclosure for advanced appearance, hid irrelevant controls by component capability, updated specs, and verified package/Web builds plus responsive browser states.

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `21847a3` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 9: React Designer functional completion

**Date**: 2026-07-29
**Task**: React Designer functional completion
**Branch**: `feature/refc`

### Summary

Completed selection-aware canvas context menu, positioned multi-selection paste, keyboard access, responsive browser QA, contract updates, and closed the React Designer parent task; multi-page support is next.

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `d0e20cf` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 10: Multi-page visual management

**Date**: 2026-07-29
**Task**: Multi-page visual management
**Branch**: `feature/refc`

### Summary

Added manual page creation, recursive-id-safe duplication, final-page-protected deletion, id-preserving reorder and Pages panel controls; confirmed manual design pages plus derived automatic render pages, with 44 tests and responsive browser QA passing.

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `6671c38` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 11: Complete Prisma 7 Server template API

**Date**: 2026-07-29
**Task**: Complete Prisma 7 Server template API
**Branch**: `feature/refc`

### Summary

Upgraded apps/server to NestJS 11 and Prisma 7.9 with SQLite driver adapter and native JSON; added health, template CRUD, immutable version snapshots, optimistic concurrency, committed migration, safe fresh-database preparation, 8 real HTTP integration tests, and Server architecture guidance. User chose to skip destructive test-db reset after fresh migrate deploy passed.

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `7a3c130` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 12: Professional component catalog and canvas tools

**Date**: 2026-07-30
**Task**: Professional component catalog and canvas tools
**Branch**: `feature/refc`

### Summary

Built the five-group component catalog with planned placeholders, a two-level neutral sidebar, grouped Shape tools, persistent Text-frame drawing, viewport-only Hand/Space panning, Context Bar guidance, focused geometry/tool-state tests, and updated UI/integration contracts.

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `965c18163d489957dca21403cd71548316fad0d0` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 13: 完善页面与组件属性配置面板

**Date**: 2026-07-30
**Task**: 完善页面与组件属性配置面板
**Branch**: `feature/refc`

### Summary

完成统一 mm/px 度量合同、模板级页面设置、共享 Inspector Controls、十类组件属性面板、完整颜色控制、兼容归一化与越界提示；199 项测试、各包类型检查、前端 ESLint、顺序构建、Prettier 和 diff 检查均通过，并记录当前浏览器环境未覆盖的响应式及 Multi/Group 实机验收边界。

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `4a789b7` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 14: Header 菜单改为点击切换

**Date**: 2026-07-30
**Task**: Header 菜单改为点击切换
**Branch**: `feature/refc`

### Summary

将 App Bar 从 hover/focus 自动展开改为显式 click-to-toggle，修复 Designer 根节点焦点捕获导致同一菜单二次点击先关闭又重开的竞态；新增桌面与移动端交互回归验证，111 项 React Designer 测试、TypeScript、ESLint、构建、Prettier 和 diff 检查通过。

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `a4d3b26` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 15: Designer Host 应用命令与文档状态合同

**Date**: 2026-07-30
**Task**: Designer Host 应用命令与文档状态合同
**Branch**: `feature/refc`

### Summary

以统一 DesignerHost 能力表替代 onSave/onLoad，接通 App Bar、快捷键、工作区命令与文档状态栏；补齐 Pending 隔离、禁用原因、窄屏和可访问性合同，完成浏览器验收、120 项测试及全量生产构建，并记录 PostgreSQL + Better Auth 公网部署边界。

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `657ceee` | (see git log) |
| `c6b5a4d` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 16: PostgreSQL and GitHub authentication

**Date**: 2026-07-31
**Task**: PostgreSQL and GitHub authentication
**Branch**: `feature/refc`

### Summary

Replaced the SQLite baseline with PostgreSQL, added Better Auth GitHub-only OAuth with a fail-closed email allowlist, protected and owner-scoped all template/version APIs, added the Web login shell and PostgreSQL CI coverage, verified migrations and 12 Server tests against an isolated PostgreSQL database, and smoke-tested the compiled auth/HTTP runtime.

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `006bc46` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 17: Complete self-hosted deployment stack

**Date**: 2026-07-31
**Task**: Complete self-hosted deployment stack
**Branch**: `feature/refc`

### Summary

Added PostgreSQL, migration, Server and Web Compose lifecycle; hardened Bash/PowerShell deployment; published Web and Server images through CI; documented GitHub OAuth and safe operations; verified clean image builds, repeated force-recreate deployment, migrations, health and same-origin auth smoke flows.

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `c8fb221` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete
