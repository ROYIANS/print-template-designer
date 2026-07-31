import { Module } from '@nestjs/common'
import { AuthConfigService } from './auth-config.js'
import { AuthController } from './auth.controller.js'
import { AuthGuard } from './auth.guard.js'
import { DevAuthUserService } from './dev-auth-user.service.js'

@Module({
  controllers: [AuthController],
  providers: [AuthConfigService, AuthGuard, DevAuthUserService],
  exports: [AuthConfigService, AuthGuard, DevAuthUserService],
})
export class AuthModule {}
