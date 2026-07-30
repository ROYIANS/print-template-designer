# 页面与组件属性能力审计

## 审计范围

- `@ptd/core` 的 `PageConfig`、`ComponentStyle`、媒体/编码内容类型和自由表格模型。
- `@ptd/components` 实际消费的样式变量与专用内容属性。
- `@ptd/react-designer` 的 Page / Single / Multi Inspector、画布内文本编辑器和表格编辑器。
- 2026-07-30 当前 Web Host 的真实浏览器状态，视口约 1280×720。
- Legacy v1 的 `GlobalSetting.vue`、`PagePalette.vue` 与 `paletteConfig.js`，仅用于识别曾经存在的
  产品能力，不沿用其 `vxe-form` 实现。

## 结论摘要

当前 Inspector 已经拥有合格的专业控件雏形，但能力分布不均：

1. Page Inspector 除纵横方向外全部为只读 Readout，无法承担“页面/全局属性统一入口”的既定职责。
2. Single Inspector 的几何、分段选择、色板 + HEX 已较成熟，但排版能力没有覆盖 Renderer 已支持的
   `fontWeight`、`fontStyle`、`lineHeight`、`letterSpacing`、文字装饰和 `padding`。
3. 自由表格专用面板重复实现了一套裸 `input/select/textarea/color`，没有复用现有 Number、Select、
   Segmented 和 Color 原语，是当前最明显的体验与维护断层。
4. 页面左右内容边距、真正的页眉/页脚区域和页眉/页脚距当前都不在 Schema 中。上下边距只用于画布
   两条提示线，尚未形成完整四边安全区。
5. `pageLayout`、`pageCurHeight` 与 `pageConfig.scale` 缺少完整运行时语义；不能因为字段存在就直接把它们
   暴露为“可用设置”。
6. 当前页面物理尺寸/上下边距/参考线位置以 mm 保存，而组件 X/Y/W/H、描边和内边距以 PTD Canvas px
   保存；界面因此同时出现 `210 × 297 mm` 与组件 `X 240px`。Core 的固定换算为
   `COMMON_SCALE = 5`，即 1mm = 5 个 PTD 设计像素，并非浏览器 96dpi 或打印 300dpi。

## 度量单位审计与建议

用户要求统一度量体系，并希望像 Photoshop 一样在 mm/px 之间切换。推荐区分三层：

1. **文档/Schema 存储**：本任务不对已有模板做破坏性全量换单位；页面继续保存物理 mm，组件继续保存
   既有 Canvas coordinate。所有转换集中到一个单位服务，不允许业务面板散落 `/ 5`、`* 5`。
2. **编辑器显示单位**：EditorStore 增加实例级 `measurementUnit: 'mm' | 'px'`，默认 mm。它是编辑偏好，
   不写入 TemplateSchema，也不形成 Undo 历史。
3. **输出分辨率**：真正的图片/PDF 像素与 DPI/PPI 属于导出合同。当前 px 是 PTD 设计坐标，不能冒充
   96/300dpi 输出像素；未来导出阶段再建立 resolution-aware 转换。

单位切换必须是全局一致动作，至少同步影响：

- Page Inspector 的纸张宽高与四边距。
- Single/Multi Inspector 的 X/Y/W/H、padding、border width、QR 静区、表格行高/列宽/内边距/边框。
- Ruler 刻度与左上角单位标记。
- Guide 的创建、位置读数和编辑。
- Context Bar、Status Bar 和画布选中几何读数。

不参与 mm/px 切换的语义值：字号 `pt`、旋转 `°`、透明度 `%`、无单位行高、二维码纠错等级等。

推荐交互：状态栏提供紧凑 `mm / px` 入口，Page Inspector 的 PaperSizeControl 同步显示当前单位；mm
默认保留 0.1mm 精度与 0.1mm 步进，px 默认整数与 1px 步进。切换只改变格式、解析、步进和标尺，
不改变纸张/组件的实际尺寸或历史。

## 页面配置矩阵

