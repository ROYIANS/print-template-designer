import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
} from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { DEFAULT_PAGE_CONFIG } from '@ptd/core'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthGuard } from '../src/auth/auth.guard.js'
import { OutputBrowserService } from '../src/output/output-browser.service.js'
import { OutputController } from '../src/output/output.controller.js'
import { OutputEngineError } from '../src/output/output-errors.js'

const NOW = '2026-08-03T08:30:00.000Z'

function body() {
  return {
    template: {
      _version: 2,
      pageConfig: { ...DEFAULT_PAGE_CONFIG, title: '采购送货单' },
      pages: [{ id: 'page-1', componentData: [] }],
      data: { version: 1, fields: [] },
    },
    renderContext: {
      data: {},
      locale: 'zh-CN',
      timeZone: 'Asia/Shanghai',
      now: NOW,
      mode: 'export',
    },
    options: {
      locale: 'zh-CN',
      timeZone: 'Asia/Shanghai',
      now: NOW,
      title: '采购送货单',
    },
    fileName: '采购送货单',
  }
}

@Injectable()
class TestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ header(name: string): string | undefined }>()
    if (request.header('x-test-user') === 'anonymous') {
      throw new UnauthorizedException('Not authenticated')
    }
    return true
  }
}

describe('output PDF controller', () => {
  let app: INestApplication
  const renderPdf = vi.fn()

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [OutputController],
      providers: [{ provide: OutputBrowserService, useValue: { renderPdf } }],
    })
      .overrideGuard(AuthGuard)
      .useClass(TestAuthGuard)
      .compile()
    app = module.createNestApplication()
    await app.init()
  })

  beforeEach(() => {
    renderPdf.mockReset().mockResolvedValue({
      pdf: Buffer.from('%PDF-1.7\nFoliq'),
      pageCount: 1,
      diagnostics: [],
    })
  })

  afterAll(async () => {
    await app?.close()
  })

  it('requires authentication and returns a non-cacheable PDF attachment', async () => {
    await request(app.getHttpServer())
      .post('/api/output/pdf')
      .set('x-test-user', 'anonymous')
      .send(body())
      .expect(401)

    const response = await request(app.getHttpServer()).post('/api/output/pdf').send(body())
    expect(response.status, response.text).toBe(200)

    expect(response.headers['content-type']).toContain('application/pdf')
    expect(response.headers['cache-control']).toBe('no-store')
    expect(response.headers['content-disposition']).toContain("filename*=UTF-8''")
    expect(Buffer.isBuffer(response.body)).toBe(true)
    expect(renderPdf).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: '采购送货单' }),
      expect.any(AbortSignal),
    )
  })

  it('returns safe warning diagnostic codes with a successful PDF', async () => {
    renderPdf.mockResolvedValueOnce({
      pdf: Buffer.from('%PDF-1.7\nFoliq'),
      pageCount: 1,
      diagnostics: [
        { severity: 'warning', code: 'EMPTY_PAGE', message: '输出页面没有可打印组件。' },
        { severity: 'warning', code: 'EMPTY_PAGE', message: '输出页面没有可打印组件。' },
      ],
    })
    const response = await request(app.getHttpServer())
      .post('/api/output/pdf')
      .send(body())
      .expect(200)
    expect(response.headers['x-ptd-output-warnings']).toBe('EMPTY_PAGE')
  })

  it.each([
    ['layout', new OutputEngineError('layout', 'Fatal layout', ['ROW_TOO_TALL']), 422, false],
    ['saturated', new OutputEngineError('saturated', 'Busy'), 429, true],
    ['timeout', new OutputEngineError('timeout', 'Timed out'), 504, true],
    ['browser', new OutputEngineError('browser', 'Unavailable'), 503, true],
  ])('maps %s failures to a stable HTTP contract', async (_kind, error, status, retryable) => {
    renderPdf.mockRejectedValueOnce(error)
    const response = await request(app.getHttpServer())
      .post('/api/output/pdf')
      .send(body())
      .expect(status)

    expect(response.body).toMatchObject({ statusCode: status })
    if (retryable) expect(response.body.retryable).toBe(true)
    else expect(response.body).not.toHaveProperty('retryable')
    if (status === 422) expect(response.body.diagnosticCodes).toEqual(['ROW_TOO_TALL'])
  })

  it('rejects malformed output contracts before acquiring a browser slot', async () => {
    await request(app.getHttpServer())
      .post('/api/output/pdf')
      .send({ ...body(), renderContext: { ...body().renderContext, mode: 'print' } })
      .expect(400)
    expect(renderPdf).not.toHaveBeenCalled()
  })
})
