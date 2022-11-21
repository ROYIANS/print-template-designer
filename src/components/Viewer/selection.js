import html2canvas from 'html2canvas'
import Vue from 'vue'
import { CONFIG } from '@/components/Viewer/viewer-constant'
import { StyledText } from '@/components/PageComponents/style'

export default async function generateViewerElement(
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

const renderMain = {
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
    const { pageWidth, pageHeight, background, color, fontSize, fontFamily } =
      pagerConfig
    const newPage = document.createElement('div')
    newPage.style.width = `${pageWidth * COMMON_SCALE}px`
    newPage.style.height = `${pageHeight * COMMON_SCALE}px`
    newPage.style.background = background
    newPage.style.color = color
    newPage.style.fontSize = `${fontSize}pt`
    newPage.style.fontFamily = fontFamily
    newPage.style.position = 'relative'
    newPage.style.overflow = 'hidden'
    newPage.classList.add('roy-preview-page')
    pageSet.curPage = newPage
    pageSet.pageList.push(newPage)
    return pageSet
  },
  async renderRoyText({
    element,
    dataSource,
    dataSet,
    pageSet,
    pagerConfig,
    tempHolder
  }) {
    console.log(dataSet, dataSource)
    let StyledTextConstructor = Vue.extend(StyledText)
    const { propValue, style } = element
    if (pageSet.curPage === null) {
      await renderMain.renderPage(pagerConfig, pageSet)
    }
    if (pageSet.curPage !== null) {
      const instance = new StyledTextConstructor({
        props: style
      })
      instance.$mount()
      const newElement = instance.$el
      newElement.style.width = `${style.width}px`
      newElement.style.height = 'auto'
      newElement.style.position = 'absolute'
      newElement.style.left = `${style.left}px`
      newElement.style.top = `${style.top}px`
      newElement.innerHTML = propValue
      console.log(tempHolder)
      tempHolder.appendChild(newElement)
      await renderUtil.wait()
      const richTextImgList = await renderUtil.splitRichText(newElement)
      if (richTextImgList && richTextImgList.length) {
        let newTextRootEle = document.createElement('div')
        newTextRootEle.style.width = `${style.width}px`
        newTextRootEle.style.position = 'absolute'
        newTextRootEle.style.left = `${style.left}px`
        newTextRootEle.style.top = `${style.top}px`
        richTextImgList.forEach((imgData) => {
          const img = document.createElement('img')
          img.src = imgData.src
          img.style.width = `${imgData.width}px`
          img.style.height = `${imgData.height}px`
          newTextRootEle.appendChild(img)
        })
        pageSet.curPage.appendChild(newTextRootEle)
      }
      tempHolder.removeChild(newElement)
      instance.$destroy()
    }
  }
}

const renderUtil = {
  wait: (time = 10) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  },
  splitRichText: async (myElement) => {
    const scrollY = 0
    let canvasThing = await html2canvas(myElement, {
      scale: 5
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
          if (se.y > offsetY) {
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
      for (let elee of smThing) {
        renderImg(elee)
      }
      return canvasImageList
    }

    return getCanvasList(someThing, canvasThing, 5)
  }
}
