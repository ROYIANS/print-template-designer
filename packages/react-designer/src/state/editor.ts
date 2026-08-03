import { computed, signal } from '@preact/signals-react'
import {
  getPageDimensions,
  getComponentBindingTargets,
  getTableCellAt,
  getTableCellBounds,
  normalizeTemplateData,
  normalizeSimpleTableProps,
  pageConfigError,
  updateTableCellText,
  validateRuntimeRecords,
  type BindingExpression,
  type ComponentBinding,
  type ComponentBindingTarget,
  type ComponentSchema,
  type ComponentStyle,
  type DataFieldDefinition,
  type DataFormatter,
  type DataRecord,
  type MeasurementUnit,
  type PageConfig,
  type PageDirection,
  type RenderContext,
  type TemplateDataDefinition,
  type TemplatePage,
  type TemplateSchema,
} from '@ptd/core'
import { getComponentRotatedStyle } from '../utils'
import { createGroupMetrics, getAbsoluteGroupChildren } from '../utils/groupGeometry'
import {
  isDrawnComponentType,
  isDrawingComponentType,
  type DrawingComponentType,
  type DrawnComponentType,
} from '../catalog'

const HISTORY_LIMIT = 20
const PASTE_OFFSET = 12
const RECENT_COLOR_LIMIT = 8
const GESTURE_ECHO_LIMIT = 32

export type Alignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
export type Distribution = 'horizontal' | 'vertical'
export type LayerAction = 'forward' | 'backward' | 'front' | 'back'
export type GuideAxis = 'x' | 'y'
export type GuideColor = 'cobalt' | 'vermilion' | 'emerald' | 'amber'
export type EditorTool = 'select' | 'hand' | DrawnComponentType
export type DirectlyEditableComponentType = 'RoySimpleText' | 'RoyText'

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

export interface TableCellSelection {
  componentId: string
  anchorRow: number
  anchorColumn: number
  focusRow: number
  focusColumn: number
}

export interface EditingTableCell {
  componentId: string
  cellId: string
}

interface ClipboardData {
  components: ComponentSchema[]
  isCut: boolean
}

interface EditorStoreOptions {
  onChange?: (template: TemplateSchema) => void
  idFactory?: () => string
  renderContext?: RenderContext
}

export interface ProofEnvironment {
  now?: string
  locale?: string
  timeZone?: string
}

