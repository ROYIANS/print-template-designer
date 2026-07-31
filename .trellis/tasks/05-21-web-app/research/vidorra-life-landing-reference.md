# Vidorra Life 落地页参考分析

> 历史记录：基于本分析形成的 “Digital Proof Sheet” 首版视觉已于 2026-07-31 被用户明确否决。
> 当前落地页方向改为 `vercel-demo.html` 与 Webhound，见
> [`vercel-webhound-landing-reference.md`](vercel-webhound-landing-reference.md)。本文不得继续作为当前
> 落地页的视觉验收依据。

## 来源与用途

- 用户提供的本地参考仓库：`D:\Code\Study\vidorra-life`
- 核心入口：`apps/web/src/routes/index.tsx::LandingPage`
- 移动导航：`apps/web/src/components/LandingNavDrawer.tsx::LandingNavDrawer`
- 本文只记录可迁移的设计方法；不复制源码、品牌、文案或具体视觉资产。

## 参考页面结构

参考页由 sticky Nav、Announce、Hero、Marquee、Feature Tabs、Demo、Spec Panel、Rooms、Principles、
Extras、Author Letter、Final CTA 与 Footer 构成。多数 section 经过统一 `SectionFrame` 和不同 rail
预设组织，hairline、窄轨、节点、网格和留白共同形成连续的页面骨架。

移动端将桌面导航收进底部 Drawer，处理 Escape、焦点、Body scroll lock 和安全区；主要 CTA 在
桌面与移动端都保留。Hero 使用流式尺寸和层叠背景，长页通过 section 间切割和不同密度避免重复节奏。

## 值得吸收的方法

### 1. 结构即装饰

装饰不是附加插画，而是由 section 边界、hairline、网格、轨道和精确对齐产生。这与 PTD 已确认的
“纸张、标尺、套准与校样”语汇兼容。

### 2. 从情绪主张进入真实产品

Hero 先建立品牌主张，随后快速进入 Feature 与 Demo，不让宣传叙事脱离产品本身。PTD 应更进一步，
让真实 Designer 画面成为首屏或紧邻首屏的视觉核心。

### 3. 长页节奏有密有疏

不同 section 使用不同空间密度和版式，而不是重复同尺寸 Card Grid。PTD 可用“创作工作流、界面局部、
版本与部署事实、最终 CTA”形成节奏差异。

### 4. 响应式是重组

桌面横向导航在移动端变成独立 Drawer，内容顺序和 CTA 保持完整。PTD 也应为移动端建立纵向校样阅读流，
而不是只缩小桌面排版或隐藏关键事实。

### 5. 动效服务层级

参考页把动效用于抽屉、Reveal、首屏背景和状态切换，并提供 reduced-motion 路径。PTD 应集中设计一次
首屏“装版”进入和少量滚动 reveal，不在每个控件上添加装饰动画。

## 不迁移的内容

- 暖棕色板、滴茶品牌和“入住/房间”隐喻；
- Hero 品牌图形、具体中文文案和导航信息架构；
- 条码 rail、无业务含义的刻度或节点；
- Tailwind utility 实现；PTD 继续使用 CSS Modules 与公共 token；
- 参考页的完整 section 数量与一比一排列；
- 主题切换和多色板系统，除非 PTD 后续单独确认暗色或多主题需求。

## PTD 转译：Digital Proof Sheet

### 视觉骨架

- 冷纸白背景和带蓝石墨文本；
- 贯穿页面的细线与内容列边界；
- Hero 左侧价值主张，右侧真实 Designer 工作台或印前样张画面；
- 钴蓝只负责主要 CTA、焦点和选中；
- 朱红只标注出血、校样或仍在规划中的明确边界；
- 阴影只属于纸张预览和真实浮层。

### 建议叙事顺序

1. Hero：一句话说明专业 Web 打印模板设计器，主 CTA 登录/进入工作台。
2. Product Proof：真实 Designer 画面，展示画布、组件、Inspector 和多页面。
3. Workflow：创建、精密排版、保存、版本恢复、重新打开。
4. Capability Detail：文本、图形、图片、编码、表格与页面能力。
5. Reliability：PostgreSQL、owner 隔离、乐观并发、不可变版本。
6. Self-hosting：GitHub Actions、GHCR、Compose 与同源认证。
7. Boundary：明确数据源、打印/PDF/Word/自动分页仍在规划中。
8. Final CTA：GitHub 登录或进入工作台。

### 差异化记忆点

页面本身像一张经过校准的数字印前样张：结构线和页面边界贯穿，但所有标识都有真实含义。访客应该记住
“这是一台可以部署、保存和版本化的专业制版工作台”，而不是“又一个拖拽编辑器 SaaS”。
