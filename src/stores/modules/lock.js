import Vue from 'vue'

export default {
  mutations: {
    lock({ curComponent }) {
      Vue.set(curComponent, 'isLock', true)
    },

    unlock({ curComponent }) {
      Vue.set(curComponent, 'isLock', false)
    }
  }
}
