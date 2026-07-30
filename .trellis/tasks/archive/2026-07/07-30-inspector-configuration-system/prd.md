# 完善页面与组件属性配置面板

## Goal

补齐 Page Inspector 与十个可用组件的第一版完整配置路径，并建立一套可复用、专业、紧凑、用户友好的
Inspector Controls，使属性编辑脱离传统后台表单和浏览器原始输入外观，同时保持 PTD 的冷纸白、蓝石墨、
精确制版工作台气质。

## What I already know

- 用户希望页面至少可以配置页面大小、上下/页眉页脚距离、左右距离、背景色等基本属性。
- 用户明确要求配置项不要继续使用原始输入组件，而应由 PTD 封装形式多样、符合值语义的录入控件。
- 用户要求页面与组件尺寸使用统一度量体系，至少支持类似 Photoshop 的 mm/px 切换；不能出现同一状态下
  页面只显示 mm、组件只显示 px 的混杂体验。
- 当前 Page Inspector 只有方向可编辑，其余纸张、边距和默认排版均为只读。
- 当前 Single Inspector 已有 Number、Segmented、Select、Color 的内部原语，Number 还支持 scrub 和单历史
  Gesture；这套交互应成为基线而不是推倒重来。
- 当前 TableContentFields 仍直接使用原生 input/select/textarea/color，是最需要统一的区域。
- Core/Renderer 已支持若干未暴露属性；同时也存在 `pageLayout/pageCurHeight/pageConfig.scale` 等语义未闭环字段，
  不能盲目把所有 Schema Key 自动渲染成表单。

## Requirements (evolving)

### 1. 页面设置

- 页面标题可编辑。
- 纸张规格提供可搜索/可扫描的规格选择，显示真实毫米尺寸；支持 custom 宽高。
- 纵横方向使用图形化 Segmented，并与纸张宽高和参考线边界正确联动。
- 页面内容安全区至少支持上、右、下、左四边 mm 配置和联动/分离编辑。
- 背景色、默认文字色、中文/西文字体、默认字号和行高可编辑。
- 页面缩放仍是实例级工作区状态，不作为持久化页面属性控件。
- `fixed/relative` 只有在运行时语义闭环后才对用户开放，不能提供无效设置。

### 2. 统一度量单位

- 新增实例级显示单位 `mm | px`，默认 mm，作为编辑偏好而非模板业务数据。
- 切换单位时，Page/Single/Multi Inspector、Ruler、Guide、Context Bar、Status Bar 和画布几何反馈同步更新。
- 单位切换只改变显示格式、输入解析、精度、步进和标尺刻度，不改变文档实际几何，不产生 Host change 或历史。
- mm 模式下页面与组件几何统一显示 mm；px 模式下页面与组件几何统一显示 PTD Canvas px。
- 字号保持 pt、旋转保持度、透明度保持百分比、行高等无单位语义保持不变。
- Core 提供集中式 `format/parse/convert measurement` 合同；业务组件不得自行散落 `* COMMON_SCALE` 或
  `/ COMMON_SCALE`。
- 当前 px 明确表示既有 PTD 设计坐标（1mm = 5px），不冒充导出图片的 DPI/PPI；真实输出分辨率留给导出阶段。

### 3. 共享 Inspector Controls

- 业务面板不直接渲染裸 `input/select/textarea`；统一通过 PTD 控件组件封装。
- 数值、范围、角度、小枚举、长枚举、字体、颜色、四边距、对齐、文本、开关和结构命令分别使用适合
  其任务的控件形态。
- 保留精确输入、label scrub、stepper、单位、Shift/Alt、Escape 取消和一个 Gesture 一个历史节点。
- 颜色提供色样和精确值；原生 color input 若保留，只作为控件内部实现细节。
- 所有控件覆盖 hover、focus-visible、disabled、locked、invalid、mixed 和 read-only 状态，且状态不只靠颜色。
- Popover、展开态、最近颜色、比例锁等 UI 状态不写入 TemplateSchema。