export interface DataFieldPatch {
  readonly name?: string
  readonly formatter?: DataFormatter
  readonly removeFormatter?: boolean
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

function isShapeDrawingTool(tool: EditorTool): tool is DrawingComponentType {
  return isDrawingComponentType(tool)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
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

function duplicatePage(page: TemplatePage, idFactory: () => string): TemplatePage {
  return {
    ...clone(page),
    id: idFactory(),
    componentData: page.componentData.map((component) => regenerateIds(component, idFactory)),
  }
}

export class EditorStore {
  readonly template = signal<TemplateSchema>(null as unknown as TemplateSchema)
  readonly currentPageIndex = signal(0)
  readonly selectedIds = signal<string[]>([])
  readonly scale = signal(1)
  readonly measurementUnit = signal<MeasurementUnit>('mm')
  readonly recentColors = signal<readonly string[]>([])
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
  readonly activeTool = signal<EditorTool>('select')
  readonly temporaryHand = signal(false)
  readonly lastDrawingTool = signal<DrawingComponentType>('RoyRect')
  readonly history = signal<TemplateSchema[]>([])
  readonly historyIndex = signal(0)
  readonly editingComponentId = signal<string | null>(null)
  readonly tableCellSelection = signal<TableCellSelection | null>(null)
  readonly editingTableCell = signal<EditingTableCell | null>(null)
  readonly proofMode = signal(false)
  readonly proofRecordIndex = signal(0)
  readonly proofRecordSelectionTouched = signal(false)
  readonly hostRenderContext = signal<RenderContext | undefined>(undefined)
  readonly proofNow = signal(new Date().toISOString())
  readonly proofLocale = signal('zh-CN')
  readonly proofTimeZone = signal('Asia/Shanghai')
  /** Advances only when the controlled Host supplies a genuinely external template object. */
  readonly externalTemplateRevision = signal(0)

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
  readonly outOfBoundsComponents = computed(() => {
    const page = getPageDimensions(this.pageConfig.value)
    return this.components.value.filter((component) => {
      const bounds = getComponentRotatedStyle(component.style)
      return (
        bounds.left < 0 ||
        bounds.top < 0 ||
        bounds.right > page.width ||
        bounds.bottom > page.height
      )
    })
  })
  readonly effectiveTool = computed<EditorTool>(() =>
    this.temporaryHand.value ? 'hand' : this.activeTool.value,
  )
  readonly canUndo = computed(() => this.historyIndex.value > 0)
  readonly canRedo = computed(() => this.historyIndex.value < this.history.value.length - 1)
  readonly normalizedTemplateData = computed(() => normalizeTemplateData(this.template.value))
  readonly sampleRecords = computed(
    () => this.normalizedTemplateData.value.data.sampleRecords ?? [],
  )
  readonly proofRecords = computed<readonly DataRecord[]>(() => {
    const hostContext = this.hostRenderContext.value
    if (!hostContext) return this.sampleRecords.value
    const validated = validateRuntimeRecords(hostContext.data)
    if (validated.ok) return validated.records
    return hostContext.record ? [hostContext.record] : []
  })
  readonly proofRenderContext = computed<RenderContext | undefined>(() => {
    if (!this.proofMode.value) return undefined
    const hostContext = this.hostRenderContext.value
    const records = this.proofRecords.value
    const recordIndex = clampRecordIndex(this.proofRecordIndex.value, records.length)
    const record =
      hostContext?.record && !this.proofRecordSelectionTouched.value
        ? hostContext.record
        : (records[recordIndex] ?? hostContext?.record)
    return {
      data: hostContext?.data ?? (records.length === 1 ? records[0]! : [...records]),
      ...(record ? { record } : {}),
      recordIndex,
      locale: hostContext?.locale ?? this.proofLocale.value,
      timeZone: hostContext?.timeZone ?? this.proofTimeZone.value,
      now: hostContext?.now ?? this.proofNow.value,
      mode: 'proof',
    }
  })

  private onChange?: (template: TemplateSchema) => void
  private readonly idFactory: () => string
  private lastEmitted: TemplateSchema | null = null
  private pendingGestureEchoes: TemplateSchema[] = []
  private gestureStart: TemplateSchema | null = null

  constructor(initialTemplate: TemplateSchema, options: EditorStoreOptions = {}) {
    this.template.value = initialTemplate
    this.history.value = [initialTemplate]
    this.onChange = options.onChange
    this.idFactory = options.idFactory ?? randomId
    this.hostRenderContext.value = options.renderContext
    if (options.renderContext?.recordIndex !== undefined) {
      this.proofRecordIndex.value = options.renderContext.recordIndex
    }
    this.repairProofRecordIndex()
  }

  setOnChange(onChange?: (template: TemplateSchema) => void): void {
    this.onChange = onChange
  }

  setHostRenderContext(renderContext?: RenderContext): void {
    if (this.hostRenderContext.value === renderContext) return
    this.hostRenderContext.value = renderContext
    this.proofRecordSelectionTouched.value = false
    this.proofRecordIndex.value = renderContext?.recordIndex ?? 0
    this.repairProofRecordIndex()
  }

  setProofMode(active: boolean): void {
    if (this.proofMode.value === active) return
    this.proofMode.value = active
    if (active) {
      this.editingComponentId.value = null
      this.clearTableSession()
      this.repairProofRecordIndex()
    }
  }

  setProofRecordIndex(index: number): void {
    if (!Number.isInteger(index) || index < 0) return
    const next = clampRecordIndex(index, this.proofRecords.value.length)
    this.proofRecordSelectionTouched.value = true
    if (this.proofRecordIndex.value !== next) this.proofRecordIndex.value = next
  }

  setProofEnvironment(environment: ProofEnvironment): void {
    if (environment.now !== undefined) this.proofNow.value = environment.now
    if (environment.locale !== undefined) this.proofLocale.value = environment.locale
    if (environment.timeZone !== undefined) this.proofTimeZone.value = environment.timeZone
  }

  /** Replaces the canonical field model and samples as one undoable template mutation. */
  replaceTemplateData(data: TemplateDataDefinition): boolean {
    if (
      this.template.value.data &&
      this.template.value.dataSource === undefined &&
      this.template.value.dataSet === undefined &&
      structurallyEqual(this.template.value.data, data)
    )
      return false
    const { dataSource: _legacyFields, dataSet: _legacyDataSet, ...canonical } = this.template.value
    void _legacyFields
    void _legacyDataSet
    this.commit({ ...canonical, data })
    return true
  }

  /** Edits presentation metadata while preserving a field's stable id, path and child structure. */
  updateDataField(fieldId: string, patch: DataFieldPatch): boolean {
    const normalized = this.normalizedTemplateData.value.data
    let changed = false
    const update = (fields: readonly DataFieldDefinition[]): readonly DataFieldDefinition[] =>
      fields.map((field) => {
        const children = field.children ? update(field.children) : undefined
        let next = children === field.children ? field : { ...field, children }
        if (field.id !== fieldId) return next
        const name = patch.name?.trim()
        const nextName = name ? name : field.name
        const formatter = patch.removeFormatter ? undefined : (patch.formatter ?? field.formatter)
        if (nextName === field.name && structurallyEqual(formatter, field.formatter)) return next
        changed = true
        const { formatter: _currentFormatter, ...withoutFormatter } = next
        void _currentFormatter
        next = {
          ...withoutFormatter,
          name: nextName,
          ...(formatter ? { formatter } : {}),
        }
        return next
      })
    const fields = update(normalized.fields)
    if (!changed) return false
    return this.replaceTemplateData({ ...normalized, fields })
  }

  setComponentBinding(
    componentId: string,
    target: ComponentBindingTarget,
    expression: BindingExpression,
  ): boolean {
    const component = this.components.value.find((item) => item.id === componentId)
    if (!component || component.isLock) return false
    if (
      !getComponentBindingTargets(component.component).some((item) => item.kind === target.kind)
    ) {
      return false
    }
    if (
      target.kind === 'table-cell-text' &&
      (component.component !== 'RoySimpleTable' ||
        !normalizeSimpleTableProps(component.propValue).cells[target.cellId])
    )
      return false
    const bindings = component.bindings ?? []
    const index = bindings.findIndex((binding) => sameBindingTarget(binding.target, target))
    const binding: ComponentBinding =
      index >= 0
        ? { ...bindings[index]!, expression }
        : { id: this.idFactory(), target, expression }
    if (index >= 0 && structurallyEqual(bindings[index]!.expression, expression)) return false
    const next = [...bindings]
    if (index >= 0) next[index] = binding
    else next.push(binding)
    this.updateComponent(componentId, { bindings: next })
    return true
  }

  removeComponentBinding(componentId: string, target: ComponentBindingTarget): boolean {
    const component = this.components.value.find((item) => item.id === componentId)
    if (!component || component.isLock || !component.bindings) return false
    const bindings = component.bindings.filter(
      (binding) => !sameBindingTarget(binding.target, target),
    )
    if (bindings.length === component.bindings.length) return false
    this.updateComponent(componentId, { bindings })
    return true
  }

  removeSampleRecords(): boolean {
    const normalized = this.normalizedTemplateData.value.data
    if (!normalized.sampleRecords) return false
    const { sampleRecords: _samples, ...data } = normalized
    void _samples
    return this.replaceTemplateData(data)
  }

  recordRecentColor(color: string): void {
    const normalized = color.trim().toLowerCase()
    if (!/^#[0-9a-f]{6}$/.test(normalized)) return
    this.recentColors.value = [
      normalized,
      ...this.recentColors.value.filter((item) => item !== normalized),
    ].slice(0, RECENT_COLOR_LIMIT)
  }

  syncExternal(template: TemplateSchema): void {
    if (template === this.template.value) {
      this.pendingGestureEchoes = []
      return
    }
    if (template === this.lastEmitted) return
    if (this.pendingGestureEchoes.length > 0) {
      if (structurallyEqual(template, this.template.value)) {
        this.pendingGestureEchoes = []
        return
      }
      if (this.pendingGestureEchoes.some((candidate) => structurallyEqual(candidate, template))) {
        return
      }
      this.pendingGestureEchoes = []
    }
    this.lastEmitted = null
    this.template.value = template
    this.currentPageIndex.value = Math.min(
      this.currentPageIndex.value,
      Math.max(0, template.pages.length - 1),
    )
    this.selectedIds.value = []
    this.componentToReveal.value = null
    this.temporaryHand.value = false
    this.guides.value = []
    this.selectedGuideId.value = null
    this.history.value = [template]
    this.historyIndex.value = 0
    this.editingComponentId.value = null
    this.tableCellSelection.value = null
    this.editingTableCell.value = null
    this.proofMode.value = false
    this.proofRecordSelectionTouched.value = false
    this.proofRecordIndex.value = this.hostRenderContext.value?.recordIndex ?? 0
    this.externalTemplateRevision.value += 1
    this.repairProofRecordIndex()
    this.gestureStart = null
  }

  setCurrentPage(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.template.value.pages.length) return
    if (this.currentPageIndex.value === index) return
    this.currentPageIndex.value = index
    this.resetPageSession()
  }

  addPage(): string {
    const pages = [...this.template.value.pages]
    const page: TemplatePage = { id: this.idFactory(), componentData: [] }
    const insertionIndex = Math.min(this.currentPageIndex.value + 1, pages.length)
    pages.splice(insertionIndex, 0, page)
    this.commit({ ...this.template.value, pages }, false, page.id)
    return page.id
  }

  duplicatePage(index = this.currentPageIndex.value): string | null {
    const source = this.template.value.pages[index]
    if (!source) return null
    const page = duplicatePage(source, this.idFactory)
    const pages = [...this.template.value.pages]
    pages.splice(index + 1, 0, page)
    this.commit({ ...this.template.value, pages }, false, page.id)
    return page.id
  }

  deletePage(index = this.currentPageIndex.value): void {
    const pages = this.template.value.pages
    if (pages.length <= 1 || !pages[index]) return
    const activePageId = this.currentPage.value?.id
    const next = pages.filter((_, pageIndex) => pageIndex !== index)
    const preferredPageId =
      activePageId === pages[index]?.id ? next[Math.min(index, next.length - 1)]?.id : activePageId
    this.commit({ ...this.template.value, pages: next }, false, preferredPageId)
  }

  movePage(fromIndex: number, toIndex: number): void {
    const pages = this.template.value.pages
    if (
      !Number.isInteger(fromIndex) ||
      !Number.isInteger(toIndex) ||
      fromIndex < 0 ||
      fromIndex >= pages.length ||
      toIndex < 0 ||
      toIndex >= pages.length ||
      fromIndex === toIndex
    )
      return
    const activePageId = this.currentPage.value?.id
    const next = [...pages]
    const [page] = next.splice(fromIndex, 1)
    if (!page) return
    next.splice(toIndex, 0, page)
    this.commit({ ...this.template.value, pages: next }, false, activePageId)
  }

  selectComponent(id: string, additive = false): void {
    if (!this.components.value.some((component) => component.id === id)) return
    if (this.tableCellSelection.value?.componentId !== id) this.clearTableSession()
    this.selectedGuideId.value = null
    if (!additive) {
      this.selectedIds.value = [id]
      return
    }
    this.selectedIds.value = this.selectedIds.value.includes(id)
      ? this.selectedIds.value.filter((selectedId) => selectedId !== id)
      : [...this.selectedIds.value, id]
  }

  startContentEditing(id: string): boolean {
    const component = this.components.value.find((item) => item.id === id)
    if (
      this.proofMode.value ||
      !component ||
      component.isLock ||
      (component.component !== 'RoySimpleText' && component.component !== 'RoyText')
    )
      return false
    this.selectComponent(id)
    this.activeTool.value = 'select'
    this.temporaryHand.value = false
    this.editingComponentId.value = id
    this.editingTableCell.value = null
    return true
  }

  commitContentEditing(id: string, propValue: string): void {
    if (this.editingComponentId.value !== id) return
    this.editingComponentId.value = null
    this.updateComponent(id, { propValue })
  }

  cancelContentEditing(id: string): void {
    if (this.editingComponentId.value === id) this.editingComponentId.value = null
  }

  selectTableCell(componentId: string, row: number, column: number, extend = false): boolean {
    if (this.proofMode.value) return false
    const component = this.components.value.find((item) => item.id === componentId)
    if (!component || component.component !== 'RoySimpleTable' || component.isLock) return false
    const value = normalizeSimpleTableProps(component.propValue)
    const cell = getTableCellAt(value, row, column)
    const bounds = cell ? getTableCellBounds(value, cell.id) : null
    if (!cell || !bounds) return false
    this.selectComponent(componentId)
    this.activeTool.value = 'select'
    this.temporaryHand.value = false
    const current = this.tableCellSelection.value
    this.tableCellSelection.value =
      extend && current?.componentId === componentId
        ? { ...current, focusRow: row, focusColumn: column }
        : {
            componentId,
            anchorRow: bounds.startRow,
            anchorColumn: bounds.startColumn,
            focusRow: row,
            focusColumn: column,
          }
    return true
  }

  startTableCellEditing(componentId: string, cellId: string): boolean {
    if (this.proofMode.value) return false
    const component = this.components.value.find((item) => item.id === componentId)
    if (!component || component.component !== 'RoySimpleTable' || component.isLock) return false
    const value = normalizeSimpleTableProps(component.propValue)
    const bounds = getTableCellBounds(value, cellId)
    if (!value.cells[cellId] || !bounds) return false
    this.selectTableCell(componentId, bounds.startRow, bounds.startColumn)
    this.editingComponentId.value = null
    this.editingTableCell.value = { componentId, cellId }
    return true
  }

  commitTableCellEditing(componentId: string, cellId: string, text: string): void {
    const editing = this.editingTableCell.value
    if (editing?.componentId !== componentId || editing.cellId !== cellId) return
    this.editingTableCell.value = null
    const component = this.components.value.find((item) => item.id === componentId)
    if (!component || component.component !== 'RoySimpleTable' || component.isLock) return
    const current = normalizeSimpleTableProps(component.propValue)
    const next = updateTableCellText(current, cellId, text)
    if (next !== current) this.updateComponent(componentId, { propValue: next })
  }

  cancelTableCellEditing(componentId: string, cellId: string): void {
    const editing = this.editingTableCell.value
    if (editing?.componentId === componentId && editing.cellId === cellId) {
      this.editingTableCell.value = null
    }
  }

  clearTableCellSelection(componentId?: string): void {
    if (componentId && this.tableCellSelection.value?.componentId !== componentId) return
    this.clearTableSession()
  }

  selectComponents(ids: string[]): void {
    const available = new Set(this.components.value.map((component) => component.id))
    this.selectedIds.value = [...new Set(ids)].filter((id) => available.has(id))
    this.selectedGuideId.value = null
    if (
      this.selectedIds.value.length !== 1 ||
      this.tableCellSelection.value?.componentId !== this.selectedIds.value[0]
    )
      this.clearTableSession()
  }

  clearSelection(): void {
    this.selectedIds.value = []
    this.selectedGuideId.value = null
    this.clearTableSession()
  }

  setActiveTool(tool: EditorTool): void {
    if (isShapeDrawingTool(tool)) this.lastDrawingTool.value = tool
    if (this.activeTool.value === tool) return
    this.activeTool.value = tool
    this.cancelAreaSelection()
  }

  setTemporaryHand(active: boolean): void {
    if (this.temporaryHand.value === active) return
    this.temporaryHand.value = active
    this.cancelAreaSelection()
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

  completeDrawnComponent(component: ComponentSchema, tool: DrawnComponentType): boolean {
    if (
      this.effectiveTool.value !== tool ||
      component.component !== tool ||
      !isDrawnComponentType(component.component)
    )
      return false

    this.addComponent(component)
    if (isShapeDrawingTool(tool)) return true

    this.setActiveTool('select')
    if (tool === 'RoySimpleText' || tool === 'RoyText') {
      this.startContentEditing(component.id)
    }
    return true
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
    if (this.editingComponentId.value && ids.has(this.editingComponentId.value)) {
      this.editingComponentId.value = null
    }
    if (this.editingTableCell.value && ids.has(this.editingTableCell.value.componentId)) {
      this.clearTableSession()
    }
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

  pasteAt(left: number, top: number): void {
    const clipboard = this.clipboard.value
    if (!clipboard || !Number.isFinite(left) || !Number.isFinite(top)) return
    const pasted = clipboard.components.map((component) => regenerateIds(component, this.idFactory))
    const boxes = pasted.map((component) => getComponentRotatedStyle(component.style))
    const selectionLeft = Math.min(...boxes.map((box) => box.left))
    const selectionTop = Math.min(...boxes.map((box) => box.top))
    const selectionRight = Math.max(...boxes.map((box) => box.right))
    const selectionBottom = Math.max(...boxes.map((box) => box.bottom))
    const page = getPageDimensions(this.pageConfig.value)
    const minDeltaLeft = -selectionLeft
    const minDeltaTop = -selectionTop
    const maxDeltaLeft = page.width - selectionRight
    const maxDeltaTop = page.height - selectionBottom
    const requestedDeltaLeft = left - selectionLeft
    const requestedDeltaTop = top - selectionTop
    const deltaLeft =
      minDeltaLeft <= maxDeltaLeft
        ? clamp(requestedDeltaLeft, minDeltaLeft, maxDeltaLeft)
        : requestedDeltaLeft
    const deltaTop =
      minDeltaTop <= maxDeltaTop
        ? clamp(requestedDeltaTop, minDeltaTop, maxDeltaTop)
        : requestedDeltaTop
    const positioned = pasted.map((component) =>
      withPosition(
        component,
        number(component.style.left) + deltaLeft,
        number(component.style.top) + deltaTop,
      ),
    )
    this.updateCurrentPage((components) => [...components, ...positioned])
    this.selectComponents(positioned.map((component) => component.id))
    if (clipboard.isCut) this.clipboard.value = null
  }

  setLock(locked: boolean): void {
    const ids = new Set(this.selectedIds.value)
    if (ids.size === 0) return
    if (locked && this.editingComponentId.value && ids.has(this.editingComponentId.value)) {
      this.editingComponentId.value = null
    }
    if (locked && this.editingTableCell.value && ids.has(this.editingTableCell.value.componentId)) {
      this.editingTableCell.value = null
    }
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
    this.updatePageConfig({ pageDirection: direction })
  }

  updatePageConfig(patch: Partial<PageConfig>, transient = false): boolean {
    const current = this.pageConfig.value
    if (!hasChanges(current, patch)) return false
    const next = { ...current, ...patch }
    if (pageConfigError(next)) return false
    this.commit({ ...this.template.value, pageConfig: next }, transient)
    this.guides.value = this.guides.value.map((guide) => ({
      ...guide,
      positionMm: this.clampGuidePosition(guide.axis, guide.positionMm),
    }))
    return true
  }

  setZoom(scale: number): void {
    this.scale.value = Math.min(2, Math.max(0.25, Math.round(scale * 100) / 100))
  }

  setMeasurementUnit(unit: MeasurementUnit): void {
    this.measurementUnit.value = unit
  }

  toggleRuler(): void {
    this.showRuler.value = !this.showRuler.value
  }

  beginGesture(): void {
    if (this.gestureStart) return
    this.gestureStart = this.template.value
    this.rememberGestureEcho(this.gestureStart)
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
    this.emit(start)
    this.repairSelection()
  }

  undo(): void {
    if (!this.canUndo.value) return
    this.editingComponentId.value = null
    this.clearTableSession()
    this.historyIndex.value -= 1
    this.restoreHistory()
  }

  redo(): void {
    if (!this.canRedo.value) return
    this.editingComponentId.value = null
    this.clearTableSession()
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

  private commit(template: TemplateSchema, transient = false, preferredPageId?: string): void {
    if (template === this.template.value) return
    const previousPageId = this.currentPage.value?.id
    this.template.value = template
    this.repairProofRecordIndex()
    this.repairCurrentPage(preferredPageId)
    this.emit(template)
    if (!transient) this.pushHistory(template)
    if (previousPageId !== this.currentPage.value?.id) this.resetPageSession()
    else this.repairSelection()
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
    const previousPageId = this.currentPage.value?.id
    this.template.value = template
    this.repairProofRecordIndex()
    this.repairCurrentPage(previousPageId)
    this.emit(template)
    this.gestureStart = null
    if (previousPageId !== this.currentPage.value?.id) this.resetPageSession()
    else this.repairSelection()
  }

  private emit(template: TemplateSchema): void {
    this.lastEmitted = template
    if (this.gestureStart) this.rememberGestureEcho(template)
    this.onChange?.(template)
  }

  private rememberGestureEcho(template: TemplateSchema): void {
    if (this.pendingGestureEchoes.at(-1) === template) return
    this.pendingGestureEchoes.push(template)
    if (this.pendingGestureEchoes.length > GESTURE_ECHO_LIMIT) {
      this.pendingGestureEchoes.splice(0, this.pendingGestureEchoes.length - GESTURE_ECHO_LIMIT)
    }
  }

  private repairCurrentPage(preferredPageId?: string): void {
    const pages = this.template.value.pages
    const preferredIndex = preferredPageId
      ? pages.findIndex((page) => page.id === preferredPageId)
      : -1
    this.currentPageIndex.value =
      preferredIndex >= 0
        ? preferredIndex
        : Math.min(this.currentPageIndex.value, Math.max(0, pages.length - 1))
  }

  private resetPageSession(): void {
    this.selectedIds.value = []
    this.editingComponentId.value = null
    this.clearTableSession()
    this.componentToReveal.value = null
    this.guides.value = []
    this.selectedGuideId.value = null
    this.cancelAreaSelection()
  }

  private repairSelection(): void {
    const available = new Set(this.components.value.map((component) => component.id))
    const repaired = this.selectedIds.value.filter((id) => available.has(id))
    if (repaired.length !== this.selectedIds.value.length) this.selectedIds.value = repaired
    const tableSelection = this.tableCellSelection.value
    if (tableSelection && !available.has(tableSelection.componentId)) this.clearTableSession()
  }

  private clearTableSession(): void {
    this.tableCellSelection.value = null
    this.editingTableCell.value = null
  }

  private repairProofRecordIndex(): void {
    const next = clampRecordIndex(this.proofRecordIndex.value, this.proofRecords.value.length)
    if (this.proofRecordIndex.value !== next) this.proofRecordIndex.value = next
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

function clampRecordIndex(index: number, recordCount: number): number {
  if (recordCount <= 0) return 0
  return Math.min(Math.max(0, index), recordCount - 1)
}

function sameBindingTarget(left: ComponentBindingTarget, right: ComponentBindingTarget): boolean {
  if (left.kind !== right.kind) return false
  if (left.kind === 'table-cell-text' && right.kind === 'table-cell-text') {
    return left.cellId === right.cellId
  }
  return true
}

function structurallyEqual(left: unknown, right: unknown): boolean {
  if (left === right) return true
  return JSON.stringify(left) === JSON.stringify(right)
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
