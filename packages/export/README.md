# `@ptd/export`

Foliq 的 framework-free 确定性输出引擎。它把 canonical `TemplateSchema`、显式
`RenderContext` 与 `OutputOptions` 编译为可序列化的派生页 `OutputDocument`，并用同一份 IR
驱动 Web 打印预览和 Server Chromium PDF。

```text
TemplateSchema + RenderContext + OutputOptions
                    ↓
          compileOutputDocument()
                    ↓
        OutputDocument（显式派生页）
                    ↓
          mountOutputDocument() + preflightOutputDocument()
```

本包不依赖 React、NestJS、Playwright 或 Node-only API。Server 只负责受控浏览器生命周期与
`page.pdf()`；页眉页脚、表格断点、续页表头和页码由本包决定，而不是交给浏览器黑盒分页。

## 当前能力

- 手工模板页一对一编译，自动续页不会写回 `TemplateSchema.pages`。
- Page Master 的固定页眉、正文、页脚区域，以及 `{{page.number}}` / `{{page.totalPages}}`。
- 语义化 `RoyComplexTable` 明细表：数组绑定、实际行高测量、整行续排、重复表头、空状态、
  汇总行续页与页数上限。
- `ROW_TOO_TALL`、`UNBREAKABLE_FRAGMENT`、`PAGE_LIMIT_EXCEEDED` 等稳定诊断；fatal diagnostic
  会阻止 Server PDF。
- 固定 mm 纸张与 PTD 逻辑坐标 Canvas，避免把设计器的 5 px/mm 坐标误当成物理 CSS px。
- 复用 `@ptd/components` 的 DOM renderer；明细表 fragment 使用语义化 `table/thead/tbody/tfoot`。
- 等待字体、嵌入图片、二维码、条码与连续两帧布局稳定。
- 统一 preflight 在 readiness 后测量普通/富文本 `TEXT_OVERFLOW`（0.5px 容差），并检查空页与旋转后的页面边界；
  fatal diagnostics 阻止 PDF，warning diagnostics 可继续输出。
- 普通文本与富文本共享同一套 CSS 多列变量：`columnCount`（1–6）、`columnGap`（非负画布像素）和
  `columnFill`（`auto` / `balance`）。多列仍属于单个固定 frame；超过最后一栏由统一 preflight 报告
  `TEXT_OVERFLOW`，不会自动创建跨页文本流。
- 非嵌入图片在创建网络请求前被阻止，并返回 `REMOTE_RESOURCE_BLOCKED`。
- 稳定 `data-ptd-output-*` 标记与显式 `destroy()`，供预览、内部 render bundle 和测试使用。

## 公共入口

```ts
import { compileOutputDocument, mountOutputDocument, preflightOutputDocument } from '@ptd/export'

const output = await compileOutputDocument({ template, renderContext, options })
const mounted = mountOutputDocument(container, output)
const diagnostics = await preflightOutputDocument(mounted.root, output)

// 页面关闭或重新编译时释放组件实例与监听器。
mounted.destroy()
```

`OutputDocument`、`OutputPage`、`OutputFragment`、Page Master、诊断码和 `OutputOptions` 的权威纯类型
位于 `@ptd/core`；本包从 `src/index.ts` 导出编译器、DOM renderer、readiness、统一 preflight 和明细表 fragment 类型。

## 确定性与安全边界

- 纸张尺寸由 `PageConfig` 的 mm 值决定；viewport、DPR、编辑器 zoom 和预览 fit scale 不进入布局。
- `locale`、`timeZone` 与 ISO `now` 必须显式提供；输出代码不读取隐式系统时间。
- 只接受结构化模板和数据，不接受任意 HTML、脚本或导航 URL。
- v1 图片输出只允许嵌入模板的 `data:image/*`；`blob:`、远程和相对 URL 都不是可复现资源。
- `window.print()`、`html2canvas + jsPDF` 和整页 bitmap PDF 不是权威输出路径。
- v1 每张手工页只允许一个自动分页明细表；复杂 rowSpan、完整富文本逐行分页、奇偶页 Master、
  批量输出和 Word 均在当前范围外。

## 验证

```bash
corepack pnpm --filter @ptd/core build
corepack pnpm --filter @ptd/components build
corepack pnpm --filter @ptd/export typecheck
corepack pnpm --filter @ptd/export test
corepack pnpm --filter @ptd/export build
```

测试覆盖输入不可变、手工页、全局页码、40+ 行续页、重复表头、汇总行另页、超高行、页数上限、
Page Master 无正文区域、DOM mount/destroy、真实物理纸张比例、资源阻断与 readiness 诊断。
