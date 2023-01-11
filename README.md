# print-template-designer
A vue2 component for design a page for print / 一个使用Vue2的组件，用于设计打印页面模板。

![Alt](https://repobeats.axiom.co/api/embed/dd83a2eca0ff7a4c1772a68c4691980199f7caef.svg "Repobeats analytics image")

## Priview | 预览

[Click Here | 点击这里预览](https://royians.github.io/print-template-designer/)

## 仅个人研究学习用，并不保证可用性和健壮性

本项目为本人在学习可视化的学习探索项目，是个DEMO。写的也还不成熟，希望可以多多提建议。主要参考了文末几位dalao的项目和文章，在此基础上进行编写代码。主要是为了锻炼自己的代码能力和设计能力。

## 截图

![image.png](https://s2.loli.net/2022/11/29/mBilHMz8xuZeL3Y.png)
![image.png](https://s2.loli.net/2022/11/29/7Qpzd1N4XZDu9xE.png)
![image.png](https://s2.loli.net/2022/11/29/iPSO9GJQv41YZlj.png)
![image.png](https://s2.loli.net/2022/11/29/kQZwCrS41m6THAh.png)

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
import 'vxe-table/lib/style.css'
import 'element-ui/lib/theme-chalk/index.css'
import VXETable from 'vxe-table'
import Element from 'element-ui'

Vue.use(VXETable)
Vue.use(Element, { size: 'mini' })

Vue.use(PrintTemplateDesigner, { store })
// 需要全局设置$VXETable、$XModal用于注册渲染器等逻辑。
Vue.prototype.$VXETable = VXETable
Vue.prototype.$XModal = VXETable.modal
```

app.vue
```vue
<template>
  <div>
    <ptd-designer
      ref="designer"
      :pre-component-data="preComponentData"
      :pre-page-config="prePageConfig"
      :pre-data-source="preDataSource"
      :config="printTemplateConfig"
    />
    <ptd-viewer
      v-if="viewerVisible"
      :visible.sync="viewerVisible"
      :component-data="componentData"
      :page-config="pageConfig"
      :data-set="preDataSet"
      :data-source="dataSource"
    />
  </div>
</template>

<script>
export default {
  name: 'APP',
  // ......
}
</script>
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
- vxe-table@legacy
- shepherd.js
- xe-utils

## 参考项目

- [report-designer](https://github.com/xinglie/report-designer)
- [printer-editor](https://github.com/xinglie/printer-editor)
- [visual-drag-demo](https://github.com/woai3c/visual-drag-demo)
- [vue-email-editor](https://github.com/unlayer/vue-email-editor)

## 参考文章

- [slatejs 编辑器表格---选区](https://juejin.cn/post/7077766418841731108)
- [slatejs 编辑器表格---合并单元格](https://juejin.cn/post/7080046216259567646)
- [slatejs 编辑器表格---拆分单元格](https://juejin.cn/post/7080710896082747399)
- [slatejs 编辑器表格---插入行](https://juejin.cn/post/7118925563858780174)

## TODO

以下是待办列表，写一些接下来该项目要干的事：

[√] 基本功能
