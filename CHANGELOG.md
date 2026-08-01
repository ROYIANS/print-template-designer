# Changelog

本文件记录面向使用者和贡献者的重要变更。v2 尚未发布稳定版本；下方 0.1.x 为 Vue 2 Legacy 的历史记录。

## [Unreleased] — v2 rewrite

### Added

- 建立 `@ptd/core`：Schema、单位换算、序列化、数据绑定和组件注册表。
- 建立 `@ptd/components`：文本、表格、图像、二维码、条码与基础图形的 DOM 渲染器。
- 建立 `@ptd/react-designer`：专业 Canvas-first 工作区、组件目录和属性面板。
- 完成选择、多选、框选、几何调整、锁定、组合、图层、剪贴板、Undo/Redo 与上下文菜单。
- 完成真实标尺、hover/fixed 参考线、彩色标记、绘图工具和 Hand Tool。
- 完成多页面新增、复制、删除与排序，并明确手工页面和自动溢出页的边界。
- 建立 NestJS 11 + Prisma 7 + PostgreSQL 多用户模板服务，支持 GitHub OAuth、Allowlist、owner 隔离、不可变版本历史、恢复与乐观并发。
- 建立 GitHub Actions → GHCR → Docker Compose 的完整 Web/Server/PostgreSQL 发布链路。
- 建立中文项目、开发、部署、App 与 Package 文档体系。
- 完成 Web 文件工作台与文档持久化闭环：真实模板预览、CRUD、另存为、重命名、复制、永久删除、
  不可变版本历史、恢复和 `expectedVersion` 冲突保护。
- 建立 Datasource v2 canonical 合同：受限 JSON object/object array 验证、确定性嵌套字段推断、稳定字段
  ID、安全路径读取、类型与格式化分离、结构化组件绑定、显式 `RenderContext` 和结构化诊断。
- 数据面板支持拖入/选择/粘贴 JSON、应用前摘要与绑定影响、可搜索字段树、字段格式化、文本混合插值、
  图片/二维码/条形码/自由表格绑定、记录切换和非破坏性实时校样。

### Changed

- 从 Vue 2 单体组件重写为 pnpm Monorepo，不再让 v2 运行时代码依赖 `legacy/`。
- 产品边界调整为“框架无关 Core/Renderer + React Designer + 可演进的 Web/Server 应用”。
- Designer 使用 controlled `value` / `onChange` 协议，应用能力通过 `DesignerHost` 命令合同接入；临时
  数据校样可由 Host 通过显式 `RenderContext` 注入。
- 模板序列化升级到 canonical v2：`TemplateSchema.data` 是数据定义唯一事实来源；v0/v1
  `dataSource/dataSet/[::field::]` 保持兼容读取，只在显式保存边界迁移且保存后仍可求值。
- UI 重构为面向报表开发者与设计师的高密度专业工作区，并支持响应式面板布局。

### Infrastructure

- 前端 CI 使用 Node 22，按 workspace 依赖顺序执行 typecheck/build，再运行测试、lint 和 Web build。
- Web 镜像基于 Nginx，支持 `/healthz`、同源 `/api` 代理、分支/SHA 标签、私有 GHCR 登录和脚本化回滚。
- Server 使用 Prisma 7 PostgreSQL driver adapter 与已提交的 migration；Compose 通过一次性 migration 容器管理升级。
- 自托管栈默认保留 PostgreSQL named volume，fresh 清库需要显式参数与二次确认。

### Current boundaries

- v2 workspace packages 尚未发布到 npm。
- `apps/web` 已连接 Server 认证、模板 CRUD、文件工作台、版本历史、恢复和冲突保护。
- `@ptd/export` 仍是空脚手架；PDF、打印、Word 和自动溢出分页尚未实现。
- Datasource v2 的 JSON 导入、字段树、绑定与单记录实时校样已经实现；Excel/CSV、REST/其他数据源代理、
  Secret 管理、重复明细、自动分页和批量输出仍未实现。
- 认证当前只提供 GitHub OAuth；邮箱登录与上传服务尚未实现。

## Legacy v1 history

