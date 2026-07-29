# 搭建 Monorepo 脚手架

## Goal

将现有 Vue 2 旧代码整体归档到 `legacy/`，然后在根目录搭建全新的 pnpm monorepo 骨架，包含四个包（`@ptd/core`、`@ptd/components`、`@ptd/react-designer`、`@ptd/export`）和两个 app（`apps/web`、`apps/server`），让整个工程可以安装依赖并执行基础命令。

## Requirements

### 1. 归档旧代码
- 将 `src/`、`public/`、`babel.config.js`、`jsconfig.json`、`lint-staged.config.js`、`vue.config.js`、`yarn.lock`、`pnpm-lock.yaml`（旧）、`package.json`（旧）移动到 `legacy/` 目录
- `.browserslistrc`、`.eslintrc.js`、`.prettierrc.json`、`.editorconfig` 一并归入 `legacy/`（新项目会重新配置）
- `README.assets/` 归入 `legacy/`
- `.gitignore` 保留在根目录（追加 monorepo 相关忽略规则）
- `README.md`、`CHANGELOG.md`、`LICENSE` 保留在根目录

### 2. Monorepo 根配置
- `package.json`（根）：`private: true`，pnpm workspaces 配置，指向 `packages/*` 和 `apps/*`
- `pnpm-workspace.yaml`：声明 `packages/*`、`apps/*`
- `tsconfig.base.json`：共享 TypeScript 配置（strict、ESNext、moduleResolution bundler）
- `.eslintrc` / `eslint.config.js`：根级 ESLint（TypeScript + React）
- `.prettierrc.json`：Prettier 配置（2 spaces、单引号、trailing comma all）
- `.editorconfig`：与旧项目保持一致（2 spaces、LF）
- `.gitignore`：更新，覆盖 monorepo 典型忽略规则

### 3. packages/ 骨架（各自有 package.json + tsconfig.json + src/index.ts）

| 包 | name | 说明 |
|---|---|---|
| `packages/core` | `@ptd/core` | 框架无关核心引擎 |
| `packages/components` | `@ptd/components` | canvas 组件（Preact Signals） |
| `packages/react-designer` | `@ptd/react-designer` | React 设计器 |
| `packages/export` | `@ptd/export` | PDF/Word 导出工具 |

每个包：
- `package.json`：name、version（0.1.0）、main/module/types 字段、peerDependencies（如需）
- `tsconfig.json`：extends `../../tsconfig.base.json`
- `src/index.ts`：空导出占位 `export {}`

### 4. apps/ 骨架

**`apps/web`**（React + Vite）
- `package.json`：依赖 `@ptd/react-designer`（workspace:*）
- `vite.config.ts`
- `index.html`
- `src/main.tsx`、`src/App.tsx`（最小 Hello World）

**`apps/server`**（NestJS）
- 使用 `@nestjs/cli` 生成最小骨架，或手动创建
- `package.json`：NestJS core、platform-express、Prisma 依赖
- `src/main.ts`、`src/app.module.ts`（最小可启动）
- `prisma/schema.prisma`：SQLite datasource + 最小 User/Template model 占位

### 5. docker/ 基础
- `docker/docker-compose.yml`：web（Node serve）+ server（NestJS）两服务骨架
- `docker/Dockerfile.web`、`docker/Dockerfile.server`：多阶段构建骨架（不要求此阶段可运行）

### 6. 验收标准
- `pnpm install` 在根目录可以成功执行
- `pnpm --filter @ptd/core build`（tsc）可以执行（即使输出为空）
- `pnpm --filter apps/web dev` 可启动 Vite dev server 显示 Hello World
- `pnpm --filter apps/server start:dev` 可启动 NestJS（显示 Listening on port 3000）
- 旧代码完整保留在 `legacy/`，git 历史可追溯

## Out of Scope
- 实际业务逻辑实现
- Docker 可运行（骨架即可）
- 包之间的实际依赖调用

## Technical Notes
- 架构蓝图：`.trellis/tasks/archive/2026-05/05-20-refc-blueprint/prd.md`
- pnpm workspace 协议：内部包互引用用 `workspace:*`
- NestJS 版本：v10+（当前稳定）
- Vite 版本：v6+
- TypeScript：v5+
- Node 版本要求：≥ 20（package.json engines 字段声明）
