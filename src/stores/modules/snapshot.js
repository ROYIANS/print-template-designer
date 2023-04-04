import store from '../index.js'
import { deepCopy } from '@/utils/html-util.js'
import toast from '@/utils/toast'

const MAX_SNAP_SHOT_LENGTH = 3

// 设置画布默认数据 https://github.com/woai3c/visual-drag-demo/issues/92
let defaultComponentData = []

function getDefaultComponentData() {
  return defaultComponentData
}

export function setDefaultComponentData(data = []) {
  defaultComponentData = data
}

export default {
  state: {
    snapshotData: [], // 编辑器快照数据
    snapshotIndex: -1 // 快照索引
  },
  mutations: {
    undo(state) {
      if (state.snapshotIndex >= 1) {
        state.snapshotIndex--
        const componentData =
          deepCopy(state.snapshotData[state.snapshotIndex]) || getDefaultComponentData()
        if (state.curComponent) {
          // 如果当前组件不在 componentData 中，则置空
          const needClean = !componentData.find(
            (component) => state.curComponent.id === component.id
          )

          if (needClean) {
            store.commit('printTemplateModule/setCurComponent', {
              component: null,
              index: null
            })
          }
        }

        store.commit('printTemplateModule/setComponentData', componentData)
      } else {
        toast('不能再撤销了')
      }
    },

    redo(state) {
      if (state.snapshotIndex < state.snapshotData.length - 1) {
        state.snapshotIndex++
        store.commit(
          'printTemplateModule/setComponentData',
          deepCopy(state.snapshotData[state.snapshotIndex])
        )
      } else {
        toast('不能再恢复了')
      }
    },

    recordSnapshot(state) {
      // 添加新的快照
      state.snapshotData[++state.snapshotIndex] = deepCopy(state.componentData)
      // 在 undo 过程中，添加新的快照时，要将它后面的快照清理掉
      if (state.snapshotIndex < state.snapshotData.length - 1) {
        state.snapshotData = state.snapshotData.slice(0, state.snapshotIndex + 1)
      }
      if (state.snapshotData.length > MAX_SNAP_SHOT_LENGTH) {
        // 只保留最近50次操作
        state.snapshotData = state.snapshotData.slice(1)
        state.snapshotIndex--
      }
    }
  }
}
