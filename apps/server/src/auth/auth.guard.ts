import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { fromNodeHeaders } from 'better-auth/node'
import type { Request } from 'express'
import { getAuth } from './auth.js'
import type { AuthenticatedRequest, SessionUser } from './authenticated-request.js'
import { isAllowedEmail } from './allowlist.js'

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const session = await getAuth().api.getSession({ headers: fromNodeHeaders(request.headers) })
    if (!session || !isAllowedEmail(session.user.email)) {
      throw new UnauthorizedException('Not authenticated or not allowed')
    }
    ;(request as AuthenticatedRequest).user = session.user as SessionUser
    return true
  }
}
