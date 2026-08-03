# 统一 Foliq UI 视觉体系与设计器表单

## Goal

重新定义 Foliq 的 UI 视觉合同，减弱当前设计器偏生硬、偏工程控件化的观感，在不牺牲专业打印
工作台的信息密度、可访问性和精确性的前提下，吸收 HeroUI 的中等圆角、柔和分层表面与轻质感阴影，
并以设计器右侧 Inspector 表单为重点，将统一后的 token 和组件状态逐步应用到整个系统。

## What I already know

- 当前 `.trellis/spec/monorepo/ptd-ui-system.md` 明确偏好 2–4px 小圆角、细边界和克制阴影，和用户新的
  视觉偏好存在冲突，需要先更新规范再改代码。
- 用户认可 Header 中“文件工作台”按钮的圆角尺度，希望常规 UI 接近该尺度或略小，整体对应
  Small / Medium / Large 中的 Medium，而不是大胶囊或超大圆角。
- 用户不喜欢 Tab、输入控件或工具按钮选中时出现蓝色底边条；状态应改用完整表面、边界、文字、图标
  或焦点环表达，不能用 inset 蓝色底标记。
- 目标方向参考 HeroUI：表单区域使用灰色原色背景，输入框、选择框等控件使用白色背景，通过轻阴影
  获得层次和质感。
- 用户提供的输入控件参考阴影为：
  `0 2px 4px rgb(0 0 0 / 4%), 0 1px 2px rgb(0 0 0 / 6%), 0 0 1px rgb(0 0 0 / 6%)`。
- 改造重点是 `@ptd/react-designer`，尤其是右侧 Inspector 的表单 UI；最终范围希望覆盖系统中所有
  受统一 UI 规范约束的界面。
- Foliq 仍需保留暖纸灰、档案墨蓝、校样工具感、Remix Icon 和专业制版工作台定位，不直接复制
  HeroUI 的品牌蓝、通用 SaaS 布局或 Tailwind 技术栈。

## Assumptions (temporary)

- HeroUI 是视觉与交互参考，不在本任务中直接引入 `@heroui/react`、Tailwind CSS v4 或第二套组件状态。
- 先重构公共 token 与 InspectorControls，再迁移设计器 Chrome 和 Web 宿主；不会一次性用散落的 CSS
  覆盖完成全系统换肤。
- 现有 Schema、编辑命令、History、输出/PDF DOM 与画布内容样式不因 UI 换肤而改变。
- 圆角和阴影用于应用 UI，不进入 Paper、打印预览或导出结果。
- 磨砂材质只作为少量真实悬浮 Chrome 的可选增强，不进入 Inspector 表单、Paper、Canvas 或 output DOM。

## Open Questions

- 无阻塞问题；完整视觉合同与第一阶段实施计划已获用户确认。

## Requirements (evolving)

- 先更新 PTD UI System 中关于圆角、阴影、输入表面、选中态和禁止模式的合同，再实施组件改造。
- 建立语义化圆角 token，常规输入和按钮使用 Medium 感知尺度，避免现有 2px 锐利观感。
- 圆角采用语义阶梯：4px 用于微型内部控件，6px 用于常规 Field / Button / Tool item，8px 用于
  Disclosure / 普通 surface / Floating Main Dock，12px 用于 Popover / Dropdown / Context Menu，14px
  用于 App Bar / Modal / Sheet 外壳，999px 只用于 Switch、头像、状态点和真正圆形控件。
- 旧 `--ptd-radius-1/2` 在迁移期作为兼容 alias 保留；新代码与已迁移组件使用用途命名的 radius token，
  完成 Designer / Web 扫描并确认不影响 Canvas / output 后才删除旧 alias。
- Inspector 常规 Input、Select、Number、Color 与同级可编辑字段统一为 32px 高；表格内部或明确标记为
  compact 的微型字段允许 28px，coarse pointer / touch target 继续为 40px。常规字段使用 6px 圆角，
  不直接照搬 HeroUI 36px 字段而牺牲专业设计器的信息密度。
- 移除 Tab、Segmented Control、Floating Main Dock 等选中状态的蓝色下边条。
- Floating Main Dock 使用近黑半透明背景、14px 单层受控 blur 与用户指定的四层深色表面阴影；Context
  Shelf 继续使用暖灰无阴影背景。两层工具激活态采用档案墨蓝主色实底和白色前景，不使用边框或选中阴影；
  Tabs、Rail 和 Status Bar 的默认选中态继续采用中性抬升合同：灰色承载层中显示白色
  完整 selection surface 和浅阴影。Inspector 的 Button Group / Segmented 使用相反的嵌入合同：整条为
  白色 field track，当前项回落到 Inspector 暖灰背景，并使用低对比中性完整边界、无阴影。两者都只让
  档案墨蓝承担选中文字、图标和必要标识，不使用蓝色下边条或大面积浅蓝填充。
