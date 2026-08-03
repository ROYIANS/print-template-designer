import { Module } from '@nestjs/common'
import { chromium } from 'playwright-core'
import { AuthModule } from '../auth/auth.module.js'
import { OutputBrowserService, OUTPUT_BROWSER_TYPE } from './output-browser.service.js'
import { OutputConfigService } from './output-config.js'
import { OutputController } from './output.controller.js'

@Module({
  imports: [AuthModule],
  controllers: [OutputController],
  providers: [
    OutputConfigService,
    OutputBrowserService,
    { provide: OUTPUT_BROWSER_TYPE, useValue: chromium },
  ],
})
export class OutputModule {}
