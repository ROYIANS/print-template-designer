# 前端容器化部署闭环

## 背景

当前项目需要先快速验证服务器端的真实 UI 效果。后端尚未进入本次部署范围，现有 Docker Compose 会在服务器本地构建 Web 与 Server，旧 GitHub Actions 仍面向 Vue 时代的 GitHub Pages，均不符合当前交付方式。

## 目标

建立一个只包含前端的可重复部署闭环：

1. GitHub Actions 校验前端并构建 Docker 镜像。
2. 镜像发布到 GHCR，不依赖服务器本地 Node.js、pnpm 或源码构建。
3. 服务器克隆仓库后运行一个脚本即可拉取镜像并启动服务。
4. Linux/macOS/Git Bash 与 PowerShell 7 均提供等价脚本。
5. 支持健康检查、查看状态/日志、停止服务以及按不可变 SHA 标签回滚。

## 交付范围

- `apps/web` 及其前端 workspace 依赖的多阶段 Docker 镜像。
- Nginx 静态托管、SPA fallback、缓存策略与 `/healthz` 健康端点。
- 仓库根目录、仅引用 GHCR 镜像的 `docker-compose.yml`。
- `deploy.sh` 与 `deploy.ps1` 一键部署脚本。
- `.env.example`、`.dockerignore` 和完整部署文档。
- GitHub Actions 前端质量检查与 GHCR 发布。

## 不在范围内

- `apps/server`、数据库、鉴权、API 反向代理与服务端持久化。
- 在部署服务器上构建镜像。
- TLS 证书或特定云厂商反向代理的自动配置。
- 自动推送代码或修改 GHCR package 可见性。

## 验收标准

- Compose 的 Web 服务包含 `image:`，且不存在 `build:`。
- 两个部署脚本的默认路径只执行 `docker compose pull` 和 `up --no-build`。
- 默认部署地址为 `http://<server>:8080`，端口可由 `.env` 调整。
- GHCR 私有镜像可通过 `GHCR_USERNAME` 与 `GHCR_TOKEN` 登录拉取。
- CI 在 PR 上只校验；分支 push、tag push 与手动触发时发布 branch/tag 与 SHA 标签；默认分支额外发布 `latest`。
- 前端 typecheck、test、lint、build 均通过后才允许发布镜像。
- 镜像运行时只包含 Nginx 与静态产物，不包含 Node.js 开发工具链。
- 文档明确首次部署、更新、固定版本、回滚、私有包登录和排障方式。

## 已知验证边界

当前开发机未安装 Docker，因此本地只能完成脚本/YAML 静态校验与前端真实构建。镜像构建、容器启动和健康检查必须由 GitHub Actions 首次运行及目标服务器部署完成真实验证。
