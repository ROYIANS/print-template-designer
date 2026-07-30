# 核心组件创作能力——技术设计草案

## 当前实施状态（2026-07-30）

- 已在 `@ptd/react-designer` 建立单实例内容编辑状态：单击选择、双击进入，提交形成一个
  PTD 历史节点，取消不写入文档历史。
- `RoySimpleText` 已支持画布内多行纯文本编辑；`RoyText` 已接入 Tiptap 3.29.2 进行画布内
  富文本编辑。
- 编辑触发统一为“单击选择、双击编辑”；选中后的快捷工具条同时提供显式“编辑内容”入口，
  供触屏与辅助技术使用。创建完成自动进入编辑可作为绘制文本的效率例外，但普通单击不承担
  内容编辑，避免与选择、移动和属性检查冲突。
- 富文本仍保存经过白名单清洗的语义 HTML；Renderer 入口再次清洗，简单文本改用
  `textContent`，没有把 Tiptap 运行时带入 `@ptd/components`。
- 共享字体配置已覆盖属性面板和富文本工具栏；中文与西文字体可分别选择，最终组合为一个
  西文优先、中文回退的标准 `font-family`，所有字体均只引用用户本机安装项。
- 编辑态与展示态现在复用同一套 Renderer CSS Variables；字号合同沿用 Legacy 的印刷单位 `pt`，
  属性面板、富文本工具栏与 HTML 白名单均支持点数及 10.5pt 等办公常用字号。编辑 DOM 进一步
  复用 Renderer 的文本结构类与共享样式注入，避免空白画布首次编辑和激活前后的字号时序差异。
- 所有当时的 11 个目录组件均改为工具式拖框创建：四种 Shape 连续绘制，其余组件一次创建后回到
  Select；普通文本和富文本立即进入编辑，使用不写入 Schema 的空内容提示，QR 拖框始终保持
  正方形。
- Bubble Toolbar 已脱离组件裁剪上下文，挂载到 `document.body` 的固定浮层；工具栏和编辑
  表面使用统一的 `data-ptd-editor-interactive` 事件边界，避免画布手势抢占命令。
- 右键菜单及其层级子菜单现在作为 Portal 交互边界，不再被 Designer 根节点的焦点捕获或全局
  快捷键抢占，层级命令可正常悬停、点击和键盘选择。
- 空富文本保持为合法的 `<p></p>` 语义文档；编辑表面铺满绘制框并在创建后主动聚焦，点击框内
  任意空白位置均可直接输入。“输入文本…”仅为适配 ProseMirror 尾随 `<br>` 的界面提示，不写入
  Schema，也不再需要先从属性面板填写源码。
- 图片、二维码和条形码已建立 Core 公开内容类型、默认值、运行时守卫、兼容规范化与纯校验；旧图片
  字符串继续可读，首次编辑可惰性升级成包含 src/alt/fit/position 的结构化内容，并保持单手势 Undo。
- 图片 Inspector 支持 URL/Data URL、本地文件、替代文本、适配方式、对象位置和清除；拒绝持久化
  `blob:`/脚本协议/非图片 Data URL。二维码支持内容、纠错等级、静区和双色；条形码支持六种常见
  码制、内容、前景色和可读文字，并提供按码制即时校验。
- 三类 Renderer 不再静默空白：图片显示空态/载入/失败，编码显示生成中/内容错误/模块错误；QR 与
  条码异步渲染使用实例 token，旧 Promise 不能覆盖更新后的 Schema 或已销毁组件。
- 自由表格已使用 Core 规范模型：`grid` 的重复 Cell ID 表达矩形合并区，Cell Map 保存唯一纯文本与
  样式。默认插入生成真实 2×2 内容；旧 `tableConfig/tableData` 可安全归一化，旧 HTML 不再执行。
- 行列增删、合并拆分、行高列宽、文本与样式更新均为不依赖 DOM 的不可变纯函数，并通过至少一行
  一列、唯一 ID、矩形 Span 与完整坐标可寻址的不变量测试。
- 选中自由表格后可拖选单元格、Shift 扩展、方向键/Tab 导航、Enter/F2 或双击原位编辑；行列边界
  可直接拖动。Inspector 提供结构命令、内容、字体、对齐、内边距、颜色和边框，连续输入仍合并为
  一个 Gesture 历史节点，结构命令各自形成一个原子节点。
- `RoyComplexTable` 保留旧 Schema 只读 Renderer，但已从可创作 Registry 降级为目录规划项，避免在
  数据驱动、分区编辑与自动分页合同完成前高估成熟度。当前目录因此为 10 个可用项、8 个规划项。
- 自动验证：Core 38 项、Components 43 项、React Designer 95 项测试通过；分包 TypeScript 和
  Core → Components → React Designer 的依赖顺序构建通过。完整 Lint/Web 构建在最终收尾执行。

媒体与编码能力以及自由表格创作能力均已由用户在真实浏览器完成验收。自由表格的单元格选取、
原位编辑、结构命令、样式配置、边界拖动与 Undo/Redo 行为符合当前阶段预期；本任务的核心组件
创作能力已经达到归档条件。

## 分层结构

```text
@ptd/core
  typed prop contracts · guards · migrations · pure table commands
        ▲                                      ▲
        │                                      │
@ptd/components                         @ptd/react-designer
  deterministic DOM renderer              authoring overlays
  no React/editor dependency               edit-session state
                                            Tiptap candidate
```

`ComponentRenderer` 当前把每个非 Group 组件交给 Vanilla DOM Renderer。直接编辑不应把编辑器
塞进 `@ptd/components`，而应在 React Designer 中增加 Authoring Layer：普通状态继续挂载
Vanilla Renderer，进入内容编辑态后由 React 覆盖或替换对应的可编辑内容表面。

