# Foliq 工作台 Home / Recent 信息架构参考

> 研究日期：2026-07-31
> 范围：Photoshop 桌面版 Home/Workspace、Figma File Browser/Design File 的公开官方帮助资料，以及 Foliq 当前 `/app`、`DesignerHost`、模板 API 实现。
> 方法边界：只访问无需登录的公开页面；未登录 Photoshop 或 Figma，未读取账户态页面，未复制第三方 DOM、CSS、截图或品牌资产。以下“观察”只代表研究日期可公开验证的官方说明，不把第三方当前实现视为永久产品合同。

## 结论先行

Foliq 不应继续让裸 `/app` 直接等同于“一份未命名空白文档”。更稳健的关系是：

- `/` 始终是公开官网与 Web Auth 入口；
- `/app` 是通过 Server 权威认证后的文件工作台，默认呈现“最近更新 / 全部模板 / 新建 / 搜索”；
- `/app?template=<id>` 是已保存模板的 Editor 深链；
- 建议补充 `/app?new=1` 表示未保存的新文档 Editor，避免裸 `/app` 同时承担 Home 和空白 Editor 两种语义；
- Home 与 Editor 是同一受保护应用壳中的两个一级空间，不是“Editor 上盖一个大型模板库 Modal”；Editor 的“文件工作台”动作返回 `/app`，浏览器后退/前进也必须可预测；
- 当前数据只有 `updatedAt`，因此首版必须命名为“最近更新”，不能声称“最近打开”或“继续编辑”；只有增加 owner 维度的 `lastOpenedAt`/activity 后，才可准确提供真正的 Recent/Continue editing；
- 搜索预览、排序、账户和行级更多操作适合 Popover/Context menu；版本历史适合 Editor 侧边抽屉；命名可用小型 Modal；未保存决策、硬删除、冲突覆盖/恢复决策才应阻断；
- `DesignerHost` 继续负责 Editor 与 Web 宿主之间的命令/文档状态边界，但应消除 `open` 与 `templateBrowser` 当前都打开同一个 Modal 的重复语义。Home 的列表、认证、路由和 API 仍留在 `apps/web`，不能进入 `@ptd/react-designer`。

## 参考来源与可验证证据

