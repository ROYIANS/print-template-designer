import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import type { PrismaClient } from '../generated/prisma/client.js'
import type { GithubAuthConfig } from './auth-config.js'

function trustedOrigins(baseUrl: string, webOrigin: string): string[] {
  return [...new Set([new URL(baseUrl).origin, new URL(webOrigin).origin])]
}

export function createAuth(prisma: PrismaClient, config: GithubAuthConfig) {
  return betterAuth({
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    secret: config.secret,
    baseURL: config.baseUrl,
    trustedOrigins: trustedOrigins(config.baseUrl, config.webOrigin),
    emailAndPassword: { enabled: false },
    socialProviders: {
      github: {
        clientId: config.githubClientId,
        clientSecret: config.githubClientSecret,
      },
    },
    advanced: {
      database: { generateId: false },
    },
  })
}

export type Auth = ReturnType<typeof createAuth>

let authInstance: Auth | undefined

export function setAuth(auth: Auth): void {
  authInstance = auth
}

export function getAuth(): Auth {
  if (!authInstance) throw new Error('Better Auth has not been initialized')
  return authInstance
}
