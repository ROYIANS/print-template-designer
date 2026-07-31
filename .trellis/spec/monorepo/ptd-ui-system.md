# PTD UI 系统规范

> 适用于 `@ptd/react-designer` 及其宿主应用中的编辑器工作区。规范来源于 PTD Legacy
> 的真实操作结构、Workshop 高密度工具台规范、Vidorra Blueprint 的“结构即装饰”方法，
> 以及当前 React 架构约束；它不是营销站设计规范，也不要求复制任何第三方产品外观。

## 1. Design Context

### 目标用户

- 在企业内部配置出库单、标签、票据、报表和业务打印模板的实施、运营与开发人员。
- 用户通常在桌面浏览器中连续工作，重视精确、效率、可预测性和键盘操作。
- 用户可能不了解组件 Schema，但熟悉纸张、字段、层级、对齐、数据源和打印预览。

### 核心任务

1. 从组件库创建文本、图形、图片、条码、二维码和表格。
2. 在真实纸张尺度上完成选中、移动、缩放、旋转、对齐、组合和层级调整。
3. 编辑组件属性、页面设置和数据字段绑定。
4. 通过结构树理解复杂模板，并可靠撤销误操作。
5. 在导出或保存前确认模板的页面边界、数据内容和最终视觉结果。

### 品牌语气

产品对外品牌名为 **Foliq**，默认中文类别说明为“结构化文档设计器”；`PTD` 继续作为内部工程代号、
包命名空间和稳定技术前缀。用户可见文案不得再把 `PTD` 当作产品品牌，也不得为了品牌迁移修改
`@ptd/*`、`--ptd-*`、`data-ptd-*`、MIME、环境变量或数据合同。

Foliq 是一张数字化的制版工作台：**精密、轻快、可信，带有纸张与校样工具的触感**。品牌核心定位
是“不是设计一张图，而是定义一种文档”；对外完整描述为“面向打印与出版的专业结构化文档设计器”。

- 主体是冷纸白与带蓝相的石墨灰，不使用纯白和纯黑铺满界面。
- 当前 Logo 仅作为待替换品牌资产复用，不参与主题 token 推导；正式 Logo 由独立品牌批次确定。
- 克制钴蓝用于主要操作、选中、焦点和工具图标；它只表达明确交互状态，不得退化为
  大面积通用后台蓝。校样朱红只用于出血、校样与印刷提醒，必须稀少。
- 视觉记忆点是“纸张、标尺、套准与校样”，不是玻璃、霓虹、渐变或 SaaS 卡片。

## 2. 设计原则

1. **画布优先**：编辑对象永远是视觉中心；应用 Chrome 不与纸张争夺注意力。
2. **精确胜过装饰**：位置、尺寸、层级和状态必须清晰，装饰不得降低读数效率。
3. **高密度但不拥挤**：使用紧凑控件、清晰分组和稳定节奏，不靠大块留白制造高级感。
4. **边界表达层级**：优先使用 1px 边线和 surface 差异；阴影只属于纸张和浮层。
5. **渐进披露**：常用动作直接可见，高级配置、危险动作和次要命令按需展开。
6. **状态不能只靠颜色**：选中、锁定、错误和禁用同时通过图标、边界或文本表达。
7. **沿用成熟心智模型**：保留 Legacy 已验证的画布工作流，把固定五入口 Rail 重组为高频
   Tool Dock 与 Pages/Layers/Data/Assets 按需资源面板。
8. **结构即装饰**：工程感来自网格、细线、刻度、节点和精确对齐，不来自无业务意义的工程编号。
9. **先定义契约再写局部样式**：尺寸、颜色、层级、滚动与交互状态必须使用统一 token。

## 3. 技术与边界

- React UI 使用 CSS Modules；画布动态几何使用 CSS Custom Properties。
- 交互原语优先使用 Radix UI；不引入带视觉意见的完整 UI 框架。
- 不引入 Tailwind 或 CSS-in-JS。Workshop 的 cva/Tailwind 写法只吸收“变体集中管理”的思想。
- React 组件变体使用显式 TypeScript union、`data-variant` 和 `data-size`；默认值必须显式声明。
- 静态颜色、间距、圆角和阴影禁止写入 JSX `style`；Schema 驱动或几何计算产生的 CSS 变量例外。
- 禁止 `!important`、`as any`、`@ts-ignore` 和运行时 CSS 注入。
- `@ptd/react-designer/styles.css` 是唯一公共样式入口。
- 应用级定制通过稳定的 `data-ptd-*` 属性和公共 token 完成，不依赖 CSS Module 生成类名。

## 4. Token 架构

### 4.1 原始色板

使用 OKLCH 定义现代浏览器色板，并保持相同色相下的感知明度一致。

```css
.ptdTheme {
  /* Cool paper */
  --ptd-paper-0: oklch(99.2% 0.004 255);
  --ptd-paper-1: oklch(98.2% 0.006 255);
  --ptd-paper-2: oklch(96.5% 0.008 255);
  --ptd-paper-3: oklch(93.7% 0.011 255);
  --ptd-paper-4: oklch(89.5% 0.014 255);

  /* Blue graphite */
  --ptd-graphite-950: oklch(21% 0.02 258);
  --ptd-graphite-900: oklch(27% 0.021 258);
  --ptd-graphite-800: oklch(35% 0.02 258);
  --ptd-graphite-700: oklch(44% 0.018 258);
  --ptd-graphite-600: oklch(53% 0.016 258);
  --ptd-graphite-500: oklch(62% 0.014 258);
  --ptd-graphite-400: oklch(71% 0.012 258);
  --ptd-graphite-300: oklch(82% 0.01 258);

  /* Proof vermilion */
  --ptd-vermilion-700: oklch(45% 0.16 35);
  --ptd-vermilion-600: oklch(52% 0.175 35);
  --ptd-vermilion-500: oklch(59% 0.17 35);
  --ptd-vermilion-100: oklch(94% 0.035 35);

  /* Editor cobalt */
  --ptd-cobalt-700: oklch(48% 0.22 265);
  --ptd-cobalt-600: oklch(57% 0.245 265);
  --ptd-cobalt-100: oklch(94.5% 0.04 260);
}
```

钴蓝与校样朱红均不得大面积铺底。中性 surface 应占视觉重量约 90%，明确状态色不超过
10%。钴蓝统一操作、选中与焦点；朱红仅保留印刷校样语义。Logo 的自身颜色不定义 UI
状态，也不要求组件跟随 Logo 换色。

