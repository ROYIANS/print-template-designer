/** @vitest-environment jsdom */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { DEFAULT_PAGE_CONFIG, type TemplateSchema } from '@ptd/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PropertyInspector } from '../components/PropertyInspector/PropertyInspector'
import { EditorStore, EditorStoreProvider } from '../state'

function template(): TemplateSchema {
  return {
    _version: 2,
    pageConfig: { ...DEFAULT_PAGE_CONFIG },
    pages: [{ id: 'page-1', componentData: [] }],
    data: { version: 1, fields: [] },
  }
}

describe('PropertyInspector headless page settings', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
  })

  it('uses PTD headless Select and Segmented wrappers for page settings', async () => {
    const store = new EditorStore(template())
    await act(async () => {
      root.render(
        <EditorStoreProvider store={store}>
          <PropertyInspector />
        </EditorStoreProvider>,
      )
    })

    expect(container.querySelector('[role="combobox"][aria-label="纸张规格"]')).not.toBeNull()
    expect(container.querySelector('[role="combobox"][aria-label="默认字体"]')).not.toBeNull()
    expect(container.querySelector('[role="group"][aria-label="页面方向"]')).not.toBeNull()
    expect(container.querySelector('[role="group"][aria-label="边距模式"]')).not.toBeNull()
    expect(container.querySelector('select')).toBeNull()
  })
})
