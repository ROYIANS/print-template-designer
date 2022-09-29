import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: import.meta.env.BASE_URL,
  routes: routes,
});

export default router;
