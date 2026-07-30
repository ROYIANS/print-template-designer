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
    title: '新建模板',
    scale: 1,
    background: '#fcfdff',
    color: '#1d2735',
    fontSize: 12,
    fontFamily: "'Noto Serif SC', 'Noto Serif CJK SC', 'Source Han Serif SC', serif",
    lineHeight: 1.4,
  },
  pages: [
    {
      id: 'page-1',
      componentData: [],
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
