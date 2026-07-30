import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import type { AuthenticatedRequest } from './authenticated-request.js'
import { AuthGuard } from './auth.guard.js'

@Controller('api/account')
@UseGuards(AuthGuard)
export class AuthController {
  @Get('me')
  getMe(@Req() request: AuthenticatedRequest) {
    const { id, name, email, emailVerified, image } = request.user
    return { id, name, email, emailVerified, image: image ?? null }
  }
}
