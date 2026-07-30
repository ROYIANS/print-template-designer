import type { Request } from 'express'

export interface SessionUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
}

export type AuthenticatedRequest = Request & { user: SessionUser }
