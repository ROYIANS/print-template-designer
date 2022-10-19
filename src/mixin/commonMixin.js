import { nanoid } from 'nanoid'

export default {
  methods: {
    deepCopy(obj, cache = []) {
      if (obj === null || typeof obj !== 'object') {
        return obj
      }
      const objType = Object.prototype.toString.call(obj).slice(8, -1)
      // 考虑 正则对象的copy
      if (objType === 'RegExp') {
        return new RegExp(obj)
      }
      // 考虑 Date 实例 copy
      if (objType === 'Date') {
        return new Date(obj)
      }
      // 考虑 Error 实例 copy
      if (objType === 'Error') {
        return new Error(obj)
      }
      const hit = cache.filter((c) => c.original === obj)[0]
      if (hit) {
        return hit.copy
      }
      const copy = Array.isArray(obj) ? [] : {}
      cache.push({ original: obj, copy })
      Object.keys(obj).forEach((key) => {
        copy[key] = this.deepCopy(obj[key], cache)
      })
      return copy
    },
    getUuid(length = 8) {
      return nanoid(length)
    },
    isBlank(value) {
      return value === undefined || value === null || value === ''
    },
    /**
     * 通过name查找父组件
     * @param {*} vueIns
     * @param {*} name
     */
    findParentComponent(vueIns, name) {
      let parent = vueIns.$parent
      while (parent) {
        let componentName =
          parent.$options.componentName || parent.$options.name
        if (componentName !== name) {
          parent = parent.$parent
        } else {
          return parent
        }
      }
      return false
    }
  }
}
