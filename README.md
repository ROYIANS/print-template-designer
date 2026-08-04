<div align="center">
  <img src="legacy/README.assets/favicon.ico" alt="Foliq" width="112" />
  <h1>Foliq</h1>
  <p><strong>面向打印与出版的专业结构化文档设计器</strong></p>
  <p>Framework-agnostic core · React designer · Versioned template API</p>
</div>

> [!IMPORTANT]
> 当前仓库正在进行 v2 重写。核心模型、渲染组件、React 编辑器、多页面管理、认证、文件工作台、
> 模板持久化与版本历史、Datasource v2，以及确定性打印预览/PDF vertical slice 已经落地；完整长文本
> 分页、复杂出版表格、Word、批量输出与外部数据连接器仍在建设。原 Vue 2 版本保存在
> [`legacy/`](./legacy/) 中，仅供参考。

## 项目定位

Foliq 不是一个只能独立运行的页面 Demo，也没有把技术路线限定为 Web Component。内部工程代号继续沿用 PTD；v2 将产品拆成三个可以独立演进的层次：

- **可嵌入的设计器内核**：Schema、单位换算、序列化、数据绑定和组件注册表不依赖 UI 框架。
- **专业 React 编辑器**：提供完整的画布工作区、组件目录、属性面板和编辑命令。
- **可演进的完整应用**：Vite Web Host 已接通 NestJS 模板服务，提供认证、文件工作台、版本历史、
  真实逐页打印预览与服务端 PDF；后续继续扩展长文档分页和外部数据连接器。

当前更准确的描述是：**已经形成文档设计、数据校样、版本化保存和确定性 PDF 输出闭环的专业 Web
应用，复杂打印出版能力仍在持续扩展**。

## 当前能力

### 设计器

- Canvas-first 工作区：工具坞、资源面板、上下文工具栏、属性面板、状态栏。
- 选择、多选、框选、拖动、缩放、旋转、锁定、组合与图层操作。
- 复制、剪切、定位粘贴、Undo/Redo、右键菜单和键盘命令。
- 真实标尺、悬停预览线、可固定和着色的参考线。
- 文本框、直线、矩形、椭圆、星形的画布拖拽绘制，以及 Hand Tool。
- 多页面新增、复制、删除和排序。
- JSON object / object array 导入、嵌套字段树、字段搜索、格式化、组件绑定、记录切换与实时数据校样。
- Host 可通过显式 `RenderContext` 注入临时运行时数据、locale、timeZone 与确定性的 `now`，不会默认写回模板。
- 宽屏、标准与紧凑三种响应式工作区布局。
- 文本、表格、图像、编码、图形五类组件目录，并区分可用组件与规划组件。

### 引擎与服务

- 框架无关的 `TemplateSchema`、canonical Datasource v2、页面配置、序列化、安全数据绑定和组件注册表。
- 原生 DOM 渲染组件：文本、表格、图像、二维码、条码和基础图形。
- NestJS + Prisma + PostgreSQL 多用户模板 API，支持开放 GitHub OAuth、owner 隔离、可选演示数据恢复、不可变版本快照、恢复和乐观并发控制。
- GitHub Actions 构建 Web/Server 镜像并发布到 GHCR；Compose 管理 PostgreSQL、migration、Server 和同源 Web 入口。
- `@ptd/export` 将模板编译为显式派生页，支持 Page Master、页码、明细表智能分页与续页重复表头。
- Web 提供与设计器同主题的多页打印预览；认证 Server 使用固定 Playwright Chromium 输出保留文字对象的 PDF。

### 成熟度边界

| 模块                  | 当前状态          | 说明                                                       |
| --------------------- | ----------------- | ---------------------------------------------------------- |
| `@ptd/core`           | 已实现            | Schema、单位、canonical v2、JSON 验证/推断、绑定与注册表   |
| `@ptd/components`     | 已实现            | 框架无关 DOM 渲染组件                                      |
| `@ptd/react-designer` | 已实现，持续打磨  | Controlled React 编辑器和专业画布交互                      |
| `apps/web`            | 应用闭环已实现    | 文件工作台、版本历史、数据校样、打印预览与 PDF 下载        |
| `apps/server`         | API 已实现        | 模板/版本 API 与受控 Chromium PDF 输出                     |
| `@ptd/export`         | v1 vertical slice | 派生页 IR、Page Master、明细表分页、DOM renderer/readiness |

## 架构

