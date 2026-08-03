# 确定性打印输出架构调研

## 结论

Foliq 的正式输出链路采用“产品分页器 + 受控 Chromium 绘制器”：

```text
TemplateSchema + RenderContext + OutputOptions
                    ↓
        @ptd/export Layout Compiler
                    ↓
        OutputDocument（显式派生页）
                    ↓
       ┌────────────┴────────────┐
       ↓                         ↓
Web Output Preview       Server Headless Chromium
       ↓                         ↓
逐页 DOM 预览                   PDF bytes
```

`window.print()`、浏览器默认分页、`html2canvas + jsPDF` 均不作为权威输出路径。Chromium 可以提供
字体/DOM 测量并最终执行 PDF 绘制，但 Foliq 代码必须决定业务断点、重复表头、页眉页脚和续排片段。

## 调研时现状证据

- `packages/export` 已预留为 `@ptd/export`，当前只有 `export {}`，README 也明确要求先确定分页、
  字体、浏览器/服务端边界和可观测性。
- `TemplatePreview` 只渲染一张现有手工页并按容器缩放。该组件应继续保持“模板缩略图”职责，
  不能冒充真实输出预览。
- `@ptd/components` 是框架无关的 DOM 组件层，React Designer 通过 `ComponentRenderer` 挂载这些
  组件。输出层应复用该组件实现，而不是复制一套 React/PDF 绘制器。
- `RoySimpleTable` 是可合并单元格的固定自由网格；它不具有数据行、重复表头或业务分页语义。
- `RoyComplexTable` 已有 header/body/footer 的原始轮廓，但仍是内部占位实现，没有 canonical Core
  props、数组数据绑定和分页合同。它适合作为 v1“明细表格”的演进起点，但不能直接视为完成品。
- `apps/server` 当前没有 Playwright/Puppeteer/Chromium 依赖。
- `docker/Dockerfile.server` 当前使用 `node:22-alpine`。Playwright 官方文档明确说明 Alpine/musl
  不受支持；其官方镜像使用 Ubuntu，并要求项目 Playwright 版本和镜像版本匹配。
- 当前 Nginx `/api` 超时为 60 秒、JSON 请求体上限为 4 MiB。PDF API 需要延续 4 MiB 请求合同，
  并为生成任务设置更短的应用级截止时间，避免占满浏览器池直到代理超时。
- legacy v1 的长文本实现先 `html2canvas` 栅格化再切 canvas，PDF 也按整页 JPEG 写入 jsPDF；
  这会丢失矢量文本、选择/搜索能力并引入清晰度和分页误差，只能作为失败经验参考。
- legacy `AutoTable` 能生成 `thead`/`tbody` HTML，但 `getPagedTable()` 实际只返回原始表格，没有
  完成现代产品要求的显式业务分页。

## 包和运行时边界

### `@ptd/core`

继续只负责框架无关、无 DOM 的权威合同：

- 输出相关的可序列化类型；
- Page Master / Region 的持久化 Schema 与校验；
- 明细表格 canonical props、归一化和校验；
- 页面变量类型；
- 数据绑定和输出诊断码中的纯类型部分。

Core 不读取 `document`、不创建 HTML、不启动浏览器。

### `@ptd/components`

继续负责框架无关 DOM 组件：

- 渲染普通组件；
- 将现有 `RoyComplexTable` 演进为语义化“明细表格”组件；
- 提供输出渲染需要的稳定 `data-ptd-*` 标记和资源就绪状态；
- 不拥有分页策略和 Server API。

### `@ptd/export`

从空 scaffold 升级为真正的浏览器库：

- `OutputDocument` / `OutputPage` / `OutputFragment` / `OutputDiagnostic`；
- manual page 到派生输出页的编译；
- Page Master region 注入；
- 明细表格的测量、断点选择和 continuation fragment；
- 输出页面 DOM renderer；
- 字体、图片、二维码、条码和布局稳定等待；
- 同时被 Web 预览和 Server 内部渲染页使用。

本包可以依赖 `@ptd/core` 和 `@ptd/components`，但不能依赖 React、NestJS、Playwright 或
Node-only API。这样嵌入式 Host 仍可只使用浏览器输出预览。

### `@ptd/react-designer`

- 保留 `TemplatePreview` 的单手工页缩略图语义；
- 新增独立的 `OutputPreview` 公共表面或由 Web Host 包装 `@ptd/export`；
- Designer 菜单只发出 `preview` / `exportDocument` Host 命令，不拥有 HTTP 和下载逻辑。

### `apps/web`

