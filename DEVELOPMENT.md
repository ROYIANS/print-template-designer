# 开发指南

本文说明 v2 Monorepo 的本地环境、常用命令、验证顺序和已知依赖问题。产品概览见 [README.md](./README.md)，线上部署见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 环境基线

| 工具 | 建议版本 | 说明 |
| --- | --- | --- |
| Node.js | 22.12+ | CI/Docker 使用 Node 22；完整工作区含原生 SQLite 依赖 |
| pnpm | 10.15.1 | 由根 `packageManager` 声明，通过 Corepack 调用 |
| PowerShell | 7+ | Windows 脚本和项目约定的最低版本 |

先确认实际运行时，而不是只看版本管理器当前配置：

```bash
node --version
corepack pnpm --version
```

期望 pnpm 输出 `10.15.1`。项目命令统一写为 `corepack pnpm ...`，避免被其他全局 pnpm 或工具内置 runtime 接管。

## 安装

```bash
corepack enable
corepack pnpm install
```

不要在子目录分别安装依赖，也不要提交 `node_modules/` 或 `dist/`。

## 启动 Web

推荐从仓库根执行：

```bash
corepack pnpm dev
```

它等价于根脚本 `dev:web`：先按 `core → components → react-designer` 构建 workspace 依赖，然后并行启动三个 package 的 watch 和 Vite。直接进入 `apps/web` 裸跑 Vite 可能读取不到或读取到过期的 `dist`。

只构建 Web：

```bash
corepack pnpm --filter @ptd/core build
corepack pnpm --filter @ptd/components build
corepack pnpm --filter @ptd/react-designer build
corepack pnpm --filter web build
```

当前 Web 使用内存示例模板，不会连接或写入 Server。

## 启动 Server

Server 默认读取 `DATABASE_URL=file:./dev.db`，监听 `PORT=3000`。首次运行先应用已提交的 SQLite migration：

```bash
corepack pnpm --filter server prisma:migrate:deploy
corepack pnpm --filter server start:dev
```

自定义环境时，可在启动命令所在环境设置：

```dotenv
DATABASE_URL=file:./dev.db
PORT=3000
```

常用 Prisma 命令：

```bash
corepack pnpm --filter server prisma:validate
corepack pnpm --filter server prisma:generate
corepack pnpm --filter server prisma:migrate:deploy
```

不要手工编辑 `apps/server/src/generated/prisma/`；它由 Prisma 7 生成且被忽略。数据库结构变更必须提交新的 migration，不能只修改本地数据库。

## 质量检查

前端 CI 的依赖顺序是权威基线：上游 package 需要先 typecheck、再 build，消费者才能在干净环境解析其 `dist` 类型入口。

```bash
corepack pnpm --filter @ptd/core typecheck
corepack pnpm --filter @ptd/core build
corepack pnpm --filter @ptd/components typecheck
corepack pnpm --filter @ptd/components build
corepack pnpm --filter @ptd/react-designer typecheck
corepack pnpm --filter @ptd/react-designer build
corepack pnpm --filter web typecheck

corepack pnpm --filter @ptd/core test
corepack pnpm --filter @ptd/components test
corepack pnpm --filter @ptd/react-designer test
corepack pnpm lint:frontend
corepack pnpm --filter web build
```

Server 验证：

```bash
corepack pnpm --filter server prisma:validate
corepack pnpm --filter server typecheck
corepack pnpm --filter server test
corepack pnpm --filter server build
```

根命令 `corepack pnpm build`、`corepack pnpm typecheck` 和 `corepack pnpm lint` 会覆盖整个 workspace，但在排查问题时，按依赖顺序运行更容易定位失败层。

Markdown 和其他受 Prettier 支持的文件可检查为：

```bash
corepack pnpm exec prettier --check "**/*.md"
```

## Windows：`better-sqlite3` 安装失败

`apps/server` 使用 `better-sqlite3@12.11.1`。在 Windows + Node 20 下，该版本可能找不到对应的预编译二进制，随后回退到 `node-gyp`，并要求 Visual Studio C++ 工具链。优先处理顺序是：

1. 切换到 Node 22.12+，再次确认 `node --version`。
2. 确认 npm registry/GitHub Release 下载不被网络、代理或证书策略拦截。
3. 只有确实需要源码编译时，才安装 Visual Studio 的 “Desktop development with C++” workload。

如果网络必须经过代理，只在本机 shell 或包管理器配置中设置代理，不要把个人代理地址或凭据写入仓库。

## 代码与文档边界

- `legacy/` 只读；v2 不从中 import 代码。
- `@ptd/core` 不依赖 React 或 NestJS。
- `@ptd/components` 负责 DOM 渲染，不负责编辑器工作区。
- `@ptd/react-designer` 是受控组件，持久化由 Host 决定。
- `apps/web` 当前只是 standalone Host；`apps/server` 是独立 API。
- `@ptd/export` 目前没有导出实现。
- `TemplateSchema.pages` 是手工页面；未来自动分页是预览/导出派生结果。

更细的实现规则在 [`.trellis/spec/monorepo/`](./.trellis/spec/monorepo/index.md)。开始功能任务前，应按 [Trellis workflow](./.trellis/workflow.md) 创建或继续任务，并读取涉及层的规范。

## 提交前检查

- 只包含当前任务相关改动，保留用户已有的工作树修改。
- 新增公共 API 已从 package 根 `src/index.ts` 导出。
- 没有跨 package 的源码相对路径。
- 测试、类型检查、lint 和构建按改动风险完成。
- 文档中的命令、API、路径和成熟度与代码一致。
- `git diff --check` 无空白错误。
