import { signal } from '@preact/signals-react'
import type { ComponentSchema } from '@ptd/core'
import { templateSignal, currentPageIndexSignal, curComponentSignal, curComponentIndexSignal } from './editor'

const MAX_SNAP_SHOT_LENGTH = 20

export const snapshotDataSignal = signal<ComponentSchema[][]>([])
export const snapshotIndexSignal = signal<number>(-1)

export function recordSnapshot(): void {
  const componentData = templateSignal.value.pages[currentPageIndexSignal.value]?.componentData ?? []
  const copy = JSON.parse(JSON.stringify(componentData)) as ComponentSchema[]

  // Discard any redo history beyond current index
  const trimmed = snapshotDataSignal.value.slice(0, snapshotIndexSignal.value + 1)
  if (trimmed.length >= MAX_SNAP_SHOT_LENGTH) {
    trimmed.shift()
  }
  trimmed.push(copy)
  snapshotDataSignal.value = trimmed
  snapshotIndexSignal.value = trimmed.length - 1
}

export function undo(onChange?: (t: typeof templateSignal.value) => void): void {
  if (snapshotIndexSignal.value < 1) return
  snapshotIndexSignal.value--
  applySnapshot(onChange)
}

export function redo(onChange?: (t: typeof templateSignal.value) => void): void {
  if (snapshotIndexSignal.value >= snapshotDataSignal.value.length - 1) return
  snapshotIndexSignal.value++
  applySnapshot(onChange)
}

function applySnapshot(onChange?: (t: typeof templateSignal.value) => void): void {
  const componentData = JSON.parse(
    JSON.stringify(snapshotDataSignal.value[snapshotIndexSignal.value]),
  ) as ComponentSchema[]

  const pages = templateSignal.value.pages.map((page, i) =>
    i === currentPageIndexSignal.value ? { ...page, componentData } : page,
  )
  const next = { ...templateSignal.value, pages }
  templateSignal.value = next
  onChange?.(next)

  // Clear selection if current component no longer exists
  if (curComponentSignal.value) {
    const still = componentData.find((c) => c.id === curComponentSignal.value!.id)
    if (!still) {
      curComponentSignal.value = null
      curComponentIndexSignal.value = null
    }
  }
}
