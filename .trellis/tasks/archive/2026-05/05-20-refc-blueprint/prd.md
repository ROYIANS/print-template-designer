# Print Template Designer 全面重构蓝图

## Goal

将现有的 Vue 2 打印模板设计器从头重构：技术栈全面升级、支持框架无关发布或作为独立 Docker 应用运行、补全现有功能并扩展新功能，形成一个清晰的产品蓝图供后续分阶段实施。

## 现有功能清单（来自代码扫描）

**画布组件（PageComponents）**
- 文本（SimpleText）、长文本/富文本（WangEditor）
- 表格：SimpleTable（单元格）、ComplexTable（复杂表格）
- 形状：Line、Rect、Circle、Star
- 媒体：Image、QRCode（easyqrcodejs）、BarCode（bwip-js）
- 容器：Group（组合）

**设计器能力**
- 拖拽放置、缩放、旋转、对齐
- 撤销/重做（snapshot）
- 复制/粘贴、图层管理、锁定
- 数据源绑定（字段拖入组件）
- 页面配置（尺寸/方向/边距/字体）
- 标尺/辅助线（SketchRuler）
- 右键菜单（RoyContext）
- 夜间模式
- 导览 Tour（shepherd.js）

**输出**
- Viewer（只读预览）
- 自动分页（auto-split-text、auto-table）
- PDF 导出（html2canvas + jspdf）
- 打印（vue-print-nb）

**发布形式**
- Vue 2 npm 组件库（当前）

## Open Questions

1. **发布形式**：独立 Docker App（含后端）vs 框架无关 npm 包 vs 两者都要？
2. **前端框架**：Vanilla/Web Components vs Svelte vs Vue 3 vs React？
3. **后端**：是否需要？如需要，主要承担什么职责？
4. **扩展功能优先级**：模板管理/存储？多页？协同？变量系统？

## Assumptions (temporary)

- 重构不要求向后兼容现有 Vue 2 API
- 以"蓝图"为本次任务产出，具体分阶段实施另建任务

## Technical Notes

- 当前代码位于 `src/`，Vue 2 + Vuex 3 + vue-styled-components
- Viewer 渲染器独立（`src/components/Viewer/`），可作为核心引擎抽象的参考
- 数据源系统已有字段绑定逻辑，可作为变量系统的基础

## 已确认决策

### 发布形式：方向 C（分层架构）
- **Monorepo** 管理所有包
- **核心引擎包**（`@ptd/core`）：框架无关 TS 库，含渲染引擎、数据绑定、序列化/反序列化，作为 npm 包发布
- **设计器 App**（`apps/designer`）：React，完整设计器 UI，打包进 Docker
- **后端服务**（`apps/server`）：独立 Docker 服务，能力 TBD
- npm 包 **不包含** 设计器 UI 组件库
- 前端框架：**React**（不用 Vue 3）

### 后端职责范围：轻后端 + 集成接口分离
- **后端承担**：模板 CRUD/版本管理、服务端 PDF/Word 导出（Puppeteer）、数据源代理、独立 App 最小用户认证
- **设计器前端**：暴露集成钩子（`onSave` / `onLoad` / `onExport` / `onDataSource`），无后端时纯前端也可独立运行
- **嵌入场景**：宿主替换这些钩子对接自己的后端，无需部署我们的后端服务
- **用户体系**：仅服务于独立 Docker App，不进 `@ptd/core` 包
- **导出**：前端现有 html2canvas+jspdf 方案保留作 fallback，后端提供 Puppeteer 高质量导出 API
- **新增导出格式**：Word 导出、签章（待设计）

### 包结构：选项 2（细分包）
```
packages/
  core/          # @ptd/core — 渲染引擎、序列化、组件 schema（框架无关 TS）
  components/    # @ptd/components — 画布组件实现（框架无关，依赖 core）
  react-designer/# @ptd/react-designer — React 设计器组件（依赖 components）
  export/        # @ptd/export — 导出工具（PDF/Word，可独立用）

apps/
  web/           # 完整 Web App（用 @ptd/react-designer）
  server/        # Node.js 后端（Fastify/Hono）

docker/          # docker-compose，组合 web + server
```

### 样式策略
- **canvas 渲染组件（`@ptd/components`）**：CSS custom properties 驱动精确样式（mm/px 控制），类似现有 vue-styled-components 方案，不用 Tailwind
- **设计器 UI（`@ptd/react-designer` + `apps/web`）**：Tailwind CSS v4
- Web Components 若用 Shadow DOM 则不适合 Tailwind，渲染层倾向 Light DOM 或纯 TS DOM 渲染

### 样式方案（更新）
- **canvas 渲染层（`@ptd/components`）**：纯 CSS + CSS Custom Properties 驱动动态值（宽高/颜色/字体），无运行时开销，精确 mm/px 控制
- **设计器 UI（`@ptd/react-designer`）**：CSS Modules（样式隔离） + Radix UI Primitives（dialog/dropdown/tooltip/tabs 等复杂交互与 a11y）
- **不使用**：Tailwind、CSS-in-JS（Emotion/styled-components）

### canvas 组件实现：选项 C（Preact Signals）
- `@preact/signals-core`（~3KB）作为响应式核心，驱动 canvas 组件状态更新
- `@preact/signals-react` 让 React 设计器无缝接入
- 比纯 DOM 方案（Option B）更易维护，比 Lit（Option A）集成 React 更顺滑

## Requirements（已确认）

### MVP 范围

**架构**
- Monorepo 建立（pnpm workspaces 推荐）
- 四包分离：`@ptd/core`、`@ptd/components`、`@ptd/react-designer`、`@ptd/export`
- Docker compose 跑通（`apps/web` + `apps/server`）