| 配置 | Core 状态 | 当前 Inspector | 运行时状态 | 建议 |
| --- | --- | --- | --- | --- |
| 模板标题 | `title` 已有 | 仅作为标题显示 | App Bar/Inspector 可读 | 增加封装 TextControl |
| 纸张规格 | `pageSize` 已有 A/B/C/custom | 只读 | 尺寸仍取 width/height | 增加带尺寸预览的 PaperSizePicker，并建立 preset 映射 |
| 纵横方向 | 已有 | Segmented 可编辑 | 完整 | 保留并改用方向图示 |
| 自定义宽高 | 已有 mm | 只读 | Canvas 使用 | custom 时用联动 DimensionControl 编辑 |
| 页面布局 | `fixed/relative` 已有 | 只读 | 没有完整消费 | MVP 不伪装成熟；保留兼容或置于实验性高级区 |
| 上下边距 | 已有 mm | 只读 | 只绘制两条参考线 | 改为四边 InsetControl；明确其语义 |
| 左右边距 | 不存在 | 不存在 | 不存在 | 兼容式新增字段，默认值可由旧模板补齐 |
| 页眉/页脚区域 | 不存在 | 不存在 | 不存在 | 需产品决策；不应与普通页面边距混为一谈 |
| 纸张背景 | 已有 | 只读色板 | Canvas 使用 | ColorControl 可编辑 |
| 默认文字色 | 已有 | 只读色板 | Canvas 继承 | ColorControl 可编辑 |
| 默认字体 | 已有 | 只读 | Canvas 继承 | FontFamilyControl 可编辑 |
| 默认字号 | 已有 | 只读 | Canvas 使用 px | NumberControl；同时清理 pt/px 命名一致性 |
| 默认行高 | 已有 | 只读 | Canvas 使用 | 带常用预设与精确值的 LineHeightControl |
| 缩放 | Schema 和 Store 各有一份 | 页面不显示 | Store UI 状态实际生效 | 不作为文档属性；后续清理重复字段 |
| 显示单位 | 不存在 | 页面 mm / 组件 px 混用 | 固定 1mm=5 Canvas px | 增加实例级 mm/px 切换并同步所有几何读数 |

## 可用组件属性矩阵

### 所有组件共同能力

当前已有 X、Y、宽、高、旋转、透明度、锁定。建议保留统一 GeometrySection，但按组件语义调整：

- QR、正方形图片等可提供临时比例锁，不一定写入 Schema。
- 直线的高度在产品上应显示为“线宽/粗细”，而不是普通高度。
- 旋转适合 AngleControl + 精确数值；透明度适合 Slider + 数值。
- Group 不应显示“结构化内容由专用编辑器维护”的伪内容区，只显示组合摘要和共同样式。

### 文本与富文本

| 能力 | Renderer/Schema | 当前 Inspector | 建议 |
| --- | --- | --- | --- |
| 内容 | simple 纯文本、rich 清洗 HTML | 单行输入 / HTML textarea | simple 用封装 TextField；rich 用“进入画布编辑”与摘要，不把 HTML 源码当主入口 |
| 字体与字号 | 支持 | 支持 | 改为字体预览 Combobox + NumberControl |
| 字重/斜体/下划线/删除线 | 支持 | 缺失 | IconToggleGroup；rich 需区分整框默认与选区格式 |
| 行高/字距 | 支持 | 缺失 | LineHeightControl / LetterSpacingControl |
| 水平/垂直对齐 | simple 支持 | simple 支持文字按钮 | 改为图标 Segmented；rich 对齐主要由画布内工具栏负责 |
| 内边距 | 支持 | 缺失 | InsetControl，默认四边联动 |
| 背景/边框/圆角 | 支持 | 支持 | 保留；色彩、描边、圆角可拆成稳定的 AppearanceSection |

### 自由表格

模型已经支持内容、行高、列宽、字体、字号、粗体、斜体、下划线/删除线、文字/背景、水平/垂直
对齐、内边距、边框色/宽/样式。当前仅缺少部分 UI 暴露和控件统一：

