import { useCallback, useEffect, useMemo, useState } from 'react'
import { Designer, type DesignerHost, type TemplateSchema } from '@ptd/react-designer'
import { authClient } from './auth-client'
import { LandingPage, type AccessState, type AccountUser } from './LandingPage'
import { landingNoticeFromSearch, landingUrl, routeFromPathname } from './navigation'
import {
  INITIAL_TEMPLATE,
  PRODUCT_CAPTURE_KEYS,
  PRODUCT_CAPTURE_TEMPLATES,
  type ProductCaptureKey,
} from './templates'
import styles from './App.module.css'

interface LocationState {
  pathname: string
  search: string
}

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

function useBrowserLocation() {
  const [location, setLocation] = useState(currentLocation)

  useEffect(() => {
    const sync = () => setLocation(currentLocation())
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  const navigate = useCallback((href: string, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', href)
    setLocation(currentLocation())
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  return { location, navigate }
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

function Workspace({ user }: { user: AccountUser }) {
  const [template, setTemplate] = useState(INITIAL_TEMPLATE)
  const host = useMemo<DesignerHost>(
    () => ({
      document: { title: template.pageConfig.title, status: 'clean' },
    }),
    [template.pageConfig.title],
  )

  return (
    <main className={styles.app}>
      <a className={styles.workspaceSkipLink} href="#designer-workspace">
        跳到设计器
      </a>
      <div id="designer-workspace" className={styles.designerHost} tabIndex={-1}>
        <Designer value={template} onChange={setTemplate} host={host} />
      </div>
      {user.authMode === 'dev-bypass' ? (
        <div
          className={styles.accountButton}
          role="status"
          aria-label={`${user.name} · 本地开发身份`}
          title={`${user.name} · 本地开发身份`}
        >
          {user.image ? <img src={user.image} alt="" /> : user.name.slice(0, 1)}
          <span className={styles.devBadge}>DEV</span>
        </div>
      ) : (
        <button
          type="button"
          className={styles.accountButton}
          aria-label={`退出登录（${user.email}）`}
          title={`${user.name} · ${user.email} · 点击退出`}
          onClick={() => {
            void authClient.signOut().then(() => window.location.assign('/'))
          }}
        >
          {user.image ? <img src={user.image} alt="" /> : user.name.slice(0, 1)}
        </button>
      )}
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
    <main className={styles.capture} aria-label="PTD 产品截图捕获视图">
      <Designer value={template} onChange={setTemplate} host={host} />
    </main>
  )
}

function App() {
  const { location, navigate } = useBrowserLocation()
  const { access, retry } = useAccountAccess()
  const route = routeFromPathname(location.pathname)
  const captureTemplate = new URLSearchParams(location.search).get('template')
  const captureKey =
    PRODUCT_CAPTURE_KEYS.find((key) => key === captureTemplate) ?? PRODUCT_CAPTURE_KEYS[0]
  const captureMode =
    import.meta.env.DEV &&
    route === 'workspace' &&
    new URLSearchParams(location.search).get('capture') === 'product'

  useEffect(() => {
    if (captureMode || route !== 'workspace' || access.kind === 'checking') return
    if (access.kind === 'signedOut') navigate(landingUrl('auth-required'), true)
    if (access.kind === 'denied') navigate(landingUrl('access-denied'), true)
    if (access.kind === 'error') navigate(landingUrl('unavailable'), true)
  }, [access.kind, captureMode, navigate, route])

  if (captureMode) return <ProductCapture captureKey={captureKey} />

  if (route === 'workspace') {
    if (access.kind === 'allowed') return <Workspace user={access.user} />
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