### 4. 组件配置覆盖

- 所有组件共享几何、透明度和锁定基础能力，但允许以组件语义重命名字段。
- 简单文本补齐字重、斜体、下划线、删除线、行高、字距、内边距、对齐和完整外观。
- 富文本明确组件级默认样式与选区级 Tiptap 格式的职责，不把 HTML 源码 textarea 作为主要用户入口。
- 自由表格复用共享控件，补齐删除线和边框样式，保留结构命令与画布单元格选择。
- 图片把来源、替代文本、适配和位置组织为专用控件；不在本任务实现服务端素材库。
- QR 和 Barcode 保留即时校验，使用适合编码语义的内容、纠错/码制、静区、颜色和可读文字控件。
- Barcode 补齐 Renderer 已消费但 Inspector 未提供的背景色。
- Rect/Circle 保留填充与描边；Line 使用线条语义；Star 是否增加描边以 Renderer 合同审计为准。
- Group 只显示组合摘要、共同几何和可安全修改的样式，不显示误导性的“专用内容编辑器”提示。
- Multi Inspector 只暴露所有所选对象真正共有且安全的属性，混合值不得被意外压平。

### 5. 信息架构

- Inspector 继续使用固定 Header、单滚动 Body、固定 Footer。
- 高频 Content/Geometry/Typography/基础 Appearance 保持稳定可见；低频描边细节、兼容设置和高级参数按需披露。
- 不使用大卡片、过度留白或营销式控件；专业感来自对齐、单位、图标、状态和稳定节奏。
- 显式组件面板组合共享控件，不引入万能 JSON Form 或自制 Form DSL。

## Open Questions

无阻塞问题，等待用户确认完整 PRD 后进入实现准备。

## Decision (ADR-lite)

### Measurement unit switching

**Context**: 当前页面尺寸与边距以 mm 展示，组件和表格几何以 PTD Canvas px 展示，用户要求像 Photoshop
一样统一并可切换单位。Core 现有固定换算为 `1mm = 5px`，而真实 DPI/PPI 尚属于未实现的导出合同。

**Decision**: 采用显示单位切换方案。默认 `mm`，可全局切换为既有 PTD Canvas `px`；真实 DPI/PPI
不进入本任务。

**Consequences**:

- 单位偏好是 EditorStore 实例级 UI 状态，不写入 TemplateSchema。
- Page、Single、Multi、Table、Ruler、Guide、Context Bar 与 Status Bar 必须同时切换。
- 单位切换不产生 Host change 或历史节点，也不反复改写存储值。
- 当前 px 明确是 PTD 设计坐标；输出像素与分辨率在 Export 阶段单独建模。

### Page margins versus repeating header/footer

**Context**: 用户需要页面的“页眉页脚距离、左右距离”。当前 Schema 只有上下边距，Canvas 只绘制两条
辅助线；真正可重复页眉/页脚还依赖尚未实现的自动分页和导出阶段。

**Decision**: 本任务实现上、右、下、左四边内容安全距离，以及对应 Paper 辅助线和统一 mm/px 编辑；
不引入真正重复的页眉/页脚区域。

**Consequences**:

- PageConfig 兼容式补充左右边距，既有上下字段继续作为内容安全距离。
- 四边距支持联动/分离的 `InsetControl`，并在画布上形成完整内容安全区反馈。
- 四边距只是设计辅助与未来内容区输入，不会自动移动、裁切或重复页面内容。
- 页眉/页脚启用、区域高度、距纸边位置、每页重复与奇偶页规则留给分页/导出任务。

### Out-of-bounds components after page resizing

**Context**: 修改纸张规格、方向或 custom 宽高后，既有组件可能落在新 Paper 边界之外。自动搬移会改变
用户版式并可能制造重叠，阻止修改则会让页面设置流程过于僵硬。

