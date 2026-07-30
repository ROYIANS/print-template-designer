import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PositiveIntPipe } from './positive-int.pipe.js'
import { TemplatesController } from './templates.controller.js'
import { TemplatesService } from './templates.service.js'

@Module({
  imports: [AuthModule],
  controllers: [TemplatesController],
  providers: [TemplatesService, PositiveIntPipe],
})
export class TemplatesModule {}
