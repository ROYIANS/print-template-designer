# 富文本编辑器选型研究

日期：2026-07-30

## PTD 的实际约束

这不是普通表单中的文章编辑器。候选方案必须支持：

- 在可移动、缩放、旋转的打印组件框内直接编辑。
- 中文 IME、文本拖选、粘贴和上下文工具稳定。
- 选区 Bubble Toolbar 与完整排版控制均可自定义为 PTD 视觉。
- 会话内细粒度 Undo 与 PTD 文档级单步 Undo 分层。
- 输出可由框架无关 `@ptd/components` 渲染。
- 不把编辑器专属运行时或 React 节点写入 `TemplateSchema`。
- 可限制节点、Mark、链接协议和粘贴样式，形成安全、可打印的内容子集。

## 候选对比

| 维度             | Slate 0.126                                                     | Tiptap 3.29                                                | Lexical 0.49                                                        |
| ---------------- | --------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- |
| 定位             | 可高度自定义的编辑器框架，官方仍标注 Beta                       | 基于 ProseMirror 的 Headless 编辑器                        | Meta 的可扩展高性能编辑器框架                                       |
| React            | `slate-react` 原生集成                                          | `@tiptap/react` 原生集成                                   | `@lexical/react` 官方插件集                                         |
| 状态             | `Descendant[]`，当前 `value` 实际只是初始值，不再是标准受控组件 | ProseMirror/Tiptap 内部状态，通过命令与事件交互            | 不可变 `EditorState`，通常按非受控编辑器使用                        |
| HTML             | 官方示例要求应用自行递归序列化/反序列化                         | `getHTML()`、HTML Content 和 Schema 扩展是一等路径         | 通过 `@lexical/html` 导入/导出，JSON EditorState 更原生             |
| 工具条           | 完全自建                                                        | 官方 Bubble/Floating Menu 与 Chain Commands 很贴合选区工具 | 工具条、选区监听与定位主要由 Host 插件实现                          |
| 格式扩展         | 元素/Leaf/Normalize 自建，自由但工作量大                        | StarterKit + 独立 Extension，覆盖常见排版能力              | RichText/History/List/Link/Table 等插件完善，但组合 UI 仍需较多代码 |
| 历史             | `slate-history`                                                 | StarterKit/History 能力成熟                                | `HistoryPlugin` / `@lexical/history`                                |
| 与现有 HTML 合同 | 需要写双向转换层                                                | 最自然                                                     | 可行，但需维护 HTML 与 EditorState 语义映射                         |
| PTD UI 自定义    | 很高                                                            | 很高，Headless                                             | 很高                                                                |
| 工程负担         | 最高，编辑器行为和 HTML 合同都由 PTD 维护                       | 最低到中等，主要工作在扩展集合和 PTD UI                    | 中到高，需构建较厚的插件/HTML 适配层                                |
| 主要风险         | Beta、API/行为演进、Slate 自身并非完整编辑器                    | ProseMirror 体量、Portal/Transform/双历史需验证            | 内部 JSON 与 PTD HTML 合同可能形成双模型                            |

版本与许可证来自 2026-07-30 的 npm Registry：三者核心均为 MIT。Registry 的 `unpackedSize`
只表示包解压大小，不能当作最终浏览器 Bundle 大小；正式决策必须用 PTD Spike 构建产物实测。

## Slate

优点：

- 文档树、元素、Mark 和 Normalize 完全可控。
- React 渲染模型直接，适合有独特语义节点的编辑器。
- Legacy WangEditor 5 本身也间接证明 Slate 模型可覆盖中文富文本场景。

不适合作为当前首选的原因：

- 官方文档明确说明 `Slate` 的 `value` 现在只是初始值，“deceptively named”，编辑器已不是传统受控组件。
- HTML 序列化示例仍要求业务侧递归处理每一种 Node/Mark。
- 工具条、链接、粘贴规范化、列表行为和大量边缘交互都要自行实现。
- PTD 当前需要的是可靠的专业排版子集，而不是发明一套通用编辑器框架。

Slate 适合未来出现大量 PTD 特有的结构化内容节点、且 HTML 不再是主要合同的情形。

## Tiptap / ProseMirror

优点：

- Headless，不强迫使用通用编辑器皮肤，能完整复用 PTD 主题。
- HTML Content、`getHTML()`、Schema/Extension 与命令链是成熟主路径。
- 官方 React 组合 API直接支持 Bubble Menu 和 Floating Menu。
- StarterKit 提供段落、标题、列表、链接、常用 Mark 和历史基础；颜色、高亮、对齐等可以按需添加。
- ProseMirror 在 ContentEditable、选区、事务和 IME 方面有长期工程积累。
- 编辑器依赖可以只存在于 `@ptd/react-designer`，输出 HTML 交给框架无关 Renderer。

风险与控制：