### 4.2 语义颜色

```css
.ptdTheme {
  --ptd-surface-app: var(--ptd-paper-1);
  --ptd-surface-panel: var(--ptd-paper-0);
  --ptd-surface-raised: var(--ptd-paper-0);
  --ptd-surface-sunken: var(--ptd-paper-2);
  --ptd-surface-canvas: oklch(91.5% 0.012 255);
  --ptd-surface-paper: var(--ptd-paper-0);

  --ptd-text-strong: var(--ptd-graphite-950);
  --ptd-text: var(--ptd-graphite-800);
  --ptd-text-muted: var(--ptd-graphite-600);
  --ptd-text-disabled: var(--ptd-graphite-400);

  --ptd-border-strong: var(--ptd-graphite-400);
  --ptd-border: var(--ptd-graphite-300);
  --ptd-border-subtle: var(--ptd-paper-4);

  --ptd-action: var(--ptd-cobalt-600);
  --ptd-action-hover: var(--ptd-cobalt-700);
  --ptd-action-subtle: var(--ptd-cobalt-100);
  --ptd-selection: var(--ptd-cobalt-600);
  --ptd-selection-strong: var(--ptd-cobalt-700);
  --ptd-selection-subtle: var(--ptd-cobalt-100);
  --ptd-proof: var(--ptd-vermilion-600);
  --ptd-proof-subtle: var(--ptd-vermilion-100);

  --ptd-success: oklch(47% 0.105 145);
  --ptd-warning: oklch(58% 0.13 72);
  --ptd-danger: oklch(46% 0.17 27);
  --ptd-focus: var(--ptd-cobalt-600);
}
```

- 正文对背景至少达到 WCAG AA 4.5:1。
- 图标、边框、焦点环和选中指示至少达到 3:1。
- Placeholder 不是标签，且颜色同样要满足正文对比度要求。
- 错误状态使用 `--ptd-danger`；校样朱红不能代替错误语义。
- Context Bar、Resource Panel、Inspector 与 Status Bar 使用接近白色的 `surface-panel`，让长时间
  工作的主 Chrome 保持清洁；`surface-app` 只承担框架底色，`surface-sunken` 只用于局部凹槽、
  hover 和禁用状态。不得把多个深浅相近的灰 surface 反复嵌套成暗淡的整屏底色。
- 深色 App Bar、冷灰 Pasteboard 和冷白 Paper 继续形成三个明确层级；“提高 Panel 明度”不等于
  将 Canvas 或整页宿主铺成纯白。

### 4.3 间距、尺寸与圆角

以 4px 为基本单位，只使用以下阶梯：

```css
.ptdTheme {
  --ptd-space-1: 4px;
  --ptd-space-2: 8px;
  --ptd-space-3: 12px;
  --ptd-space-4: 16px;
  --ptd-space-6: 24px;
  --ptd-space-8: 32px;

  --ptd-control-xs: 24px;
  --ptd-control-sm: 28px;
  --ptd-control-md: 32px;
  --ptd-control-touch: 40px;

  --ptd-radius-1: 2px;
  --ptd-radius-2: 4px;
  --ptd-radius-round: 999px;
}
```

- 普通按钮、输入框、列表行和面板使用 2px 圆角。
- 浮层和空状态容器最多使用 4px 圆角。
- 只有单选、状态点、头像和旋转控制点可以为圆形或 pill。
- 不允许使用 8px 以上大圆角作为默认视觉。
- App Bar 是明确例外：为了保持与 ChemViz 产品家族一致，栏体使用 14px 底部圆角，展开命令项
  使用 12px 圆角；该例外不能扩散到普通 Panel、Inspector 或画布组件。

### 4.4 阴影与层级

```css
.ptdTheme {
  --ptd-shadow-paper: 0 1px 2px oklch(22% 0.014 48 / 12%), 0 8px 24px oklch(22% 0.014 48 / 8%);
  --ptd-shadow-floating: 0 8px 24px oklch(22% 0.014 48 / 16%);
  --ptd-shadow-modal: 0 20px 56px oklch(22% 0.014 48 / 22%);

  --ptd-layer-canvas: 0;
  --ptd-layer-guide: 20;
  --ptd-layer-selection: 30;
  --ptd-layer-scrim: 80;
  --ptd-layer-sticky: 100;
  --ptd-layer-floating: 1200;
  --ptd-layer-context: 1250;
  --ptd-layer-modal-backdrop: 1400;
  --ptd-layer-modal: 1410;
  --ptd-layer-toast: 1600;
  --ptd-layer-tooltip: 1700;
}
```

按钮、列表项和普通面板禁止各自添加阴影。纸张、Dropdown/Popover、Modal 与 Toast 才能使用阴影。

## 5. 字体与数值

```css
.ptdTheme {
  --ptd-font-ui:
    'Outfit', 'Outfit Variable', 'Sarasa UI SC', 'Sarasa Gothic SC', 'Microsoft YaHei UI',
    'PingFang SC', sans-serif;
  --ptd-font-metric:
    'Outfit', 'Outfit Variable', 'Sarasa UI SC', 'Sarasa Gothic SC', 'Microsoft YaHei UI',
    sans-serif;
  --ptd-font-serif: 'Noto Serif SC', 'Noto Serif CJK SC', 'Source Han Serif SC', 'Songti SC', serif;

  --ptd-text-10: 0.625rem;
  --ptd-text-11: 0.6875rem;
  --ptd-text-12: 0.75rem;
  --ptd-text-13: 0.8125rem;
  --ptd-text-15: 0.9375rem;
  --ptd-text-18: 1.125rem;
}
```

- 产品 UI 使用固定字号，避免流式字号破坏工具布局。
- 中文操作 UI 以 Sarasa UI SC 为主；Outfit 负责拉丁字母、数字和产品字标。两者在同一行
  按 glyph fallback 组合，不把等宽字体当作“工程感”。
- 衬线内容统一使用 Noto Serif SC 系列，仅用于模板叙事、预览标题或明确要求衬线的内容；
  表单、工具栏、坐标和快捷键仍使用 UI sans。
- Outfit 与 Noto Serif SC 由宿主通过 Google Fonts 或等价 Web Font 服务引入；离线部署必须
  提供可控的本地镜像或依赖系统 fallback。Sarasa UI SC 没有可靠的通用 Web 服务版本，示例 Web
  通过 `@font-face` 自托管完整 `SarasaUiSC.ttf`。可复用设计器包只提供字体栈，不强制注入大型
  CJK 字体资产。
