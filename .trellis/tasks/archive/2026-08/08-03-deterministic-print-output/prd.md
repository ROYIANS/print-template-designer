# 确定性打印输出引擎 v1

## 背景

Foliq 的产品目标是专业的结构化打印制品设计器，而不是普通网页打印工具。用户明确要求：

- 高保真 PDF；
- 产品级页眉、页脚和页码；
- 长文本自动分页；
- 结构化表格智能分页；
- 明细表跨页后重复表头；
- 预览与最终导出一致；
- 后续可扩展到批量输出。

因此，正式输出不能以 `window.print()`、浏览器默认业务分页或整页截图式 PDF 为核心。

## Goal

建立 Foliq v2 第一条确定性输出主干：同一个 Layout Compiler 把模板和运行时数据编译为显式
`OutputDocument`，Web 用它显示真实逐页预览，Server 用固定版本 Headless Chromium 把相同派生页
绘制成 PDF。通过一个跨两页以上并重复表头的明细表格 vertical slice，证明分页属于 Foliq，而不是
浏览器黑盒。

## 已确认决策

1. Foliq 自己决定业务分页；Chromium 只提供受控测量环境和最终 PDF 绘制。
2. `window.print()` 不作为权威预览或 PDF 路径，v1 不接入“快速打印”。
3. 服务端/Docker 可以引入 Headless Chromium，接受镜像体积和运行时复杂度增加。
4. 使用固定版本 Playwright Core + 匹配版本 Chromium runtime；不同时维护 Puppeteer 后端。
5. `@ptd/export` 从空 scaffold 升级为 framework-free browser library，不依赖 React/Nest/Playwright。
6. Web 预览和 Server PDF 复用同一 Output IR、分页器和组件 DOM renderer。
7. Server 从 TemplateSchema/RenderContext 重新编译输出，不接受客户端提交任意 HTML。
8. PDF v1 支持未保存模板，导出不要求模板先写入数据库。
9. 自动分页只生成派生页面，不修改 `TemplateSchema.pages`，不进入 Designer History/dirty 状态。
10. 现有 `TemplatePreview` 继续只表示一张手工模板页；正式输出预览使用独立表面。

## 用户故事

### US-1：真实打印预览

作为设计者，我在编辑器中点击“打印预览”后，应看到根据当前未保存模板和证明数据生成的一张张
真实纸面，而不是当前画布截图或浏览器打印对话框。

### US-2：导出 PDF

作为设计者，我点击“导出 PDF”后，Server 应使用与预览相同的分页模型生成并下载 PDF。PDF 不出现
浏览器自带页眉页脚，不受用户系统打印设置影响。

### US-3：重复页眉页脚和页码

作为模板作者，我可以为输出定义默认页眉和页脚区域。派生页面应重复这些区域，并正确显示当前页码
与总页数。

### US-4：明细表格跨页

作为单据/清单模板作者，我可以让语义化明细表绑定数组数据。内容超出正文区时自动续页，后续页保留
同样的表头，且不会把普通行无提示地切成上下两半。

### US-5：可诊断失败

作为设计者，当字体、图片、超高行或不支持的合并单元格导致无法可靠输出时，我应看到明确错误/警告，
而不是得到悄悄裁切或无限等待的 PDF。

## 范围

### 1. 输出合同与派生页

在无 DOM 的公共类型层建立并导出：

- `OutputOptions`；
- `OutputDocument`；
- `OutputPage`；
- `OutputRegion`；
- `OutputFragment`；
- `OutputPageContext`；
- `OutputDiagnostic` 和稳定诊断码。

最低合同：

```ts
interface OutputDocument {
  pages: readonly OutputPage[]
  diagnostics: readonly OutputDiagnostic[]
  metadata: {
    title: string
    generatedAt: string
    locale: string
    timeZone: string
  }
}

interface OutputPage {
  id: string
  pageNumber: number
  totalPages: number
  widthMm: number
  heightMm: number
  regions: {
    header: OutputRegion
    body: OutputRegion
    footer: OutputRegion
  }
}
```

