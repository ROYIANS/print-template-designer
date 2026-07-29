# 技术设计

## 发布流

```text
push / tag / workflow_dispatch
  -> frontend quality job
  -> Docker Buildx
  -> ghcr.io/<owner>/print-template-designer-web:<tag>
  -> server deploy script
  -> docker compose pull
  -> docker compose up --no-build
  -> Nginx /healthz
```

## 决策

- 镜像仓库随 GitHub owner 计算，并在工作流中转换为小写。
- 使用 Node 22 + 固定 pnpm 10.15.1 构建，运行层使用 Nginx 1.27 Alpine。
- Compose 位于仓库根目录，作为服务器部署入口；`docker/` 只保留镜像构建上下文和 Nginx 配置。
- Compose 不保留本地构建回退路径，避免服务器误触发耗时且不可复现的源码构建。
- `latest` 只对应 GitHub 默认分支；每次发布同时提供完整 commit SHA 标签用于审计与回滚。
- 功能分支也发布规范化 branch tag，便于当前 `feature/refc` 在合并前快速预览。
- 部署脚本不会 `source .env` 或执行其中的内容，仅解析已知键；Compose 自行读取 `.env`。
- 健康判断读取 Docker 容器的 health 状态，不以“容器进程已启动”代替应用可用。

## 验证记录

### 本地通过

- PowerShell 7 AST 解析：`deploy.ps1` 无语法错误。
- PyYAML BaseLoader：Compose 与 GitHub Actions YAML 结构/关键合同通过。
- Prettier：工作流、Compose、JSON、文档与任务文档通过。
- `git diff --check`：通过。
- Pull-only 合同：Compose 无 `build:`，两个脚本无本地构建命令。
- 前端 TypeScript：core、components、react-designer、web 全部通过。
- Vitest：core 23、components 30、react-designer 36，共 89 个测试通过。
- ESLint 9：前端四个工作区通过，`--max-warnings=0`。
- 生产构建：core、components、react-designer 与 Vite Web 顺序构建通过。

### 由 CI / 目标服务器完成

- 当前 Windows 开发机未安装 Docker，且 WindowsApps 的 Bash 占位符不可执行。
- CI quality job 已加入 `bash -n`、`docker compose config --quiet` 和 PowerShell AST 校验。
- CI publish job 将完成真实 Dockerfile Buildx 构建与 GHCR push。
- 目标服务器首次运行部署脚本将验证镜像拉取、Nginx 启动及 `/healthz` 容器健康状态。