- 常规控件正文为 12–13px；面板标题 13px；文档标题 15px；产品名不超过 18px。
- 标尺、坐标、尺寸和缩放使用 `font-variant-numeric: tabular-nums`。
- 画布内部字体由 `TemplateSchema` 控制，不继承设计器 Chrome 的字体决策。
- 浏览器 200% 缩放必须仍可操作；窄空间通过布局折叠解决，不能禁止页面缩放。

### 5.1 品牌资产

- 当前阶段 App Bar 复用 Legacy 的圆形 PTD Logo，不以临时字母块、Emoji 或套准框替代；
  后续可以直接替换正式品牌资产，而不修改主题色与交互状态。
- Logo 保持资产本身的透明底和颜色，不通过 CSS mask 强行重染；标准视觉尺寸为 24–28px。
- `PTD` 拉丁字标使用 Outfit 650–700；中文产品名使用 UI 字体，二者是一个品牌单元。
- 朱红套准、裁切或校样符号可以出现在功能场景，但不能冒充产品 Logo。

### 5.2 结构装饰语汇

从 Vidorra Blueprint、Zed 与 Workshop 只吸收适合密集工具台的结构原子：

- **Hairline**：App Bar、Command Bar、Panel 与 Status Bar 使用贯穿区域的 1px 冷蓝灰细线。
- **Engineering grid**：Pasteboard 可使用极淡工程纸网格；纸张本身保持干净，网格不能穿入模板。
- **Mount texture**：Pasteboard 可叠加低对比 135° 斜线，表达纸张装配区而非真实打印材质；
  斜线、工程网格、工作区内框和节点均必须 `pointer-events: none`。
- **Workbench frame**：Pasteboard 不添加包围纸张和标尺的重复工作区外框；Paper 边缘、真实标尺
  基线和应用分区线已经提供足够边界。禁止菱形、空心方块、纸张角点等纯装饰节点。
- **Dot field**：选中行可使用 8px 低透明点阵与 2px inset 指示，但不得铺成高饱和色块。
- **Physical press**：可交互 tile/按钮允许 1px inset 底边形成轻微实体感；hover 摊平，active
  下压 `translateY(1px) scale(0.99)`。普通面板仍禁止外投影。
- **Ruler/ticks**：任何视觉上类似标尺的刻线都必须对应真实毫米尺寸、页面方向和当前画布缩放；
  禁止使用无数字、固定间距且与纸张尺寸无关的伪标尺。
- 禁止 `PRO / 01`、坐标角标、伪图纸编号、无意义英文缩写等装饰性工程文字。

## 6. 工作区布局合同

### 6.1 桌面结构

```text
┌────────────────────────────────────────────────────────────────────┐
│ App Bar：品牌、应用菜单、载入/保存、账户入口                        │ 42
│ └─ Application Menu：点击展开/收起，真实下压下方工作区              │ auto
├────────────────────────────────────────────────────────────────────┤
│ Context Bar：历史 + 当前页面/单选/多选/参考线命令                  │ 40
├────┬──────────────┬──────────────────────────┬─────────────────────┤
│Dock│ Resource     │ Canvas / Ruler / Paper   │ Inspector           │
│ 42 │ 280, 按需    │ minmax(0, 1fr)           │ 304, 按需           │
├────┴──────────────┴──────────────────────────┴─────────────────────┤
│ Status Bar：页码、选择、页面尺寸、参考线、缩放                      │ 24
└────────────────────────────────────────────────────────────────────┘
```

```css
.ptdTheme {
  --ptd-app-bar-height: 42px;
  --ptd-app-bar-height-compact: 38px;
  --ptd-command-bar-height: 40px;
  --ptd-command-bar-height-compact: 36px;
  --ptd-status-bar-height: 24px;
  --ptd-tool-dock-width: 42px;
  --ptd-tool-dock-width-compact: 36px;
  --ptd-resource-panel-width: 280px;
  --ptd-inspector-width: 304px;
}
```

- App Bar 复用 ChemViz 桌面导航的材质合同：`rgb(0 0 0 / 88%)` 背景、16px backdrop blur、
  `rgb(255 255 255 / 6%)` hairline 与 `0 10px 28px rgb(0 0 0 / 12%)` 阴影；根据 PTD 高密度
  工作台语境将高度收紧为 42px、底角收紧为 14px。
- App Bar 折叠时高 42px，第一行轨道使用内容高度；展开菜单必须参与 Designer Grid 布局并真实
  下压 Context Bar、Canvas 和 Panel，禁止使用 fixed/absolute 覆盖工作区。
- App Bar 保留品牌与真实载入/保存动作；账户入口在认证功能接入前可以显示明确的用户占位，但不
  重复展示当前模板标题、页码、纸张方向和尺寸，这些信息由 Context Bar、Inspector 与 Status Bar
  承担。不存在的云保存、同步或运行状态不得占位。
- 应用菜单分类统一为文件(F)、编辑(E)、对象(O)、视图(V)、窗口(W)、帮助(H)，靠左排列在品牌
  之后并提供 `accessKey`/`aria-keyshortcuts` 助记键语义。展开区直接显示命令名称、简短用途与
  Windows 风格快捷键，不增加“应用命令”“界面预览”等解释性标题；尚未实现的命令不得执行
  业务动作，必须保留为明确 Disabled 并通过可访问名称和 Tooltip 明示“功能待接入”，不能点击后
  仅关闭披露层伪装执行。Host 命令通过统一能力表声明 Enabled/Pending/Reason；编辑器命令必须复用
  Toolbar、快捷键和上下文菜单使用的同一 EditorStore 方法。
- 桌面应用菜单只能通过触发器 click/键盘激活显式展开；hover 只提供视觉反馈，Tab focus 不得自动
  展开。点击已打开的同一分类收起，点击另一分类保持面板打开并切换内容；点击 Header 外部、焦点
  移出 Header 或 Escape 收起。左右方向键/Home/End 在关闭时只移动焦点，在展开时同时切换分类。
  App Bar 必须声明编辑器交互边界，禁止 Designer 根节点在菜单 pointer down 时抢回画布焦点。
  Touch/Pen 不依赖任何 hover 自动开合，避免触摸浏览器合成 mouse/hover 事件扰动菜单状态。
  `prefers-reduced-motion` 下取消轨道和位移动画。
