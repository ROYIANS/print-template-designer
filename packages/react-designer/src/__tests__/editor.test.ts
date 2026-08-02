import { describe, expect, it, vi } from 'vitest'
import {
  createSimpleTableProps,
  getPageDimensions,
  normalizeSimpleTableProps,
  type ComponentSchema,
  type RenderContext,
  type TemplateSchema,
} from '@ptd/core'
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
      pageMarginLeft: 8,
      pageMarginRight: 8,
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

function tableComponent(id: string, locked = false): ComponentSchema {
  return {
    ...component(id, 0, 0, 500, 200),
    component: 'RoySimpleTable',
    propValue: createSimpleTableProps(),
    isLock: locked,
  }
}

function proofTemplate(records: readonly { orderNo: string }[]): TemplateSchema {
  return {
    ...template([textComponent('text'), tableComponent('table')]),
    data: {
      version: 1,
      fields: [{ id: 'field-order', name: '订单号', path: ['orderNo'], valueType: 'string' }],
      sampleRecords: records,
    },
  }
}

function hostProofContext(recordIndex = 1): RenderContext {
  const records = [{ orderNo: 'HOST-001' }, { orderNo: 'HOST-002' }]
  return {
    data: records,
    record: records[recordIndex],
    recordIndex,
    locale: 'en-GB',
    timeZone: 'Europe/London',
    now: '2026-08-01T02:00:00.000Z',
    mode: 'proof',
  }
}

