import CONSTANT from '@/utils/constant.js'
import Big from 'big.js'

const { MIN_SCALE, MAX_SCALE } = CONSTANT

export default {
  namespaced: true,
  state: () => ({
    // 这里的scale应该是乘以5以后的
    scale: 5,
    rectWidth: 210,
    rectHeight: 297,
    needReDrawRuler: 0,
    showRuler: true
  }),
  mutations: {
    setScale(state, payload) {
      let nextScale = new Big(payload.scale)
      state.scale = new Big(nextScale).times(new Big(5)).toNumber()
    },
    setBiggerScale(state) {
      let currentScaleTime5 = new Big(state.scale)
      let currentScale = currentScaleTime5.div(new Big(5))
      let stepScale = new Big(0.1)
      let nextScale = currentScale.plus(stepScale).toNumber()
      let myNextScale = nextScale > MAX_SCALE ? MAX_SCALE : nextScale
      state.scale = new Big(myNextScale).times(new Big(5)).toNumber()
    },
    setSmallerScale(state) {
      let currentScaleTime5 = new Big(state.scale)
      let currentScale = currentScaleTime5.div(new Big(5))
      let stepScale = new Big(0.1)
      let nextScale = currentScale.minus(stepScale).toNumber()
      let myNextScale = nextScale < MIN_SCALE ? MIN_SCALE : nextScale
      state.scale = new Big(myNextScale).times(new Big(5)).toNumber()
    },
    setReDrawRuler(state) {
      state.needReDrawRuler += 1
    },
    setRect(state, payload) {
      state.rectWidth = payload.w
      state.rectHeight = payload.h
    },
    rotateRect(state) {
      const tmpHeight = state.rectHeight
      state.rectHeight = Number(state.rectWidth)
      state.rectWidth = Number(tmpHeight)
    },
    toggleRuler(state) {
      state.showRuler = !state.showRuler
    }
  },
  actions: {
    setBiggerScale({ commit }) {
      commit('setBiggerScale')
    },
    setSmallerScale({ commit }) {
      commit('setSmallerScale')
    },
    setScale({ commit }, scale) {
      commit('setScale', { scale })
    },
    reDrawRuler({ commit }) {
      commit('setReDrawRuler')
    },
    setRect({ commit }, rect) {
      commit('setRect', rect)
    },
    rotateRect({ commit }) {
      commit('rotateRect')
    },
    toggleRuler({ commit }) {
      commit('toggleRuler')
    }
  }
}
