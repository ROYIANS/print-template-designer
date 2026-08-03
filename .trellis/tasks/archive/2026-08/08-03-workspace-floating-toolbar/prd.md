# 编辑器悬浮底部工具栏与侧边栏重排

## Goal

参考 Figma 的画布工具排布，把 Foliq 工作台中高频的画布操作和组件插入能力集中到页面底部中央的
悬浮工具栏；左侧 Rail 只保留用于打开资源面板的入口，同时移除 Header 下方重复占用纵向空间的工具栏，
为纸张画布释放更多可用高度并建立更清晰的操作层级。

## What I already know

- 用户希望把左侧 Rail 中的鼠标/抓手迁移到底部悬浮工具栏。
- 左侧 Rail 只保留素材、页面、图层和数据四个面板入口，并统一排列在上方。
- 现有 Header 下方工具栏应被拆解并迁移，最终移除整行。
- 撤销/重做可以迁移到底部工具栏左侧或右侧。
- 当前可接受单层分组浮岛，或“主工具栏 + 小型次级层”的组合，但具体结构需要结合现有命令密度决定。
- 参考图的关键结构是：底部居中、悬浮圆角容器、工具分组、明确的当前工具状态和紧凑分隔。
- Foliq 必须保持现有暖纸灰、档案墨蓝、校样工具感和 Remix Icon 体系，不复制 Figma 的深色皮肤。
- 当前 `Sidebar` 把画布工具与资源面板入口混在同一个纵向 Rail；这两部分可以在不改变
  `EditorStore` 命令语义的情况下拆开。
- 当前 Header 下方 `Toolbar` 由历史、上下文命令和面板开关三部分组成；不能只删除 DOM，必须为三组
  能力分别安排新位置。
- 当前 Designer 是 `AppBar + Toolbar + Workspace + StatusBar` 四行布局，去掉 Toolbar 能直接把其高度
  归还给 Workspace。

## Assumptions (temporary)

- MVP 以桌面编辑器为主，不为移动端创造一套新的工具模型。
- 现有工具命令、快捷键、History、dirty 状态和组件插入语义保持不变，只重排入口与视觉层级。
- Header 继续承担品牌、文档级菜单、保存/预览/导出和账号入口，不吸收画布工具。
- 底部浮栏不得覆盖纸张的关键可操作区域，需要为画布滚动容器提供稳定的 bottom safe area。
- 上下文薄层保持常驻；无组件选中时显示页面上下文，选中组件、辅助线或绘制工具后切换为对应命令。
- Wide/standard 模式保留当前 Rail 中的文本、形状、图片、表格和更多组件快捷入口；compact 模式把
  图片与表格收进更多组件，避免浮岛横向溢出。

## Open Questions

- 无阻塞问题；首轮实现完成后根据真实页面截图继续微调尺寸、间距与阴影。

## Requirements (evolving)

- 左侧 Rail 仅保留素材、页面、图层、数据四个入口，并保持面板开关行为。
- 新增底部中央悬浮工具栏，至少承载选择、抓手、撤销、重做和现有组件插入能力。
- 移除 Header 下方的重复工具栏，迁移后不能丢失现有可见命令。
- 底部工具区采用双层结构：下方主浮岛常驻且具有较重的悬浮阴影；上方上下文薄层更窄、使用灰色
  托板表面且不使用边框或阴影。上下文薄层绝对定位在主浮岛后方，左右各内缩 24px 并向下搭接 5px，
  不能因上下文内容变长而反向撑宽主浮岛。
- 常规宽度下主浮岛稳定为 448px、工具居中，上下文薄层获得 400px 内容安全宽度；桌面上下文命令
  不得依靠裁切来维持层叠宽度。
- 单选上下文仅显示面向用户的组件目录类型和 X/Y/W/H，不展示自定义图层名称或 `RoySimpleText` 等
  内部 Schema 类型，也不重复组件 Quick Bar 已有的复制、锁定、层级和删除动作。
- 连续移动组件时，受控 Host 延迟回传任一 transient 模板对象都不能被误判为外部替换，组件必须
  保持选中并完成整个拖拽手势。
- 主浮岛按“历史 / 交互工具 / 创建工具 / 工作区”分组，组间使用细分隔，不让上下文切换改变主工具位置。
- 上下文薄层复用页面、单选、多选、辅助线和主动绘制工具的现有命令与提示。
- 组件快捷入口保持文本、形状、图片、简单表格和更多组件；完整组件目录继续通过更多组件 picker 访问。
- Compact 视口优先保留撤销/重做、选择/抓手、文本、形状、更多组件和属性面板，图片/表格仍可从
  picker 访问。
- 活跃工具、禁用操作、键盘焦点和 tooltip 状态必须清晰，不能只靠颜色区分。
- 使用现有 CSS Modules、token、Remix Icon 和受控编辑器状态，不新增第二套命令状态。

## Acceptance Criteria (evolving)