实现可以调整内部字段，但必须满足：JSON-serializable、不可变派生、可追踪回源组件、支持 continuation
状态，不携带 DOM Node、函数或 Browser 实例。

### 2. Layout Compiler

`@ptd/export` 提供异步编译入口，输入 canonical TemplateSchema、显式 RenderContext 和 OutputOptions，
输出 `OutputDocument`。

编译规则：

- 现有手工页在没有流式组件时保持一页对一页；
- 绝对定位组件不会因为内容变多自动改成 flow；
- 组件数据绑定在创建 fragment 前解析，不写回模板；
- PageConfig 纸张 mm 尺寸是权威；
- 不使用 editor scale、viewport、DPR 或 preview transform 决定布局；
- 所有循环必须有页数/fragment 数上限和无进展保护；
- 输出页数默认上限 200，超出返回明确诊断并终止；
- compiler 必须可被 Web 和内部 render bundle 调用。

### 3. Page Master v1

为 TemplateSchema 增加向后兼容、可选的默认 Page Master 合同，至少包含：

- 固定高度的 header region；
- body region；
- 固定高度的 footer region；
- header/footer 内正常的 Foliq `ComponentSchema[]`；
- region-local 坐标；
- 当前页与总页数输出上下文。

v1 只要求一个 default master，不实现奇偶页、首页专用 master 或多 master 选择，但数据结构不能阻止
后续扩展。旧模板没有 Page Master 时，header/footer 为零高，body 使用现有 page margins。

页码解析采用两阶段布局：

1. 生成全部页面并确定总页数；
2. 用 `pageNumber` / `totalPages` 解析页眉页脚并完成最终 fragment。

页面变量只能来自只读 OutputPageContext，不写入 TemplateSchema.data 或运行时业务记录。

### 4. 明细表格 vertical slice

将现有内部 `RoyComplexTable` 演进为 UI 中称为“明细表格”的 canonical 结构化表格。组件标识继续保留
`RoyComplexTable`，不进行不必要的内部代号迁移。

v1 props 至少支持：

- 数组数据字段绑定；
- columns/header 定义；
- body row template；
- 静态或字段绑定的单元格内容；
- 列宽；
- 最小行高与由内容撑开的实际行高；
- `repeatHeader`，默认 true；
- 可选 footer/summary；
- `keepRowTogether`，v1 默认 true。

分页规则：

1. 测量表头、每个 body row 和 footer 的实际高度。
2. 当前页不足以容纳“表头 + 至少一行”时，整个 table fragment 移到下一页。
3. 每个 continuation page 重新生成表头。
4. 默认不拆单行。
5. 单行自身高于完整 body region 时终止该表格分页并返回 `ROW_TOO_TALL`。
6. footer 能放在最后一页时随最后数据行输出；放不下时进入新页并重复表头。
7. v1 不支持跨分页边界的 rowSpan；发现时返回 `UNSUPPORTED_TABLE_SPAN`。
8. 空数据仍可显示表头和明确的空状态，不生成无限空页。

至少提供一个固定测试 fixture，使用 40 条以上明细生成两页以上输出，并断言每页表头存在、行顺序
不丢失不重复。

### 5. 输出 DOM Renderer

`@ptd/export` 提供将 `OutputDocument` 渲染到指定 HTMLElement 的能力：

- 复用 `@ptd/components`；
- 一张 OutputPage 对应一个固定纸面元素；
- 使用真实 mm 页面尺寸；
- `@page { margin: 0 }`；
- 页面之间的屏幕预览间距不进入 PDF；
- 不复制 Canvas/TemplatePreview 的编辑器 Chrome；
- 输出 DOM 带稳定 `data-ptd-output-*` 标记供测试和 render readiness 使用；
- 组件卸载时销毁 BaseComponent、observer 和事件监听。