- 全部裸输入迁移到共享 Inspector Controls。
- 水平/垂直对齐改为图标 Segmented。
- 字形改为 IconToggleGroup，并补删除线。
- 边框样式当前模型已支持但面板未暴露，应加入 BorderControl。
- 颜色统一为 ColorControl，不直接展示浏览器原生 color input。
- 结构命令保留专用 CommandGrid，不强行抽象成字段配置。

### 图片

当前内容能力包含地址、本地文件、替代文本、contain/cover/fill 和五向对象位置；几何和基础边框也可用。
建议把来源整合为 AssetSourceControl，把适配方式改为带图示的 FitControl，对象位置改为 3×3 PositionGrid
（Core 可从五向扩展到九宫格时再启用角点）。裁剪、焦点、上传与服务端资产库不进入本任务。

### 二维码与条形码

- QR 已有内容、纠错等级、静区、前景和背景，配置覆盖基本完整；主要工作是控件语义升级与预设说明。
- Barcode 已有内容、码制、前景、可读文字。Renderer 还读取 `style.background`，但 Inspector 当前没有
  对条码暴露背景色，应补齐。条高、文字字号等只有在 Core 内容合同明确后再增加。
- 两类编码都必须保留即时格式校验、错误状态和一个历史 Gesture 的合同。

### 图形

- Line：颜色可配，但应把几何高度命名为线宽，并研究实线/虚线是否需要进入 Renderer 合同。
- Rect：填充、描边色、描边宽、描边样式、圆角���本完整。
- Circle：填充、描边色、描边宽、描边样式基本完整，不显示无意义圆角。
- Star：当前仅支持填充；如增加描边必须先让 SVG Renderer 消费统一描边合同。

## 原始控件审计

`PropertyInspector.tsx` 已有封装：`NumberInput`、`SegmentedInput`、`SelectInput`、`ColorInput`、
`FooterSetting`。其中 Number 支持 label scrub、步进、单位、合法 Draft、Shift/Alt 和 Escape 取消，值得保留。

仍直接暴露原生控件的主要区域：

- `TableContentFields.tsx`：textarea、number、select、color 全部是独立裸实现。
- 文本内容、图片 URL/alt、QR 内容、Barcode 内容：虽然有统一 CSS class，但没有形成带帮助、错误、
  clear/action 等语义的 TextField/TextArea 原语。
- `SelectInput` 视觉上仍是浏览器原生 select；可先以统一 shell 封装，复杂检索项再使用 Radix Popover/
  Command-style Combobox。
- `ColorInput` 已将原生 color input 隐藏在色井内，但缺少最近色、透明色、页面/组件色板与可控 Popover。

## 浏览器观察

- Page Inspector 的分组、固定 Header/Footer 和纸白层级是正确的，但读数区让它更像状态说明，而非设置面板。
- Simple Text 的几何控件和颜色控件已经明显优于普通表单，应作为视觉与行为基线。
- 自由表格选择单元格后，控件列表很长，原生 Select/Number 的视觉权重一致，难以区分结构、文字、对齐和
  边框任务；1280×720 下依赖较长滚动，固定锁定 Footer 会进一步压缩内容视口。
- 继续采用一个滚动 Body，但应以稳定高频区 + 少量高级 Disclosure 控制长度，而不是把所有内容卡片化。

## 兼容性与风险

- 新增 PageConfig 字段必须给旧模板提供 normalize/default 路径；不能要求所有 fixture 一次性手工补字段。
- 单位切换不能逐次往返改写 Schema，否则 mm/px 来回切换会积累舍入误差；输入时才从显示值转换到既有存储值。
- 页面尺寸改变后需夹紧参考线，并明确现有超出纸张的组件是保留、警告还是自动搬移；推荐保留并提示，
  不静默改变内容几何。
- Page 配置连续编辑必须使用与组件相同的 Gesture 合同，一次 scrub/输入形成一个历史节点。
- 丰富控件不能把 UI 临时状态写入 TemplateSchema；Popover、最近色、展开态、比例锁应保持实例级。
