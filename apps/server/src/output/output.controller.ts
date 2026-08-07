import {
  Body,
  Controller,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  ServiceUnavailableException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { AuthGuard } from '../auth/auth.guard.js'
import {
  parseOutputPdfBody,
  pdfContentDisposition,
  type OutputPdfInput,
} from './output-contract.js'
import { OutputBrowserService } from './output-browser.service.js'
import { OutputEngineError } from './output-errors.js'

function outputException(error: OutputEngineError): HttpException {
  const body = {
    statusCode: 500,
    error: 'Output generation failed',
    message: error.message,
    ...(error.diagnosticCodes.length > 0 ? { diagnosticCodes: error.diagnosticCodes } : {}),
  }
  if (error.kind === 'layout') {
    return new UnprocessableEntityException({ ...body, statusCode: 422 })
  }
  if (error.kind === 'saturated') {
    return new HttpException(
      { ...body, statusCode: 429, retryable: true },
      HttpStatus.TOO_MANY_REQUESTS,
    )
  }
  if (error.kind === 'timeout') {
    return new GatewayTimeoutException({ ...body, statusCode: 504, retryable: true })
  }
  return new ServiceUnavailableException({ ...body, statusCode: 503, retryable: true })
}

@Controller('api/output')
@UseGuards(AuthGuard)
export class OutputController {
  constructor(@Inject(OutputBrowserService) private readonly output: OutputBrowserService) {}

  @Post('pdf')
  async pdf(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: unknown,
  ): Promise<void> {
    const input: OutputPdfInput = parseOutputPdfBody(body)
    const controller = new AbortController()
    const onAborted = () => controller.abort()
    request.once('aborted', onAborted)
    try {
      const result = await this.output.renderPdf(input, controller.signal)
      response.status(200)
      response.setHeader('Content-Type', 'application/pdf')
      response.setHeader('Content-Disposition', pdfContentDisposition(input.fileName))
      response.setHeader('Content-Length', String(result.pdf.byteLength))
      response.setHeader('Cache-Control', 'no-store')
      response.setHeader('X-Content-Type-Options', 'nosniff')
      const warningCodes = result.diagnostics
        .filter((diagnostic) => diagnostic.severity === 'warning')
        .map((diagnostic) => diagnostic.code)
      if (warningCodes.length > 0) {
        response.setHeader('X-PTD-Output-Warnings', [...new Set(warningCodes)].join(','))
      }
      response.send(result.pdf)
    } catch (error) {
      if (error instanceof OutputEngineError) throw outputException(error)
      throw error
    } finally {
      request.off('aborted', onAborted)
    }
  }
}
