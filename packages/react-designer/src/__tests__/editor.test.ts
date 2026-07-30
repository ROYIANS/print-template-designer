import { describe, expect, it, vi } from 'vitest'
import { getPageDimensions, type ComponentSchema, type TemplateSchema } from '@ptd/core'
import { EditorStore } from '../state/editor'

function component(id: string, left: number, top = 0, width = 10, height = 10): ComponentSchema {
  return {
    id,
    component: 'RoyRect',
    propValue: null,
    style: { left, top, width, height, rotate: 0, opacity: 1 },
    groupStyle: {},
    position: {},
  }
}

function template(components = [component('a', 0), component('b', 20)]): TemplateSchema {
  return {
    _version: 1,
    pageConfig: {
      pageSize: 'A4',
      pageDirection: 'p',
      pageLayout: 'fixed',
      pageWidth: 210,
      pageHeight: 297,
      pageCurHeight: 297,
      pageMarginBottom: 8,
      pageMarginTop: 8,
      title: 'test',
      scale: 1,
      background: '#fff',
      color: '#222',
      fontSize: 12,
      fontFamily: 'sans-serif',
      lineHeight: 1,
    },
    pages: [{ id: 'page-1', componentData: components }],
    dataSource: [],
    dataSet: {},
  }
}

function textComponent(
  id: string,
  type: 'RoySimpleText' | 'RoyText' = 'RoySimpleText',
): ComponentSchema {
  return {
    ...component(id, 0, 0, 200, 50),
    component: type,
    propValue: type === 'RoyText' ? '<p>初始富文本</p>' : '初始文本',
  }
}

function imageComponent(id: string): ComponentSchema {
  return {
    ...component(id, 0, 0, 200, 150),
    component: 'RoyImage',
    propValue: '/legacy/logo.png',
  }
}

