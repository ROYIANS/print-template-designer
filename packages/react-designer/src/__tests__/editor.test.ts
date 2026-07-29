import { describe, expect, it, vi } from 'vitest'
import type { ComponentSchema, TemplateSchema } from '@ptd/core'
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

describe('EditorStore history and ownership', () => {
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