- 窄容器将六个桌面分类折叠为汉堡按钮；点击在原位展开菜单，并在展开区顶部显示可横向滚动的
  分类条。Touch/Pen 下汉堡按钮显式切换开合，分类点击只切换内容并保持打开，命令点击或 Escape
  收起。载入、保存、账户等关键入口适配成紧凑图标，不因响应式布局被删除。
- Host 提供文档元数据时，Status Bar 显示标题、版本和中文状态文本；状态可以同时使用语义色点，
  但不能只依赖颜色传达。窄容器可隐藏标题和版本，必须保留保存、载入、错误或冲突等关键状态。
- 披露节奏与 ChemViz 一致：轨道使用 340ms `cubic-bezier(0.22, 1, 0.36, 1)`，内容从
  `translateY(-8px)` 与透明态进入；实现优先使用 `grid-template-rows: 0fr → 1fr`，不测量或动画
  固定高度。
- Context Bar 依据 effective tool、页面、单选、多选和参考线选择切换命令；Text/Shape/Hand 工具
  优先显示当前模式、直接操作和退出提示，返回 Select 后才恢复页面/选择上下文。
- Tool Dock 在语义上分为工具和资源面板两区，但不常驻显示“工具”“面板”文字；使用分区位置、
  `role="group"` 与 `aria-label` 保持可理解性。Select/Hand/Text/Shape/Image/Table/More 属于操作入口，
  Assets/Pages/Layers/Data 只负责披露资源面板。它使用与面板相连的中性纸灰/石墨 surface；
  常态图标中性，键盘 Focus 才固定使用钴蓝。Document Bar 承担深色视觉锚点，Dock 不应表现成
  与画布割裂的第二套导航产品。
- 精细指针下 Persistent Tool 激活使用轻中性 paper 底、钴蓝图标与靠 Dock 外缘的短几何标记；
  打开的资源面板入口把短标记放在邻近 Panel 的一侧。两种状态不得改变按钮尺寸，也不使用三边
  inset、负 margin、keycap 底边或外投影。禁止用“长钴蓝竖线 + 大面积浅钴蓝底”同时表达状态。
- Resource Panel 默认宽 280px、限制在 240–360px；Inspector 默认 304px、限制在 280–420px。
  两者均可折叠和拖动调整，最后宽度在当前 Designer 实例中保留。
- 无组件选择时 Inspector 必须展示真实 Page Inspector，而不是空状态；只读信息不得伪装成输入框。
- 左侧面板和右侧 Inspector 各自只有一个主滚动容器；标题、搜索和底栏不参与滚动。
- 画布滚动只发生在 Canvas viewport，不能让整个应用页面滚动。
- 中央列必须 `min-width: 0`；固定面板不能挤破画布，而应触发自身响应式策略。
- 活动资源、开合和宽度属于实例级 UI state，不写入 `TemplateSchema`、不触发 `onChange`，也不
  进入模板撤销历史。

### 6.2 面板原语

所有左侧面板和右侧 Inspector 复用相同结构：

```text
PanelRoot
├─ PanelHeader      面板身份、数量、折叠/关闭动作
├─ PanelTools?      搜索、筛选或上下文操作
├─ PanelBody        唯一主滚动容器
└─ PanelFooter?     固定的创建/应用动作
```

- `PanelHeader` 高 40px，不能在内容区重复同名标题。
- 列表使用平面行或紧凑 tile；不使用卡片套卡片。
- 左侧 Resource Panel 的当前 Page/Layer 使用中性 raised surface、上下 hairline 与字重表达；不得
  使用钴蓝左竖线叠加浅蓝底。Canvas 对象选择仍使用专属钴蓝 overlay，两者不能混为后台导航态。
- Hover 才出现的次要动作必须提供键盘可达的替代入口。
- 空状态包含：当前状态、下一步价值和一个明确动作。

## 7. 组件工具选择器与素材面板

- Catalog 使用独立于持久 Schema category 的五组 taxonomy：文本、表格、图像、编码、图形；
  `common/data/shape` 与既有 `ComponentType` 只承担模板兼容，不能直接决定工具分组。
- Select、Hand、Text Group、Shape Group、Image、Simple Table 是位置稳定的高频 Dock 工具；其下的
  More 按钮打开完整组件工具 Picker。文本组记忆本 Designer 实例最近使用的简单文本或富文本，
  图形组继续记忆最近 Shape；两者的 disclosure 都不能挤偏主图标。
- Picker 是锚定 Dock 的非模态 Portal，而不是 Resource Panel 或大型 Modal。它提供搜索、最近使用和
  五组紧凑二列工具项，只显示 `kind: available` 的真实组件；planned 项保留在产品 Catalog/文档，
  不进入可操作浮层，也不以禁用按钮伪装为当前能力。
- Picker 打开后聚焦搜索；Arrow/Home/End 在工具项间移动，Enter/Space 选择，Escape 关闭并恢复
  More 焦点。鼠标支持 light-dismiss；Touch/Pen 的外部 pointerdown 不关闭，避免轻触误关，必须通过
  关闭按钮、选择工具或 Escape 明确结束。
- Picker 根据 Designer 容器、触发按钮和自身尺寸实时定位并 clamp；Portal 必须应用共享主题和
  `data-ptd-editor-interactive`，不能被全局画布快捷键抢占。搜索、最近使用与开合只属于实例 UI state。
- 原 Components 资源入口改为 Assets。正式资产引用、去重与持久化合同建立前，素材面板只提供诚实
  空态和真实可执行的图片框入口，不创建刷新即丢失的伪上传、收藏、文件夹或服务端同步。
- 所有可用组件点击后只激活对应创作工具，不得立即在页面中心插入，也不得通过 Sidebar native
  drag 绕过拖框。用户必须在 Paper 上拖动定义组件 Frame；无效短拖和取消不创建组件。
- 新建 Shape 必须在取消选中时仍然可见：Line 默认使用 2px 蓝石墨填充，Rect/Circle 默认透明填充
  与 1px 蓝石墨实线描边，Star 默认蓝石墨填充。默认值来自 Core Registry，不能只在 Designer
  preview 或 React Overlay 中补视觉假象。
- Shape Renderer 必须自包含实际几何；Star 等轮廓使用包内 SVG，不能依赖宿主是否加载某套图标
  字体来决定画布内容是否可见。
