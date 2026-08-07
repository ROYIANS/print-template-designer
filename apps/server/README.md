# `apps/server`

NestJS 11 + Prisma 7 + PostgreSQL 的多用户模板服务。它通过 Better Auth GitHub OAuth Cookie 会话
保护模板 CRUD、不可变版本历史、历史恢复与乐观并发控制。
同一认证边界还提供受控 Headless Chromium PDF 输出；Server 重新校验并编译模板，不接受任意 HTML。

## 技术基线

- NestJS 11，ESM / NodeNext。
- Prisma `7.9.1` 与 `@prisma/adapter-pg`。
- PostgreSQL 是开发、测试和生产的唯一数据库；`DATABASE_URL` 必填。
- Better Auth 只启用 GitHub OAuth；浏览器使用 HttpOnly Cookie，不保存 Token。
- 本地可显式启用仅限 loopback 的固定开发身份；默认关闭，生产环境无法启用。
- 通过 GitHub OAuth 的账户可直接试用；`Template.ownerId` 隔离所有模板和版本操作。
- `PTD_ADMIN_EMAILS` 计算管理员身份，`PTD_DEMO_MODE` 控制公开落地页与访客数据恢复。
- 默认监听 `PORT=3000`。
- 复用 `@ptd/core` 的 `TemplateSchema`、运行时验证和序列化逻辑。
- `playwright-core` 与 Docker Playwright runtime 固定为同一版本；一个长期 Browser、每任务独立 Context。

完整工作区推荐 Node 22.12+。

## 首次运行

从仓库根执行：

```bash
corepack pnpm --filter server prisma:migrate:deploy
corepack pnpm --filter server start:dev
```

复制 `.env.example` 为 `.env`，并设置 PostgreSQL、GitHub OAuth App 与至少 32 字节随机 Secret。
开发环境 GitHub callback URL 为：

```text
http://localhost:3000/api/auth/callback/github
```

只调试本地 Web/Server 工作流时，可在 `apps/server/.env` 使用：

```dotenv
NODE_ENV=development
BETTER_AUTH_URL=http://localhost:3000
PTD_WEB_ORIGIN=http://localhost:5173
PTD_DEV_AUTH_BYPASS=true
```

该模式不要求 `BETTER_AUTH_SECRET`、`PTD_ADMIN_EMAILS` 或 GitHub Client 凭据。Server 会在
PostgreSQL 中幂等准备固定的 `PTD Local Developer` 用户，所有模板 API 仍使用该用户的真实
`ownerId` 外键。`BETTER_AUTH_URL` 与 `PTD_WEB_ORIGIN` 必须是 `localhost`、`127.0.0.1` 或
`[::1]` 的 HTTP(S) origin，且 `NODE_ENV=production` 时 Server 会拒绝启动。不要在公网、局域网
共享地址或生产配置中启用该开关；bypass 模式还会强制 Server 只监听 `BETTER_AUTH_URL` 的 loopback
主机。它不接受浏览器请求头或 Token 来选择身份。

本地 PostgreSQL 可用 `postgres:17-alpine` 容器启动；测试和 CI 也必须使用 PostgreSQL，不能回退到 SQLite。

验证服务：

```bash
curl http://localhost:3000/healthz
```

```json
{ "status": "ok" }
```

## HTTP API

| 方法     | 路径                                           | 成功语义                             |
| -------- | ---------------------------------------------- | ------------------------------------ |
| `GET`    | `/healthz`                                     | 服务健康状态                         |
| `*`      | `/api/auth/*`                                  | GitHub 模式的 OAuth/会话             |
| `GET`    | `/api/runtime`                                 | 匿名可读的演示模式与重置时间         |
| `GET`    | `/api/account/me`                              | 当前账户、`authMode` 与 `isAdmin`    |
| `GET`    | `/api/templates`                               | 按更新时间倒序返回模板摘要           |
| `POST`   | `/api/templates`                               | 创建模板及 version 1 快照            |
| `GET`    | `/api/templates/:id`                           | 读取当前模板及内容                   |
| `GET`    | `/api/templates/by-key/:key`                   | 按 owner 与 URL key 读取当前模板     |
| `PUT`    | `/api/templates/:id`                           | 校验当前版本后更新并追加快照         |
| `DELETE` | `/api/templates/:id`                           | 删除模板及级联历史                   |
| `GET`    | `/api/templates/:id/versions`                  | 按版本倒序返回历史摘要               |
| `GET`    | `/api/templates/:id/versions/:version`         | 读取指定不可变快照                   |
| `POST`   | `/api/templates/:id/versions/:version/restore` | 把快照内容写成一个新的当前版本       |
| `POST`   | `/api/output/pdf`                              | 从结构化模板和显式运行时数据生成 PDF |

