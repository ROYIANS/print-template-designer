import type {
  Browser,
  BrowserContext,
  Page,
  Request as PlaywrightRequest,
  Route,
} from 'playwright-core'
import { DEFAULT_PAGE_CONFIG, type OutputDiagnostic } from '@ptd/core'
import { describe, expect, it, vi } from 'vitest'
import {
  normalizePdfMetadata,
  OutputBrowserService,
  type OutputBrowserType,
} from '../src/output/output-browser.service.js'
import type { OutputConfigService } from '../src/output/output-config.js'
import type { OutputPdfInput } from '../src/output/output-contract.js'

const NOW = '2026-08-03T08:30:00.000Z'
const RENDER_URL = new URL('http://127.0.0.1:5173/output-render.html')

function input(): OutputPdfInput {
  return {
    template: {
      _version: 2,
      pageConfig: { ...DEFAULT_PAGE_CONFIG, title: '输出测试' },
      pages: [{ id: 'page-1', componentData: [] }],
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
      title: '输出测试',
    },
    fileName: '输出测试',
  }
}

function config(maxConcurrency = 2, timeoutMs = 5_000): OutputConfigService {
  return {
    value: {
      renderUrl: RENDER_URL,
      maxConcurrency,
      timeoutMs,
    },
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve
  })
  return { promise, resolve }
}

interface FakeBrowserOptions {
  evaluate?: () => Promise<unknown>
  diagnostics?: readonly OutputDiagnostic[]
  remoteRequest?: string
  closeContext?: () => Promise<void>
}

function fakeBrowser(options: FakeBrowserOptions = {}) {
  let routeHandler: ((route: Route) => Promise<void>) | undefined
  const contextClose = vi.fn(options.closeContext ?? (async () => undefined))
  const pagePdf = vi.fn(async () =>
    Buffer.from(
      "%PDF-1.7\n/CreationDate (D:20260803160000+00'00')\n/ModDate (D:20260803160000+00'00')\n",
    ),
  )
  const request = (url: string, resourceType: string, navigation: boolean) =>
    ({
      url: () => url,
      resourceType: () => resourceType,
      isNavigationRequest: () => navigation,
    }) as unknown as PlaywrightRequest
  const invokeRoute = async (url: string, resourceType: string, navigation: boolean) => {
    const route = {
      request: () => request(url, resourceType, navigation),
      continue: vi.fn(async () => undefined),
      abort: vi.fn(async () => undefined),
    } as unknown as Route
    await routeHandler?.(route)
  }
  const page = {
    setDefaultTimeout: vi.fn(),
    goto: vi.fn(async (url: string) => {
      await invokeRoute(url, 'document', true)
      return null
    }),
    waitForFunction: vi.fn(async () => undefined),
    evaluate: vi.fn(async () => {
      if (options.remoteRequest) await invokeRoute(options.remoteRequest, 'image', false)
      if (options.evaluate) return options.evaluate()
      return { pageCount: 2, diagnostics: options.diagnostics ?? [] }
    }),
    emulateMedia: vi.fn(async () => undefined),
    pdf: pagePdf,
  } as unknown as Page
  const context = {
    route: vi.fn(async (_pattern: string, handler: (route: Route) => Promise<void>) => {
      routeHandler = handler
    }),
    newPage: vi.fn(async () => page),
    close: contextClose,
  } as unknown as BrowserContext
  let connected = true
  let disconnected: (() => void) | undefined
  const browser = {
    isConnected: () => connected,
    newContext: vi.fn(async () => context),
    close: vi.fn(async () => {
      connected = false
      disconnected?.()
    }),
    on: vi.fn((event: string, handler: () => void) => {
      if (event === 'disconnected') disconnected = handler
      return browser
    }),
  } as unknown as Browser
  const browserType = {
    launch: vi.fn(async () => browser),
  } as unknown as OutputBrowserType
  return { browser, browserType, contextClose, pagePdf }
}

