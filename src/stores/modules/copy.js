import store from '../index.js'
import toast from '@/utils/toast'
import generateID from '@/utils/generateID'
import { deepCopy } from '@/utils/html-util.js'

export default {
  state: {
    copyData: null, // 复制粘贴剪切
    isCut: false,
    menuTop: 0, // 右击菜单数据
    menuLeft: 0
  },
  mutations: {
    copy(state) {
      if (!state.curComponent) {
        toast('请选择组件')
        return
      }

      // 如果有剪切的数据，需要先还原
      restorePreCutData(state)
      copyData(state)

      state.isCut = false
    },

    paste(state, isMouse) {
      if (!state.copyData) {
        toast('请选择组件')
        return
      }

      const data = state.copyData.data

      if (isMouse) {
        data.style.top = state.menuTop
        data.style.left = state.menuLeft
      } else {
        data.style.top += 10
        data.style.left += 10
      }

      data.id = generateID()
      data.label = `${data.name}-${data.id}`
      store.commit('printTemplateModule/addComponent', {
        component: deepCopy(data)
      })
      if (state.isCut) {
        state.copyData = null
      }
    },

    cut(state) {
      if (!state.curComponent) {
        toast('请选择组件')
        return
      }

      // 如果重复剪切，需要恢复上一次剪切的数据
      restorePreCutData(state)
      copyData(state)

      store.commit('printTemplateModule/deleteComponent')
      state.isCut = true
    },

    showContextMenu(state, { top, left }) {
      state.menuTop = top
      state.menuLeft = left
    }
  }
}

// 恢复上一次剪切的数据
function restorePreCutData(state) {
  if (state.isCut && state.copyData) {
    const data = deepCopy(state.copyData.data)
    const index = state.copyData.index
    store.commit('addComponent', { component: data, index })
    if (state.curComponentIndex >= index) {
      // 如果当前组件索引大于等于插入索引，需要加一，因为当前组件往后移了一位
      state.curComponentIndex++
    }
  }
}

function copyData(state) {
  state.copyData = {
    data: deepCopy(state.curComponent),
    index: state.curComponentIndex
  }
}
