import { defineStore } from "pinia";

export const nightModeStore = defineStore({
  id: "nightMode",
  state: () => ({
    isNightMode: false,
  }),
  getters: {
    getIsNightMode: (state) => state.isNightMode,
  },
  actions: {
    toggleNightMode(nightMode) {
      this.isNightMode = nightMode;
    },
  },
});
