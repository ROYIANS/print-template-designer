# apps/web 完整设计器 App

## 状态

本任务处于实现阶段，当前 Trellis task 与分支已经启动。本轮认证与公开落地页批次正在实现和独立检查；
更广的模板 CRUD、版本历史、恢复与 409 冲突流程仍在同一任务后续范围内。

## 背景

PTD 已经完成专业 React Designer、Designer Host 命令合同、PostgreSQL 多用户模板与不可变版本 API、
GitHub OAuth/Allowlist，以及完整自托管部署栈。当前 `apps/web` 仍只有两个相互割裂的状态：

- 未登录时展示单用途 GitHub 登录卡片，访客无法从页面理解产品能力；
- 登录后只在 React 内存中持有空白模板，刷新即丢失内容，Host 命令尚未接入 Server。

本地开发还存在额外摩擦：Server 启动时无条件要求 GitHub OAuth 配置，Web 又必须取得 Better Auth
Session 才会请求 `/api/account/me`，导致普通 UI/模板工作流调试依赖真实 GitHub OAuth。

## 本轮新增目标

### 1. 安全的本地开发认证路径

本地开发应能在不配置或访问 GitHub OAuth 的情况下进入完整 Designer 和模板 API，但不得降低生产环境
的认证与 owner 隔离保证。

已确认采用显式 Dev Auth Bypass：

- 由 Server 环境变量显式开启，默认关闭；
- 只允许非 production 且 Web/Auth origin 均为 loopback 地址时开启，条件不满足时启动失败；
- Server 为本地开发准备一个稳定、可重复使用的开发用户，并让所有受保护 API 继续通过同一
  `request.user.id` owner 边界运行；
- Web 不使用可伪造的请求头、浏览器 Token 或纯前端 `VITE_*` 开关绕过权限；
- Web 直接以 `/api/account/me` 的服务端结果作为是否进入应用的权威判断；
- 开启 bypass 后不要求 GitHub Client ID/Secret，也不显示 OAuth 登录步骤；
- 生产部署、CI 认证验证和默认 `.env.example` 继续 fail closed；
- 页面应明确标识“本地开发身份”，避免开发者误以为正在验证真实登录流程。

不建议为了本地调试启用 Better Auth Anonymous：当前插件会创建带临时邮箱的真实用户和 Session，要求
新增 `User.isAnonymous` 数据库字段，并会引入匿名账号合并、清理和跨浏览器身份丢失问题。它更适合未来
独立设计的“游客试用”，不是开发认证开关。

Passkey、手机 OTP、钱包签名等生产 Passwordless 登录不属于本地调试问题的必要解法。若未来需要
GitHub 之外的正式登录方式，应作为独立认证产品决策评估；其中 Passkey 仍需要安全的首次账户注册或
绑定路径，不能自动解决本地首次登录。

### 2. 登录页与产品落地页合并

未登录访问根页面时，应看到完整 PTD 产品落地页，而不是只有登录卡片。GitHub 登录是落地页的主 CTA，
认证状态反馈是页面的一部分，而不是替代整页内容。

落地页需要：

- 用一句明确价值主张解释 PTD 是面向报表开发者与设计师的专业 Web 打印模板设计器；
- 展示真实产品工作台视觉或由真实界面构成的产品预览；
- 说明可视化精密排版、组件创作、多页面、版本历史、自托管与数据安全等当前真实能力；
- 清晰区分已实现能力和仍在规划中的数据源、打印/PDF/Word/自动分页能力；
- 提供首屏和页尾登录 CTA，不使用单独登录路由制造重复页面；
- 保留未登录、登录中、未获准、Server 不可用和登录失败的可操作状态；
- 未获准用户可以退出并切换 GitHub 账户；Server 不可用时仍能阅读产品信息并重试；
- 宽屏与移动端均可阅读，延续现有 PTD 冷静、精密、高密度数字印前工作台视觉；
- 避免通用 SaaS 渐变 Hero、虚构客户 Logo、虚构使用数据和未实现功能承诺。