**Decision**: 允许页面尺寸正常修改，保留所有组件的原始几何，并对越界组件提供明确警告。

**Consequences**:

- 页面尺寸变更不自动平移、缩放、裁切或删除任何组件。
- 越界检测是基于当前页面尺寸和组件包围盒的纯派生状态，不写入 TemplateSchema、不额外产生历史。
- Page Inspector 显示越界对象数量和修正提示；画布为越界对象提供不依赖颜色的可识别状态。
- 后续可以增加“选择越界对象”或显式“移入页面”命令，但不得在本任务中静默执行。

### Color control and document colors

**Context**: 当前通用 ColorInput 只有色样和 HEX，TableContentFields 仍直接使用原生 color input；页面、
组件、表格和编码配置缺少统一的颜色复用路径。

**Decision**: 建立完整 ColorControl，并增加自动派生的文档颜色面板。

**Consequences**:

- ColorControl 提供色样、HEX 精确输入、透明/无色、清除/恢复默认、最近使用和文档颜色。
- 文档颜色从当前 TemplateSchema 的 PageConfig、ComponentStyle、表格 CellStyle、QR/Barcode 内容颜色中
  归一化、去重并派生，不重复写入 Schema，不形成历史节点。
- 文档颜色优先按使用频次与稳定顺序呈现；无效颜色和不支持的动态值不进入色板。
- 最近颜色保持 Designer 实例级 UI 状态，不污染模板，也不在两个 Designer 实例之间泄漏。
- 选择颜色仍遵循 Gesture 合同；连续拖动/精调最终最多形成一个历史节点，Escape 可取消。
- 本任务不实现命名色板、品牌/团队色板、云同步和权限；这些能力可在 Host/资产系统建立后扩展。

### Template-wide page configuration

**Context**: 当前 TemplateSchema 只有一份顶层 `pageConfig`，所有手工页面共享纸张设置。为每页引入
完整覆盖会重构页面、序列化、复制、标尺和未来导出合同。

**Decision**: 本任务保持整个模板共享页面规格、方向、四边距、背景和默认排版。

**Consequences**:

- Page Inspector 明确命名为“文档页面设置”或等价文案，不用 `PAGE 01` 暗示只修改当前页。
- 修改页面配置一次更新顶层 pageConfig，并影响所有手工页面的 Paper/标尺呈现。
- Pages Resource Panel 的当前页选择仍只决定正在编辑哪一页的组件，不产生页面配置覆盖。
- Core 类型为未来 per-page override 保留演进空间，但本任务不增加空 override 字段或伪入口。

### Invalid numeric drafts and constraints

**Context**: 页面宽高、四边距、组件尺寸、静区、描边和圆角都可能在输入过程中出现空值、不完整数字或
无效组合。允许提交会污染模板，自动 clamp 又会悄悄改变用户意图。

**Decision**: 保留合法的输入草稿状态并就地校验；无效值或无效组合不得进入 Schema。修正后提交，
Escape 恢复编辑前状态。

**Consequences**:

- Text/Number/Inset/Color 等控件统一支持 Draft、错误文案、`aria-invalid` 与错误关联说明。
- 页面宽高必须为正且在可操作范围；左右边距和上下边距分别必须为页面尺寸以内的合法内容区组合。
- 无效输入不触发 Host `onChange`、不创建历史，也不导致 Canvas 暂时渲染非法几何。
- 控件不得静默 clamp 用户输入；stepper、slider 等离散交互可以在明确 min/max 内停止。
- Escape 或取消恢复精确的 Gesture 起点；一次有效连续编辑最多形成一个历史节点。

## Acceptance Criteria (evolving)

