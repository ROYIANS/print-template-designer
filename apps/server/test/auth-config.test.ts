import { describe, expect, it } from 'vitest'
import { loopbackListenHost, parseAuthRuntimeConfig } from '../src/auth/auth-config.js'

function githubEnvironment(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    BETTER_AUTH_URL: 'https://ptd.example.com',
    BETTER_AUTH_SECRET: 'a-production-secret-that-is-at-least-32-characters',
    PTD_WEB_ORIGIN: 'https://ptd.example.com',
    PTD_ALLOWED_EMAILS: 'owner@example.com',
    GITHUB_CLIENT_ID: 'github-client-id',
    GITHUB_CLIENT_SECRET: 'github-client-secret',
    ...overrides,
  }
}

function bypassEnvironment(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    NODE_ENV: 'development',
    PTD_DEV_AUTH_BYPASS: 'true',
    BETTER_AUTH_URL: 'http://localhost:3000',
    PTD_WEB_ORIGIN: 'http://localhost:5173',
    ...overrides,
  }
}

describe('auth runtime configuration', () => {
  it('defaults to fail-closed GitHub authentication', () => {
    const config = parseAuthRuntimeConfig(githubEnvironment())
    expect(config).toMatchObject({
      authMode: 'github',
      baseUrl: 'https://ptd.example.com',
      webOrigin: 'https://ptd.example.com',
    })

    expect(() =>
      parseAuthRuntimeConfig(
        githubEnvironment({
          PTD_ALLOWED_EMAILS: '',
        }),
      ),
    ).toThrow('at least one email')
    expect(() =>
      parseAuthRuntimeConfig(
        githubEnvironment({
          GITHUB_CLIENT_ID: '',
        }),
      ),
    ).toThrow('GITHUB_CLIENT_ID is required')
  })

  it.each([
    ['http://localhost:3000', 'http://localhost:5173'],
    ['https://127.0.0.1:3000', 'https://127.0.0.1:5173'],
    ['http://[::1]:3000', 'http://[::1]:5173'],
  ])(
    'accepts loopback bypass origins %s and %s without production credentials',
    (baseUrl, webOrigin) => {
      const config = parseAuthRuntimeConfig(
        bypassEnvironment({
          BETTER_AUTH_URL: baseUrl,
          PTD_WEB_ORIGIN: webOrigin,
        }),
      )
      expect(config).toEqual({ authMode: 'dev-bypass', baseUrl, webOrigin })
    },
  )

  it('maps accepted origins to literal loopback listen addresses', () => {
    expect(loopbackListenHost('http://localhost:3000')).toBe('127.0.0.1')
    expect(loopbackListenHost('http://127.0.0.1:3000')).toBe('127.0.0.1')
    expect(loopbackListenHost('http://[::1]:3000')).toBe('::1')
  })

  it.each([
    ['BETTER_AUTH_URL', 'http://0.0.0.0:3000'],
    ['BETTER_AUTH_URL', 'http://localhost.example.com:3000'],
    ['BETTER_AUTH_URL', 'http://127.0.0.2:3000'],
    ['PTD_WEB_ORIGIN', 'https://ptd.example.com'],
  ])('rejects non-loopback %s in bypass mode', (name, value) => {
    expect(() => parseAuthRuntimeConfig(bypassEnvironment({ [name]: value }))).toThrow(
      'must use localhost, 127.0.0.1, or [::1]',
    )
  })

  it.each([
    ['ftp://localhost:3000', 'http://localhost:5173'],
    ['http://user@localhost:3000', 'http://localhost:5173'],
    ['http://localhost:3000/api', 'http://localhost:5173'],
    ['http://localhost:3000', 'http://localhost:5173/?source=dev'],
  ])('rejects values that are not HTTP(S) origins', (baseUrl, webOrigin) => {
    expect(() =>
      parseAuthRuntimeConfig(
        bypassEnvironment({
          BETTER_AUTH_URL: baseUrl,
          PTD_WEB_ORIGIN: webOrigin,
        }),
      ),
    ).toThrow('must be a valid HTTP(S) origin')
  })

  it('rejects bypass in production and rejects ambiguous boolean values', () => {
    expect(() =>
      parseAuthRuntimeConfig(
        bypassEnvironment({
          NODE_ENV: 'production',
        }),
      ),
    ).toThrow('cannot be enabled when NODE_ENV=production')

    expect(() =>
      parseAuthRuntimeConfig(
        githubEnvironment({
          PTD_DEV_AUTH_BYPASS: 'yes',
        }),
      ),
    ).toThrow('must be either true or false')
  })
})
