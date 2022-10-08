# print-template-designer
A vue2 component for design a page for print / 一个使用Vue2的组件，用于设计打印页面模板。

## Priview | 预览

[Click Here | 点击这里预览](https://royians.github.io/print-template-designer/)

## 仅个人学习用

本项目为本人学习可视化的简单学习探索项目，是个DEMO。写的也还不成熟，希望可以多多提建议。

## 安装

```shell
npm install print-template-designer --save
```

main.js

```javascript
import store from './store'
import PrintTemplateDesigner from 'print-template-designer'
import 'print-template-designer/lib/style.css'

Vue.use(PrintTemplateDesigner, { store })
```

app.vue
```vue
<template>
  <ptd-designer />
</template>
```

## 必要外部依赖

需要安装以下依赖才可使用:

- element-ui
- vuex

## 项目依赖

- @scena/ruler
- @svgdotjs/svg.js
- animate.css
- element-ui
- html2canvas
- lodash
- normalize.css
- remixicon
- vue
- vue-router
- vue-splitpane
- vue-tree-halower2
- vuedraggable
- vuex
