# 技术设计：Canvas-first 工作台

## 组件职责

- `Designer`：拥有实例级 workspace UI state，组合壳层并提供容器宽度/overlay 状态。
- `DocumentBar`：替代视觉上的旧 App Bar，保留文档标题、载入、保存和必要历史动作。
- `ContextBar`：替代静态全命令 Toolbar，依据页面/组件/多选/参考线选择渲染真实命令。
- `ToolDock`：高频创建与资源面板入口；创建仍调用 `componentCatalog/createComponentSchema`。
- `ResourcePanel`：Pages/Layers/Data/Assets 四类真实资源视图，复用 Panel 原语。
- `PropertyInspector`：保留单选/多选编辑，新增无组件选择时的 Page Inspector。
- `StatusBar`：承担当前页、页面尺寸、参考线状态和缩放。
- `Canvas`：本任务原则上只调整外围留白，不改变编辑、标尺或 Overlay 算法。

组件名可以在实现研究后调整，但职责边界必须保持。公开 API 仍只从 `src/index.ts` 导出
`Designer`，内部壳层不扩展为公共组件。

## Workspace UI state

UI state 不属于 `TemplateSchema`，也不应进入 EditorStore 的模板撤销历史。推荐在每个 Designer
实例中通过专用 hook 管理：

```ts
type ResourcePanel = 'pages' | 'layers' | 'data' | 'assets'

interface WorkspaceLayoutState {
  activeResource: ResourcePanel
  leftOpen: boolean
  inspectorOpen: boolean
  leftWidth: number
  inspectorWidth: number
  compactOverlay: 'resources' | 'inspector' | null
}
```

如果后续多个内部组件需要直接读写，可使用 Designer 内部 Context；禁止模块级 signals。UI state
变化不得调用 `onChange`，不得创建模板历史节点。

## 容器响应式

- Designer 根使用 `ResizeObserver` 或 container queries 感知自身宽度，而不是只读 `window.innerWidth`。
- CSS 负责视觉布局档位，React state 负责可访问的 open/close/overlay 语义。
- 紧凑模式下左右 overlay 互斥；打开一个会关闭另一个，Escape 清理当前 overlay。
- 不可见面板使用 `hidden`/`inert` 等语义避免焦点落入，而不是只移到屏幕外。

## 面板 resize

- 左宽建议范围 200–360px，默认 220px。
- Inspector 宽建议范围 280–420px，默认 304px。
- Pointer gesture 在 document 上监听 move/up/cancel，卸载和结束时可靠清理。
- 宽度通过 Designer 根的 `--ptd-resource-panel-width` / `--ptd-inspector-width` 注入。
- 面板折叠不重置用户最后宽度。
- 提供折叠按钮作为非拖拽替代；本任务不要求键盘连续 resize。

## 页面属性

Page Inspector 只修改现有 `PageConfig` 中可安全表达的字段。若需要通用命令，应在 EditorStore
新增带不可变提交和历史的页面配置更新方法，并补 Store 测试。方向变更继续复用 `setPageDirection`，
同时保持参考线物理边界修正。

## 验证顺序

1. `@ptd/react-designer` TypeScript、Vitest、ESLint。
2. 构建 `@ptd/react-designer`，检查 ESM/CJS/DTS/CSS 与 CSS Module 映射。
3. 再运行 Web TypeScript 与 Vite build，禁止与包 clean/build 并行。
4. 浏览器执行 1600×1000、1366×768、1024×768 和 200% 浏览器缩放验收。
5. 检查现有组件编辑、标尺/参考线、面板开合、overlay、键盘和滚动。

## 已知后续接口

- Data Proofing Dock：由数据/表达式/分页阶段提供真实状态后实现。
- Fit Page/Fit Width：需要 Canvas viewport 几何和缩放策略单独设计。
- 吸附：需要接入 ComponentAdjuster 手势与对齐线，不属于布局任务。
- Pages 增删/母版：属于多页支持任务；本任务只展示和选择现有页。

## 实现记录（2026-07-29）

### Workspace 与命令分层