describe('EditorStore history and ownership', () => {
  it('commits one direct content-edit session as one document history step', () => {
    const onChange = vi.fn()
    const store = new EditorStore(template([textComponent('text')]), { onChange })

    expect(store.startContentEditing('text')).toBe(true)
    expect(store.editingComponentId.value).toBe('text')
    store.commitContentEditing('text', '新的内容')

    expect(store.editingComponentId.value).toBeNull()
    expect(store.components.value[0]?.propValue).toBe('新的内容')
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)
    store.undo()
    expect(store.components.value[0]?.propValue).toBe('初始文本')
  })

  it('cancels direct content editing without changing schema or history', () => {
    const initial = template([textComponent('rich', 'RoyText')])
    const store = new EditorStore(initial)

    expect(store.startContentEditing('rich')).toBe(true)
    store.cancelContentEditing('rich')

    expect(store.template.value).toBe(initial)
    expect(store.history.value).toHaveLength(1)
    expect(store.editingComponentId.value).toBeNull()
  })

  it('rejects direct editing for locked and non-text components', () => {
    const locked = { ...textComponent('locked'), isLock: true }
    const store = new EditorStore(template([locked, component('shape', 20)]))

    expect(store.startContentEditing('locked')).toBe(false)
    expect(store.startContentEditing('shape')).toBe(false)
    expect(store.editingComponentId.value).toBeNull()
  })

  it('undoes the first mutation and redoes it', () => {
    const initial = template()
    const store = new EditorStore(initial)
    store.selectComponent('a')
    store.updateComponentStyle('a', { left: 8 })
    expect(store.components.value[0]?.style.left).toBe(8)
    store.undo()
    expect(store.template.value).toBe(initial)
    expect(store.components.value[0]?.style.left).toBe(0)
    store.redo()
    expect(store.components.value[0]?.style.left).toBe(8)
  })

  it('discards redo after a new mutation and caps history', () => {
    const store = new EditorStore(template())
    store.updateComponentStyle('a', { left: 1 })
    store.updateComponentStyle('a', { left: 2 })
    store.undo()
    store.updateComponentStyle('a', { left: 3 })
    expect(store.canRedo.value).toBe(false)
    for (let left = 4; left < 30; left++) store.updateComponentStyle('a', { left })
    expect(store.history.value).toHaveLength(20)
  })

  it('commits a transient gesture as one history entry', () => {
    const onChange = vi.fn()
    const store = new EditorStore(template(), { onChange })
    store.beginGesture()
    store.transformComponent('a', { left: 5 }, true)
    store.transformComponent('a', { left: 10 }, true)
    store.commitGesture()
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(2)
    store.undo()
    expect(store.components.value[0]?.style.left).toBe(0)
  })

  it('migrates legacy image content through one inspector gesture and undoes atomically', () => {
    const onChange = vi.fn()
    const store = new EditorStore(template([imageComponent('image')]), { onChange })

    store.beginGesture()
    store.updateComponent(
      'image',
      {
        propValue: {
          src: '/assets/logo.png',
          alt: '公司 Logo',
          fit: 'contain',
          position: 'center',
        },
      },
      true,
    )
    store.updateComponent(
      'image',
      {
        propValue: {
          src: '/assets/logo.png',
          alt: '企业标识',
          fit: 'cover',
          position: 'center',
        },
      },
      true,
    )
    store.commitGesture()

    expect(store.components.value[0]?.propValue).toMatchObject({
      alt: '企业标识',
      fit: 'cover',
    })
    expect(store.history.value).toHaveLength(2)
    store.undo()
    expect(store.components.value[0]?.propValue).toBe('/legacy/logo.png')
    expect(onChange).toHaveBeenCalledTimes(3)
  })

  it('cancels a transient gesture without adding history', () => {
    const initial = template()
    const onChange = vi.fn()
    const store = new EditorStore(initial, { onChange })
    store.selectComponent('a')
    store.beginGesture()
    store.transformComponent('a', { left: 12 }, true)

    store.cancelGesture()

    expect(store.template.value).toBe(initial)
    expect(store.components.value[0]?.style.left).toBe(0)
    expect(store.history.value).toHaveLength(1)
    expect(store.canUndo.value).toBe(false)
    expect(store.selectedIds.value).toEqual(['a'])
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('keeps instances isolated and does not mutate caller input', () => {
    const initial = template()
    const first = new EditorStore(initial)
    const second = new EditorStore(initial)
    first.updateComponentStyle('a', { left: 99 })
    expect(second.components.value[0]?.style.left).toBe(0)
    expect(initial.pages[0]?.componentData[0]?.style.left).toBe(0)
  })
})

describe('EditorStore commands', () => {
  it('switches existing pages without changing template history', () => {
    const initial = template()
    const secondPage = { id: 'page-2', name: '第二页', componentData: [component('c', 12)] }
    initial.pages.push(secondPage)
    const store = new EditorStore(initial, { idFactory: () => 'guide-1' })
    store.selectComponent('a')
    store.addGuide('x', 24)

    store.setCurrentPage(1)
    expect(store.currentPage.value).toBe(secondPage)
    expect(store.selectedIds.value).toEqual([])
    expect(store.guides.value).toEqual([])
    expect(store.history.value).toHaveLength(1)

    store.setCurrentPage(99)
    expect(store.currentPageIndex.value).toBe(1)
  })

  it('adds a blank page as one controlled history mutation', () => {
    let id = 0
    const onChange = vi.fn()
    const store = new EditorStore(template(), {
      idFactory: () => `page-${++id}`,
      onChange,
    })
    store.selectComponent('a')
    store.addGuide('x', 24)

    expect(store.addPage()).toBe('page-2')
    expect(store.template.value.pages.map((page) => page.id)).toEqual(['page-1', 'page-2'])
    expect(store.currentPageIndex.value).toBe(1)
    expect(store.components.value).toEqual([])
    expect(store.selectedIds.value).toEqual([])
    expect(store.guides.value).toEqual([])
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)

    store.undo()
    expect(store.template.value.pages.map((page) => page.id)).toEqual(['page-1'])
    expect(store.currentPageIndex.value).toBe(0)
    store.redo()
    expect(store.template.value.pages.map((page) => page.id)).toEqual(['page-1', 'page-2'])
    expect(store.currentPage.value).toBeDefined()
  })

  it('duplicates a page with fresh nested component ids', () => {
    let id = 0
    const sourceChild = component('child-original', 4)
    const group: ComponentSchema = {
      id: 'group-original',
      component: 'RoyGroup',
      propValue: [sourceChild],
      style: { left: 10, top: 12, width: 20, height: 20, rotate: 0, opacity: 1 },
      groupStyle: {},
      position: {},
    }
    const store = new EditorStore(template([group]), {
      idFactory: () => `duplicate-${++id}`,
    })

    expect(store.duplicatePage()).toBe('duplicate-1')
    const copiedPage = store.template.value.pages[1]
    const copiedGroup = copiedPage?.componentData[0]
    const copiedChild = Array.isArray(copiedGroup?.propValue)
      ? (copiedGroup.propValue[0] as ComponentSchema | undefined)
      : undefined
    expect(copiedPage?.id).toBe('duplicate-1')
    expect(copiedGroup?.id).toBe('duplicate-2')
    expect(copiedChild?.id).toBe('duplicate-3')
    expect(copiedGroup).not.toBe(group)
    expect(copiedChild).not.toBe(sourceChild)
    expect(store.currentPageIndex.value).toBe(1)
    expect(store.history.value).toHaveLength(2)
  })

  it('deletes a page, selects the nearest survivor and protects the final page', () => {
    const initial = template()
    initial.pages.push(
      { id: 'page-2', componentData: [component('c', 12)] },
      { id: 'page-3', componentData: [component('d', 24)] },
    )
    const onChange = vi.fn()
    const store = new EditorStore(initial, { onChange })
    store.setCurrentPage(1)

    store.deletePage()
    expect(store.template.value.pages.map((page) => page.id)).toEqual(['page-1', 'page-3'])
    expect(store.currentPage.value?.id).toBe('page-3')
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)

    store.undo()
    expect(store.template.value.pages.map((page) => page.id)).toEqual([
      'page-1',
      'page-2',
      'page-3',
    ])
    expect(store.currentPage.value?.id).toBe('page-3')

    const single = new EditorStore(template(), { onChange })
    single.deletePage()
    expect(single.template.value.pages).toHaveLength(1)
    expect(single.history.value).toHaveLength(1)
  })

  it('reorders pages while preserving active page identity and selection', () => {
    const initial = template()
    initial.pages.push(
      { id: 'page-2', componentData: [component('c', 12)] },
      { id: 'page-3', componentData: [component('d', 24)] },
    )
    const onChange = vi.fn()
    const store = new EditorStore(initial, { onChange })
    store.setCurrentPage(1)
    store.selectComponent('c')

    store.movePage(1, 0)
    expect(store.template.value.pages.map((page) => page.id)).toEqual([
      'page-2',
      'page-1',
      'page-3',
    ])
    expect(store.currentPage.value?.id).toBe('page-2')
    expect(store.currentPageIndex.value).toBe(0)
    expect(store.selectedIds.value).toEqual(['c'])
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)

    store.undo()
    expect(store.template.value.pages.map((page) => page.id)).toEqual([
      'page-1',
      'page-2',
      'page-3',
    ])
    expect(store.currentPage.value?.id).toBe('page-2')
    expect(store.currentPageIndex.value).toBe(1)
    expect(store.selectedIds.value).toEqual(['c'])
  })

  it('keeps colored guide state outside the template history', () => {
    let id = 0
    const initial = template()
    const store = new EditorStore(initial, { idFactory: () => `guide-${++id}` })

    const guideId = store.addGuide('x', 24.5)
    store.setGuideColor('vermilion')
    store.moveGuide(guideId!, 30)

    expect(store.guides.value).toEqual([
      { id: 'guide-1', axis: 'x', positionMm: 30, color: 'vermilion' },
    ])
    expect(store.template.value).toBe(initial)
    expect(store.history.value).toHaveLength(1)

    store.toggleGuidesLocked()
    store.moveGuide(guideId!, 40)
    store.removeSelectedGuide()
    expect(store.guides.value[0]?.positionMm).toBe(30)

    store.toggleGuidesLocked()
    store.removeSelectedGuide()
    expect(store.guides.value).toEqual([])
  })

  it('keeps guides inside the physical page across creation, movement and rotation', () => {
    let id = 0
    const store = new EditorStore(template(), { idFactory: () => `guide-${++id}` })

    const vertical = store.addGuide('x', 999)
    const horizontal = store.addGuide('y', -12)
    expect(store.guides.value.map((guide) => guide.positionMm)).toEqual([210, 0])

    store.moveGuide(vertical!, -1)
    store.moveGuide(horizontal!, 999)
    expect(store.guides.value.map((guide) => guide.positionMm)).toEqual([0, 297])

    store.setPageDirection('l')
    expect(store.guides.value.map((guide) => guide.positionMm)).toEqual([0, 210])

    store.moveGuide(vertical!, 999)
    expect(store.guides.value[0]?.positionMm).toBe(297)
  })

  it('copies, cuts and pastes with fresh ids and offsets', () => {
    let id = 0
    const store = new EditorStore(template(), { idFactory: () => `new-${++id}` })
    store.selectComponent('a')
    store.copy()
    store.paste()
    expect(store.components.value.at(-1)).toMatchObject({
      id: 'new-1',
      style: { left: 12, top: 12 },
    })
    store.selectComponent('b')
    store.cut()
    expect(store.components.value.some((item) => item.id === 'b')).toBe(false)
    store.paste()
    expect(store.clipboard.value).toBeNull()
    expect(store.components.value.at(-1)?.id).toBe('new-2')
  })

  it('pastes a multi-selection at a paper position as one history entry', () => {
    let id = 0
    const onChange = vi.fn()
    const store = new EditorStore(template(), {
      idFactory: () => `pasted-${++id}`,
      onChange,
    })
    store.selectComponents(['a', 'b'])
    store.copy()

    store.pasteAt(100, 80)

    expect(
      store.components.value.slice(-2).map((item) => [item.id, item.style.left, item.style.top]),
    ).toEqual([
      ['pasted-1', 100, 80],
      ['pasted-2', 120, 80],
    ])
    expect(store.selectedIds.value).toEqual(['pasted-1', 'pasted-2'])
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)

    store.undo()
    expect(store.components.value.map((item) => item.id)).toEqual(['a', 'b'])
  })

  it('clamps a positioned paste into the physical paper bounds', () => {
    let id = 0
    const store = new EditorStore(template(), { idFactory: () => `pasted-${++id}` })
    store.selectComponents(['a', 'b'])
    store.copy()

    store.pasteAt(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)

    const page = getPageDimensions(store.pageConfig.value)
    const pasted = store.components.value.slice(-2)
    expect(Math.max(...pasted.map((item) => Number(item.style.left) + item.style.width))).toBe(
      page.width,
    )
    expect(Math.max(...pasted.map((item) => Number(item.style.top) + item.style.height))).toBe(
      page.height,
    )
  })

  it('tracks a one-shot component reveal request outside template history', () => {
    const store = new EditorStore(template())
    const next = component('new-component', 20)
    store.addComponent(next)
    const historyLength = store.history.value.length

    store.requestComponentReveal(next.id)
    expect(store.componentToReveal.value).toBe(next.id)
    expect(store.history.value).toHaveLength(historyLength)

    store.finishComponentReveal('another-component')
    expect(store.componentToReveal.value).toBe(next.id)
    store.finishComponentReveal(next.id)
    expect(store.componentToReveal.value).toBeNull()
  })

  it('preserves relative order for layer commands', () => {
    const store = new EditorStore(
      template([component('a', 0), component('b', 10), component('c', 20), component('d', 30)]),
    )
    store.selectComponents(['b', 'c'])
    store.moveLayer('front')
    expect(store.components.value.map((item) => item.id)).toEqual(['a', 'd', 'b', 'c'])
    store.moveLayer('back')
    expect(store.components.value.map((item) => item.id)).toEqual(['b', 'c', 'a', 'd'])
  })

  it('aligns and distributes selected components', () => {
    const store = new EditorStore(
      template([component('a', 0, 5, 10), component('b', 40, 20, 20), component('c', 90, 30, 10)]),
    )
    store.selectComponents(['a', 'b', 'c'])
    store.align('top')
    expect(store.components.value.map((item) => item.style.top)).toEqual([5, 5, 5])
    store.distribute('horizontal')
    expect(store.components.value.map((item) => item.style.left)).toEqual([0, 40, 90])
  })

  it('round-trips positions through group and ungroup', () => {
    let id = 0
    const store = new EditorStore(template(), { idFactory: () => `group-${++id}` })
    store.selectComponents(['a', 'b'])
    store.group()
    expect(store.components.value).toHaveLength(1)
    expect(store.components.value[0]?.component).toBe('RoyGroup')
    store.ungroup()
    expect(
      store.components.value.map((item) => [item.id, item.style.left, item.style.top]),
    ).toEqual([
      ['a', 0, 0],
      ['b', 20, 0],
    ])
  })

  it('preserves the rendered child geometry when a transformed group is ungrouped', () => {
    let id = 0
    const store = new EditorStore(template(), { idFactory: () => `group-${++id}` })
    store.selectComponents(['a', 'b'])
    store.group()
    store.updateComponentStyle('group-1', { left: 10, top: 20, width: 60, height: 30, rotate: 90 })
    store.ungroup()

    expect(store.components.value).toHaveLength(2)
    expect(store.components.value[0]?.style).toMatchObject({
      left: 30,
      top: 0,
      width: 20,
      height: 30,
      rotate: 90,
    })
    expect(store.components.value[1]?.style).toMatchObject({
      left: 30,
      top: 40,
      width: 20,
      height: 30,
      rotate: 90,
    })
  })

  it('blocks transforms for locked components', () => {
    const locked = { ...component('a', 0), isLock: true }
    const store = new EditorStore(template([locked]))
    expect(store.transformComponent('a', { left: 10 })).toBe(false)
    store.updateComponentStyle('a', { left: 20 })
    store.updateComponent('a', { name: 'changed' })
    expect(store.components.value[0]?.style.left).toBe(0)
    expect(store.components.value[0]?.name).toBeUndefined()

    store.updateComponent('a', { isLock: false })
    expect(store.components.value[0]?.isLock).toBe(false)
  })

  it('protects locked selections from destructive and structural commands', () => {
    const locked = { ...component('a', 0), isLock: true }
    const store = new EditorStore(template([locked, component('b', 20), component('c', 50)]))
    store.selectComponents(['a', 'b', 'c'])
    const baseline = store.template.value

    store.deleteSelected()
    store.cut()
    store.moveLayer('front')
    store.align('left')
    store.distribute('horizontal')
    store.group()
    store.moveSelection(10, 10)

    expect(store.template.value).toBe(baseline)
    expect(store.history.value).toHaveLength(1)
    expect(store.clipboard.value).toBeNull()
  })

  it('does not create history entries for obvious no-op commands', () => {
    const store = new EditorStore(template())
    store.updateComponentStyle('missing', { left: 10 })
    store.selectComponent('a')
    store.updateComponentStyle('a', { left: 0 })
    store.setLock(false)
    expect(store.history.value).toHaveLength(1)
  })

  it('resets history only for genuinely external values', () => {
    const store = new EditorStore(template())
    let emitted: TemplateSchema | undefined
    store.setOnChange((next) => {
      emitted = next
    })
    store.updateComponentStyle('a', { left: 4 })
    store.syncExternal(emitted!)
    expect(store.history.value).toHaveLength(2)
    store.syncExternal(template([component('external', 1)]))
    expect(store.history.value).toHaveLength(1)
    expect(store.selectedIds.value).toEqual([])
  })
})
