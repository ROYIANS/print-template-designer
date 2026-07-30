# Header 菜单改为点击切换

## Goal

将桌面端 Header 应用菜单从悬停/聚焦自动展开改为明确的点击切换，减少鼠标经过菜单栏时的意外展开，并保持现有视觉、移动端入口和键盘可访问性。

## Requirements

- 鼠标悬停菜单触发器、品牌区或 Header 操作区时，不得打开、切换或关闭应用菜单。
- 点击关闭状态下的菜单触发器时，打开该菜单。
- 点击已经打开的同一菜单触发器时，关闭菜单。
- 菜单打开时点击另一个菜单触发器，保持面板打开并切换到对应分类。
- 单纯通过 Tab 将焦点移入菜单触发器时不得自动展开。
- 菜单打开时，点击 Header 外部、焦点移出 Header 或按 Escape 仍可关闭。
- ArrowLeft、ArrowRight、Home、End 继续在菜单触发器间移动焦点；关闭状态下只移动焦点，打开状态下同步切换分类。
- 移动端菜单按钮继续使用既有点击开关行为，面板内分类点击继续切换分类。

## Acceptance Criteria

- [x] 悬停任意 Header 菜单不会展开菜单面板。
- [x] 点击“文件”打开，再次点击“文件”关闭。
- [x] “文件”打开时点击“编辑”，面板保持打开且活动分类变为“编辑”。
- [x] Tab 聚焦菜单触发器不自动展开。
- [x] 点击 Header 外部、焦点移出 Header 和 Escape 均能关闭已打开菜单。
- [x] 键盘方向导航在关闭与打开状态下分别满足只移动焦点和同步切换分类的合同。
- [x] 移动端菜单开关与分类选择行为不回归。
- [x] React Designer 相关测试、TypeScript、ESLint、Prettier 和 `git diff --check` 通过。

## Definition of Done

- AppBar 的展开状态只由显式点击、键盘激活、外部关闭和 Escape 控制，不再由 hover/focus 隐式改变。
- 新增回归测试覆盖点击切换、悬停不展开、焦点与键盘导航。
- 不改变 Header 的视觉设计、菜单内容或尚未接入的命令能力。

## Technical Approach

- 在 `AppBar.tsx` 中用显式 `toggleMenu(menuId)` 取代触发器的无条件 `openMenu`。
- 删除鼠标 Pointer Enter/Leave、延迟关闭计时器及聚焦自动打开逻辑。
- 使用 Header ref 与 document pointer-down 监听关闭外部点击；Header 内分类和命令仍由既有处理器管理。
- 焦点离开 Header 时立即关闭，避免延迟计时器与点击切换产生竞态。
- 方向键导航根据当前展开状态决定是否切换活动分类。

## Decision (ADR-lite)

**Context**: 当前菜单同时响应 hover、focus 和 click，导致鼠标经过就展开，并且同一触发器的再次点击无法关闭。

**Decision**: 桌面菜单采用 click-to-toggle 状态机；hover 只保留视觉反馈，不能改变展开状态。保留外部点击、焦点离开和 Escape 关闭作为标准退出路径。

**Consequences**: 菜单行为更可预测；键盘用户需要 Enter/Space 或访问键显式打开，而单纯 Tab 浏览不会扰动画布。无需改变 Schema、EditorStore 或公共 Designer API。

## Out of Scope

- 修改菜单视觉样式、动画、尺寸或命令内容。
- 接通文件、编辑、对象、视图、窗口和帮助菜单中的占位命令。
- 重构 AppBar 为新的第三方 Menu 组件。

## Technical Notes

- 主要文件：`packages/react-designer/src/components/AppBar/AppBar.tsx`。
- 当前 hover 展开来自菜单触发器的 `onPointerEnter`，聚焦展开来自 `onFocus`；Header 还通过 Pointer Leave 延迟关闭。
- Designer 根节点会在非交互区域的 pointer down 捕获阶段夺回焦点；App Bar 必须声明
  `data-ptd-editor-interactive`，否则第二次点击会先因 blur 关闭，再由 click 重新打开。
- 现有 `aria-expanded`、`aria-controls`、Escape 和移动端开关语义应继续保留。