## [0.1.13](https://github.com/royians/print-template-designer/compare/0.1.12...0.1.13) (2023-01-13)

### Bug Fixes

- 表格样式、富文本样式、文本样式修复和调整 ([91ac08e](https://github.com/royians/print-template-designer/commit/91ac08ecfc47ec195283202a59e3bd99013e17a6))
- 去除Text组件p标签默认上下margin ([e67badb](https://github.com/royians/print-template-designer/commit/e67badb79a5ba446bad3a4ce870a253d078c7a4c))
- 数据表格宽度问题修复。（表格行高因此暂时失效，以后修复） ([ed80dff](https://github.com/royians/print-template-designer/commit/ed80dff7bfe807f867954bed0346102bcee1d26d))
- margin写错 ([cdc0361](https://github.com/royians/print-template-designer/commit/cdc03612ae05b535c0788ccbce1a8c5ae62c3302))

## [0.1.12](https://github.com/royians/print-template-designer/compare/0.1.11...0.1.12) (2023-01-12)

### Bug Fixes

- 文本+富文本添加边距设置 ([05a9c97](https://github.com/royians/print-template-designer/commit/05a9c97c1b71a910981165b1ed91674630f87686))

### Features

- 0.1.12发布。具体见详细信息 ([82f9a1e](https://github.com/royians/print-template-designer/commit/82f9a1e0a84efa85351ab0f00a36ab8fc1734b71))
- RoyImage ([689b62f](https://github.com/royians/print-template-designer/commit/689b62fd49906f864c90f35c60986e41a5704289))

## 0.1.11 (2023-01-05)

### Bug Fixes

- **0.1.1:** do not mutate vuex store state outside mutation handlers ([fe7bc27](https://github.com/royians/print-template-designer/commit/fe7bc278a11e6ea5840520fbc69977133dc2e7c3))
- **0.1.2:** text的HTML造成卡顿问题 ([fbbdfb0](https://github.com/royians/print-template-designer/commit/fbbdfb050870f55af847d54ceaf2f03fdc670b01))
- **0.1.4:** BUG修复 ([9c37ea3](https://github.com/royians/print-template-designer/commit/9c37ea3b10bec382916972a18ab3d6b406579004))
- **0.1.7:** 修复BUG和修改webpack打包配置 ([416b56b](https://github.com/royians/print-template-designer/commit/416b56be8f733a083e2fadcae17c4029d0049466))
- 标尺刻度不准问题，修改源码~ ([721064c](https://github.com/royians/print-template-designer/commit/721064c1662f3283caced2f90cf4303032c6611a))
- 表格分页：最后一页只有一行表格时，没有渲染上去 ([9f3b1df](https://github.com/royians/print-template-designer/commit/9f3b1df8e71fb1c937609861825ea57bcfcb3fec))
- 打包后lib引入报错问题 ([aa4f001](https://github.com/royians/print-template-designer/commit/aa4f001da975827aba43de8d306a3fe78546b5c1))
- 改了很多，又好像没怎么改 ([22e65eb](https://github.com/royians/print-template-designer/commit/22e65eb437bd4a6febc5f2dcd8ca37e2d11492b8))
- 更新README，修复一些BUG ([5a76e55](https://github.com/royians/print-template-designer/commit/5a76e55f8d6a9d790764690ab4ea0b72350c4875))
- 简单表格渲染问题修复+富文本添加插入图片菜单 ([55b269b](https://github.com/royians/print-template-designer/commit/55b269b32e5c147ebb9e0525a3a09cc3a82734b9))
- 今日BUG修复 ([4f1c1ce](https://github.com/royians/print-template-designer/commit/4f1c1ce8848288a783792f395275035eeacb5df5))
- 拖拽不能出格 ([a0d12f9](https://github.com/royians/print-template-designer/commit/a0d12f949303c9dc58de420d090efa392d3a799f))
- 拖拽BUG ([eeaf882](https://github.com/royians/print-template-designer/commit/eeaf88217e8c4d6a80954c92b0170804fb8a94a5))
- 修改readme，添加坐标小块，调整样式 ([6f57d8b](https://github.com/royians/print-template-designer/commit/6f57d8b6fe2a290ce89b15e672a0cc592590b989))
- 最近BUG修复 ([b1a173d](https://github.com/royians/print-template-designer/commit/b1a173d29d96e9e845e53f24998414f73fbdeb99))
- noscript ([f6e193a](https://github.com/royians/print-template-designer/commit/f6e193ac4f7a7baf599bfce37d741bb12afb20de))

### Features

- 0.0.7.基本功能-导出pdf和打印 ([0a91cc6](https://github.com/royians/print-template-designer/commit/0a91cc6050d5648933863d8e7575a6fe4d1f108f))
- 按钮配置 ([9c304b5](https://github.com/royians/print-template-designer/commit/9c304b53898910df5cb3f1487d1e8f0713104d71))
- 表格属性配置，大小调整BUG修复等 ([09c0b7e](https://github.com/royians/print-template-designer/commit/09c0b7e076dbd3e0c7f95c7bc1ef237a787a1449))
- 不用vite，改webpack。新标尺工具 ([6b72e2c](https://github.com/royians/print-template-designer/commit/6b72e2c68961d28aa9cdf4f72551942afd313ccb))
- 打印预览渲染功能 ([a790ea4](https://github.com/royians/print-template-designer/commit/a790ea4bea4f5af11bf1a5079a36533bebe7b130))
- 复杂表格渲染-基本完成！ ([23f133b](https://github.com/royians/print-template-designer/commit/23f133be0fc9b820b34705ea9319f008a4c28a23))
- 简单表格预览 ([0eeef09](https://github.com/royians/print-template-designer/commit/0eeef09c63be36329d161a22b6b609f3d0293e3a))
- 简单表格组件 ([b53c1d5](https://github.com/royians/print-template-designer/commit/b53c1d5db445958d51bc72868c753c9db969cd2f))
- 简单文本和长文本的属性设置 ([29ff492](https://github.com/royians/print-template-designer/commit/29ff492e0cd89268111d5071a49f65964c8d9548))
- 近期开发功能提交 ([69e34f7](https://github.com/royians/print-template-designer/commit/69e34f74c94b71d772ccef96f82e073e57675bf4))
- 数据表格配置界面 ([0dccead](https://github.com/royians/print-template-designer/commit/0dcceadccdbd5d3e9be2bc446687a90000c2ee35))
- 数据源，简单实现50% ([525480c](https://github.com/royians/print-template-designer/commit/525480cd4b074ad9f1e6af2b6216a53ff23b8f07))
- 数据源完善。20dev发布 ([bd6095a](https://github.com/royians/print-template-designer/commit/bd6095aa5cbc3e4443b173fd8fdbfc7f3a4cc9cd))
- 拖拽 ([e36d390](https://github.com/royians/print-template-designer/commit/e36d390a16d2b8ef0fa229830deb5280d5365dc9))
- 拖拽问题修复和右键交互逻辑 ([07c7462](https://github.com/royians/print-template-designer/commit/07c74626ac0e32ea58a04e1b51920e6463b10e3b))
- 文本框可以编辑了 ([5d88db8](https://github.com/royians/print-template-designer/commit/5d88db8747c39753742513b453359897d53b1dd4))
- 页面缩放，页面大小等 ([2fb7655](https://github.com/royians/print-template-designer/commit/2fb7655f393e1ba3b6a37b617cd7c143dfec3c61))
- 一些细节的补充和修复 ([03a397d](https://github.com/royians/print-template-designer/commit/03a397d5b896da1b202ea497a26f01657170d7ae))
- 圆形、矩形、直线 ([ee51cdd](https://github.com/royians/print-template-designer/commit/ee51cddff9d62c62fc3157da4ae119bd063a1e6d))
- complexTable，初步 ([7607c7e](https://github.com/royians/print-template-designer/commit/7607c7eabdd5b11480f5a4432eaf63a7f373d6e5))
- RoyImage ([689b62f](https://github.com/royians/print-template-designer/commit/689b62fd49906f864c90f35c60986e41a5704289))
