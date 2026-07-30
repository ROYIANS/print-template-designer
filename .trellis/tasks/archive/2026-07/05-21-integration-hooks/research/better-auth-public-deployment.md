# Better Auth 与公网部署边界研究

## 结论

`05-21-integration-hooks` 继续只实现 `@ptd/react-designer` 与 Host 之间的应用命令、能力和文档状态合同。
Better Auth 不进入 Designer 包；公网身份认证、模板授权和部署安全应成为独立的 Web/Server 跨层任务，完成后再由
`05-21-web-app` 通过本任务的 Host 合同接入真实 Server。

数据库技术基线已确认使用 PostgreSQL。PTD 不保留 SQLite/PostgreSQL 生产双轨；应在引入 Better Auth 与
用户数据前先完成 SQLite → PostgreSQL 迁移，此时现有模型只有 `Template` 与 `TemplateVersion`，迁移成本和
数据风险最低。

登录页本身不能保护模板 API。PTD 公网部署的最小安全闭环是：

1. Better Auth 建立用户、账户和会话记录；
2. GitHub OAuth 提供首版唯一登录方式；
3. 浏览器只通过安全 Cookie 携带会话，不自行持有 Token；
4. Nest Guard 在服务端验证每次受保护请求的会话；
5. `PTD_ALLOWED_EMAILS` 在服务端限制准入用户；
6. `Template.ownerId` 把模板及其版本访问限制到当前用户；
7. 反向代理、HTTPS、可信 Origin 与 Cookie 策略共同构成部署边界。

## PTD 当前状态与已定迁移方向

- `apps/server` 是 NestJS 11 + Prisma 7.9.1 + SQLite。
- Prisma 目前只有 `Template` 与 `TemplateVersion`，没有 `User`、`Session`、`Account`、
  `Verification`，`Template` 也没有 `ownerId`。
- 模板 CRUD、版本查询与恢复全部匿名开放；任何能访问 Server 的客户端都能操作全部模板。
- Server 没有会话 Guard、CORS、限流与公开部署配置。
- 当前 Compose 只部署 Web；Server、SQLite 持久卷和反向代理路由还没有进入完整公网拓扑。

SQLite 仅代表当前实现状态，不再是目标生产架构。PostgreSQL 更适合模板保存与版本快照事务、Better Auth
会话/验证码写入、多用户并发、独立备份以及未来的多 Server 实例。开发、测试与生产统一以 PostgreSQL 为
数据库语义，避免维护两套 provider、migration 与测试行为。

因此不能依靠“Web 不展示接口”或“只有 Web 知道 Server 地址”作为安全措施；公网可达 API 必须在 Server
自身完成认证与资源授权。

## `easylife-os` 可复用模式

参考仓库：`/Users/xiaomengdao/WebstormProjects/easylife-os`。

### Server

- `createAuth(prisma)` 使用 `betterAuth` + `prismaAdapter`，并复用 Nest 的同一个 Prisma Client。
- `emailAndPassword.enabled = false`，不存储用户密码。
- `socialProviders.github` 使用 `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`。
- 参考项目还实现了 `emailOTP` 与 SMTP，但 PTD 首版不引入；可在确有非 GitHub 用户需求时作为后续任务。
- `trustedOrigins` 显式包含 API 与 Web 的真实 Origin。
- Nest 启动时在 JSON body parser 之前通过 `toNodeHandler(auth)` 挂载 `/api/auth/*`；其他业务路由再恢复
  JSON parser。
- `AuthGuard` 使用 `fromNodeHeaders(request.headers)` 和 `auth.api.getSession()` 验证 Cookie 会话，随后把
  session user 放到请求上下文。
- 参考实现还检查用户 `status`，可禁用已存在的账户。
- 参考项目的邮箱发码端点额外使用 ALTCHA proof-of-work。PTD 首版没有邮箱发码端点，因此不引入 SMTP、
  OTP UI 或 ALTCHA；未来恢复邮箱登录时，必须把限流和防邮件轰炸一起规划，不能只加一个表单。

### Web

- `createAuthClient` 提供登录和会话客户端；PTD 首版不加载 `emailOTPClient`。
- GitHub 流程为 `signIn.social({ provider: 'github', callbackURL })`。
- 应用 API Client 使用 `credentials: 'include'`，让浏览器携带 Better Auth 会话 Cookie。
- 路由保护读取服务端的当前用户接口；它不是只判断本地状态。

### 数据模型

参考实现的 Better Auth 基础模型为：

- `User`
- `Session`
- `Account`
- `Verification`

业务资源通过必填 `ownerId` 关联 `User`，Server 查询同时带当前用户 ID。PTD 应采用同一授权原则，而不是
只在返回结果之后由 Web 过滤。

## PTD 需要调整的部分

不能直接复制参考项目代码，但数据库方向可以与参考项目对齐：

- PTD 当前使用 SQLite 和 `@prisma/adapter-better-sqlite3`，必须先迁移为 PostgreSQL datasource、对应的
  Prisma 7 driver adapter、连接配置和全新 migration 基线，再引入 Better Auth 表。