- 画布对象选框、参考线和键盘 `focus-visible` 环继续使用档案墨蓝，因为它们表达精确编辑目标与键盘
  焦点，不属于 Tab / Segment 式的常驻选中装饰。
- `--ptd-focus` 保持 Foliq 档案墨蓝色相，但从普通 Action / Selection token 中独立校准亮度和对比度，
  确保在无边界白色 Field 与暖灰画布上形成清晰完整焦点环；不引入 HeroUI 品牌亮蓝或第二套交互蓝。
- 表单分区使用柔和暖灰背景，输入、Select、Textarea、Stepper、Color 等可编辑控件使用白色 raised
  surface 和统一轻阴影。
- Inspector 使用连续暖灰表单画布；Section 通过标题、间距和克制分隔组织，不为每个 Section 再增加
  独立白色 Card。相邻 Section 之间使用左右内缩、低对比的单一 1px 结构分隔线；白色只用于 Field 和
  被选中的抬升表面，避免卡片嵌套。
- Field 默认态采用白色 surface、无可见边界和近乎不可见的 field shadow；hover、focus 与 invalid 才
  提升到用户提供的 HeroUI 参考阴影，不引入常驻轮廓。`focus-visible` 与 invalid 另使用不参与盒模型的
  完整 ring / outline 和关联文字，Disabled / locked 降低 surface 与 shadow 层级但仍保持字段可辨识。
- 阴影按语义层级分配：Field 与白色 selection surface 使用浅 shadow；普通 Button、Tool item 和 List
  item 默认保持平面；Primary / Danger Button 通过完整语义填充表达层级；Popover / Modal / Floating
  Dock 使用各自更高层级的 overlay / modal / dock shadow。禁止把 field shadow 全量复制给所有按钮。
- 应用 UI 采用“无边框优先”的边框预算：Form Field、普通 Button、Tool item、List item、Selection
  surface、Floating Main Dock、Popover / Menu 默认无可见边框，优先通过 surface、间距、排版和 shadow
  建立层级。只有 focus、invalid、Canvas selection、参考线、表格网格、Paper 边界或无法由表面/空间区分
  的必要结构分隔可以使用线；装饰性框线、重复 Section border 和为每个控件添加轮廓均禁止。
- App Bar、Floating Dock、Popover / Menu、Modal / Sheet 等确实覆盖内容的少量 Chrome 可以使用受控
  `backdrop-filter`；同一视觉堆栈最多一层，并提供高不透明度实色 fallback。Inspector form / Field / Section、
  普通 Panel、Resource Panel、Paper、Canvas、模板预览和 output DOM 不使用 blur。
- 保留清晰的 hover、focus-visible、active、disabled、invalid、mixed 和 locked 状态；状态不能只靠颜色。
- 统一设计器右侧 Page / Single / Multi / Table Inspector 的共享控件，不允许业务面板各自重新拼视觉。
- 采用带验收 checkpoint 的自适应交付：第一阶段只实施规范、语义 token 与完整 Inspector 表单试点；
  用户满意后，将剩余 Designer Chrome 和 Web Host 合并为一次全系统迁移。若试点未通过，只迭代公共
  视觉合同，不把未确认样式扩散到其他区域。
- 视觉改造不得改变模板数据、编辑器命令、Host 合同、撤销历史或打印输出。

## Acceptance Criteria (evolving)

- [ ] UI 规范给出可执行的圆角、表面、阴影、边界、焦点和选中态 token 及使用矩阵。
- [ ] 常规控件不再使用 2px 锐利圆角，且不会退化为大面积 pill / 胶囊化界面。
- [ ] 4 / 6 / 8 / 12 / 14px 语义圆角在 Field、Control、Surface、Overlay、Shell 上按矩阵使用，
      非 Switch / Avatar / Status / 圆形命中区域不使用 999px pill。
- [ ] Inspector 常规字段为 32px、明确 compact 字段为 28px、coarse pointer 字段为 40px；不同高度
      共享相同的表面、圆角、阴影和状态合同，不出现第三套业务面板尺寸。