- Host 以执行瞬间的最新内存模板打开输出预览；
- 预览本地编译 `OutputDocument`；
- PDF 导出把同一模板、显式 RenderContext 和 OutputOptions 发送给 Server；
- Server 重新运行同一编译器，不信任客户端提交的任意 HTML 或任意 `OutputDocument`。

### `apps/server`

- 提供认证保护的 `POST /api/output/pdf`；
- 深层校验模板、RenderContext 和 OutputOptions；
- 管理唯一 Browser 实例、受限 Page 池/信号量、任务超时和 shutdown；
- 在受控内部 render bundle 中运行 `@ptd/export`；
- 返回 PDF bytes 和结构化失败语义；
- 不把 PDF 或完整运行时业务数据默认写入数据库。

## Playwright 与 Puppeteer

两者都能调用 Chromium `page.pdf()`，也都能拦截网络和等待页面状态。v1 选择 Playwright Core：

- 官方提供包含浏览器与系统依赖的固定版本 Ubuntu 镜像；
- BrowserContext、route interception、超时和页面生命周期 API 更适合实现隔离渲染任务；
- 版本匹配规则明确，可把 npm 版本、Docker 镜像和 Chromium revision 一起固定；
- 当前任务只启用 Chromium，不开放任意 URL 导航。

实现时必须把 `playwright-core` 锁到精确版本，并让 Docker 运行时镜像使用同一 Playwright release；
不能使用 `latest`。2026-08-03 调研时 npm 最新 `playwright-core` 为 `1.62.1`，官方文档示例镜像为
`v1.62.0-noble`。提交依赖前应再次选择一个 npm 与镜像均存在的相同版本，不根据“最新”漂移。

Puppeteer Core 仍是可行替代，但本任务不同时维护两种后端。官方 Puppeteer 镜像要求为 sandbox
增加 `SYS_ADMIN` capability；默认 Compose 不应为了 PDF 生成静默扩大容器权限。

## 实施验证（2026-08-03）

- 最终选择并锁定 `playwright-core@1.62.0` 与 `mcr.microsoft.com/playwright:v1.62.0-noble`；MCR tag
  registry 已确认该 tag 存在。
- Ubuntu Noble 的 `fonts-noto-cjk` 权威版本是 `1:20230817+repack1-3`。早期 Dockerfile 中的
  `1:20220127+repack1-1` 属于错误发行版版本，静态审查时已修正。
- PTD 组件几何不是 96 DPI CSS px，而是 `5 logical px/mm`。真实 A4 输出必须使用
  `1050 × 1485` 逻辑 Canvas，再按 `(96 / 25.4) / 5` 缩放到 `210mm × 297mm`。直接把逻辑 px 放到物理
  mm 纸面会让两张 IR 页面生成三张 PDF，其中最后一张为空白。
- 使用 Windows Chrome 真实生成并解析后，IR 2 页与 PDF 2 页一致、无尾部空白页；PDF 保留文字对象，
  页面 PNG 无裁切，中文视觉 glyph 正常。
- Windows Chrome + Microsoft YaHei 的部分 CJK ToUnicode mapping 可被 `pypdf`/PDFium 提取成 replacement
  character 或康熙部首；简单独立 Chrome PDF 也能复现，说明不是 Foliq DOM renderer 特有。必须继续在
  固定 Playwright Chromium + Noto CJK 容器内验证，不能以 `/ToUnicode` 存在宣称中文检索完全正确。
- Web `/app?template=95` 已完成 1600×1000、1024×768、620×820、390×780 打印预览检查；纸张居中、工具栏
  无横向溢出、适合页面/宽度/缩放/导出/关闭可用。模板 id 只是当次隔离测试库 QA 数据，不属于公共合同。
- 完整 HTTP 路径已跑通：当前模板 → 打印预览 → `POST /api/output/pdf` → `application/pdf` 下载；预览与 PDF
  的尺寸、文本位置和换行一致，差异仅为浏览器与 PDF rasterizer 抗锯齿。
- 本机没有 Docker CLI，不能执行 Server/Web image build、Compose E2E 和容器内 CJK 验收。该项保持明确
  blocker，不允许用静态 Dockerfile 审查或 Windows Chrome smoke 代替。

## Chromium 容器策略

当前 Alpine runtime 不能直接延续。v1 采用版本固定的 Ubuntu/Playwright Chromium runtime，接受
Server 镜像显著变大。先把 renderer 放在 Nest Server 进程内，通过并发闸门控制；当批量输出、队列、
独立扩缩容成为真实需求后，再拆独立 worker/service。

最低运行合同：

