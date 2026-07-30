# Web 部署指南

当前部署栈只交付独立 Web 设计器。`apps/server` 的模板/版本 API 已经实现，但还没有 Server 镜像、数据库持久化卷、迁移 Job 或 Web-to-API 配置，因此不包含在当前 Compose 中。

## 发布流程

```text
GitHub push / tag / 手工触发
              │
              ▼
前端 typecheck + tests + lint + build
              │
              ▼
Docker Buildx 发布 Web 镜像到 GHCR
              │
              ▼
服务器运行 deploy.sh / deploy.ps1
              │
              ▼
docker compose pull → up --no-build → /healthz
```

部署服务器不会编译仓库。运行时镜像由 Nginx 和 Vite 静态产物组成，因此服务器不需要 Node.js、pnpm 或 Buildx。

## 镜像与标签

默认镜像：

```text
ghcr.io/royians/print-template-designer-web
```

| Git 事件 | 发布标签 | 用途 |
| --- | --- | --- |
| 推送任意分支 | 规范化分支名、`sha-<full-sha>` | 分支预览与精确回滚 |
| 推送默认分支 | 分支名、SHA、`latest` | 常规部署 |
| 推送 `v*` Tag | Git Tag、SHA | 命名发布 |
| Pull Request | 不发布镜像 | 只执行质量检查 |
| 手工运行 workflow | 当前分支、SHA | 重建或预览 |

分支名由 Docker Metadata Action 规范化，例如 `feature/refc` 会发布为 `feature-refc`。预览未合并分支时使用对应分支标签，不要误用 `latest`。

## 服务器要求

- 推荐 Linux；Windows Server 需要 PowerShell 7+。
- Docker Engine 与 Docker Compose v2（`docker compose version`）。
- 能访问 `ghcr.io`。
- Git，仅用于拉取 Compose 和部署脚本。

不需要在服务器安装 Node.js、pnpm、编译器或本地 Docker Buildx。

## Linux 首次部署

先将目标分支推送到 GitHub，并等待 `Frontend CI & GHCR` workflow 成功：

```bash
git clone https://github.com/ROYIANS/print-template-designer.git
cd print-template-designer
chmod +x deploy.sh
./deploy.sh
```

第一次运行会把 `.env.example` 复制为 `.env`。默认地址：

```text
http://<server-ip>:8080
```

预览某个分支时，克隆该分支并在首次运行指定其规范化镜像标签：

```bash
git clone --branch <branch> --single-branch https://github.com/ROYIANS/print-template-designer.git
cd print-template-designer
IMAGE_TAG=<normalized-branch-tag> ./deploy.sh
```

例如 `feature/refc` 对应：

```bash
IMAGE_TAG=feature-refc ./deploy.sh
```

也可以把选择保存在本机 `.env`：

```dotenv
WEB_PORT=8080
IMAGE_REPOSITORY=ghcr.io/royians/print-template-designer-web
IMAGE_TAG=feature-refc
```

脚本会拉取指定镜像、只重建 Web service，并等待容器的 `/healthz` 变为 healthy。

## Windows Server 首次部署

在 PowerShell 7 中运行：

```powershell
git clone https://github.com/ROYIANS/print-template-designer.git
Set-Location print-template-designer
.\deploy.ps1
```

`.env` 的键和部署行为与 Bash 版本一致。

## 私有 GHCR Package

GHCR package 初次发布时可能是 private。可以在 GitHub package 设置中改为 public，或使用仅有 `read:packages` 权限的 Token。

优先从服务器密钥系统或 shell 环境注入凭据：

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

脚本也会识别 `.env` 中的这两个键，但明文 Token 只适合权限受控的服务器。`.env` 已被 Git 忽略，仍然不要提交它。

## 更新

对于 `latest` 或分支标签这类可变标签：

```bash
git pull --ff-only
./deploy.sh
```

脚本始终先执行 `docker compose pull`，再用 `up --no-build` 重建容器。根 Compose 没有 `build:`，不会意外在服务器本地编译。

## 固定版本与回滚

正式环境或需要稳定复现的评审环境，应使用 workflow/GHCR 页面中的完整 SHA 标签：

```dotenv
IMAGE_TAG=sha-0123456789abcdef0123456789abcdef01234567
```

修改标签后重新执行部署脚本即可。回滚同理：换回已知可用的 SHA 标签，不需要 reset 服务器源码，也不需要重新构建。

## 运维命令

Linux / macOS / Git Bash：

```bash
./deploy.sh --status
./deploy.sh --logs
./deploy.sh --down
```

PowerShell 7：

```powershell
.\deploy.ps1 -Status
.\deploy.ps1 -Logs
.\deploy.ps1 -Down
```

必要时可直接使用 Compose：

```bash
docker compose ps
docker compose logs --tail=100 web
docker inspect ptd-web
```

## 反向代理与 TLS

公开网络部署时，建议在 8080 前放置 Caddy、Traefik 或已有 Nginx，并在那里终止 TLS。如果代理与容器位于同一主机，可在部署分支中把端口绑定改为：

```yaml
ports:
  - '127.0.0.1:${WEB_PORT:-8080}:80'
```

## 排障

### `manifest unknown`

指定的 `IMAGE_TAG` 尚未发布。确认 GitHub Actions 已成功，并确认分支中的 `/` 已转换为 `-`。

### 拉取 GHCR 时返回 `denied`

Package 是 private，或 Token 没有访问权。提供 `GHCR_USERNAME` 和带 `read:packages` 的 Token，或把 Package 改为 public。

### Container is unhealthy

运行 `./deploy.sh --logs` 或 `.\deploy.ps1 -Logs` 检查 Nginx 输出。健康检查失败或超时时，脚本也会打印最后 100 行日志。

### 8080 端口被占用

修改 `.env` 中的 `WEB_PORT` 后重新部署。例如 `WEB_PORT=8088` 会将站点暴露在 8088，不需要重建镜像。

## 当前限制与下一阶段

- workflow 仅发布 `linux/amd64`；ARM64 服务器需要先在 `.github/workflows/ci.yml` 增加 `linux/arm64`。
- GitHub Actions 才是实际容器构建环境。本地静态检查不能替代首次真实镜像构建。
- 当前 Nginx 只托管静态 Web 和 `/healthz`，没有 `/api` 反向代理。
- 完整前后端部署需要补充 Server 镜像、数据库/卷策略、migration 生命周期、环境密钥和 Web API 地址，再扩展 Compose；不能只把 `apps/server` 塞进现有容器。
