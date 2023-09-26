import {
  StyledCircle,
  StyledComplexTable,
  StyledImage,
  StyledLine,
  StyledRect,
  StyledSimpleTable,
  StyledSimpleText,
  StyledStar,
  StyledText
} from '@/components/PageComponents/style'
import { CONFIG } from '@/components/Viewer/viewer-constant'
import { RenderUtil } from '@/components/Viewer/render-util'
import Vue from 'vue'
import { AutoTable } from '@/components/Viewer/auto-table'
import generateID from '@/utils/generateID'
import { AutoSplitText } from '@/components/Viewer/auto-split-text'

// 缩放比率
const { COMMON_SCALE, AUTO_PAGE_COMPONENT } = CONFIG

const componentToStyled = {
  RoyText: StyledText,
  RoyTextIn: StyledText,
  RoySimpleText: StyledSimpleText,
  RoySimpleTextIn: StyledSimpleText,
  RoyCircle: StyledCircle,
  RoyLine: StyledLine,
  RoyRect: StyledRect,
  RoyStar: StyledStar,
  RoySimpleTable: StyledSimpleTable,
  RoyComplexTable: StyledComplexTable,
  RoyImage: StyledImage
}

const componentToClassName = {
  RoyText: 'rendered-roy-text',
  RoyTextIn: 'rendered-roy-text-in',
  RoySimpleText: 'rendered-roy-simple-text',
  RoySimpleTextIn: 'rendered-roy-simple-text-in',
  RoyCircle: 'rendered-roy-circle',
  RoyLine: 'rendered-roy-line',
  RoyRect: 'rendered-roy-rect',
  RoyStar: 'rendered-roy-star',
  RoySimpleTable: 'rendered-roy-simple-table',
  RoyComplexTable: 'rendered-roy-complex-table',
  RoyImage: 'rendered-roy-image'
}

class BasePageGenerator {
  constructor({ renderElements, pagerConfig, dataSet, dataSource }) {
    // 页面组件
    this.renderElements = renderElements
    // 页面配置信息
    this.pagerConfig = pagerConfig
    // 数据
    this.dataSet = dataSet
    // 数据源信息
    this.dataSource = dataSource
    const { pageWidth, pageHeight, pageMarginBottom, pageMarginTop, pageDirection, pageLayout } =
      pagerConfig
    // 页面宽度(mm)
    this.pageWidth = (pageDirection === 'p' ? pageWidth : pageHeight) * COMMON_SCALE
    // 页面高度(mm)
    this.pageHeight = (pageDirection === 'p' ? pageHeight : pageWidth) * COMMON_SCALE
    // 真实的下边距(px)
    this.realPageMarginBottom = pageMarginBottom * COMMON_SCALE
    // 真实的上边距(px)
    this.realPageMarginTop = pageMarginTop * COMMON_SCALE
    // 页面最大使用高度
    this.maxPageUseHeight = this.pageHeight - this.realPageMarginBottom
    // 页面布局方式
    this.pageLayout = pageLayout
    const { background, color, fontSize, fontFamily, lineHeight } = this.pagerConfig
    // 页面样式
    this.pageDefaultStyle = `
      width: ${this.pageWidth}px;
      height: ${this.pageHeight}px;
      background: ${background};
      color: ${color};
      font-size: ${fontSize}pt;
      font-family: ${fontFamily};
      line-height: ${lineHeight};
      position: relative;
      overflow: hidden;
    `
    // 所有页（key为页码）
    this.pages = {}
  }

