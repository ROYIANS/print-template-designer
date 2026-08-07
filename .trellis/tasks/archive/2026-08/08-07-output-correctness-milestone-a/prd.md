# 输出正确性 Milestone A

## Goal

修复确定性输出 vertical slice 的工程基线和文字正确性缺口，使同一个 `TemplateSchema` 在 Designer 编辑、
Designer proof、Web 打印预览和 Server Chromium PDF 四个表面保持一致，并让文字溢出、资源失败和布局异常通过
统一的 preflight 诊断显式暴露。先完成 pnpm/CI 可重复验证，再实现普通文本空白 parity、富文本空段落 canonicalization、
`TEXT_OVERFLOW` 测量和 Web/Server 共用的阻断合同。

## Requirements

### R1. Package-manager and CI baseline

- 统一仓库声明、文档、Dockerfile 和质量规范中的 pnpm 版本；本任务采用仓库现有 Docker/文档基线 `11.18.0`。
- 根递归 `build` / `typecheck` 脚本必须通过 Corepack 调用仓库声明的 pnpm，不允许裸 `pnpm` 绕过版本合同。
- 前端 CI 必须按依赖顺序执行 `@ptd/core`、`@ptd/components`、`@ptd/export`、`@ptd/react-designer` 的
  typecheck/build，并运行 `@ptd/export` 测试后再检查/构建 Web。
- 不改变 lockfile 依赖版本，不执行依赖安装或 modules 重建；只修复版本声明、脚本和 CI 步骤。

### R2. Plain-text whitespace parity

- 普通文本持久化精确保留 Unicode 内容；仅将 `\r\n` 和孤立 `\r` 规范化为 `\n`，不 trim、不折叠其他空白。
- 新建和缺少显式策略的 legacy 普通文本默认使用 `pre-wrap`；支持 `normal`、`pre-wrap`、`pre-line`、`nowrap`。
- Designer 的 ContentEditor、Canvas renderer、TemplatePreview 和 Output DOM 使用同一规范化结果和同一
  `white-space` CSS 变量/声明。
- 普通文本的编辑提交、外部 controlled value 替换、JSON 导入、Undo/Redo 都必须保持换行和连续空格。

### R3. Rich-text blank paragraph parity

- `RoyText` 的内容在保存前和渲染 legacy 输入时通过一个共享函数 canonicalize。
- 空段落 `<p></p>` 和等价空白段落规范化为 `<p><br></p>`；首尾和中间的有意空段落必须保留。
- sanitizer 仍然移除危险标签、URL 和样式；空段落规范化不能重新引入不安全 HTML，也不能删除相邻合法内容。
- Designer rich-text editor、proof、Web preview 和 Output DOM 必须使用同一 canonical HTML。

### R4. Text overflow measurement

- 在字体 ready、组件 renderer ready、图片 decode 和两帧稳定布局之后测量文本 frame 的实际内容溢出。
- 测量结果至少包含 `sourceComponentId`、输出 page、横向/纵向溢出量和可诊断消息；使用 0.5px 容差避免
  sub-pixel 误报。
- 普通文本和富文本都支持测量；旋转组件至少按其实际 bounding box 参与页面 bounds 诊断。
- 当前模板未显式声明 overflow policy 时，文字溢出按 error 处理；本任务不实现多列或跨页文本流。

### R5. Unified output preflight

- `@ptd/export` 提供唯一的 preflight 入口，合并 compiler diagnostics、DOM readiness diagnostics、text overflow、
  remote resource 和 page bounds/empty page 检查。
- Web `TemplatePreview` 使用该入口并显示可读的诊断摘要；至少能定位 source page/component，不能只显示“输出失败”。
- Server PDF 在生成字节前运行同一套 preflight；error 诊断映射为现有 422 输出合同，warning 可继续导出但必须返回
  诊断，不能把 fatal diagnostics 当成成功 PDF。
- 诊断不能包含被阻断的远程 URL、模板密钥、Cookie、数据库凭据或本地文件路径。
- readiness timeout、图片/二维码/条码失败、远程资源阻断和文字溢出必须保持稳定 diagnostic code。

### R6. Tests and documentation

- 为 Core whitespace/rich-text/diagnostic contracts、Components rendering、Export preflight/overflow、Web preview
  和 Server output mapping 增加回归测试。
- 保留现有 detail-table pagination 和 async renderer 测试，并新增至少一个跨层中文长文本 fixture。
- 更新 `packages/export/README.md`、`apps/web/README.md`、Server output 文档和 CHANGELOG 的当前边界/行为。

## Acceptance Criteria

