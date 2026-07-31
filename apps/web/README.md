# `apps/web`

React + Vite 的设计器 Host，也是 GHCR Web 镜像和完整自托管栈的浏览器入口。

## 当前行为

`src/App.tsx` 当前负责：

1. `/` 始终展示公开的产品落地页和认证 CTA；已有 Session 不会被自动重定向。
2. `/app` 是受保护的文件工作台 Home，显示基于 Server `updatedAt` 的“最近更新”真实内容预览、全部
   模板高效列表、标题过滤和新建入口；`/app?new=blank` 才是未保存的新文档 Editor，
   `/app?template=<id>` 是已保存文档 Editor。
3. Web 直接调用 `/api/account/me`，以服务端返回的账户和 `authMode` 作为准入权威；不使用浏览器
   Token、伪造身份请求头或前端认证开关。
4. 生产环境保留 Better Auth GitHub 登录、退出、未获准、会话失效和服务不可用反馈。
5. Server 启用受限 Dev Auth Bypass 时，`/api/account/me` 返回 `authMode: 'dev-bypass'`，根页面 CTA
   显示“进入本地工作台”，直接访问 `/app` 无需 OAuth 跳转。
6. 获准后由 Web Document Controller 持有当前模板、服务器保存基线、文档 ID、版本和
   `clean | dirty | saving | loading | error | conflict` 状态，并以 controlled 方式渲染 Designer。
7. New、Open、Save、Save As、Template Browser 与 Version History 通过 `DesignerHost` 接入同源
   模板 API。Open 与 Template Browser 统一返回文件工作台；clean 文档不阻断，dirty/conflict 文档
   先显示未保存确认。
8. 第一次 Save 直接使用当前页面标题 POST，不弹命名框；后续保存携带 `expectedVersion`；Save As 使用
   非模态 Command Sheet。409 会停止保存并进入 Conflict，不会自动覆盖。
9. 首次保存、另存为和文件工作台打开会同步 canonical URL，刷新、前进与后退都会按地址恢复明确的
   Home、新建 Editor 或已保存 Editor 状态。
10. Home 与 Editor 复用真实账户 Popover；GitHub 身份可从显式菜单项退出，Dev Auth Bypass 只标识本地
    身份而不显示无效退出。最近区最多读取 4 份模板详情并在卸载时取消，全部列表不追加详情请求。
11. 文件卡片提供轻量操作 Popover：重命名会以 `expectedVersion` 创建新版本，创建副本会建立独立文档，
    永久删除必须经过明确的风险确认；普通成功与失败反馈不额外打断文件浏览。
12. File → Version History 打开非模态 Side Sheet，按需读取版本详情并使用真实 `TemplatePreview` 预览；
    恢复旧快照前明确确认，并把快照写成新的最新版本。恢复携带当前 `expectedVersion`，409 后停止恢复、
    保留历史浏览并要求重新打开服务器文档，不会静默覆盖。

`src/templateApi.ts` 覆盖模板 CRUD 和版本 list/get/restore 合同，负责 Cookie、AbortSignal、成功响应
运行时校验和结构化 HTTP/网络错误。`src/useDocumentController.ts` 负责文档状态机和请求竞态；Dirty
通过 `@ptd/core` 的规范化序列化与保存基线比较，因此 Undo 回已保存内容会准确恢复 Clean。

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
corepack pnpm --filter web test
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

当前持久化闭环之后的独立增强包括：

- 文件排序、服务端全文搜索、收藏、预设模板与真正的最近打开活动；当前只能准确使用 `updatedAt`
  表达“最近更新”。
- 409 Conflict 的服务器版本差异对比和更细的解决界面；当前已经保证不覆盖，并允许另存为或返回工作台
  重新打开服务器版本。
- 作为独立能力设计的本地崩溃恢复草稿与自动保存。
- 软删除与回收站；在 Server 仍使用不可恢复硬删除时不提供假的回收站入口。

Datasource、预览、打印、PDF/Word 与 Export 不属于 Web 模板持久化批次。