  createTempPage(pageIndex = 0) {
    let element = null
    return {
      pageIndex,
      init: () => {
        if (element !== null) {
          if (document.body.contains(element)) {
            document.body.removeChild(element)
          }
          element = null
        }
        element = document.createElement('div')
        element.style = `
          ${this.pageDefaultStyle}
          top: 100vh;
          left: 0;
          position: fixed;
        `
      },
      mount: async () => {
        if (element === null) {
          console.info('element has been removed.')
          return
        }
        document.body.appendChild(element)
        await RenderUtil.wait()
      },
      appendChild: async (childEle) => {
        if (element === null) {
          console.info('element has been removed.')
          return
        }
        element.appendChild(childEle)
        await RenderUtil.wait()
      },
      appendHTML: async (html) => {
        if (element === null) {
          console.info('element has been removed.')
          return
        }
        element.insertAdjacentHTML('beforeend', html)
        await RenderUtil.wait()
      },
      unmount: () => {
        if (document.body.contains(element)) {
          document.body.removeChild(element)
        }
      },
      remove: () => {
        if (element === null) {
          console.info('element has been removed.')
          return
        }
        if (document.body.contains(element)) {
          document.body.removeChild(element)
        }
        element = null
      },
      removeChild: (childEle) => {
        if (element === null) {
          console.info('element has been removed.')
          return
        }
        element.removeChild(childEle)
      },
      getPageHTML: () => {
        if (element === null) {
          console.info('element has been removed.')
          return ''
        }
        return `
          <div
            id="${generateID()}"
            class="roy-preview-page"
            style="${this.pageDefaultStyle}"
          >
            ${element.innerHTML}
          </div>
        `
      }
    }
  }

  getPage(pageNumber = 1) {
    if (!this.pages[pageNumber]) {
      const newPage = this.createTempPage(pageNumber)
      newPage.init()
      this.pages[Number(pageNumber)] = newPage
    }
    return this.pages[pageNumber]
  }

  getPageHTML() {
    const pageNums = Object.keys(this.pages).sort()
    let pageContent = ''
    for (let pageNum of pageNums) {
      let page = this.pages[pageNum]
      pageContent += page.getPageHTML()
      page.remove()
    }
    return pageContent
  }

  async render() {
    let uniqueElements = []
    let repeatElements = []
    let fixedElements = []
    let elementIdToPosition = {}
    let yPixelSortMap = {}
    for (let i = 0; i < this.renderElements.length; i++) {
      const curElement = this.renderElements[i]
      const { id } = curElement
      const { ty } = curElement.position || { ty: Infinity }
      curElement.index = i
      elementIdToPosition[id] = curElement.position || {}
      yPixelSortMap[Number(ty)] = [...(yPixelSortMap[ty] || []), curElement]
    }
    Object.keys(yPixelSortMap)
      .sort()
      .forEach((yPixel) => {
        yPixelSortMap[yPixel].forEach((comp) => {
          const {
            style: { elementPosition = 'default' }
          } = comp
          if (elementPosition === 'default') {
            uniqueElements.push(comp)
          } else if (elementPosition === 'fixed') {
            fixedElements.push(comp)
          } else if (elementPosition === 'repeated') {
            repeatElements.push(comp)
          }
        })
      })
    await this.renderUniqueElement(uniqueElements)
    await this.renderFixedElement(fixedElements)
    // 最后渲染重复元素
    await this.renderRepeatElement(repeatElements)
    return this.getPageHTML()
  }

  async renderUniqueElement(uniqueElements) {
    for (let i = 0; i < uniqueElements.length; i++) {
      const curElement = this.renderElements[i]
      const { component } = curElement
      await this[`render${component}`]({ component: curElement })
    }
  }

  async renderRepeatElement(repeatElements) {
    console.log(repeatElements)
  }

  async renderFixedElement(fixedElements) {
    console.log(fixedElements)
  }

  generateRoySimpleText(component) {
    const { index, propValue, bindValue, style } = component
    let afterPropValue = propValue
    if (bindValue) {
      const { field } = bindValue
      afterPropValue = RenderUtil.getDataConvertedByDataSource(
        this.dataSet[field],
        field,
        this.dataSource
      )
    }
    let newElement = this.generateNewElementWithStyledComponent(component, index)
    newElement.innerHTML = `<div class="roy-simple-text-inner">${afterPropValue}</div>`
    return {
      element: newElement,
      style
    }
  }

  generateRoyLine(component) {
    const { index, style } = component
    let newElement = this.generateNewElementWithStyledComponent(component, index)
    return {
      element: newElement,
      style
    }
  }

  generateRoyRect(component) {
    const { index, style } = component
    let newElement = this.generateNewElementWithStyledComponent(component, index)
    return {
      element: newElement,
      style
    }
  }

