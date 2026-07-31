import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { fromNodeHeaders } from 'better-auth/node'
import type { Request } from 'express'
import { getAuth } from './auth.js'
import { AuthConfigService } from './auth-config.js'
import type { AuthenticatedRequest, SessionUser } from './authenticated-request.js'
import { isAllowedEmail } from './allowlist.js'
import { DevAuthUserService } from './dev-auth-user.service.js'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(AuthConfigService) private readonly authConfig: AuthConfigService,
    @Inject(DevAuthUserService) private readonly devAuthUser: DevAuthUserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    if (this.authConfig.authMode === 'dev-bypass') {
      ;(request as AuthenticatedRequest).user = await this.devAuthUser.getUser()
      return true
    }

    const session = await getAuth().api.getSession({ headers: fromNodeHeaders(request.headers) })
    if (!session || !isAllowedEmail(session.user.email)) {
      throw new UnauthorizedException('Not authenticated or not allowed')
    }
    ;(request as AuthenticatedRequest).user = session.user as SessionUser
    return true
  }
}