- 必须验证 Canvas Transform/Rotate 下选区坐标和 Bubble Menu。
- 不采用 Tiptap 的成套模板 UI，只使用 Headless Core/Extensions，避免视觉与包体失控。
- 明确内部 History 与外层 PTD History 的快捷键所有权。
- Tiptap Schema 会过滤未注册结构，但不能替代 URL 与 HTML 安全策略；仍需规范化/清洗边界。
- 富文本不是常驻编辑器时，应评估按进入编辑态懒加载。

## Lexical

优点：

- 不可变 EditorState、更新监听、性能、错误恢复和可访问性设计优秀。
- 官方 React 绑定和 RichText、History、List、Link、Table 等插件完备。
- JSON EditorState 非常适合长期演进的结构化编辑模型和时间旅行。

当前不是首选的原因：

- PTD 现有 Renderer 与旧模板以 HTML 为合同；Lexical 更自然的持久化形式是专属 JSON EditorState。
- 若仍保存 HTML，需要长期维护 Lexical Node 与受限 HTML 的双向语义映射。
- 官方 Playground 很强，但 PTD 所需的选区工具、属性工具和粘贴策略仍需自行组合较多插件。

如果未来决定把 `RoyText.propValue` 正式迁移为编辑器 AST/JSON，Lexical 应重新进入首选比较。

## 其他方案

### WangEditor 5

Legacy 使用 `@wangeditor/editor@5.1.23`，其 npm 最新发布时间仍为 2022-11-14。它为旧 Vue 版本
快速提供了中文工具条和 HTML 输出，但旧实现只能在 Modal 中编辑，而且依赖旧 Slate 生态。
保留其交互经验，不继续作为 v2 React 核心依赖。

### Quill 2

Quill 的 Delta/HTML 生态和上手成本不错，但 PTD 需要高度定制的 Headless 选区工具、打印语义和
后续动态字段节点；Tiptap/ProseMirror 或 Lexical 的扩展模型更合适。

### CKEditor 5

功能最完整，但当前 npm 包体、许可证组合和成套编辑器架构对 PTD 的嵌入式 Headless 场景过重，
暂不进入 Spike。

## 初步结论

推荐顺序：

1. **Tiptap 3 + ProseMirror**：进入隔离 Spike。
2. **Lexical**：如果 Tiptap 在 Canvas Transform、包体或 HTML 规范化上失败，作为第二候选。
3. **Slate**：只有在决定自行掌控完整文档模型时采用，不作为当前默认。

该结论不是依赖安装授权。正式添加依赖前，先完成 PRD 阶段门中的 Spike 并让用户确认。

## Spike 实施证据（2026-07-30）

用户已确认 Tiptap 3、受限语义 HTML 和画布内直接编辑方向，并授权添加依赖。当前安装版本为
3.29.2，扩展集合限定在 StarterKit、TextStyle、FontSize、LineHeight、FontFamily、Color、
Highlight 与 TextAlign，没有采用第三方成套编辑器 UI。

第一轮真实页面验证发现 Bubble Menu 默认挂在 ProseMirror 父节点，因组件编辑表面的
`overflow` 和 Canvas transform 被裁剪，同时工具栏统一 `mousedown.preventDefault()` 破坏了
原生下拉控件交互。修正方案：

1. 使用官方 `appendTo` 将菜单挂到 `document.body`，Floating UI 使用 `fixed` strategy、flip/shift
   边界策略，避免组件滚动容器和画布缩放建立错误的裁剪/坐标上下文。
2. 格式按钮在 `pointerdown` 阶段保留选区并执行命令；键盘激活仍走 `click`，下拉框不再被
   全局 `preventDefault` 阻断。
3. 菜单与内容编辑表面共享 `data-ptd-editor-interactive` 标记，点击外部提交、组件选择与画布
   手势统一豁免该交互层。

生产构建实测：`@ptd/react-designer` ESM 约 262.54 KB（未 gzip），Web 主入口约 869.48 KB、
gzip 约 269.29 KB。现阶段 Tiptap 仍进入主包；在功能矩阵通过后，应单独评估编辑态动态加载，
但不能仅为数字减小而牺牲首次进入编辑的可靠性。

## 官方资料

- Slate React：<https://github.com/ianstormtaylor/slate/blob/main/docs/libraries/slate-react/slate.md>
- Slate Serialization：<https://github.com/ianstormtaylor/slate/blob/main/docs/concepts/10-serializing.md>
- Tiptap React：<https://tiptap.dev/docs/editor/getting-started/install/react>
- Tiptap HTML/JSON Output：<https://tiptap.dev/docs/editor/core-concepts/persistence>
- Tiptap Bubble Menu：<https://tiptap.dev/docs/editor/extensions/functionality/bubble-menu>
- Lexical React：<https://lexical.dev/docs/getting-started/react>
- Lexical Serialization：<https://lexical.dev/docs/concepts/serialization>