  generateRoyCircle(component) {
    const { index, style } = component
    let newElement = this.generateNewElementWithStyledComponent(component, index)
    return {
      element: newElement,
      style
    }
  }

  generateRoyStar(component) {
    const { index, style } = component
    let newElement = this.generateNewElementWithStyledComponent(component, index)
    const star = document.createElement('span')
    star.classList.add(...['iconfont', 'roy-star-icon', style.icon])
    newElement.appendChild(star)
    return {
      element: newElement,
      style
    }
  }

  generateRoyImage(component) {
    const { index, style } = component
    let newElement = this.generateNewElementWithStyledComponent(component, index)
    let img = document.createElement('img')
    img.src = component.src
    img.alt = component.title
    newElement.appendChild(img)
    return {
      element: newElement,
      style
    }
  }

  generateRoyText(component, zIndex, parentElement = null) {
    const { propValue, style } = component
    let outerStyle = style
    const afterPropValue = RenderUtil.replaceTextWithDataSource(
      propValue,
      this.dataSet,
      this.dataSource
    )
    let rootElement = null
    let newElement = this.generateNewElementWithStyledComponent(component, zIndex)
    newElement.style.transform = 'none'
    // newElement.style.border = 'none'
    newElement.innerHTML = `<div class="roy-text-inner">${afterPropValue}</div>`
    newElement.style.height = 'auto'
    if (parentElement) {
      newElement.style.position = 'relative'
      newElement.style.width = '100%'
      newElement.style.height = 'auto'
      newElement.style.left = 0
      newElement.style.top = 0
      outerStyle = parentElement.style
      rootElement = this.generateNewElementWithStyledComponent(parentElement, zIndex)
      rootElement.appendChild(newElement)
      // 富文本高度自动给，然后走分页逻辑
      rootElement.style.height = 'auto'
    } else {
      rootElement = newElement
    }
    return {
      element: rootElement,
      innerElement: newElement,
      style: outerStyle,
      innerStyle: style
    }
  }

  generateRoySimpleTable(component, zIndex = 0, parentElement = null) {
    let autoTable = new AutoTable({
      type: component.component,
      propValue: component.propValue,
      dataSource: this.dataSource,
      dataSet: this.dataSet
    })
    const { style } = component
    let outerStyle = style
    let tableHtml = autoTable.getOriginTableItem()
    let rootElement
    let newElement = this.generateNewElementWithStyledComponent(component, zIndex)
    newElement.innerHTML = tableHtml
    newElement.style.width = 'auto'
    if (parentElement) {
      newElement.style.position = 'relative'
      newElement.style.width = '100%'
      newElement.style.height = 'auto'
      newElement.style.left = 0
      newElement.style.top = 0
      outerStyle = parentElement.style
      rootElement = this.generateNewElementWithStyledComponent(parentElement, zIndex)
      rootElement.style.width = 'auto'
      rootElement.appendChild(newElement)
    } else {
      rootElement = newElement
    }
    return {
      element: rootElement,
      innerElement: newElement,
      style: outerStyle,
      innerStyle: style
    }
  }

  generateRoyDataTable(component, zIndex) {
    const {
      component: componentName,
      propValue: { bodyDataTableElement }
    } = component
    let autoTable = new AutoTable({
      type: componentName,
      propValue: bodyDataTableElement,
      dataSource: this.dataSource,
      dataSet: this.dataSet
    })
    let tableItem = autoTable.getOriginTableItem()
    let newElement = this.generateNewElementWithStyledComponent(component, zIndex)
    const { tableStart, tableHead, tableBody, tableEnd } = tableItem
    newElement.innerHTML = `${tableStart}${tableHead}${tableBody}${tableEnd}`
    return {
      newElement,
      tableStart,
      tableEnd
    }
  }

  generateNewElementWithStyledComponent(element, zIndex = 0) {
    const { component, style } = element
    let constructor = Vue.extend(componentToStyled[component])
    let instance = new constructor({
      propsData: style
    })
    instance.$mount()
    let newElement = instance.$el
    newElement.style.width = `${style.width}px`
    newElement.style.height = `${style.height}px`
    newElement.style.position = 'absolute'
    newElement.style.left = `${style.left}px`
    newElement.style.top = `${style.top}px`
    newElement.style.transform = `rotate(${style.rotate}deg)`
    newElement.style.zIndex = zIndex
    newElement.classList.add(componentToClassName[component])
    instance.$destroy()
    return newElement
  }

