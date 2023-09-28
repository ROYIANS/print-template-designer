import Vue from 'vue'
import layer from '@/stores/modules/layer.js'
import compose from '@/stores/modules/compose.js'
import snapshot from '@/stores/modules/snapshot.js'
import copy from '@/stores/modules/copy.js'
import lock from '@/stores/modules/lock.js'
import store from '@/stores/index.js'

export const state = {
  ...compose.state,
  ...snapshot.state,
  ...copy.state,
  // 编辑器模式 edit preview
  editMode: 'edit',
  pageConfig: {
    // 页面大小
    pageSize: 'A4',
    // 页面方向 l 横向长 p 纵向长
    pageDirection: 'p',
    // 页面位置布局 fixed 固定 relative 相对
    pageLayout: 'fixed',
    // 页面长度：mm
    pageWidth: 210,
    // 页面高度：mm
    pageHeight: 297,
    // 页面当前高度: mm （流式布局）
    pageCurHeight: 297,
    // 页面下边距 mm
    pageMarginBottom: 8,
    // 页面上边距 mm
    pageMarginTop: 8,
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
    fontFamily: 'simhei',
    // 默认行高
    lineHeight: 1
  },
  // 是否在编辑器中，用于判断复制、粘贴组件时是否生效，如果在编辑器外，则无视这些操作
  isInEditor: false,
  componentData: [],
  dataSource: [],
  dataSet: {},
  curComponent: null,
  curTableCell: null,
  curComponentIndex: null,
  // 点击画布时是否点中组件，主要用于取消选中组件用。
  // 如果没点中组件，并且在画布空白处弹起鼠标，则取消当前组件的选中状态
  isClickComponent: false,
  globalCount: 0,
  paletteCount: 0,
  componentsCount: 0,
  curTableSettingId: null
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
    state.curTableCell = null
  },

  setCurTableCell(state, { component }) {
    state.curTableCell = component
  },

  setPageSize(state, { pageSize, w, h }) {
    state.pageConfig.pageSize = pageSize
    state.pageConfig.pageWidth = w
    state.pageConfig.pageHeight = h
  },

  togglePageDirection(state) {
    const direction = state.pageConfig.pageDirection
    state.pageConfig.pageDirection = direction === 'p' ? 'l' : 'p'
  },

  setPageConfig(state, pageConfig) {
    state.pageConfig = pageConfig
    store.commit('printTemplateModule/rulerThings/setRect', {
      w: pageConfig.pageDirection === 'p' ? pageConfig.pageWidth : pageConfig.pageHeight,
      h: pageConfig.pageDirection === 'p' ? pageConfig.pageHeight : pageConfig.pageWidth
    })
    store.commit('printTemplateModule/rulerThings/setReDrawRuler')
  },

  updateDataValue(state, { data, key, value }) {
    data[key] = value
  },

  setPropValue({ componentData }, { propValue, id }) {
    if (componentData.length) {
      let newComponentValue = null
      let newComponentIndex = null
      for (let i = 0; i < componentData.length; i++) {
        if (componentData[i].id === id) {
          newComponentIndex = i
          newComponentValue = componentData[i]
          newComponentValue.propValue = propValue
        }
      }
      if (newComponentIndex !== null) {
        Vue.set(componentData, newComponentIndex, newComponentValue)
        store.commit('printTemplateModule/recordSnapshot')
      }
    }
  },

  setBindValue({ componentData }, { bindValue, id }) {
    if (componentData.length) {
      let newComponentValue = null
      let newComponentIndex = null
      for (let i = 0; i < componentData.length; i++) {
        if (componentData[i].id === id) {
          newComponentIndex = i
          newComponentValue = componentData[i]
          newComponentValue.bindValue = bindValue
        }
      }
      if (newComponentIndex !== null) {
        Vue.set(componentData, newComponentIndex, newComponentValue)
        store.commit('printTemplateModule/recordSnapshot')
      }
    }
  },

  setDataSource(state, dataSource) {
    state.dataSource = dataSource
  },

  setDataSet(state, dataSet) {
    state.dataSet = dataSet
  },

  setCurTableSettingId(state, id) {
    state.curTableSettingId = id
  },

  setShapeStyle({ curComponent }, { top, left, width, height, rotate }) {
    if (!isNaN(top)) {
      curComponent.style.top = Math.round(top)
    }
    if (!isNaN(left)) {
      curComponent.style.left = Math.round(left)
    }
    if (!isNaN(width)) {
      curComponent.style.width = Math.round(width)
    }
    if (!isNaN(height)) {
      curComponent.style.height = Math.round(height)
    }
    if (!isNaN(rotate)) {
      curComponent.style.rotate = Math.round(rotate)
    }
    if (top || left) {
      // FIXME: 只在坐标变化后触发，如果是宽高变化，则在外部的监听器中已经做了处理，这里无需重复执行。
      store.commit('printTemplateModule/setShapePosition', { top, left, width, height })
    }
  },

  setShapePosition({ curComponent }, { top, left, width, height }) {
    if (!curComponent || !curComponent.position) {
      return
    }

    let originWidth = curComponent.position.rx - curComponent.position.lx
    let originHeight = curComponent.position.by - curComponent.position.ty

    // 调整大小和位置后修改 position 信息
    curComponent.position = {
      ...curComponent.position,
      lx: Math.round(!isNaN(left) ? left : curComponent.position.lx),
      ty: Math.round(!isNaN(top) ? top : curComponent.position.ty),
      rx: Math.round(curComponent.position.lx + (width ?? originWidth)),
      by: Math.round(curComponent.position.ty + (height ?? originHeight))
    }
  },

  setShapeSingleStyle({ curComponent }, { key, value }) {
    curComponent.style[key] = value
  },

  setComponentData(state, componentData = []) {
    Vue.set(state, 'componentData', componentData)
  },

  addComponent(state, { component, index }) {
    // 初始化 position 信息
    component.position = {
      lx: component.style.left,
      ty: component.style.top,
      rx: isNaN(component.style.width) ? -Infinity : component.style.left + component.style.width,
      by: isNaN(component.style.height) ? -Infinity : component.style.top + component.style.height
    }

    if (component.position.rx === -Infinity || component.position.by === -Infinity) {
      setTimeout(() => {
        const comEle = document.getElementById(`roy-component-${component.id}`)
        const rect = comEle.getBoundingClientRect()
        component.position = {
          ...component.position,
          rx: component.position.lx + rect.width,
          by: component.position.ty + rect.height
        }
      }, 100)
    }

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
  },

  setGlobalCount(state) {
    state.globalCount++
  },

  setPaletteCount(state) {
    state.paletteCount++
  },

  setComponentsCount(state) {
    state.componentsCount++
  }
}
export const actions = {}