- [ ] Tab、Segmented Control 和工具按钮选中态不再显示蓝色底边条。
- [ ] Floating Main Dock 与 Context Shelf 使用档案墨蓝主色激活面和白色前景；Tabs、Rail 与 Status Bar
      使用中性白色抬升选中面；Inspector Button Group 使用白色整组 track + 暖灰当前项 + 低对比中性完整边界。Canvas selection
      与 focus-visible 仍清晰可辨。
- [ ] Inspector 为连续暖灰表单画布，Section 不形成白色 Card 嵌套；输入类控件为无可见边界的白色
      raised surface，并使用统一浅阴影。
- [ ] Input、Select、Number、Textarea、Color 和同级字段共享 default / hover / focus-visible / invalid /
      disabled / locked ring 与 shadow 矩阵，状态变化不引起布局位移。
- [ ] 普通 Button / Tool item / List item 不使用 field shadow；Field、selection surface、overlay、modal 和
      dock 的 shadow 层级可通过 token 和浏览器 computed style 区分。
- [ ] Inspector Field / Section、普通 Button、Floating Main Dock、Selection surface 和 Popover / Menu
      默认无可见边框；保留的线均可对应到 focus、invalid、Canvas、table、Paper 或必要结构分隔语义。
- [ ] 局部磨砂只出现在真实悬浮 Chrome，并有不支持 `backdrop-filter` / reduced transparency 时的实色
      回退；不存在嵌套、全屏或 Canvas 大面积 blur，打印与导出树不受影响。
- [ ] Focus ring 在白色 Field、暖灰画布和深色 Header 上均达到可辨对比度，并保持单一 Foliq 档案墨蓝
      色相；非聚焦的选中项不显示常驻蓝色完整边框。
- [ ] 第一阶段提供可独立验收的真实 Inspector 页面；未获得视觉确认前不批量迁移剩余系统。
- [ ] Page、Single、Multi、Table Inspector 的共享控件在默认、hover、focus、disabled、invalid、mixed、
      locked 状态下保持一致且可访问。
- [ ] 设计器宽屏、标准与 compact 视口无裁切、无布局回归；200% 浏览器缩放仍可操作。
- [ ] 画布 Paper、模板 Schema、预览和输出结果不受应用 UI 样式迁移影响。
- [ ] ESLint、typecheck、相关 Vitest、包构建和 Web 生产构建通过。

## Definition of Done (team quality bar)

- [x] 用户确认视觉合同与首轮改造范围。
- [ ] 相关 UI token、共享控件和状态测试已更新。
- [ ] 关键页面完成浏览器视觉验收与前后截图对比。
- [ ] PTD UI System / React Designer Contract 与实现保持一致。
- [ ] 任务变更按逻辑批次提交，不包含无关用户文件。

## Out of Scope (explicit)

- 不将 Foliq 迁移到 Tailwind CSS 或直接替换为 HeroUI 组件库。
- 不复制参考图中的品牌蓝、Inter 字体或通用登录/社交卡片布局。
- 不改变画布组件、模板纸张、打印预览和 PDF 的视觉内容。
- 不在视觉统一任务中重写编辑器业务命令、数据模型或后端 API。

## Technical Notes

- 主要规范：`.trellis/spec/monorepo/ptd-ui-system.md`、
  `.trellis/spec/monorepo/react-designer-contract.md`、
  `.trellis/spec/monorepo/styling-conventions.md`。
- 重点代码预计包括 `packages/react-designer/src/components/Theme/Theme.module.css`、
  `InspectorControls/`、Page/Single/Multi/Table Inspector、Tabs/Segmented 控件、FloatingToolDock 和 App Bar。
- 参考图：`/var/folders/m6/x3vx_lld0kg8rcgth931pll40000gn/T/codex-clipboard-f5d832e6-e431-4566-a3e9-299847cbcd31.png`。
- 无边框参考图：`/var/folders/m6/x3vx_lld0kg8rcgth931pll40000gn/T/codex-clipboard-d52f3d5a-c05f-40d9-9f38-0d43af51f941.png`。
- HeroUI v3 使用 Tailwind v4 + React Aria；本项目使用 CSS Modules + Radix，因此只提取视觉合同和
  可访问状态原则，不引入其运行时技术栈。

## Research References

- [`research/heroui-form-visual-contract.md`](research/heroui-form-visual-contract.md) — HeroUI v3.0.5
  的灰背景、白字段、field shadow 和完整 selection surface 如何映射为 Foliq 的 6px Medium 控件体系。
