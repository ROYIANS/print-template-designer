import Vue from "vue";
import { createPinia, PiniaVuePlugin } from "pinia";

import App from "./App.vue";
import Element from "element-ui";
import router from "./router";

import "./assets/main.scss";
import "normalize.css/normalize.css";
import "animate.css";
import "./assets/theme/index.css";
import "remixicon/fonts/remixicon.css";

Vue.use(PiniaVuePlugin);
Vue.use(Element);

new Vue({
  router,
  pinia: createPinia(),
  render: (h) => h(App),
}).$mount("#app");
