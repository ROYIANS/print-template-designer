/*
 * @Author: ROYIANS
 * @Date: 2022/11/25 16:36
 * @Description:
 * @sign:
 * ╦═╗╔═╗╦ ╦╦╔═╗╔╗╔╔═╗
 * ╠╦╝║ ║╚╦╝║╠═╣║║║╚═╗
 * ╩╚═╚═╝ ╩ ╩╩ ╩╝╚╝╚═╝
 */
import html2canvas from 'html2canvas'

const SCALE = devicePixelRatio * 2

export class AutoSplitText {
  constructor(toSplitElement) {
    this.toSplitElement = toSplitElement
  }

  async run() {
    return await this.splitText()
  }

  async splitText() {
    let canvasThing = await html2canvas(this.toSplitElement, {
      scale: SCALE
    })
    const arrSelection = this.generateRangeSelection(
      [this.toSplitElement],
      this.toSplitElement.getBoundingClientRect()
    )
    const someThing = this.getSomeThing(this.toSplitElement.getBoundingClientRect(), arrSelection)
    return this.getCanvasList(someThing, canvasThing, SCALE)
  }

  getSomeThing(rect, selection) {
    let res = []
    const myFunc = (select) => {
      let useS = null
      let offsetY = select.y + select.height
      let offset = true
      for (let se of selection) {
        if (se.y + se.height > offsetY && se.y < offsetY) {
          offset = false
          break
        }
        if (se.y >= offsetY) {
          if (useS === null || se.y < useS) {
            useS = se.y
          }
        }
      }
      if (offset) {
        let newOffsetY = offsetY - rect.y
        if (useS !== null) {
          useS -= rect.y
          newOffsetY += (useS - newOffsetY) / 2
        }
        if (!res.includes(newOffsetY)) {
          res.push(newOffsetY)
        }
      }
    }
    for (let el of selection) {
      myFunc(el)
    }
    return res.sort((t, e) => t - e)
  }

  getCanvasList(smThing, canvasThing, pixelRatio) {
    let canvasImageList = []
    let canvasEl = document.createElement('canvas')
    let canvasContext = canvasEl.getContext('2d')
    let aIn = 0
    let elementWidth = canvasThing.width
    canvasEl.width = elementWidth
    smThing[smThing.length - 1] = canvasThing.height / pixelRatio
    let renderImg = (ele) => {
      let eleHeight = (ele - aIn) * pixelRatio
      if (eleHeight > 0) {
        canvasEl.height = eleHeight
        canvasContext.drawImage(
          canvasThing,
          0,
          aIn * pixelRatio,
          elementWidth,
          eleHeight,
          0,
          0,
          elementWidth,
          eleHeight
        )
        canvasImageList.push({
          src: canvasEl.toDataURL('image/png', 1),
          width: elementWidth / pixelRatio,
          height: eleHeight / pixelRatio
        })
      }
      canvasContext.clearRect(0, 0, elementWidth, eleHeight)
      aIn = ele
    }
    for (let ele of smThing) {
      renderImg(ele)
    }
    return canvasImageList
  }

  generateRangeSelection(elements, { y: elY, height: elH }) {
    const range = document.createRange()
    const selections = []
    const drawRange = (node) => {
      scrollTo(0, 0)
      if (node.nodeType === 3) {
        for (let i = 0; i < node.length; i++) {
          range.setStart(node, i)
          range.setEnd(node, i + 1)
          pushSelectRange(selections, range)
        }
      } else {
        range.setStartBefore(node)
        range.setEndAfter(node)
        pushSelectRange(selections, range)
      }
    }
    const pushSelectRange = (arr, range) => {
      let rect = range.getBoundingClientRect()
      if (rect.height) {
        const key = `${rect.y}~${rect.height}`
        if (!arr[key]) {
          arr[key] = true
          arr.push({
            y: scrollY + rect.y,
            height: rect.height
          })
        }
      }
    }

    const getRangesForElement = (nodes) => {
      for (let node of nodes) {
        if (node.nodeType === 3) {
          drawRange(node)
        } else if (node.nodeType === 1) {
          if (node.childNodes.length) {
            getRangesForElement(node.childNodes)
          } else if (!['TD', 'BR', 'TH', 'P', 'DIV'].includes(node.tagName.toUpperCase())) {
            drawRange(node)
          }
        }
      }
    }

    getRangesForElement(elements)
    selections.sort((t, e) => t.y - e.y)
    if (!selections.length) {
      selections.push({
        y: elY,
        height: 2
      })
    }

    let offSetY = elY + elH
    let endRange = selections[selections.length - 1]
    if (offSetY - (endRange.y + endRange.height) >= 30) {
      selections.push({
        y: offSetY - 2,
        height: 2
      })
    }
    const finalArr = (selArr) => {
      let res = []
      let firstSelect = selArr[0]
      for (let i = 1; i < selArr.length; i++) {
        res.push(firstSelect)
        let nexSelect = selArr[i]
        let firstOffsetY = firstSelect.y + firstSelect.height
        let newOffsetY = nexSelect.y - firstOffsetY
        let howMany30 = (newOffsetY / 30) | 0
        if (howMany30) {
          let averageHeight = newOffsetY / howMany30
          for (let j = 0; j < howMany30; j++) {
            res.push({
              y: firstOffsetY + averageHeight * (j + 1) - 2,
              height: 4
            })
          }
        }
        firstSelect = nexSelect
      }
      res.push(firstSelect)
      return res
    }
    return finalArr(selections)
  }
}