- [`research/ui-impact-audit.md`](research/ui-impact-audit.md) — 当前规范冲突、64 处旧圆角 token 使用、
  7 个底标记样式区域以及 Inspector / Designer Chrome / Web Host 的迁移切片。

## Research Notes

### 已确认的视觉尺度

- Header “文件工作台”同类按钮当前是 6px 圆角，与用户偏好一致，可作为常规控件 Medium 锚点。
- 建议语义尺度为：微型内部控件 4px、常规输入和按钮 6px、表单分区和普通 surface 8px、Popover/
  Dropdown 12px、App Bar / Modal / Sheet 外壳 14px、真正圆形控件 999px。
- HeroUI v3 默认 base radius 是 8px，field radius 推导为 12px；Foliq 只吸收其柔和层级，不完整照搬
  12px 字段和 pill Button，避免专业设计器过度圆润。
- 用户给出的 shadow 与 HeroUI v3.0.5 官方 `--field-shadow` 完全一致，应建立为单一
  `--ptd-shadow-field` token。

### 当前实现影响面

- `--ptd-radius-1` 被大量控件复用，不能只改一个数值后结束；需要按 field / control / surface /
  overlay / shell 迁移到语义 token。
- 明确的 inset bottom indicator 分散在 Floating Dock、Inspector、ContentEditor、DataPanel、Sidebar 和
  StatusBar；必须逐个替换为完整 surface 状态并保留 focus/disabled/invalid 可访问反馈。
- Inspector 已有共享 `InspectorControls.tsx`，适合作为第一实施切片；Table 字段仍有一组业务层原生
  控件样式，需要同时收口，才能真正统一右侧表单。

### Feasible approaches

**A. 全系统目标、分阶段交付（推荐）**

- 当前任务作为总任务，先锁定规范与 token，再依次完成 Inspector、Designer Chrome、Web Host 和收敛扫描。
- 每个阶段独立截图、测试和提交；发生视觉偏差时能精确回退，不会把所有页面同时置于半成品状态。
- **用户选择**：先执行此方案。完成规范、token 与 Inspector 试点后设置一次视觉验收 checkpoint；若用户
  满意，则直接切换到方案 B 的交付速度，一次完成剩余 Designer Chrome 与 Web Host。

**B. 一次性全系统改造**

- 一轮修改所有设计器与 Web CSS，再做统一验收。
- 最快看到完整覆盖，但影响文件多、对比困难，任何 token 决策失误都会放大全系统返工。

**C. 只做规范与 Inspector MVP**

- 本任务停在右侧表单，其他区域以后另开任务。
- 风险最小，但会暂时保留新旧两套视觉，不能满足“整体 UI 统一”的最终目标。

## Expansion Sweep

- **未来演进**：语义 token 应支持未来暗色主题和宿主覆盖，但本轮只交付 Light theme，不为尚未存在的
  dark UI 增加第二套未经视觉验收的实现。
- **相关场景**：Popover/Menu、compact overlay、键盘 focus、invalid/mixed/locked 和 coarse pointer
  必须与字段迁移同步，不能只验收静态默认态。
- **失败与边界**：必须隔离 Paper / Renderer / Preview / PDF，防止全局 radius/shadow token 污染打印内容；
  每个阶段保留兼容 alias，完成扫描后再删除旧 token。

## Technical Approach

### Phase 1 — 规范、Token 与 Inspector 试点

1. 先更新 `ptd-ui-system.md` 和 `react-designer-contract.md`，删除 2/4px、小浮层与普通控件禁 shadow、
   inset bottom selection 与边框优先等冲突合同，写入新的 radius / surface / field / selection / focus /
   border-budget 矩阵。
2. 在 `Theme.module.css` 增加语义 surface、radius、field shadow、selection shadow 与独立 focus token；
   保留旧 radius alias，避免未迁移区域与 Canvas 被一次性改变。
3. 以 `InspectorControls.tsx` 与 `PropertyInspector.module.css` 为唯一共享表单层，落地 32 / 28 / 40px
   size variant、连续暖灰 form canvas、白色无边界 field、shadow 与完整状态 ring。
4. 将 Table 业务层直接维护的 input / select / segmented 样式并入共享合同；Page / Single / Multi / Table
   不得留下第二套字段外观。
5. 更新 token / CSS contract / Inspector 状态测试，在 wide / standard / compact、默认 / hover / focus /
   invalid / disabled / locked / mixed 与 200% 浏览器缩放下完成真实页面截图验收。