成功登录且通过 Allowlist 后进入全屏 Designer App；本任务暂不要求引入完整营销站点路由系统。

## 原有主里程碑范围

本任务仍以完成真实 Web 模板生命周期为主线：

1. 类型安全的 Web API Client：模板 CRUD、版本列表/详情和恢复。
2. Web 所有的 Document Controller：文档 ID、标题、Server version、saved/current value，以及
   `clean | dirty | saving | loading | error | conflict` 状态。
3. 接入 Designer Host 的 New、Open、Save、Save As、Template Browser、Version History 和 Restore。
4. 模板浏览器：空、加载、失败状态；打开、重命名、复制和确认删除。
5. 版本历史查看、恢复和显式 HTTP 409 Conflict 处理。
6. 刷新后重新打开持久化内容，保持 signed-out、denied 和 expired session fail closed。

## 已确认架构边界

- HTTP、认证、Cookie、Server Record 和应用通知属于 `apps/web`，不得进入 `@ptd/react-designer`。
- Designer 通过 `host?: DesignerHost` 表达应用命令和文档状态，不恢复旧式顶层 `onSave/onLoad` 方案。
- 浏览器只使用同源 `/api` 与 HttpOnly Cookie；Dev Bypass 也不能依赖浏览器伪造身份头。
- `expectedVersion` 是产品状态；发生 409 时不能静默重试或覆盖更新后的 Server 文档。
- Datasource、预览、打印、PDF、Word、自动分页和 Export 不进入本任务。
- 数据库测试只能使用明确隔离的测试库，不得使用共享或生产数据库。

## 落地页设计方向

> 2026-07-31 最新视觉基线：用户已经自行重写浅色窄列首页，下面旧的 Vercel/Webhound 深色方向
> 只保留为历史决策，不再作为当前验收依据。当前页面继续使用白色背景、约 720px 的中心内容列、
> 中文问题导向文案和克制直接的产品语气；后续打磨必须在这版代码上演进，不回退到深色 SaaS
> 舞台或 Digital Proof Sheet 方案。

最初根据 `D:\Code\Study\vidorra-life` 形成的“数字校样纸 / Digital Proof Sheet”实现已被用户明确
否决。旧方向的纸白底、衬线大标题、校样红、密集 hairline/网格和印前样张式 section 构图不再作为
验收目标；Vidorra 分析仅保留为历史研究记录，不能据此继续微调旧视觉。

当前参考改为用户提供的本地 `vercel-demo.html` 与 Webhound 官网。详细转译保存在
[`research/vercel-webhound-landing-reference.md`](research/vercel-webhound-landing-reference.md)。新方向：

- 使用近黑舞台、冷白正文和少量青蓝交互/光感，建立现代、可信、面向开发与实施团队的产品气质；
- Hero 采用全视口级留白和不对称信息结构：一句强价值主张、简洁说明、明确 CTA 与能力证据；
- 抽取 Vercel 的克制导航、内容宽度、标题尺度和中央视觉焦点，抽取 Webhound 的左右叙事、CTA
  层级与产品证据密度，但不复制品牌、文案、图形或业务题材；
- PTD 的视觉锚点是抽象页面栈与真实 Designer 工作台，不伪造另一套编辑器界面；
- 不使用旧版的校样纸边框、套准标记、工程编号、衬线叙事和大面积浅色纸张网格；
- 下方内容通过少量大段落、横向能力带和真实系统事实形成节奏，不回到通用 SaaS 卡片宫格；
- 移动端将左右 Hero 重排为单列，保留价值主张、认证 CTA、真实产品裁切和关键产品边界；
- 动效只用于首屏页面栈、细微状态和交互反馈，并在 `prefers-reduced-motion` 下移除空间位移。

上述 Vercel/Webhound 深色实现随后同样被用户否决；其研究文件是决策过程记录，而不是继续开发的
视觉规范。

### 2026-07-31 首页打磨批次

用户确认在当前浅色首页上优先完成以下三项增强：