```text
apps/web (React + Vite) ───────────────┐
                                      ▼
                              @ptd/react-designer
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                  @ptd/components             @ptd/core
                         │                         ▲
                         └─────────────────────────┘

apps/server (NestJS + Prisma + PostgreSQL) ──── @ptd/core

apps/web ───────────┐
                    ├── @ptd/export ── @ptd/components ── @ptd/core
apps/server render ─┘
```

```text
packages/
  core/             框架无关的数据模型与引擎
  components/       原生 DOM 渲染组件
  react-designer/   React 专业编辑器
  export/           确定性派生页编译、分页与输出 DOM renderer
apps/
  web/              独立设计器 Host
  server/           模板持久化与版本 API
docker/             Web/Server 镜像与 Nginx 同源代理配置
legacy/             只读的 Vue 2 版本
```

更完整的代码边界见 [Monorepo 架构规范](./.trellis/spec/monorepo/index.md)。

## 快速开始

### 环境要求

- Node.js **22.12 或更高版本**（CI 与 Docker 使用 Node 22）。
- 通过 Corepack 使用仓库声明的 pnpm **11.18.0**。

虽然部分 package 的 `engines` 仍允许 Node 20，完整开发、CI 与容器环境统一使用 Node 22，以减少工具链和 Prisma 运行时差异。

### 启动 Web 设计器

```bash
corepack enable
corepack pnpm install
corepack pnpm dev
```

根 `dev` 命令会按依赖顺序构建 `core`、`components`、`export`、`react-designer`，再同时启动 package
watch 和 Vite。默认访问地址通常为 <http://localhost:5173>。

完成 Server 环境和 PostgreSQL migration 配置后，也可以从根目录一次启动完整联调环境：

```bash
corepack pnpm dev:all
```

`dev:all` 沿用相同的前端依赖预构建顺序，然后并行启动四个 package watcher、Web 和 Server。

### 启动模板服务

Web 的登录与账户检查依赖 Server。复制 `apps/server/.env.example` 并配置 PostgreSQL/GitHub OAuth 后，可单独启动 API：

```bash
corepack pnpm --filter server prisma:migrate:deploy
corepack pnpm --filter server dev
```

默认服务地址为 <http://localhost:3000>，健康检查为 `GET /healthz`。`DATABASE_URL` 必须指向 PostgreSQL；没有本地文件数据库回退。

更完整的环境、命令和原生依赖排障见 [DEVELOPMENT.md](./DEVELOPMENT.md)。

## 在 React Host 中使用

v2 packages 当前只在本仓库 workspace 中使用，**尚未发布到 npm**。下面展示真实的受控组件 API，而不是 npm 安装说明：

```tsx
import { useState } from 'react'
import { Designer, type DesignerHost, type TemplateSchema } from '@ptd/react-designer'
import '@ptd/react-designer/styles.css'

export function TemplateEditor({ initialValue }: { initialValue: TemplateSchema }) {
  const [template, setTemplate] = useState(initialValue)
  const host: DesignerHost = {
    commands: { save: {}, open: {} },
    onCommand: (command, context) => runDocumentCommand(command, context.template),
  }

  return <Designer value={template} onChange={setTemplate} host={host} />
}
```

`DesignerProps` 当前只有四项：

| 属性            | 类型              | 说明                                              |
| --------------- | ----------------- | ------------------------------------------------- |
| `value`         | `TemplateSchema`  | 必填，Host 持有的当前模板                         |
| `onChange`      | `(value) => void` | 编辑器产生模板变更时通知 Host                     |
| `host`          | `DesignerHost`    | 文档状态与 New/Open/Save/History 等应用级命令合同 |
| `renderContext` | `RenderContext`   | 可选临时校样数据与确定性的 locale/timeZone/now    |

样式需要由 Host 显式导入。API 与集成约束见 [`@ptd/react-designer` README](./packages/react-designer/README.md)。

## Server API

模板服务提供以下 HTTP 端点：

| 方法                     | 路径                                           | 用途                         |
| ------------------------ | ---------------------------------------------- | ---------------------------- |
| `GET`                    | `/healthz`                                     | 健康检查                     |
| `GET` / `POST`           | `/api/templates`                               | 列表 / 创建                  |
| `GET` / `PUT` / `DELETE` | `/api/templates/:id`                           | 读取 / 更新 / 删除           |
| `GET`                    | `/api/templates/:id/versions`                  | 版本列表                     |
| `GET`                    | `/api/templates/:id/versions/:version`         | 读取指定快照                 |
| `POST`                   | `/api/templates/:id/versions/:version/restore` | 将历史快照恢复为一个新版本   |
| `POST`                   | `/api/output/pdf`                              | 由当前模板和显式数据生成 PDF |

