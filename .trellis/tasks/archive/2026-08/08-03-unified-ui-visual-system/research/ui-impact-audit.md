# Foliq UI 视觉统一影响面审计

## 规范冲突

当前 `.trellis/spec/monorepo/ptd-ui-system.md` 与新方向存在直接冲突：

- 普通按钮、输入、列表行和面板被规定为 2px 圆角。
- 浮层和空状态最多 4px，不允许 8px 以上成为默认视觉。
- 按钮、列表项和普通面板被禁止添加阴影。
- “Physical press” 与若干控件合同鼓励 inset 底边，造成蓝色或深色下边条广泛出现。
- Inspector 合同强调边界与 sunken surface，但没有定义 form canvas / white field 的稳定双层关系。

因此必须先修改规范的设计原则、token、圆角矩阵、阴影矩阵、选中态和禁止模式，不能只改 CSS。

## 边框预算补充

用户补充 Figma 参考，要求 Form Field、普通 Button、底部工具栏与其他常规应用表面整体减少边框。
这不是 `border: 0` 的机械全仓替换：Canvas selection、参考线、表格网格、Paper 物理边界、focus / invalid
ring 与少量必要结构分隔具有功能语义，必须保留。应用 UI 的装饰性 Field outline、Section 连续分隔、
Dock 外框、普通 Button 外框和 Popover 外框应优先由 surface、spacing、shadow 与 typography 替代。

首轮 Inspector 审计必须区分：

- **删除**：默认 Field border、Section 重复 bottom border、普通 action outline、selection bottom bar。
- **替代**：Field 用白色 surface + field shadow；Section 用连续暖灰 + heading rhythm；selected item 用白色
  surface + selection shadow；overlay 用 overlay surface + shadow。
- **保留**：focus / invalid ring、颜色样本必要轮廓、表格网格、Canvas / Paper 功能边界。

## Token 现状

`packages/react-designer/src/components/Theme/Theme.module.css` 当前集中定义：

- `--ptd-radius-1: 2px`
- `--ptd-radius-2: 4px`
- `--ptd-radius-round: 999px`
- `--ptd-shadow-control: 0 2px 8px ... / 20%`，比用户给出的 field shadow 更重。
- 缺少 `surface-form`、`surface-field`、`shadow-field` 和按用途命名的 radius token。

代码扫描发现约 64 处直接使用 `--ptd-radius-1`，另有多处 1/2/4/6/8/10/12/14/16px 硬编码半径。
直接把 `radius-1` 从 2px 改成一个较大值会快速影响大量组件，但无法表达字段、浮层、外壳的层级差异；
更安全的做法是先建立语义 token，并为旧 token 提供迁移期 alias。

## 蓝色/深色底标记影响面

扫描到明确的 `inset 0 -Npx 0` 选中或激活样式分布在：

- `ContentEditor/ContentEditor.module.css`
- `DataPanel/DataPanel.module.css`
- `FloatingToolDock/FloatingToolDock.module.css`
- `PropertyInspector/PropertyInspector.module.css`
- `Sidebar/Sidebar.module.css`
- `StatusBar/StatusBar.module.css`

其中 Floating Main Dock、Shape/Text grouped menu、Inspector segmented、Table segmented 和 StatusBar unit
switch 使用墨蓝 selection bottom bar；DataPanel 与 Sidebar 还有中性 inset 底边。应按组件语义分别迁移到
完整 selection surface，不能仅全局删除 `box-shadow`，否则会丢失状态反馈。

## Inspector 现状

- `PropertyInspector.module.css` 超过 1100 行，承担 Page / Single / Multi / Table 和共享控件样式。
- 已有 `InspectorControls.tsx`，Number/Text/Select/Textarea/Color/Segmented 等可以从公共层统一迁移。
- Table 业务字段仍存在一组直接样式的原生 input/select/segmented，需要并入共享控制合同，避免完成首轮
  后右侧面板仍出现两套视觉。
- 当前 Inspector shell 与 field 都大量使用 `surface-raised`；Section body 没有稳定的暖灰 form canvas，
  白字段与白面板之间层级不足。
- focus、invalid、disabled、mixed、locked 和 coarse pointer 已有行为合同，视觉迁移必须保留这些状态。

## 设计器与 Web 影响面

- Header 的 menu/action 圆角当前为 6px，正好是用户认可的视觉锚点。
- Floating Tool Dock、Sidebar/Rail、StatusBar、DataPanel、ContentEditor、Canvas Quick Bar 都使用旧 radius 或
  inset selection，需要在 Inspector 稳定后按同一 token 迁移。
- `apps/web` 有独立 Home、Account、Save As、Version History、Output Preview 等 CSS Modules，并共享部分
  `--foliq-*` 宿主 token。若一次性改完所有页面，视觉回归面和截图矩阵会过大。
- Paper、Component Renderer 与输出 DOM 必须排除在应用 UI radius/shadow 迁移之外。

## 建议切片

1. 规范与 token：新 surface/radius/shadow/selection 合同，保留兼容 alias。
2. Designer Inspector：共享控件、Section canvas、Table 字段与状态测试。
3. Designer Chrome：Floating Dock、Rail、DataPanel、ContentEditor、StatusBar、Popover/Menu。
4. Web Host：文件工作台、账户、Save/History/Preview 等应用表面。
5. 收敛：删除旧 alias、扫描硬编码 radius/inset bar、完成跨视口视觉验收。

每个切片都应独立通过 lint、typecheck、tests、build 和浏览器截图，避免“大爆炸换肤”后无法定位回归。
