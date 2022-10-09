import Vue from "vue";
import store from "./stores/index.js";

import App from "./App.vue";
import Element from "element-ui";
import router from "./router";
import PrintDesigner from "./components/index.js";

import "remixicon/fonts/remixicon.css";

Vue.use(Element, { size: "small" });
Vue.use(PrintDesigner, {
  store,
});
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#roy-app");
