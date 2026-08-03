# 现有合同调研

## Core

- `@ptd/core` 已公开 `CURRENT_TEMPLATE_VERSION`、`serialize`、`deserialize` 与 `isTemplateSchema`。
- `serialize()` 是显式 canonical save boundary：把 legacy v0/v1 数据升级为 canonical v2，并通过深层 `isTemplateSchema()` 验证。
- `deserialize()` 会解析 JSON、拒绝未来版本、补全旧 page margin，并深层验证，但刻意保留兼容的 legacy dataSource/dataSet；若导入后需要 canonical 内存结构，可执行 `deserialize(serialize(deserialize(source)))`。
- `isTemplateSchema()` 会验证页面非空、组件类型与嵌套 Group、几何/样式数值、canonical/legacy 数据合同、字段路径、sampleRecords 与 bindings。

## 大小限制

- Server HTTP JSON body 当前限制为 4 MiB，位于 `apps/server/src/templates/template-contract.ts` 的 `TEMPLATE_JSON_BODY_LIMIT_BYTES`。
- 模板文件导入应使用同一数量级，避免本地可以打开但保存时必然失败；可把模板 Schema JSON 限制下沉为 Core 公共常量，Server HTTP envelope 常量继续作为兼容别名导出。

## React Designer Host

- Host 命令枚举已包含 `importTemplate` 与 `exportTemplate`，不需要扩展公共 command union。
- `useDesignerHostCommands.execute()` 会在点击执行时抓取最新的 `TemplateSchema`，因此导出能够包含尚未保存的画布修改。
- App Bar 文件菜单目前包含新建、打开、保存、另存为、版本历史；模板 JSON 交换应放在文件菜单，并使用明确文案与数据面板的“导入数据”区分。

## Web 文档生命周期

- `useDocumentController` 维护服务端 ID/version、saved/current baseline、dirty 状态、保存/另存为、并发冲突和路由同步。
- `shouldConfirmDocumentExit()` 与 Workspace `UnsavedDialog` 已形成未保存离开保护。
- 导入需要新增一个 controller 操作：取消正在进行的请求、移除 ID/version、设置 canonical imported template、标记为必须显式保存，并把路由同步到 `/app?new=blank`。
- 文件选择必须由 Host command 同步触发隐藏 input；解析完成后若当前文档 dirty，则先把已验证模板留在临时 state，通过现有阻塞对话框确认后再应用。

## 浏览器文件交换

- 导出使用 `Blob`、`URL.createObjectURL()` 与临时 `<a download>`，完成后移除节点并撤销 URL。
- 导出 JSON 由 Core `serialize()` 产生 canonical 内容，再以 2-space indentation 格式化，保留稳定键顺序和可读性。
- 文件名仅保留跨 Windows/macOS/Linux 安全字符，压缩空白、移除尾部点/空格、限制长度，并添加 `.foliq.json`。
- 导入错误映射在 Web 边界完成：语法、版本、缺少页面、合同错误、读取错误和 4 MiB 超限；最终接受条件仍由 Core 决定。
