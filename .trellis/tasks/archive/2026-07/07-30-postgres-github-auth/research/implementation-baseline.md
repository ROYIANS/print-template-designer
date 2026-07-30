# PostgreSQL + Better Auth 实现基线

## 当前 PTD Server

- NestJS 11、Prisma 7.9.1、ESM/NodeNext。
- Prisma 使用 `prisma-client` generator 和显式 `src/generated/prisma` 输出。
- 当前 adapter 为 `@prisma/adapter-better-sqlite3`，URL 默认 `file:./dev.db`。
- 只有 `Template` / `TemplateVersion`，全部 API 匿名，查询没有 owner 维度。
- 测试通过 SQLite 文件 + committed migration 运行；CI 尚未执行 Server 质量门禁。
- Web 当前仅渲染本地内存 Designer，没有 API client、登录或路由。

## Prisma 7 PostgreSQL 约束

根据 Prisma database setup 指南：

- datasource provider 使用 `postgresql`，URL 保持在 `prisma.config.ts`。
- Node PostgreSQL driver 使用 `@prisma/adapter-pg` + `pg`。
- `new PrismaPg({ connectionString })` 传入单一 Prisma Client。
- 每次 schema 修改后显式执行 `prisma generate`。
- 每个进程只创建一个 Prisma Client/连接池。

PTD 已使用正确的 `prisma-client` generator，不需要改回旧的 `prisma-client-js`。

## `easylife-os` 可复用模式

参考 `/Users/xiaomengdao/WebstormProjects/easylife-os/apps/api`：

- `createAuth(prisma)` 通过 `betterAuth` + `prismaAdapter(..., { provider: 'postgresql' })`
  复用 Nest PrismaService。
- Better Auth handler 在 Express JSON body parser 之前通过 `toNodeHandler` 挂载。
- Guard 使用 `fromNodeHeaders(request.headers)` 和 `auth.api.getSession()` 解析 Cookie 会话。
- Web 使用 `createAuthClient`；会话由 Cookie 管理，不手动保存 Token。
- GitHub provider 从服务端环境变量读取 client ID/secret。

PTD 不复制参考项目的 emailOTP、SMTP、Passkey、ALTCHA、超级管理员或领域用户字段。

## PTD 特有实现要求

- `PTD_ALLOWED_EMAILS` 解析为规范化 Set，Server 启动 fail closed。
- Better Auth 用户创建边界拒绝非 Allowlist 邮箱；业务 Guard 每次请求再次判断，以支持立即撤权。
- `Template.ownerId` 永远来自会话，不能来自 HTTP body。
- 所有 template/version 查询在数据库层收窄 owner；不能先读全局记录再由 Controller 过滤。
- 跨 owner 统一 404；未认证统一 401。
- SQLite migration 不转换为 PostgreSQL DDL；因为没有业务数据，删除旧基线并生成全新 PostgreSQL init migration。

## 测试与 CI

- 本地和 CI 都使用真实 PostgreSQL，而不是测试回退到 SQLite。
- CI 添加 PostgreSQL service、健康检查和隔离测试数据库 URL。
- migration deploy 在全新数据库执行；集成测试清理数据但不依赖 `db push`。
- 必测：Allowlist parser、缺失环境 fail closed、无会话 401、Allowlist 撤权、两用户资源隔离、乐观并发和版本恢复。

## 暂不进入本任务

- 完整公网 Docker/Compose 发布链。
- 模板浏览器和 DesignerHost Save/Open。
- 数据库邀请表或管理 UI。
