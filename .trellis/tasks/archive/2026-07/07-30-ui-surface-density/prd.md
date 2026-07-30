# 优化工作区明度层级、工具坞与应用标题栏

## 背景

当前 v2 工作区已经形成稳定的 Canvas-first 布局，但浅灰 surface 在 Context Bar、Resource
Panel、Inspector、Status Bar、Tool Dock 和内部凹槽中高频重复，整屏视觉容易形成暗淡的灰雾。
Tool Dock 桌面按钮当前为 40×40、图标 20×20，激活态还通过多边 inset、底边、宽度外扩与
负 margin 建立连接，视觉重量过高且状态切换偏生硬。

## 设计上下文

- 目标用户是长时间在桌面端配置报表、票据和打印模板的开发者、实施人员与设计师。
- 核心诉求是高密度、精确、低疲劳和快速状态识别。
- 品牌语气保持“冷静的数字制版工作台”：深色 App Bar 是视觉锚点，灰色 Pasteboard 承托纸张，
  应用面板使用清洁冷纸白；不做纯白铺满、SaaS 卡片化或大面积浅蓝导航。

## 目标

1. 建立更清晰的明度层级：应用 Chrome 接近白色，Canvas/Pasteboard 继续保持灰色装配区，Paper
   仍是最干净的内容面。
2. 减轻 Tool Dock 图标按钮的尺寸与激活态重量，使桌面鼠标场景更接近专业设计软件密度。
3. 保留 coarse pointer、键盘 focus、Tooltip、组合 Shape 工具和响应式面板的可访问性与功能。
4. 将最终 surface 与 Dock 合同回写到 PTD UI 规范，避免旧的 40×40 桌面规则覆盖新决策。
5. 参考 ChemViz 的桌面导航，把 App Bar 改造成可渐进披露的应用菜单：悬停或键盘焦点进入具体
   菜单分类时展开，并真实下压 Context Bar 与工作区。

## 实现范围

- 调整 `Theme.module.css` 的语义 surface 映射和 Tool Dock 宽度 token。
- 调整 `Sidebar.module.css` 中 Dock、DockButton、ShapeToolGroup 与激活态。
- 调整 `StatusBar.module.css` 中缩放控件的边框与局部交互反馈。
- 重构 `AppBar.tsx` 与 `AppBar.module.css`，保留品牌和载入/保存动作，新增用户占位、
  应用菜单分类、命令预览和快捷键提示。
- 调整 `Designer.module.css` 第一行轨道，使 App Bar 展开高度参与布局而不是覆盖工作区。
- 不扩张到 Canvas 内容、Inspector 控件结构或具体菜单命令实现。
- 更新 `.trellis/spec/monorepo/ptd-ui-system.md` 对应 token、布局、Tool Dock 与图标尺寸合同。

## 设计决策

### Surface 层级

- `surface-panel` 使用接近白色的冷纸面，承载 Context Bar、Resource Panel、Inspector 与 Status Bar。
- `surface-app` 只作为应用框架底色，比 Panel 低一级，但不直接主导大面积内容区。
- `surface-sunken` 提亮，用于 hover、分段控件底座和禁用态，避免多个灰块叠加成暗淡氛围。
- App Bar 保持深色，Canvas/Pasteboard 保持明显更深的冷灰，Paper 保持独立阴影和内容背景。

### Tool Dock

- 精细指针桌面态：DockButton 约 30×30，图标 16×16，Dock 宽约 42px。
- coarse pointer：按钮与组合工具命中区域仍至少 40×40。
- 激活态不得改变按钮宽度、使用三边框或投影。
- Persistent Tool 使用轻中性底、钴蓝图标和短几何状态标记。
- 打开的 Resource Panel 入口使用面向相邻 Panel 的短状态标记，保持与 Tool 激活的语义差异。
- 状态不能只靠颜色；`aria-pressed`、标记位置和背景/图标共同表达。

### 应用标题栏与菜单

- 复用 ChemViz 的 `rgba(0,0,0,0.88)`、16px backdrop blur、柔和下阴影与
  `cubic-bezier(0.22, 1, 0.36, 1)` 展开节奏；根据 PTD 高密度工作台语境将栏高收紧为 42px、
  底部圆角收紧为 14px。
- 只有具体菜单分类在 hover/focus/click 时展开；品牌、文档动作与用户入口不触发并会
  收起菜单。鼠标离开后延迟 120ms 收起；Escape 可立即收起。
- 展开区使用文件、编辑、对象、视图、窗口、帮助分类，展示桌面应用式命令、说明和快捷键；
  分类切换可用，但命令动作本轮明确为待接入，不能执行假功能。
- Designer 顶部轨道使用内容高度，展开必须真实压缩工作区可用高度，不能以 absolute/fixed overlay
  覆盖 Toolbar、Canvas 或 Panel。
- 右侧增加用户账户占位，保留未来身份入口语义，但本轮不接入认证。
- 触控与 reduced-motion 场景仍需有可用的键盘/点击披露入口，并减少布局动画。
- 窄容器隐藏六个桌面菜单标签，改用汉堡按钮披露；展开面板保留可横向浏览的菜单分类，不删除
  载入、保存和账户等关键入口。
- App Bar 不重复展示当前模板标题、页码、纸张方向和尺寸；这些信息由 Context Bar、Inspector
  与 Status Bar 承担。展开菜单直接呈现命令，不保留“应用命令/界面预览”等解释行。
- Tool Dock 通过分区位置、`role="group"` 和 `aria-label` 保留工具/资源语义，不常驻显示“工具”
  “面板”文字。

## 非目标

- 不调整 Canvas、Paper、标尺、参考线或组件选中态。
- 不改变工具与面板的行为、顺序、快捷键和 Tooltip。
- 不新增依赖，不修改 lockfile。
- 不实现应用菜单命令、用户登录、Inspector 字段或组件目录 Tile。

## 验收标准

- Resource Panel、Inspector、Context Bar 明显比当前更明亮，且与 Canvas/Paper 层级清楚。
- Desktop DockButton 约为当前面积/视觉尺寸的 75%，图标统一 16px。
- Tool/Panel 激活态无厚重 inset 边框、底边阴影、尺寸外扩或负 margin。
- Hover、active、focus-visible、pressed 和 coarse pointer 状态仍完整。
- Shape 主按钮、disclosure 与 DockButton 光学中心一致，菜单键盘行为不变。
- Status Bar 缩放器不再显示表单式整组外框和竖向分隔线；按钮、百分比选择器在 hover/focus
  时仍有明确反馈。
- App Bar 折叠高度为 42px，展开外观与 ChemViz 的暗色导航一致；展开后 Context Bar 和工作区
  整体下移，无遮挡、无页面级滚动。
- 文件(F)、编辑(E)、对象(O)、视图(V)、窗口(W)、帮助(H)靠左排列，可在 hover/focus/click
  时切换，并展示相应命令与快捷键；账户等非菜单区域不得误触发。
- 窄容器显示汉堡菜单入口，点击可展开/收起；菜单分类和命令在展开区仍完整可达。
- 鼠标离开延迟收起，焦点离开收起，Escape 收起；reduced-motion 下取消位移和轨道动画。
- 品牌、标题、纸张信息、载入/保存仍存在，右侧用户占位可辨识且不伪装成已接入账户。
- 无 `!important`、未 token 化颜色、静态 JSX 样式或新增 magic z-index。
- React Designer 测试、类型检查、lint、package build 与 Web build 在依赖可用时通过。
- 至少完成实际浏览器截图检查；若本机依赖树未恢复，必须明确记录该环境限制而不能伪称通过。
