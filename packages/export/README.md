# `@ptd/export`

导出层的 package 位置已经预留，但**当前没有实现**。

`src/index.ts` 目前只有：

```ts
export {}
```

因此本包当前不能生成 PDF、不能调用浏览器打印、不能导出 Word，也没有 html2canvas/Puppeteer fallback。Legacy v1 曾有的导出能力不代表 v2 已迁移完成。

## 规划职责

未来导出层需要统一处理：

- 数据绑定后的预览模型。
- 表格数据流、重复表头与自动溢出分页。
- 打印样式、字体、图片和条码就绪状态。
- 浏览器打印与可复现 PDF 输出。
- Word 或其他格式的能力与降级边界。

其中自动分页应产生派生页面，不能改写 `TemplateSchema.pages` 或污染 Designer Undo/Redo 历史。

## 实现前必须先确定

- 浏览器端与服务端导出的职责边界。
- 输出一致性、分页精度、字体嵌入和资源加载策略。
- Server 是否需要无头浏览器，以及其容器体积与安全模型。
- 大数据量、批量打印、超时、取消和可观测性。
- API 与 Host 集成钩子的稳定契约。

在这些设计完成前，本包保持最小 scaffold，避免用临时实现锁死公共 API。

## 当前脚本

本包是 `tsc`-only scaffold，没有 tsup 配置和 Vitest 测试脚本：

```bash
corepack pnpm --filter @ptd/export typecheck
corepack pnpm --filter @ptd/export build
```