  async renderRoySimpleText({ component, curPageUsedHeight, pageNumber = 1 }) {
    let { element, style } = this.generateRoySimpleText(component)
    if (curPageUsedHeight && curPageUsedHeight + element.style.height > this.maxPageUseHeight) {
      pageNumber++
      curPageUsedHeight = this.realPageMarginTop
    }
    curPageUsedHeight = curPageUsedHeight || +style.top
    element.style.top = `${curPageUsedHeight}px`
    let page = this.getPage(pageNumber)
    page.appendChild(element)
    curPageUsedHeight += +style.height
    return {
      page,
      element,
      pageNumber,
      pageUsedHeight: curPageUsedHeight
    }
  }

  async renderRoyLine({ component, curPageUsedHeight, pageNumber = 1 }) {
    let { element, style } = this.generateRoyLine(component)
    if (curPageUsedHeight && curPageUsedHeight + element.style.height > this.maxPageUseHeight) {
      pageNumber++
      curPageUsedHeight = this.realPageMarginTop
    }
    curPageUsedHeight = curPageUsedHeight || style.top
    element.style.top = `${curPageUsedHeight}px`
    let page = this.getPage(pageNumber)
    page.appendChild(element)
    curPageUsedHeight += element.style.height
    return {
      page,
      element,
      pageUsedHeight: curPageUsedHeight
    }
  }

  async renderRoyCircle({ component, curPageUsedHeight, pageNumber = 1 }) {
    let { element, style } = this.generateRoyCircle(component)
    if (curPageUsedHeight && curPageUsedHeight + element.style.height > this.maxPageUseHeight) {
      pageNumber++
      curPageUsedHeight = this.realPageMarginTop
    }
    curPageUsedHeight = curPageUsedHeight || style.top
    element.style.top = `${curPageUsedHeight}px`
    let page = this.getPage(pageNumber)
    page.appendChild(element)
    curPageUsedHeight += element.style.height
    return {
      page,
      element,
      pageUsedHeight: curPageUsedHeight
    }
  }

  async renderRoyRect({ component, curPageUsedHeight, pageNumber = 1 }) {
    let { element, style } = this.generateRoyRect(component)
    if (curPageUsedHeight && curPageUsedHeight + element.style.height > this.maxPageUseHeight) {
      pageNumber++
      curPageUsedHeight = this.realPageMarginTop
    }
    curPageUsedHeight = curPageUsedHeight || style.top
    element.style.top = `${curPageUsedHeight}px`
    let page = this.getPage(pageNumber)
    page.appendChild(element)
    curPageUsedHeight += element.style.height
    return {
      page,
      element,
      pageUsedHeight: curPageUsedHeight
    }
  }

  async renderRoyStar({ component, curPageUsedHeight, pageNumber = 1 }) {
    let { element, style } = this.generateRoyStar(component)
    if (curPageUsedHeight && curPageUsedHeight + element.style.height > this.maxPageUseHeight) {
      pageNumber++
      curPageUsedHeight = this.realPageMarginTop
    }
    curPageUsedHeight = curPageUsedHeight || style.top
    element.style.top = `${curPageUsedHeight}px`
    let page = this.getPage(pageNumber)
    page.appendChild(element)
    curPageUsedHeight += element.style.height
    return {
      page,
      element,
      pageUsedHeight: curPageUsedHeight
    }
  }

  async renderRoyImage({ component, curPageUsedHeight, pageNumber = 1 }) {
    let { element, style } = this.generateRoyImage(component)
    if (curPageUsedHeight && curPageUsedHeight + element.style.height > this.maxPageUseHeight) {
      pageNumber++
      curPageUsedHeight = this.realPageMarginTop
    }
    curPageUsedHeight = curPageUsedHeight || style.top
    element.style.top = `${curPageUsedHeight}px`
    let page = this.getPage(pageNumber)
    page.appendChild(element)
    curPageUsedHeight += element.style.height
    return {
      page,
      element,
      pageUsedHeight: curPageUsedHeight
    }
  }

