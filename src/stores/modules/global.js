import Vue from 'vue'
import layer from '@/stores/modules/layer.js'
import compose from '@/stores/modules/compose.js'
import snapshot from '@/stores/modules/snapshot.js'
import copy from '@/stores/modules/copy.js'
import lock from '@/stores/modules/lock.js'

export const state = {
  ...compose.state,
  ...snapshot.state,
  ...copy.state,
  // 编辑器模式 edit preview
  editMode: 'edit',
  pageConfig: {
    // 页面大小
    pageSize: 'A4',
    // 页面方向 h 横向长 v 纵向长
    pageDirection: 'h',
    // 页面标题/模板标题
    title: '新建模板',
    // 默认缩放比例：100%
    scale: 1,
    // 页面背景
    background: '#ffffff',
    // 默认字体颜色
    color: '#212121',
    // 默认字号
    fontSize: 12,
    // 默认字体
    fontFamily: 'Microsoft YaHei'
  },
  // 是否在编辑器中，用于判断复制、粘贴组件时是否生效，如果在编辑器外，则无视这些操作
  isInEditor: false,
  componentData: [],
  curComponent: null,
  curComponentIndex: null,
  // 点击画布时是否点中组件，主要用于取消选中组件用。
  // 如果没点中组件，并且在画布空白处弹起鼠标，则取消当前组件的选中状态
  isClickComponent: false
}
export const getters = {}
export const mutations = {
  ...layer.mutations,
  ...compose.mutations,
  ...snapshot.mutations,
  ...copy.mutations,
  ...lock.mutations,
  setClickComponentStatus(state, status) {
    state.isClickComponent = status
  },

  setEditMode(state, mode) {
    state.editMode = mode
  },

  setInEditorStatus(state, status) {
    state.isInEdiotr = status
  },

  setCanvasStyle(state, style) {
    state.canvasStyleData = style
  },

  setCurComponent(state, { component, index }) {
    state.curComponent = component
    state.curComponentIndex = index
  },

  setPropValue({ curComponent }, propValue) {
    Vue.set(curComponent, 'propValue', propValue)
  },

  setShapeStyle({ curComponent }, { top, left, width, height, rotate }) {
    if (top) {
      curComponent.style.top = Math.round(top)
    }
    if (left) {
      curComponent.style.left = Math.round(left)
    }
    if (width) {
      curComponent.style.width = Math.round(width)
    }
    if (height) {
      curComponent.style.height = Math.round(height)
    }
    if (rotate) {
      curComponent.style.rotate = Math.round(rotate)
    }
  },

  setShapeSingleStyle({ curComponent }, { key, value }) {
    curComponent.style[key] = value
  },

  setComponentData(state, componentData = []) {
    Vue.set(state, 'componentData', componentData)
  },

  addComponent(state, { component, index }) {
    if (index !== undefined) {
      state.componentData.splice(index, 0, component)
    } else {
      state.componentData.push(component)
    }
  },

  deleteComponent(state, index) {
    if (index === undefined) {
      index = state.curComponentIndex
    }

    if (index === state.curComponentIndex) {
      state.curComponentIndex = null
      state.curComponent = null
    }

    if (/\d/.test(index)) {
      state.componentData.splice(index, 1)
    }
  }
}
export const actions = {}