- `useWorkspaceLayout` 通过 Designer 根 `ResizeObserver` 管理 wide / standard / compact 三档，
  阈值为 1440px 与 1180px；左右面板状态和宽度保持实例隔离。
- 左 Resource Panel 限制在 200–360px，Inspector 限制在 280–420px；compact 下两个 overlay
  互斥，并支持 Scrim / Escape 关闭。
- Document Bar 收敛为 36px，Context Bar 为 40px，Status Bar 为 24px；缩放迁移到状态栏。
- Context Bar 已覆盖 Page / Single / Multi / Guide 四种真实上下文，不使用 Unicode 伪图标或
  不可执行的预览/校样占位。

### 资源、页面与创建反馈

- Tool Dock 提供高频创建和 Pages / Layers / Data / Assets 入口；资源面板复用真实 Catalog、
  页面、图层和数据源。
- `EditorStore.setCurrentPage` 只切换编辑会话页并清理选择/参考线，不产生模板历史节点。
- 点击 Dock / Catalog 创建组件后，Store 发出一次性 `componentToReveal` UI 请求；新组件挂载后
  Canvas viewport 平滑居中并消费请求。拖拽创建保留用户落点，不触发强制居中。
- reveal、面板开合、面板宽度、标尺/参考线编辑状态均不写入 `TemplateSchema`。

### 字体交付

- 示例 Web 自托管完整 `SarasaUiSC.ttf`，通过 `@font-face` 提供中文 UI 字体。
- Outfit 与 Noto Serif SC 通过 Google Fonts 引入；公共 Theme 同时保留系统与宿主 fallback。
- 画布示例的衬线字体改为 Noto Serif SC；可复用包不捆绑 24MB CJK 字体。

### 标尺测量与跨屏框选

- 标尺 Hover 通过 `Ruler` 本地状态显示当前新建颜色的低透明参考线和 0.1mm 位置标签；点击或
  拖动后才进入 EditorStore 的参考线会话，临时预览不创建模板或会话历史。
- 固定参考线始终挂载位置标签，选中或 Hover 时通过 CSS 显示，锁定参考线仍可读取其位置。
- 框选以未缩放纸张坐标保存起点，每次指针移动和 Canvas viewport 自动滚动后都读取实时 Paper
  矩形重新换算；坐标限制在页面范围，滚动跨屏后仍与指针保持一致。
- Canvas viewport 边缘使用 36px 渐进滚动区，最大速度 20px/帧；鼠标松开、窗口失焦和组件卸载
  都会取消动画帧及 document 事件。框选填充降为 6% 选中色，组件内容保持可辨认。

### 组件边界状态

- `ComponentAdjuster` 不再使用参与盒模型的 1px 实体边框，组件容器获得完整 Schema 宽高，避免
  文本换行、表格列宽和细线位置被编辑 Chrome 各压缩 2px。
- 未激活组件常态不显示边界；Hover 通过 `::after` 显示 48% 钴蓝虚线和 4% 钴蓝蒙版，伪元素
  `pointer-events: none`，不会拦截选择、拖动或组件内部事件。
- 激活组件继续使用实线钴蓝边界、弱外环、控制点和 Quick Bar；锁定激活态仍使用点线边界，
  视觉语义保持不变。所有编辑边界均由不影响内容尺寸的 Overlay 绘制。

### 验证结果

- `@ptd/react-designer` TypeScript、ESLint、构建通过。
- Vitest：7 个测试文件、33 个测试通过。
- Web TypeScript 与 Vite production build 通过；已有 `bwip-js` 大 chunk 提醒留给性能阶段处理。
- 浏览器已检查 1600×1000、1366×768、1024×768 的 Page / Single / Multi / Locked、资源
  overlay、Inspector overlay、字体加载、画布滚动与点击创建视口追随。
- 额外以 800×500 与 512×384 CSS 视口复核高倍浏览器缩放；移除旧壳层硬最小尺寸后，Document
  Bar、Context Bar、Tool Dock 和 Status Bar 均保持可达，纸张由唯一 Canvas viewport 滚动。
