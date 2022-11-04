/*
 * @Author: ROYIANS
 * @Date: 2022/9/30 9:42
 * @Description: 组件注册
 * @sign:
 * ╦═╗╔═╗╦ ╦╦╔═╗╔╗╔╔═╗
 * ╠╦╝║ ║╚╦╝║╠═╣║║║╚═╗
 * ╩╚═╚═╝ ╩ ╩╩ ╩╝╚╝╚═╝
 */
import PtdDesigner from './Main/Home.vue'

import 'normalize.css/normalize.css'
import 'animate.css'
import '@/assets/main.scss'
import '@/assets/iconfont/iconfont.css'

import NightModeStore from '../stores/modules/index.js'

const componentsLib = {
  PtdDesigner
}
const install = function (Vue, opts = {}) {
  if (install.installed) {
    return
  }
  if (!opts.store) {
    console.warn('[print-template-designer] 请提供store！')
    return
  }
  if (!opts.store.state.printTemplateModule) {
    // 注册module
    opts.store.registerModule(['printTemplateModule'], NightModeStore)
  }
  Object.keys(componentsLib).forEach((key) => {
    // 注册组件
    Vue.component(key, componentsLib[key])
  })
}
const Api = {
  version: 'ROY-PRINT-DESIGNER@0.0.13-dev',
  install
}
// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
export default Api
