# 优化移动端菜单交互与小屏工具栏密度

## 背景

真机触屏环境会在 Tap 前后合成 mouse/hover 事件。当前 App Bar 把 mouseleave、品牌/动作区
mouseenter 和 focus leave 都作为自动关闭信号，导致移动端点击汉堡菜单后可能立即收起。

当前 coarse pointer 合同还把 Header、Context Bar 与 Tool Dock 控件统一放大到 40px。在约
390px 的手机视口中，42px Header 和 40px 控件几乎没有上下留白，Context Bar 按钮也填满
40px 行高，视觉明显偏大、贴边。

## 设计上下文

- 用户是在手机或小尺寸触屏设备上临时查看、微调报表的开发者与设计师。
- PTD 仍是桌面优先的精密工作台；移动端目标是稳定可用和信息可达，不是假装完整移动设计器。
- 视觉保持冷静、高密度、低装饰；小屏优先清楚的边界、可靠触摸和紧凑 Chrome。

## 目标

1. 触屏端打开菜单后不再被浏览器合成 Hover/Mouse 事件或焦点变化误关。
2. 触屏端只通过汉堡/关闭按钮、命令选择或 Escape 显式关闭菜单；分类点击只切换分类。
3. 保留桌面精细指针的 Hover 展开、离开延迟关闭和品牌/动作区关闭行为。
4. 对不超过 480px 的 Designer 容器收紧 Header、Context Bar 与 Tool Dock 的视觉尺寸和边距。
5. 保留可辨识图标、Focus Ring、Tooltip 和触摸可用性，不删除关键入口。

## 实现范围

- `AppBar.tsx`：区分真实鼠标 Pointer 与触摸 Pointer，调整菜单关闭路径。
- `AppBar.module.css`：增加小屏 Header 控件、Logo、分类条密度合同。
- `Toolbar.module.css`：小屏 Context Bar 高度、按钮与图标密度。
- `Sidebar.module.css`：小屏 coarse-pointer Dock 按钮与组合工具密度。
- `Theme.module.css`：增加小屏 Chrome 高度 token，或提供等价容器级覆盖。
- `.trellis/spec/monorepo/ptd-ui-system.md`：同步移动端显式关闭和小屏密度规则。

## 交互决策

- 真实鼠标 `pointerType === "mouse"` 才能触发 Hover 开启、离开延迟关闭和非菜单区域关闭。
- Touch/Pen Pointer 不触发自动开合；点击汉堡按钮切换开合。
- 移动端分类点击保持菜单打开，只更换命令集合。
- 点击命令项可以收起菜单，但本阶段仍不执行尚未实现的命令动作。
- Escape 在所有输入模式下收起。
- 小屏视觉控件目标约 32px，图标 15–16px；不继续使用几乎填满 42px 行高的 40px 外观。

## 非目标

- 不实现菜单命令业务逻辑。
- 不重新设计 Canvas、Inspector 或移动端整体工作流。
- 不新增依赖，不修改 lockfile。
- 不取消桌面/较大触屏设备原有的 coarse-pointer 40px 合同。

## 验收标准

- iOS/Android 触摸点击汉堡后菜单稳定保持打开，不因合成 mouseleave、mouseenter 或 blur 收起。
- 触摸点击分类只切换内容；汉堡/关闭、命令选择和 Escape 可关闭。
- 桌面鼠标仍能 Hover 展开、切换分类，并在离开 120ms 后关闭。
- `<= 480px` 容器中 Header 控件约 32px，与上下边缘有明确留白；Logo/字标同步收紧。
- `<= 480px` 容器中 Context Bar 不再使用 40×40 的粗大按钮，图标保持约 15px。
- `<= 480px` coarse pointer 下 Tool Dock 按钮与 Shape group 收紧且不挤压主图标。
- 390×844 与 640×900 浏览器尺寸检查无裁切、无双行 Header、无不可达入口。
- TypeScript、ESLint、Vitest、React Designer build、Web build、Prettier 与 `git diff --check` 通过。
