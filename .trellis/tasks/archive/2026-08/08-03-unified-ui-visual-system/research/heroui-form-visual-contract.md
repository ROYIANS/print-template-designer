# HeroUI v3 表单视觉合同与 Foliq 映射

## 来源

- HeroUI v3 官方技能脚本于 2026-08-03 获取的 `default` 主题，版本 `v3.0.5`。
- 官方组件文档与样式：TextField、NumberField、Select、TextArea、Tabs、Button、Card。
- 用户提供的 HeroUI Playground 截图与 `field-shadow` CSS 值。

## HeroUI 当前合同

- Light theme 的页面 `background` 是浅灰，普通 `surface` 与 `field-background` 是白色。
- 基础 `--radius` 为 `0.5rem`（8px）；`--field-radius` 为基础半径的 1.5 倍。HeroUI 的字段视觉偏软，
  但完整照搬 12px field radius 会超过 Foliq 用户要求的 Medium 尺度。
- Primary TextField、NumberField 和 Select 使用白色 field surface、透明或极弱边界与 `field-shadow`：
  `0 2px 4px rgb(0 0 0 / 4%), 0 1px 2px rgb(0 0 0 / 6%), 0 0 1px rgb(0 0 0 / 6%)`。
- Hover、focus、invalid 通过 surface、边界和 focus/invalid ring 变化表达；阴影不是焦点状态的唯一信号。
- 默认 Tabs 使用灰色容器和完整白色 SelectionIndicator，并带 surface shadow；只有 secondary variant
  使用下划线。用户明确不喜欢下划线，因此 Foliq 应参考默认完整 selection surface，而非 secondary。
- HeroUI Button 默认趋向 pill。Foliq 不应复制该形状；可以吸收其完整填充选中态、pressed scale 和语义
  variant，但保留专业工具台的中等圆角与紧凑尺寸。

## 适合 Foliq 的映射

### 圆角

HeroUI 的 8px base / 12px field 不是直接目标。Foliq Header 的“文件工作台”类按钮当前为 6px，用户已经
认可该感知尺度，因此建议：

- `control-sm`: 4px，仅用于 24px 以下微型命中区域或紧密拼接的内部段。
- `control-md`: 6px，普通按钮、输入、Select、Stepper、Segment item、Rail item。
- `surface-md`: 8px，Disclosure、表单分区、Floating Main Dock、普通 Card。
- `overlay-lg`: 12px，Popover、Dropdown、Context Menu、Sheet 内部容器。
- `shell-xl`: 14px，App Bar、Modal/Sheet 外壳等大型框架。
- `round`: 999px，只用于 Switch、状态点、头像和明确的圆形控件。

这组尺度比现有 2/4px 更柔和，但不会把高密度设计器胶囊化。

### 表面与阴影

- Inspector 的滚动表单层使用暖灰 `surface-form`，Section header / panel shell 保持更干净的 panel surface。
- 所有可编辑 field 使用白色 `surface-field` 和统一 `shadow-field`，默认无可见边界；hover、focus、
  invalid 通过 shadow、完整 ring / outline 与文字状态保持可辨识。
- `shadow-field` 采用用户给出的 HeroUI 值，并成为语义 token，禁止业务面板复制 raw shadow。
- 按钮、Tab、Segmented 的普通静止项不全量加 field shadow；只有白色 raised selection indicator 或真正
  field 使用该阴影，避免整个工作台变成浮动卡片集合。

### 选中与焦点

- Selected：完整白色或浅墨蓝 surface + 完整边界/阴影 + 墨蓝文字/图标；不使用 inset bottom bar。
- Focus-visible：保留 2px 档案墨蓝外环。焦点环是键盘状态，不等于常驻选中态，不能因用户不喜欢蓝色
  下边条而一起删除。
- Active/pressed：允许轻微 `scale(0.98)` 或 `translateY(1px)`，但不能依赖位移表达选中。
- Invalid：危险色完整边界/环 + 文字错误；不能只把阴影染红。

## 不采用的 HeroUI 部分

- 不引入 Tailwind CSS v4、`@heroui/react`、`@heroui/styles` 或 React Aria 作为第二套运行时。
- 不复制品牌高饱和蓝、Inter 字体、默认 pill Button 与 20px 以上 Tabs 容器圆角。
- 不把通用 Card/Modal 的大留白和尺寸带进 304px 宽的 Inspector。
- 不改变现有 Radix、CSS Modules、EditorStore、TemplateSchema 或打印输出合同。

## 实施结论

HeroUI 最值得吸收的是“灰背景 / 白字段 / 轻阴影 / 完整 selection surface”的层级，而不是其组件库或
所有几何参数。Foliq 应以 6px 常规控件半径为锚点，建立语义 token 后从 InspectorControls 向外迁移。