- Shape 使用一个 Dock 工具组和四个面板 preset；精细指针下 Dock 主按钮为完整 30×30、图标
  16×16 居中，disclosure 作为右下角 13×13 覆盖目标。coarse pointer 下恢复 40×40 主目标、
  20×20 图标与 16×16 disclosure。任何尺寸都不能压缩主按钮或把图标挤偏。
- 当前 Shape preset 使用中性 graphite 边缘/字重与 inset edge，不使用蓝色左线或浅蓝填充。
- 创建 Schema 只能调用统一 Component Catalog/Factory，面板不能自己拼接默认属性。
- 有效 Draw 每次只添加一个完整 Schema、写入一个历史节点并发出一次最终 `onChange`；tool
  activation、preview、Hand/pan、short/cancelled draw 不发出模板变更，也不自动退出当前工具。
- 四种 Shape 完成后保持连续绘制；文本、富文本、图像、编码和表格完成一次后回到 Select。
  普通文本和富文本创建完成立即进入内容编辑，其他一次性工具保留新组件选中态供属性配置。
- 自由表格对象第一次点击仍只选择组件；选中后单元格表面接管精细操作。单击/拖动/Shift 扩展建立
  单元格选区，双击或 Enter/F2 原位编辑纯文本，Arrow/Tab 导航。选区使用浅钴蓝蒙版和精确描边，
  不能用不透明填充遮住单元格内容。
- 行列分隔线 hover 才显示细窄拖动命中区，拖动即时改变相邻轨道且形成一个 Gesture 历史节点。
  高频增删、合并、拆分与单元格排版位于 Inspector；不为表格打开遮断画布的大型 Modal。
- 表格结构命令使用完整动作名称和明确 disabled 状态；至少一行一列不能删除。`RoyComplexTable`
  在完整数据/分页合同完成前只作为规划项展示，旧 Schema 的只读渲染兼容不等于可创作能力。

### 7.1 Pages 资源面板

- Pages 面板管理手动设计页，而不是展示数据溢出产生的运行时页。页面列表保持有序，显示页码、
  对象数量和明确当前页；切页是 UI 导航，不触发模板 `onChange` 或撤销历史。
- 固定 Footer 提供新增、复制、上移、下移和删除。图标动作必须有 `aria-label`、Tooltip、
  focus-visible 与正确 disabled 状态；最后一页的删除始终禁用。
- 拖动排序是效率入口，不是唯一入口；上移/下移按钮必须始终提供等价的鼠标和键盘路径。
- 新增空白页与复制页插入当前页之后并切换到新页。复制页递归生成新的页面、组件和组合子项 id，
  不能共享可变 Schema 引用。
- 页面排序必须按 page id 保持当前页，不因位置索引变化跳到其他页面；删除当前页后选择同位置的
  下一页，删除末页时选择新的末页。
- 页面结构命令每次只创建一个历史节点并发出一次最终 `onChange`；Undo/Redo 后页码、App Bar、
  Page Inspector 和 Status Bar 必须保持一致，不能出现越界 currentPageIndex。
- Word 式自动分页属于数据预览/打印渲染：表格、列表或长文本以后可以生成只读派生页，但不得把
  运行时页写回手动 Pages 列表，也不得因为测试数据变化污染模板历史。

## 8. 工具栏与图标

- 图标系统统一为 Remix Icon line 风格；激活态可使用对应 fill 图标，但不得混用多套图标语言。
- 标准工具图标 16px，重要文档级动作 18px；描边粗细保持一致。
- 禁止使用 Emoji、Unicode 箭头或“左齐/中齐/横分”等文字缩写代替正式图标。
- 每个图标按钮必须有 `aria-label` 和 Tooltip；Tooltip 同时展示名称与快捷键。
- 常规命令栏图标按钮视觉尺寸 28px；较宽的 coarse pointer 工作区将可点击区域提升到至少 40px。
  `<= 480px` 的 Designer 容器使用 32×32 紧凑视觉控件和 15–16px glyph，避免按钮填满整条
  36–38px Chrome；这是一项仅限手机宽度的高密度例外，不能扩散到平板或桌面触屏。
- Tool Dock 的主入口在精细指针下使用 30×30 target 和 16×16 图标，coarse pointer 下使用
  40×40 target 和 20×20 图标；`<= 480px` 容器覆盖为 32×32 与 15×15。所有 glyph 共用同一
  光学中心。组合工具的 disclosure 只能叠加在角落，不能改变主图标 grid cell。Shape 菜单必须消费 Arrow/Home/End、
  Enter/Space 与 Escape，禁止继续冒泡到对象移动、临时 Hand 或全局退出工具快捷键。
- 命令按领域分组：历史、剪贴板、排列、层级、组合、视图。
- 低频排列命令可进入 Dropdown；撤销、重做、删除、锁定、组合和缩放保持可发现。
- 禁用按钮保留位置，使用 `opacity: 0.45` 并移除事件；不靠 `cursor: not-allowed` 表达状态。
- Status Bar 的缩放减/选择/增保持一个紧凑语义组，但不绘制表单式整组外框和固定竖分隔线；
  单个动作只在 hover/focus 时出现局部 surface 或 focus ring，避免与状态文本争夺视觉重量。

## 9. 表单与属性检查器

- Label 始终可见，Placeholder 只给示例，不能承担字段名称。
- 常规输入高度 28px，关键 Select/Combobox 高度 32px，圆角 2px。
- Page、Single 与 Multi Inspector 复用固定 Header、单一滚动 Body 和可选固定 Footer；切换状态
  不得改变主面板的滚动与定位合同。
- 几何属性优先组成 X/Y/W/H 二列网格，使用带增减动作、等宽数值和清晰单位后缀的紧凑步进器。
  合法的编辑中间态在焦点内保留，完成编辑时才提交一个历史手势。
- 文档显示单位默认 `mm`，Status Bar 提供全局 `mm / PTD Canvas px` 切换。页面、组件、表格、标尺、
  参考线、Context Bar 与 Status Bar 必须同步；切换只改变显示和输入合同，不写模板、不发 Host change、
  不进入历史。字号继续使用 `pt`，旋转使用度，透明度使用百分比，行高保持无单位。
- 可编辑数值的 Label 同时作为水平拖动热区：每次拖动只提交一个历史手势，Shift 加速，
  Alt/Option 精调，Escape 恢复拖动起点且不写入历史；触屏和键盘用户继续使用输入框与增减动作。
