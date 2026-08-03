# 开发指南

本文说明 v2 Monorepo 的本地环境、常用命令、验证顺序和已知依赖问题。产品概览见 [README.md](./README.md)，线上部署见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 环境基线

| 工具       | 建议版本 | 说明                                                |
| ---------- | -------- | --------------------------------------------------- |
| Node.js    | 22.12+   | CI、Docker 构建与生产 Server 运行时统一使用 Node 22 |
| pnpm       | 10.15.1  | 由根 `packageManager` 声明，通过 Corepack 调用      |
| PowerShell | 7+       | Windows 脚本和项目约定的最低版本                    |

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

它等价于根脚本 `dev:web`：先按 `core → components → export → react-designer` 构建 workspace 依赖，
然后并行启动四个 package 的 watch 和 Vite。直接进入 `apps/web` 裸跑 Vite 可能读取不到或读取到过期的
`dist`，并出现 `@ptd/core` / `@ptd/export` 无法解析或类型过期。

只构建 Web：

```bash
corepack pnpm --filter @ptd/core build
corepack pnpm --filter @ptd/components build
corepack pnpm --filter @ptd/export build
corepack pnpm --filter @ptd/react-designer build
corepack pnpm --filter web build
```

当前 Web 会通过同源 `/api` 代理连接 Server，完成 GitHub Cookie 会话和 Allowlist 准入检查，并已接通
owner 隔离的模板 CRUD、文件工作台、另存为、版本历史、恢复与 `expectedVersion` 冲突保护。模板内容、
canonical Datasource v2、结构化绑定和用户明确保存的 sample records 会进入不可变版本快照。

## Datasource v2 开发边界

- `TemplateSchema.data` 是唯一 canonical 数据定义；`dataSource` / `dataSet` 只用于 v0/v1 兼容读取。
- JSON 导入只接受 object 或 object array，并必须复用 `@ptd/core` 的 `DATA_SOURCE_LIMITS`、
  `parseRuntimeRecordsJson`、`validateRuntimeRecords` 与 `inferDataDefinition`，不要复制限制或字段推断逻辑。
- 组件可绑定目标由 Core Registry 的 `getComponentBindingTargets` 声明；渲染通过
  `resolveComponentBindings` 产生派生 Schema，不在 Components 或 Designer 复制 target → propValue 映射。
- `RenderContext` 必须显式包含 JSON data、locale、timeZone、ISO `now` 和 mode；校样、打印预览与 Export
  不得在组件内部读取系统时钟。
- 临时 Host 数据、校样模式、当前记录和字段树 UI 状态不写入模板；字段模型、格式化、sample records 和
  bindings 才是模板变更。
- Excel/CSV、REST、Secret 管理、完整长文本分页和批量输出仍是后续独立任务。认证凭据不得进入
  `TemplateSchema`、模板版本或浏览器持久化。

## 启动 Server

Server 只支持 PostgreSQL，`DATABASE_URL` 必填，默认监听 `PORT=3000`。先复制开发环境示例并配置隔离的 PostgreSQL 数据库、GitHub OAuth App 与 Allowlist：

```bash
cp apps/server/.env.example apps/server/.env
# 编辑 apps/server/.env，不要指向共享或生产数据库
```

首次运行先应用已提交的 PostgreSQL migration：

```bash
corepack pnpm --filter server prisma:migrate:deploy
corepack pnpm --filter server start:dev
```

自定义环境时，至少需要提供：

```dotenv
DATABASE_URL=postgresql://ptd:change-me@127.0.0.1:5432/ptd?schema=public
PORT=3000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=replace-with-openssl-rand-base64-32
PTD_WEB_ORIGIN=http://localhost:5173
PTD_ALLOWED_EMAILS=owner@example.com
GITHUB_CLIENT_ID=replace-me
GITHUB_CLIENT_SECRET=replace-me
```

### 跳过本地 GitHub OAuth

调试 Designer 与模板 API 时，可以使用 Server 权威的固定本地开发身份：

```dotenv
NODE_ENV=development
BETTER_AUTH_URL=http://localhost:3000
PTD_WEB_ORIGIN=http://localhost:5173
PTD_DEV_AUTH_BYPASS=true
```

启用后不需要配置 `BETTER_AUTH_SECRET`、`PTD_ALLOWED_EMAILS`、`GITHUB_CLIENT_ID` 或
`GITHUB_CLIENT_SECRET`。Server 会把受保护请求绑定到 PostgreSQL 中稳定的开发用户，因此模板的
`ownerId` 外键、版本历史和多用户查询边界没有被前端短路。`/api/account/me` 返回
`authMode: "dev-bypass"`，供 Web 明确显示“本地开发身份”。

这个开关默认关闭，并且只接受 `localhost`、`127.0.0.1` 或 `[::1]` 的 Web/Auth HTTP(S) origin；
生产环境或非 loopback origin 会让 Server 启动失败，Server 也会强制只监听 Auth origin 的 loopback
主机。不要加入自定义身份请求头，也不要在浏览器保存开发 Token。要验证真实认证流程时，关闭该开关并
恢复 GitHub OAuth、Allowlist 与 Better Auth Secret。

