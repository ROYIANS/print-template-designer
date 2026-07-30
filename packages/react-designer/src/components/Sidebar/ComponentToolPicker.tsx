import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { RiCheckLine, RiCloseLine, RiSearchLine } from '@remixicon/react'
import {
  catalogGroups,
  findAvailableCatalogItem,
  searchAvailableComponentCatalog,
  type AvailableCatalogItem,
  type CreatableComponentType,
} from '../../catalog'
import { ptdThemeClass } from '../Theme'
import {
  componentToolPickerGeometry,
  type ComponentPickerGeometry,
} from './componentToolPickerGeometry'
import styles from './ComponentToolPicker.module.css'

interface ComponentToolPickerProps {
  id: string
  activeTool: string
  recentTypes: readonly CreatableComponentType[]
  triggerRef: RefObject<HTMLButtonElement | null>
  onSelect: (item: AvailableCatalogItem) => void
  onClose: (restoreFocus: boolean) => void
}

type PickerStyle = CSSProperties & {
  '--ptd-picker-left': string
  '--ptd-picker-top': string
  '--ptd-picker-width': string
  '--ptd-picker-max-height': string
}

export function ComponentToolPicker({
  id,
  activeTool,
  recentTypes,
  triggerRef,
  onSelect,
  onClose,
}: ComponentToolPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [geometry, setGeometry] = useState<ComponentPickerGeometry | null>(null)
  const headingId = `${id}-heading`
  const resultId = `${id}-result`

  const availableItems = useMemo(() => searchAvailableComponentCatalog(query), [query])
  const recentItems = useMemo(
    () =>
      recentTypes
        .map(findAvailableCatalogItem)
        .filter((item): item is AvailableCatalogItem => Boolean(item)),
    [recentTypes],
  )
  const groupedItems = useMemo(
    () =>
      catalogGroups
        .map((group) => ({
          group,
          items: availableItems.filter((item) => item.group === group.id),
        }))
        .filter(({ items }) => items.length > 0),
    [availableItems],
  )

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    const picker = pickerRef.current
    if (!trigger || !picker) return

    const designer = trigger.closest<HTMLElement>('[data-ptd-region="designer"]')
    const triggerRect = trigger.getBoundingClientRect()
    const bounds = designer?.getBoundingClientRect() ?? {
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    }
    setGeometry(componentToolPickerGeometry(triggerRect, bounds, picker.scrollHeight))
  }, [triggerRef])

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      updatePosition()
      searchRef.current?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [updatePosition])

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(updatePosition)
    return () => cancelAnimationFrame(frame)
  }, [availableItems.length, recentItems.length, updatePosition])

  useEffect(() => {
    const trigger = triggerRef.current
    const picker = pickerRef.current
    const designer = trigger?.closest<HTMLElement>('[data-ptd-region="designer"]')
    const observer = new ResizeObserver(updatePosition)
    if (trigger) observer.observe(trigger)
    if (picker) observer.observe(picker)
    if (designer) observer.observe(designer)

    const closeOnOutsidePointer = (event: globalThis.PointerEvent) => {
      const target = event.target as Node
      if (pickerRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      event.preventDefault()
      event.stopPropagation()
      if (event.pointerType === 'mouse') onClose(false)
    }
    const reposition = () => updatePosition()
    document.addEventListener('pointerdown', closeOnOutsidePointer, true)
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    return () => {
      observer.disconnect()
      document.removeEventListener('pointerdown', closeOnOutsidePointer, true)
      window.removeEventListener('resize', reposition)
      window.removeEventListener('scroll', reposition, true)
    }
  }, [onClose, triggerRef, updatePosition])

  if (typeof document === 'undefined') return null

  const choose = (item: AvailableCatalogItem) => {
    onSelect(item)
    onClose(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose(true)
      return
    }

    const target = event.target as HTMLElement
    if (!target.closest('[data-component-type]')) return
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-component-type]'),
    )
    const currentIndex = items.indexOf(target.closest('button') as HTMLButtonElement)
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1 + items.length) % items.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + items.length) % items.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = items.length - 1
    }
    if (nextIndex === null || items.length === 0) return
    event.preventDefault()
    items[nextIndex]?.focus()
  }

  const pickerStyle: PickerStyle = {
    '--ptd-picker-left': `${geometry?.left ?? 0}px`,
    '--ptd-picker-top': `${geometry?.top ?? 0}px`,
    '--ptd-picker-width': `${geometry?.width ?? 264}px`,
    '--ptd-picker-max-height': `${geometry?.maxHeight ?? 480}px`,
  }

  return createPortal(
    <div
      ref={pickerRef}
      id={id}
      className={`${styles.picker} ${ptdThemeClass}`}
      style={pickerStyle}
      role="dialog"
      aria-modal="false"
      aria-labelledby={headingId}
      data-positioned={Boolean(geometry) || undefined}
      data-ptd-region="component-tool-picker"
      data-ptd-editor-interactive="true"
      onKeyDown={handleKeyDown}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <header className={styles.header}>
        <span>
          <strong id={headingId}>组件工具</strong>
          <small>{availableItems.length} 项可用</small>
        </span>
        <button
          type="button"
          className={styles.closeButton}
          aria-label="关闭组件工具选择器"
          onClick={() => onClose(true)}
        >
          <RiCloseLine aria-hidden="true" />
        </button>
      </header>

      <label className={styles.search}>
        <RiSearchLine aria-hidden="true" />
        <span className={styles.visuallyHidden}>搜索组件</span>
        <input
          ref={searchRef}
          type="search"
          value={query}
          placeholder="搜索名称、类型或用途"
          aria-describedby={resultId}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <span id={resultId} className={styles.visuallyHidden} aria-live="polite">
        找到 {availableItems.length} 个可用组件
      </span>

      <div className={styles.body}>
        {!query.trim() && recentItems.length > 0 && (
          <PickerSection title="最近使用" meta={`${recentItems.length} 项`}>
            <div className={styles.grid}>
              {recentItems.map((item) => (
                <PickerItem
                  key={`recent-${item.id}`}
                  item={item}
                  active={activeTool === item.type}
                  onSelect={() => choose(item)}
                />
              ))}
            </div>
          </PickerSection>
        )}

        {groupedItems.map(({ group, items }) => (
          <PickerSection key={group.id} title={group.name} meta={`${items.length} 项`}>
            <div className={styles.grid}>
              {items.map((item) => (
                <PickerItem
                  key={item.id}
                  item={item}
                  active={activeTool === item.type}
                  onSelect={() => choose(item)}
                />
              ))}
            </div>
          </PickerSection>
        ))}

        {availableItems.length === 0 && (
          <div className={styles.emptyState}>
            <strong>没有匹配的组件</strong>
            <span>换一个名称、类型或使用场景试试。</span>
            <button type="button" onClick={() => setQuery('')}>
              清除搜索
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

function PickerSection({
  title,
  meta,
  children,
}: {
  title: string
  meta: string
  children: React.ReactNode
}) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <strong>{title}</strong>
        <span>{meta}</span>
      </header>
      {children}
    </section>
  )
}

function PickerItem({
  item,
  active,
  onSelect,
}: {
  item: AvailableCatalogItem
  active: boolean
  onSelect: () => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      className={styles.item}
      data-component-type={item.type}
      aria-pressed={active}
      aria-label={`${item.name}：${item.description}`}
      title={item.description}
      onClick={onSelect}
    >
      <Icon aria-hidden="true" />
      <span>{item.name}</span>
      {active && <RiCheckLine className={styles.check} aria-label="当前工具" />}
    </button>
  )
}