describe('OutputBrowserService', () => {
  it('reuses one browser, isolates each task and normalizes changing PDF metadata', async () => {
    const fake = fakeBrowser()
    const service = new OutputBrowserService(fake.browserType, config())

    const first = await service.renderPdf(input())
    const second = await service.renderPdf(input())

    expect(fake.browserType.launch).toHaveBeenCalledTimes(1)
    expect(fake.contextClose).toHaveBeenCalledTimes(2)
    expect(fake.pagePdf).toHaveBeenCalledWith({
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })
    expect(first.pageCount).toBe(2)
    expect(first.pdf.toString('latin1')).toContain("D:20260803083000+00'00'")
    expect(second.pdf).toEqual(first.pdf)
    await service.onApplicationShutdown()
  })

  it('rejects remote resources without exposing or requesting their contents', async () => {
    const fake = fakeBrowser({ remoteRequest: 'http://169.254.169.254/latest/meta-data' })
    const service = new OutputBrowserService(fake.browserType, config())

    await expect(service.renderPdf(input())).rejects.toMatchObject({
      kind: 'layout',
      diagnosticCodes: ['REMOTE_RESOURCE_BLOCKED'],
    })
    expect(fake.pagePdf).not.toHaveBeenCalled()
    expect(fake.contextClose).toHaveBeenCalledTimes(1)
  })

  it('enforces a hard concurrency ceiling without creating an unbounded page queue', async () => {
    const pending = deferred<unknown>()
    const started = deferred<void>()
    const fake = fakeBrowser({
      evaluate: async () => {
        started.resolve()
        return pending.promise
      },
    })
    const service = new OutputBrowserService(fake.browserType, config(1))
    const first = service.renderPdf(input())
    await started.promise

    await expect(service.renderPdf(input())).rejects.toMatchObject({
      kind: 'saturated',
    })
    pending.resolve({ pageCount: 1, diagnostics: [] })
    await expect(first).resolves.toMatchObject({ pageCount: 1 })
  })

  it('closes the isolated context on timeout', async () => {
    const pending = deferred<unknown>()
    const started = deferred<void>()
    const fake = fakeBrowser({
      evaluate: async () => {
        started.resolve()
        return pending.promise
      },
    })
    const service = new OutputBrowserService(fake.browserType, config(1, 20))
    const rendering = service.renderPdf(input())
    await started.promise

    await expect(rendering).rejects.toMatchObject({ kind: 'timeout' })
    await vi.waitFor(() => expect(fake.contextClose).toHaveBeenCalledTimes(1))
  })

  it('keeps a cancelled job in the concurrency count until its context cleanup finishes', async () => {
    const pending = deferred<unknown>()
    const started = deferred<void>()
    const cleanup = deferred<void>()
    const fake = fakeBrowser({
      evaluate: async () => {
        started.resolve()
        return pending.promise
      },
      closeContext: () => cleanup.promise,
    })
    const service = new OutputBrowserService(fake.browserType, config(1))
    const controller = new AbortController()
    const rendering = service.renderPdf(input(), controller.signal)
    await started.promise

    controller.abort()
    await expect(rendering).rejects.toMatchObject({ kind: 'cancelled' })
    expect(fake.contextClose).toHaveBeenCalled()
    await expect(service.renderPdf(input())).rejects.toMatchObject({ kind: 'saturated' })
    expect((service as unknown as { activeJobs: number }).activeJobs).toBe(1)

    cleanup.resolve()
    await vi.waitFor(() =>
      expect((service as unknown as { activeJobs: number }).activeJobs).toBe(0),
    )
  })

  it('rebuilds Chromium once after a disconnected browser fails a job', async () => {
    const healthy = fakeBrowser()
    const crashed = {
      isConnected: () => false,
      newContext: vi.fn(async () => {
        throw new Error('Browser has disconnected')
      }),
      close: vi.fn(async () => undefined),
      on: vi.fn(function (this: Browser) {
        return this
      }),
    } as unknown as Browser
    const browserType = {
      launch: vi
        .fn<OutputBrowserType['launch']>()
        .mockResolvedValueOnce(crashed)
        .mockResolvedValueOnce(healthy.browser),
    } as unknown as OutputBrowserType
    const service = new OutputBrowserService(browserType, config())

    await expect(service.renderPdf(input())).resolves.toMatchObject({ pageCount: 2 })
    expect(browserType.launch).toHaveBeenCalledTimes(2)
    expect(healthy.contextClose).toHaveBeenCalledTimes(1)
  })
})

describe('normalizePdfMetadata', () => {
  it('does not rewrite a compact PDF date when replacement would move xref offsets', () => {
    const pdf = Buffer.from('%PDF /CreationDate (D:20260803Z)')
    expect(normalizePdfMetadata(pdf, NOW)).toBe(pdf)
  })
})