- PTD 是 ESM / NodeNext Server；Better Auth handler、Express 类型和构建输出需要用本仓库配置验证。
- PTD 首版只需要 GitHub OAuth；邮箱 OTP、Passkey、领域用户字段、超级管理员后台和参考项目的 AI/内容
  模型均不应顺带引入。
- PTD 的模板 ID 当前为自增整数。增加 `ownerId` 后，所有读取、更新、删除、版本读取和恢复都必须同时校验
  当前用户；只保护顶层列表或创建接口是不完整的。
- 当前是全新开发，没有需要保留的 SQLite 业务数据。PostgreSQL 以新库和新 migration 基线启动，不编写
  SQLite → PostgreSQL 业务数据搬迁工具，也不需要为匿名模板设计临时 owner 回填逻辑。
- GitHub 返回的登录邮箱必须规范化后与 Allowlist 精确匹配。首版不提供邮箱 OTP，也不配置 SMTP。

## 会话与部署安全要求

- 会话凭证仅放在 Cookie，避免写入 `localStorage` / `sessionStorage`。
- 生产 Cookie 使用 `HttpOnly`、`Secure` 和合适的 `SameSite`；优先 Host-only Cookie，不设置宽泛
  `Domain`。
- 登录后全程 HTTPS；Nginx/代理正确传递 `X-Forwarded-*`，Nest 只在受控代理拓扑下启用
  `trust proxy`。
- Better Auth Secret 使用至少 32 字节随机值，不提交到仓库。
- OAuth App 的 callback URL 必须与真实公开 API Origin 精确匹配。
- Web/API 分域时显式维护 CORS 与 Better Auth trusted origins，并允许凭证；优先同源 `/api` 反向代理以
  减少 Cookie/CORS 复杂度。
- 健康检查可以匿名；模板 CRUD、版本、恢复和当前用户接口必须受保护。
- 未认证返回 `401`，已认证但无资源权限返回 `404` 或一致的受控语义，避免资源枚举。
- OAuth 回调异常和登录失败需要受控日志，但日志不得记录授权码、会话 Token 或 Secret。

## 任务拆分建议

```text
07-30-core-authoring-capabilities（已完成）
          ↓
05-21-integration-hooks（Designer ↔ Host 合同）
          ↓
SQLite → PostgreSQL（认证任务的前置阶段或独立任务）
          ↓
Better Auth + Server authorization（独立任务）
          ↓
05-21-web-app（登录路由、模板列表、真实 Host 命令与 API 接入）
```

认证可以与产品里程碑一起规划，但不应与 Designer 公共包放进同一个实现任务。这样既保持可复用包不依赖
HTTP/Nest/Prisma，也确保 Web 真正连接 Server 前已经有服务端安全边界。

## 账户准入方案

| 方案               | 优点                                         | 风险/成本                                                      | 适用性               |
| ------------------ | -------------------------------------------- | -------------------------------------------------------------- | -------------------- |
| 开放注册           | 无运营门槛，任何 GitHub/邮箱用户可用         | 公网用户可消耗存储和邮件额度；需要配额、滥用治理与完善运营能力 | 当前不推荐           |
| Allowlist / 邀请制 | 保留真实多用户模型，同时控制使用者与资源消耗 | 需要准入表或管理员配置，并定义未获准登录反馈                   | 推荐初始方案         |
| 单一 Owner/Admin   | 实现与运维最简单                             | 后续扩展多用户需要再迁移权限和数据                             | 仅确定长期自用时适合 |

账户准入已确认使用 Allowlist/邀请制。首版只允许 GitHub OAuth；服务端必须在 OAuth 建号/登录和受保护
业务请求的适当边界执行准入与账户状态检查。未获准身份不能通过直接调用 Better Auth 端点绕过 Web 登录页。

首版 Allowlist 由 `PTD_ALLOWED_EMAILS` 环境变量维护，按逗号分隔、去除空白并以小写邮箱精确匹配。
Allowlist 只在 Server 读取；不打包到 Web，也不依赖登录页隐藏未获准用户。移除某个邮箱后，Server Guard
应拒绝其现有会话继续访问业务 API，从而让环境配置具备实际撤权效果。

该策略保留完整多用户模型，每个模板通过 `ownerId` 隔离；同时避免开放注册带来的存储和自动建号滥用。
未来若改成数据库邀请表，只替换准入来源，不改变用户、会话和模板归属模型。

## 已确认决策

- 2026-07-30：目标数据库选择 PostgreSQL。
- 在 Better Auth、`User` 和 `Template.ownerId` 之前迁移数据库。
- 不维护 SQLite/PostgreSQL 生产双轨；本地、测试和生产按 PostgreSQL 统一验证。
- 2026-07-30：公网账户采用 Allowlist/邀请制，不开放自助注册，也不限制为单一 Owner。
- 2026-07-30：首版 Allowlist 由服务端环境变量 `PTD_ALLOWED_EMAILS` 维护。
- 2026-07-30：首版只实现 GitHub OAuth；邮箱 OTP、SMTP、验证码 UI 和 Passkey 延后。
- 2026-07-30：项目属于全新开发，现有 SQLite 无需保留；PostgreSQL 新库启动，不实现业务数据搬迁。
