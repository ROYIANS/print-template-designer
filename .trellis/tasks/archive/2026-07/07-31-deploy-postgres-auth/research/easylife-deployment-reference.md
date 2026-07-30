# easylife-os 部署参考结论

## 可复用模式

- 默认从 GHCR 拉取预构建镜像，部署机不依赖 Node/pnpm；同时保留显式本地 build 模式。
- Compose 用 PostgreSQL named volume 保留数据，通过 healthcheck 控制 API 启动顺序。
- Bash/PowerShell 提供 fresh、down、logs、build 等对称操作。
- `.env.example` 集中描述 PostgreSQL、Better Auth、GitHub OAuth、端口和镜像标签。
- Web Nginx 与 API 位于同一 Compose 网络，浏览器使用同源 `/api`。

## PTD 需要加强的部分

- 参考脚本在复制 `.env.example` 后继续启动，可能把占位密码和 Secret 带入公网；PTD 首次复制后应停止并要求修改。
- 参考 fresh 操作直接删除 volume；PTD 应要求交互确认或显式 `--yes`。
- 参考脚本只按 Compose 输出中是否存在 `starting` 判断完成，可能漏掉缺失/退出服务；PTD 应逐个检查 postgres、migration、server、web。
- PTD 使用 Prisma committed migrations，应增加一次性 migration service，而不是让每个 Server 副本自行迁移。
- PTD 的 Better Auth URL、Web origin 和反向代理 header 必须保持一致，否则 GitHub callback 与 Secure Cookie 会出错。
- PostgreSQL 密码被拼入 URL 时必须限制为 URL-safe 值，或引入编码机制；首版选择部署脚本显式校验。

## PTD 当前差距

- 根 Compose 只有 Web。
- Nginx 没有 `/api` proxy。
- CI 只发布 Web 镜像。
- Server Dockerfile 使用浮动 pnpm、Node 20，并未正确包含 workspace `@ptd/core` 和 production migration CLI。
- 根 README、Web README、Server README 和 DEPLOYMENT 仍描述 Web-only 或 SQLite 旧状态。
