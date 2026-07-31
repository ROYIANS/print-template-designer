import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Designer,
  type DesignerHost,
  type DesignerHostCommandId,
  type TemplateSchema,
} from '@ptd/react-designer'
import { AccountMenu } from './AccountMenu'
import { authClient } from './auth-client'
import { HelpSheet, type HelpSheetView } from './HelpSheet'
import { LandingPage, type AccessState, type AccountUser } from './LandingPage'
import {
  isProductCaptureSearch,
  landingNoticeFromSearch,
  landingUrl,
  routeFromPathname,
  workspaceViewFromSearch,
  type WorkspaceView,
} from './navigation'
import { SaveAsSheet } from './SaveAsSheet'
import {
  PRODUCT_CAPTURE_KEYS,
  PRODUCT_CAPTURE_TEMPLATES,
  type ProductCaptureKey,
} from './templates'
import {
  documentHostCommandStates,
  shouldConfirmDocumentExit,
  useDocumentController,
} from './useDocumentController'
import { UnsavedDialog } from './WorkspaceDialogs'
import { WorkspaceHome } from './WorkspaceHome'
import styles from './App.module.css'

interface LocationState {
  pathname: string
  search: string
}

type NavigationBlocker = (proceed: () => void) => boolean

const HISTORY_INDEX_KEY = '__foliqNavigationIndex'

function currentLocation(): LocationState {
  return { pathname: window.location.pathname, search: window.location.search }
}

function parseAccountUser(value: unknown): AccountUser {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Account response must be an object')
  }
  const record = value as Record<string, unknown>
  if (
    typeof record['id'] !== 'string' ||
    typeof record['name'] !== 'string' ||
    typeof record['email'] !== 'string' ||
    !(record['image'] === null || typeof record['image'] === 'string') ||
    (record['authMode'] !== 'github' && record['authMode'] !== 'dev-bypass')
  ) {
    throw new Error('Account response is missing required user fields')
  }
  return {
    id: record['id'],
    name: record['name'],
    email: record['email'],
    image: record['image'],
    authMode: record['authMode'],
  }
}

function historyIndex(state: unknown): number | undefined {
  if (typeof state !== 'object' || state === null || Array.isArray(state)) return undefined
  const value = (state as Record<string, unknown>)[HISTORY_INDEX_KEY]
  return typeof value === 'number' && Number.isSafeInteger(value) ? value : undefined
}

function historyState(index: number): Record<string, unknown> {
  const current = window.history.state
  const base =
    typeof current === 'object' && current !== null && !Array.isArray(current)
      ? (current as Record<string, unknown>)
      : {}
  return { ...base, [HISTORY_INDEX_KEY]: index }
}

export function useBrowserLocation() {
  const initialIndex = historyIndex(window.history.state) ?? 0
  const [location, setLocation] = useState(currentLocation)
  const currentIndexRef = useRef(initialIndex)
  const blockerRef = useRef<NavigationBlocker>()
  const restoringPopRef = useRef(false)
  const bypassPopRef = useRef(false)

  if (historyIndex(window.history.state) === undefined) {
    window.history.replaceState(historyState(initialIndex), '', window.location.href)
  }

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const target = currentLocation()
      const current = location
      const targetIndex = historyIndex(event.state)

      if (restoringPopRef.current) {
        restoringPopRef.current = false
        setLocation(current)
        return
      }

      if (bypassPopRef.current) {
        bypassPopRef.current = false
        if (targetIndex !== undefined) currentIndexRef.current = targetIndex
        setLocation(target)
        window.scrollTo({ top: 0, behavior: 'auto' })
        return
      }

      if (target.pathname === current.pathname && target.search === current.search) {
        if (targetIndex !== undefined) currentIndexRef.current = targetIndex
        setLocation(target)
        return
      }

      const delta =
        targetIndex === undefined ? -1 : targetIndex - currentIndexRef.current
      const proceed = () => {
        bypassPopRef.current = true
        window.history.go(delta)
      }
      if (delta !== 0 && blockerRef.current?.(proceed)) {
        restoringPopRef.current = true
        window.history.go(-delta)
        return
      }

      if (targetIndex !== undefined) currentIndexRef.current = targetIndex
      setLocation(target)
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [location])

  const commitNavigation = useCallback((href: string, replace: boolean) => {
    const nextIndex = replace ? currentIndexRef.current : currentIndexRef.current + 1
    window.history[replace ? 'replaceState' : 'pushState'](historyState(nextIndex), '', href)
    currentIndexRef.current = nextIndex
    setLocation(currentLocation())
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const navigate = useCallback(
    (href: string, replace = false, force = false) => {
      const proceed = () => commitNavigation(href, replace)
      if (!force && blockerRef.current?.(proceed)) return
      proceed()
    },
    [commitNavigation],
  )

  const runGuarded = useCallback((action: () => void) => {
    if (blockerRef.current?.(action)) return
    action()
  }, [])

  const registerBlocker = useCallback((blocker: NavigationBlocker) => {
    blockerRef.current = blocker
    return () => {
      if (blockerRef.current === blocker) blockerRef.current = undefined
    }
  }, [])

  return { location, navigate, registerBlocker, runGuarded }
}

function useAccountAccess() {
  const session = authClient.useSession()
  const sessionUserId = session.data?.user.id
  const [retryToken, setRetryToken] = useState(0)
  const [snapshot, setSnapshot] = useState<{
    sessionUserId: string | null
    access: AccessState
  }>()

  useEffect(() => {
    const controller = new AbortController()
    const checkedSessionUserId = sessionUserId ?? null

    void fetch('/api/account/me', { credentials: 'include', signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          setSnapshot({
            sessionUserId: checkedSessionUserId,
            access:
              sessionUserId || response.status === 403 ? { kind: 'denied' } : { kind: 'signedOut' },
          })
          return
        }
        if (!response.ok) throw new Error(`Account request failed: ${response.status}`)
        setSnapshot({
          sessionUserId: checkedSessionUserId,
          access: { kind: 'allowed', user: parseAccountUser(await response.json()) },
        })
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setSnapshot({ sessionUserId: checkedSessionUserId, access: { kind: 'error' } })
        }
      })

    return () => controller.abort()
  }, [retryToken, sessionUserId])

  const retry = useCallback(() => {
    setSnapshot(undefined)
    setRetryToken((value) => value + 1)
  }, [])
  const access =
    snapshot?.sessionUserId === (sessionUserId ?? null)
      ? snapshot.access
      : ({ kind: 'checking' } satisfies AccessState)
  return { access, retry }
}

