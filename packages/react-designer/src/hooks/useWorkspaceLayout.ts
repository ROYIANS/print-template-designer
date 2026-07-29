import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react'

export type ResourcePanelId = 'pages' | 'layers' | 'data' | 'assets'
export type WorkspaceMode = 'wide' | 'standard' | 'compact'
export type PanelSide = 'resources' | 'inspector'

export const RESOURCE_PANEL_MIN = 200
export const RESOURCE_PANEL_MAX = 360
export const INSPECTOR_MIN = 280
export const INSPECTOR_MAX = 420

export function workspaceModeForWidth(width: number): WorkspaceMode {
  if (width < 1180) return 'compact'
  if (width < 1440) return 'standard'
  return 'wide'
}

export function clampPanelWidth(side: PanelSide, width: number): number {
  const minimum = side === 'resources' ? RESOURCE_PANEL_MIN : INSPECTOR_MIN
  const maximum = side === 'resources' ? RESOURCE_PANEL_MAX : INSPECTOR_MAX
  return Math.min(maximum, Math.max(minimum, Math.round(width)))
}

export function useWorkspaceLayout(rootRef: RefObject<HTMLElement | null>) {
  const [mode, setMode] = useState<WorkspaceMode>('wide')
  const [activeResource, setActiveResource] = useState<ResourcePanelId>('assets')
  const [resourcesOpen, setResourcesOpen] = useState(true)
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const [resourceWidth, setResourceWidth] = useState(220)
  const [inspectorWidth, setInspectorWidth] = useState(304)
  const initializedRef = useRef(false)
  const modeRef = useRef(mode)
  const activeResourceRef = useRef(activeResource)
  const resizeCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const update = (width: number) => {
      const nextMode = workspaceModeForWidth(width)
      const previous = modeRef.current
      modeRef.current = nextMode
      setMode(nextMode)
      if (!initializedRef.current) {
        initializedRef.current = true
        setResourcesOpen(nextMode === 'wide')
        setInspectorOpen(nextMode !== 'compact')
        return
      }
      if (previous === nextMode) return
      if (nextMode === 'compact') {
        setResourcesOpen(false)
        setInspectorOpen(false)
      } else if (nextMode === 'standard') {
        setResourcesOpen(false)
        setInspectorOpen(true)
      } else {
        setResourcesOpen(true)
        setInspectorOpen(true)
      }
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) update(entry.contentRect.width)
    })
    observer.observe(root)
    update(root.getBoundingClientRect().width)
    return () => observer.disconnect()
  }, [rootRef])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || modeRef.current !== 'compact') return
      setResourcesOpen(false)
      setInspectorOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => () => resizeCleanupRef.current?.(), [])

  const toggleResource = useCallback((panel: ResourcePanelId) => {
    const wasActive = activeResourceRef.current === panel
    activeResourceRef.current = panel
    setActiveResource(panel)
    setResourcesOpen((open) => {
      const next = wasActive ? !open : true
      if (next && modeRef.current === 'compact') setInspectorOpen(false)
      return next
    })
  }, [])

  const toggleInspector = useCallback(() => {
    setInspectorOpen((open) => {
      const next = !open
      if (next && modeRef.current === 'compact') setResourcesOpen(false)
      return next
    })
  }, [])

  const openInspector = useCallback(() => {
    setInspectorOpen(true)
    if (modeRef.current === 'compact') setResourcesOpen(false)
  }, [])

  const closeOverlay = useCallback(() => {
    if (modeRef.current !== 'compact') return
    setResourcesOpen(false)
    setInspectorOpen(false)
  }, [])

  const beginResize = useCallback(
    (side: PanelSide, event: PointerEvent<HTMLElement>) => {
      if (modeRef.current === 'compact') return
      event.preventDefault()
      const startX = event.clientX
      const startWidth = side === 'resources' ? resourceWidth : inspectorWidth
      const direction = side === 'resources' ? 1 : -1
      const move = (nextEvent: globalThis.PointerEvent) => {
        const nextWidth = startWidth + (nextEvent.clientX - startX) * direction
        if (side === 'resources') setResourceWidth(clampPanelWidth(side, nextWidth))
        else setInspectorWidth(clampPanelWidth(side, nextWidth))
      }
      const cleanup = () => {
        document.removeEventListener('pointermove', move)
        document.removeEventListener('pointerup', cleanup)
        document.removeEventListener('pointercancel', cleanup)
        resizeCleanupRef.current = null
      }
      resizeCleanupRef.current?.()
      resizeCleanupRef.current = cleanup
      document.addEventListener('pointermove', move)
      document.addEventListener('pointerup', cleanup)
      document.addEventListener('pointercancel', cleanup)
    },
    [inspectorWidth, resourceWidth],
  )

  return {
    mode,
    activeResource,
    resourcesOpen,
    inspectorOpen,
    resourceWidth,
    inspectorWidth,
    toggleResource,
    toggleInspector,
    openInspector,
    closeOverlay,
    beginResize,
  }
}
