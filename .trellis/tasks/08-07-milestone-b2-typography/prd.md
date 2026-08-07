# Milestone B2：段落与字符级排版

## Goal

在 Milestone B1 固定文本框分栏的基础上，补齐可见、可持久化且在设计器预览与 Chromium 输出之间保持一致的段落级排版能力。优先解决长文编辑时最常用的段前/段后间距与首行缩进，同时保留现有 Tiptap 富文本 HTML 的安全 canonical 持久化边界。

## What I already know

* 用户已确认 B1 的 `columnFill: auto` 与 `balance` 满意，希望继续下一步。
* Docker 本轮不运行；真实 Chromium smoke 可使用已启动的 `5173` 服务。
* 当前任务目录已创建，尚处于 `planning`，尚未执行 `task.py start`。
* `TemplateSchema` 当前包含 `_version`、`pageConfig`、`pages`、`output`、`data` 等字段，没有 document-level `styles`。
* `ComponentStyle` 已有 `fontSize`、`fontFamily`、`lineHeight`、`letterSpacing`、`fontWeight`、`fontStyle` 等组件级样式，以及 B1 的列字段。
* `RoyText` 内容以 `canonicalizeRichTextHtml()` 处理后的 HTML 持久化；安全 sanitizer 只允许受控标签和样式，空段落统一为 `<p><br></p>`。
* 现有 Tiptap 编辑器已经支持 heading 1–4、段落、对齐、列表、blockquote、字符级粗斜体/下划线/删除线、字体/字号/行高、颜色/高亮和链接。
* 设计器、组件渲染器、导出与服务端 PDF 共用同一组件 DOM/CSS/render bundle；新增排版字段不能只改编辑器 CSS。

## Assumptions (temporary)

* B2 首个切片聚焦 `RoyText` 富文本的段落级样式，不立即引入模板级命名样式引用关系。
* 段落间距与首行缩进应编码在 canonical HTML 的受控属性/样式中，并由 sanitizer、设计器与输出端共同支持。
* `RoySimpleText` 继续以纯文本换行/white-space 合同为主，不把富文本段落语义强行引入其中。

## Open Questions

* 具体的 Inspector 控件布局与默认/上限数值可在实现前按现有测量控件规范落地，当前不再阻塞总体方案。

## Requirements (evolving)

* B2 MVP 采用方案 A：为 `RoyText` 增加段落级排版能力。
* 首个切片覆盖段前间距、段后间距、首行缩进，并复用已有段落对齐能力。
* 设计器编辑态、Designer proof、Web 预览、Export DOM 与 Server Chromium PDF 必须共享同一 canonical HTML/CSS 语义。
* 旧版没有新增段落字段的富文本 HTML 必须继续可渲染；缺省行为保持现有视觉结果。
* 保持既有富文本 sanitizer 的安全边界，不允许通过新增排版属性重新开放脚本、远程资源或任意 CSS。
* 一次段落排版操作形成一个 history entry，并沿用现有 content-editing gesture 边界。
* 段落排版使用显式、受控的 HTML/data 属性表达，而不是把业务语义混入任意 CSS 字符串；渲染层再将其映射为固定 CSS。
* 显式属性必须经过 canonicalize、sanitizer 与 Tiptap parse/render 的同一条链路，旧 HTML 缺少属性时保持当前默认值。
* canonical 数值统一使用 PTD 画布 px；Inspector 的 mm/px 显示偏好只影响 UI，不改变持久化值。
* 首个切片支持 `paragraph` 与 `heading` 1–4 block；列表、blockquote 的专用段落间距策略留待后续细化。

## Acceptance Criteria (evolving)

* [x] RichText 段落可设置首行缩进，canonical round-trip、Designer proof、Web 预览和输出 DOM 一致。
* [x] RichText 段落可设置段前/段后间距；空段落 canonical `<p><br></p>` 仍保持可见行盒。
* [x] 不设置新字段的旧 HTML 输出保持兼容，非法/超范围排版值被拒绝或安全降级。
* [x] 段落排版操作沿用现有 content-editing gesture，可作为一次 coherent history mutation。
* [x] 统一 preflight / `TEXT_OVERFLOW` 仍读取新增排版后的实际 DOM 几何。
* [x] Core、Components、React Designer、Export/Server 相关检查与真实 Chromium Designer smoke 通过；Docker 不运行。

## Definition of Done (team quality bar)

* 相关 Core/Components/React Designer/Export/Server 测试覆盖行为与兼容性。
* 相关包的 lint、typecheck、构建与真实 Chromium smoke 通过。
* Docker 不作为本轮验证条件。
* 行为变化对应的 Trellis 规范或 roadmap 记录同步更新。
* 提交前检查 diff、回滚边界与旧模板兼容性。

## Out of Scope (explicit)

* 跨页面 linked text frames / 自动文本流。
* 完整 keep-with-next、widow/orphan、break-before/after 等分页算法，除非后续明确纳入本 MVP。
* 图表、图片印刷控制、数据格式化等其他 roadmap 能力。

## Technical Notes

* 相关 roadmap：[`.trellis/spec/monorepo/print-composition-capability-roadmap.md`](../../../spec/monorepo/print-composition-capability-roadmap.md)
* 输出契约：[`.trellis/spec/monorepo/output-architecture.md`](../../../spec/monorepo/output-architecture.md)
* React Designer 契约：[`.trellis/spec/monorepo/react-designer-contract.md`](../../../spec/monorepo/react-designer-contract.md)
* 主要代码入口：`packages/core/src/types/component-schema.ts`、`packages/core/src/schema-validation.ts`、`packages/components/src/components/richTextHtml.ts`、`packages/components/src/components/RoyText.ts`、`packages/react-designer/src/components/ContentEditor/ContentEditor.tsx`。

## Research References

* 当前阶段以仓库与 Trellis roadmap 研究为主；如选择 named styles 或分页规则，将在方案锁定前补充对应 research artifact。

* [`research/tiptap-paragraph-attributes.md`](research/tiptap-paragraph-attributes.md) — Tiptap 3.29.2 global attribute hooks and sanitizer mapping.

## Implementation Notes

* `@ptd/components` owns the explicit attribute names, bounded parser, canonical ordering and CSS-variable mapping.
* `@ptd/react-designer` extends the installed TextStyle extension with Tiptap global attributes and three unit-aware numeric controls.
* `@ptd/export` reuses the framework-free `RoyText` renderer; no second paragraph stylesheet or output-only transform was added.
* Server's full suite had one transient remote-database version-conflict failure; the failing test passed when rerun alone. Docker was intentionally skipped.

## Decision (ADR-lite)

**Context**：现有 Tiptap 已覆盖字符级设置与基础段落类型，但长文仍缺少首行缩进、段前和段后间距。模板级命名样式与分页规则会同时扩大 schema 和 export fragmentation 的范围。

**Decision**：B2 首个切片采用 RichText 段落级排版（方案 A），优先在现有 canonical HTML 和统一输出 bundle 上增量扩展；段落值采用显式受控属性，不把业务语义编码进任意 `style` 字符串；named styles 与分页规则延后。

**Consequences**：改动集中在富文本 schema/sanitizer、Tiptap 编辑器控件、共享 CSS 与跨表面测试，能较快获得可见收益；后续若引入 named styles，需要保留从段落级属性迁移到 style ID 的兼容路径。
