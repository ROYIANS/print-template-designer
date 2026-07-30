import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import type { PrismaClient } from '../generated/prisma/client.js'
import { isAllowedEmail, parseAllowedEmails } from './allowlist.js'

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

function trustedOrigins(baseUrl: string, webOrigin: string): string[] {
  return [...new Set([new URL(baseUrl).origin, new URL(webOrigin).origin])]
}

export function createAuth(prisma: PrismaClient) {
  const baseURL = requiredEnv('BETTER_AUTH_URL')
  const webOrigin = requiredEnv('PTD_WEB_ORIGIN')
  const secret = requiredEnv('BETTER_AUTH_SECRET')
  if (secret.length < 32) throw new Error('BETTER_AUTH_SECRET must be at least 32 characters')
  parseAllowedEmails(process.env.PTD_ALLOWED_EMAILS)

  return betterAuth({
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    secret,
    baseURL,
    trustedOrigins: trustedOrigins(baseURL, webOrigin),
    emailAndPassword: { enabled: false },
    socialProviders: {
      github: {
        clientId: requiredEnv('GITHUB_CLIENT_ID'),
        clientSecret: requiredEnv('GITHUB_CLIENT_SECRET'),
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => (isAllowedEmail(user.email) ? { data: user } : false),
        },
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
