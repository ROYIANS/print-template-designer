# 当前组件与 Legacy 能力审计

日期：2026-07-30

## 当前 v2

| 组件              | Renderer                           | 当前编辑入口               | 结论                                 |
| ----------------- | ---------------------------------- | -------------------------- | ------------------------------------ |
| `RoySimpleText`   | 字符串渲染；当前仍写入 `innerHTML` | Inspector 单行 Input       | 基础可用但不安全、不适合长时间排版   |
| `RoyText`         | HTML → `innerHTML`                 | Inspector HTML Textarea    | 只是 HTML Renderer，不是富文本编辑器 |
| `RoySimpleTable`  | 支持行列、Span、单元格内容渲染     | 显示“专用编辑器”，但不存在 | 新增默认 `null`，实质不可创作        |
| `RoyComplexTable` | 支持 header/body/footer 静态渲染   | 不存在                     | 名称和目录成熟度高估能力             |
| `RoyImage`        | 字符串 URL → `<img>`               | 不存在                     | 无法在 UI 中设置图片                 |
| `RoyQRCode`       | 对象配置，动态加载 easyqrcodejs    | 不存在                     | 默认 `null`，新增后空白              |
| `RoyBarCode`      | 对象配置，动态加载 bwip-js         | 不存在                     | 默认 `null`，错误被静默吞掉          |
| 图形              | 确定性 Renderer                    | 画布 Draw + Inspector      | 已达到本阶段基本门槛                 |
| `RoyGroup`        | 递归渲染                           | Group/Ungroup 命令         | 内部组件，目录不暴露是正确的         |

`PropertyInspector` 已经为所有结构化内容显示“结构化内容由专用编辑器维护”，但当前没有任何专用
内容编辑器。这是本阶段需要消除的最直接断点。

## Legacy 可吸收能力

### 普通文本

Legacy 使用 `contenteditable` 在画布内直接编辑，并支持数据字段拖入。应继承：

- 选中后原位编辑；
- 编辑态阻断组件移动；
- 失焦提交；
- 数据绑定后避免误改静态文本。

不应继承：

- `document.execCommand`；
- 把普通文本保存为任意 HTML；
- 每次状态变化依赖 Vuex Watch；
- 用 `innerHTML` 处理纯文本粘贴。

### 富文本

Legacy 使用 WangEditor 5，并在双击后打开 60%×70% Modal。应继承“双击进入内容编辑”和 HTML
兼容经验，但 v2 改为组件框内直接编辑和选区工具，保留画布上下文。

### 自由表格

Legacy 已有：

- 鼠标拖动矩形选择多个单元格；
- 增删行列；
- 合并/拆分；
- 单元格尺寸拖动；
- 单元格普通/富文本与字段绑定；
- 表格上下文菜单。

这些是重要产品资产。v2 应复现行为，但以纯函数 Schema 命令和 EditorStore 原子历史重写，不能
搬运下列实现：

- 通过 `getBoundingClientRect()` 计算合并尺寸；
- 修改行列时无条件重建全部 layoutDetail、丢失既有合并关系；
- `deep: true, immediate: true` Watch 持续写回 Store；
- 以 DOM ID 作为结构命令前提。

### 二维码与条形码

Legacy 把编码参数放在 Component 顶层，把生成的 Data URL 写回 `propValue`。v2 已经改成结构化
`propValue` 并在 Renderer 中按需生成，这个方向更好。应增加类型、默认值、Inspector 与可见错误，
不恢复“生成图片后覆盖语义配置”的模式。

### 图片

Legacy 允许模板直接保存 Data URL 示例，但缺少正式资产生命周期。v2 第一版可以兼容 URL/Data
URL；真正上传、复用、权限、缓存和删除必须留给独立资产阶段。

## 推荐实现地图

| 能力             | 推荐归属                | 方法                                      |
| ---------------- | ----------------------- | ----------------------------------------- |
| 内容编辑会话     | `@ptd/react-designer`   | 实例级状态机，Commit/Cancel 明确          |
| 普通文本原位编辑 | `@ptd/react-designer`   | React Content Surface；纯文本 Draft       |
| 富文本原位编辑   | `@ptd/react-designer`   | Tiptap Spike；Bubble Toolbar；HTML Commit |
| 富文本静态渲染   | `@ptd/components`       | 受限 HTML Renderer，无编辑依赖            |
| 组件内容类型     | `@ptd/core`             | Discriminated prop contracts + guards     |
| HTML 规范化/清洗 | Core/共享纯函数边界     | 保存前与 Renderer 前使用同一规则          |
| 图片/编码配置    | Inspector/Context Panel | 专用表单、即时校验、合理默认值            |
| 表格结构命令     | `@ptd/core`             | 不可变纯函数与不变量测试                  |
| 表格选区/交互    | `@ptd/react-designer`   | 本地 Cell Selection + Store 原子命令      |
| 旧 Schema 迁移   | `@ptd/core`             | `_version` 迁移和 Legacy Fixture 测试     |

## 能力优先级

1. 共享编辑会话与普通文本。
2. 富文本 Spike 和正式实现。
3. 图片、二维码、条形码专用内容编辑器。
4. 自由表格。
5. 目录成熟度校正和完整能力矩阵。
6. `RoyComplexTable` 的数据驱动版本留给数据源与派生分页阶段。

## 安全与兼容发现

- `RoySimpleText` 与 `RoyText` 当前均直接设置 `innerHTML`，存在存储型 HTML 注入边界。
- `RoyQRCode` 和 `RoyBarCode` 使用 unchecked cast 读取结构化内容。
- 编码 Renderer 当前把导入或编码失败全部静默处理，用户无法区分空值和非法值。
- Serialization 的 migration 仍是空 Hook，任何持久化结构升级前必须先补上真实迁移测试。
- `ComponentStyle` 有开放索引签名，新增内容语义不应继续散落在 Style 或组件顶层字段。
