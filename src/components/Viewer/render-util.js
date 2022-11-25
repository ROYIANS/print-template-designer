/*
 * @Author: ROYIANS
 * @Date: 2022/11/25 16:40
 * @Description:
 * @sign:
 * ╦═╗╔═╗╦ ╦╦╔═╗╔╗╔╔═╗
 * ╠╦╝║ ║╚╦╝║╠═╣║║║╚═╗
 * ╩╚═╚═╝ ╩ ╩╩ ╩╝╚╝╚═╝
 */
export const RenderUtil = {
  wait: (time = 10) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  },
  replaceTextWithDataSource: (value, dataSet, dataSource) => {
    console.log(dataSource)
    return `${value}`.replace(/\[::[^[\]:]*::]/g, (word) => {
      const field = word.substring(3, word.length - 3)
      if (dataSet[field] && dataSet[field] instanceof Function) {
        return dataSet[field]()
      }
      return dataSet[field]
    })
  }
}