常用 Prisma 命令：

```bash
corepack pnpm --filter server prisma:validate
corepack pnpm --filter server prisma:generate
corepack pnpm --filter server prisma:migrate:deploy
```

不要手工编辑 `apps/server/src/generated/prisma/`；它由 Prisma 7 生成且被忽略。数据库结构变更必须提交新的 migration，不能用 `db push` 取代已提交的 migration 历史。

## 本地 PDF 输出

正式 PDF 不调用 `window.print()`。Web 的 `output-render.html` 加载与预览相同的 `@ptd/export` 编译器和
DOM renderer，Server 通过 `playwright-core` 连接显式配置的 Chromium：

```dotenv
PTD_OUTPUT_RENDER_URL=http://127.0.0.1:5173/output-render.html
PTD_CHROMIUM_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
PTD_OUTPUT_MAX_CONCURRENCY=2
PTD_OUTPUT_TIMEOUT_MS=30000
```

`playwright-core` 不会为本地开发自动下载浏览器。Windows 可指向已安装的 Chrome/Chromium；Docker
使用与 `playwright-core` 完全匹配的固定 Playwright image。Server 只允许内部 render origin、
`data:` 和 `blob:`，模板中的远程/相对图片会在 Renderer 创建网络请求前产生
`REMOTE_RESOURCE_BLOCKED`。要输出图片，请使用已嵌入模板的 `data:image/*`。

真实 Chromium smoke test 默认跳过；先启动 Web（dev 或 production preview），再显式运行：

```powershell
$env:PTD_REAL_PDF_TEST = 'true'
$env:PTD_OUTPUT_RENDER_URL = 'http://127.0.0.1:5173/output-render.html'
$env:PTD_CHROMIUM_EXECUTABLE_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
corepack pnpm --filter server exec vitest run test/output-real-pdf.test.ts
```

该测试验证 PDF signature、IR/真实 PDF 页数一致、文字对象与显式 metadata 时间。最终视觉验收还应把
PDF 渲染为 PNG 检查裁切、空白页、中文 glyph、页眉页脚和表格续页；文本提取不能代替视觉验收。

## 质量检查

前端 CI 的依赖顺序是权威基线：上游 package 需要先 typecheck、再 build，消费者才能在干净环境解析其 `dist` 类型入口。

```bash
corepack pnpm --filter @ptd/core typecheck
corepack pnpm --filter @ptd/core build
corepack pnpm --filter @ptd/components typecheck
corepack pnpm --filter @ptd/components build
corepack pnpm --filter @ptd/export typecheck
corepack pnpm --filter @ptd/export build
corepack pnpm --filter @ptd/react-designer typecheck
corepack pnpm --filter @ptd/react-designer build
corepack pnpm --filter web typecheck

corepack pnpm --filter @ptd/core test
corepack pnpm --filter @ptd/components test
corepack pnpm --filter @ptd/export test
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

## PostgreSQL 开发与测试安全

- 本地开发、CI 和集成测试都使用 PostgreSQL，不提供 SQLite 回退。
- Server 集成测试会清理指定数据库中的认证、模板与版本数据，只能指向明确隔离的测试库。
- `prisma migrate reset --force` 会破坏数据；未经明确确认不要对任何环境执行。
- 如果网络必须经过代理，只在本机 shell 或包管理器配置中设置代理，不要把个人代理地址或凭据写入仓库。

## 代码与文档边界

- `legacy/` 只读；v2 不从中 import 代码。
- `@ptd/core` 不依赖 React 或 NestJS。
- `@ptd/components` 只渲染 Core 已解析的内容，不持有数据源、运行时记录或连接凭据。
- `@ptd/react-designer` 是受控组件，持久化由 Host 决定。
- `apps/web` 通过同源 `/api` 使用 Server 认证、模板 CRUD、版本历史、恢复和冲突保护。
- `@ptd/export` 只依赖 Core/Components，负责派生页 IR、Page Master、明细表分页、输出 DOM 与资源就绪；
  不依赖 React、Nest 或 Playwright。
- `TemplateSchema.pages` 是手工页面；自动分页只生成预览/导出的 `OutputDocument`，不写回模板或 History。

更细的实现规则在 [`.trellis/spec/monorepo/`](./.trellis/spec/monorepo/index.md)。开始功能任务前，应按 [Trellis workflow](./.trellis/workflow.md) 创建或继续任务，并读取涉及层的规范。

## 提交前检查

- 只包含当前任务相关改动，保留用户已有的工作树修改。
- 新增公共 API 已从 package 根 `src/index.ts` 导出。
- 没有跨 package 的源码相对路径。
- 测试、类型检查、lint 和构建按改动风险完成。
- 文档中的命令、API、路径和成熟度与代码一致。
- `git diff --check` 无空白错误。