describe('EditorStore history and ownership', () => {
  it('keeps proof mode and record switching outside template changes and history', () => {
    const onChange = vi.fn()
    const store = new EditorStore(proofTemplate([{ orderNo: 'CC-001' }, { orderNo: 'CC-002' }]), {
      onChange,
    })

    expect(store.sampleRecords.value).toHaveLength(2)
    store.setProofMode(true)
    store.setProofRecordIndex(1)

    expect(store.proofRenderContext.value).toMatchObject({
      record: { orderNo: 'CC-002' },
      recordIndex: 1,
      locale: 'zh-CN',
      timeZone: 'Asia/Shanghai',
      mode: 'proof',
    })
    expect(store.history.value).toHaveLength(1)
    expect(onChange).not.toHaveBeenCalled()
    expect(store.startContentEditing('text')).toBe(false)
    expect(store.selectTableCell('table', 0, 0)).toBe(false)
    expect(store.startTableCellEditing('table', 'cell-1')).toBe(false)
  })

  it('uses an authoritative Host record until the user explicitly switches records', () => {
    const renderContext = hostProofContext()
    const store = new EditorStore(proofTemplate([{ orderNo: 'SAMPLE-001' }]), {
      renderContext,
    })

    store.setProofMode(true)
    expect(store.proofRenderContext.value).toMatchObject({
      record: { orderNo: 'HOST-002' },
      recordIndex: 1,
      locale: 'en-GB',
      timeZone: 'Europe/London',
      now: '2026-08-01T02:00:00.000Z',
    })

    store.setProofRecordIndex(0)
    expect(store.proofRenderContext.value?.record).toEqual({ orderNo: 'HOST-001' })
    expect(store.history.value).toHaveLength(1)
  })

  it('isolates proof UI across external templates while retaining the same controlled Host context', () => {
    const onChange = vi.fn()
    const renderContext = hostProofContext()
    const store = new EditorStore(proofTemplate([{ orderNo: 'SAMPLE-001' }]), {
      onChange,
      renderContext,
    })
    store.setProofMode(true)
    store.setProofRecordIndex(0)

    const replacement = {
      ...proofTemplate([{ orderNo: 'NEW-SAMPLE' }]),
      pageConfig: { ...proofTemplate([]).pageConfig, title: '另一份模板' },
    }
    store.syncExternal(replacement)

    expect(store.proofMode.value).toBe(false)
    expect(store.proofRecordIndex.value).toBe(1)
    expect(store.history.value).toEqual([replacement])
    expect(onChange).not.toHaveBeenCalled()

    store.setHostRenderContext(renderContext)
    store.setProofMode(true)
    expect(store.proofRenderContext.value?.record).toEqual({ orderNo: 'HOST-002' })
    expect(store.template.value).toBe(replacement)
  })

  it('keeps a bounded, unique recent-color list as instance-only UI state', () => {
    const first = new EditorStore(template())
    const second = new EditorStore(template())

    first.recordRecentColor('#ABCDEF')
    first.recordRecentColor('#123456')
    first.recordRecentColor('#abcdef')
    for (let index = 0; index < 9; index += 1) {
      first.recordRecentColor(`#00000${index}`)
    }
    first.recordRecentColor('transparent')

    expect(first.recentColors.value).toHaveLength(8)
    expect(first.recentColors.value[0]).toBe('#000008')
    expect(first.recentColors.value.filter((color) => color === '#abcdef')).toHaveLength(0)
    expect(second.recentColors.value).toEqual([])
    expect(first.history.value).toHaveLength(1)
    expect(first.template.value).not.toBe(second.template.value)
  })

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

  it('selects a table cell range without schema history and clears it across objects', () => {
    const store = new EditorStore(template([tableComponent('table'), component('shape', 520)]))

    expect(store.selectTableCell('table', 0, 0)).toBe(true)
    expect(store.tableCellSelection.value).toEqual({
      componentId: 'table',
      anchorRow: 0,
      anchorColumn: 0,
      focusRow: 0,
      focusColumn: 0,
    })
    expect(store.selectTableCell('table', 1, 1, true)).toBe(true)
    expect(store.tableCellSelection.value).toMatchObject({ focusRow: 1, focusColumn: 1 })
    expect(store.history.value).toHaveLength(1)

    store.selectComponent('shape')
    expect(store.tableCellSelection.value).toBeNull()
    expect(store.editingTableCell.value).toBeNull()
  })

  it('commits table cell text as one history entry and cancels without mutations', () => {
    const onChange = vi.fn()
    const store = new EditorStore(template([tableComponent('table')]), { onChange })

    expect(store.startTableCellEditing('table', 'cell-1')).toBe(true)
    store.cancelTableCellEditing('table', 'cell-1')
    expect(store.history.value).toHaveLength(1)
    expect(onChange).not.toHaveBeenCalled()

    expect(store.startTableCellEditing('table', 'cell-1')).toBe(true)
    store.commitTableCellEditing('table', 'cell-1', '客户名称')

    const current = normalizeSimpleTableProps(store.components.value[0]?.propValue)
    expect(current.cells['cell-1']?.text).toBe('客户名称')
    expect(store.editingTableCell.value).toBeNull()
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)
    store.undo()
    expect(
      normalizeSimpleTableProps(store.components.value[0]?.propValue).cells['cell-1']?.text,
    ).toBe('')
  })

  it('rejects cell selection and editing for locked or non-table components', () => {
    const store = new EditorStore(
      template([tableComponent('locked-table', true), component('shape', 520)]),
    )

    expect(store.selectTableCell('locked-table', 0, 0)).toBe(false)
    expect(store.startTableCellEditing('locked-table', 'cell-1')).toBe(false)
    expect(store.selectTableCell('shape', 0, 0)).toBe(false)
    expect(store.tableCellSelection.value).toBeNull()
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

  it('keeps the display unit instance-local and outside template history', () => {
    const initial = template()
    const onChange = vi.fn()
    const first = new EditorStore(initial, { onChange })
    const second = new EditorStore(initial)

    first.setMeasurementUnit('px')

    expect(first.measurementUnit.value).toBe('px')
    expect(second.measurementUnit.value).toBe('mm')
    expect(first.template.value).toBe(initial)
    expect(first.history.value).toEqual([initial])
    expect(first.canUndo.value).toBe(false)
    expect(onChange).not.toHaveBeenCalled()

    first.syncExternal(template())
    expect(first.measurementUnit.value).toBe('px')
  })
})

describe('EditorStore commands', () => {
  it('updates valid page configuration as one gesture and rejects invalid margins', () => {
    const initial = template()
    const onChange = vi.fn()
    const store = new EditorStore(initial, { onChange })

    store.beginGesture()
    expect(store.updatePageConfig({ pageMarginLeft: 12 }, true)).toBe(true)
    expect(store.updatePageConfig({ pageMarginLeft: 14 }, true)).toBe(true)
    store.commitGesture()

    expect(store.pageConfig.value.pageMarginLeft).toBe(14)
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(2)

    expect(store.updatePageConfig({ pageMarginRight: 210 })).toBe(false)
    expect(store.pageConfig.value.pageMarginRight).toBe(8)
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('derives out-of-bounds components after page resize without changing their geometry', () => {
    const initial = template([component('inside', 20), component('outside', 520)])
    const store = new EditorStore(initial)
    const originalStyle = store.components.value[1]!.style

    expect(store.outOfBoundsComponents.value).toEqual([])
    expect(
      store.updatePageConfig({
        pageSize: 'custom',
        pageWidth: 100,
        pageHeight: 100,
        pageCurHeight: 100,
      }),
    ).toBe(true)

    expect(store.outOfBoundsComponents.value.map((item) => item.id)).toEqual(['outside'])
    expect(store.components.value[1]!.style).toBe(originalStyle)
    expect(store.components.value[1]!.style.left).toBe(520)
  })

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

  it('canonicalizes imported data once and ignores structurally identical repeated applications', () => {
    const onChange = vi.fn()
    const store = new EditorStore(template(), { onChange })
    const data = {
      version: 1 as const,
      fields: [
        { id: 'field-order', name: '订单号', path: ['orderNo'], valueType: 'string' as const },
      ],
      sampleRecords: [{ orderNo: 'CC-001' }],
    }

    expect(store.replaceTemplateData(data)).toBe(true)
    expect(store.template.value.data).toEqual(data)
    expect(store.template.value.dataSource).toBeUndefined()
    expect(store.template.value.dataSet).toBeUndefined()
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)

    expect(store.replaceTemplateData(JSON.parse(JSON.stringify(data)) as typeof data)).toBe(false)
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('renames and formats a field without changing its stable identity or fragmenting history', () => {
    const onChange = vi.fn()
    const store = new EditorStore(proofTemplate([{ orderNo: 'CC-001' }]), { onChange })

    expect(
      store.updateDataField('field-order', {
        name: '出库单号',
        formatter: { kind: 'none' },
      }),
    ).toBe(true)
    expect(store.normalizedTemplateData.value.data.fields[0]).toMatchObject({
      id: 'field-order',
      path: ['orderNo'],
      name: '出库单号',
      formatter: { kind: 'none' },
    })
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)

    expect(
      store.updateDataField('field-order', {
        name: '出库单号',
        formatter: { kind: 'none' },
      }),
    ).toBe(false)
    expect(store.history.value).toHaveLength(2)
  })

  it('sets direct and mixed text bindings as discrete commands and preserves no-op semantics', () => {
    const onChange = vi.fn()
    const store = new EditorStore(proofTemplate([{ orderNo: 'CC-001' }]), {
      onChange,
      idFactory: () => 'binding-new',
    })
    const target = { kind: 'text' } as const
    const direct = { kind: 'field', fieldId: 'field-order' } as const

    expect(store.setComponentBinding('text', target, direct)).toBe(true)
    expect(store.components.value[0]?.bindings).toEqual([
      { id: 'binding-new', target, expression: direct },
    ])
    expect(store.setComponentBinding('text', target, { ...direct })).toBe(false)
    expect(store.history.value).toHaveLength(2)
    expect(onChange).toHaveBeenCalledTimes(1)

    const mixed = {
      kind: 'text' as const,
      segments: [
        { kind: 'literal' as const, value: '出库单：' },
        { kind: 'field' as const, fieldId: 'field-order' },
      ],
    }
    expect(store.setComponentBinding('text', target, mixed)).toBe(true)
    expect(store.components.value[0]?.bindings?.[0]?.expression).toEqual(mixed)
    expect(store.removeComponentBinding('text', target)).toBe(true)
    expect(store.components.value[0]?.bindings).toEqual([])
    expect(store.removeComponentBinding('text', target)).toBe(false)
    expect(store.history.value).toHaveLength(4)
  })

  it('supports table-cell bindings while rejecting every binding mutation on locked objects', () => {
    const store = new EditorStore(proofTemplate([{ orderNo: 'CC-001' }]), {
      idFactory: () => 'cell-binding',
    })
    const target = { kind: 'table-cell-text', cellId: 'cell-1' } as const
    expect(
      store.setComponentBinding(
        'table',
        { ...target, cellId: 'missing-cell' },
        {
          kind: 'field',
          fieldId: 'field-order',
        },
      ),
    ).toBe(false)
    expect(
      store.setComponentBinding(
        'text',
        { kind: 'image-source' },
        {
          kind: 'field',
          fieldId: 'field-order',
        },
      ),
    ).toBe(false)
    expect(
      store.setComponentBinding('table', target, { kind: 'field', fieldId: 'field-order' }),
    ).toBe(true)
    expect(store.components.value[1]?.bindings?.[0]).toMatchObject({ target })

    store.selectComponent('table')
    store.setLock(true)
    const historyLength = store.history.value.length
    expect(
      store.setComponentBinding('table', target, { kind: 'field', fieldId: 'field-order' }),
    ).toBe(false)
    expect(store.removeComponentBinding('table', target)).toBe(false)
    expect(store.history.value).toHaveLength(historyLength)
  })

  it('removes sample records without deleting fields or component bindings', () => {
    const value = proofTemplate([{ orderNo: 'CC-001' }])
    value.pages[0]!.componentData[0] = {
      ...value.pages[0]!.componentData[0]!,
      bindings: [
        {
          id: 'binding-order',
          target: { kind: 'text' },
          expression: { kind: 'field', fieldId: 'field-order' },
        },
      ],
    }
    const store = new EditorStore(value)

    expect(store.removeSampleRecords()).toBe(true)
    expect(store.sampleRecords.value).toEqual([])
    expect(store.normalizedTemplateData.value.data.fields).toHaveLength(1)
    expect(store.components.value[0]?.bindings).toHaveLength(1)
    expect(store.removeSampleRecords()).toBe(false)
    expect(store.history.value).toHaveLength(2)
  })
})
