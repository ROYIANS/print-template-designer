<div align='center'>
<h1>print-template-designer</h1>
<img src='README.assets/favicon.ico' alt='print-template-designer - A vue2 component for design a page for print' width='150'/>
</div>

<center>
一个使用Vue2的组件，用于设计打印页面模板。
</center>
<center>
A vue2 component for design a page for print <b>print-template-designer</b><br>
</center>

## 特性

- ⚡ 冲冲冲

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
import VXETable from 'vxe-table'

Vue.use(VXETable)

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
      :pre-data-set="preDataSet"
      :config="printTemplateConfig"
    />
    <ptd-viewer
      v-if="viewerVisible"
      :visible.sync="viewerVisible"
      :component-data="componentData"
      :page-config="pageConfig"
      :data-set="preDataSet"
      :data-source="dataSource"
      :need-toast="needToast"
      :direct-export="directExport"
      :file-name="fileName"
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

1. roy-designer-header-slot

标题栏右侧按钮区域插槽

2. roy-designer-toolbar-slot

设计器上方工具栏插槽

## 必要外部依赖库

需要安装以下依赖才可使用:

- vue
- vuex
- remixicon
- vxe-table@legacy
- shepherd.js
- xe-utils

## API

### PTD-Designer Props

| 名称               | 类型                  | 默认值     | 说明                                                                    |
|------------------|---------------------|---------|-----------------------------------------------------------------------|
| preComponentData | `array \| boolean`  | `false` | 预设页面组件                                                                |
| prePageConfig    | `object \| boolean` | `false` | 预设页面全局配置                                                              |
| preDataSource    | `array \| boolean`  | `false` | 预设数据源                                                                 |
| preDataSet       | `object \| boolean` | `false` | 预设数据集                                                                 |
| config           | `object`            | `{}`    | 设计器配置，toolbarConfig: { buttons: 展示哪些按钮， showNightMode: 是否显示夜间模式切换按钮 } |

### PTD-Viwer Props

| 名称            | 类型                  | 默认值                 | 说明                                   |
|---------------|---------------------|---------------------|--------------------------------------|
| visible       | `boolean`           | `true`              | 展示预览窗口                               |
| componentData | `array`             | `[]`                | 设计器中的组件数据                            |
| pageConfig    | `object`            | `{}`                | 设计器中模板全局配置信息                         |
| dataSource    | `array`             | `[]`                | 模板数据源配置信息                            |
| dataSet       | `object`            | `{}`                | 数据集合，动态数据信息                          |
| fileName      | `string`            | `''`                | 导出PDF文件名，如果为空则为模板名                   |
| directExport  | `boolean`           | `false`             | 打开窗口后直接进行渲染下载为PDF                    |
| needToast     | `string \| boolean` | `'建议导出PDF后再打印，更精准'` | 导出PDF后页面提示信息，为false时不提示。否则提示传入的字符串内容 |

## 参考项目与文章

- [report-designer](https://github.com/xinglie/report-designer)
- [printer-editor](https://github.com/xinglie/printer-editor)
- [visual-drag-demo](https://github.com/woai3c/visual-drag-demo)
- [vue-email-editor](https://github.com/unlayer/vue-email-editor)
- [slatejs 编辑器表格---选区](https://juejin.cn/post/7077766418841731108)
- [slatejs 编辑器表格---合并单元格](https://juejin.cn/post/7080046216259567646)
- [slatejs 编辑器表格---拆分单元格](https://juejin.cn/post/7080710896082747399)
- [slatejs 编辑器表格---插入行](https://juejin.cn/post/7118925563858780174)

## TODO

以下是待办列表，写一些接下来该项目要干的事：

- [x] 基本功能

- [x] 剔除ElementUI

- [ ] BUG修复

- [ ] 扩展功能（快捷键、撤销恢复等）

- [ ] 调整部分组件的渲染逻辑

- [ ] 重构 （同时支持Vue2和Vue3）

## Statics

![Alt](https://repobeats.axiom.co/api/embed/dd83a2eca0ff7a4c1772a68c4691980199f7caef.svg "Repobeats analytics image")

[![Star History Chart](https://api.star-history.com/svg?repos=ROYIANS/print-template-designer&type=Date)](https://star-history.com/#ROYIANS/print-template-designer&Date)


