import { state, mutations, actions, getters } from "./global.js";
import nightMode from "./night-mode.js";
import rulerThings from "@/stores/modules/ruler-things.js";

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
  modules: {
    nightMode,
    rulerThings,
  },
};