- 混合数值在没有相对调整语义时禁用 Label 拖动和增减动作，仅保留明确录入；不能用拖动把多选值
  意外压平成同一个绝对值。
- 二至四项的小型枚举优先使用 segmented control；约束选项使用紧凑 Select；颜色同时提供可视
  色板和可编辑值。只有真正的长内容使用 textarea，不能把 Inspector 退化成原始输入框列表。
- Page、Single、Multi 与 Table 业务面板必须组合共享 `InspectorControls`；原生 `input`、`select`、
  `textarea` 和 `color` 只能存在于控件实现内部，不能在业务面板重复拼装视觉与 Gesture。
- 颜色控件闭合态保持紧凑色样、精确值和展开动作；展开态提供透明/无色（仅适用属性）、恢复默认、
  最近使用和文档颜色。最近颜色是 Designer 实例状态；文档颜色从当前模板派生、按频次和稳定顺序去重，
  两者都不写入 Schema 或历史。锁定或禁用时已展开面板必须收起。
- 混合值、锁定、禁用与非法草稿必须同时通过文字、图标或控件状态表达，不能只改变颜色。
- 高频且与当前组件相关的内容、几何、排版和基础外观分区保持展开和位置稳定；不适用的分区直接
  隐藏。Disclosure 只用于低频高级属性（如描边与圆角），不能把所有主分区都做成折叠面板。
- 图片、二维码和条形码必须在内容分区提供专用配置，不得用“结构化内容由专用编辑器维护”占位。
  图片支持稳定 URL/Data URL、本地文件读取、替代文本、适配方式和对象位置；二维码支持内容、
  纠错等级、静区与前/背景色；条形码支持内容、码制、前景色和可读文字开关。
- 本地图片通过 `FileReader` 转换为可持久化 Data URL；临时 `blob:` URL、脚本协议和非图片 Data URL
  必须在字段附近显示文字错误并拒绝提交。图片未设置、载入中和载入失败都要在组件 Frame 内显示
  可理解状态，不能展示浏览器破图图标或静默空白。empty/loading/ready/error 四态互斥；地址更新时
  必须立即移除旧图，旧请求迟到的 load/error 回调不能覆盖当前地址或已销毁组件。
- 二维码和条形码创建后必须带合法、可见的默认内容。码制校验错误与渲染模块错误使用紧凑的字段
  状态和 Frame 内状态呈现；内容背景与组件外观背景语义重复时，只保留专用内容字段。
- 混合值显示明确的“多值”状态，不能伪造默认颜色或数字。
- 数字输入在提交前保留草稿；空值、越界值或非法值不能静默写成 0，也不能夹紧成 min/max 后写入。
  Stepper 与 scrub 可以在明确边界停止，但键入值必须要求用户修正。
- 锁定组件的字段禁用，并在面板顶部提供明确的“解锁组件”动作。
- 错误在 blur/commit 时显示在字段下方，并通过 `aria-describedby` 关联。

## 10. 画布视觉合同

- Pasteboard 使用 `--ptd-surface-canvas`；纸张使用冷白 `--ptd-surface-paper` 和唯一的 paper shadow。
- Starter/Demo Schema 也必须使用冷中性纸白，不能通过 `pageConfig.background` 把默认纸张覆盖为
  奶油色或暖白；示例内容的正文中性色使用蓝石墨，朱红仅保留真实校样语义。
- Paper shadow 由 1px 硬边框、约 4px 右下实体偏移与一层柔和长阴影组成，表达装配在工作台上的
  纸张；阴影不能复制到面板或组件卡片。
- Pasteboard 可以同时包含低对比斜线材质和 24px 工程网格；不使用包围标尺的工作区外框、
  菱形、纸张角点或无语义边缘刻线。所有装饰必须停留在应用 Chrome/Pasteboard，绝不能进入
  Paper 内容或导出结果。
- 标尺打开时，在 Paper 顶部与左侧显示真实物理标尺。默认毫米模式使用 5mm 次刻度、10mm 主刻度、
  20mm 数字标签；px 模式以等价的 25/50/100 PTD Canvas px 标签显示。两种模式始终显示 `0`、
  实际页面终点和当前单位；横竖方向随 `pageDirection` 交换，切换不改变物理位置。
- 标尺关闭时，刻度、数字、基线和单位必须整体移除，不能残留一层“装饰版标尺”。
- 标尺是工具，不是装饰：刻度低对比，主刻度和当前指针读数清晰，数字使用 tabular nums。
- 水平标尺创建 X 轴位置的垂直参考线，垂直标尺创建 Y 轴位置的水平参考线；支持点击或拖拽
  创建、拖动调整、点击选择、双击或 Delete 删除。选中态必须在标尺显示三角标点，并显示
  `X/Y + 0.1mm` 精度位置标签。
- 指针在水平或垂直标尺移动时，应以当前新建颜色显示一条低透明临时参考线和 `X/Y + 0.1mm`
  位置标签；该预览只存在于组件本地状态，点击后才写入参考线会话。固定参考线的位置标签在
  选中或 Hover 该线时显示，不能要求先选中才能读取位置。
- 参考线提供钴蓝、朱红、翠绿、琥珀四种颜色，并支持整体显隐、锁定和清空。颜色既是新建默认色，
  也可修改当前选中参考线；锁定后禁止创建、移动、换色、删除和清空。
- 参考线位置必须被限制在当前页面物理边界内；普通方向键按 0.1mm 微调，Shift + 方向键按 1mm
  微调。页面方向变化时，超出新边界的参考线必须收回页面内。
- 参考线属于宿主编辑会话的 UI 状态，不写入 `TemplateSchema`、不进入打印/导出结果，也不创建
  模板撤销历史节点。后续若需持久化，应由宿主保存独立的编辑会话数据。
- 页面边距使用弱朱红虚线；选中框与控制点使用主题钴蓝。钴蓝只服务于交互，不作为面板或画布
  的大面积底色；朱红参考线是用户显式选择的编辑标记，不等同于固定校样装饰。
- 校样朱红可用于出血/危险边界、套准裁切标记和关键提醒，不用于普通选中框。
- 旋转、缩放和移动反馈不得改变组件本身的 Schema 样式。
- Editor tool 分为 persistent `activeTool` 与临时覆盖后的 `effectiveTool`。`H` 激活 persistent Hand，
  `V`/Escape 返回 Select；可编辑控件外按住 Space 只临时令 effective tool 为 Hand，keyup、blur 或
  卸载必须恢复原 Creation/Shape/Select，且不得修改 last-used Shape。