### 生成 PDF

```http
POST /api/output/pdf
Content-Type: application/json
Accept: application/pdf
```

请求包含经 Core 深层校验的 `template`、受限 `renderContext` 和显式 `options.locale`、
`options.timeZone`、`options.now`；可以输出尚未保存的当前内存模板，不要求 template id，也不会保存模板、
业务数据或 PDF。成功响应为 `application/pdf`，`Content-Disposition` 使用清洗后的 UTF-8 文件名。

PDF 引擎使用 `@ptd/export` 生成显式派生页，再让 Chromium 只绘制固定页面。它不使用浏览器默认业务分页、
`window.print()`、`html2canvas` 或整页图片。默认并发 2、单任务截止 30 秒、PDF 上限 64 MiB；并发满时
立即返回可重试错误，不建立无界 Page 队列。

在生成 PDF 字节前，render bundle 会运行与 Web 预览相同的 `preflightOutputDocument()`。字体、组件、图片和两帧布局
就绪后测量普通/富文本文字溢出（`TEXT_OVERFLOW`，0.5px 容差），并检查资源阻断、空页与旋转页面 bounds。error
诊断映射为 `422`，warning 诊断随成功响应的内部结果保留；诊断只包含稳定 code、页码、组件 ID 和安全消息。

文本 frame 的 CSS 多列（1–6 栏、非负栏间距、`auto`/`balance` 填充）沿用 Web 的共享输出 bundle；Server
不实现独立的列布局。超过固定 frame 的最后一栏仍在 PDF 生成前以 `TEXT_OVERFLOW` 阻断。

本地需要显式提供 render bundle 和 Chromium：

```dotenv
PTD_OUTPUT_RENDER_URL=http://127.0.0.1:5173/output-render.html
PTD_CHROMIUM_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
PTD_OUTPUT_MAX_CONCURRENCY=2
PTD_OUTPUT_TIMEOUT_MS=30000
```

容器内 `PTD_OUTPUT_RENDER_URL=http://web/output-render.html`，浏览器只允许该精确 origin 的 document、
script、stylesheet 和 font，以及 `data:`/`blob:`。远程、私网、metadata、loopback 和其他 Compose
service 请求全部阻断；render page 不携带认证 Cookie、数据库配置或任意用户脚本。

### 创建模板

```http
POST /api/templates
Content-Type: application/json
```

```json
{
  "title": "出库交接单",
  "content": {
    "_version": 2,
    "pageConfig": {},
    "pages": [
      {
        "id": "page-1",
        "componentData": []
      }
    ],
    "data": {
      "version": 1,
      "fields": [],
      "sampleRecords": []
    }
  }
}
```

`title` 去除首尾空白后必须为 1–120 个字符。`content` 通过 `@ptd/core` 的单一
`TemplateSchema` 权威进行深层验证。Server 接受合法的 legacy v0/v1
`dataSource`/`dataSet` 输入以及 canonical v2 `data`，并在持久化边界统一写为 canonical v2；canonical
内容不能同时携带非空 legacy 数据，绑定、字段和示例记录无效时返回 400。连接配置、Token、Cookie 和
其他 Secret 不属于 `TemplateSchema`，也不会由模板 API 保存。

Nest JSON parser 与默认容器 Nginx 对完整请求体统一设置 **4 MiB** 上限。该值覆盖 title、页面、组件、
绑定、示例数据和请求信封；canonical `data.sampleRecords` 仍受 Core 更小的 **512 KiB** 数据上限约束。
如果公网入口前还有 CDN 或宿主机反向代理，其请求体上限也不能低于 4 MiB，否则请求会在到达 Foliq
之前被代理拒绝。

`GET /api/account/me` 保留既有账户字段，并额外返回服务端权威的
`authMode: "github" | "dev-bypass"` 与 `isAdmin`。Web 只能用这些字段展示部署状态，不能通过前端
环境变量、请求头或浏览器存储自行声明 bypass 或管理员。

### 演示模式