- [x] 左侧 Rail 只显示素材、页面、图层、数据四个面板入口，且均可正常开关对应面板。
- [x] 选择和抓手工具在底部浮栏可用，选中状态和快捷键行为与改造前一致。
- [x] 所有现有组件插入入口都能从底部浮栏访问，不丢失组件类型。
- [x] 撤销/重做在底部浮栏可用，禁用态与 History 行为不变。
- [x] Header 下方不再保留独立整行工具栏，画布获得额外纵向空间。
- [x] 主浮岛具有明确悬浮阴影，上下文薄层更窄、为灰色无阴影表面，两层在视觉上形成稳定搭接。
- [x] 单选上下文只显示组件目录类型与 X/Y/W/H，不重复画布快捷条动作、不暴露内部 Schema 类型，
      且桌面与紧凑视口均无内容裁切。
- [x] 受控 Host 下连续拖动组件不会因延迟模板回声丢失选中，整个手势只形成一个撤销节点。
- [x] 底部浮栏不会遮挡纸张内容、滚动条、选区控制柄或紧凑视口中的核心操作。
- [x] 键盘导航、tooltip、focus ring 和命令可访问名称通过现有测试约束。
- [x] React Designer 与 Web 的 lint、typecheck、tests、build 通过。

## Definition of Done (team quality bar)

- [x] 相关组件测试和 workspace 布局测试已更新。
- [x] Lint、typecheck、tests 与 build 通过。
- [x] PTD UI System / React Designer Contract 在产生新布局合同时完成同步。
- [x] 桌面和紧凑视口完成浏览器视觉验收。
- [x] 任务变更按逻辑批次提交，不包含无关用户文件。

## Out of Scope (explicit)

- 不改变模板 Schema、组件数据、保存协议或输出/PDF 引擎。
- 不新增画布工具类型或重新设计组件本身。
- 不复制 Figma 的深色主题、品牌颜色或权限提示条。
- 不在本任务中重做移动端完整编辑体验。
- 不实现用户自定义工具栏、拖拽排序或保存个性化工具布局。
- 不把页面/选区的完整属性编辑迁移到右 Inspector；本次只重排现有快捷命令。

## Technical Notes

- 参考图：`/var/folders/m6/x3vx_lld0kg8rcgth931pll40000gn/T/codex-clipboard-b51909e9-0499-45b8-bc68-697ba28c2c29.png`。
- 需要检查 `@ptd/react-designer` 的 AppBar、Rail/Sidebar、工具栏、组件目录和 workspace layout CSS。
- 需要保留 Host command、editor state 和 History 的单一事实来源。

## Research References

- [`research/canvas-toolbar-layout.md`](research/canvas-toolbar-layout.md) — 对比底部单层、两层与 Inspector
  迁移方案，推荐常驻主浮岛加上下文薄层。

## Research Notes

### Feasible approaches

- **A. 主浮岛 + 上下文薄层（推荐）**：主工具稳定；现有页面/选区/辅助线命令在上方薄层按状态切换。
- **B. 单层全量浮岛**：最接近参考图，但上下文变化会造成主工具跳位且紧凑视口过宽。
- **C. 单层主浮岛 + 上下文迁入 Inspector**：画布最干净，但会扩大为页面/属性信息架构重做。

## Expansion Sweep

- **未来演进**：两层内部使用稳定分组，后续可增加缩放、吸附或输出工具，但本次不开放自定义排序。
- **相关场景**：键盘快捷键、组件 picker、compact overlay 和右 Inspector 必须与新入口保持一致。
- **失败/边界**：浮岛需要 bottom safe area、窄屏收缩策略、Portal 层级和 Escape/focus 恢复，避免遮挡或
  焦点丢失。

## Technical Approach

- 将现有 `Toolbar` 重构为底部 `FloatingToolDock`，保留其中的上下文渲染函数和同一个 EditorStore。
- 将画布工具从 `Sidebar` 拆到主浮岛；`Sidebar` 只保留资源 Rail 与 panel slot。
- `Designer` 从四行 Grid 改为 `AppBar + Workspace + StatusBar`，并在 canvas/workspace 层挂载浮岛。
- 更多组件 picker 改为以主浮岛按钮为锚点并向上展开；不复制组件目录和最近使用逻辑。
- 通过 CSS custom property 为画布滚动区域提供与浮岛实际高度匹配的 bottom safe area。
- 视觉方向采用精密、克制的工业/校样工作台：暖灰主浮岛、深边界、较重扩散阴影、灰色无阴影薄层、
  档案墨蓝选中态和紧凑 Remix Icon。

## Decision (ADR-lite)

**Context**：单层浮岛无法稳定容纳现有页面/选区上下文；把所有上下文迁入 Inspector 又会扩大为完整
信息架构重做。

**Decision**：采用用户确认的“底部主浮岛 + 上方上下文薄层”。主浮岛位置与宽度稳定；上下文薄层
常驻但内容随 EditorStore 状态变化。上层比下层窄、灰色且无阴影，下层具有明显悬浮阴影。

**Consequences**：能够删除 Header 下方整行并保持现有命令完整；画布必须预留底部安全空间，compact
模式需要把低频创建工具收进更多组件。首轮落地后允许继续通过真实截图调整视觉参数，但不改变已确认的
双层信息架构。
