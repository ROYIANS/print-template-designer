# 设计器应用命令与文档状态合同

## 状态

本任务是核心组件创作能力之后的后续任务。原规划名为“集成钩子
（onSave/onLoad/onExport/onDataSource）”，该回调清单已经不符合当前 v2 架构；本 PRD 以应用命令、
能力声明和文档状态重新定义边界。

## 背景

`@ptd/react-designer` 已经包含完整应用菜单和编辑器命令入口，但当前只有 `value`、`onChange`、
`onSave`、`onLoad` 四项 Props。菜单中的多数命令仍是 UI 占位，Host 也无法向设计器表达当前文档、
Dirty、Saving、Loading、Version 或某个应用命令是否可用。

简单增加 `onExport`、`onDataSource` 等独立回调会让公共 API 随菜单不断膨胀，也会把尚未设计的数据源
和导出业务过早固化。本任务建立一个可扩展但有类型的应用命令边界。

## 目标

1. 内部编辑命令复用 `EditorStore`，菜单、快捷键、工具条和上下文菜单不重复业务逻辑。
2. 应用级命令由 Host 实现，Designer 只表达意图和能力状态。
3. Host 能向 Designer 提供当前文档元数据和保存/加载状态。
4. 所有菜单项准确显示可用、禁用、执行中或规划中，不再统一点击后关闭假装执行。
5. 公共合同支持后续 Web/Server 集成，但不依赖 HTTP、NestJS、路由或数据库。

## 命令分层

### 编辑器内部命令

- Undo/Redo。
- Cut/Copy/Paste/Delete。
- Group/Ungroup、Lock/Unlock、Layer。
- Select/Hand/Drawing Tool。
- Ruler/Guide/Zoom/Workspace Panel。

这些命令由 EditorStore 或共享 Command Registry 实现。菜单只读取状态并调用同一命令。

### Host 应用命令

- New/Open/Save/Save As。
- Template Browser。
- Version History/Restore。
- Import/Export Template File。
- Preview/Print/Export Document（只有对应能力实现后才启用）。

Host 命令需要有类型的 ID、执行入口、可用状态和可选 Pending 状态。Designer 不直接发送网络请求。

## 文档状态

Host 至少可以传入：

- 文档 ID、标题和服务端版本等只读元数据；
- `clean | dirty | saving | loading | error | conflict` 状态；
- 当前应用能力集合；
- 应用命令 Handler；
- 离开/切换文档时是否需要确认由 Host 决定。

Designer 的 EditorStore 仍只持有当前 `TemplateSchema` 和编辑器 UI 状态，不持有 API Client 或服务端
Template Record。

## 交互要求

- `Ctrl/Cmd+S` 调用 Host Save，并尊重 Disabled/Pending。
- `Ctrl/Cmd+N`、`Ctrl/Cmd+O` 等应用快捷键只在 Host 声明能力时生效。
- 富文本/单元格编辑态优先处理其内部文本快捷键，不得触发对象或应用命令冲突。
- 执行命令后是否关闭菜单由命令语义决定；分类点击仍不执行命令。
- Pending 命令防重复触发；错误由 Host 状态/反馈渠道表达。
- 没有 Handler 的未来命令明确标注“规划中”并 Disabled。

## 非目标

- 实现 Web 模板列表、HTTP Client、版本历史页面和 409 冲突 UI。
- 实现数据源、打印、PDF 或 Word 业务能力。
- 在 Designer 中加入身份认证、路由、Toast 系统或 Server 类型。
- 将应用菜单整体迁出 Designer；是否提供隐藏 App Bar 的嵌入模式可在实现前评估。

## 身份与公网部署边界

公网 Web 连接 Server 前必须增加真实的身份认证与模板授权，但该能力不进入
`@ptd/react-designer`。Designer 只把 New/Open/Save 等意图交给 Host，不感知 Better Auth、Cookie、
HTTP 或当前用户。

认证采用独立 Web/Server 任务规划，参考
[`research/better-auth-public-deployment.md`](research/better-auth-public-deployment.md)：

- 在认证和用户数据进入系统前，先把 Server 从 SQLite 迁移到 PostgreSQL；
- Better Auth + Prisma adapter；
- GitHub OAuth App；
- 服务端环境变量 `PTD_ALLOWED_EMAILS` 准入名单；
- Cookie 会话与 Nest 服务端 Guard；
- `Template.ownerId` 及所有模板/版本路由的资源授权；
- HTTPS、可信 Origin、反向代理和登录/发码限流。

PostgreSQL 是已确认的目标数据库，开发、测试和生产统一使用同一 provider；不维护 SQLite 与 PostgreSQL
生产双轨。数据库迁移属于后续 Server/Auth 任务，不改变本任务的 Designer 公共合同范围。

Host 文档元数据可以包含服务端文档 ID、版本和所有权相关的只读结果，但不能接受或传递 Session Token。
认证失败、权限失败和版本冲突由 Host/API 层转换为文档状态或应用反馈，Designer 不自行刷新会话或重定向登录。

## 验收标准

- 所有现有应用菜单项被分类为真实内部命令、Host 命令或明确 Disabled 的规划命令。
- 已有 Undo/Redo、Clipboard、Group/Lock/Layer、Panel 和 Zoom 命令通过菜单与快捷键真实执行。
- Host 能提供文档标题、Dirty、Saving、Loading、Version 和 Conflict 等状态并在 Chrome 中准确呈现。
- Host Save/Open/New 等命令有稳定 TypeScript 合同；不需要每增加一个菜单项就增加一个顶层 Prop。
- Designer 不导入 Web/Server、HTTP Client、路由或数据库代码。
- 两个 Designer 实例的命令、状态和 Pending 不互相泄漏。
- 公共 API、README、`react-designer-contract.md` 和测试同步更新。

## 依赖关系

```text
07-30-core-authoring-capabilities
          ↓
05-21-integration-hooks（本任务）
          ↓
SQLite → PostgreSQL
          ↓
Better Auth + Server authorization（独立任务）
          ↓
05-21-web-app
```

本任务不应先于核心内容编辑会话完成，因为快捷键所有权、Dirty 语义和保存边界需要以真实的富文本与
表格编辑行为验证。

核心内容编辑会话现已完成。本任务完成后，Web 可以实现 Host 合同；但 Web 在公网连接真实 Server 前，
认证与资源授权任务必须先完成。

## 待确认

- 无。

## 已确认的公网账户策略

- 账户采用 Allowlist/邀请制，不开放任意 GitHub 用户自助注册。
- 首版 Allowlist 使用 Server 环境变量 `PTD_ALLOWED_EMAILS`，不开发邀请表或管理界面。
- 首版只实现 GitHub OAuth；邮箱 OTP、SMTP、验证码 UI 和 Passkey 明确延后。
- GitHub OAuth 只负责身份验证，最终准入由 Server 强制执行，不能只由登录页判断。
- 保留完整多用户模型，模板按 `ownerId` 隔离；不采用单一 Owner 特例数据结构。
- 当前为全新开发，不保留 SQLite 业务数据；PostgreSQL 使用新库和新 migration 基线，不开发数据搬迁工具。