- Hand 只通过 pointer drag 改变 Canvas viewport 的 `scrollLeft/scrollTop`，idle 使用 `grab`、drag
  使用 `grabbing`；不得清除选择、移动 Paper/对象/参考线、触发 `onChange` 或写历史。pointer cancel、
  lost capture、工具切换与 window blur 都必须清理 pan session。
- 所有可用目录组件都是 draw tools。Pointer down/move 产生本地 preview；4 CSS px 以下、Escape、
  Hand/Space、pointer cancel、lost capture 与 blur 都只取消。有效 pointer up 归一化并 clamp 页面几何，
  再调用一次 `completeDrawnComponent()`。四种 Shape 连续绘制；其余工具完成一次后回到 Select；
  `RoySimpleText` / `RoyText` 同时进入内容编辑。内容 Frame 支持正反拖框且 Shift 不约束，QR 始终
  保持正方形；闭合 Shape 的 Shift 等比，Line 使用中点、欧氏长度与 `atan2` 角度。
- 框选区域使用清晰边框和不超过 8% 的选中色透明填充，不能遮挡待选组件。拖动接近 Canvas
  viewport 边缘时应按距离渐进自动滚动；滚动后的框选坐标必须使用实时 Paper 矩形重新换算，
  并限制在未缩放纸张边界内，不能继续沿用按下瞬间缓存的屏幕矩形。
- 画布 Overlay 测量需监听滚动、`window.resize`、DOM mutation、画布层与滚动容器的
  `ResizeObserver`，并通过 `requestAnimationFrame` 节流。
- 画布缩放只改变 stage/paper，不缩放应用 Chrome、Tooltip 或面板。

### 10.1 单选组件快捷条

- 单选组件时，选中框与 Selection Quick Bar 共享同一钴蓝语义；未激活组件常态不显示边界，
  Hover 才显示弱钴蓝虚线和不超过 5% 的钴蓝透明蒙版。Hover/选中边界必须由不参与盒模型的
  Overlay 绘制，不能用实体 `border` 缩小组件内容区域；多选只显示一套多选移动入口，不能为
  每个对象重复浮条。
- Quick Bar 显示组件名称，并提供拖动、锁定/解锁、复制、上移一层和删除五个高频动作；
  每个图标动作必须有 `aria-label`、Tooltip、focus-visible、disabled 和危险态。
- 锁定组件仍显示 Quick Bar，但除“解锁”外的破坏性或几何动作全部禁用。
- Quick Bar 必须作为独立 Selection Overlay 保持屏幕水平，不能继承组件旋转或画布缩放。
- Overlay 位置以 Canvas viewport 为可视边界：监听 viewport 滚动、`window.resize`、组件与 viewport
  的 `ResizeObserver`，经 `requestAnimationFrame` 节流；顶部空间不足时放到组件下方，水平位置
  必须 clamp，不能被侧栏或滚动视口裁切。
- Quick Bar 只改变编辑器 UI，不得写入 `TemplateSchema`、修改组件样式或出现在打印/导出结果中。

### 10.2 画布右键菜单

- 右击未选中的组件时，先把该组件设为当前单选；右击现有多选中的任一成员时，必须保留完整多选；
  右击 Paper 空白时清空组件选择并进入页面上下文。仅打开菜单或属性 Inspector 不写模板历史。
- 组件上下文复用现有编辑命令，提供属性、复制、剪切、锁定/解锁、适用时的组合/拆分、四种层级
  操作和删除；不能出现无实现的装饰菜单项。层级使用子菜单披露，危险删除使用明确危险态。
- 选择中包含锁定对象时，只允许属性、复制和明确解锁。剪切、删除、组合/拆分和层级调整在 UI 中
  不可用，并由 Store 保留第二层 no-op 防护，不能出现点击后无反馈的伪可用命令。
- 空白上下文提供页面属性和“粘贴到此处”。剪贴板为空时粘贴禁用；多选粘贴以所选对象的可视
  包围盒左上角对齐点击位置，保持内部相对布局，并在整体可容纳时限制到纸张物理边界。
- Paper 必须有可访问名称和可聚焦入口，同时支持鼠标右键、`Shift+F10` 与 Context Menu 键。
  菜单交互沿用 Radix roving focus，支持方向键、Enter 和 Escape，焦点态不能只依赖颜色。
- ContextMenu Portal 应用共享 `ptdTheme`，使用 `--ptd-layer-context`；在 compact Inspector/Resource
  Scrim 上方可见可操作，但仍低于 Modal、Toast 与 Tooltip。
- ContextMenu 主菜单与每一级子菜单都属于独立的 Portal 交互边界。Designer 根节点不得在其
  `pointerdown` 捕获阶段抢回焦点，全局快捷键也不得消费菜单的方向键、Enter 或 Escape；鼠标从
  父菜单移入子菜单后，子项必须保持可悬停、可点击并完成命令选择。

## 11. Portal 与主题合同

Radix Tooltip、DropdownMenu、ContextMenu、Popover 和 Dialog 通过 Portal 离开 Designer DOM
后，不会继承根节点 token。因此：

- Designer 根节点和每个 Portal Content 必须同时应用共享 `ptdTheme` 类。
- 每个可交互 Portal Content 必须声明统一的交互边界，使 Designer 根节点的焦点捕获和全局快捷键
  跳过该子树。React Portal 的事件仍沿 React 树传播，不能仅凭 DOM 已挂载到 `document.body`
  就假定事件与 Designer 隔离。
- 禁止在单个浮层内重新声明一套颜色或写 magic-number `z-index`。
- 浮层使用第 4.4 节语义 layer token。
- ContextMenu 必须高于普通 floating，低于 Modal、Toast 和 Tooltip。
- 新增 Portal 组件时至少验证：在左侧面板、右侧 Inspector、画布和 Modal 内均可见、可点、可键盘操作。

## 12. 交互状态与无障碍

每个交互组件至少实现：default、hover、focus-visible、active、disabled；异步组件还需
loading、error、success。