## 内容编辑会话

当前采用实例级 UI 状态：

```ts
interface ContentEditSession {
  componentId: string
  componentType: 'RoySimpleText' | 'RoyText' | 'RoySimpleTable'
  initialValue: unknown
  status: 'editing' | 'committing' | 'cancelling'
}
```

它不能进入 `TemplateSchema`，也不能成为模块级 Signal。进入会话时保存精确起点，退出时只有
Commit 或 Cancel 两条路径。

### 历史建议

- 普通文本：编辑表面持有本地 Draft；Commit 时调用一次 Store 更新。
- 富文本：Tiptap 维护会话内细粒度 History；PTD Store 只在会话结束时接收最终 HTML。
- 自由表格结构命令：每个增删/合并/拆分命令直接形成一个 PTD 原子历史节点。
- 如果后续需要实时 Host 草稿同步，再使用现有 `beginGesture` / transient update / `commitGesture`
  模式；第一版优先避免外部 `value` 回传导致富文本实例反复 SetContent 或光标跳动。

## 事件所有权

- 单击组件：选择。
- 双击可编辑内容：进入编辑。
- 编辑态 `pointerdown`、`click`、`dblclick`、文本拖选不冒泡到移动/框选逻辑。
- `isEditableTarget` 继续阻断画布全局快捷键。
- Composition Start/End 期间不解释 Enter/Escape 为 PTD 命令。
- 点击浮动工具条必须保留编辑器选区；工具条 Portal 使用 PTD Theme 与 Overlay Layer 合同。
- Escape：先交给编辑器关闭内部浮层；没有内部浮层时取消整个内容会话。

## 富文本持久化

本阶段建议继续以受限语义 HTML 作为 `RoyText.propValue`，原因：

1. 现有模板和 Renderer 已使用 HTML。
2. `@ptd/components` 可以保持无 React、无 Tiptap依赖。
3. 打印/预览阶段可以直接消费稳定的 HTML/CSS 子集。
4. 相比保存某个编辑器专属 JSON，Host 和 Server 不会被单一编辑器锁死。

代价是必须拥有明确的白名单规范、规范化测试和迁移策略。建议允许：

- 块：`p`、`h1`–`h4`、`blockquote`、`ul`、`ol`、`li`、`br`。
- 行内：`strong`、`em`、`u`、`s`、`span`、`a`。
- 属性：受控 class/style 属性、链接 `href/target/rel`。
- 协议：`http`、`https`、`mailto`；默认拒绝 `javascript:` 和未知协议。

字体、字号、颜色、背景、行高与对齐应被规范化到有限 CSS 属性，不保留从 Office/网页粘贴的
任意样式。保存前和 Renderer 边界均应执行同一套规范化/清洗策略。

## Tiptap Spike

Spike 不进入正式产品路径，目标是回答这些问题：

1. 组件处于 Canvas `scale()` 与 rotate transform 下时，光标与原生选择是否准确。
2. Bubble Menu 能否跟随选区，并被限制在 Canvas Viewport 内。
3. 中文、日文 IME 在 Enter、Escape、失焦、Toolbar 点击下是否稳定。
4. 外部选中/取消、锁定、组件删除和页面切换能否无泄漏销毁 Editor。
5. `getHTML()` → normalize/sanitize → setContent 的往返是否幂等。
6. Tiptap 内 Undo 与 PTD 外层单会话 Undo 是否符合预期。
7. 两个 Designer 和两个同时存在的 Rich Text Renderer 是否完全隔离。
8. 最小扩展集合的产物体积，以及是否需要仅在进入编辑时动态加载。

建议候选依赖（确认后再安装）：

```text
@tiptap/react
@tiptap/starter-kit
@tiptap/extension-text-style
@tiptap/extension-color
@tiptap/extension-highlight
@tiptap/extension-text-align
```

字体、字号和行高以 Tiptap 3 TextStyle 家族当前公开 API 为准；若缺少所需命令，则实现一个很薄的
受控 Attribute Extension，而不是引入整套第三方 UI Kit。

## 自由表格模型

Legacy 的表格已经证明了选择、合并、拆分、行列增删和单元格调整的产品价值，但 v2 没有复用其
DOM 测量和深度 Watch。表格命令已经实现为 `@ptd/core` 纯函数：

```ts
insertTableRow(value, at)
deleteTableRow(value, at)
insertTableColumn(value, at)
deleteTableColumn(value, at)
mergeTableCells(value, range)
splitTableCell(value, cell)
resizeTableColumn(value, column, width)
resizeTableRow(value, row, height)
```

每个函数返回新对象并维护不变量：至少一行一列、唯一单元格 ID、矩形合并区、无重叠合并区、
有效 Span、完整可寻址的可见/被覆盖单元格关系。

## 风险

- CSS Transform 下的 ContentEditable 浏览器差异是首要 Spike 风险。
- 富文本工具条 Portal 可能与 Component Quick Bar、Context Menu、Compact Scrim 发生层级冲突。
- Tiptap/ProseMirror History 与 PTD History 若同时拦截快捷键，会产生用户不可预测的 Undo。
- Raw HTML 清洗不足会形成存储型 XSS；过度清洗又会破坏视觉往返。
- Legacy 稀疏 `tableData` 会在读取时升级为完整规范网格；后续持久化迁移仍需决定何时提升全局
  `_version`，当前与图片结构化升级一致采用兼容读取和惰性写回。
- 图片 Data URL 会放大模板与版本快照；不能把它误认为最终资产方案。
