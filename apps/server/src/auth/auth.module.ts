import { Module } from '@nestjs/common'
import { AuthConfigService } from './auth-config.js'
import { AuthController, RuntimeController } from './auth.controller.js'
import { AuthGuard } from './auth.guard.js'
import { DevAuthUserService } from './dev-auth-user.service.js'
import { DemoDataService } from './demo-data.service.js'

@Module({
  controllers: [AuthController, RuntimeController],
  providers: [AuthConfigService, AuthGuard, DemoDataService, DevAuthUserService],
  exports: [AuthConfigService, AuthGuard, DemoDataService, DevAuthUserService],
})
export class AuthModule {}
