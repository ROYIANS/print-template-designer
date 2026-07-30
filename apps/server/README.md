# `apps/server`

NestJS 11 + Prisma 7 + SQLite 的模板持久化服务。它提供模板 CRUD、不可变版本历史、历史恢复和基于 `expectedVersion` 的乐观并发控制。

## 技术基线

- NestJS 11，ESM / NodeNext。
- Prisma `7.9.1` 与 `@prisma/adapter-better-sqlite3`。
- 默认 SQLite；连接地址由 `DATABASE_URL` 提供。
- 默认监听 `PORT=3000`。
- 复用 `@ptd/core` 的 `TemplateSchema` 和序列化逻辑。

完整工作区推荐 Node 22.12+。Windows + Node 20 的原生依赖问题见 [开发指南](../../DEVELOPMENT.md#windowsbetter-sqlite3-安装失败)。

## 首次运行

从仓库根执行：

```bash
corepack pnpm --filter server prisma:migrate:deploy
corepack pnpm --filter server start:dev
```

默认配置等价于：

```dotenv
DATABASE_URL=file:./dev.db
PORT=3000
```

验证服务：

```bash
curl http://localhost:3000/healthz
```

```json
{ "status": "ok" }
```

## HTTP API

| 方法 | 路径 | 成功语义 |
| --- | --- | --- |
| `GET` | `/healthz` | 服务健康状态 |
| `GET` | `/api/templates` | 按更新时间倒序返回模板摘要 |
| `POST` | `/api/templates` | 创建模板及 version 1 快照 |
| `GET` | `/api/templates/:id` | 读取当前模板及内容 |
| `PUT` | `/api/templates/:id` | 校验当前版本后更新并追加快照 |
| `DELETE` | `/api/templates/:id` | 删除模板及级联历史 |
| `GET` | `/api/templates/:id/versions` | 按版本倒序返回历史摘要 |
| `GET` | `/api/templates/:id/versions/:version` | 读取指定不可变快照 |
| `POST` | `/api/templates/:id/versions/:version/restore` | 把快照内容写成一个新的当前版本 |

### 创建模板

```http
POST /api/templates
Content-Type: application/json
```

```json
{
  "title": "出库交接单",
  "content": {
    "_version": 1,
    "pageConfig": {},
    "pages": [
      {
        "id": "page-1",
        "componentData": []
      }
    ],
    "dataSource": [],
    "dataSet": {}
  }
}
```

`title` 去除首尾空白后必须为 1–120 个字符。`content` 必须包含有限数值 `_version`、对象 `pageConfig`、至少一个页面、数组 `dataSource` 和对象 `dataSet`。

### 更新模板

```http
PUT /api/templates/1
Content-Type: application/json
```

```json
{
  "title": "出库交接单 · 修订",
  "content": {
    "_version": 1,
    "pageConfig": {},
    "pages": [
      {
        "id": "page-1",
        "componentData": []
      }
    ],
    "dataSource": [],
    "dataSet": {}
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

| HTTP 状态 | 场景 |
| --- | --- |
| `400 Bad Request` | 非法 ID、请求体、标题、Schema 外形或 `expectedVersion` |
| `404 Not Found` | 模板或指定历史版本不存在 |
| `409 Conflict` | `expectedVersion` 已过期，或并发写入抢先完成 |

创建、更新和恢复通过事务保持当前模板与版本快照一致。`TemplateVersion` 只追加，不原地更新。

## 数据库与 Prisma

```bash
corepack pnpm --filter server prisma:validate
corepack pnpm --filter server prisma:generate
corepack pnpm --filter server prisma:migrate:deploy
```

Schema 位于 `prisma/schema.prisma`，已提交的 migration 位于 `prisma/migrations/`。生成的 Client 位于 `src/generated/prisma/` 且不入库。

当前 datasource 明确使用 SQLite。切换到 PostgreSQL 不只是改一行 provider：还需要选择并配置对应 driver adapter、连接 URL、迁移历史、运行依赖和部署策略。

## 验证

```bash
corepack pnpm --filter server prisma:validate
corepack pnpm --filter server typecheck
corepack pnpm --filter server test
corepack pnpm --filter server build
```

测试会使用独立的 `file:./test.db`，应用 migration、生成 Client，再运行 Nest HTTP 集成测试。

## 当前不包含

- 身份认证与授权。
- CORS 配置或 Web 开发代理。
- 静态资源上传与管理。
- 数据源代理。
- PDF/打印/Word 导出。
- Server Docker 镜像、数据库卷和完整 Compose 部署。

这些能力需要单独设计，不属于现有 API 的隐含保证。架构约束见 [Server Architecture](../../.trellis/spec/monorepo/server-architecture.md)。