1. Hero 保留现有中心标题、说明和认证 CTA，在下半部加入有明确视觉表现力的 ASCII 字符动画。
   字符通过 Canvas 投影成持续流动的纸张地形，并对鼠标位置产生磁场形变与扩散波，不只是低帧率
   替换文本。字符场应转译为纸张、排版、打印进纸或页面堆叠的产品语义，不使用普通粒子、渐变
   光斑或装饰性发光；动画不得遮挡文案和按钮，页面不可见时应暂停，并为
   `prefers-reduced-motion` 提供稳定静态帧。
2. 产品证明区从单张截图升级为多个真实模板案例的横向轨道。至少包含冷链出库标签、采购/送货单、
   商品价签和检验报告四类模板；每张图必须由真实 PTD Designer、真实 `TemplateSchema` 和确定性 DEV
   capture route 生成，不伪造编辑器 JSX。桌面支持 pointer drag 与滚轮/按钮横移，移动端保留原生
   触摸横滑；同时提供可见按钮或键盘路径、scroll snap、focus-visible 和清楚的当前案例说明。
3. 功能区移除“线性图标 + 彩色圆角背景 + 同尺寸卡片”的通用 SaaS 组合，改用直接着色、无背景底板
   的实心面型 SVG 符号。图形可以借鉴几何花、印章、套准和纸张切口，但必须是 PTD 自有语义；内容
   块整体扁平化，用留白和排版建立层级，不依赖 hover 才能理解。

本批次不新增第三方动画或轮播依赖，不修改 Designer 公共 API，不把真实 capture route 暴露到生产。

### 2026-07-31 首页第二轮打磨

用户根据实际长截图再次确认三个问题：Hero 标题视觉重心仍然偏上；Canvas 字符地形缺少可辨识主体，
看起来仍像通用粒子波浪；FAQ 之后的居中 CTA 与窄列 Footer 彼此割裂，页面尾部没有形成完整收束。

本轮按以下决策继续当前浅色首页，不恢复任何已否决的旧视觉方向：

1. Hero 正文组在桌面视口整体下移约 70–90px。布局应修正不对称 padding 对 flex 居中的反向影响，
   不能只在标题上叠加临时 margin；移动端单独控制，不照搬桌面的大顶部留白。
2. 删除 Canvas 透视地形和磁场形变，改为双层 DOM ASCII。背景层使用低密度标点字符，密度由上到下
   增长并在首次加载时从底部显现；前景层使用高密度字符绘制 PTD 自有的错位纸张、排版线与套准标记，
   字符密度持续轻微变化，整体约 40–48 秒缓慢旋转。鼠标最多只提供轻微视差；不可见、页面后台时
   暂停，`prefers-reduced-motion` 下保持完整静态帧。实现研究见
   [`research/supply-ascii-reference.md`](research/supply-ascii-reference.md)。
3. Final CTA 与 Footer 合并为单一浅色 Closing Field。桌面采用更宽的非对称网格，把状态标识、两行
   收束标题、认证动作、品牌说明、产品导航和联系信息组织在同一视觉表面内；不使用圆角大卡片，不再
   用巨大空白把 CTA 单独悬在页面中间。移动端改为单列，但 CTA 与 Footer 必须继续共享同一背景和
   分隔体系。
4. 首版双层 ASCII 的底部噪声在超宽视口未覆盖左右边缘，固定字符列数应改为根据实际容器宽度计算，
   并在 resize 后重新生成，不能只针对 1600px 截图调节固定缩放。首版纸张堆叠主体也无法被用户辨认，
   应升级为 PTD 的统一品牌标识：纸张作为外轮廓，负形构成 `P`，后方两层轻微错位表达模板版本。
   Header、Footer 与 ASCII 前景必须共享同一几何概念；小尺寸下仍可辨识，并能继续用于未来 favicon。
   ASCII 动画绘制该标识本身，不再额外发明一套抽象纸张图形。

### 2026-07-31 外部品牌命名

用户确认产品对外品牌名采用 `Foliq`，可以理解为 `Folio + Logic`；中文不设置独立音译品牌名，按语境
使用产品类别说明。默认短描述为“结构化文档设计器”，完整描述为“面向打印与出版的专业结构化文档
设计器”。核心定位语为“不是设计一张图，而是定义一种文档”，英文品牌句可使用
`Logic for every page.`。

