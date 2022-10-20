/*
 * @Author: ROYIANS
 * @Date: 2022/10/18 17:42
 * @Description:
 * @sign:
 * ╦═╗╔═╗╦ ╦╦╔═╗╔╗╔╔═╗
 * ╠╦╝║ ║╚╦╝║╠═╣║║║╚═╗
 * ╩╚═╚═╝ ╩ ╩╩ ╩╝╚╝╚═╝
 */
export const commonStyle = {
  rotate: 0,
  opacity: 1
}

export const commonAttr = {
  groupStyle: {}, // 当一个组件成为 Group 的子组件时使用
  isLock: false // 是否锁定组件
}

export const componentList = [
  {
    icon: 'ri-text',
    code: 'text',
    name: '文本',
    component: 'RoySimpleText',
    propValue: '双击编辑文本',
    style: {
      width: 200,
      height: 50,
      fontSize: 10,
      background: 'transparent',
      rotate: 0
    },
    groupStyle: {}
  },
  {
    icon: 'ri-t-box-line',
    code: 'long-text',
    name: '长文本',
    component: 'RoyText',
    propValue:
      '<p><span style="font-size: 16pt; font-family: 仿宋;">双击</span><span style="color: rgb(255, 255, 255); background-color: rgb(0, 0, 0); font-size: 16pt; font-family: 仿宋;">编辑</span><span style="font-size: 16pt; font-family: 仿宋;">文本</span></p>',
    style: {
      width: 500,
      height: 200,
      fontSize: 12,
      background: 'transparent',
      rotate: 0
    },
    groupStyle: {}
  },
  {
    icon: 'ri-table-line',
    code: 'table',
    name: '表格',
    component: 'RoyTable'
  },
  {
    icon: 'ri-layout-2-line',
    code: 'form',
    name: '表单',
    component: 'RoyForm'
  },
  {
    icon: 'iconfont icon-xianduan',
    code: 'line',
    name: '直线',
    component: 'RoyLine'
  },
  {
    icon: 'iconfont icon-xingzhuang-juxing',
    code: 'rectangle',
    name: '矩形',
    component: 'RoyRect'
  },
  {
    icon: 'iconfont icon-xingzhuang-sanjiaoxing',
    code: 'triangle',
    name: '三角形',
    component: 'RoyTri'
  },
  {
    icon: 'iconfont icon-xingzhuang-tuoyuanxing',
    code: 'circle',
    name: '圆形',
    component: 'RoyCircle'
  }
]
