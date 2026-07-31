# `apps/web`

React + Vite 的设计器 Host，也是 GHCR Web 镜像和完整自托管栈的浏览器入口。

## 当前行为

`src/App.tsx` 当前负责：

1. `/` 始终展示公开的产品落地页和认证 CTA；已有 Session 不会被自动重定向。
2. `/app` 是受保护的全屏 Designer 工作台。
3. Web 直接调用 `/api/account/me`，以服务端返回的账户和 `authMode` 作为准入权威；不使用浏览器
   Token、伪造身份请求头或前端认证开关。
4. 生产环境保留 Better Auth GitHub 登录、退出、未获准、会话失效和服务不可用反馈。
5. Server 启用受限 Dev Auth Bypass 时，`/api/account/me` 返回 `authMode: 'dev-bypass'`，根页面 CTA
   显示“进入本地工作台”，直接访问 `/app` 无需 OAuth 跳转。
6. 获准后暂时仍在本地 `useState` 中持有单页 A4 模板，并以 controlled 方式渲染 Designer。

认证与公开产品入口已经接通，但模板内容仍未持久化：刷新页面会恢复空白页面，当前还没有模板列表、
保存提示、版本历史或冲突处理。

落地页中的产品画面来自真实 Designer 和真实 `TemplateSchema`。仅在 Vite DEV 模式下，
`/app?capture=product` 会跳过认证壳并渲染确定性的产品捕获文档；该入口不会进入生产构建的运行路径，
生成的截图资产位于 `public/assets/product/designer-proof-sheet.png`。

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
- 通过 `DesignerHost` 的 New、Open、Save、Save As、Template Browser 与 Version History 命令连接
  Web Document Controller 和 Server。
- 保存状态、错误反馈和离开前未保存提示。
- `expectedVersion` 乐观并发与 `409 Conflict` 处理。
- 版本列表、历史快照查看与恢复。
- 模板业务 API client；开发和生产均已使用同源 `/api` 代理。

在这些流程落地之前，本目录应被描述为 **standalone designer host**，而不是完整前后端应用。