- [ ] `package.json`、README、DEVELOPMENT、Dockerfile 和 CI 对 pnpm 版本一致。
- [ ] 根 `corepack pnpm typecheck` / `corepack pnpm build` 不再依赖环境中的旧裸 pnpm。
- [ ] 干净 CI 顺序包含 `@ptd/export` typecheck/build/test，且 Web 在其 dist 存在后才 typecheck/build。
- [ ] `\r\n`、孤立 `\r`、首尾换行和连续空格在编辑、proof、预览和 PDF DOM 中保持一致。
- [ ] `<p></p>` 经 canonicalize 后在四个表面保留一行空段落，危险 HTML 仍被清除。
- [ ] 一个明确溢出的普通文本和富文本组件都产生 `TEXT_OVERFLOW`，诊断包含来源组件和溢出量。
- [ ] 无溢出的长文本不会产生误报；0.5px 内的 sub-pixel 差异被忽略。
- [ ] Web 预览可以看到并定位诊断；Server 在 fatal preflight 时不返回成功 PDF。
- [ ] Core/Components/Export/React Designer/Web/Server typecheck、lint、build 和相关测试通过。
- [ ] 本任务不引入 chart、columns、linked text flow、Word、batch 或外部数据连接器。

## Definition of Done

- 代码、测试、规范和公共文档中的输出合同一致。
- 现有测试保持通过，新增测试覆盖正常、边界和失败路径。
- 完成一次真实 Chromium smoke（若当前机器无可用 Chromium，则记录为部署级待验收，不伪造通过）。
- `git diff --check`、Forbidden pattern scan、tracked artifact scan 通过。
- Trellis task 在质量检查后归档，新增经验写回相关 spec。

## Technical Approach

1. 先修包管理和 CI，使 clean runner 能暴露缺失 dist，而不是被本地构建残留掩盖。
2. 在 Core 增加纯函数的 plain-text newline normalization、rich-text canonicalization、style defaults 和
   overflow diagnostic 类型；Components 只消费 Core 合同。
3. 在 Components 的共享 stylesheet/renderer 中统一 `white-space`，避免只修 ContentEditor。
4. 在 Export 中将 readiness 与 compiler diagnostics 合并为单一 preflight；测量只读取 render DOM，不修改模板。
5. Web Preview 显示结构化诊断；Server 复用同一 output bundle 和稳定错误映射。

## Decision (ADR-lite)

**Context**: 当前输出合同已经声明 `TEXT_OVERFLOW`，但 renderer 默认 `overflow: hidden` 且 readiness 不测量，长文本
可能静默截断。Web 和 Server 还各自持有部分输出状态。

**Decision**: 以 `@ptd/export` 为唯一 preflight 编排层，Core 提供无 DOM 的规范化/类型合同，Components 提供共享 DOM
行为，Web/Server 只消费结构化诊断。普通文本默认 `pre-wrap`，富文本空段落使用 `<p><br></p>`，未声明 overflow
policy 的文字按 error 处理。

**Consequences**: 输出会从“只要 Chromium 产出 PDF 就算成功”变为可阻断、可定位的合同；浏览器测量依赖字体和 DOM 稳定性，
因此必须保留 timeout 诊断并用真实 Chromium smoke 验证。多列和跨页流仍留给后续 Milestone B/D。

## Out of Scope

- pnpm 依赖升级、lockfile 重建、node_modules 清理或安装新运行时依赖。
- 多列文本、linked text frames、完整富文本逐行分页、复杂表格分组/跨页合并。
- 图表、图像 DPI/focal point、Word、批量输出、Excel/CSV/REST 数据源。
- 重做 Designer 视觉系统或大规模拆分既有大文件。

## Technical Notes

- 相关规范：[package conventions](../../../spec/monorepo/package-conventions.md)、[TypeScript](../../../spec/monorepo/typescript-conventions.md)、
  [output architecture](../../../spec/monorepo/output-architecture.md)、[server architecture](../../../spec/monorepo/server-architecture.md)。
- 当前路线图的 Milestone A 已明确 whitespace parity、overflow 和 unified preflight 顺序。
- 关键现状：`packages/core/src/types/output.ts` 已声明 `TEXT_OVERFLOW`；`packages/components/src/base/stylesheet.ts`
  默认 `overflow: hidden`；`packages/export/src/readiness.ts` 尚未执行文字溢出测量。
- Web Preview 入口为 `apps/web/src/OutputPreview.tsx`；Server PDF 入口为 `apps/server/src/output/output.controller.ts`
  和 `output-browser.service.ts`。
