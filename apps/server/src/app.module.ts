import { Module } from '@nestjs/common'
import { HealthController } from './health/health.controller.js'
import { PrismaModule } from './prisma/prisma.module.js'
import { TemplatesModule } from './templates/templates.module.js'

@Module({
  imports: [PrismaModule, TemplatesModule],
  controllers: [HealthController],
})
export class AppModule {}