### 6. 资源就绪与诊断

导出就绪条件：

- `document.fonts.ready`；
- 所有输出图片完成 `decode()` 或产生资源失败诊断；
- QRCode/Barcode 完成确定性渲染；
- 布局连续两帧尺寸稳定；
- compiler/renderer 没有 fatal diagnostic。

最低诊断码：

- `TEXT_OVERFLOW`；
- `ROW_TOO_TALL`；
- `UNSUPPORTED_TABLE_SPAN`；
- `UNBREAKABLE_FRAGMENT`；
- `PAGE_LIMIT_EXCEEDED`；
- `MISSING_FONT`；
- `IMAGE_LOAD_FAILED`；
- `REMOTE_RESOURCE_BLOCKED`；
- `BARCODE_RENDER_FAILED`；
- `LAYOUT_TIMEOUT`。

诊断包含 severity、code、message、source component id（若适用）、page/fragment 信息；不得包含 Secret。

### 7. Web 输出预览

接入现有 Designer Host 命令：

- `preview` 打开 Output Preview；
- `exportDocument` 调用 PDF API；
- `print` 在 v1 保持禁用，并说明“请先导出 PDF 后打印”；
- 预览/导出都取 Host 命令执行瞬间的最新内存 TemplateSchema；
- 未保存文档可预览和导出；
- 打开/关闭预览不改变 dirty、History 或 Server version；
- fatal diagnostic 阻止 PDF，并在预览中显示可操作错误；warning 不隐藏。

Output Preview 至少支持：

- 多页纵向浏览；
- 页码/总页数；
- 适合页面/100% 两种缩放；
- 关闭；
- 导出 PDF；
- loading、error 和 diagnostics 状态；
- 键盘焦点恢复和基础无障碍语义。

本任务不要求为 Preview 设计缩略图导航、双页杂志模式或复杂打印设置面板。

### 8. Server PDF API

新增认证保护接口：

```http
POST /api/output/pdf
Content-Type: application/json
Accept: application/pdf
```

请求包含：

- `template: unknown`，经 Core canonical 校验；
- 可选但受严格限制的 RenderContext；
- `options`，至少包含显式 locale、timeZone、now 和输出文件名提示。

响应：

- 成功：`200 application/pdf`；
- `Content-Disposition` 使用清洗后的 UTF-8 文件名；
- 非法合同：400；
- 未认证：401；
- 不可分页/fatal diagnostic：422；
- 并发池饱和：429 或 503，并返回明确可重试语义；
- 超时：504；
- 浏览器不可用：503。

完整 JSON 请求继续受 4 MiB 上限约束。接口不要求 template id，不保存模板、数据或 PDF。

### 9. Server Chromium 生命周期

- 使用精确版本 `playwright-core`；
- Docker 使用匹配 release 的固定 Playwright Chromium runtime，不用 `latest`；
- 一个长期 Browser 实例；
- 每个任务独立 BrowserContext/Page；
- 默认最大并发 2，有硬上限；
- 单任务默认 30 秒截止；
- finally 关闭 Context；
- Nest shutdown 关闭 Browser；
- Browser crash 最多重建一次；
- 禁止任意 URL 导航和任意 HTML 输入；
- 内部 render page 不携带认证 Cookie/数据库配置；
- 默认阻断所有外部网络，远程图片返回 `REMOTE_RESOURCE_BLOCKED`；
- 日志只记录 job id、阶段、耗时、页数、结果大小和诊断码。

### 10. Docker 与部署

- Server runtime 从 Alpine 调整到 Chromium 支持的 glibc/Ubuntu 环境；
- 浏览器/package/image 版本固定；
- 添加确定性中西文字体文件或版本固定的字体安装；
- 容器正确回收 Chromium 子进程；
- Compose 不增加 `SYS_ADMIN` 或默认 privileged 模式；
- 保持 PostgreSQL、migrate、Server、Web 的现有启动顺序；
- 更新 Server 镜像体积、内存和本地开发说明；
- Nginx PDF 请求读取超时与 Server 30 秒截止保持一致并留安全余量；
- 现有 `/healthz` 仍轻量，浏览器 readiness 通过内部服务诊断/测试验证。