- 一个长期 Browser 实例，任务使用独立 BrowserContext/Page；
- 默认并发 2，可配置但必须有安全上限；
- 单任务总截止时间默认 30 秒，资源等待使用更短子超时；
- 任务结束始终关闭 Context；应用 shutdown 关闭 Browser；
- Chromium crash 后允许串行重建一次，不无限重试；
- 健康检查只报告应用存活；另提供内部 readiness/诊断以区分浏览器不可用；
- 容器必须有 init/reaping 策略，避免僵尸 Chromium 进程；
- 固定中西文字体文件和字体版本，不能依赖宿主机字体；
- 本地开发可显式配置 Chromium executable path，不扫描或修改用户环境。

## 安全边界

模板和运行时数据都属于不可信输入。浏览器不是任意网页浏览器：

- 只加载随应用构建的内部 render document；
- 禁止用户提供导航 URL、HTML 文档或 JavaScript；
- 富文本继续经过统一 sanitizer；
- BrowserContext 拦截请求，默认只允许内部 bundle、`data:` 和 `blob:`；
- 远程图片不得由 Chromium 任意联网获取，否则会形成 SSRF；v1 对远程 URL 给出明确诊断，
  或经以后单独设计的受控资源代理获取；
- 禁止访问 loopback、link-local、私网、云 metadata 和 Docker 内部服务；
- 不把 Cookie、Better Auth session、数据库地址或 Server 环境变量注入 render page；
- render page 使用随机任务通道，不通过查询串承载模板和数据；
- 限制模板请求体、记录数、派生页数、总 DOM 节点和 PDF 大小；
- 日志记录 job id、耗时、页数、诊断码和失败阶段，不记录完整模板、运行时数据或 PDF bytes。

## 确定性与尺寸

- PageConfig 的纸张尺寸以 mm 为权威；布局内部使用浏览器 96 CSS px/in 的确定性换算。
- 编辑器 `scale`、预览 fit scale、窗口大小、DPR 和 CSS transform 不进入输出布局。
- 每个最终页面是固定 mm 尺寸，`@page { margin: 0 }`，一张 `OutputPage` 对应一个页面元素。
- locale、timeZone、`now` 必须由 OutputOptions/RenderContext 显式给出；缺省值由产品合同固定，
  不能读取服务器当前地区和随机当前时间后造成重复导出不同。
- 导出前等待 `document.fonts.ready`、图片 `decode()`、二维码/条码 ready 和双帧布局稳定。
- 预览和 PDF 使用相同编译器、相同 fragment IR 和相同组件 DOM 实现；视觉外壳可以不同。

## v1 分页 vertical slice

v1 不实现所有长文档能力，但必须通过一个真实的两页以上明细表格证明架构：

1. 明细表格绑定数组字段。
2. 表头、正文行模板和可选汇总区具有明确语义。
3. 测量每一行的实际高度。
4. 当前页放不下“表头 + 至少一行”时整表移到下一页。
5. 后续页重新生成表头。
6. 默认整行不拆分；单行超过正文区时输出 `ROW_TOO_TALL`，不得无限循环。
7. v1 不支持跨分页边界的 rowSpan；遇到时输出明确诊断。
8. Page Master 的 header/body/footer region 在每个派生页出现，并可解析当前页/总页数。

长文本 v1 只定义 fragmenter 接口与 `clip | paginate`、`keepTogether`、`widows`、`orphans`
等合同。完整富文本按行续排作为后续独立任务，避免在第一个输出任务中同时实现两套复杂分页器。

## 主要风险

1. **预览/PDF漂移**：字体或浏览器版本不同。通过固定字体、显式等待、版本固定和 golden PDF
   验证降低风险。
2. **循环依赖**：React Renderer 与 export package 互相引用。通过 export 直接复用 framework-free
   components、React 只做 wrapper 避免。
3. **Schema过早锁死**：Page Master 和 Detail Table 先定义最小可扩展合同，首版不承诺奇偶页、
   分组小计和复杂 rowSpan。
4. **服务端资源耗尽**：并发闸门、页数/节点/超时上限、Context finally cleanup。
5. **SSRF/本地网络读取**：默认网络拒绝，远程资源返回诊断。
6. **Server 镜像膨胀**：这是用户已接受的架构成本；批量输出出现后再拆 renderer worker。

## 参考

- Playwright Docker 官方文档：<https://playwright.dev/docs/docker>
- Playwright Page PDF API：<https://playwright.dev/docs/api/class-page#page-pdf>
- Puppeteer Docker 官方文档：<https://pptr.dev/guides/docker>
- 仓库规范：`.trellis/spec/monorepo/package-conventions.md`
- 仓库规范：`.trellis/spec/monorepo/server-architecture.md`
- 历史证据：`.trellis/tasks/archive/2026-05/05-20-refc-blueprint/prd.md`
- Legacy 参考：`legacy/src/components/Viewer/`（只读，不复用其 raster PDF 实现）
