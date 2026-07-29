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