  async renderRoyText() {}

  async renderRoySimpleTable() {}

  renderRoyComplexTable() {}

  getTablesSplit({ rows, header = null, footer = null, isDataTable, style, curPageUsedHeight }) {
    // { tables, overflowPages, maxTableWidth }
    let headerHeight = 0
    let footerHeight = 0
    // 获取头部高度
    if (isDataTable && header !== null) {
      let innerCell = header.getElementsByClassName('roy-complex-table-cell-in')
      for (let cell of innerCell) {
        headerHeight =
          headerHeight < cell.children[0].clientHeight
            ? cell.children[0].clientHeight
            : headerHeight
      }
      header.children[0].style.height = `${headerHeight}px`
    }
    // 获取尾部高度 TODO: 新增尾部固定行
    if (isDataTable && footer !== null) {
      let innerCell = footer.getElementsByClassName('roy-complex-table-cell-in')
      for (let cell of innerCell) {
        footerHeight =
          footerHeight < cell.children[0].clientHeight
            ? cell.children[0].clientHeight
            : footerHeight
      }
      footer.children[0].style.height = `${footerHeight}px`
    }
    let headerHtml = header === null ? '' : header.outerHTML
    let footerHtml = footer === null ? '' : footer.outerHTML

    let realTop = curPageUsedHeight === 0 ? style.top : curPageUsedHeight

    let curHeight = realTop + headerHeight + footerHeight

    let curHtml = ''
    let tables = []
    let overflowPages = []
    let maxTableWidth = 0

    for (let i = 0; i < rows.length; i++) {
      let curRow = rows[i]
      let cellMaxHeight = 0
      if (isDataTable) {
        let innerCell = curRow.getElementsByClassName('roy-complex-table-cell-in')
        for (let cell of innerCell) {
          cellMaxHeight =
            cellMaxHeight < cell.children[0].clientHeight
              ? cell.children[0].clientHeight
              : cellMaxHeight
        }
        curRow.style.height = `${cellMaxHeight}px`
      }

      let lastHeight = curHeight
      curHeight += Math.max(curRow.clientHeight, cellMaxHeight)
      maxTableWidth = maxTableWidth > curRow.clientWidth ? maxTableWidth : curRow.clientWidth

      if (curHeight > this.maxPageUseHeight) {
        tables.push({
          html: `${headerHtml}<tbody>${curHtml}</tbody>`,
          height: lastHeight
        })
        if (lastHeight > this.maxPageUseHeight) {
          overflowPages.push(tables.length - 1)
        }
        curHeight =
          this.realPageMarginTop +
          Math.max(curRow.clientHeight, cellMaxHeight) +
          headerHeight +
          footerHeight
        curHtml = curRow.outerHTML
      } else {
        curHtml += curRow.outerHTML
      }
      if (i === rows.length - 1) {
        // 最后一个元素
        tables.push({
          html: `${headerHtml}<tbody>${curHtml}</tbody>${footerHtml}`,
          height: curHeight
        })
      }
    }
    return { tables, overflowPages, maxTableWidth }
  }
}

class FixedPageGenerator extends BasePageGenerator {
  constructor(data) {
    super(data)
    // 当前单组件使用的页面高度
    this.curPageUsedHeight = 0
  }

