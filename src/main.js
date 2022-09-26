import Vue from "vue";
import { createPinia, PiniaVuePlugin } from "pinia";

import App from "./App.vue";
import Element from "element-ui";
import router from "./router";
import { VTree } from "vue-tree-halower2";

import "./assets/main.scss";
import "normalize.css/normalize.css";
import "animate.css";
import "./assets/theme/index.css";
import "remixicon/fonts/remixicon.css";
import "vue-tree-halower2/dist/halower-tree.min.css"; // 你可以自定义树的样式

Vue.use(PiniaVuePlugin);
Vue.use(Element);
Vue.use(VTree);

new Vue({
  router,
  pinia: createPinia(),
  render: (h) => h(App),
}).$mount("#app");