## 非功能要求

### 确定性

同一 canonical template、RenderContext、OutputOptions、字体和 Chromium 版本应生成相同页数、相同
fragment 顺序与视觉布局。PDF metadata 中不可隐式写入每次变化的当前时间；使用显式 `now`。

### 性能

- Browser 只启动一次；
- 一份 5 页以内、普通图文/表格模板在开发机上的 warm export 目标小于 5 秒；
- 不把每个页面转换成 bitmap；
- 超限任务必须提前终止，不造成无界内存增长。

### 安全

- 所有输出 API 复用 Cookie session Guard；
- 不接受任意 HTML、JavaScript 或 render URL；
- 不允许 Chromium 访问公网、私网、loopback、metadata 或 Compose 服务；
- 富文本走现有 sanitizer；
- 错误响应和日志不泄露模板完整内容、业务记录和本地路径。

### 可访问性

输出预览对话表面可通过键盘关闭，打开后获得合理焦点，关闭后焦点回到命令触发点。页面预览提供
页码标签；具体纸面内容不重复轰炸屏幕阅读器。

## Out of Scope

- `window.print()` 快速打印出口；
- 前端 `html2canvas + jsPDF` fallback；
- 完整富文本自动分页算法；
- widow/orphan 的最终富文本 UI；
- 表格跨页 rowSpan、任意合并单元格续排；
- 分组标题、小计、每页小计和复杂财务 carry-forward；
- 首页/奇偶页不同 Page Master；
- 多 Master 选择 UI；
- 出血、裁切标、专色和 CMYK 工作流；
- PDF/A、数字签名和加密；
- Word/Excel 导出；
- 批量 PDF、任务队列和独立 renderer worker；
- 远程图片代理和任意外部资源下载；
- REST/数据库数据源直连；
- 修改正式 Logo、品牌名或 `@ptd/*` 内部代号。

## 失败与降级规则

- fatal diagnostic：不生成 PDF，返回 422；预览保留诊断页/错误状态。
- warning diagnostic：允许预览；是否允许 PDF 由稳定规则决定，v1 不提供“忽略 fatal”开关。
- 远程图片：阻断并给出诊断，不静默访问。
- 缺失字体：不得静默用平台随机字体代替；若明确有固定 fallback，记录 warning，否则 fatal。
- 超高表格行：不切成不可读的两半，不无限生成页面，返回 `ROW_TOO_TALL`。
- Chromium crash：重建一次；再次失败返回 503。
- 客户端取消：中止 fetch；Server 尽快取消/关闭对应 Context，不继续占用池。

## Acceptance Criteria