  async renderRoyText({
    component,
    restrictWidth,
    curPageUsedHeight,
    pageNumber = 1,
    parentElement
  }) {
    const {
      style: { top, rotate, height: elementHeight }
    } = component
    let pageUsedHeight = curPageUsedHeight ?? top
    let { element } = this.generateRoyText(
      component,
      parentElement?.index || component.index,
      parentElement
    )
    let page = this.getPage(pageNumber)
    page.appendChild(element)
    await page.mount()
    let { height } = element.getBoundingClientRect()
    const border = element.style.border
    if (restrictWidth !== undefined) {
      element.style.width = `${restrictWidth}px`
    }
    element.style.top = `${pageUsedHeight}px`
    if (height + pageUsedHeight > this.maxPageUseHeight) {
      // 单页富文本高度大于当页，需要分页
      element.style.border = 'none'
      const autoSplitText = new AutoSplitText(element)
      const richTextImgList = await autoSplitText.run()
      element.style.display = 'inline-grid'
      element.innerHTML = ''
      page.removeChild(element)
      let clonedEmptyNode = element.cloneNode()
      for (let i = 0; i < richTextImgList.length; i++) {
        const imgData = richTextImgList[i]
        const imgEle = document.createElement('img')
        imgEle.src = imgData.src
        imgEle.style.width = `${imgData.width}px`
        imgEle.style.height = `${imgData.height}px`
        clonedEmptyNode.appendChild(imgEle)
        pageUsedHeight += imgData.height
        if (pageUsedHeight > this.maxPageUseHeight && imgData.height <= this.maxPageUseHeight) {
          // 页面超出，需要换新的一页了
          clonedEmptyNode.style.transform = `rotate(${rotate}deg)`
          clonedEmptyNode.style.border = border
          clonedEmptyNode.removeChild(imgEle)
          await page.appendHTML(clonedEmptyNode.outerHTML)
          pageNumber++
          pageUsedHeight = this.realPageMarginTop
          page = this.getPage(pageNumber)
          clonedEmptyNode = element.cloneNode()
          clonedEmptyNode.style.top = `${this.realPageMarginTop}px`
          clonedEmptyNode.appendChild(imgEle)
        } else if (imgData.height > this.maxPageUseHeight || i === richTextImgList.length - 1) {
          // 循环就要结束了，或者一个图片太高了
          clonedEmptyNode.style.transform = `rotate(${rotate}deg)`
          clonedEmptyNode.style.border = border
          await page.appendHTML(clonedEmptyNode.outerHTML)
        }
      }
      element = null
    } else {
      element.style.transform = `rotate(${rotate}deg)`
      element.style.minHeight = `${elementHeight}px`
      element.style.border = border
      pageUsedHeight += height
    }
    page.unmount()
    return {
      pageUsedHeight,
      pageNumber
    }
  }

  async renderRoySimpleTable({
    component,
    restrictWidth,
    curPageUsedHeight,
    pageNumber = 1,
    marginTop,
    parentElement
  }) {
    let { element, style, innerElement } = this.generateRoySimpleTable(
      component,
      parentElement?.index || component.index,
      parentElement
    )
    let pageUsedHeight = curPageUsedHeight ?? style.top
    let page = this.getPage(pageNumber)
    page.appendChild(element)
    if (restrictWidth !== undefined) {
      element.style.width = `${restrictWidth}px`
    }
    if (marginTop !== undefined) {
      element.style.marginTop = `${marginTop}`
    }
    await page.mount()
    let { height } = element.getBoundingClientRect()
    element.style.top = `${pageUsedHeight}px`
    if (height + pageUsedHeight > this.maxPageUseHeight) {
      // 需要分页
      const tdElements = element.getElementsByClassName('roy-simple-table-row')
      const { tables, overflowPages, maxTableWidth } = this.getTablesSplit({
        style: style,
        rows: tdElements,
        curPageUsedHeight: pageUsedHeight
      })
      innerElement.innerHTML = ''
      page.removeChild(element)
      tables.forEach((table, index) => {
        let cleanChildNode = parentElement ? innerElement.cloneNode() : element.cloneNode()
        let cleanParentNode = element.cloneNode()
        if (index > 0) {
          cleanParentNode.style.top = `${this.realPageMarginTop}px`
          pageUsedHeight = this.realPageMarginTop
          pageNumber++
          page = this.getPage(pageNumber)
        }
        cleanChildNode.innerHTML = `<table style="width: ${
          restrictWidth || maxTableWidth
        }px;table-layout: auto">${table.html}</table>`
        if (overflowPages.includes(index)) {
          cleanParentNode.style.height = `${
            this.pageHeight - this.realPageMarginBottom - this.realPageMarginTop
          }px`
          cleanParentNode.style.overflow = 'hidden'
        }
        if (parentElement) {
          cleanParentNode.innerHTML = cleanChildNode.outerHTML
        }
        page.appendHTML(cleanParentNode.outerHTML)
        pageUsedHeight = table.height + this.realPageMarginTop
      })
    } else {
      pageUsedHeight += height
    }
    page.unmount()
    return {
      pageUsedHeight,
      pageNumber
    }
  }

