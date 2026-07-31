export type AppRoute = 'landing' | 'workspace'

export type LandingNotice =
  | 'auth-required'
  | 'access-denied'
  | 'session-expired'
  | 'sign-in-failed'
  | 'unavailable'

export function routeFromPathname(pathname: string): AppRoute {
  return pathname === '/app' || pathname.startsWith('/app/') ? 'workspace' : 'landing'
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