- `focus-visible` 使用 2px `--ptd-focus` 外环和 1px offset，不能裸写 `outline: none`。
- Radix Tabs/Menu/Radio 使用其 roving tabindex 和键盘语义，不重新发明键盘模型。
- 删除组件优先立即执行并允许撤销；批量或不可逆删除才使用确认对话框。
- 所有拖拽动作必须有点击、菜单或键盘替代路径。
- 锁定、警告和错误不能仅通过颜色表达。
- 可交互图标必须有可访问名称；装饰图标设置 `aria-hidden="true"`。

## 13. Motion

```css
.ptdTheme {
  --ptd-duration-instant: 120ms;
  --ptd-duration-state: 180ms;
  --ptd-duration-panel: 240ms;
  --ptd-ease-out: cubic-bezier(0.25, 1, 0.5, 1);
  --ptd-ease-in: cubic-bezier(0.7, 0, 0.84, 0);
}
```

- Hover、按下和颜色变化使用 120–180ms。
- 面板开合和浮层进入使用 180–240ms；退出约为进入的 75%。
- 只动画 `transform` 与 `opacity`。折叠内容使用 grid row 技术，不直接动画 height。
- 禁止 bounce、elastic、持续 pulse 和装饰性入场动画。
- `prefers-reduced-motion: reduce` 下移除空间位移，保留瞬时状态反馈。

## 14. 响应式与输入方式

PTD 是桌面优先的生产工具，但不能假设所有桌面设备都有精细鼠标。响应阈值以 Designer
容器宽度为准，不读取设备类型，也不只依赖 `window.innerWidth`。

- `>= 1440px`：wide；Tool Dock、Resource Panel、Canvas、Inspector 默认同时显示。
- `1180–1439px`：standard；Tool Dock 与 Inspector 默认显示，Resource Panel 默认折叠。
- `< 1180px`：compact；Tool Dock 保持，Resource Panel 与 Inspector 作为互斥 overlay 打开。
- 从一个档位切到另一个档位时采用该档位的安全默认开合；用户仍可用 Context Bar 入口恢复面板。
- compact overlay 打开一个必须关闭另一个；Scrim 或 Escape 可关闭当前 overlay。overlay 宽度以
  Designer 容器为边界，禁止使用 `100vw` 推算嵌入式设计器宽度。
- compact Scrim 位于 Selection 与 Sticky Panel 两个语义层之间：它必须覆盖 Quick Bar、选框和
  画布编辑 Chrome，但不能盖住当前打开的 Resource/Inspector overlay。
- 不因窄屏删除关键功能；只改变入口和披露层级。
- `pointer: coarse` 时取消依赖 Hover 才可发现的操作；正常宽度控件命中区域至少 40px。仅当 Designer
  容器 `<= 480px` 时，App Bar 高 38px、Context Bar 高 36px、Tool Dock 宽 36px，三者的主要
  控件收紧为 32px、glyph 为 15–16px。组件级响应以容器查询为主；顶层全屏 Web 宿主允许额外使用
  `(pointer: coarse) and (max-width: 480px)` 作为手机 viewport fallback，但不能替代容器查询。
  fallback 必须以更高选择器优先级明确覆盖 40px coarse 合同，不能依赖构建后的规则排序，也不能通过
  UA 或设备型号猜测。
- 浏览器缩放到 200% 时，工具栏允许分组折叠，不能产生不可达的横向命令。

## 15. 稳定定制入口

核心区域必须提供稳定属性：

```tsx
<div data-ptd-region="designer" />
<header data-ptd-region="app-bar" />
<div data-ptd-region="application-menu" />
<nav data-ptd-region="command-bar" />
<aside data-ptd-region="left-sidebar" />
<div data-ptd-region="resource-panel" />
<div data-ptd-region="pages-panel" />
<div data-ptd-region="structure-panel" />
<div data-ptd-region="data-panel" />
<div data-ptd-region="asset-panel" />
<div data-ptd-region="component-tool-picker" />
<div data-ptd-region="canvas-viewport" />
<div data-ptd-region="paper" />
<aside data-ptd-region="inspector" />
<aside data-ptd-region="page-inspector" />
<footer data-ptd-region="status-bar" />
```

- CSS Module 类名是内部实现，不是宿主定制 API。
- 宿主可以在 Designer 外层覆盖公开 token，但不能依赖内部 DOM 顺序。
- 动态 Schema 样式仍具有画布内容内的最高优先级，不得污染应用 Chrome。

## 16. UX 文案与术语

- 统一使用：组件、结构、属性、数据源、全局设置、组合、拆分、锁定、解锁、置顶、置底。
- 按钮使用明确动作，如“添加文本”“解锁组件”“删除 3 个组件”，不用“确定”“提交”。
- 空状态说明下一步：`画布中还没有组件。选择一个组件工具，然后在纸张上拖动绘制。`
- 错误信息包含发生了什么、原因和恢复方式，不能只写“操作失败”。
- Tooltip 可补充快捷键，但不能承载完成任务所必需的唯一说明。

## 17. 禁止模式

- 大圆角 Card、Chip、Pill 成为默认构图。
- 多层卡片嵌套、每个区域都有阴影。
- 玻璃拟态、发光边框、紫蓝渐变、渐变文字或装饰性 blob。
- 在工作台中使用营销页式大标题和大面积无功能留白。
- 文本缩写冒充图标；混用 Remix、Emoji 和不同描边风格。
- 依赖 Hover 的唯一操作入口。
- 每个面板维护不同的 Header、滚动区和空状态实现。
- Portal 内硬编码 `z-index`，或因层级问题关闭焦点陷阱。
- 为视觉方便修改 `TemplateSchema` 或把 UI 状态写入模板。

## 18. 验收门槛

每个 PR4 UI 切片至少完成：

1. 1600×1000、1366×768、1024×768 三种尺寸截图。
2. 无选择、单选、多选、锁定、面板折叠和画布滚动状态检查。
3. 键盘 Tab/Arrow/Escape、Tooltip、Menu 和 Focus Ring 检查。
4. 100% 与 200% 浏览器缩放检查；50%、75%、100%、150% 画布缩放检查。
5. CSS 扫描：无 `!important`、无静态 inline style、无未 token 化颜色和 magic z-index。
6. TypeScript、Vitest、ESLint、包构建、CSS Module 映射断言和 Web 生产构建通过。
7. 浏览器实际截图确认，而不是只验证 CSS 文件存在。
8. App Bar 浏览器断言覆盖 hover/focus 不展开、同一分类 click 开关、跨分类 click 切换、Header
   外部与 Escape 收起，以及 Designer 根节点不会在菜单 pointer down 时抢回焦点。
