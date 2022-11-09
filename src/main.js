import Vue from 'vue'
import store from './stores/index.js'

import App from './App.vue'
import Element from 'element-ui'
import router from './router'
import PrintDesigner from './components/index.js'

import 'remixicon/fonts/remixicon.css'
import 'element-ui/lib/theme-chalk/index.css'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

Vue.use(Element, { size: 'mini' })
Vue.use(VXETable)
Vue.use(PrintDesigner, {
  store
})
Vue.prototype.$VXETable = VXETable
Vue.prototype.$XModal = VXETable.modal
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#roy-app')
