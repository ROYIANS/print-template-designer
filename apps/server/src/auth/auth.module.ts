import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller.js'
import { AuthGuard } from './auth.guard.js'

@Module({
  controllers: [AuthController],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
