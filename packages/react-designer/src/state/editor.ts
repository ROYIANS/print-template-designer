import { computed, signal } from '@preact/signals-react'
import type { ComponentSchema, ComponentStyle, PageDirection, TemplateSchema } from '@ptd/core'
import { getComponentRotatedStyle } from '../utils'
import { createGroupMetrics, getAbsoluteGroupChildren } from '../utils/groupGeometry'

const HISTORY_LIMIT = 20
const PASTE_OFFSET = 12

export type Alignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
export type Distribution = 'horizontal' | 'vertical'
export type LayerAction = 'forward' | 'backward' | 'front' | 'back'
export type GuideAxis = 'x' | 'y'
export type GuideColor = 'cobalt' | 'vermilion' | 'emerald' | 'amber'

export interface CanvasGuide {
  id: string
  axis: GuideAxis
  positionMm: number
  color: GuideColor
}

export interface AreaSelection {
  style: { top: number; left: number; width: number; height: number }
  componentIds: string[]
}

interface ClipboardData {
  components: ComponentSchema[]
  isCut: boolean
}

interface EditorStoreOptions {
  onChange?: (template: TemplateSchema) => void
  idFactory?: () => string
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function randomId(): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(36))
    .join('')
    .slice(0, 10)
}

function number(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function withPosition(component: ComponentSchema, left: number, top: number): ComponentSchema {
  return { ...component, style: { ...component.style, left, top } }
}

function regenerateIds(component: ComponentSchema, idFactory: () => string): ComponentSchema {
  const next = { ...clone(component), id: idFactory() }
  if (next.component === 'RoyGroup' && Array.isArray(next.propValue)) {
    next.propValue = (next.propValue as ComponentSchema[]).map((child) =>
      regenerateIds(child, idFactory),
    )
  }
  return next
}

export class EditorStore {
  readonly template = signal<TemplateSchema>(null as unknown as TemplateSchema)
  readonly currentPageIndex = signal(0)
  readonly selectedIds = signal<string[]>([])
  readonly scale = signal(1)
  readonly showRuler = signal(true)
  readonly guides = signal<CanvasGuide[]>([])
  readonly guidesVisible = signal(true)
  readonly guidesLocked = signal(false)
  readonly activeGuideColor = signal<GuideColor>('cobalt')
  readonly selectedGuideId = signal<string | null>(null)
  readonly areaSelection = signal<AreaSelection>({
    style: { top: 0, left: 0, width: 0, height: 0 },
    componentIds: [],
  })
  readonly isSelectingArea = signal(false)
  readonly clipboard = signal<ClipboardData | null>(null)
  readonly componentToReveal = signal<string | null>(null)
  readonly history = signal<TemplateSchema[]>([])
  readonly historyIndex = signal(0)

  readonly currentPage = computed(() => this.template.value.pages[this.currentPageIndex.value])
  readonly components = computed(() => this.currentPage.value?.componentData ?? [])
  readonly pageConfig = computed(() => this.template.value.pageConfig)
  readonly selectedComponents = computed(() => {
    const ids = new Set(this.selectedIds.value)
    return this.components.value.filter((component) => ids.has(component.id))
  })
  readonly primaryComponent = computed(() => {
    const id = this.selectedIds.value.at(-1)
    return id ? (this.components.value.find((component) => component.id === id) ?? null) : null
  })
  readonly canUndo = computed(() => this.historyIndex.value > 0)
  readonly canRedo = computed(() => this.historyIndex.value < this.history.value.length - 1)

  private onChange?: (template: TemplateSchema) => void
  private readonly idFactory: () => string
  private lastEmitted: TemplateSchema | null = null
  private gestureStart: TemplateSchema | null = null

  constructor(initialTemplate: TemplateSchema, options: EditorStoreOptions = {}) {
    this.template.value = initialTemplate
    this.history.value = [initialTemplate]
    this.onChange = options.onChange
    this.idFactory = options.idFactory ?? randomId
  }

  setOnChange(onChange?: (template: TemplateSchema) => void): void {
    this.onChange = onChange
  }

  syncExternal(template: TemplateSchema): void {
    if (template === this.template.value || template === this.lastEmitted) return
    this.lastEmitted = null
    this.template.value = template
    this.currentPageIndex.value = Math.min(
      this.currentPageIndex.value,
      Math.max(0, template.pages.length - 1),
    )
    this.selectedIds.value = []
    this.componentToReveal.value = null
    this.guides.value = []
    this.selectedGuideId.value = null
    this.history.value = [template]
    this.historyIndex.value = 0
    this.gestureStart = null
  }

  setCurrentPage(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.template.value.pages.length) return
    if (this.currentPageIndex.value === index) return
    this.currentPageIndex.value = index
    this.selectedIds.value = []
    this.componentToReveal.value = null
    this.guides.value = []
    this.selectedGuideId.value = null
    this.cancelAreaSelection()
  }

  selectComponent(id: string, additive = false): void {
    if (!this.components.value.some((component) => component.id === id)) return
    this.selectedGuideId.value = null
    if (!additive) {
      this.selectedIds.value = [id]
      return
    }
    this.selectedIds.value = this.selectedIds.value.includes(id)
      ? this.selectedIds.value.filter((selectedId) => selectedId !== id)
      : [...this.selectedIds.value, id]
  }

  selectComponents(ids: string[]): void {
    const available = new Set(this.components.value.map((component) => component.id))
    this.selectedIds.value = [...new Set(ids)].filter((id) => available.has(id))
    this.selectedGuideId.value = null
  }

  clearSelection(): void {
    this.selectedIds.value = []
    this.selectedGuideId.value = null
  }

  addGuide(axis: GuideAxis, positionMm: number): string | null {
    if (this.guidesLocked.value || !Number.isFinite(positionMm)) return null
    const id = this.idFactory()
    this.guides.value = [
      ...this.guides.value,
      {
        id,
        axis,
        positionMm: this.clampGuidePosition(axis, positionMm),
        color: this.activeGuideColor.value,
      },
    ]
    this.selectedIds.value = []
    this.selectedGuideId.value = id
    this.guidesVisible.value = true
    return id
  }

  selectGuide(id: string | null): void {
    if (id && !this.guides.value.some((guide) => guide.id === id)) return
    this.selectedIds.value = []
    this.selectedGuideId.value = id
  }

  moveGuide(id: string, positionMm: number): void {
    if (this.guidesLocked.value || !Number.isFinite(positionMm)) return
    this.guides.value = this.guides.value.map((guide) =>
      guide.id === id
        ? { ...guide, positionMm: this.clampGuidePosition(guide.axis, positionMm) }
        : guide,
    )
  }

  removeGuide(id: string): void {
    if (this.guidesLocked.value) return
    this.guides.value = this.guides.value.filter((guide) => guide.id !== id)
    if (this.selectedGuideId.value === id) this.selectedGuideId.value = null
  }

  removeSelectedGuide(): void {
    const id = this.selectedGuideId.value
    if (id) this.removeGuide(id)
  }

  setGuideColor(color: GuideColor): void {
    this.activeGuideColor.value = color
    const selected = this.selectedGuideId.value
    if (!selected || this.guidesLocked.value) return
    this.guides.value = this.guides.value.map((guide) =>
      guide.id === selected ? { ...guide, color } : guide,
    )
  }

  toggleGuidesVisible(): void {
    this.guidesVisible.value = !this.guidesVisible.value
  }

  toggleGuidesLocked(): void {
    this.guidesLocked.value = !this.guidesLocked.value
  }

  clearGuides(): void {
    if (this.guidesLocked.value) return
    this.guides.value = []
    this.selectedGuideId.value = null
  }

  startAreaSelection(left: number, top: number): void {
    this.isSelectingArea.value = true
    this.areaSelection.value = {
      style: { left, top, width: 0, height: 0 },
      componentIds: [],
    }
  }

  updateAreaSelection(style: AreaSelection['style']): void {
    this.areaSelection.value = { ...this.areaSelection.value, style }
  }

  finishAreaSelection(componentIds: string[]): void {
    this.selectComponents(componentIds)
    this.areaSelection.value = { ...this.areaSelection.value, componentIds }
    this.isSelectingArea.value = false
  }

  cancelAreaSelection(): void {
    this.isSelectingArea.value = false
    this.areaSelection.value = {
      style: { top: 0, left: 0, width: 0, height: 0 },
      componentIds: [],
    }
  }

  addComponent(component: ComponentSchema): void {
    this.updateCurrentPage((components) => [...components, clone(component)])
    this.selectComponent(component.id)
  }

  requestComponentReveal(id: string): void {
    if (!this.components.value.some((component) => component.id === id)) return
    this.componentToReveal.value = id
  }

  finishComponentReveal(id: string): void {
    if (this.componentToReveal.value === id) this.componentToReveal.value = null
  }

  updateComponent(id: string, patch: Partial<ComponentSchema>, transient = false): void {
    const current = this.components.value.find((component) => component.id === id)
    if (!current || (current.isLock && Object.keys(patch).some((key) => key !== 'isLock'))) return
    this.updateCurrentPage(
      (components) =>
        components.map((component) =>
          component.id === id && hasChanges(component, patch)
            ? { ...component, ...patch }
            : component,
        ),
      transient,
    )
  }

  updateComponentStyle(id: string, patch: Partial<ComponentStyle>, transient = false): void {
    const current = this.components.value.find((component) => component.id === id)
    if (!current || current.isLock) return
    this.updateCurrentPage(
      (components) =>
        components.map((component) =>
          component.id === id && hasChanges(component.style, patch)
            ? { ...component, style: { ...component.style, ...patch } }
            : component,
        ),
      transient,
    )
  }

  updateSelectedStyles(patch: Partial<ComponentStyle>, transient = false): void {
    const ids = new Set(this.selectedIds.value)
    if (ids.size === 0 || this.hasLockedSelection()) return
    this.updateCurrentPage(
      (components) =>
        components.map((component) =>
          ids.has(component.id) && hasChanges(component.style, patch)
            ? { ...component, style: { ...component.style, ...patch } }
            : component,
        ),
      transient,
    )
  }

  transformComponent(id: string, patch: Partial<ComponentStyle>, transient = false): boolean {
    const component = this.components.value.find((item) => item.id === id)
    if (!component || component.isLock) return false
    this.updateComponentStyle(id, patch, transient)
    return true
  }

  moveSelection(deltaLeft: number, deltaTop: number, transient = false): void {
    const ids = new Set(this.selectedIds.value)
    if (ids.size === 0 || this.hasLockedSelection()) return
    this.updateCurrentPage(
      (components) =>
        components.map((component) => {
          if (!ids.has(component.id) || component.isLock) return component
          return withPosition(
            component,
            number(component.style.left) + deltaLeft,
            number(component.style.top) + deltaTop,
          )
        }),
      transient,
    )
  }

  deleteSelected(): void {
    const ids = new Set(this.selectedIds.value)
    if (ids.size === 0 || this.hasLockedSelection()) return
    this.updateCurrentPage((components) => components.filter((component) => !ids.has(component.id)))
    this.clearSelection()
  }

  copy(): void {
    if (this.selectedComponents.value.length === 0) return
    this.clipboard.value = { components: clone(this.selectedComponents.value), isCut: false }
  }

  cut(): void {
    if (this.selectedComponents.value.length === 0 || this.hasLockedSelection()) return
    this.clipboard.value = { components: clone(this.selectedComponents.value), isCut: true }
    this.deleteSelected()
  }

  paste(offset = PASTE_OFFSET): void {
    const clipboard = this.clipboard.value
    if (!clipboard) return
    const pasted = clipboard.components.map((component) => {
      const next = regenerateIds(component, this.idFactory)
      return withPosition(next, number(next.style.left) + offset, number(next.style.top) + offset)
    })
    this.updateCurrentPage((components) => [...components, ...pasted])
    this.selectComponents(pasted.map((component) => component.id))
    if (clipboard.isCut) this.clipboard.value = null
  }

  setLock(locked: boolean): void {
    const ids = new Set(this.selectedIds.value)
    if (ids.size === 0) return
    this.updateCurrentPage((components) =>
      components.map((component) =>
        ids.has(component.id) && Boolean(component.isLock) !== locked
          ? { ...component, isLock: locked }
          : component,
      ),
    )
  }

  toggleLock(): void {
    const selected = this.selectedComponents.value
    if (selected.length === 0) return
    this.setLock(!selected.every((component) => component.isLock))
  }

  moveLayer(action: LayerAction): void {
    const selected = new Set(this.selectedIds.value)
    if (selected.size === 0 || this.hasLockedSelection()) return
    const source = [...this.components.value]
    if (action === 'front' || action === 'back') {
      const picked = source.filter((component) => selected.has(component.id))
      const rest = source.filter((component) => !selected.has(component.id))
      this.replaceCurrentPage(action === 'front' ? [...rest, ...picked] : [...picked, ...rest])
      return
    }
    if (action === 'forward') {
      for (let index = source.length - 2; index >= 0; index--) {
        if (selected.has(source[index]!.id) && !selected.has(source[index + 1]!.id)) {
          ;[source[index], source[index + 1]] = [source[index + 1]!, source[index]!]
        }
      }
    } else {
      for (let index = 1; index < source.length; index++) {
        if (selected.has(source[index]!.id) && !selected.has(source[index - 1]!.id)) {
          ;[source[index], source[index - 1]] = [source[index - 1]!, source[index]!]
        }
      }
    }
    this.replaceCurrentPage(source)
  }

  align(alignment: Alignment): void {
    const selected = this.selectedComponents.value
    if (selected.length < 2 || this.hasLockedSelection()) return
    const bounds = selected.map((component) => getComponentRotatedStyle(component.style))
    const left = Math.min(...bounds.map((box) => box.left))
    const right = Math.max(...bounds.map((box) => box.right))
    const top = Math.min(...bounds.map((box) => box.top))
    const bottom = Math.max(...bounds.map((box) => box.bottom))
    const ids = new Set(selected.map((component) => component.id))
    this.updateCurrentPage((components) =>
      components.map((component) => {
        if (!ids.has(component.id) || component.isLock) return component
        const box = getComponentRotatedStyle(component.style)
        let dx = 0
        let dy = 0
        if (alignment === 'left') dx = left - box.left
        if (alignment === 'center') dx = (left + right - box.left - box.right) / 2
        if (alignment === 'right') dx = right - box.right
        if (alignment === 'top') dy = top - box.top
        if (alignment === 'middle') dy = (top + bottom - box.top - box.bottom) / 2
        if (alignment === 'bottom') dy = bottom - box.bottom
        return withPosition(
          component,
          number(component.style.left) + dx,
          number(component.style.top) + dy,
        )
      }),
    )
  }

  distribute(direction: Distribution): void {
    const selected = this.selectedComponents.value
    if (selected.length < 3 || this.hasLockedSelection()) return
    const horizontal = direction === 'horizontal'
    const sorted = [...selected].sort((a, b) => {
      const aBox = getComponentRotatedStyle(a.style)
      const bBox = getComponentRotatedStyle(b.style)
      return (horizontal ? aBox.left : aBox.top) - (horizontal ? bBox.left : bBox.top)
    })
    const boxes = sorted.map((component) => getComponentRotatedStyle(component.style))
    const start = horizontal ? boxes[0]!.left : boxes[0]!.top
    const end = horizontal ? boxes.at(-1)!.right : boxes.at(-1)!.bottom
    const occupied = boxes.reduce((sum, box) => sum + (horizontal ? box.width : box.height), 0)
    const gap = (end - start - occupied) / (boxes.length - 1)
    const shifts = new Map<string, number>()
    let cursor = start
    sorted.forEach((component, index) => {
      const box = boxes[index]!
      shifts.set(component.id, cursor - (horizontal ? box.left : box.top))
      cursor += (horizontal ? box.width : box.height) + gap
    })
    this.updateCurrentPage((components) =>
      components.map((component) => {
        const shift = shifts.get(component.id)
        if (shift === undefined || component.isLock) return component
        return withPosition(
          component,
          number(component.style.left) + (horizontal ? shift : 0),
          number(component.style.top) + (horizontal ? 0 : shift),
        )
      }),
    )
  }

  group(): void {
    const selectedIds = new Set(this.selectedIds.value)
    const selected = this.components.value.filter((component) => selectedIds.has(component.id))
    if (selected.length < 2 || this.hasLockedSelection()) return
    const flattened = selected.flatMap((component) => {
      if (component.component !== 'RoyGroup' || !Array.isArray(component.propValue))
        return [clone(component)]
      return getAbsoluteGroupChildren(component).map((child) => clone(child))
    })
    const bounds = flattened.map((component) => getComponentRotatedStyle(component.style))
    const left = Math.min(...bounds.map((box) => box.left))
    const top = Math.min(...bounds.map((box) => box.top))
    const right = Math.max(...bounds.map((box) => box.right))
    const bottom = Math.max(...bounds.map((box) => box.bottom))
    const group: ComponentSchema = {
      id: this.idFactory(),
      component: 'RoyGroup',
      name: '组合',
      propValue: flattened.map((child) =>
        withPosition(child, number(child.style.left) - left, number(child.style.top) - top),
      ),
      style: { width: right - left, height: bottom - top, left, top, rotate: 0, opacity: 1 },
      groupStyle: createGroupMetrics(right - left, bottom - top),
      position: {},
    }
    const source = this.components.value
    const insertionIndex = source.findIndex((component) => selectedIds.has(component.id))
    const next = source.filter((component) => !selectedIds.has(component.id))
    next.splice(insertionIndex, 0, group)
    this.replaceCurrentPage(next)
    this.selectComponent(group.id)
  }

  ungroup(): void {
    if (this.hasLockedSelection()) return
    const selectedIds = new Set(this.selectedIds.value)
    const restoredIds: string[] = []
    let changed = false
    const next = this.components.value.flatMap((component) => {
      if (
        !selectedIds.has(component.id) ||
        component.component !== 'RoyGroup' ||
        !Array.isArray(component.propValue)
      )
        return [component]
      changed = true
      return getAbsoluteGroupChildren(component).map((child) => {
        restoredIds.push(child.id)
        return clone(child)
      })
    })
    if (!changed) return
    this.replaceCurrentPage(next)
    this.selectComponents(restoredIds)
  }

  setPageDirection(direction: PageDirection): void {
    if (this.pageConfig.value.pageDirection === direction) return
    this.commit({
      ...this.template.value,
      pageConfig: { ...this.pageConfig.value, pageDirection: direction },
    })
    this.guides.value = this.guides.value.map((guide) => ({
      ...guide,
      positionMm: this.clampGuidePosition(guide.axis, guide.positionMm),
    }))
  }

  setZoom(scale: number): void {
    this.scale.value = Math.min(2, Math.max(0.25, Math.round(scale * 100) / 100))
  }

  toggleRuler(): void {
    this.showRuler.value = !this.showRuler.value
  }

  beginGesture(): void {
    if (!this.gestureStart) this.gestureStart = this.template.value
  }

  commitGesture(): void {
    const start = this.gestureStart
    this.gestureStart = null
    if (!start || start === this.template.value) return
    this.pushHistory(this.template.value)
  }

  cancelGesture(): void {
    const start = this.gestureStart
    this.gestureStart = null
    if (!start || start === this.template.value) return
    this.template.value = start
    this.lastEmitted = start
    this.onChange?.(start)
    this.repairSelection()
  }

  undo(): void {
    if (!this.canUndo.value) return
    this.historyIndex.value -= 1
    this.restoreHistory()
  }

  redo(): void {
    if (!this.canRedo.value) return
    this.historyIndex.value += 1
    this.restoreHistory()
  }

  private updateCurrentPage(
    update: (components: ComponentSchema[]) => ComponentSchema[],
    transient = false,
  ): void {
    const pageIndex = this.currentPageIndex.value
    const current = this.template.value.pages[pageIndex]
    if (!current) return
    const components = update(current.componentData)
    if (
      components === current.componentData ||
      (components.length === current.componentData.length &&
        components.every((component, index) => component === current.componentData[index]))
    )
      return
    const pages = this.template.value.pages.map((page, index) =>
      index === pageIndex ? { ...page, componentData: components } : page,
    )
    this.commit({ ...this.template.value, pages }, transient)
  }

  private replaceCurrentPage(components: ComponentSchema[]): void {
    this.updateCurrentPage(() => components)
  }

  private commit(template: TemplateSchema, transient = false): void {
    if (template === this.template.value) return
    this.template.value = template
    this.lastEmitted = template
    this.onChange?.(template)
    if (!transient) this.pushHistory(template)
    this.repairSelection()
  }

  private pushHistory(template: TemplateSchema): void {
    const next = this.history.value.slice(0, this.historyIndex.value + 1)
    if (next.at(-1) === template) return
    next.push(template)
    if (next.length > HISTORY_LIMIT) next.splice(0, next.length - HISTORY_LIMIT)
    this.history.value = next
    this.historyIndex.value = next.length - 1
  }

  private restoreHistory(): void {
    const template = this.history.value[this.historyIndex.value]
    if (!template) return
    this.template.value = template
    this.lastEmitted = template
    this.onChange?.(template)
    this.gestureStart = null
    this.repairSelection()
  }

  private repairSelection(): void {
    const available = new Set(this.components.value.map((component) => component.id))
    const repaired = this.selectedIds.value.filter((id) => available.has(id))
    if (repaired.length !== this.selectedIds.value.length) this.selectedIds.value = repaired
  }

  private hasLockedSelection(): boolean {
    return this.selectedComponents.value.some((component) => component.isLock)
  }

  private clampGuidePosition(axis: GuideAxis, positionMm: number): number {
    const { pageDirection, pageWidth, pageHeight } = this.pageConfig.value
    const width = pageDirection === 'l' ? number(pageHeight) : number(pageWidth)
    const height = pageDirection === 'l' ? number(pageWidth) : number(pageHeight)
    return Math.min(axis === 'x' ? width : height, Math.max(0, positionMm))
  }
}

function hasChanges<T extends object>(source: T, patch: Partial<T>): boolean {
  return Object.entries(patch).some(([key, value]) => source[key as keyof T] !== value)
}

export function createEditorStore(
  initialTemplate: TemplateSchema,
  options?: EditorStoreOptions,
): EditorStore {
  return new EditorStore(initialTemplate, options)
}
