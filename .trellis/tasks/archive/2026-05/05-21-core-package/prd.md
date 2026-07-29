# @ptd/core 核心引擎包

## Goal

实现框架无关的 TypeScript 核心引擎包 `@ptd/core`，为上层的 `@ptd/components`、`@ptd/react-designer`、`@ptd/export` 提供：
- 模板 Schema 类型定义（组件树 + 页面配置）
- 数据绑定引擎（变量替换、类型转换）
- 序列化 / 反序列化（JSON ↔ Schema）
- 页面尺寸常量与单位换算工具
- 自动分页逻辑（auto-table、auto-split-text 迁移）
- 组件注册表（ComponentRegistry）

## What I already know

- legacy `page-generator.js`：渲染引擎，含 `BasePageGenerator` 类，处理 mm→px 换算（COMMON_SCALE=5）、自动分页
- legacy `render-util.js`：数据绑定，`replaceTextWithDataSource` 用 `[::field::]` 语法替换变量，支持 Money/BigMoney/CurDateTime 等类型转换
- legacy `global.js`：状态模型，`pageConfig`（pageSize/pageDirection/pageLayout/margins/fonts）+ `componentData`（组件数组）
- legacy `viewer-constant.js`：PAGE_SIZE 常量（A1-A7, B1-B7, C1-C7），COMMON_SCALE=5（mm→px）
- legacy `auto-table.js` / `auto-split-text.js`：自动分页逻辑，需迁移进 core
- 现有 `packages/core/src/index.ts`：空占位 `export {}`
- 包配置已就绪：ESM+CJS 双输出，TypeScript strict

## Assumptions (temporary)

- `@ptd/core` 不依赖任何 DOM API（纯计算逻辑），可在 Node.js 环境运行
- 数据绑定语法沿用 `[::field::]`，不做破坏性变更
- COMMON_SCALE=5 保持不变（1mm = 5px）

## Open Questions

- [x] 自动分页逻辑放在 `@ptd/components`（DOM 依赖），core 只提供类型和纯数值计算 ✓

## Requirements

### 1. Schema 类型系统
- `PageConfig` 接口：pageSize、pageDirection、pageLayout、pageWidth/Height、margins、fonts、scale、background
- `ComponentSchema` 接口：id、type、style（position/size/rotation）、props（组件特有属性）、dataBindings
- `TemplateSchema` 接口：pages（多页）、pageConfig、componentData
- 所有类型导出，供上层包使用

### 2. 数据绑定引擎
- `DataBindingEngine`：接收 dataSet + dataSource，提供 `resolve(template: string): string`
- 支持类型转换：String、Array、Money、BigMoney、BigNumber、CurDateTime、BigCurDate
- 变量语法：`[::fieldName::]`（与 legacy 保持一致）

### 3. 序列化 / 反序列化
- `serialize(template: TemplateSchema): string`（JSON.stringify + `_version: 1` 标记）
- `deserialize(json: string): TemplateSchema`（读取版本号，预留 `migrate(version, schema)` 接口，当前实现为空）
- 版本字段：`_version: number`（当前值为 1）

### 4. 单位换算 & 页面常量
- `PAGE_SIZES`：A1-A7, B1-B7, C1-C7（mm）
- `mmToPx(mm: number): number`（× COMMON_SCALE）
- `pxToMm(px: number): number`（÷ COMMON_SCALE）
- `getPageDimensions(config: PageConfig): { width: number; height: number }`（考虑方向）

### 5. 组件注册表
- `ComponentRegistry`：注册/查询组件类型定义（type → ComponentDefinition）
- `ComponentDefinition`：type、defaultProps、defaultStyle、category
- 内置注册所有 legacy 组件类型（Text、SimpleText、Table、Line、Rect、Circle、Star、Image、QRCode、BarCode、Group）

### 6. 自动分页
- 不在 core 实现，逻辑归属 `@ptd/components`
- core 只暴露 `AutoPageConfig` 类型和纯数值计算（如 `getMaxPageHeight`）

## Acceptance Criteria

- [ ] `pnpm --filter @ptd/core build` 成功，输出 `dist/index.js` + `dist/index.cjs` + `dist/index.d.ts`
- [ ] `pnpm --filter @ptd/core typecheck` 无错误
- [ ] `DataBindingEngine.resolve('[::name::]', {name: 'Alice'}, [...])` 返回 `'Alice'`
- [ ] `serialize(deserialize(json))` 幂等（round-trip 无损）
- [ ] `mmToPx(210)` 返回 `1050`（A4 宽度）
- [ ] `ComponentRegistry.get('Text')` 返回对应 ComponentDefinition
- [ ] 所有类型可被 `@ptd/components` 直接 import 使用

## Definition of Done

- TypeScript strict 模式无错误
- 单元测试覆盖 DataBindingEngine 和序列化（vitest）
- `pnpm build` 绿
- 无 DOM 依赖（Node.js 可运行）

## Out of Scope

- 自动分页逻辑（DOM 依赖，待 components 包决策）
- 渲染到 DOM（属于 components 包）
- 数据源直连（Excel/REST，属于 datasource-refactor 任务）
- 用户认证、后端逻辑

## Technical Notes

- 参考：`legacy/src/components/Viewer/render-util.js` — 数据绑定实现
- 参考：`legacy/src/components/Viewer/viewer-constant.js` — PAGE_SIZE 常量
- 参考：`legacy/src/stores/modules/global.js` — pageConfig schema
- 参考：`legacy/src/components/Viewer/page-generator.js` — 单位换算逻辑
- 构建工具：**tsup**（ESM + CJS + `.d.ts` 一次输出），替换现有 tsc build 脚本
- 测试框架：**vitest**（与 Vite 生态一致，原生 ESM）
