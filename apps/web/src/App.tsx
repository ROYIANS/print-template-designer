import { useEffect, useState } from 'react'
import { Designer, type TemplateSchema } from '@ptd/react-designer'
import { authClient } from './auth-client'
import styles from './App.module.css'

const INITIAL_TEMPLATE: TemplateSchema = {
  _version: 1,
  pageConfig: {
    pageSize: 'A4',
    pageDirection: 'p',
    pageLayout: 'fixed',
    pageWidth: 210,
    pageHeight: 297,
    pageCurHeight: 297,
    pageMarginBottom: 10,
    pageMarginTop: 10,
    pageMarginLeft: 10,
    pageMarginRight: 10,
    title: '新建模板',
    scale: 1,
    background: '#fcfdff',
    color: '#1d2735',
    fontSize: 12,
    fontFamily: "'Noto Serif SC', 'Noto Serif CJK SC', 'Source Han Serif SC', serif",
    lineHeight: 1.4,
  },
  pages: [
    {
      id: 'page-1',
      componentData: [],
    },
  ],
  dataSource: [],
  dataSet: {},
}

interface AccountUser {
  id: string
  name: string
  email: string
  image: string | null
}

type AccessState =
  | { kind: 'signedOut' }
  | { kind: 'allowed'; user: AccountUser }
  | { kind: 'denied' }
  | { kind: 'error' }

type AccountAccess = Exclude<AccessState, { kind: 'signedOut' }> & { sessionUserId: string }

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2.24c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.74-1.55-2.57-.3-5.27-1.29-5.27-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.3 3.17 1.18a10.9 10.9 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.71 5.38-5.29 5.67.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"
      />
    </svg>
  )
}

function AccessScreen({ state }: { state: AccessState }) {
  const [signingIn, setSigningIn] = useState(false)
  const [message, setMessage] = useState<string>()

  const signIn = async () => {
    setSigningIn(true)
    setMessage(undefined)
    const result = await authClient.signIn.social({
      provider: 'github',
      callbackURL: window.location.origin,
    })
    if (result.error) {
      setMessage(result.error.message ?? 'GitHub 登录没有完成，请重试。')
      setSigningIn(false)
    }
  }

  const denied = state.kind === 'denied'
  const failed = state.kind === 'error'
  return (
    <main className={styles.accessShell}>
      <div className={styles.registration} aria-hidden="true">
        <span>PTD / ACCESS</span>
        <span>210 × 297</span>
      </div>
      <section className={styles.accessPanel} aria-labelledby="access-title">
        <div className={styles.mark} aria-hidden="true">
          <span>PTD</span>
        </div>
        <p className={styles.eyebrow}>Print Template Designer</p>
        <h1 id="access-title">
          {denied ? '此账户尚未获准' : failed ? '无法连接设计器服务' : '进入制版工作台'}
        </h1>
        <p className={styles.lede}>
          {denied
            ? '当前 GitHub 邮箱不在此实例的访问名单中。请联系部署者添加后再试。'
            : failed
              ? '会话服务暂时不可用。请确认 Server 与 PostgreSQL 已启动，然后刷新页面。'
              : '此实例采用受控访问。GitHub 仅用于确认身份，模板和版本由服务端按账户隔离。'}
        </p>
        {denied ? (
          <button className={styles.githubButton} onClick={() => void authClient.signOut()}>
            退出当前账户
          </button>
        ) : failed ? (
          <button className={styles.githubButton} onClick={() => window.location.reload()}>
            重新连接
          </button>
        ) : (
          <button
            className={styles.githubButton}
            disabled={signingIn}
            onClick={() => void signIn()}
          >
            <GitHubIcon />
            {signingIn ? '正在前往 GitHub…' : '使用 GitHub 登录'}
          </button>
        )}
        {message && <p className={styles.errorMessage}>{message}</p>}
        <p className={styles.securityNote}>Cookie 会话 · 不保存浏览器 Token · 服务端强制授权</p>
      </section>
    </main>
  )
}

function App() {
  const [template, setTemplate] = useState(INITIAL_TEMPLATE)
  const session = authClient.useSession()
  const [accountAccess, setAccountAccess] = useState<AccountAccess>()

  useEffect(() => {
    if (!session.data) return
    const sessionUserId = session.data.user.id
    const controller = new AbortController()
    void fetch('/api/account/me', { credentials: 'include', signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) {
          setAccountAccess({ kind: 'denied', sessionUserId })
          return
        }
        if (!response.ok) throw new Error(`Account request failed: ${response.status}`)
        setAccountAccess({
          kind: 'allowed',
          sessionUserId,
          user: (await response.json()) as AccountUser,
        })
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setAccountAccess({ kind: 'error', sessionUserId })
        }
      })
    return () => controller.abort()
  }, [session.data])

  if (session.isPending) {
    return <div className={styles.loading} role="status" aria-label="正在检查登录状态" />
  }
  if (session.error) return <AccessScreen state={{ kind: 'error' }} />
  if (!session.data) return <AccessScreen state={{ kind: 'signedOut' }} />
  if (!accountAccess || accountAccess.sessionUserId !== session.data.user.id) {
    return <div className={styles.loading} role="status" aria-label="正在检查访问权限" />
  }
  const access: AccessState = accountAccess
  if (access.kind !== 'allowed') return <AccessScreen state={access} />

  return (
    <main className={styles.app}>
      <Designer value={template} onChange={setTemplate} />
      <button
        type="button"
        className={styles.accountButton}
        aria-label={`退出登录（${access.user.email}）`}
        title={`${access.user.name} · ${access.user.email} · 点击退出`}
        onClick={() => void authClient.signOut()}
      >
        {access.user.image ? <img src={access.user.image} alt="" /> : access.user.name.slice(0, 1)}
      </button>
    </main>
  )
}

export default App
