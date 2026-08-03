# 完整自托管部署指南

Foliq 的默认 Compose 栈包含四个阶段：

```text
PostgreSQL 17（named volume）
          ↓ healthy
Prisma migrate deploy（一次性容器）
          ↓ exit 0
Nest Server（Better Auth + 模板 API + Chromium PDF）
          ↓ healthy
Nginx Web（静态应用 + 同源 /api 代理）
```

GitHub Actions 对 Web、Server 和容器执行质量检查，并将两个运行时镜像发布到 GHCR。正常部署服务器只需要 Git、Docker Engine 和 Docker Compose v2，不需要 Node.js、pnpm 或编译器。显式 `--build`/`-Build` 模式才会在服务器本地构建镜像。

Server runtime 基于固定 `mcr.microsoft.com/playwright:v1.62.0-noble`，与精确的
`playwright-core@1.62.0` 匹配，并固定安装 `fonts-noto-cjk=1:20230817+repack1-3`。镜像明显大于普通
Node slim，这是保留文字对象、固定 Chromium/字体和高保真 PDF 的预期成本。

## 首次部署

```bash
git clone https://github.com/ROYIANS/print-template-designer.git
cd print-template-designer
cp .env.example .env
```

必须先编辑 `.env`，替换所有 `CHANGE_ME`：

- `POSTGRES_PASSWORD`：至少 16 位，只使用字母、数字、`.`、`_`、`~`、`-`。Compose 会把它安全拼入内部 `DATABASE_URL`。
- `BETTER_AUTH_SECRET`：至少 32 字符，建议 `openssl rand -base64 32`。
- `BETTER_AUTH_URL`：浏览器实际访问的公开 origin，不包含路径。
- `PTD_WEB_ORIGIN`：通常与 `BETTER_AUTH_URL` 相同。
- `PTD_ALLOWED_EMAILS`：允许登录的 GitHub 邮箱，多个值用逗号分隔。
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`：GitHub OAuth App 凭据。
- `PTD_OUTPUT_MAX_CONCURRENCY` / `PTD_OUTPUT_TIMEOUT_MS`：PDF BrowserContext 并发与总截止时间；默认
  分别为 2 和 30000 ms，普通部署不建议盲目调大。

然后执行：

```bash
chmod +x deploy.sh
./deploy.sh
```

Windows Server 使用 PowerShell 7：

```powershell
Copy-Item .env.example .env
# 编辑 .env
.\deploy.ps1
```

如果直接使用默认端口，入口是 `http://<server-ip>:8080`。首次运行脚本若发现 `.env` 不存在，只会复制示例并停止，不会使用占位 Secret 启动服务。

## GitHub OAuth App

在 <https://github.com/settings/developers> 创建 OAuth App。生产示例：

```dotenv
BETTER_AUTH_URL=https://foliq.example.com
PTD_WEB_ORIGIN=https://foliq.example.com
```

对应配置：

```text
Homepage URL: https://foliq.example.com
Authorization callback URL: https://foliq.example.com/api/auth/callback/github
```

GitHub App callback、`BETTER_AUTH_URL` 和真实浏览器 origin 必须精确一致。Web 和 API 在容器内仍为不同服务，但 Nginx 将 `/api/*` 代理到 Server，所以浏览器看到的是同一个 origin，Better Auth Cookie 不需要暴露给其他域名。

## HTTPS 与反向代理

公网必须使用 HTTPS。推荐让 Caddy、Traefik 或宿主机 Nginx 终止 TLS，并把 `.env` 改为：

```dotenv
BIND_ADDRESS=127.0.0.1
WEB_PORT=8080
BETTER_AUTH_URL=https://foliq.example.com
PTD_WEB_ORIGIN=https://foliq.example.com
```

上游代理转发到 `http://127.0.0.1:8080`，并保留 `Host`、`X-Forwarded-For` 和 `X-Forwarded-Proto`。容器 Nginx 会继续把这些信息交给启用了受控 `trust proxy` 的 Nest Server。