**组件迁移**
- 现有全部组件 1:1 迁移：Text、SimpleText、Table（Simple + Complex）、Line、Rect、Circle、Star、Image、QRCode、BarCode、Group

**设计器 UI**
- 整体 UI 布局重新设计
- 工具栏扩充（对齐/分布/缩放/辅助线/撤销恢复等）
- 右键菜单完善

**多页支持**
- 设计器内可视化多页管理（手动添加/删除页）
- 保留自动分页渲染能力

**数据源**
- 数据源 UI 重构
- 实时预览（填入示例数据即时渲染）
- 数据源直连：前端配置连接 Excel 本地文件 / REST API（MVP 范围内）
- 接口层预留 MySQL 等数据库连接器扩展点

**导出**
- 服务端 Puppeteer PDF（高质量）+ 前端 html2canvas fallback
- Word 导出接口插槽预留

**后端基础**
- 模板 CRUD + 版本管理（≥2 个版本快照）
- 静态资源上传
- 最小用户认证

**集成接口**
- `onSave` / `onLoad` / `onExport` / `onDataSource` 钩子
- 无后端时纯前端独立可运行

---

### 后期规划

| 优先级 | 功能 |
|--------|------|
| 高 | 批量打印 API（传数据数组 → 批量生成 PDF） |
| 高 | 数据源直连 MySQL / 更多数据库 |
| 中 | Word 导出完整实现 |
| 中 | 更多组件（图表、签名框、条件显示等） |
| 中 | 多语言 / 字体管理 |
| 低 | 签章功能 |
| 低 | 协同编辑 |

## Out of Scope（MVP）

- 签章、协同编辑
- 图表组件
- 多语言/字体管理
- 批量打印 API
- MySQL 直连（预留接口但不实现）

### 后端技术栈
- **框架**：NestJS（TypeScript，结构化，便于后期扩展）
- **ORM**：Prisma（SQLite 起步，迁移 PostgreSQL 只改 datasource 配置）
- **默认数据库**：SQLite（单容器部署，零依赖；生产环境可换 PostgreSQL）
- **Docker**：SQLite 模式单容器；PostgreSQL 模式 docker-compose 两容器

## Decision Log（ADR-lite）

| 决策 | 选择 | 原因 |
|------|------|------|
| 发布形式 | 方向 C：分层架构（npm 包 + Docker App） | 兼顾嵌入场景与独立部署 |
| Monorepo | pnpm workspaces | 标准方案，支持细分包 |
| 前端框架 | React | 不再依赖 Vue 生态 |
| canvas 组件实现 | 纯 TS DOM + Preact Signals | 轻量响应式，框架无关 |
| 样式方案 | CSS Modules（UI） + CSS Custom Properties（canvas） | 无运行时开销，精确控制 |
| UI 组件库 | Radix UI Primitives | Headless，不绑定 Tailwind |
| 后端框架 | NestJS | 结构化，易扩展 |
| ORM | Prisma | 多数据库迁移成本低 |
| 默认数据库 | SQLite → 可迁移 PostgreSQL | 简化自部署，不锁定 |

## Acceptance Criteria

- [ ] PRD 完整记录所有架构决策（包结构、技术栈、样式方案、后端方案）
- [ ] MVP 功能边界清晰，有明确的 in-scope / out-of-scope 列表
- [ ] 后期规划按优先级排列
- [ ] 蓝图已获用户确认

## Definition of Done

- [ ] PRD 已确认，决策无歧义
- [ ] `implement.jsonl` / `check.jsonl` 已配置
- [ ] 任务已 archive，可作为后续各实施子任务的参考文档

## Technical Notes

- 现有代码：`src/components/Viewer/page-generator.js` — canvas 渲染引擎的参考实现
- 现有代码：`src/components/PageComponents/style.js` — CSS-in-JS 到 CSS Variables 的迁移参考
- 现有代码：`src/stores/modules/global.js` — 状态模型参考，重构时用 Signals 替代 Vuex
- 现有代码：`src/components/Viewer/auto-table.js` / `auto-split-text.js` — 自动分页逻辑，需迁移进 `@ptd/core`
- Prisma 多数据库支持文档：SQLite → PostgreSQL 只需修改 `datasource` block
- NestJS Monorepo 模式：可用 `@nestjs/cli` workspace 或直接在 pnpm workspace 内管理

## 子任务分解

| 顺序 | 任务 | 目录 | 依赖 |
|------|------|------|------|
| 1 | 搭建 Monorepo 脚手架 | `05-21-monorepo-scaffold` | — |
| 2 | @ptd/core 核心引擎包 | `05-21-core-package` | 1 |
| 3 | @ptd/components 画布组件包 | `05-21-components-package` | 2 |
| 4 | @ptd/export 导出工具包 | `05-21-export-package` | 2（可与 3 并行） |
| 5 | @ptd/react-designer 设计器 React 包 | `05-21-react-designer-package` | 3 |
| 6 | apps/server NestJS 后端 | `05-21-server-app` | 1（可与 2-5 并行） |
| 7 | apps/web 完整设计器 App | `05-21-web-app` | 5 |
| 8 | 多页可视化管理 | `05-21-multi-page-support` | 5 |
| 9 | 数据源重构（Excel/REST + 实时预览） | `05-21-datasource-refactor` | 5 + 6 |
| 10 | 集成钩子 | `05-21-integration-hooks` | 5 + 6 |
| 11 | Docker Compose 最终打包 | `05-21-docker-finalize` | 全部 |

**第一个开始的任务**：`05-21-monorepo-scaffold`
