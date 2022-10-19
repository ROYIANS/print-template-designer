import CONSTANT from '@/utils/constant.js'

const { STORAGE_PREFIX } = CONSTANT

export default {
  namespaced: true,
  state: () => ({
    isNightMode: false
  }),
  mutations: {
    setIsNightMode(state, payload) {
      state.isNightMode = payload.isNightMode
    }
  },
  actions: {
    toggleNightMode({ commit }, isNightMode) {
      window.localStorage.setItem(
        `${STORAGE_PREFIX}NIGHT_MODE`,
        JSON.stringify(isNightMode)
      )
      document
        .getElementById('roy-print-template-designer')
        .setAttribute('theme', isNightMode ? 'dark' : 'day')
      commit('setIsNightMode', {
        isNightMode
      })
    },
    async initNightMode({ dispatch }) {
      const nightMode = window.localStorage.getItem(
        `${STORAGE_PREFIX}NIGHT_MODE`
      )
      if (nightMode !== null) {
        await dispatch('toggleNightMode', JSON.parse(nightMode))
      }
    }
  }
}
