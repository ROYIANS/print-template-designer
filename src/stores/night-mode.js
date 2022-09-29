import { defineStore } from "pinia";
import CONSTANT from "@/utils/constant.js";

const { STORAGE_PREFIX } = CONSTANT;

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
      window.localStorage.setItem(
        `${STORAGE_PREFIX}NIGHT_MODE`,
        JSON.stringify(nightMode)
      );
      document.body.setAttribute("theme", nightMode ? "dark" : "day");
    },
    initNightMode() {
      const nightMode = window.localStorage.getItem(
        `${STORAGE_PREFIX}NIGHT_MODE`
      );
      if (nightMode !== null) {
        this.toggleNightMode(JSON.parse(nightMode));
      }
    },
  },
});
