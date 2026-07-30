# 同步 v2 项目文档

## 背景

项目在 2026-07-29 集中完成了专业编辑器交互、多页面管理、组件目录、NestJS/Prisma 模板 API 和前端 GHCR 部署。现有公开文档仍混合 v1、早期 v2 规划和未实现 API，已经无法准确解释当前代码。

## 目标

以当前 `feature/refc` 代码为唯一事实来源，建立一套可供使用者、贡献者和后续开发任务共同使用的文档：

1. 参考历史中的成熟 Legacy README，重写中文为主的根 README。
2. 明确 v2 的产品定位、已实现能力、架构、快速开始、嵌入方式、Server API、部署边界和路线图。
3. 更新 CHANGELOG，使 v2 当前进展与保留的 v1 历史清晰分层。
4. 更新前端-only GHCR 部署说明，承认 Server 已实现但尚未进入完整部署栈。
5. 新增开发指南以及各 package/app 的就近 README，准确描述公共 API 和成熟度。
6. 同步仍具权威性的 `.trellis/spec/monorepo/` 索引与约定。

## 文档边界

### 本任务更新

- 根 `README.md`、`CHANGELOG.md`、`DEPLOYMENT.md`。
- 新增 `DEVELOPMENT.md`。
- `packages/*` 与 `apps/*` 的当前模块 README。
- `.trellis/spec/monorepo/` 中与目录、包、质量和索引有关的事实说明。

### 本任务不重写

- `legacy/`：只读历史实现，旧 README 从 Git 历史读取作为参考。
- `.trellis/tasks/archive/`：已经完成任务的历史验收记录。
- `.trellis/workspace/`：开发 journal。
- `.claude/`、`.cursor/` 和 `.trellis/workflow.md`：Trellis 平台/流程文件。
- `.trellis/spec/frontend/`：已明确标为 Vue 2 Legacy，仅保留历史参考。

## 事实约束

- v2 packages 当前没有发布到 npm，不得给出虚假的 registry 安装命令。
- `@ptd/export` 当前是空导出脚手架，不得声称 PDF/Word 已实现。
- `DesignerProps` 当前只有 `value`、`onChange`、`onSave`、`onLoad`。
- Web App 当前使用本地 React state，尚未连接 Server。
- Server 已有模板 CRUD、不可变版本快照、恢复和乐观并发控制，但没有认证、上传、导出或数据源代理。
- Docker/GHCR 当前只发布静态 Web 前端，Server 不在 Compose 中。
- 手工设计页已实现；数据溢出产生的自动分页仍属数据预览/导出阶段。
- Node 22.12+ 是完整工作区推荐开发基线；Node 20 在 Windows 安装 `better-sqlite3` 时可能需要本地 C++ 工具链。

## 验收标准

- README 不包含不存在的 API、能力、预览链接或发布声明。
- README 能让新贡献者理解“可嵌入包 + Web 宿主 + Server”的双重产品形态。
- 所有命令使用 `corepack pnpm`，并说明 pnpm 10.15.1 与 Node 22 推荐值。
- 包和应用 README 的 API/脚本与对应 `package.json`、`src/index.ts` 和 Controller 一致。
- CHANGELOG 将 v2 Unreleased 与 Legacy v1 历史分开。
- DEPLOYMENT 明确前端-only，而不是声称后端合同尚不存在。
- 相对 Markdown 链接和引用路径都能解析到受版本控制的文件。
- 文档格式、JSONL 上下文、Trellis validate 和 `git diff --check` 通过。
