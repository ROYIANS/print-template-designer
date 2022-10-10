import CONSTANT from "@/utils/constant.js";
import Big from "big.js";

const { MIN_SCALE, MAX_SCALE } = CONSTANT;

export default {
  namespaced: true,
  state: () => ({
    scale: 1,
    rectWidth: 210,
    rectHeight: 297,
    needReDrawRuler: 0,
  }),
  mutations: {
    setScale(state, payload) {
      state.scale = payload.scale;
    },
    setBiggerScale(state) {
      let currentScale = new Big(state.scale);
      let stepScale = new Big(0.1);
      let nextScale = currentScale.plus(stepScale).toNumber();
      state.scale = nextScale > MAX_SCALE ? MAX_SCALE : nextScale;
    },
    setSmallerScale(state) {
      let currentScale = new Big(state.scale);
      let stepScale = new Big(0.1);
      let nextScale = currentScale.minus(stepScale).toNumber();
      state.scale = nextScale < MIN_SCALE ? MIN_SCALE : nextScale;
    },
    setReDrawRuler(state) {
      state.needReDrawRuler += 1;
    },
    setRect(state, payload) {
      state.rectWidth = payload.w;
      state.rectHeight = payload.h;
    },
    rotateRect(state) {
      const tmpHeight = state.rectHeight;
      state.rectHeight = Number(state.rectWidth);
      state.rectWidth = Number(tmpHeight);
    },
  },
  actions: {
    setBiggerScale({ commit }) {
      commit("setBiggerScale");
    },
    setSmallerScale({ commit }) {
      commit("setSmallerScale");
    },
    setScale({ commit }, scale) {
      commit("setScale", { scale });
    },
    reDrawRuler({ commit }) {
      commit("setReDrawRuler");
    },
    setRect({ commit }, rect) {
      commit("setRect", rect);
    },
    rotateRect({ commit }) {
      commit("rotateRect");
    },
  },
};
