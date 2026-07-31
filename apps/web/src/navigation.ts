export type AppRoute = 'landing' | 'workspace'

export type WorkspaceView =
  | { kind: 'home' }
  | { kind: 'new' }
  | { kind: 'template'; templateId: number }
  | { kind: 'invalid-template' }

export type LandingNotice =
  | 'auth-required'
  | 'access-denied'
  | 'session-expired'
  | 'sign-in-failed'
  | 'unavailable'

export function routeFromPathname(pathname: string): AppRoute {
  return pathname === '/app' || pathname.startsWith('/app/') ? 'workspace' : 'landing'
}

export function workspaceViewFromSearch(search: string): WorkspaceView {
  const parameters = new URLSearchParams(search)
  const rawTemplateId = parameters.get('template')
  if (rawTemplateId !== null) {
    if (!/^[1-9]\d*$/.test(rawTemplateId)) return { kind: 'invalid-template' }
    const templateId = Number(rawTemplateId)
    if (!Number.isSafeInteger(templateId) || templateId > 2_147_483_647) {
      return { kind: 'invalid-template' }
    }
    return { kind: 'template', templateId }
  }
  if (parameters.get('new') === 'blank') return { kind: 'new' }
  return { kind: 'home' }
}

export function isProductCaptureSearch(search: string, development: boolean): boolean {
  return development && new URLSearchParams(search).get('capture') === 'product'
}

export function landingNoticeFromSearch(search: string): LandingNotice | undefined {
  const parameters = new URLSearchParams(search)
  if (parameters.has('error') || parameters.has('error_description')) return 'sign-in-failed'
  const value = parameters.get('notice')
  switch (value) {
    case 'auth-required':
    case 'access-denied':
    case 'session-expired':
    case 'sign-in-failed':
    case 'unavailable':
      return value
    default:
      return undefined
  }
}

export function landingUrl(notice?: LandingNotice): string {
  return notice ? `/?notice=${notice}` : '/'
}