模板 JSON 的完整请求体上限为 **4 MiB**，容器 Nginx 与 Nest Server 已保持一致。如果前面还有 Caddy、
Traefik、Cloudflare 或宿主机 Nginx，需要确认其请求体上限不低于 4 MiB；否则上游可能先返回 413，
请求不会到达 Foliq。示例数据本身仍受 Core 的 512 KiB 上限约束，4 MiB 还需要容纳页面、组件、绑定
和请求信封。

不要把 PostgreSQL 或 Server 端口直接开放到公网；默认 Compose 只发布 Web 端口。

## PDF 输出运行时

Compose 将 Server 的内部 render URL 固定为 `http://web/output-render.html`。该页面由同一个 Web build
生成，使用与浏览器打印预览相同的 `@ptd/export` compiler 和 DOM renderer。Chromium 不携带用户
Cookie 或数据库环境，只允许精确 render origin 的 document/script/stylesheet/font 以及
`data:`/`blob:`；远程、私网、metadata、其他 Compose service 和任意导航都会被阻断。

每个 PDF 请求使用独立 BrowserContext/Page，一个长期 Browser 由 Nest 生命周期管理。超时、客户端
取消和失败都会关闭 Context；Browser 断开后最多重建一次。Compose 不需要 `privileged`、`SYS_ADMIN`
或额外 sandbox capability。Nginx `/api` 的 60 秒读取超时高于 Server 默认 30 秒截止，为错误响应和
清理保留余量。

`/healthz` 仍是轻量应用存活检查，不会为每次探测启动 Chromium。部署后的 PDF smoke test 应通过真实
认证会话调用 `/api/output/pdf`，并至少验证：PDF 可打开、IR 页数等于实际页数、无空白尾页、中文 glyph
正确、表头/页码重复、文字不是整页 JPEG/PNG。容器内中文文本提取也应单独检查；仅看到 `/ToUnicode`
不能证明所有 CJK mapping 都正确。

## 镜像与标签

默认镜像：

```text
ghcr.io/royians/print-template-designer-web
ghcr.io/royians/print-template-designer-server
```

两个镜像由同一次 workflow 发布相同标签：

| Git 事件      | 标签                           | 用途                 |
| ------------- | ------------------------------ | -------------------- |
| 任意分支 push | 规范化分支名、`sha-<full-sha>` | 预览与精确版本       |
| 默认分支 push | 分支名、SHA、`latest`          | 常规部署             |
| `v*` tag      | Git tag、SHA                   | 命名发布             |
| Pull Request  | 不发布                         | 只运行质量和容器构建 |

生产推荐固定完整 SHA：

```dotenv
IMAGE_TAG=sha-0123456789abcdef0123456789abcdef01234567
```

修改 `IMAGE_TAG` 后重新执行部署脚本即可升级或回滚。数据库 migration 只能向前执行；回滚到不兼容旧 Schema 的应用镜像前，必须先评估 migration 兼容性和备份，而不是删除 volume。

## 私有 GHCR

如果 package 是 private，使用只有 `read:packages` 的 Token。优先通过 shell 或服务器 Secret Store 注入：

```bash
export GHCR_USERNAME=your-github-username
export GHCR_TOKEN=github_pat_xxx
./deploy.sh
```

PowerShell：

```powershell
$env:GHCR_USERNAME = 'your-github-username'
$env:GHCR_TOKEN = 'github_pat_xxx'
.\deploy.ps1
```

脚本不会打印 Token。也可以写入 gitignored `.env`，但应限制该文件的主机权限。

## 更新与本地构建

拉取预构建镜像并更新，数据库保留：

```bash
git pull --ff-only
./deploy.sh
```

本地构建当前源码：

```bash
./deploy.sh --build
```

PowerShell 对应 `.\deploy.ps1 -Build`。本地构建仍然使用与 CI 相同的 Dockerfile、Node 22 和 pnpm 10.15.1，不使用宿主机 Node_modules。

