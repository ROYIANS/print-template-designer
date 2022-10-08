import { state, mutations, actions, getters } from "./global.js";
import nightMode from "./night-mode.js";

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
  modules: {
    nightMode,
  },
};