- [x] Page Inspector 能编辑标题、纸张规格、自定义尺寸、方向、四边距、背景和默认排版。
- [x] 多页面模板共享同一页面设置，Inspector 文案不误导为当前页局部设置。
- [x] 旧模板缺少新页面字段时可安全 normalize，加载不报错且保存后合同稳定。
- [x] 页面尺寸/方向改变后标尺、Paper、边距指示和参考线边界同步更新。
- [x] 页面缩小后越界组件保持原始几何，Page Inspector 显示准确数量且画布状态可识别。
- [x] 页面尺寸变更不会自动移动、缩放、裁切或删除组件。
- [x] mm/px 切换同步影响页面、组件、表格、标尺、参考线、Context Bar 与 Status Bar，来回切换不改变 Schema。
- [x] mm/px 输入具有稳定精度和步进，连续转换不会积累尺寸漂移。
- [x] 十个可用组件均有与 Renderer 能力相符、无明显伪配置的属性面板。
- [x] Property Inspector 业务组合和 TableContentFields 不直接拼装裸视觉 input/select/textarea/color。
- [x] 几何数值、透明度、角度、四边距、字体、颜色、对齐、图片适配和编码参数使用不同且合适的控件。
- [x] 单次连续编辑只产生一个历史节点；Escape 可取消可逆 Gesture。
- [x] 无效或不完整草稿具有就地错误与可访问说明，且不会进入 Schema、触发 Host change 或创建历史。
- [x] 四边距不能形成负尺寸内容区；页面、组件和编码数值遵守各自明确范围且不被静默 clamp。
- [x] Locked、Mixed、Invalid、Disabled 与 Read-only 状态可访问且不只靠颜色表达。
- [x] 页面、组件、表格与编码组件使用同一 ColorControl，文档颜色准确去重并随模板变化更新。
- [x] 最近颜色和文档颜色不写入 Schema、不产生历史且保持 Designer 实例隔离。
- [ ] 1600×1000、1366×768、1024×768、窄手机和 200% 浏览器缩放下 Inspector 可达且无横向溢出。
- [x] Core/Components/React Designer tests、TypeScript、ESLint、package build、Web build、Prettier 和
      `git diff --check` 全部通过。

> 收尾说明：真实浏览器已覆盖 1280×720 下的 Page、十类组件、Locked、Invalid、颜色展开态与横向溢出；
> Multi/Group 由 Store 测试与源码合同覆盖。受当前内置浏览器缺少视口仿真、修饰键点击和 200% 缩放能力限制，
> 1024×768、窄手机、200% 及 Multi/Group 的真实浏览器矩阵未完成，因此对应验收项保持未勾选；用户于
> 2026-07-30 明确要求提交并归档，接受以当前验证证据收尾。

## Definition of Done

- 属性能力矩阵与实际 Renderer/Schema/Inspector 一致。
- 新增/变更 Schema 有默认值、normalizer、序列化和兼容 fixture 测试。
- 共享控件具备聚焦的交互与可访问性测试。
- 浏览器验收覆盖 Page、每类组件、Multi、Locked、Mixed、Invalid 和 compact overlay。
- README、UI Spec 与 React Designer Contract 同步更新。

## Out of Scope

- Web/Server 模板生命周期、应用命令和冲突处理。
- 数据字段、表达式、数据源与实时预览。
- 服务端图片上传、对象存储、素材库、裁剪器和资产权限。
- 命名色板、品牌/团队色板、云端色板同步、吸管取色和颜色权限。
- 自动分页、打印、PDF/Word 导出及真正的重复页眉页脚渲染，除非用户明确将其纳入本任务。
- 页眉/页脚内容区、重复规则、奇偶页规则和首页不同规则。
- 每页独立纸张规格、方向、边距、背景或默认排版覆盖。
- 输出 DPI/PPI、位图分辨率与打印栅格化；px 本阶段仅表示既有 PTD Canvas coordinate。
- 为规划中的结构表格、重复列表、数据表格、SVG、Frame 建立伪属性面板。
- 引入完整视觉型 UI/Form 框架或 Schema 自动表单系统。

## Technical Approach