## 运维命令

```bash
./deploy.sh --status
./deploy.sh --logs
./deploy.sh --down
```

PowerShell：

```powershell
.\deploy.ps1 -Status
.\deploy.ps1 -Logs
.\deploy.ps1 -Down
```

`down` 只删除容器和网络，保留 `ptd-pgdata` named volume。再次部署会从原数据继续运行并重新检查 migration。

## Fresh 清库

Fresh 会永久删除全部账户、会话、模板和版本，只适合明确的测试环境重建：

```bash
./deploy.sh --fresh
# 必须输入 WIPE_PTD_DATA
```

自动化环境还必须额外传入确认参数：

```bash
./deploy.sh --fresh --yes
```

PowerShell 对应 `-Fresh` 和 `-Fresh -Yes`。不要把 fresh 当作 migration 失败的排障方式。

## 备份与恢复

当前栈不自动上传备份。升级前可手工创建 PostgreSQL custom-format dump：

```bash
docker compose exec -T postgres pg_dump \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --format=custom > ptd-$(date +%F-%H%M%S).dump
```

上面的变量需要先从 `.env` 导入当前 shell；也可以直接替换为实际数据库用户名和库名。恢复是破坏性操作，必须在独立环境演练，并确认目标库后再执行 `pg_restore`。

## 健康与排障

部署脚本逐个验证 PostgreSQL、migration、Server 和 Web。失败时会打印 `docker compose ps -a` 和最近 120 行日志。

常用诊断：

```bash
docker compose ps -a
docker compose logs --tail=120 postgres migrate server web
docker compose exec server node -e "fetch('http://127.0.0.1:3000/healthz').then(async r=>console.log(r.status, await r.text()))"
```

### `manifest unknown`

指定标签尚未发布，或 Web/Server 其中一个镜像缺少该标签。确认 `Frontend CI & GHCR` workflow 的两个矩阵发布任务都成功。

### GHCR `denied`

Package 是 private，或 Token 没有 `read:packages`。同时配置 `GHCR_USERNAME` 和 `GHCR_TOKEN`。

### Migration 失败

查看 `docker compose logs migrate postgres`。修复连接或 migration 后重新运行普通部署；不要先清空 volume。

### GitHub callback/cookie 错误

检查浏览器地址、`BETTER_AUTH_URL`、`PTD_WEB_ORIGIN`、OAuth App callback 和反向代理 `X-Forwarded-Proto` 是否一致。HTTPS 站点不能配置成 HTTP origin。

### 端口被占用

修改 `WEB_PORT`。如果宿主机反向代理与 Foliq 同机，优先使用 `BIND_ADDRESS=127.0.0.1`。

### PDF 返回 429 / 504 / 503

- `429`：当前 BrowserContext 并发已满；先检查是否有超大模板、慢资源或突发请求，不要直接无限加并发。
- `504`：任务超过 `PTD_OUTPUT_TIMEOUT_MS`；检查页数、表格行、字体和 render bundle，不要让上游代理先超时。
- `503`：Chromium 无法启动、崩溃后重建失败或请求已取消；查看 Server 日志和容器内 Playwright 版本。

容器构建若在字体安装阶段失败，确认 apt source 仍提供 Dockerfile 固定的 Noble 版本；不要无审查改为
不固定版本。`docker compose exec server fc-list | grep -i noto` 可检查 Noto CJK，实际 PDF 仍需渲染验收。

## 当前边界

- 镜像目前只发布 `linux/amd64`；ARM64 需要扩展 CI platforms。
- PostgreSQL 是单实例 named volume，不提供自动高可用、远程备份或灾难恢复。
- 部署脚本是单主机 Compose 运维入口，不是零停机滚动发布系统。
- Server Chromium 镜像与容器内 CJK PDF 需要在目标 `linux/amd64` Docker 环境做真实 smoke；只通过本地
  Windows Chrome 不能替代该验收。