| 来源                                                                                                                                         | 公开页面证据                                                                                                                                                                                                                     | 对本研究的用途                                                                                 | 证据限制                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [Adobe：Home screen overview](https://helpx.adobe.com/photoshop/desktop/get-started/learn-the-basics/homescreen-overview.html)               | 官方说明 Photoshop 启动时出现 Home；Home 包含 Recents、关键词过滤、New file、Open、Your files、Shared with you、Deleted 等入口。编辑文档时可从 Options bar 选择 Home 返回，按 Esc 退出 Home。页面在研究时标示更新于 2026-02-23。 | 证明 Home 是启动/文件入口，同时与 Editor 可逆切换，而不是一次性欢迎页。                        | 文档描述 Photoshop 桌面版及 Creative Cloud 文档；Foliq 没有相同云文件、共享和离线能力，不能照搬分类。                      |
| [Adobe：Workspace overview](https://helpx.adobe.com/photoshop/desktop/get-started/learn-the-basics/workspace-overview.html)                  | 官方将 Workspace 划分为 Application bar、Panels、Tools panel、Document window、Options bar；Options bar 只显示当前工具设置；Contextual Task Bar 是随当前任务/工具变化的浮动下一步操作。页面在研究时标示更新于 2026-06-05。       | 说明专业 Editor 如何按“应用级命令 / 创建工具 / 对象属性 / 当前工具设置 / 情境下一步”划分职责。 | Photoshop 的桌面窗口、可定制工作区和工具规模远大于 Foliq；只参考职责分层，不参考尺寸、布局和视觉。                         |
| [Figma：Guide to the file browser](https://help.figma.com/hc/en-us/articles/14381406380183-Guide-to-the-file-browser)                        | 官方把 File Browser 定义为管理账户、组织工作、浏览可访问团队/项目/文件的空间；公开示例列出 Account、Search、Recents、Community、Notifications，以及 Team/Organization、Drafts、Browse、Trash、Starred 等侧栏区域。               | 证明文件管理是独立长期空间，并由全局入口、资源层级和主内容区共同组成。                         | 页面同时覆盖不同套餐/组织形态；Foliq 当前是 owner 隔离的单用户模板列表，无团队、项目、收藏、社区或通知。                   |
| [Figma：Guide to files and projects](https://help.figma.com/hc/en-us/articles/1500005554982-Guide-to-files-and-projects)                     | 官方说明登录到 figma.com 进入 File Browser；在文件内通过 Figma menu > Back to files 返回。文件卡展示其所属项目；File Browser 左侧用于浏览内容。                                                                                  | 证明 Editor → Files 是明确的一级导航动作，文件 URL 与文件浏览空间可以各自稳定存在。            | Foliq 当前没有 Team/Project 层级，也不应为了模仿 Figma 先造空层级。                                                        |
| [Figma：Search for files, projects, and people](https://help.figma.com/hc/en-us/articles/4422774037271-Search-for-files-projects-and-people) | File Browser 的 Search 获得焦点后先显示搜索预览，并列出最近打开文件；输入时即时预览匹配；点击 “See all results” 或 Enter 进入完整结果页；点外部或 Esc 退出预览。完整结果页再按 resource type、location、file type、sort 等收窄。 | 给出“Popover 预览 → 独立结果视图”的渐进式搜索模式，避免一点击搜索就阻断当前浏览。              | Foliq 当前 API 无服务端搜索/分页，也没有可靠的最近打开事件。首版只能对已加载的小列表做标题过滤，不能声称支持正文全文搜索。 |
| [Figma：Create a new file](https://help.figma.com/hc/en-us/articles/360038511153-Create-a-new-file)                                          | 官方说明 File Browser 顶部 `+ Create` 打开下拉选项；新建位置取决于当前 Draft/Team/Project。                                                                                                                                      | 说明新建是一项轻量、位置感知的全局动作，适合 dropdown/popover，不必先进入阻断式向导。          | Foliq 当前只有一种模板类型和 owner 根列表；首版无需复制多产品选择器或团队位置选择。                                        |
| [Figma：Delete and restore files](https://help.figma.com/hc/en-us/articles/360047512294-Delete-and-restore-files)                            | 行级右键菜单提供 Move to trash；移动到 Trash 会影响所有协作者，因此再次确认。Trash 是 File Browser 中的独立区域，可恢复或永久删除；永久删除不可逆，并使用确认对话框。                                                            | 说明行级命令先用 context menu，资源管理用独立区域，影响范围大或不可逆时才用 Modal 阻断。       | Foliq 当前 `DELETE /api/templates/:id` 是直接硬删除，没有 Trash/restore 模型；不能先做一个看似可恢复的“回收站”界面。       |
| [Figma：Explore design files](https://help.figma.com/hc/en-us/articles/15297425105303-Explore-design-files)                                  | 官方把 Editor 分为 Navigation bar、Left sidebar、Canvas、Right sidebar、Toolbar；Toolbar 负责创建和画布交互，左侧负责文件内组织，右侧负责当前选择属性/协作/导出。Figma 文件保持在线更新并有版本历史。                            | 说明 Editor 的稳定区域应围绕当前文件/选择服务，跨文件浏览不应占用对象属性侧栏或创建工具栏。    | Foliq 是手动保存和 Server version 冲突模型，不具备 Figma 的实时协作/自动保存，不应省略 dirty/conflict 保护。               |

## 观察：Home 与 Editor 的导航关系

### Photoshop 可提炼的关系

1. 启动默认落在 Home，先解决“从哪里开始”和“打开哪份文件”。
2. 打开文档后进入 Workspace；Home 仍是 Application/Options bar 可到达的稳定目的地。
3. Home 不是独立网站，也不是叠在画布上的普通对话框：官方说明可从文档态进入，并用 Esc 回到文档，体现两个一级工作状态之间的短路径切换。
4. 文件入口集中在 Home；Workspace 的主区域继续为当前 Document 服务。

### Figma 可提炼的关系

1. 登录后的 File Browser 是文件、项目和账户资源的管理空间。
2. Editor 中存在明确的 Back to files，而不是把完整 File Browser 永久塞入属性面板。
3. 文件使用稳定 URL；从文件内回到浏览器、从浏览器再打开文件，构成可预测的双向导航。

### 对 Foliq 的含义

Home/Files 与 Editor 应成为受保护 App 的两个一级 route state：

```text
公开官网 /
   │ 认证成功 / 已有 session 主动进入
   ▼
文件工作台 /app
   ├─ 新建空白 ───────────────▶ /app?new=1
   ├─ 打开模板 #42 ───────────▶ /app?template=42
   └─ 搜索、排序、重命名、复制、删除（留在工作台）

Editor /app?template=42 或 /app?new=1
   ├─ 文件工作台 / Back ──────▶ /app
   ├─ 保存新文档 ─────────────▶ replaceState(/app?template=<newId>)
   └─ 浏览器 Back/Forward ────▶ 恢复相应 Home/Editor route state
```

不建议继续把 `TemplateBrowser` 作为覆盖整个 Editor 的宽 Modal：它让用户先进入空白 Editor 才能找文件，也让 `/app` 无法成为清晰的应用首页。过渡期可以保留该 Modal 以免阻塞当前最小闭环，但目标 IA 应以 `/app` Home 取代它。

## 文件组织：Recent、All、New、Search、Sort、Continue

### 推荐主层级

`/app` 顶部保持一个简洁 App header：Foliq 标识、全局搜索、新建按钮、账户菜单。主内容区只需要两个首版视图：

1. **最近更新**（默认）
   - 数据直接使用现有 `GET /api/templates` 的 `updatedAt desc, id desc` 顺序；
   - 首屏展示有限数量，例如 6–12 份，强调名称、版本、更新时间；
   - 第一项可以使用“继续处理”作为动作文案，但区域标题仍应是“最近更新”，且不能暗示它是用户最后打开的文件；
   - 当前 API 没有缩略图，不伪造画布预览。首版使用类型一致的纸张占位、标题、版本和时间；只有增加持久化 thumbnail/preview 后才展示真实缩略图。

2. **全部模板**
   - 使用同一 owner 列表的完整结果；
   - 支持标题搜索、排序、行/卡片视图（若确有需要）；
   - 现阶段资源只有模板，不建立空的 Team/Project/Drafts/Starred 左侧树；当真实层级出现时再扩展。

### “最近打开 / 继续编辑”的数据合同

当前 `TemplateSummary` 只有 `createdAt`、`updatedAt`，Server `list()` 也只按内容更新时间排序。它无法回答：

- 用户最后打开的是哪一份；
- 某份文档是否只是被别人/另一会话更新；
- 用户是否真的“继续”了上一会话。

因此推荐分两阶段：

- **现在**：界面用“最近更新”，动作可用“打开”或“继续处理”；
- **以后**：增加 owner/user activity，例如 `(userId, templateId, lastOpenedAt)`，在成功加载文档后由 Server 记录，再把默认区升级为“最近打开 / 继续编辑”。不要只靠浏览器 localStorage 形成跨设备不一致的主列表；localStorage 最多是非权威的体验补充。

### 搜索与排序

- 点击搜索或按快捷键：打开 anchored search Popover，空查询时展示最近更新项，输入时按标题即时过滤；Esc/点击外部关闭。
- Enter 或“查看全部结果”：在 `/app` 主内容区切换为完整结果状态。若需要可分享/可后退，采用互斥查询合同，例如 `/app?view=all&q=invoice&sort=updated-desc`。
- 当存在 `template=<id>` 或 `new=1` 时进入 Editor，不同时解释 `view/q/sort`，路由解析应是 discriminated state，避免多组 query 互相覆盖。
- 首版列表规模小时可客户端过滤/排序；一旦加入分页或大量模板，API 再增加 `q`、`sort`、cursor/page。正文搜索需要索引能力，不能把标题过滤包装成全文搜索。

### 新建

- Home header 的“新建”是主 CTA。
- 当前只有一种文档类型时，按钮主点击可直接进入 `/app?new=1`；旁侧下拉只在确有“空白 / 从现有模板复制 / 导入”等真实选择时出现。
- 第一次保存时沿用现有 `NameDialog`，保存成功后用 `replaceState` 变为 `/app?template=<id>`，避免 Back 回到一份已经不存在的“未保存新建态”。
- 不用 Modal 先问“是否新建空白”；只有用户离开 dirty 文档时才需要未保存决策。

## 交互表面分配

| 操作                               | 推荐表面                                           |                  是否阻断 | 理由                                                                                                                      |
| ---------------------------------- | -------------------------------------------------- | ------------------------: | ------------------------------------------------------------------------------------------------------------------------- |
| Home / 最近更新 / 全部模板         | `/app` 独立页面状态                                |                        否 | 是跨文档管理的长期空间，应可刷新、返回和深链。                                                                            |
| 打开已保存模板                     | `/app?template=<id>` Editor                        |      否；dirty 离开时例外 | 文档身份需要稳定 URL，刷新和前进/后退可恢复。                                                                             |
| 新建空白                           | `/app?new=1` Editor                                |      否；dirty 离开时例外 | 直接进入创作，首次保存再命名。                                                                                            |
| 搜索预览                           | Header anchored Popover                            |                        否 | 支持最近项、即时匹配、Esc 退出，不遮断文件浏览。                                                                          |
| 完整搜索结果                       | `/app` 内独立结果 view，可写入 `view/q/sort`       |                        否 | 适合筛选、排序、空/错/加载状态和浏览器历史。                                                                              |
| 排序、视图密度                     | Popover                                            |                        否 | 轻量偏好，不需要决策对话框。                                                                                              |
| 账户、退出                         | Popover                                            |                        否 | 全局但低频；Editor 与 Home 复用同一宿主入口。                                                                             |
| 模板行级更多操作                   | kebab/context menu Popover                         |                        否 | 重命名、复制、删除入口与目标资源绑定。                                                                                    |
| 重命名                             | 小型 Modal 或可靠的行内编辑                        |                      短暂 | 需要输入和校验，但不应离开列表；不要使用浏览器 `prompt`。                                                                 |
| 复制                               | 直接执行并 toast，或需要改名时小型 Modal           |                    通常否 | 可逆且不影响原件；成功后聚焦/高亮副本。                                                                                   |
| 删除                               | 确认 Modal                                         |                        是 | 当前 API 是不可恢复的硬删除，必须明确模板名和不可逆影响。若以后有 Trash，首次“移到回收站”仍应说明影响，但可弱化严重级别。 |
| 版本历史                           | Editor 右侧 Drawer/Side sheet                      |                        否 | 与当前文档强相关，查看版本时间线时仍需看到画布和文档状态。                                                                |
| 选择历史版本预览                   | 同一 Drawer 中的 detail/preview                    |                        否 | 检查动作不应阻断。若需要画布预览，可进入只读预览状态并保留退出路径。                                                      |
| 恢复历史版本                       | Drawer 内明确动作；dirty/conflict 时再开决策 Modal |                    条件性 | Server 恢复会生成新版本，本身可追溯；真正需要阻断的是丢弃未保存内容或处理并发冲突。                                       |
| Save As / 首次保存命名             | 小型 Modal                                         |                      短暂 | 聚焦单一输入与命名校验，符合当前实现。                                                                                    |
| dirty 文档离开、新建、打开其他模板 | Unsaved decision Modal                             |                        是 | 用户必须在继续编辑、保存、丢弃之间作决定；当前实现只有“继续/丢弃”，后续可增加“保存并继续”。                               |
| 409 Conflict                       | Editor 持久状态 + 决策 Modal/Drawer                | 是（仅覆盖/重新载入决策） | 不可静默重试；保留 Save As、重新载入 Server 版本、查看差异/历史的可操作路径。                                             |
| 一般加载、保存成功、网络重试       | inline status / toast                              |                        否 | 不应用 Modal 抢焦点。                                                                                                     |

### Drawer 使用边界

本次访问的官方公开资料对 Figma 文件管理主要给出了独立 File Browser、搜索预览、下拉/右键菜单和确认 Dialog；没有足够公开证据证明其当前文件浏览流程使用 Drawer。这里为 Foliq 推荐版本历史 Drawer 是基于任务连续性和现有 Editor 布局作出的产品推导，不是对第三方 UI 的复刻。

## 专业 Editor 顶部菜单的职责划分

Photoshop 与 Figma 的共同启示不是“��单��多越专业”，而是每个表面回答不同问题：

| 表面               | 回答的问题                                   | Foliq 应放什么                                                                                                    | 不应放什么                                     |
| ------------------ | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Application menu   | “对文件、编辑历史、对象、视图、帮助做什么？” | 文件 New/Open/Save/Save As/History；编辑 Undo/Redo/Cut/Copy/Paste；对象 Group/Lock/Order；视图 Ruler/Guides；帮助 | 持久的宽高、字体、边距等属性字段               |
| 顶部快捷动作       | “当前最常用的 1–3 个全局动作是什么？”        | 文件工作台、Save、账户；状态变化时显示 pending/dirty/conflict                                                     | 复制整个 File 菜单；给同一动作造另一套命令语义 |
| Canvas toolbar     | “我要创建/选择/移动什么？”                   | 选择、文本、图片、条码、形状等创作工具                                                                            | 文件管理、账户、版本列表                       |
| 左侧资源/页面面板  | “文件内有哪些页面、图层、组件资源？”         | 页面、图层、组件库、数据资源                                                                                      | 跨文件 Recent/All 列表                         |
| 右侧 Inspector     | “当前选择是什么，属性如何改？”               | 尺寸、位置、样式、组件属性、页面属性                                                                              | New/Open/Save、账户、全局搜索                  |
| Contextual control | “基于当前选择，下一步最相关的动作是什么？”   | 对齐、分布、组合、锁定、文本/图片快速动作等少量高频项                                                             | 与当前选择无关的完整菜单镜像                   |

应用菜单和顶部快捷动作可以共享同一个底层命令；“可达入口重复”不是问题，“语义与状态合同重复”才是问题。例如顶部 Save 与 File > Save 都调用 `hostCommands.execute('save')`，状态来自同一 `DesignerHost`，这是合理的高频快捷入口；但 `open` 和 `templateBrowser` 都显示相同模板库、又各自存在 command id，就会让宿主未来出现分叉状态和测试负担。

### 对当前 AppBar 的具体建议

当前实现已经有 File/Edit/Object/View/Help 的合理领域划分，也让 Editor command 与 Host command 分离。建议保持这个骨架，同时做以下语义收敛：

1. `File > 文件工作台 / 打开模板` 和顶部“文件工作台”统一执行一个“返回 `/app`”动作。
2. `open` 作为唯一用户可见的跨文件入口；`templateBrowser` 从 Editor 可见菜单移除，或明确降级为过渡期兼容 alias，不再各自管理状态。
3. 如果未来支持本地 `.json`/`.foliq` 导入，使用已有 `importTemplate` 表达“从电脑打开/导入”，不要重新把 `open` 解释为两种资源来源。
4. 顶部账户占位应由 Web host 真正接管。当前 `Designer` 内有 `userPlaceholder`，`apps/web` 又在外层绝对放置 account button，视觉和可访问语义可能重复。长期应增加窄、明确的宿主 slot/账户触发器合同，或由 AppBar 调用 host account command；不要把 Auth 客户端引入 `@ptd/react-designer`。
5. 文档标题、版本、dirty/saving/conflict 应在 AppBar 有单一状态呈现，状态来自 `host.document`；不要在 Home 列表、外层 overlay 和 AppBar 各造一份不一致的当前文档状态。

## 推荐的 Foliq 路由与状态合同

### Route state

```ts
type ProtectedAppRoute =
  | { kind: 'home'; view: 'recent' | 'all'; query?: string; sort?: FileSort }
  | { kind: 'new-document' }
  | { kind: 'document'; templateId: number }
  | { kind: 'invalid-template-link'; raw: string }
```

建议 URL：

| URL                                      | 含义                                                     |
| ---------------------------------------- | -------------------------------------------------------- |
| `/`                                      | 永久公开官网；已有 Session 也不自动跳转。                |
| `/app`                                   | 受保护 Home，默认“最近更新”。                            |
| `/app?view=all`                          | 全部模板。                                               |
| `/app?view=all&q=invoice&sort=title-asc` | 完整搜索/排序结果，可选；首版也可只把 query 放本地状态。 |
| `/app?new=1`                             | 新建未保存 Editor。                                      |
| `/app?template=42`                       | 模板 #42 Editor。                                        |

解析优先级应显式且互斥：`template` > `new` > Home view；若同时出现冲突参数，规范化为唯一 canonical URL，而不是把搜索参数和文档参数同时解释。

### Web Auth

1. `/app*` 的 Home 与 Editor 继续共用 `useAccountAccess()` 的 Server 权威结果，不使用前端开关绕过。
2. 未登录/未获准/Server 不可用继续返回公开 `/` 的可操作 notice；但应保存一个经过白名单校验的同源 return target，以便认证成功后回到原始 `/app?template=42`，而不是当前一律回 `/app` 丢失深链。
3. return target 只允许 `/app` 路径和预期 query，禁止绝对 URL、协议相对 URL和任意重定向，避免 open redirect。
4. Dev Auth Bypass 仍直接进入相同 Home/Editor，不建立第二套本地导航。
5. Session 过期发生在 Editor 时，先保留当前内存文档状态并明确提示；跳回官网前若有 dirty 内容，不应无提示销毁。由于首个里程碑明确不做本地崩溃草稿，这一点至少需要阻断式说明和可复制/导出的后续策略，不能假装自动恢复存在。

## 与现有代码/API 的兼容性

### 可以直接复用

- `GET /api/templates` 已 owner 隔离并按 `updatedAt desc, id desc` 返回，能直接支撑“最近更新”和首版“全部模板”。
- `TemplateSummary` 已有标题、版本、创建/更新时间，足够做没有伪缩略图的专业列表。
- `/app?template=<id>`、`templateIdFromSearch()`、`useDocumentController()` 已提供加载、刷新、前进/后退恢复的基础。
- `DesignerHost.document` 已承载 id/title/version/status/message；`commands` 与 `onCommand` 适合作为 Editor → Web 的边界。
- `NameDialog`、`UnsavedDialog` 已是工作台自有 Modal，并有基本 focus trap/Escape/焦点返回逻辑；可继续使用，不退回浏览器 prompt/confirm。
- 409 已被建模为 `conflict` 且不会静默覆盖，符合“只在需要用户决策时阻断”的原则。

### 需要调整

1. `Workspace` 目前在任何 `/app`（没有 `template`）直接建立 `initialState()` 并渲染 Editor。需要在 Web route 层先区分 Home 与 New Editor，不能继续用 `requestedTemplateId === undefined` 同时表示二者。
2. `WorkspaceDialog.browser`/`TemplateBrowser` 目前是 Editor 内宽 Modal。目标态应抽成 `/app` Home；过渡期 Modal 可保留，但不再作为唯一打开入口。
3. 当前 `newDocument()` 导航回 `/app`。若 `/app` 改为 Home，必须改为 `/app?new=1`，否则新建会立刻返回文件工作台。
4. 当前 `onLocationChange(undefined)` 的语义也要从“空白文档”拆成明确的 `navigateHome()` 与 `navigateNewDocument()`，避免继续用 `undefined` 承载两个产品状态。
5. `open` 与 `templateBrowser` 当前 command state 完全相同、处理也完全相同。应指定一个 canonical command；兼容 alias 若保留，应在一处转发。
6. API 尚无 last-opened、缩略图、分页、服务端搜索、软删除。UI 文案和交互必须准确反映这个边界。
7. 当前 DELETE 是硬删除；实现删除 UI 时确认 Modal 必须明确“永久删除、不可恢复”。只有 Server 先增加 Trash/restore 数据合同后，才能出现“回收站”独立视图。
8. 版本历史 Drawer 可以直接使用现有 `listVersions/getVersion/restore` API，但恢复前仍要检查当前 `expectedVersion`、dirty 和 conflict 状态。

## 推荐实施顺序

### 第 1 步：Home 最小闭环

- 把 `/app` 改为受保护 Home；
- 显示“最近更新”和“全部模板”，复用一次 `templateApi.list()`；
- 支持打开 `/app?template=id`、新建 `/app?new=1`；
- Home 有 loading/empty/error/retry；
- Editor 顶部“文件工作台”返回 `/app`；
- dirty Editor 返回 Home 时使用现有 Unsaved decision Modal。

### 第 2 步：轻量查找与管理

- 标题搜索预览 Popover、完整结果视图和客户端排序；
- 行级更多菜单、重命名、复制、硬删除确认；
- 保留准确文案：最近更新、按标题搜索、永久删除。

### 第 3 步：版本与冲突

- Editor 版本历史 Drawer；
- 选择版本、查看元数据/只读预览；
- restore 生成新版本；dirty/conflict 才进入决策 Modal；
- 409 状态提供“另存为 / 重新载入服务器版本 / 查看版本历史”。

### 后续真实能力出现后再做

- last-opened activity → “最近打开 / 继续编辑”；
- preview asset → 真实模板缩略图；
- soft delete → Trash 页面与恢复；
- 大数据量 → 服务端搜索、排序、分页；
- 团队/项目/收藏 → 左侧层级导航。

## 不可照搬项

1. **不照搬品牌与视觉资产**：不使用 Adobe/Figma 图标、Logo、截图、色彩、布局尺寸、DOM/CSS 或文案；只吸收信息架构和职责分配。
2. **不照搬不存在的资源模型**：Foliq 当前没有 Creative Cloud、Community、Team、Organization、Project、Drafts、Shared with you、Starred、Notifications、Lightroom 或多产品文件类型。
3. **不照搬自动保存假设**：Figma 的 live/always-up-to-date 模型不适用于 Foliq 的手动 Save、immutable version 和 409 expectedVersion 合同。
4. **不把 `updatedAt` 冒充 recently opened**：这会让“继续编辑”产生错误承诺。
5. **不伪造模板缩略图**：没有真实预览生成/持久化合同前，用信息明确的列表或中性纸张占位。
6. **不先做假的 Trash**：当前 DELETE 不可恢复；UI 必须明确硬删除，或先修改 Server 数据模型再提供回收站。
7. **不堆叠 Modal**：文件浏览、搜索、排序、版本查看都不是必须阻断的决策；Modal 只给命名焦点、未保存、硬删除、冲突/恢复等明确决策。
8. **不让 Home 进入 Designer 包**：Home、Auth、HTTP、路由和账户仍属于 `apps/web`；`@ptd/react-designer` 只暴露宿主命令/状态或很窄的 slot 合同。
9. **不把第三方现状当永久事实**：官方页面和套餐 UI 会变化；Foliq 应以自己的资源模型、可用 API 和用户任务验证 IA。

## 可用于验收的 IA 检查项

- 直接访问 `/app`，认证成功后先看到文件工作台，而不是未命名空白画布。
- 直接访问 `/app?template=<id>`，认证后打开该模板；OAuth 往返不丢失已校验的深链目标。
- `/app?new=1` 刷新后仍明确是新文档 Editor；首次保存后 canonical URL 变为 `/app?template=<id>`。
- 从 clean Editor 返回 Home 不弹确认；从 dirty/conflict Editor 返回、新建或打开其他模板时才要求决策。
- Home 的默认标签为“最近更新”，排序与 Server `updatedAt` 一致；未实现 last-opened 前不出现误导性的“最近打开”。
- 搜索预览可用 Esc 关闭，Enter 可进入完整结果；排序不使用 Modal。
- File menu 和顶部快捷动作共享同一 Host command/state；`open`/`templateBrowser` 不再出现两个等价产品语义。
- 版本历史可在不离开画布的情况下查看；只有恢复会丢弃 dirty 内容或遇到 conflict 时才阻断。
- 硬删除明确不可恢复并要求确认；若没有 Server Trash，不出现“移到回收站”文案。
- Home、Editor、对话框、Popover/Drawer 均有 keyboard/focus/ARIA 路径，浏览器 Back/Forward 不产生静默数据丢失。

## 追加：第三轮视觉评审后的明确产品决策

以下是用户对实现稿的直接评审结论，用于约束当前实现；它们不改写前文对 Photoshop/Figma 公开资料的
来源观察：

1. `DOCUMENT WORKSPACE / 文件工作台`、`0 DOCUMENTS`、`01 / 02`、伪图纸编号、无语义规则线和矩形框
   均被明确否决。工业/专业工具感不能靠装饰性英文与工程标记营造，必须来自真实信息架构、模板内容、
   层级、对齐和状态。
2. Home 吸收 Figma File Browser 的稳定侧栏、文件上下文、搜索、新建、最近内容区和完整列表信息架构，
   但不复制暗色品牌，也不增加当前没有的 Community、Team、Trash 等能力。
3. 早期“不要伪造缩略图”的边界继续成立，但当前包已能复用真实 `TemplateSchema` 和
   `ComponentRenderer`。因此“最近更新”改为真实第一页内容预览，而不是静态纸张占位；Host 负责最多
   4 份详情请求、取消与单项失败隔离，“全部模板”继续只用 summary，防止无界 N+1。
4. 宽屏为 sidebar + content，窄屏必须重组成真正 compact top shell，不能只是隐藏桌面文案。两者均需
   `focus-visible`、coarse pointer 命中区域和 reduced-motion 回退。
5. 账户头像不是退出捷径。Home/Editor 复用真实账户 Popover，触发器再次点击关闭，outside/Escape
   收起；只有 GitHub 身份显示显式退出，Dev Bypass 不显示无效操作。
6. Header 同级动作必须保持同一轮廓语言。“文件工作台”和“保存模板”同高度、同圆角、同边框与状态
   节奏，只以填充和明度区分主次；Designer 内部不得再保留第二个假账户语义。
7. 顶部菜单只保留有实际意义的选项。尚未接入的 Version History、Fit Page 和全部未接入 Help 命令不
   以 Disabled 计划文案暴露；空分类直接移除，稳定 Host command 类型仍为后续接入保留。
