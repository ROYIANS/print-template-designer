# `apps/web`

React + Vite 的设计器 Host，也是 GHCR Web 镜像和完整自托管栈的浏览器入口。

## 当前行为

`src/App.tsx` 当前负责：

1. 通过 Better Auth 检查 GitHub Cookie 会话。
2. 调用受保护的 `/api/account/me` 确认服务端 Allowlist 准入。
3. 未登录、未获准或 Server 不可用时显示对应访问状态。
4. 获准后在本地 `useState` 中持有单页 A4 模板，并以 controlled 方式渲染 Designer。

登录已经依赖 `apps/server`，但模板内容仍未持久化：刷新页面会恢复空白页面，当前还没有模板列表、保存提示、版本历史或冲突处理。

## 本地运行

从仓库根运行：

```bash
corepack pnpm dev
```

根脚本会先构建 Web 所依赖的三个 workspace package，再启动它们的 watch 与 Vite。默认地址通常为 <http://localhost:5173>。

只做生产构建：

```bash
corepack pnpm --filter @ptd/core build
corepack pnpm --filter @ptd/components build
corepack pnpm --filter @ptd/react-designer build
corepack pnpm --filter web typecheck
corepack pnpm --filter web build
```

构建产物位于 `apps/web/dist/`，由 `docker/Dockerfile.web` 复制到 Nginx 镜像。

## 依赖边界

- Web 可以组合应用级路由、API client、身份与通知，但不应把这些职责塞进 `@ptd/react-designer`。
- 认证使用同源 `/api` 和 HttpOnly Cookie；不在浏览器存储 Token。
- Host 必须持有 `TemplateSchema`，并决定何时保存、载入和处理错误。
- Host 需要声明 React、React DOM 和 `@preact/signals-react`，因为 peer dependency 不会经 `@ptd/react-designer` 传递。
- 本 Host 已在 `src/main.tsx` 显式导入设计器样式；其他 consumer 同样必须导入 `@ptd/react-designer/styles.css`。

## 下一阶段

完整 Web App 集成应增加：

- 模板列表与新建/打开流程。
- 通过 `onSave` / `onLoad` 连接 Server。
- 保存状态、错误反馈和离开前未保存提示。
- `expectedVersion` 乐观并发与 `409 Conflict` 处理。
- 版本列表、历史快照查看与恢复。
- 模板业务 API client；开发和生产均已使用同源 `/api` 代理。

在这些流程落地之前，本目录应被描述为 **standalone designer host**，而不是完整前后端应用。