  async renderRoyComplexTable({ component, pageNumber = 1, curPageUsedHeight }) {
    const { showPrefix, showHead, showFoot, showSuffix, style } = component
    const {
      prefixTextElement,
      suffixTextElement,
      headSimpleTableElement,
      footSimpleTableElement,
      bodyDataTableElement
    } = component.propValue
    const { bodyTableWidth } = bodyDataTableElement
    let pageUsedHeight = curPageUsedHeight || style.top || 0
    if (showPrefix) {
      const res = await this.renderRoyText({
        component: prefixTextElement,
        restrictWidth: bodyTableWidth,
        curPageUsedHeight: pageUsedHeight,
        pageNumber: pageNumber,
        parentElement: component
      })
      pageNumber = res.pageNumber
      pageUsedHeight = res.pageUsedHeight
    }
    if (showHead) {
      const res = await this.renderRoySimpleTable({
        component: headSimpleTableElement,
        restrictWidth: bodyTableWidth,
        curPageUsedHeight: pageUsedHeight,
        pageNumber: pageNumber,
        parentElement: component
      })
      pageNumber = res.pageNumber
      pageUsedHeight = res.pageUsedHeight
    }

    let {
      newElement: middleElement,
      tableStart,
      tableEnd
    } = this.generateRoyDataTable(component, component.index)

    let page = this.getPage(pageNumber)
    page.appendChild(middleElement)

    middleElement.style.top = `${pageUsedHeight}px`

    if (showHead) {
      middleElement.style.marginTop = `-${component.style.borderWidth - 0.5}px`
    }

    await page.mount()

    let { height } = middleElement.getBoundingClientRect()

    if (height + pageUsedHeight > this.maxPageUseHeight) {
      middleElement.style.top = `${pageUsedHeight}px`
      // 需要分页
      const trElements = middleElement.getElementsByClassName('roy-complex-table-row')
      const thElement = middleElement.getElementsByClassName('roy-complex-table-thead')[0]
      const { tables, overflowPages } = this.getTablesSplit({
        rows: trElements,
        header: thElement,
        isDataTable: true,
        style: component.style
      })
      middleElement.innerHTML = ''
      page.removeChild(middleElement)
      tables.forEach((table, index) => {
        let cleanCopyNode = middleElement.cloneNode()
        if (index > 0) {
          cleanCopyNode.style.top = `${this.realPageMarginTop}px`
          pageUsedHeight = this.realPageMarginTop
          pageNumber++
          page = this.getPage(pageNumber)
        }
        middleElement.innerHTML = `${tableStart}${table.html}${tableEnd}`
        if (overflowPages.includes(index)) {
          cleanCopyNode.style.height = `${
            this.pageHeight - this.realPageMarginBottom - this.realPageMarginTop
          }px`
          cleanCopyNode.style.overflow = 'hidden'
        }
        page.appendHTML(cleanCopyNode.outerHTML)
        pageUsedHeight = table.height + this.realPageMarginTop
      })
    } else {
      pageUsedHeight += height
    }
    page.unmount()

    if (showFoot) {
      const res = await this.renderRoySimpleTable({
        component: footSimpleTableElement,
        restrictWidth: bodyTableWidth,
        curPageUsedHeight: pageUsedHeight,
        pageNumber: pageNumber,
        parentElement: component,
        marginTop: `-${+component.style.borderWidth + 1}px`
      })
      pageNumber = res.pageNumber
      pageUsedHeight = res.pageUsedHeight
    }
    if (showSuffix) {
      const res = await this.renderRoyText({
        component: suffixTextElement,
        restrictWidth: bodyTableWidth,
        curPageUsedHeight: pageUsedHeight,
        pageNumber: pageNumber,
        parentElement: component
      })
      pageNumber = res.pageNumber
      pageUsedHeight = res.pageUsedHeight
    }
    return {
      pageUsedHeight,
      pageNumber
    }
  }
}

