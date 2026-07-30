# 完整自托管部署栈

## 背景

PTD 已经具备 PostgreSQL、Better Auth GitHub OAuth、服务端 Allowlist 和模板 owner 隔离，但根部署入口仍只启动静态 Web 镜像。公网部署会出现 `/api` 无上游、没有数据库持久化、没有 migration 生命周期、Server 镜像未发布以及认证环境无法注入的问题。

本任务参考 `easylife-os` 的 Compose/部署脚本结构，把 PTD 从 Web-only 部署升级为可重复运行的完整自托管栈，同时保留预构建 GHCR 镜像作为默认发布路径。

## 目标

- Compose 管理 PostgreSQL 17、一次性 migration、Nest Server 和 Nginx Web。
- PostgreSQL 只在 Compose 内网暴露并使用 named volume 持久化。
- Web 通过同源 `/api` 反向代理 Server，适配 Better Auth HttpOnly Cookie 和 GitHub callback。
- Server 镜像包含 Prisma migration 所需运行时，并与 Web 镜像一同由 CI 发布到 GHCR。
- Bash 与 PowerShell 部署入口行为一致：校验环境、可选登录 GHCR、拉取或本地构建、启动、等待健康、查看状态/日志、停止。
- 重复部署保留数据库；清空数据库必须显式使用 fresh 模式并二次确认。
- 支持固定 SHA tag，以修改 `IMAGE_TAG` 的方式升级和回滚。

## 环境边界

- `.env.example` 只包含占位配置，不包含真实 Secret。
- 首次运行复制 `.env.example` 后停止，要求操作者修改占位的数据库密码、Better Auth Secret、Allowlist 和 GitHub OAuth 凭据。
- `POSTGRES_PASSWORD` 只允许 URL-safe 字符，避免 Compose 拼接 `DATABASE_URL` 时产生歧义。
- `BETTER_AUTH_SECRET` 至少 32 字符；`PTD_ALLOWED_EMAILS` 非空；`BETTER_AUTH_URL` 与 `PTD_WEB_ORIGIN` 必须是 HTTP(S) origin。
- 公网推荐使用 HTTPS 反向代理；OAuth callback 为 `${BETTER_AUTH_URL}/api/auth/callback/github`。

## 部署生命周期

1. 校验 Docker Compose v2 和 `.env`。
2. 可选使用最小 `read:packages` Token 登录 GHCR。
3. 默认拉取 Web/Server 预构建镜像；`--build`/`-Build` 可本地构建。
4. 启动 PostgreSQL，等待健康。
5. 运行一次性 `prisma migrate deploy` 服务并要求成功退出。
6. 启动 Server，等待 `/healthz`。
7. 启动 Web，等待 Nginx `/healthz`，由 Nginx 代理 `/api/*`。
8. 输出本地入口、OAuth callback 和运维命令。

## 验收标准

- `docker compose --env-file .env.example config` 通过，服务依赖与健康检查正确。
- Bash 通过 `bash -n`；PowerShell 通过 parser 检查。
- Dockerfile 使用仓库固定 pnpm 版本和 Node 22，Server clean build 包含 `@ptd/core`、Prisma Client、migration 与生产依赖。
- CI 对 Web 和 Server 两个镜像生成一致的 branch/tag/SHA 标签，并只在前后端质量任务都通过后发布。
- 默认部署不会删除 PostgreSQL volume；fresh 模式未经明确确认不会执行 `down -v`。
- 脚本不会打印数据库密码、OAuth Secret、Better Auth Secret 或 GHCR Token。
- README、DEPLOYMENT 和 package/server 文档不再描述 Web-only/SQLite 旧边界。

## 非目标

- 自动配置域名、DNS、证书或云厂商防火墙。
- 数据库自动备份到对象存储、跨主机高可用或自动恢复。
- Kubernetes、Swarm、Helm 或多副本滚动发布。
- 把用户提供的临时 PostgreSQL 连接串写入部署配置。
