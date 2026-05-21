import { signal, computed } from '@preact/signals-react'
import type { ComponentSchema, TemplateSchema } from '@ptd/core'
import { DEFAULT_PAGE_CONFIG } from '@ptd/core'

// ── Editor core state ──────────────────────────────────────────────────────

export const templateSignal = signal<TemplateSchema>({
  _version: 1,
  pageConfig: { ...DEFAULT_PAGE_CONFIG },
  pages: [{ id: 'page-1', componentData: [] }],
  dataSource: [],
  dataSet: {},
})

export const currentPageIndexSignal = signal<number>(0)

export const currentPageSignal = computed(
  () => templateSignal.value.pages[currentPageIndexSignal.value],
)

export const componentDataSignal = computed(
  () => currentPageSignal.value?.componentData ?? [],
)

export const pageConfigSignal = computed(() => templateSignal.value.pageConfig)

export const curComponentSignal = signal<ComponentSchema | null>(null)
export const curComponentIndexSignal = signal<number | null>(null)

export const isClickComponentSignal = signal<boolean>(false)
export const isInEditorSignal = signal<boolean>(false)

export const editModeSignal = signal<'edit' | 'preview'>('edit')

// ── Ruler / zoom state ─────────────────────────────────────────────────────

export const scaleSignal = signal<number>(1)
export const showRulerSignal = signal<boolean>(true)

export const rectWidthSignal = signal<number>(0)
export const rectHeightSignal = signal<number>(0)

// ── Clipboard state ────────────────────────────────────────────────────────

export const copyDataSignal = signal<{ data: ComponentSchema | ComponentSchema[]; isCut: boolean } | null>(null)

// ── Area selection state ───────────────────────────────────────────────────

export const areaDataSignal = signal<{
  style: { top: number; left: number; width: number; height: number }
  components: ComponentSchema[]
}>({
  style: { top: 0, left: 0, width: 0, height: 0 },
  components: [],
})

export const isShowAreaSignal = signal<boolean>(false)

// ── Night mode ─────────────────────────────────────────────────────────────

export const isNightModeSignal = signal<boolean>(false)

// ── Mutation helpers ───────────────────────────────────────────────────────

/** Update the style of a component in the current page by id. */
export function setShapeStyle(
  id: string,
  partialStyle: Partial<ComponentSchema['style']>,
  onChange?: (t: typeof templateSignal.value) => void,
): void {
  const pages = templateSignal.value.pages.map((page, i) => {
    if (i !== currentPageIndexSignal.value) return page
    return {
      ...page,
      componentData: page.componentData.map((c) =>
        c.id === id ? { ...c, style: { ...c.style, ...partialStyle } } : c,
      ),
    }
  })
  const next = { ...templateSignal.value, pages }
  templateSignal.value = next
  // Keep curComponent in sync
  if (curComponentSignal.value?.id === id) {
    curComponentSignal.value = { ...curComponentSignal.value, style: { ...curComponentSignal.value.style, ...partialStyle } }
  }
  onChange?.(next)
}

/** Add a component to the current page. */
export function addComponent(
  schema: ComponentSchema,
  onChange?: (t: typeof templateSignal.value) => void,
): void {
  const pages = templateSignal.value.pages.map((page, i) => {
    if (i !== currentPageIndexSignal.value) return page
    return { ...page, componentData: [...page.componentData, schema] }
  })
  const next = { ...templateSignal.value, pages }
  templateSignal.value = next
  onChange?.(next)
}

/** Delete a component from the current page by id. */
export function deleteComponent(
  id: string,
  onChange?: (t: typeof templateSignal.value) => void,
): void {
  const pages = templateSignal.value.pages.map((page, i) => {
    if (i !== currentPageIndexSignal.value) return page
    return { ...page, componentData: page.componentData.filter((c) => c.id !== id) }
  })
  const next = { ...templateSignal.value, pages }
  templateSignal.value = next
  if (curComponentSignal.value?.id === id) {
    curComponentSignal.value = null
    curComponentIndexSignal.value = null
  }
  onChange?.(next)
}