class RelativePageGenerator extends FixedPageGenerator {
  constructor(data) {
    super(data)
    // 记录当前已经渲染过的元素信息
    this.renderedElementMap = {}
    this.totalPageUsedHeight = 0
    this.maxPageNum = 1
  }

  async renderUniqueElement(uniqueElements) {
    for (let i = 0; i < uniqueElements.length; i++) {
      const curElement = this.renderElements[i]
      const { component } = curElement
      const { nextPageUsedHeight, nextPageNumber } = await this.getNextRenderInfo(curElement)
      const { page, pageUsedHeight, pageNumber } = await this[`render${component}`]({
        component: curElement,
        curPageUsedHeight: nextPageUsedHeight,
        pageNumber: nextPageNumber
      })
      this.maxPageNum = Math.max(pageNumber, this.maxPageNum)
      await this.storeRenderedInfo({ page, element: curElement, pageUsedHeight, pageNumber })
    }
  }

  getNextRenderInfo(curElement) {
    let renderedComponents = Object.values(this.renderedElementMap)
    if (renderedComponents.length === 0) {
      return {
        nextPageUsedHeight: undefined,
        nextPageNumber: 1
      }
    }
    const { position } = curElement
    let maxPageNum = 1
    let minRelativeHeight = {}
    let relativePageHeight = {}
    renderedComponents.forEach((rComp) => {
      const { name: rCompName, position: rCompPos, realPageHeight, pageNumber } = rComp
      // 遍历已经渲染过的每个组件，查看是否与当前组件有相交的关系
      let rCompIsAutoPage = AUTO_PAGE_COMPONENT.includes(rCompName)
      let curCompIsAutoPage = AUTO_PAGE_COMPONENT.includes(curElement.component)

      if (curCompIsAutoPage || rCompIsAutoPage) {
        let { isIntersect, isBlow, relativeHeight } = this.getRelativePositionInfo(
          rCompPos,
          position
        )
        if (isIntersect && isBlow) {
          maxPageNum = Math.max(pageNumber, maxPageNum)
          minRelativeHeight[pageNumber] = Math.min(
            minRelativeHeight[pageNumber] || Infinity,
            relativeHeight
          )
          relativePageHeight[pageNumber] = minRelativeHeight[pageNumber] + realPageHeight
        }
      }
    })
    return {
      nextPageUsedHeight: relativePageHeight[maxPageNum] || undefined,
      nextPageNumber: maxPageNum
    }
  }

  getRelativePositionInfo(positionA, positionB) {
    let isIntersect = false
    let isBlow = false
    let relativeHeight = 0
    const { lx: aLx, rx: aRx, ty: aTy, by: aBy } = positionA
    const { lx: bLx, rx: bRx, ty: bTy } = positionB
    isIntersect = bLx <= aRx || aLx <= bRx
    relativeHeight = bTy - aBy
    isBlow = bTy >= aTy
    return {
      isIntersect,
      isBlow,
      relativeHeight
    }
  }

  async storeRenderedInfo({ page, element, pageUsedHeight, pageNumber }) {
    if (!element) return
    const { id } = element
    if (pageUsedHeight !== undefined) {
      this.renderedElementMap[id] = {
        name: element.component,
        position: element.position,
        realPageHeight: pageUsedHeight,
        pageNumber: pageNumber,
        height: element.style.height
      }
    } else {
      // FIXME: 应该不会走这个分支
      await page.mount()
      const { height } = element.getBoundingClientRect()
      this.renderedElementMap[id] = {
        name: element.component,
        position: element.position,
        realPageHeight: height + element.style.top,
        pageNumber: pageNumber,
        height: element.style.height
      }
      page.unmount()
    }
  }
}

const layoutToGenerator = {
  fixed: FixedPageGenerator,
  relative: RelativePageGenerator
}

export function getPageGenerator({ renderElements, pagerConfig, dataSet, dataSource }) {
  const { pageLayout = 'fixed' } = pagerConfig
  const Generator = layoutToGenerator[pageLayout]
  return new Generator({ renderElements, pagerConfig, dataSet, dataSource })
}
