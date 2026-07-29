import { useState } from 'react'
import { Designer, type TemplateSchema } from '@ptd/react-designer'
import styles from './App.module.css'

const INITIAL_TEMPLATE: TemplateSchema = {
  _version: 1,
  pageConfig: {
    pageSize: 'A4',
    pageDirection: 'p',
    pageLayout: 'fixed',
    pageWidth: 210,
    pageHeight: 297,
    pageCurHeight: 297,
    pageMarginBottom: 10,
    pageMarginTop: 10,
    title: '出库交接单 · 示例',
    scale: 1,
    background: '#fffdf9',
    color: '#2b2522',
    fontSize: 12,
    fontFamily: 'SimSun, serif',
    lineHeight: 1.4,
  },
  pages: [
    {
      id: 'page-1',
      componentData: [
        {
          id: 'title',
          component: 'RoySimpleText',
          name: '单据标题',
          propValue: '出库交接单',
          style: {
            left: 280,
            top: 84,
            width: 490,
            height: 56,
            rotate: 0,
            opacity: 1,
            fontSize: 28,
            fontFamily: 'SimHei, sans-serif',
            color: '#2b2522',
            justifyContent: 'center',
            alignItems: 'center',
          },
          groupStyle: {},
          position: {},
        },
        {
          id: 'accent',
          component: 'RoyRect',
          name: '标题分隔线',
          propValue: null,
          style: {
            left: 190,
            top: 158,
            width: 670,
            height: 4,
            rotate: 0,
            opacity: 1,
            background: '#cf4d34',
            borderWidth: 0,
            borderType: 'none',
          },
          groupStyle: {},
          position: {},
        },
        {
          id: 'meta',
          component: 'RoySimpleText',
          name: '单据编号',
          propValue: '单号：OUT-2026-0729-001',
          style: {
            left: 190,
            top: 190,
            width: 340,
            height: 38,
            rotate: 0,
            opacity: 1,
            fontSize: 14,
            color: '#514743',
            alignItems: 'center',
          },
          groupStyle: {},
          position: {},
        },
        {
          id: 'stamp',
          component: 'RoySimpleText',
          name: '示例标记',
          propValue: '内部流转',
          style: {
            left: 720,
            top: 205,
            width: 150,
            height: 42,
            rotate: -8,
            opacity: 0.82,
            fontSize: 17,
            color: '#9f3523',
            borderWidth: 2,
            borderColor: '#cf4d34',
            borderType: 'solid',
            borderRadius: '2px',
            justifyContent: 'center',
            alignItems: 'center',
          },
          groupStyle: {},
          position: {},
        },
        {
          id: 'body-frame',
          component: 'RoyRect',
          name: '内容区域',
          propValue: null,
          style: {
            left: 190,
            top: 270,
            width: 670,
            height: 420,
            rotate: 0,
            opacity: 1,
            background: '#fffdf9',
            borderWidth: 1,
            borderColor: '#8f827b',
            borderType: 'solid',
            borderRadius: '0px',
          },
          groupStyle: {},
          position: {},
        },
      ],
    },
  ],
  dataSource: [],
  dataSet: {},
}

function App() {
  const [template, setTemplate] = useState(INITIAL_TEMPLATE)
  return (
    <main className={styles.app}>
      <Designer value={template} onChange={setTemplate} />
    </main>
  )
}

export default App
