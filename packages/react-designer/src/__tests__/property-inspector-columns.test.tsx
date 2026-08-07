/** @vitest-environment jsdom */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { DEFAULT_PAGE_CONFIG, type ComponentSchema, type TemplateSchema } from '@ptd/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PropertyInspector } from '../components/PropertyInspector/PropertyInspector'
import { EditorStore, EditorStoreProvider } from '../state'

function component(id: string, type: ComponentSchema['component']): ComponentSchema {
  return {
    id,
    component: type,
    propValue: type === 'RoyText' ? '<p>富文本</p>' : type === 'RoySimpleText' ? '普通文本' : '',
    style: { left: 0, top: 0, width: 240, height: 120, rotate: 0, opacity: 1 },
    groupStyle: {},
    position: {},
  }
}

function template(): TemplateSchema {
  return {
    _version: 2,
    pageConfig: { ...DEFAULT_PAGE_CONFIG },
    pages: [
      {
        id: 'page-1',
        componentData: [
          component('plain', 'RoySimpleText'),
          component('rich', 'RoyText'),
          component('rect', 'RoyRect'),
        ],
      },
    ],
    data: { version: 1, fields: [] },
  }
}

describe('PropertyInspector text columns', () => {
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
    container.remove()
  })

  it('shows bounded column controls for both text types and hides them for non-text components', () => {
    const store = new EditorStore(template())
    act(() => {
      store.selectComponent('plain')
      root.render(
        <EditorStoreProvider store={store}>
          <PropertyInspector />
        </EditorStoreProvider>,
      )
    })
    expect(container.textContent).toContain('文字分栏')
    expect(container.textContent).toContain('栏间距')
    expect(container.textContent).toContain('分栏填充')

    act(() => store.selectComponent('rich'))
    expect(container.textContent).toContain('文字分栏')

    act(() => store.selectComponent('rect'))
    expect(container.textContent).not.toContain('文字分栏')
    expect(container.textContent).not.toContain('分栏填充')
  })
})
