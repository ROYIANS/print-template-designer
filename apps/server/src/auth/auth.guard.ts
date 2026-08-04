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
import { DevAuthUserService } from './dev-auth-user.service.js'
import { DemoDataService } from './demo-data.service.js'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(AuthConfigService) private readonly authConfig: AuthConfigService,
    @Inject(DemoDataService) private readonly demoData: DemoDataService,
    @Inject(DevAuthUserService) private readonly devAuthUser: DevAuthUserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    if (this.authConfig.authMode === 'dev-bypass') {
      const user = await this.devAuthUser.getUser()
      await this.demoData.ensureVisitor(user)
      ;(request as AuthenticatedRequest).user = user
      return true
    }

    const session = await getAuth().api.getSession({ headers: fromNodeHeaders(request.headers) })
    if (!session) throw new UnauthorizedException('Not authenticated')
    const user = session.user as SessionUser
    await this.demoData.ensureVisitor(user)
    ;(request as AuthenticatedRequest).user = user
    return true
  }
}
