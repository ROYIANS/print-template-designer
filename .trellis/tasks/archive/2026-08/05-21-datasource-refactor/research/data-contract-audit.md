# Datasource v2 当前实现审计与跨层边界

## 审计结论

当前数据能力不是可继续小修的完整系统，而是 v1 兼容字段、一个字符串替换器、孤立的简单文本数据入口
和只读字段面板。下一步必须先建立单一 Core 合同，再让 Components、Designer 和 Web 向该合同汇合。

## 当前实现地图

| 层             | 当前事实                                                   | 风险                                                  |
| -------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| Core           | `TemplateSchema` 包含 `dataSource` 与 `dataSet`            | 定义、示例和运行时数据未分层                          |
| Core           | `DataFieldType` 同时包含 String/Array 和 Money/CurDateTime | 值类型与显示转换耦合                                  |
| Core           | `DataBindingEngine` 用正则替换 `[::field::]`               | 无结构化目标、嵌套路径、诊断或确定性上下文            |
| Components     | 只有 `RoySimpleText.resolveWithData()` 接受 Engine         | 普通渲染路径不调用，其他组件没有共享入口              |
| React Designer | Renderer 只向组件传 `ComponentSchema`                      | 运行时数据无法跨层到组件                              |
| React Designer | DataPanel 只读展示字段                                     | 无导入、绑定、记录切换或校样                          |
| Web            | 模板 API 已深层验证并版本化完整 Schema                     | canonical Schema 变更需同步 Web/Server 验证与历史流程 |
| Export         | 空 scaffold                                                | 不应在数据合同前定义派生页面/导出 API                 |

## 现有可复用资产

- `@ptd/core` 已经是运行时验证、序列化、内容 normalizer 和不可变命令的权威层；新数据合同应延续该模式。
- `ComponentRegistry` 已集中声明组件默认值与 Catalog 信息，可研究扩展为可绑定目标的单一事实来源，
  避免 Designer 和 Components 两份映射。
- Image、QR、Barcode 已有结构化内容、兼容 normalizer、验证和 loading/error/ready 生命周期；绑定求值后
  应复用这些函数，而不是另建数据专用校验。
- `TemplatePreview` 已被文件工作台与版本历史复用，应接受显式可选 Render Context，同时默认保持稳定、
  不携带 Editor 临时数据。
- `EditorStore` 已区分模板历史和实例 UI 状态；proof mode、record index、字段搜索与展开状态应进入后者。
- Inspector 已有封装输入、Segmented、Color、File Action、Popover/Portal 约束；数据 UI 应复用其交互语言。
- Web Document Controller 已以 Core canonical serialization 判断 Dirty；数据模型和示例数据的模板变更会自然
  进入该合同，而 record/proof UI 状态必须留在 Designer 内部。

## Legacy 可借鉴与必须放弃的部分

Legacy `DataSource.vue` 提供字段拖拽，`DataSourceMaintain.vue` 用大型 VXE 表格 Modal 编辑扁平字段；
`PtdViewer.vue` 和 `page-generator.js` 在浏览器中生成 HTML，再用 html2canvas + jsPDF 输出。

可以借鉴：

- 字段具有人类名称、机器字段名和值转换概念；
- 字段拖到组件是高效路径；
- 预览与设计画布分离；
- 固定、普通与重复元素对分页确实存在不同语义。

不能迁移：

- 扁平 CRUD 表格和大型阻断 Modal；
- `type` 中保存 JavaScript Constructor；
- 以字符串 HTML 作为跨层渲染结果；
- `innerHTML` 注入运行时数据；
- 组件内部或生成器内部隐式读取时间；
- html2canvas 把每页位图化后作为唯一 PDF 路线；
- 将自动生成页写入手工页面或 Designer 历史；
- 旧坐标、Vue Store、vxe-grid 与 v1 Viewer API。

## 推荐跨层数据流

```text
InputAdapter(JSON / future Excel / future REST / Host)
  -> validateRuntimeRecords
  -> inferDataModel (only when user requests import/model update)
  -> TemplateDataDefinition + optional bounded SampleRecords
  -> BindingDefinition + explicit RenderContext
  -> resolveComponentContent / diagnostics
  -> existing component normalizers and renderers
  -> Designer proof / future print / future export
```

### 边界责任

