# 落地页 Hero 品牌动效重构

## 状态

实现、自动化检查与 1440px / 390px 真实浏览器验收已经完成并通过用户确认；代码进入提交阶段，
任务暂不归档。

## 背景

当前落地页 Hero 在底部放置 ASCII 噪点场，并以带负形字母 P 的旧文档图形作为中央主体。落地页
Header、Footer、文件工作台、设计器 App Bar 和浏览器 favicon 也仍复用旧 P 图形。系统已经把
Cherry Bomb One 字体下的 `Foliq` 统一为正式品牌字标，因此继续同时展示旧 P 图形会形成两套品牌识别。

## 目标

1. 将 Hero 的 ASCII 噪点与视差构图从底部迁移到顶部。
2. 使用 Cherry Bomb One `Foliq` 字形轮廓中的字符画替换中央 P 图形，使字标约占宽屏视口三分之一，
   并成为 Hero 的语义主标题与视觉焦点。
3. 保留现有字符噪点、鼠标视差与缓慢摆动/旋转的记忆点，但降低它们相对于字标的视觉权重。
4. 移除当前产品界面中仍在使用的旧 P 品牌图形；Header、Footer、文件工作台与设计器 App Bar 只保留
   `Foliq` 字标和必要的产品说明，不再并列显示图标。
5. 保持现有暖灰、纸白、暖石墨和克制工业制图气质，不引入新的渐变、荧光色或装饰性标签。

## 设计合同

- Hero 顶部字符场从上向下显现，并向内容区逐渐淡出；字符场不能遮挡 Header 或正文交互。
- `Foliq` 使用共享 `--foliq-font-brand` 在离屏画布中产生精确字形覆盖率，再把覆盖到字形的二维网格
  单元转换为独立等宽字符；最终可见主体必须是真实 `<pre>` 字符矩阵，不使用背景裁切、浅色字形、
  描边或实心文字兜底。
- 宽屏字标视觉宽度约为视口的三分之一；窄屏以可读、不裁切、不产生横向溢出为优先。
- `Foliq` 是 Hero 唯一 `h1`；“不是设计一张图，而是定义一种文档”调整为支持性主张，不与品牌字标
  争夺一级标题层级。
- Pointer 视差只作用于顶部品牌主体；离开 Hero 时归零。页面隐藏、离开视口或系统要求减少动态效果时
  停止定时动画。
- `prefers-reduced-motion: reduce` 下不执行摆动、旋转和 Pointer 位移，仍完整显示静态字标与字符背景。
- 删除旧 `ptd-mark.svg` 与设计器 `legacy-logo.png` 的产品引用；不以单字母块、Emoji 或临时符号替代。
- 浏览器暂不声明旧 P favicon；等待未来正式、适合小尺寸的品牌资产。

## 不在本任务范围

- 重新设计落地页 Hero 之外的文案、CTA、导航或后续内容 Section。
- 创建新的独立图形 Logo、favicon 字母缩写或品牌图标系统。
- 改变 Cherry Bomb One 字体来源、全局配色或工作台信息架构。
- 修改字符场以外的产品截图、能力卡片、价格或 FAQ 动效。

## Definition of Done

1. ✅ Hero 顶部显示大型 Cherry Bomb One `Foliq` 字符画，旧 ASCII P 主体完全移除。
2. ✅ 字符噪点从顶部开始并向下淡出；视差、缓慢旋转、可见性暂停和 reduced-motion 行为正确。
3. ✅ Hero 语义结构只有一个 `h1`，可访问名称仍由 `aria-labelledby` 正确关联。
4. ✅ Landing Header/Footer、Workspace Home、Designer App Bar 和 favicon 均不再引用旧 P 图形。
5. ✅ 1440px/1280px 宽屏与 390px 窄屏没有裁切、文字重叠或页面级横向溢出。
6. ✅ Web、React Designer 的相关测试、typecheck、ESLint、Prettier 和 build 通过。
7. ✅ 使用真实浏览器复验落地页宽屏与 390px 动效静态构图，控制台无新增错误。
8. ✅ PTD UI System 品牌资产规范更新为当前 `Foliq` 字标合同。
