# Vercel / Webhound 落地页参考转译

## 决策背景

用户明确否决了首版 “Digital Proof Sheet” 落地页，并给出两份新参考：

- 本地静态页面：`D:\Code\Study\print-template-designer\vercel-demo.html`
- Webhound：`https://www.webhound.ai/?ref=landingfolio`

本文件记录可迁移的宏观设计方法。参考只约束视觉方向，不构成复制第三方源码、品牌、图形、文案或
产品结构的许可。真实 PTD Designer 截图仍是唯一产品界面证据。

## Vercel 参考要点

本地 HTML 对应 Vercel 的深色 “Agentic Infrastructure” 首页。离线直接截图时外部 CSS 与媒体资源
无法完整加载，因此判断同时基于 HTML 中的真实结构、设计 token 与 Hero DOM，而不以失真的无样式
截图为准。

- Hero 接近一个完整 viewport，高度和最大内容宽度都受到控制；导航与首屏之间有充足呼吸空间。
- 桌面 Hero 左侧是短、强、超大标题与 CTA，右侧是三个递进能力句，中间由受控光感视觉聚焦。
- 主按钮与次按钮都是简洁的高对比 pill，层级依赖明度、边界与文案，不依赖复杂图标。
- 标题使用无衬线、正常字重和紧凑 tracking；信息少而确定，不用大段营销副标题填满首屏。
- 背景光感是焦点，不是整页渐变。内容仍建立在近黑中性 surface 上。

## Webhound 参考要点

实际检查了 1440×1000 与 390×844 的官网截图：

- 深色近黑底承载整页，暖色只负责强调词、按钮和状态，视觉比例克制。
- 桌面首屏用左右两列建立明确论点：左侧一句记忆点，右侧解释“为什么”、CTA 和可信细节。
- 产品证据在 Hero 后立即出现，使用较大的真实对比界面，而不是若干等尺寸卖点卡片。
- 移动端完全重排为单列，隐藏次要导航，但保留品牌、主张、说明、双 CTA 和产品证据。
- 正文使用舒展行高，标题依靠字号、字重和强调词建立节奏，没有多余装饰。

## PTD 的实现转译

### Hero

- 近黑全视口舞台，顶部为低噪音导航。
- 左侧主张聚焦“复杂业务打印模板可以被可靠设计和复用”；右侧用三条已实现事实解释产品。
- 中央使用轻量的页面栈/页面边界视觉和冷青蓝光感，表达模板与画布，不复制 Vercel 三角形。
- 认证状态和 CTA 仍由 Server 权威状态驱动：GitHub 登录、进入工作台、进入本地工作台、拒绝与
  Server 错误都在同一 Hero 中呈现。

### Product proof

- Hero 后立即展示真实 `designer-proof-sheet.png`，采用暗色浏览器/产品框架承托。
- 桌面完整展示 App Bar、Pages、Canvas 与 Inspector；移动端裁切到画布主体，但保留“真实界面”说明。
- 不在 JSX 中伪造工具栏、Inspector 或模板内容；允许增加与截图外框有关的窗口控制点和静态说明。

### Long page

- 用少量大 section 说明精密创作、版本可靠性、自托管和明确产品边界。
- 能力区优先使用编号横向带、事实列表和版式变化，不使用同尺寸三列卡片宫格。
- 不使用虚构客户 Logo、使用数据、性能指标或尚未完成的 PDF/Word/打印预览承诺。

### Color and type

- 主背景：近黑；主文字：冷白；次文字：中性灰。
- 强调：延续 PTD 的青蓝/钴蓝关系，避免直接复制 Webhound 的珊瑚粉，也不使用旧版大面积校样红。
- 标题与正文统一使用现代 UI sans；不再用中文衬线体承担营销主标题。

### Responsive and motion

- `<= 900px` 将 Hero、能力带和部署信息改为单列。
- `<= 640px` 隐藏次要导航、缩小标题并让 CTA 获得触控尺寸；真实截图使用有意图的中心裁切。
- 动效仅使用 `transform` 与 `opacity`；reduced motion 下关闭页面栈位移和按钮变换。

## 明确不复制

- Vercel 三角形、Agentic Infrastructure 文案、客户 Logo、部署产品信息与动画实现。
- Webhound 猎犬品牌、珊瑚色品牌资产、Agents are lazy 文案、研究对比面板与价格承诺。
- 两站的 DOM、CSS class、字体文件、图像、SVG、导航 IA 或 section 顺序。
