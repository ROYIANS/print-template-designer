import { actions, getters, mutations, state } from './global.js'
import nightMode from './night-mode.js'
import rulerThings from './ruler-things.js'

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
  modules: {
    nightMode,
    rulerThings
  }
}
