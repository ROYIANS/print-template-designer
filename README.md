# print-template-designer
A vue2 component for design a page for print / 一个使用Vue2的组件，用于设计打印页面模板。

## Priview | 预览

[Click Here | 点击这里预览](https://royians.github.io/print-template-designer/)

## 仅个人研究学习用

本项目为本人在学习可视化的学习探索项目，是个DEMO。写的也还不成熟，希望可以多多提建议。主要参考了文末几位dalao的项目和文章。

## 截图

![image.png](https://s2.loli.net/2022/10/21/nBx2zugcJZDYMIt.png)

## 安装

```shell
npm install print-template-designer --save
```

main.js

```javascript
import store from './store'
import PrintTemplateDesigner from 'print-template-designer'
import 'print-template-designer/lib/print-template-designer.css'
import "remixicon/fonts/remixicon.css";

Vue.use(PrintTemplateDesigner, { store })
```

app.vue
```vue
<template>
  <ptd-designer />
</template>
```

## 插槽

### roy-designer-header-slot

标题栏右侧按钮区域插槽

### roy-designer-toolbar-slot

设计器上方工具栏插槽

## 必要外部依赖库

可能需要安装以下依赖才可使用:

- vue
- vuex
- element-ui
- remixicon
- @wangeditor/editor
- @wangeditor/editor-for-vue
- vxe-table

## 参考项目

- [report-designer](https://github.com/xinglie/report-designer)
- [printer-editor](https://github.com/xinglie/printer-editor)
- [visual-drag-demo](https://github.com/woai3c/visual-drag-demo)
- [vue-email-editor](https://github.com/unlayer/vue-email-editor)
