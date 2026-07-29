# 技术设计与交付记录

## 设计方向

- 以 Adobe 类专业设计工具的密度、精度与克制为质量基准，不复制 Adobe 品牌、资产或具体界面。
- 保留 PTD 的纸张、标尺、画布与校样语义；Document Bar 继续作为深色视觉锚点。
- Tool Dock 改为与面板相连的冷纸灰/石墨中性色，钴蓝只表达选中、焦点和活动命令。
- Inspector 不再是原始输入框列表：根据数据类型使用单位步进器、segmented control、紧凑
  Select、色板加 HEX 值和可折叠高级区域。

## 实现

- Page、Single、Multi Inspector 统一为 `InspectorShell -> PanelHeader -> PanelBody ->
PanelFooter`，标题和底栏固定，Body 是唯一主滚动容器。
- 三种 Inspector 状态都提供 `data-ptd-region="inspector"`；Page 状态继续提供更具体的
  `page-inspector` hook。
- 新增内部 `NumberInput`、`SegmentedInput`、`SelectInput`、`ColorInput`、
  `FooterSetting` 和 `InspectorSection` 原语。
- X/Y/W/H、旋转、透明度、字号、边框宽和圆角使用带单位步进器；透明度在 UI 中显示百分比并
  映射回 Schema 的 `0..1`。
- 数值与颜色输入保留编辑草稿；完成一次编辑才提交一次 gesture/history，步进动作一键一历史。
- 单选锁定态禁用内容、几何、排版和外观控件，并保留明确的解锁入口；Multi 状态显示混合值。
- 修复共享 Panel 子组件的 `className` 合并逻辑和显式 Grid Area，避免调用方 class 覆盖内部
  header/body/footer 布局。
- compact overlay 使用新的 `--ptd-layer-scrim`，稳定位于 Selection 和 Sticky Panel 之间；
  Scrim 覆盖 Quick Bar 与画布编辑 Chrome，但不覆盖当前浮动面板。

## 浏览器验证

- `1600x1000` wide：Resource、Canvas、Inspector 同时可用；Page 与 Single Inspector 的固定
  Header/Body/Footer、折叠分组和中性 Tool Dock 通过。
- `1366x768` standard：Resource 默认收起、Inspector 保持可见；步进器、Select、segmented
  alignment 和外观分组在 304px 面板内可读可操作。
- `1024x768` compact：两个 overlay 默认关闭、Resource/Inspector 互斥；Quick Bar 和选框位于
  Scrim 下方。
- `800x500` 200% 等效 CSS 工作区：Inspector Body 可滚动，Header 与锁定 Footer 保持可达。
- Single Appearance：文字、背景和描边颜色都显示色板与可编辑 HEX；边框宽、圆角和边框样式
  控件通过。
- Locked：所有应保护的输入和画布动作禁用，Footer 明确显示“组件已锁定 / 仅允许解锁”。
- Multi：混合透明度、字号和颜色显示 placeholder，录入入口可用，Footer 显示共同锁定状态。
- X 步进从 `280` 到 `281` 后一次 Undo 恢复为 `280`，确认步进动作只产生一个历史节点。
- 最终页面无 React 运行时告警；开发期间仅出现 dist 被 watch/build 原子替换时的 Vite 瞬时
  reload 日志，随后 HMR 正常恢复。

## 质量验证

- `@ptd/react-designer typecheck`：通过。
- `@ptd/react-designer test`：8 个测试文件、36 个测试通过。
- `lint:frontend --max-warnings=0`：通过；eslint-plugin-react 仅输出仓库既有的 React 自动检测
  提示。
- `@ptd/react-designer build`：ESM、CJS、DTS 和 CSS 通过。
- `web typecheck`：通过。
- `web build`：Vite 生产构建通过；保留仓库既有的 `bwip-js` 大 chunk 提示。
- 静态扫描：无 `!important`、`as any`、`@ts-ignore`、magic-number `z-index`、非 token Chrome
  颜色；动态 inline style 仅写 Schema 驱动的 CSS Custom Property。
- `git diff --check`：通过。

## 规范沉淀

- Tool Dock 使用中性 structural surface，深色视觉锚点由 Document Bar 承担。
- Inspector 控件必须按数据类型选择录入形态，并共享固定 Header / 单滚动 Body / 可选 Footer。
- compact Scrim 必须使用位于 Selection 与 Sticky Panel 之间的语义 layer token。
