# 专业属性面板与录入控件模式

## 参考范围

本项目已有 Adobe-inspired Inspector refinement、Photoshop/After Effects 数值 scrub、InDesign 精神的
Canvas-first 工作区，以及用户此前提供的 Photoshop-like、boardmix、稿定等设计器参考。结合 Figma
类属性面板和桌面排版软件的成熟心智模型，本任务吸收交互规律，不复制第三方视觉资产或产品布局。

## 共同规律

### Adobe / InDesign / Photoshop 类工具

- 几何值是精确数值，同时支持拖动标签快速调节；单位始终可见。
- 相关值可联动：宽高比例、四边距、圆角或描边边可用链条/联动状态控制。
- 高频属性固定在稳定位置；高级外观、效果和低频打印参数按需披露。
- 色彩不是一个孤立的浏览器色框，而是色样、数值、最近使用和透明/无色语义的组合。
- 文本排版使用图标组、预设和精确值混合，不把所有选择降级成下拉框。

### Figma 类属性面板

- 行级属性强调对象和数值，标签/图标短而稳定；Hover 才出现次要操作。
- 混合值、禁用、锁定和缺省值有独立语义，不用空字符串含糊表示。
- 颜色、描边、圆角等复杂属性通过紧凑 Popover 展开精确编辑，主面板保留摘要。
- 不同对象共享控件原语，但面板组合是显式、对象感知的，不依赖一个万能 JSON Form。

### 轻量在线设计器

- 常用选项通过图形化预设降低学习成本，例如图片适配、对齐、纸张方向。
- 过度卡片化、超大触点和纯图标无标签不适合 PTD 的桌面高密度报表场景。
- 移动端可以放大触点，但不应牺牲桌面稳定空间记忆。

## 映射到 PTD 的控件体系

建议建立内部 `InspectorControls`，原生表单元素仅作为受控、不可见或统一样式后的实现细节，不允许业务
面板直接拼装裸 input/select/textarea。

| 值类型 / 任务 | PTD 控件 | 交互 |
| --- | --- | --- |
| 精确数值 | `MetricControl` | label scrub + draft + stepper + unit + min/max + Escape |
| 范围值 | `SliderMetricControl` | slider 快调 + 数值精调；适合透明度 |
| 角度 | `AngleControl` | 常用角度/小型角度盘 + 数值；适合旋转 |
| 2–4 个枚举 | `SegmentedControl` | 图标 + Tooltip + pressed 状态 |
| 长枚举 | `SelectControl` | 统一 shell；键盘操作；不裸露浏览器默认外观 |
| 可搜索选项 | `ComboboxControl` | Popover + 搜索 + 最近项；适合字体/纸张规格 |
| 字形布尔组合 | `IconToggleGroup` | 粗体、斜体、下划线、删除线，多项可并存 |
| 对齐 | `AlignmentControl` | 水平/垂直图标组，文本辅助可访问名称 |
| 颜色 | `ColorControl` | 色样 + HEX + 无色/透明 + 最近色 + 派生文档颜色；Popover 精调 |
| 四边值 | `InsetControl` | 四边联动/分离，支持 mm/px；适合页边距和 padding |
| 纸张 | `PaperSizeControl` | 规格名 + 尺寸预览 + custom 宽高 |
| 显示单位 | `MeasurementUnitControl` | 全局 mm/px 切换；同步 Inspector、标尺和状态读数 |
| 图片来源 | `AssetSourceControl` | 本地选择、稳定 URL、清除、错误状态 |
| 图片适配 | `FitControl` | contain/cover/fill 图示 Segmented |
| 文本 | `TextControl` / `TextAreaControl` | label、说明、错误、clear/action、Draft/Gesture |
| 开关 | `SwitchControl` | 明确 checked/disabled 文案，不只靠颜色 |
| 结构命令 | `CommandGrid` | 用于表格增删/合并等离散动作，不伪装成字段 |

## 可行实现路径

### A. 显式面板 + 共享控件（推荐）

- 为 Page、Text、RichText、Table、Image、Code、Shape、Group 维护显式 section 组合。
- 抽取共享控件和 `Field/Section` 布局原语。
- Core Registry 只声明能力/默认值，不声明完整 UI 表单。

优点：类型明确、最符合对象语义、容易做专用交互和渐进披露。缺点：文件数量较多，需要维护能力矩阵。

### B. Metadata 驱动通用属性表单

- 在 Registry 中为每个字段声明类型、标签、单位、范围和可见条件，通用 renderer 自动生成。

优点：新增简单字段快。缺点：很快演变为自制 Form DSL；表格、字体、颜色、图片和富文本仍需要大量逃生口，
容易重新得到“传统动态表单”。本任务不推荐。

### C. 引入完整视觉型 UI/Form 框架

优点：现成控件多。缺点：与 PTD Token、密度、CSS Modules、包体和 public styles 合同冲突，也违反现有
“Radix 原语 + 自定义样式”的规范。不采用。

## 推荐方向

采用 A，并允许内部使用必要的 Radix 无样式原语补齐 Popover、Select/ToggleGroup/Slider。视觉完全由
PTD token 和 CSS Modules 控制。控件复杂度与值类型匹配：不要为了“形式多样”堆装饰，但也不把颜色、
边距、方向、对齐、字体和透明度都降级成同一种输入框。

Photoshop 类工具的关键不是把内部数据反复改写为当前单位，而是使用稳定内部坐标并将 ruler/input 的
显示、解析和步进统一切换。PTD 应采用相同原则：切换 mm/px 不改变文档，也不产生历史节点。