6. 在 checkpoint 暂停批量迁移，由用户确认视觉结果。

### Phase 2 — 满意后加速全系统迁移

1. 一次迁移 Designer Chrome：Floating Dock、Toolbar Context Shelf、Rail / Resource Panel、Data Panel、
   Content Editor、Status Bar、Quick Bar、Popover / Menu / Tooltip。
2. 一次迁移 Web Host：文件工作台、账户 Popover、Save As、版本历史、Output Preview 和应用级表单。
3. 扫描并清理应用 UI 中旧 radius alias、硬编码小圆角和 inset bottom indicator；保留 Canvas / output
   所需的精确几何与独立样式。
4. 执行完整 lint、typecheck、tests、build 和跨视口浏览器验收，再按逻辑批次提交。

## Implementation Plan (small commits)

- Commit 1：`docs: redefine foliq ui visual contract` — 规范、PRD 与研究合同。
- Commit 2：`feat: add semantic ui surface and radius tokens` — Theme token 与兼容 alias。
- Commit 3：`feat: restyle designer inspector controls` — InspectorControls、Table 收口和相关测试。
- Checkpoint：真实页面前后截图，由用户决定微调 Phase 1 或直接执行 Phase 2。

## Decision (ADR-lite)

**Context**：全系统一次性换肤能快速覆盖，但在圆角、field shadow 和 selection surface 尚未经过真实
Inspector 验收时，会把一次视觉判断放大成全仓返工；只做 Inspector 又不能满足最终统一目标。

**Decision**：采用自适应分阶段策略。第一阶段实现规范、语义 token 与完整 Inspector 试点；用户视觉
验收满意后，直接合并后续 Designer Chrome 与 Web Host 阶段，按一次全系统迁移执行。

**Consequences**：首轮保留清晰的低成本校准点；一旦方向确认，后续不再为每个小区域逐次等待，仍能
快速完成全系统统一。Paper、Renderer、Preview 与 PDF 始终不进入迁移范围。

### Selection surface

**Context**：现有 Tabs、Segmented、Dock 和 Status Bar 通过墨蓝 inset bottom bar 表达选择，形成用户
不喜欢的蓝色下边条；全面使用浅蓝填充又会提高工作台的蓝色视觉重量。

**Decision**：导航类 Tabs、Dock、Rail 与 Status Bar 使用中性抬升态：灰色 track 中的当前项为完整白色
surface 与浅阴影。Inspector Button Group / Segmented 使用嵌入态：整组白色，当前项为 `surface-form`、
低对比中性完整边界且无阴影。墨蓝只用于选中文字、图标和必要标识；禁止 inset bottom indicator。

**Consequences**：导航选择与表单枚举分别表达“抬升”和“嵌入”，但共享中性 surface 与墨蓝前景；
Canvas 对象选框、参考线和 focus-visible 环不受此规则影响，继续提供精确与可访问反馈。

### Inspector field density

**Context**：现有字段大多为 28px，HeroUI 常规字段约为 36px。前者配合新的 6px 圆角和 field shadow
略显拥挤，后者会显著减少 304px Inspector 每屏可见字段数量。

**Decision**：用户选择平衡密度：常规字段 32px，明确的 compact / 表格内部字段 28px，coarse pointer
和触屏字段 40px。

**Consequences**：第一阶段需要让 `InspectorControls` 统一承载 size variant，并把 Table 业务层直接样式
迁回共享合同；不能让 Page / Single / Multi / Table 分别维护不同默认高度。

### Field boundary and elevation

**Context**：HeroUI Primary field 主要依赖白色表面和 field shadow，聚焦后才出现完整高对比 focus ring。
用户补充的参考图确认 Select 默认无可见边界，Input 聚焦时显示完整蓝色环。

**Decision**：用户覆盖此前的“极淡完整边界”选择，改为无边界 + 分级浅阴影。默认使用白色 field
surface 和近乎不可见的 `--ptd-shadow-field`；hover/focus/invalid 提升到用户提供的原 HeroUI 参考阴影，
focus-visible 与 invalid 同时使用不参与盒模型的完整 ring / outline 和文字反馈。

**Consequences**：Field 不通过 `border-width` 切换状态，必须使用 outline 或多层 box-shadow ring，避免
布局位移；业务面板不得复制 raw shadow，也不得重新添加常驻轮廓。

### Inspector section surface

