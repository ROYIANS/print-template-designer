import store from '@/stores'

export class DataSourceMenu {
  constructor() {
    this.title = '插入数据源'
    this.iconSvg =
      '<svg t="1668068610449" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2016" width="200" height="200"><path d="M492.051948 1024C257.139726 1024 73.142857 939.009039 73.142857 837.818185L73.142857 186.181819C73.142857 84.923609 257.139726 0 492.051948 0 726.958586 0 910.961042 84.923609 910.961042 186.181819L910.961042 837.818185C910.961042 939.009039 726.96417 1024 492.051948 1024L492.051948 1024ZM492.051948 46.545455C269.336719 46.545455 119.688312 124.43345 119.688312 186.181819L119.688312 837.818185C119.688312 899.594869 269.336719 977.454548 492.051948 977.454548 714.778147 977.454548 864.415583 899.594869 864.415583 837.818185L864.415583 186.181819C864.415583 124.43345 714.778147 46.545455 492.051948 46.545455L492.051948 46.545455ZM492.051948 837.818185C257.139726 837.818185 73.142857 745.389773 73.142857 605.090909 73.142857 615.100114 82.036363 605.090909 73.142857 605.090909 104.120063 605.090909 113.00938 615.100114 119.688312 605.090909 113.00938 707.522287 265.340848 793.266461 492.051948 791.272726 718.763049 793.266461 871.088933 707.522287 864.415583 605.090909 871.088933 615.100114 879.982438 605.090909 910.961042 605.090909 902.066139 605.090909 910.961042 615.100114 910.961042 605.090909 910.961042 745.389773 726.96417 837.818185 492.051948 837.818185L492.051948 837.818185ZM73.142857 372.363636C104.120063 372.363636 113.00938 382.379348 119.688312 372.363636 113.00938 474.79776 265.340848 560.550469 492.051948 558.545455 718.763049 560.550469 871.088933 474.79776 864.415583 372.363636 871.088933 382.379348 879.982438 372.363636 910.961042 372.363636 910.961042 512.666258 726.96417 605.090909 492.051948 605.090909 257.139726 605.090909 73.142857 512.672497 73.142857 372.363636ZM492.051948 372.363636C257.139726 372.363636 73.142857 279.935225 73.142857 139.636364 73.142857 149.566032 82.036363 139.636364 73.142857 139.636364 104.120063 139.636364 113.00938 149.578508 119.688312 139.636364 113.00938 242.036551 265.340848 327.818151 492.051948 325.818181 718.763049 327.818151 871.088933 242.036551 864.415583 139.636364 871.088933 149.566032 879.982438 139.636364 910.961042 139.636364 902.066139 139.636364 910.961042 149.578508 910.961042 139.636364 910.961042 279.941463 726.96417 372.363636 492.051948 372.363636Z" p-id="2017"></path></svg>'
    this.tag = 'button'
    this.showDropPanel = true
  }

  // 下拉框的选项
  getPanelContentElem(editor) {
    let dataSource = store.state.printTemplateModule.dataSource
    const ul = document.createElement('ul')
    ul.style.display = 'grid'
    ul.style.justifyContent = 'center'
    ul.style.maxHeight = '200px'
    ul.style.overflowY = 'auto'
    ul.style.width = '100%'
    if (!dataSource) {
      return ul
    }
    ul.innerHTML = dataSource
      .filter((item) => {
        return item.typeName !== 'Array'
      })
      .map((item) => {
        return `<li data-value='[::${item.field}::]'>${item.title}</li>`
      })
      .join('')
    for (const liEle of ul.getElementsByTagName('li')) {
      liEle.style.listStyleType = 'none'
      liEle.style.cursor = 'pointer'
      liEle.style.margin = '3px 5px'
      liEle.style.textAlign = 'left'
      liEle.style.background = '#eee'
      liEle.style.width = '100%'
      liEle.onclick = () => {
        editor.insertText(liEle.dataset.value)
      }
    }
    return ul
  }

  getValue() {
    return ''
  }

  isActive() {
    return false
  }

  isDisabled() {
    return false
  }

  exec() {}
}

export const toolBarConfig = {
  toolbarKeys: [
    'bold',
    'underline',
    'italic',
    'through',
    'sub',
    'sup',
    'clearStyle',
    'color',
    'bgColor',
    'fontSize',
    'fontFamily',
    'indent',
    'delIndent',
    'justifyLeft',
    'justifyRight',
    'justifyCenter',
    'justifyJustify',
    'lineHeight',
    'insertImage',
    'headerSelect',
    'header1',
    'header2',
    'header3',
    'header4',
    'header5',
    'undo',
    'redo',
    'enter',
    'bulletedList',
    'numberedList',
    'royDataSource'
  ]
}

export const editorConfig = {
  placeholder: '请输入内容...',
  scroll: true,
  autoFocus: true,
  MENU_CONF: {
    fontFamily: {
      fontFamilyList: [
        '黑体',
        '楷体',
        '仿宋',
        '宋体',
        'Arial',
        'Tahoma',
        'Verdana'
      ]
    },
    fontSize: {
      fontSizeList: [
        '10pt',
        '12pt',
        '13pt',
        '14pt',
        '15pt',
        '16pt',
        '19pt',
        '22pt',
        '24pt',
        '29pt',
        '32pt',
        '40pt',
        '48pt'
      ]
    }
  }
}

export const mode = 'default' // or 'default'

export const menuConfig = {
  key: 'royDataSource', // 定义 menu key ：要保证唯一、不重复（重要）
  factory() {
    return new DataSourceMenu()
  }
}