- Input Adapter：只把来源转换为 unknown records；未来连接安全不进入 Core。
- Core Validation：限制深度、字段数、记录数、序列化体积和不支持值。
- Field Inference：生成候选模型，用户确认后才修改模板。
- Binding Evaluation：纯函数、确定性、无网络、无 DOM、无副作用。
- Components：只渲染求值后的结构化内容并提供媒体就绪状态。
- Designer：管理导入、字段树、绑定、校样 UI 与实例态。
- Web：决定临时 Host 数据从哪里来；保持模板生命周期和错误表面。
- Server：本轮只透明持久化并验证 canonical TemplateSchema；未来独立管理外部连接和 Secret。

## 关键技术决策约束

### Canonical 数据模型

实现可以选择升级 `TemplateSchema` 或在兼容字段上建立明确新结构，但必须满足：

1. 一个 canonical 写入模型；
2. 所有读取先经过一个 Core normalizer；
3. v1 兼容输入只读归一化，不在预览时自动写回；
4. Web 和 Server 运行时验证调用或等价复用 Core 权威；
5. 未知未来字段具有明确拒绝或保留策略；
6. 版本恢复与 API round-trip 不丢绑定。

### 字段身份与路径

字段 ID 用于绑定稳定性，path 用于运行时取值。路径语法必须由 Core 解析，不依赖 `eval`。对象 key 中的点、
数组索引、缺失中间节点和 prototype pollution key 都要有测试。绑定找不到 Field ID 时返回诊断，而不是
悄悄改用不相关的同名字段。

### 格式化与时间

格式化接受 value + formatter + locale/timeZone/now，并返回结果或诊断。当前 `CurDateTime`、`BigCurDate`
隐式使用系统时间的行为只能作为 legacy normalizer 输入；canonical 模型用 Render Context 的显式 `now`。

### 安全

- JSON 仅接受可序列化数据；函数、Symbol、BigInt、循环引用与危险对象原型必须拒绝或安全规范化；
- 富文本插值按文本编码，不允许运行时 HTML；
- 图片绑定继续通过 `imageSourceError`；
- 绑定表达式没有代码执行能力；
- 未来 REST Secret 与响应抓取不进入本任务或浏览器模板。

### 性能与限制

字段推断与校样不能无限遍历。实现应以共享限制控制：

- 最大 JSON 字节数；
- 最大记录数；
- 最大字段节点数；
- 最大嵌套深度；
- 最大单字符串长度；
- 诊断数量上限。

限制值应在真实业务样例和现有 Server 请求体行为下确定，Core 导出统一常量，UI 使用同一值解释错误。

## 需要覆盖的失败矩阵

| 输入/状态          | 预期行为                              |
| ------------------ | ------------------------------------- |
| object 根          | 作为一条记录                          |
| object array 根    | 作为多条记录                          |
| 空 array           | 显示没有可推断记录，可保留空模型      |
| primitive 根       | 拒绝并说明需要对象或对象数组          |
| 混合 array         | 提供路径诊断，不假装结构可靠          |
| null/字段缺失      | 返回 missing 诊断，设计态可见         |
| 值类型变化         | 返回 mismatch 或按明确兼容规则格式化  |
| 失效 Field ID      | 不绑定到同名字段，保留 binding 并诊断 |
| 不安全图片地址     | 复用媒体安全错误                      |
| 条码内容不符合码制 | 复用 Barcode 错误                     |
| 切换记录           | 只改实例态，不发 `onChange`           |
| 导入并应用模型     | 一次模板历史操作                      |
| Host 临时数据      | 默认不保存，模板关闭后消失            |
| 版本历史预览       | 不继承当前 Editor 临时数据            |
| 外部模板替换       | 清除失效 proof/record/selection 状态  |

## 首轮实现调查顺序

1. 搜索所有 `dataSource`、`dataSet`、`DataBindingEngine`、`[::`、`request` 和组件内容 normalizer 使用点；
2. 设计 Core 类型、normalizer、validation、inference、evaluation 与 diagnostic 测试矩阵；
3. 证明现有 Renderer 能以最小公共改动接收显式 Render Context；
4. 证明结构化绑定不会破坏直接内容编辑、TableEditor 和 GroupRenderer；
5. 设计 DataPanel 的实例状态与模板 mutation 边界；
6. 最后再连接 Web Host 生命周期和真实浏览器校样。