`PTD_DEMO_MODE` 只接受 `true`/`false`，默认关闭。开启时，非管理员访客在首次受保护访问、Server 启动
补偿和每日 00:00 UTC 定时任务中进入同一恢复服务。服务只替换该用户的 `Template` 与级联版本，并创建
一份确定性的电价预测示例；`User`、`Account`、`Session` 和管理员模板不删除。`DemoUserState` 的
`resetDate` 在同一事务中通过 PostgreSQL upsert 声明，保证同一 UTC 自然日幂等。

`PTD_ADMIN_EMAILS` 是可选的逗号分隔邮箱，服务端统一小写比较；为空代表没有管理员。匿名
`GET /api/runtime` 只返回 `demoMode` 与 `demoResetTime`，不会泄露管理员邮箱。

### 更新模板

```http
PUT /api/templates/1
Content-Type: application/json
```

```json
{
  "title": "出库交接单 · 修订",
  "content": {
    "_version": 2,
    "pageConfig": {},
    "pages": [
      {
        "id": "page-1",
        "componentData": []
      }
    ],
    "data": {
      "version": 1,
      "fields": []
    }
  },
  "expectedVersion": 1
}
```

服务仅在 `expectedVersion` 与数据库当前版本相等时写入；成功后版本自增并追加 `TemplateVersion`。

### 恢复历史

```http
POST /api/templates/1/versions/2/restore
Content-Type: application/json
```

```json
{
  "expectedVersion": 4
}
```

恢复不会改写或删除 version 2，而是复制其 title/content，创建 version 5 作为新的当前版本。

## 错误语义

| HTTP 状态                  | 场景                                                             |
| -------------------------- | ---------------------------------------------------------------- |
| `400 Bad Request`          | 非法 ID、请求体、标题、Schema 外形或 `expectedVersion`           |
| `401 Unauthorized`         | 未登录                                                           |
| `404 Not Found`            | 模板、指定历史版本不存在，或资源属于其他用户                     |
| `409 Conflict`             | `expectedVersion` 已过期，或并发写入抢先完成                     |
| `422 Unprocessable Entity` | fatal 输出诊断，如文字溢出、组件越界、超高行、页数上限或受阻资源 |
| `429 Too Many Requests`    | Chromium 并发池已满，可稍后重试                                  |
| `503 Service Unavailable`  | Chromium 无法启动或崩溃后重建失败                                |
| `504 Gateway Timeout`      | 输出任务超过应用级截止时间                                       |

创建、更新和恢复通过事务保持当前模板与版本快照一致。`TemplateVersion` 只追加，不原地更新。

## 数据库与 Prisma

```bash
corepack pnpm --filter server prisma:validate
corepack pnpm --filter server prisma:generate
corepack pnpm --filter server prisma:migrate:deploy
```

Schema 位于 `prisma/schema.prisma`，已提交的 migration 位于 `prisma/migrations/`。生成的 Client 位于 `src/generated/prisma/` 且不入库。

当前 datasource 明确使用 PostgreSQL。migration 是面向全新数据库的基线，不包含 SQLite 数据搬迁或
匿名模板 owner 回填。

## 验证

```bash
corepack pnpm --filter server prisma:validate
corepack pnpm --filter server typecheck
corepack pnpm --filter server test
corepack pnpm --filter server build
```

测试必须显式提供一个隔离的 PostgreSQL `DATABASE_URL`。测试会先部署已提交的 migration、生成 Client，
再运行 Nest HTTP 集成测试；集成用例会清理该数据库中的认证、模板和版本数据，因此不能指向共享或生产数据库。

## 当前不包含

- 邮箱登录、邀请管理后台和持久化角色权限系统。
- Server CORS 配置；当前 Web 开发环境通过 Vite `/api` 同源代理访问 Server。
- 静态资源上传与管理。
- 数据源代理。
- Word、批量输出与复杂长文本分页。
- 自动备份上传、数据库高可用和容器编排平台配置。

这些能力需要单独设计，不属于现有 API 的隐含保证。架构约束见 [Server Architecture](../../.trellis/spec/monorepo/server-architecture.md)。

## 容器部署

根 `docker-compose.yml` 使用 PostgreSQL 17 named volume、一次性 `migrate` 服务和 Server 健康检查。
Server 不直接暴露宿主机端口，由 Web Nginx 通过 Compose 网络代理同源 `/api/*`。部署与 GitHub OAuth
callback、升级、回滚、fresh 清库和备份说明见 [DEPLOYMENT.md](../../DEPLOYMENT.md)。
