import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module.js'
import { HealthController } from './health/health.controller.js'
import { OutputModule } from './output/output.module.js'
import { PrismaModule } from './prisma/prisma.module.js'
import { TemplatesModule } from './templates/templates.module.js'

@Module({
  imports: [PrismaModule, AuthModule, TemplatesModule, OutputModule],
  controllers: [HealthController],
})
export class AppModule {}