更新和恢复请求必须携带 `expectedVersion`。版本过期时返回 `409 Conflict`，以避免静默覆盖其他写入。请求体和响应语义见 [Server README](./apps/server/README.md)。

## 多页面与自动分页

`TemplateSchema.pages` 表示用户手动管理、需要持久化的设计页面。打印预览/PDF 通过 `@ptd/export`
生成独立 `OutputDocument` 派生页面；明细表可以续页并重复表头，但不会写回手工页、Dirty 或 Undo/Redo。
v1 已证明结构化表格 vertical slice，完整富文本逐行分页、分组小计和跨页合并单元格仍属后续能力。

## Docker 部署

当前生产链路交付完整自托管栈：

```text
GitHub Actions → 前后端质量/容器构建 → GHCR Web + Server 镜像
                                            ↓
                  PostgreSQL → migration → Server → Nginx Web/API
```

服务器不需要 Node.js 或 pnpm：

```bash
git clone https://github.com/ROYIANS/print-template-designer.git
cd print-template-designer
cp .env.example .env
# 编辑 .env 中所有 CHANGE_ME、公开 origin 和 GitHub OAuth 配置
./deploy.sh
```

默认访问 `http://<server-ip>:8080`。PowerShell 7、HTTPS 反向代理、GitHub callback、数据库卷、备份、私有 GHCR、版本固定和回滚说明见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 模块文档

| 模块            | 文档                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| Web Host        | [`apps/web/README.md`](./apps/web/README.md)                               |
| Template Server | [`apps/server/README.md`](./apps/server/README.md)                         |
| Core            | [`packages/core/README.md`](./packages/core/README.md)                     |
| Components      | [`packages/components/README.md`](./packages/components/README.md)         |
| React Designer  | [`packages/react-designer/README.md`](./packages/react-designer/README.md) |
| Export engine   | [`packages/export/README.md`](./packages/export/README.md)                 |
| 开发指南        | [`DEVELOPMENT.md`](./DEVELOPMENT.md)                                       |
| 部署指南        | [`DEPLOYMENT.md`](./DEPLOYMENT.md)                                         |
| 变更记录        | [`CHANGELOG.md`](./CHANGELOG.md)                                           |

## 路线图

接下来的主线按依赖顺序推进：

1. 在现有确定性输出主干上实现长文本逐行分页和更完整的 Page Master 编辑体验。
2. 扩展结构化表格的分组、小计、carry-forward 与受控跨页规则。
3. 在已稳定的数据合同上增加 Excel/CSV 本地文件连接器。
4. 设计具备 Secret 隔离和 SSRF 防护的 REST Server 连接器。
5. 增加批量输出/任务队列，并独立评估 Word 版式降级边界。

Excel/XLS/XLSX、CSV、REST、Word、完整长文本分页、复杂表格分页、图表、签名、条件显示、字体管理、
批量打印和多语言属于后续扩展，不应被理解为当前 v1 输出能力。

## Legacy v1

Vue 2 时代的源码、资源和实现记录保存在 [`legacy/`](./legacy/) 中，不再维护，也不会被 v2 运行时代码引用。

- npm 历史版本：[print-template-designer](https://www.npmjs.com/package/print-template-designer)
- v1 的 `ptd-designer` / `ptd-viewer` API 与 v2 不兼容。
- v1 曾包含的预览和导出实现不代表 v2 已具备同等功能。

## 联系与参考

- 作者：ROYIANS
- Email：<royians@vidorra.life>
- Website：<https://vidorra.life>

<img src="legacy/README.assets/QrCode.jpg" alt="联系二维码" width="160" />

主要参考项目：

- [report-designer](https://github.com/xinglie/report-designer)
- [printer-editor](https://github.com/xinglie/printer-editor)
- [visual-drag-demo](https://github.com/woai3c/visual-drag-demo)
- [vue-email-editor](https://github.com/unlayer/vue-email-editor)

## License

[MIT](./LICENSE) © ROYIANS

[![Star History Chart](https://api.star-history.com/svg?repos=ROYIANS/print-template-designer&type=Date)](https://star-history.com/#ROYIANS/print-template-designer&Date)
