import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common'
import { AuthConfigService } from './auth-config.js'
import type { AuthenticatedRequest } from './authenticated-request.js'
import { AuthGuard } from './auth.guard.js'

@Controller('api/account')
@UseGuards(AuthGuard)
export class AuthController {
  constructor(@Inject(AuthConfigService) private readonly authConfig: AuthConfigService) {}

  @Get('me')
  getMe(@Req() request: AuthenticatedRequest) {
    const { id, name, email, emailVerified, image } = request.user
    return {
      id,
      name,
      email,
      emailVerified,
      image: image ?? null,
      authMode: this.authConfig.authMode,
      isAdmin: this.authConfig.isAdmin(email),
    }
  }
}

@Controller('api/runtime')
export class RuntimeController {
  constructor(@Inject(AuthConfigService) private readonly authConfig: AuthConfigService) {}

  @Get()
  getRuntime() {
    return {
      demoMode: this.authConfig.demoMode,
      demoResetTime: '00:00 UTC',
    }
  }
}
