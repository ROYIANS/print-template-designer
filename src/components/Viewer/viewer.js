import html2canvas from 'html2canvas'
import Vue from 'vue'
import { CONFIG } from '@/components/Viewer/viewer-constant'
import {
  StyledCircle,
  StyledLine,
  StyledRect,
  StyledSimpleText,
  StyledStar,
  StyledText,
  StyledSimpleTable
} from '@/components/PageComponents/style'
import { AutoTable } from '@/components/Viewer/auto-table'

export async function generateViewerElement(
  componentData,
  pagerConfig,
  dataSource,
  dataSet,
  tempHolder
) {
  const pageList = []
  let pageSet = {
    curPage: null,
    pageList: pageList
  }
  await renderMain.render({
    componentData,
    pagerConfig,
    dataSource,
    dataSet,
    pageSet,
    tempHolder
  })
  return pageList
}

export const renderMain = {
  async render({
    componentData,
    pagerConfig,
    dataSource,
    dataSet,
    pageSet,
    tempHolder
  }) {
    for (const comp of componentData) {
      const { component } = comp
      const renderFun = renderMain[`render${component}`]
      if (renderFun) {
        await renderFun({
          element: comp,
          dataSource,
          dataSet,
          pageSet,
          pagerConfig,
          tempHolder
        })
      }
    }
  },
  async renderPage(pagerConfig, pageSet) {
    const { COMMON_SCALE } = CONFIG
    const {
      pageWidth,
      pageHeight,
      background,
      color,
      fontSize,
      fontFamily,
      pageMarginBottom,
      pageMarginTop,
      pageDirection
    } = pagerConfig
    const newPage = document.createElement('div')
    newPage.style.width = `${pageWidth * COMMON_SCALE}px`
    newPage.style.height = `${pageHeight * COMMON_SCALE}px`
    if (pageDirection === 'l') {
      newPage.style.width = `${pageHeight * COMMON_SCALE}px`
      newPage.style.height = `${pageWidth * COMMON_SCALE}px`
    }
    newPage.style.marginTop = `${pageMarginTop * COMMON_SCALE}px`
    newPage.style.marginBottom = `${pageMarginBottom * COMMON_SCALE}px`
    newPage.style.background = background
    newPage.style.color = color
    newPage.style.fontSize = `${fontSize}pt`
    newPage.style.fontFamily = fontFamily
    newPage.style.position = 'relative'
    newPage.style.overflow = 'hidden'
    newPage.classList.add('roy-preview-page')
    pageSet.curPage = newPage
    pageSet.pageList.push(newPage)
    return newPage
  },
  async renderRoySimpleText({ element, dataSet, pageSet, pagerConfig }) {
    let StyledSimpleTextConstructor = Vue.extend(StyledSimpleText)
    const { propValue, bindValue, style } = element
    let afterPropValue = propValue
    if (bindValue) {
      const { field } = bindValue
      if (dataSet[field] && dataSet[field] instanceof Function) {
        afterPropValue = dataSet[field]()
      } else {
        afterPropValue = dataSet[field]
      }
    }
    let newPage = pageSet.curPage
    if (newPage === null) {
      newPage = await renderMain.renderPage(pagerConfig, pageSet)
    }
    const instance = new StyledSimpleTextConstructor({
      propsData: style
    })
    instance.$mount()
    const newElement = instance.$el
    newElement.style.width = `${style.width}px`
    newElement.style.height = `${style.height}px`
    newElement.style.position = 'absolute'
    newElement.style.left = `${style.left}px`
    newElement.style.top = `${style.top}px`
    newElement.style.transform = `rotate(${style.rotate}deg)`
    newElement.style.overflow = 'hidden'
    newElement.innerHTML = afterPropValue
    newPage.appendChild(newElement)
    instance.$destroy()
  },
  async renderRoyText({
    element,
    dataSource,
    dataSet,
    pageSet,
    pagerConfig,
    tempHolder
  }) {
    const { COMMON_SCALE } = CONFIG
    const {
      pageHeight,
      pageWidth,
      pageDirection,
      pageMarginBottom,
      pageMarginTop
    } = pagerConfig
    const realPageHeight =
      (pageDirection === 'p' ? pageHeight : pageWidth) * COMMON_SCALE
    const realPageMarginBottom = pageMarginBottom * COMMON_SCALE
    const realPageMarginTop = pageMarginTop * COMMON_SCALE
    let StyledTextConstructor = Vue.extend(StyledText)
    const { propValue, style } = element
    const afterPropValue = renderUtil.replaceTextWithDataSource(
      propValue,
      dataSet,
      dataSource
    )
    let newPage = pageSet.curPage
    if (newPage === null) {
      newPage = await renderMain.renderPage(pagerConfig, pageSet)
    }
    const instance = new StyledTextConstructor({
      propsData: style
    })
    instance.$mount()
    const newElement = instance.$el
    newElement.style.width = `${style.width}px`
    newElement.style.height = 'auto'
    newElement.style.position = 'absolute'
    newElement.style.left = `${style.left}px`
    newElement.style.top = `${style.top}px`
    newElement.innerHTML = afterPropValue
    tempHolder.appendChild(newElement)
    await renderUtil.wait()
    const richTextImgList = await renderUtil.splitRichText(newElement)
    const appendImage = async (imgList, imgIndex, page) => {
      let newTextRootEle = document.createElement('div')
      newTextRootEle.style.width = `${style.width}px`
      newTextRootEle.style.position = 'absolute'
      newTextRootEle.style.left = `${style.left}px`
      const firstInitTop =
        style.top < realPageMarginTop ? realPageMarginTop : style.top
      newTextRootEle.style.top = `${
        imgIndex === 0 ? firstInitTop : realPageMarginTop
      }px`
      newTextRootEle.style.display = 'inline-grid'
      let maxHeight = realPageHeight - realPageMarginBottom - style.top
      let curHeight = 0
      let recurve = false
      for (let i = imgIndex; i < imgList.length; i++) {
        const imgData = imgList[i]
        curHeight += imgData.height
        if (!recurve) {
          maxHeight = realPageHeight - realPageMarginBottom
        }
        if (curHeight > maxHeight) {
          if (!recurve) {
            const newPage = await renderMain.renderPage(pagerConfig, pageSet)
            await appendImage(imgList, i, newPage)
          }
          recurve = true
          break
        } else {
          const img = document.createElement('img')
          img.src = imgData.src
          img.style.width = `${imgData.width}px`
          img.style.height = `${imgData.height}px`
          newTextRootEle.appendChild(img)
        }
      }
      page.appendChild(newTextRootEle)
    }
    if (richTextImgList && richTextImgList.length) {
      await appendImage(richTextImgList, 0, newPage)
    }
    tempHolder.removeChild(newElement)
    instance.$destroy()
  },
  async renderRoySimpleTable({
    element,
    dataSource,
    dataSet,
    pageSet,
    pagerConfig,
    tempHolder
  }) {
    const { COMMON_SCALE } = CONFIG
    let StyledSimpleTableConstructor = Vue.extend(StyledSimpleTable)
    let newPage = pageSet.curPage
    if (newPage === null) {
      newPage = await renderMain.renderPage(pagerConfig, pageSet)
    }
    const { style } = element
    const {
      pageHeight,
      pageWidth,
      pageDirection,
      pageMarginBottom,
      pageMarginTop
    } = pagerConfig
    const realPageHeight =
      (pageDirection === 'p' ? pageHeight : pageWidth) * COMMON_SCALE
    const realPageMarginBottom = pageMarginBottom * COMMON_SCALE
    const realPageMarginTop = pageMarginTop * COMMON_SCALE
    console.log(realPageMarginTop)
    let maxHeight = realPageHeight - realPageMarginBottom - style.top

    let autoTable = new AutoTable({
      type: element.component,
      propValue: element.propValue,
      pagerConfig: pagerConfig,
      tempHolder: tempHolder,
      dataSource: dataSource,
      dataSet: dataSet
    })
    let tableHtml = autoTable.getOriginTableItem()

    const instance = new StyledSimpleTableConstructor({
      propsData: style
    })
    instance.$mount()
    const newElement = instance.$el
    newElement.style.width = `${style.width}px`
    newElement.style.position = 'absolute'
    newElement.style.left = `${style.left}px`
    newElement.style.top = `${style.top}px`
    newElement.style.transform = `rotate(${style.rotate}deg)`
    newElement.innerHTML = tableHtml
    tempHolder.appendChild(newElement)
    instance.$destroy()
    const tdElements = newElement.getElementsByClassName('roy-simple-table-row')
    let curHeight = 0
    let curHtml = ''
    let tables = []
    let overflowPages = []
    let maxTableWidth = 0
    for (let i = 0; i < tdElements.length; i++) {
      let curTd = tdElements[i]
      let lastHeight = curHeight
      curHeight += curTd.clientHeight
      maxTableWidth =
        maxTableWidth > curTd.clientWidth ? maxTableWidth : curTd.clientWidth
      if (curHeight > maxHeight) {
        tables.push(curHtml)
        if (lastHeight > maxHeight) {
          overflowPages.push(tables.length - 1)
        }
        curHeight = realPageMarginTop + curTd.clientHeight
        curHtml = curTd.outerHTML
        maxHeight = realPageHeight - realPageMarginBottom
      } else {
        curHtml += curTd.outerHTML
        if (i === tdElements.length - 1) {
          // 最后一个元素
          tables.push(curHtml)
        }
      }
    }
    tables.forEach(async (table, index) => {
      if (index !== 0) {
        newPage = await renderMain.renderPage(pagerConfig, pageSet)
      }
      const instanceTable = new StyledSimpleTableConstructor({
        propsData: style
      })
      instanceTable.$mount()
      const newTable = instanceTable.$el
      if (overflowPages.includes(index)) {
        newTable.style.height = `${
          realPageHeight - realPageMarginBottom - realPageMarginTop
        }px`
        newTable.style.overflow = 'hidden'
      }
      newTable.style.width = `${style.width}px`
      newTable.style.position = 'absolute'
      newTable.style.left = `${style.left}px`
      newTable.style.top = `${index === 0 ? style.top : realPageMarginTop}px`
      newTable.style.transform = `rotate(${style.rotate}deg)`
      newTable.innerHTML = `<table style='width: ${maxTableWidth}px'>${table}</table>`
      newPage.appendChild(newTable)
      instanceTable.$destroy()
    })
    tempHolder.removeChild(newElement)
  },
  async renderRoyCircle({ element, pagerConfig, pageSet }) {
    let StyledCircleConstructor = Vue.extend(StyledCircle)
    let newPage = pageSet.curPage
    if (newPage === null) {
      newPage = await renderMain.renderPage(pagerConfig, pageSet)
    }
    const { style } = element
    const instance = new StyledCircleConstructor({
      propsData: style
    })
    instance.$mount()
    const newElement = instance.$el
    newElement.style.width = `${style.width}px`
    newElement.style.height = `${style.height}px`
    newElement.style.position = 'absolute'
    newElement.style.left = `${style.left}px`
    newElement.style.top = `${style.top}px`
    newElement.style.transform = `rotate(${style.rotate}deg)`
    newPage.appendChild(newElement)
    instance.$destroy()
  },
  async renderRoyRect({ element, pagerConfig, pageSet }) {
    let StyledRectConstructor = Vue.extend(StyledRect)
    let newPage = pageSet.curPage
    if (newPage === null) {
      newPage = await renderMain.renderPage(pagerConfig, pageSet)
    }
    const { style } = element
    const instance = new StyledRectConstructor({
      propsData: style
    })
    instance.$mount()
    const newElement = instance.$el
    newElement.style.width = `${style.width}px`
    newElement.style.height = `${style.height}px`
    newElement.style.position = 'absolute'
    newElement.style.left = `${style.left}px`
    newElement.style.top = `${style.top}px`
    newElement.style.transform = `rotate(${style.rotate}deg)`
    newPage.appendChild(newElement)
    instance.$destroy()
  },
  async renderRoyLine({ element, pagerConfig, pageSet }) {
    let StyledLineConstructor = Vue.extend(StyledLine)
    let newPage = pageSet.curPage
    if (newPage === null) {
      newPage = await renderMain.renderPage(pagerConfig, pageSet)
    }
    const { style } = element
    const instance = new StyledLineConstructor({
      propsData: style
    })
    instance.$mount()
    const newElement = instance.$el
    newElement.style.width = `${style.width}px`
    newElement.style.height = `${style.height}px`
    newElement.style.position = 'absolute'
    newElement.style.left = `${style.left}px`
    newElement.style.top = `${style.top}px`
    newElement.style.transform = `rotate(${style.rotate}deg)`
    newPage.appendChild(newElement)
    instance.$destroy()
  },
  async renderRoyStar({ element, pagerConfig, pageSet }) {
    let StyledStarConstructor = Vue.extend(StyledStar)
    let newPage = pageSet.curPage
    if (newPage === null) {
      newPage = await renderMain.renderPage(pagerConfig, pageSet)
    }
    const { style } = element
    const instance = new StyledStarConstructor({
      propsData: style
    })
    instance.$mount()
    const newElement = instance.$el
    newElement.style.width = `${style.width}px`
    newElement.style.height = `${style.height}px`
    newElement.style.position = 'absolute'
    newElement.style.left = `${style.left}px`
    newElement.style.top = `${style.top}px`
    newElement.style.transform = `rotate(${style.rotate}deg)`
    // <span class="iconfont roy-star-icon" :class="style.icon"></span>
    const star = document.createElement('span')
    star.classList.add(...['iconfont', 'roy-star-icon', style.icon])
    newElement.appendChild(star)
    newPage.appendChild(newElement)
    instance.$destroy()
  }
}

export const renderUtil = {
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
  },
  splitRichText: async (myElement) => {
    const scrollY = 0
    let canvasThing = await html2canvas(myElement, {
      scale: devicePixelRatio * 2
    })
    const generateRangeSelection = (elements, { y: elY, height: elH }) => {
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
            } else if (
              !['TD', 'BR', 'TH', 'P', 'DIV'].includes(
                node.tagName.toUpperCase()
              )
            ) {
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
            let avarageHeight = newOffsetY / howMany30
            for (let j = 0; j < howMany30; j++) {
              res.push({
                y: firstOffsetY + avarageHeight * (j + 1) - 2,
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
    const getSomeThing = (rect, selection) => {
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
    const arrSelection = generateRangeSelection(
      [myElement],
      myElement.getBoundingClientRect()
    )
    const someThing = getSomeThing(
      myElement.getBoundingClientRect(),
      arrSelection
    )

    const getCanvasList = (smThing, canvasThing, pixelRatio) => {
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

    return getCanvasList(someThing, canvasThing, devicePixelRatio * 2)
  }
}
