import { Injectable } from '@nestjs/common'
import { parseAllowedEmails } from './allowlist.js'

export type AuthMode = 'github' | 'dev-bypass'

interface BaseAuthConfig {
  authMode: AuthMode
  baseUrl: string
  webOrigin: string
}

export interface DevBypassAuthConfig extends BaseAuthConfig {
  authMode: 'dev-bypass'
}

export interface GithubAuthConfig extends BaseAuthConfig {
  authMode: 'github'
  secret: string
  githubClientId: string
  githubClientSecret: string
}

export type AuthRuntimeConfig = DevBypassAuthConfig | GithubAuthConfig

function requiredEnv(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

function parseBooleanEnv(env: NodeJS.ProcessEnv, name: string): boolean {
  const value = env[name]?.trim().toLowerCase()
  if (value === undefined || value === '' || value === 'false') return false
  if (value === 'true') return true
  throw new Error(`${name} must be either true or false`)
}

function parseHttpOrigin(env: NodeJS.ProcessEnv, name: string): URL {
  const value = requiredEnv(env, name)
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${name} must be a valid HTTP(S) origin`)
  }

  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username !== '' ||
    url.password !== '' ||
    url.pathname !== '/' ||
    url.search !== '' ||
    url.hash !== ''
  ) {
    throw new Error(`${name} must be a valid HTTP(S) origin`)
  }
  return url
}

function isLoopbackHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

function requireLoopbackOrigin(url: URL, name: string): void {
  if (!isLoopbackHostname(url.hostname)) {
    throw new Error(`${name} must use localhost, 127.0.0.1, or [::1] in dev auth bypass mode`)
  }
}

export function loopbackListenHost(baseUrl: string): '127.0.0.1' | '::1' {
  return new URL(baseUrl).hostname === '[::1]' ? '::1' : '127.0.0.1'
}

export function parseAuthRuntimeConfig(env: NodeJS.ProcessEnv): AuthRuntimeConfig {
  const devAuthBypass = parseBooleanEnv(env, 'PTD_DEV_AUTH_BYPASS')
  const baseUrl = parseHttpOrigin(env, 'BETTER_AUTH_URL')
  const webOrigin = parseHttpOrigin(env, 'PTD_WEB_ORIGIN')

  if (devAuthBypass) {
    if (env.NODE_ENV?.trim().toLowerCase() === 'production') {
      throw new Error('PTD_DEV_AUTH_BYPASS cannot be enabled when NODE_ENV=production')
    }
    requireLoopbackOrigin(baseUrl, 'BETTER_AUTH_URL')
    requireLoopbackOrigin(webOrigin, 'PTD_WEB_ORIGIN')
    return {
      authMode: 'dev-bypass',
      baseUrl: baseUrl.origin,
      webOrigin: webOrigin.origin,
    }
  }

  const secret = requiredEnv(env, 'BETTER_AUTH_SECRET')
  if (secret.length < 32) throw new Error('BETTER_AUTH_SECRET must be at least 32 characters')
  parseAllowedEmails(env.PTD_ALLOWED_EMAILS)

  return {
    authMode: 'github',
    baseUrl: baseUrl.origin,
    webOrigin: webOrigin.origin,
    secret,
    githubClientId: requiredEnv(env, 'GITHUB_CLIENT_ID'),
    githubClientSecret: requiredEnv(env, 'GITHUB_CLIENT_SECRET'),
  }
}

@Injectable()
export class AuthConfigService {
  readonly value = parseAuthRuntimeConfig(process.env)

  get authMode(): AuthMode {
    return this.value.authMode
  }
}