**Context**：在 304px Inspector 中为每个 Section 增加白色 Card 会形成暖灰背景、白 Card、白 Field 的
多层嵌套，并增加圆角、边界和纵向留白。用户提供的 HeroUI 参考是控件直接位于连续灰色画布上。

**Decision**：用户选择连续暖灰表单画布。Section 只通过标题、间距和克制分隔建立层级，不增加独立
白色 Card；白色抬升只属于 Field 与 selection surface。

**Consequences**：Inspector Section 不能通过重复 Card shadow 制造层级；需要依靠排版、节奏和 surface
对比保持扫描效率，并在滚动、Disclosure 展开和 compact 模式下验证连续性。

### Focus color

**Context**：HeroUI 参考图使用明亮品牌蓝 focus ring；Foliq 已有档案墨蓝的 Action、Selection 与 Focus
体系。直接复制亮蓝会改变品牌气质，维护两套相近蓝色又会增加语义歧义。

**Decision**：用户选择保留 Foliq 档案墨蓝。`--ptd-focus` 独立于普通 Action / Selection token 校准
亮度和对比度，但保持同一品牌色相，不引入 HeroUI 品牌蓝。

**Consequences**：完整 focus ring 可以比普通选中前景更清晰，但不能成为非聚焦状态的常驻蓝框；实现和
视觉测试需要覆盖白色 Field、暖灰 form canvas、深色 Header 与 Portal surface。

### Radius scale

**Context**：现有 2/4px 规范过于锐利，而 HeroUI 的 8px base、12px field 和大量 pill 对 304px 高密度
Inspector 又偏软。Header “文件工作台”同类按钮当前 6px，是用户明确认可的 Medium 感知锚点。

**Decision**：用户选择平衡型 `4 / 6 / 8 / 12 / 14px` 语义阶梯，另保留 999px 给真正圆形控件。

**Consequences**：需要新增按用途命名的 radius token，不能只把 `--ptd-radius-1` 从 2px 全局改大；旧
alias 在分阶段迁移期间保留，最终通过硬编码 radius 与旧 token 扫描收敛。

### Shadow allocation

**Context**：用户要求 Field 通过浅阴影获得质感。如果普通 Button、Tool item、List item 与 Field 全部
使用相同阴影，工作台会失去层级，真正的 Popover、Floating Dock 与 Paper 也不再突出。

**Decision**：用户选择只抬升 Field 与白色 selection surface。普通 Button / Tool / List 默认平面，
Primary / Danger 通过完整填充表达语义，Overlay / Modal / Dock 使用独立更高 shadow。

**Consequences**：需要建立 field / selection / surface / overlay / modal / dock 的 shadow 使用矩阵；
扫描不能只检查是否存在 shadow，还要验证 shadow 是否出现在允许的组件语义上。

### Border budget

**Context**：现有 Foliq 依靠大量 1px 边界切分 Field、Section、Button、Dock 和浮层，造成用户感受到的
生硬与框线噪声。Figma 等成熟编辑器更多使用 surface 明度、空间、排版和状态反馈建立层级，只在功能
边界上保留线。

**Decision**：用户要求全系统采用无边框优先。Form Field、普通 Button / Tool / List、Selection surface、
Floating Main Dock、Popover / Menu 默认无可见边框；focus / invalid 使用 ring，Canvas selection、参考线、
表格网格、Paper 边界与必要结构分隔保留功能性线。

**Consequences**：不能机械删除所有 `border`；迁移必须为每条保留线标明语义，并用 surface、spacing、
shadow 或 typography 替代被删除的装饰性边界。浏览器验收需覆盖低对比显示、disabled / locked、菜单组
分隔和紧凑布局，确保无边框没有降低可发现性。

### Controlled frosted material

**Context**：用户希望少量区域可通过 `backdrop-blur` 获得接近 iOS 毛玻璃的空气感，但不要求把整个
工作台改造成玻璃拟态。设计器是高密度生产工具，大面积或嵌套 blur 会降低可读性并增加合成成本。

**Decision**：磨砂只作为 App Bar、Floating Dock、Popover / Menu、Modal / Sheet 等真实悬浮 Chrome 的
可选增强；第一阶段 Inspector 试点不使用。Inspector、普通 Panel、Paper、Canvas 与 output 保持实色。

**Consequences**：后续 Chrome 迁移必须限制 blur 面积与堆栈数量，并提供高不透明度实色 fallback、
reduced-transparency 路径和截图对比度验收；不能用 blur 替代 surface、shadow 或结构层级。
