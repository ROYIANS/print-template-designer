# PostgreSQL 与 GitHub OAuth 认证授权

## 背景

PTD 的 Designer Host 合同已经完成，但 `apps/server` 仍使用 SQLite，模板 CRUD 和版本历史全部匿名开放；
`apps/web` 也只有一个本地内存模板，没有登录和会话边界。这样的状态不能直接部署到公网。

本任务建立首次可公开连接 Server 的最小安全闭环：全新 PostgreSQL 数据库、Better Auth GitHub OAuth、
服务端 Allowlist、Cookie 会话、Nest Guard，以及按 `Template.ownerId` 隔离的模板与版本 API。

项目仍处于全新开发阶段，没有需要保留的 SQLite 业务数据。因此 PostgreSQL 使用全新的 migration 基线，
不开发 SQLite 数据搬迁、匿名模板回填或双 provider 兼容层。

## 已确认决策

- 开发、测试和生产统一使用 PostgreSQL 语义，不保留 SQLite/PostgreSQL 双轨。
- 首版只允许 GitHub OAuth；不实现邮箱密码、邮箱 OTP、SMTP、Passkey、ALTCHA 或验证码 UI。
- 账户采用 Allowlist/邀请制，不开放任意 GitHub 用户自助准入。
- Allowlist 由服务端环境变量 `PTD_ALLOWED_EMAILS` 提供，按逗号分隔、去空白并转小写精确匹配。
- Allowlist 为空或配置非法时应 fail closed，不能退化成开放注册。
- 保留完整多用户模型；`Template.ownerId` 必填，不采用单一 Owner 特例。
- GitHub 只证明身份；最终准入、会话和资源授权全部由 Server 强制执行。
- 从 Allowlist 移除邮箱后，即使旧 Cookie 会话仍未过期，业务 Guard 也必须立即拒绝。
- 认证、Cookie、User 和 HTTP 类型不进入 `@ptd/react-designer`。

## 目标架构

```text
Browser
  ├─ /api/auth/* ──► Better Auth GitHub OAuth ──► PostgreSQL
  └─ /api/*      ──► Nest AuthGuard ──► request.user
                                          │
                                          └─ TemplatesService(ownerId scoped)
```

浏览器只使用 Better Auth 管理的 HttpOnly Cookie，不在 `localStorage`、`sessionStorage` 或模板 Schema 中
保存 Token。优先通过同源 `/api` 反向代理部署；开发环境由 Vite 代理到 Nest Server。

## 范围

### 1. PostgreSQL 新基线

- 将 Prisma datasource 从 `sqlite` 改为 `postgresql`。
- 使用 Prisma 7 的 `@prisma/adapter-pg` + `pg`，并继续由单一 Nest `PrismaService` 管理连接池。
- `DATABASE_URL` 成为必填配置，不再回退到本地 `file:./dev.db`。
- 删除 SQLite adapter、`better-sqlite3`、数据库文件准备脚本和 SQLite 专属命令。
- 替换旧 SQLite migration 历史，创建一个面向空 PostgreSQL 数据库的新 migration 基线；不编写数据搬迁脚本。
- 提供明确的本地 PostgreSQL 开发/测试启动方式，并在 CI 使用真实 PostgreSQL service 验证 migration 与测试。

### 2. Better Auth 与环境边界

- 在 Server 中复用同一个 Prisma Client 创建 Better Auth Prisma adapter。
- 配置 `emailAndPassword.enabled = false`，只声明 GitHub social provider。
- 挂载 `/api/auth/*` handler，并确保其位于会消费原始请求体的 JSON parser 之前。
- 配置 `BETTER_AUTH_SECRET`、`BETTER_AUTH_URL`、`PTD_WEB_ORIGIN`、`GITHUB_CLIENT_ID`、
  `GITHUB_CLIENT_SECRET`、`PTD_ALLOWED_EMAILS`，启动时校验关键环境变量。
- 显式设置 trusted origins；公网反向代理场景只在受控拓扑下启用 `trust proxy`。
- GitHub OAuth callback URL 使用 Better Auth 的 `/api/auth/callback/github`，生产必须与 OAuth App 精确一致。
- 未获准的新邮箱不能创建可用账户；已存在但从 Allowlist 移除的用户不能继续访问当前用户或业务 API。

### 3. 数据模型