- [x] `@ptd/export` 不再是空 scaffold，具有公开 Output IR、compiler、DOM renderer 和测试。
- [x] `@ptd/export` 不依赖 React、NestJS、Playwright 或 Node-only API。
- [x] 现有无流式组件模板编译后保持手工页数量和几何关系。
- [x] 编译不会修改输入 TemplateSchema 或 Designer History。
- [x] Page Master v1 能在每个派生页渲染 header/footer。
- [x] 当前页码和总页数正确，至少覆盖 1 页和 3 页测试。
- [x] 明细表绑定 40+ 条数组数据后产生至少 2 页。
- [x] 每个表格 continuation page 都有表头。
- [x] 表格行顺序不丢失、不重复；单个超高行明确失败。
- [x] Web 打印预览显示真实 OutputDocument 多页，而不是 TemplatePreview 的 pageIndex 切换。
- [x] 未保存模板可以预览和导出，操作不改变 dirty/version。
- [x] `POST /api/output/pdf` 返回可打开、页数正确的 `application/pdf`。
- [x] PDF 中的文本保持文本而非整页 JPEG/PNG。
- [x] 预览和 PDF 对同一 fixture 页数、表头重复和页码一致。
- [x] PDF 等待字体、图片、二维码和条码 ready。
- [x] 远程资源被阻断且没有对测试地址发起请求。
- [x] Server 同时超过并发上限时有确定的拒绝/排队合同，无无界 Page 创建。
- [x] 任务超时和 Browser crash 后 Context/Browser 生命周期正确清理。
- [x] Docker Server image 能启动 Chromium 并完成真实 PDF smoke test。
- [x] Compose 不需要 privileged 或 `SYS_ADMIN`。
- [x] Core、Components、Export、React Designer、Web、Server 的 lint/typecheck/test/build 通过。
- [x] README、DEVELOPMENT、DEPLOYMENT、相关 Trellis spec 与实现一致。
- [x] 未跟踪实验文件 `liquid-grid-designer.html`、`supply-demo.html`、`vercel-demo.html` 未被提交。

## 测试策略

### Core

- Page Master/Detail Table/output options 的 normalize、validate、serialize/deserialize；
- 旧模板缺少新字段仍合法且 round-trip；
- 页面变量与业务字段隔离。

### Export

- 纯分页单元测试；
- manual page 1:1；
- 表头 + 至少一行换页条件；
- 40+ 行多页、空表、footer 新页、超高行、页数上限；
- 输入不可变；
- DOM renderer mount/destroy；
- resource readiness 和诊断聚合。

### React Designer / Web

- Host 命令状态和执行瞬间模板；
- Output Preview loading/success/error/diagnostics；
- dirty/history 不变；
- 导出下载文件名和错误语义；
- 焦点打开/恢复。

### Server

- API contract、认证、4 MiB 上限和 filename；
- 并发、超时、取消、Browser crash；
- network interception / SSRF；
- 不落库；
- 真实 Chromium PDF smoke test，解析 PDF 页数和文本。

### Visual / Docker

- 固定 fixture 的逐页截图；
- 预览截图与 PDF render PNG 对比，设合理抗锯齿容差；
- Docker image 内中文字体、图片、QR/Barcode；
- Compose `/api/output/pdf` 端到端。

## 实施顺序

1. 确定并测试 Output IR、Page Master 和 Detail Table Core 合同。
2. 把 `@ptd/export` 升级为 tsup/Vitest package。
3. 实现 manual page compiler 与输出 DOM renderer。
4. 实现 Page Master 两阶段页码。
5. 实现 Detail Table vertical slice 与多页测试 fixture。
6. 新建 Web Output Preview 并接入 `preview` 命令。
7. 新建 Server renderer module、内部 render bundle 和 PDF API。
8. 接入 Web `exportDocument` 下载与错误处理。
9. 更新 Docker/Compose/字体和部署文档。
10. 完成真实浏览器、PDF、视觉、全工作区和安全验证。

## 依赖和授权提示

实现 Server PDF 必须新增并锁定 Playwright Core 依赖、修改 Docker runtime，并同步 pnpm lockfile。
按照项目依赖卫生规则，在用户明确允许执行依赖安装/lockfile 同步前，不运行 `pnpm install`、不重建
`node_modules`。可以先完成不依赖新第三方包的 Core/Export/Web 结构工作，但 Server PDF 的最终实现和
验证需要该授权。

## Definition of Done

- [x] 所有 Acceptance Criteria 完成或在 PRD 中经用户明确批准调整。
- [x] 研究结论写入本任务 `research/`。
- [x] 实现/检查上下文清单完成并通过 Trellis validate。
- [x] 新依赖和 Docker 版本被精确固定，无隐式浏览器下载漂移。
- [x] 代码、测试、公共文档和 Trellis spec 一致。
- [x] 任务变更按逻辑批次提交，不包含用户的未跟踪实验文件。