本轮只修改用户可见或公开传播的品牌文案，包括落地页、工作台、浏览器 metadata、可访问名称、示例
成品、README、包描述与部署输出。内部工程代号继续使用 `PTD`：`@ptd/*` 包名、环境变量、MIME、
CSS token、`data-ptd-*` 属性、Schema/API/数据库合同和现有技术测试命名均不迁移。当前 `PtdMark` 与
favicon 只是临时品牌资产，用户将另行设计正式 Logo，本轮不修改其几何或文件命名。

公开根路径始终承载落地页；认证成功后 CTA 从“使用 GitHub 登录”变为“进入工作台”，Designer
位于独立的 `/app` 应用入口。已有 Session 的用户访问 `/` 时不自动跳转，官网始终保持可阅读和可分享；
用户通过 CTA 主动进入工作台，开发者也可直接访问 `/app` 调试。

## 已确认决策

1. 生产继续使用 GitHub OAuth + Allowlist；本地使用仅限 loopback、固定开发用户、Server 权威的
   Dev Auth Bypass，不新增匿名认证来解决调试问题。
2. 落地页遵循 PTD 的专业、精确与可信理念；最初 Vidorra/Digital Proof Sheet 视觉已被否决，当前以
   `vercel-demo.html` 与 Webhound 为非约束性参考，不照搬其品牌、业务或页面。
3. `/` 永久作为公开落地页兼登录入口，`/app` 作为受保护 Designer；已有 Session 访问 `/` 时不
   自动跳转，只把主要 CTA 切换为“进入工作台”。
4. 开启 `PTD_DEV_AUTH_BYPASS=true` 且满足所有 loopback 安全条件时，直接访问 `/app` 自动使用
   固定开发身份进入；访问 `/` 仍显示完整落地页，主要 CTA 为“进入本地工作台”，不增加额外的
   本地登录确认页。
5. 第一里程碑不实现浏览器本地崩溃恢复草稿；先完成 PostgreSQL 持久化、刷新重开、版本历史和
   409 Conflict 处理，本地草稿作为后续独立增强任务。
6. 用户提供的本地 PostgreSQL 是可由自动化测试清空的隔离测试库，可以用于 migration、模板 CRUD
   和现有 Server 集成测试；连接串只保存在被 Git 忽略的本机 `apps/server/.env`。
7. 落地页产品预览使用真实 PTD Designer 与真实示例模板生成的截图；允许用 CSS 做响应式裁切、纸张
   装版和少量状态动效，但不在落地页伪造另一套 Designer UI。截图由本任务在本地工作台生成并作为
   受版本控制的产品资产交付。

## 当前实现批次

用户要求先解决以下两个问题，按此顺序推进：

1. 实现并验证严格受限的本地 Dev Auth Bypass，包括隔离数据库上的固定开发用户和 `/app` 访问路径。
2. 将现有登录页重构为公开产品落地页，接入 `/` 与 `/app` 边界、真实 Designer 截图和完整认证状态。

完成这一批次并独立检查后，再继续同一任务中的模板 CRUD、版本历史和冲突工作流，不把 Datasource 或
Export 混入当前批次。

## 待确认决策

- 无。当前实现批次的产品、认证、路由与视觉决策已经确认。

## Definition of Done 方向

获准登录的用户能够从落地页进入应用，新建或打开模板、编辑、保存到 PostgreSQL、刷新浏览器、重新打开
相同内容、查看并恢复历史版本，并在旧版本保存时得到安全且可操作的冲突状态。未登录、未获准和过期
Session 继续 fail closed；显式启用且满足 loopback 安全约束的本地开发环境可以无需 GitHub OAuth 进入
同一套 Web/Server 模板工作流。公开落地页使用真实产品画面，在 Server 不可用时仍能准确介绍产品；
当前实现批次结束时，`/`、`/app`、GitHub Auth 与 Dev Auth Bypass 的宽屏、移动端和错误状态均通过
自动化与浏览器验收。