type WorkspaceDialog = 'new' | 'leave'

function signOut() {
  return authClient.signOut().then(() => window.location.assign('/'))
}

function WorkspaceEditor({
  user,
  view,
  navigate,
  registerBlocker,
  runGuarded,
}: {
  user: AccountUser
  view: Exclude<WorkspaceView, { kind: 'home' }>
  navigate(href: string, replace?: boolean, force?: boolean): void
  registerBlocker(blocker: NavigationBlocker): () => void
  runGuarded(action: () => void): void
}) {
  const [dialog, setDialog] = useState<WorkspaceDialog>()
  const [helpSheet, setHelpSheet] = useState<HelpSheetView>()
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | undefined>()
  const [saveAsOpen, setSaveAsOpen] = useState(false)
  const allowUnloadRef = useRef(false)
  const requestedTemplateId =
    view.kind === 'template'
      ? view.templateId
      : view.kind === 'invalid-template'
        ? ('invalid' as const)
        : undefined
  const document = useDocumentController({
    requestedTemplateId,
    onLocationChange: (templateId, replace) => {
      navigate(
        templateId === undefined ? '/app?new=blank' : `/app?template=${templateId}`,
        replace,
        true,
      )
    },
  })
  const hasUnsavedChanges = shouldConfirmDocumentExit(document.state)

  useEffect(
    () =>
      registerBlocker((proceed) => {
        if (!hasUnsavedChanges) return false
        setSaveAsOpen(false)
        setPendingNavigation(() => () => {
          allowUnloadRef.current = true
          proceed()
        })
        setDialog('leave')
        return true
      }),
    [hasUnsavedChanges, registerBlocker],
  )

  useEffect(() => {
    if (!hasUnsavedChanges) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (allowUnloadRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [hasUnsavedChanges])

  const requestHome = useCallback(() => {
    setSaveAsOpen(false)
    navigate('/app')
  }, [navigate])

  const host = useMemo<DesignerHost>(
    () => ({
      document: {
        id: document.state.id?.toString(),
        title: document.state.title,
        version: document.state.serverVersion,
        status: document.state.status,
        message: document.state.message,
      },
      commands: {
        ...documentHostCommandStates(document.state),
        keyboardShortcuts: { enabled: true },
        documentation: { enabled: true },
        about: { enabled: true },
      },
      onCommand: async (command: DesignerHostCommandId, context) => {
        switch (command) {
          case 'new':
            setSaveAsOpen(false)
            setHelpSheet(undefined)
            if (hasUnsavedChanges) setDialog('new')
            else document.newDocument()
            return
          case 'open':
          case 'templateBrowser':
            setHelpSheet(undefined)
            requestHome()
            return
          case 'save':
            await document.save(context.template)
            return
          case 'saveAs':
            setHelpSheet(undefined)
            setSaveAsOpen(true)
            return
          case 'keyboardShortcuts':
            setSaveAsOpen(false)
            setHelpSheet('shortcuts')
            return
          case 'documentation':
            setHelpSheet(undefined)
            runGuarded(() => window.location.assign('/#product'))
            return
          case 'about':
            setSaveAsOpen(false)
            setHelpSheet('about')
            return
          default:
            return
        }
      },
    }),
    [document, hasUnsavedChanges, requestHome, runGuarded],
  )

  return (
    <main className={styles.app}>
      <a className={styles.workspaceSkipLink} href="#designer-workspace">
        跳到设计器
      </a>
      <div id="designer-workspace" className={styles.designerHost} tabIndex={-1}>
        <Designer
          value={document.state.currentTemplate}
          onChange={document.setCurrentTemplate}
          host={host}
        />
      </div>
      <AccountMenu
        user={user}
        surface="editor"
        onReturnHome={() => navigate('/')}
        onSignOut={user.authMode === 'github' ? () => runGuarded(signOut) : undefined}
      />
      {saveAsOpen ? (
        <SaveAsSheet
          defaultValue={`${document.state.title} 副本`}
          onClose={() => setSaveAsOpen(false)}
          onConfirm={(title) => {
            setSaveAsOpen(false)
            void document.saveAs(title, document.state.currentTemplate)
          }}
        />
      ) : null}
      {helpSheet ? <HelpSheet view={helpSheet} onClose={() => setHelpSheet(undefined)} /> : null}
      {dialog ? (
        <UnsavedDialog
          action={dialog === 'new' ? 'new' : 'home'}
          onCancel={() => {
            setDialog(undefined)
            setPendingNavigation(undefined)
          }}
          onDiscard={() => {
            const action = dialog
            setDialog(undefined)
            if (action === 'new') {
              setPendingNavigation(undefined)
              document.newDocument()
              return
            }
            const proceed = pendingNavigation
            setPendingNavigation(undefined)
            proceed?.()
          }}
        />
      ) : null}
    </main>
  )
}

function ProductCapture({ captureKey }: { captureKey: ProductCaptureKey }) {
  const [template, setTemplate] = useState<TemplateSchema>(PRODUCT_CAPTURE_TEMPLATES[captureKey])
  const host = useMemo<DesignerHost>(
    () => ({
      document: {
        id: `product-capture-${captureKey}`,
        title: PRODUCT_CAPTURE_TEMPLATES[captureKey].pageConfig.title,
        version: 7,
        status: 'clean',
      },
      commands: {
        new: {},
        open: {},
        save: {},
        saveAs: {},
        templateBrowser: {},
        versionHistory: {},
      },
      onCommand: async () => undefined,
    }),
    [captureKey],
  )

  return (
    <main className={styles.capture} aria-label="Foliq 产品截图捕获视图">
      <Designer value={template} onChange={setTemplate} host={host} />
    </main>
  )
}

function App() {
  const { location, navigate, registerBlocker, runGuarded } = useBrowserLocation()
  const { access, retry } = useAccountAccess()
  const route = routeFromPathname(location.pathname)
  const captureTemplate = new URLSearchParams(location.search).get('template')
  const captureKey =
    PRODUCT_CAPTURE_KEYS.find((key) => key === captureTemplate) ?? PRODUCT_CAPTURE_KEYS[0]
  const captureMode =
    route === 'workspace' && isProductCaptureSearch(location.search, import.meta.env.DEV)

  useEffect(() => {
    if (captureMode || route !== 'workspace' || access.kind === 'checking') return
    if (access.kind === 'signedOut') navigate(landingUrl('auth-required'), true)
    if (access.kind === 'denied') navigate(landingUrl('access-denied'), true)
    if (access.kind === 'error') navigate(landingUrl('unavailable'), true)
  }, [access.kind, captureMode, navigate, route])

  if (captureMode) return <ProductCapture captureKey={captureKey} />

  if (route === 'workspace') {
    if (access.kind === 'allowed') {
      const view = workspaceViewFromSearch(location.search)
      if (view.kind === 'home') {
        return (
          <WorkspaceHome
            accountControl={
              <AccountMenu
                user={access.user}
                surface="home"
                onReturnHome={() => navigate('/')}
                onSignOut={access.user.authMode === 'github' ? signOut : undefined}
              />
            }
            onNew={() => navigate('/app?new=blank')}
            onOpen={(templateId) => navigate(`/app?template=${templateId}`)}
          />
        )
      }
      return (
        <WorkspaceEditor
          user={access.user}
          view={view}
          navigate={navigate}
          registerBlocker={registerBlocker}
          runGuarded={runGuarded}
        />
      )
    }
    return (
      <main className={styles.workspaceLoading} role="status">
        <span aria-hidden="true" />
        正在校验工作台访问权限…
      </main>
    )
  }

  return (
    <LandingPage
      access={access}
      notice={landingNoticeFromSearch(location.search)}
      onEnterApp={() => {
        if (access.kind === 'allowed') navigate('/app')
        else document.querySelector<HTMLButtonElement>('[data-state] button')?.focus()
      }}
      onRetry={retry}
    />
  )
}

export default App
