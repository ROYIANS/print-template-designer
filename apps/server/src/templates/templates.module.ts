import { Module } from '@nestjs/common'
import { PositiveIntPipe } from './positive-int.pipe.js'
import { TemplatesController } from './templates.controller.js'
import { TemplatesService } from './templates.service.js'

@Module({
  controllers: [TemplatesController],
  providers: [TemplatesService, PositiveIntPipe],
})
export class TemplatesModule {}