增加 Better Auth 基础模型：

- `User`
- `Session`
- `Account`
- `Verification`

`User.id` 使用 String/cuid；`Template` 保留现有自增 Int ID，并新增必填 `ownerId` 关联 User。
`TemplateVersion` 通过所属 Template 继承授权边界，不接受客户端 owner 字段。

### 4. Nest 会话与授权

- `AuthGuard` 使用 Better Auth `getSession` 验证请求 Cookie，并把最小 session user 注入请求上下文。
- Guard 每次请求重新校验规范化邮箱是否仍在 `PTD_ALLOWED_EMAILS` 中。
- 增加受保护的当前用户端点，供 Web 判断真实服务端会话/准入状态。
- `/healthz` 保持匿名；模板 CRUD、版本列表/详情和恢复全部受保护。
- 未登录返回 401；访问其他用户资源统一返回 404，避免枚举资源存在性。

### 5. 模板 owner 隔离

- 列表只查询当前 owner 的模板。
- 创建时由服务端写入当前 `user.id`，忽略且拒绝客户端伪造 owner。
- 当前模板读取、更新、删除、版本列表、版本详情和恢复都以 ownerId 作为数据库查询条件。
- 乐观并发更新继续保留 `expectedVersion`，条件更新同时包含 `id + ownerId + version`。
- 两个用户即使知道相同模板 ID，也不能读取、更新、删除或恢复对方资源。

### 6. 最小 Web 登录壳

- 使用 `better-auth/react` 创建客户端，只暴露 GitHub 登录、登出和会话能力，不加载邮箱/Passkey 插件。
- 未登录时显示明确的 GitHub 登录入口；登录完成后才渲染当前 Designer 壳。
- 未在 Allowlist 中时显示受控的“未获准访问”反馈，不把 Allowlist 内容打包到 Web。
- API 请求使用同源 `/api` 和 Cookie credentials；不手动注入 Bearer Token。
- 本任务不实现模板列表、真实 Save/Open Host 命令或版本历史 UI，它们继续由 Web App 集成任务负责。

## 非目标

- 邮箱登录、密码、OTP、SMTP、Passkey、ALTCHA。
- 邀请数据库表、邀请管理后台、管理员角色或开放注册。
- SQLite 数据导入、匿名数据认领、双数据库 provider 或兼容测试。
- 完整模板库、版本历史界面、Designer Host 的真实 Save/Open 接入。
- Server 镜像发布、生产 Compose 拓扑、备份恢复和域名证书自动化；这些在 Server 部署任务中完成。

## 安全与可观测性

- 生产必须使用 HTTPS；Cookie 使用 Better Auth 的安全默认并保持 HttpOnly，优先 Host-only。
- Secret 至少 32 字节随机值，任何 Secret、OAuth code、session token 都不得写日志或提交仓库。
- OAuth/准入失败返回受控语义；日志只记录事件类型和非敏感诊断。
- 同源部署优先；若未来 Web/API 分域，必须显式 CORS allow-origin 且允许 credentials，不能使用 `*`。

## 验收标准

- 新空 PostgreSQL 数据库可以只通过 committed migration 建立全部表和约束，Prisma validate/generate/deploy 通过。
- Server 不再安装或引用 SQLite adapter、`better-sqlite3`、`file:` 默认 URL 或 SQLite 准备脚本。
- Better Auth 只暴露 GitHub OAuth 登录方式；必填环境缺失时启动明确失败。
- 非 Allowlist GitHub 邮箱不能进入业务应用；Allowlist 移除后现有会话立即失去业务 API 访问权。
- 未认证模板请求返回 401；其他 owner 的模板与版本请求返回 404。
- 两用户隔离、创建归属、更新竞争、版本查询/恢复、删除和当前用户端点均有自动化测试。
- Web 能展示登录、登录中/失败、未获准和已登录 Designer 四类状态，并能登出。
- Core、Server 和 Web lint/typecheck/test/build 通过；CI 使用真实 PostgreSQL service，不依赖开发机残留数据库。
- Designer 公共类型和依赖中没有 Better Auth、Prisma、Cookie 或 User。

## 后续顺序

```text
07-30-postgres-github-auth（本任务）
          ↓
05-21-web-app（模板列表 + DesignerHost Save/Open + 版本 UI）
          ↓
Server 镜像与公网部署拓扑
```