- Core 保持业务/渲染属性类型和兼容归一化，不持有 React 控件定义。
- React Designer 建立 `InspectorControls` 层，Page 与各组件以显式 Section 组合控件。
- 必要时增加无样式 Radix primitives（Popover/Select/ToggleGroup/Slider），但样式、密度和 token 全部由
  PTD CSS Modules 控制。
- EditorStore 增加通用、不可变的 page-config patch/gesture 边界；页面与组件采用一致的历史合同。
- 实现顺序建议为：控件原语 → Page Inspector → 通用组件外观/排版 → Table → Media/Code/Shape → Multi。

## Implementation Plan

### PR1: 度量与 Inspector Controls 基础

- 建立集中式 measurement format/parse/step 合同和 EditorStore 实例级 `mm | px` 状态。
- 抽取 Field、Text、TextArea、Metric、SliderMetric、Angle、Segmented、Select/Combobox、Toggle、Color、
  Inset、Alignment、Switch、CommandGrid 等内部控件。
- 迁移现有 NumberInput 的 scrub/draft/gesture 行为，增加统一 invalid/mixed/locked 状态测试。
- 接通 Ruler、Guide、Context Bar 和 Status Bar 的单位显示，但不改变 Schema 存储。

### PR2: 文档页面设置

- 增加 page-config normalize/patch/gesture 合同和左右内容安全边距兼容字段。
- 实现标题、PaperSize/custom、方向、四边距、背景、默认文字色、字体、字号和行高编辑。
- 完成四边安全区 Canvas 反馈、页面尺寸后的参考线修正和越界组件派生警告。
- 明确全模板共享页面配置，并移除当前页局部设置的误导文案。

### PR3: 文本、通用外观与 Multi

- 补齐简单文本排版和外观；明确富文本组件级默认与选区级格式边界。
- 建立按 Renderer 能力组合的 Geometry/Typography/Appearance sections。
- 完成 Group 摘要和 Multi 共同属性/mixed 状态，不暴露无效配置。
- 增加完整 ColorControl、实例最近颜色和派生文档颜色。

### PR4: 自由表格、媒体、编码与图形

- 将 TableContentFields 全部迁移到共享控件，补删除线和边框样式。
- 完成 Image AssetSource/Fit/Position 控件。
- 完成 QR/Barcode 专用控件与即时校验，补 Barcode 背景。
- 收口 Line/Rect/Circle/Star 的语义字段与 Renderer 能力，不提供伪设置。

### PR5: 验收与规范收尾

- 覆盖 Page、十个可用组件、Group、Multi、Locked、Mixed、Invalid 和越界状态。
- 完成 wide/standard/compact/mobile/200% 浏览器验收和键盘/屏幕阅读器语义检查。
- 更新 React Designer README、PTD UI Spec、React Designer Contract 与能力矩阵。
- 依赖顺序执行 tests、typecheck、lint、package build、Web build、format 和 diff checks。

## Research References

- [`research/property-capability-audit.md`](research/property-capability-audit.md) — 当前 Schema、Renderer、
  Inspector、Legacy 和浏览器状态的逐项缺口。
- [`research/professional-control-patterns.md`](research/professional-control-patterns.md) — Adobe/Figma 类专业
  属性面板规律、PTD 控件映射与实现路径比较。

## Technical Notes

- 当前核心文件：`packages/core/src/types/page-config.ts`、`component-schema.ts`、`component-content.ts`、
  `table-content.ts`；`packages/components/src/base/css-variables.ts`；React Designer 的
  `PropertyInspector.tsx`、`TableContentFields.tsx` 和 `EditorStore`。
- 既有 NumberInput 的 scrub/gesture 设计与 `InspectorSection/InspectorDisclosure/Panel` 结构应复用。
- 视觉方向延续 refined industrial studio：冷纸白、蓝石墨、hairline、克制钴蓝、紧凑且可精确读数。
