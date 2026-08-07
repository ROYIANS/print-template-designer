# `@ptd/react-ui`

Foliq 配置界面的 React headless 基础组件。组件使用 Radix Primitives 提供键盘、焦点、选择和
ToggleGroup 语义，视觉层由包内 PTD theme token 与 CSS Modules 实现，不引入 Radix Themes。

## 使用

```tsx
import { PtdSegmented, PtdSelect } from '@ptd/react-ui'
import '@ptd/react-ui/styles.css'

<PtdSegmented
  label="页面方向"
  value="p"
  options={[
    { value: 'p', label: '纵向' },
    { value: 'l', label: '横向' },
  ]}
  onValueChange={setDirection}
/>

<PtdSelect
  label="纸张规格"
  value="A4"
  options={[
    { value: 'A4', label: 'A4 · 210 × 297 mm' },
    { value: 'custom', label: '自定义尺寸' },
  ]}
  onValueChange={setPageSize}
/>
```

`PtdField` 只提供字段标签、布局和状态壳层；组件不依赖 EditorStore，不写模板 Schema，也不管理
history。业务宿主负责 `beginGesture`、`commitGesture`、`cancelGesture` 和业务值校验。

第一阶段只包含 `PtdField`、`PtdSelect` 和 `PtdSegmented`。文本/数字输入与颜色字段保留在各自业务
面板中，后续切片会在行为 parity 验证后再迁移。

默认 theme 通过 `[data-ptd-theme]` 和 `--ptd-*` token 提供；未来可增加主题变体，但当前包不提供
ThemeProvider 或主题切换运行时。
