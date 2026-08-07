import { Inject, Injectable, type OnApplicationShutdown } from '@nestjs/common'
import type {
  Browser,
  BrowserContext,
  BrowserType,
  Page,
  Request as PlaywrightRequest,
  Route,
} from 'playwright-core'
import type { OutputDiagnostic, OutputDiagnosticCode } from '@ptd/core'
import type { OutputPdfInput } from './output-contract.js'
import { OutputConfigService } from './output-config.js'
import { OutputEngineError } from './output-errors.js'

export const OUTPUT_BROWSER_TYPE = Symbol('OUTPUT_BROWSER_TYPE')

const MAX_PDF_BYTES = 64 * 1024 * 1024
const DIAGNOSTIC_CODES = new Set<OutputDiagnosticCode>([
  'TEXT_OVERFLOW',
  'ROW_TOO_TALL',
  'UNSUPPORTED_TABLE_SPAN',
  'UNBREAKABLE_FRAGMENT',
  'PAGE_LIMIT_EXCEEDED',
  'PAGE_BOUNDS_EXCEEDED',
  'EMPTY_PAGE',
  'MISSING_FONT',
  'IMAGE_LOAD_FAILED',
  'REMOTE_RESOURCE_BLOCKED',
  'QRCODE_RENDER_FAILED',
  'BARCODE_RENDER_FAILED',
  'LAYOUT_TIMEOUT',
])

export type OutputBrowserType = Pick<BrowserType, 'launch'>

export interface OutputPdfResult {
  readonly pdf: Buffer
  readonly pageCount: number
  readonly diagnostics: readonly OutputDiagnostic[]
}

interface InternalRenderResult {
  readonly pageCount: number
  readonly diagnostics: readonly OutputDiagnostic[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function renderDiagnostic(value: unknown): OutputDiagnostic {
  if (!isRecord(value)) throw new OutputEngineError('browser', 'Render diagnostic is invalid')
  const severity = value['severity']
  const code = value['code']
  const message = value['message']
  if (
    !['info', 'warning', 'error'].includes(String(severity)) ||
    typeof code !== 'string' ||
    !DIAGNOSTIC_CODES.has(code as OutputDiagnosticCode) ||
    typeof message !== 'string'
  ) {
    throw new OutputEngineError('browser', 'Render diagnostic contract is invalid')
  }
  const sourceComponentId = value['sourceComponentId']
  const pageNumber = diagnosticIndex(value['pageNumber'], 'pageNumber')
  const fragmentIndex = diagnosticIndex(value['fragmentIndex'], 'fragmentIndex')
  const horizontalOverflowPx = diagnosticMeasurement(
    value['horizontalOverflowPx'],
    'horizontalOverflowPx',
  )
  const verticalOverflowPx = diagnosticMeasurement(
    value['verticalOverflowPx'],
    'verticalOverflowPx',
  )
  if (sourceComponentId !== undefined && typeof sourceComponentId !== 'string') {
    throw new OutputEngineError('browser', 'Render diagnostic source is invalid')
  }
  return {
    severity: severity as OutputDiagnostic['severity'],
    code: code as OutputDiagnosticCode,
    message,
    ...(sourceComponentId === undefined ? {} : { sourceComponentId }),
    ...(pageNumber === undefined ? {} : { pageNumber }),
    ...(fragmentIndex === undefined ? {} : { fragmentIndex }),
    ...(horizontalOverflowPx === undefined ? {} : { horizontalOverflowPx }),
    ...(verticalOverflowPx === undefined ? {} : { verticalOverflowPx }),
  }
}

function diagnosticIndex(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new OutputEngineError('browser', `Render diagnostic ${field} is invalid`)
  }
  return value
}

function diagnosticMeasurement(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new OutputEngineError('browser', `Render diagnostic ${field} is invalid`)
  }
  return value
}

function renderResult(value: unknown): InternalRenderResult {
  if (!isRecord(value)) throw new OutputEngineError('browser', 'Render result is invalid')
  const pageCount = value['pageCount']
  const diagnostics = value['diagnostics']
  if (
    typeof pageCount !== 'number' ||
    !Number.isInteger(pageCount) ||
    pageCount < 1 ||
    pageCount > 200 ||
    !Array.isArray(diagnostics)
  ) {
    throw new OutputEngineError('browser', 'Render result contract is invalid')
  }
  return { pageCount, diagnostics: diagnostics.map(renderDiagnostic) }
}

function allowedRequest(request: PlaywrightRequest, renderUrl: URL): boolean {
  let target: URL
  try {
    target = new URL(request.url())
  } catch {
    return false
  }
  if (target.protocol === 'data:' || target.protocol === 'blob:') return true
  if (target.origin !== renderUrl.origin) return false
  if (request.isNavigationRequest()) return target.href === renderUrl.href
  return ['script', 'stylesheet', 'font'].includes(request.resourceType())
}

function abortReason(signal: AbortSignal): OutputEngineError {
  return signal.reason instanceof OutputEngineError
    ? signal.reason
    : new OutputEngineError('cancelled', 'PDF generation was cancelled')
}

function raceAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(abortReason(signal))
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortReason(signal))
    signal.addEventListener('abort', onAbort, { once: true })
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort))
  })
}

function pdfDate(iso: string): string {
  const value = new Date(iso)
  const part = (number: number) => number.toString().padStart(2, '0')
  return `D:${value.getUTCFullYear()}${part(value.getUTCMonth() + 1)}${part(value.getUTCDate())}${part(value.getUTCHours())}${part(value.getUTCMinutes())}${part(value.getUTCSeconds())}+00'00'`
}

export function normalizePdfMetadata(pdf: Buffer, now: string): Buffer {
  const replacement = pdfDate(now)
  const source = pdf.toString('latin1')
  const normalized = source.replace(
    /\/(CreationDate|ModDate) \((D:\d{14}(?:Z|[+-]\d{2}'\d{2}'))\)/g,
    (match, field: string, current: string) =>
      current.length === replacement.length ? `/${field} (${replacement})` : match,
  )
  return normalized === source ? pdf : Buffer.from(normalized, 'latin1')
}

@Injectable()
export class OutputBrowserService implements OnApplicationShutdown {
  private browser: Browser | undefined
  private browserLaunch: Promise<Browser> | undefined
  private activeJobs = 0

  constructor(
    @Inject(OUTPUT_BROWSER_TYPE) private readonly browserType: OutputBrowserType,
    @Inject(OutputConfigService) private readonly configService: OutputConfigService,
  ) {}

  async renderPdf(input: OutputPdfInput, externalSignal?: AbortSignal): Promise<OutputPdfResult> {
    const config = this.configService.value
    if (this.activeJobs >= config.maxConcurrency) {
      throw new OutputEngineError('saturated', 'PDF renderer is at its concurrency limit')
    }
    this.activeJobs += 1
    const controller = new AbortController()
    const timeout = setTimeout(
      () => controller.abort(new OutputEngineError('timeout', 'PDF generation timed out')),
      config.timeoutMs,
    )
    const onExternalAbort = () =>
      controller.abort(new OutputEngineError('cancelled', 'PDF generation was cancelled'))
    externalSignal?.addEventListener('abort', onExternalAbort, { once: true })
    const rendering = this.renderWithRetry(input, controller.signal).finally(() => {
      this.activeJobs -= 1
    })
    try {
      return await raceAbort(rendering, controller.signal)
    } finally {
      clearTimeout(timeout)
      externalSignal?.removeEventListener('abort', onExternalAbort)
    }
  }

  async onApplicationShutdown(): Promise<void> {
    let browser = this.browser
    if (!browser && this.browserLaunch) browser = await this.browserLaunch.catch(() => undefined)
    this.browser = undefined
    if (browser?.isConnected()) await browser.close().catch(() => undefined)
  }

  private async renderWithRetry(
    input: OutputPdfInput,
    signal: AbortSignal,
  ): Promise<OutputPdfResult> {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await this.renderOnce(input, signal)
      } catch (error) {
        if (signal.aborted) throw abortReason(signal)
        const browserDisconnected = !this.browser?.isConnected()
        if (attempt === 0 && browserDisconnected) {
          this.browser = undefined
          continue
        }
        if (error instanceof OutputEngineError) throw error
        throw new OutputEngineError('browser', 'PDF renderer failed', [], { cause: error })
      }
    }
    throw new OutputEngineError('browser', 'PDF browser is unavailable')
  }

  private async renderOnce(input: OutputPdfInput, signal: AbortSignal): Promise<OutputPdfResult> {
    const browser = await raceAbort(this.ensureBrowser(), signal)
    if (signal.aborted) throw abortReason(signal)
    let context: BrowserContext | undefined
    let closeContext: (() => Promise<void>) | undefined
    try {
      context = await raceAbort(
        browser.newContext({
          acceptDownloads: false,
          serviceWorkers: 'block',
        }),
        signal,
      )
      const currentContext = context
      let closePromise: Promise<void> | undefined
      closeContext = () => {
        closePromise ??= currentContext.close().catch(() => undefined)
        return closePromise
      }
      const closeOnAbort = () => void closeContext?.()
      signal.addEventListener('abort', closeOnAbort, { once: true })
      try {
        return await this.renderInContext(currentContext, input, signal)
      } finally {
        signal.removeEventListener('abort', closeOnAbort)
      }
    } finally {
      if (closeContext) await closeContext()
      else await context?.close().catch(() => undefined)
    }
  }

  private async renderInContext(
    context: BrowserContext,
    input: OutputPdfInput,
    signal: AbortSignal,
  ): Promise<OutputPdfResult> {
    const config = this.configService.value
    let remoteResourceBlocked = false
    await raceAbort(
      context.route('**/*', async (route: Route) => {
        if (allowedRequest(route.request(), config.renderUrl)) await route.continue()
        else {
          remoteResourceBlocked = true
          await route.abort('blockedbyclient')
        }
      }),
      signal,
    )
    const page = await raceAbort(context.newPage(), signal)
    page.setDefaultTimeout(Math.min(config.timeoutMs, 10_000))
    await this.openRenderPage(page, config.renderUrl, signal)
    const serializedJob = JSON.stringify(input)
    const rawResult: unknown = await raceAbort(
      page.evaluate(async (source) => {
        const scope = globalThis as unknown as {
          __FOLIQ_OUTPUT_RENDER__?: (value: unknown) => Promise<unknown>
        }
        if (!scope.__FOLIQ_OUTPUT_RENDER__) throw new Error('Output renderer is not available')
        return scope.__FOLIQ_OUTPUT_RENDER__(JSON.parse(source) as unknown)
      }, serializedJob),
      signal,
    )
    const result = renderResult(rawResult)
    if (remoteResourceBlocked) {
      throw new OutputEngineError('layout', 'Remote resources are blocked during PDF generation', [
        'REMOTE_RESOURCE_BLOCKED',
      ])
    }
    const fatalCodes = result.diagnostics
      .filter((diagnostic) => diagnostic.severity === 'error')
      .map((diagnostic) => diagnostic.code)
    if (fatalCodes.length > 0) {
      throw new OutputEngineError(
        'layout',
        'The output document contains fatal layout diagnostics',
        fatalCodes,
      )
    }
    await raceAbort(page.emulateMedia({ media: 'print' }), signal)
    const pdf = await raceAbort(
      page.pdf({
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      }),
      signal,
    )
    if (pdf.byteLength > MAX_PDF_BYTES) {
      throw new OutputEngineError('layout', 'Generated PDF exceeds the 64 MiB output limit')
    }
    return {
      pdf: normalizePdfMetadata(pdf, input.options.now),
      pageCount: result.pageCount,
      diagnostics: result.diagnostics,
    }
  }

  private async openRenderPage(page: Page, url: URL, signal: AbortSignal): Promise<void> {
    await raceAbort(
      page.goto(url.href, { waitUntil: 'domcontentloaded' }).then(() => undefined),
      signal,
    )
    await raceAbort(
      page.waitForFunction(() => {
        const scope = globalThis as unknown as { __FOLIQ_OUTPUT_RENDER__?: unknown }
        return typeof scope.__FOLIQ_OUTPUT_RENDER__ === 'function'
      }),
      signal,
    )
  }

  private async ensureBrowser(): Promise<Browser> {
    if (this.browser?.isConnected()) return this.browser
    if (!this.browserLaunch) {
      const config = this.configService.value
      this.browserLaunch = this.browserType
        .launch({
          headless: true,
          ...(config.chromiumExecutablePath
            ? { executablePath: config.chromiumExecutablePath }
            : {}),
        })
        .then((browser) => {
          this.browser = browser
          browser.on('disconnected', () => {
            if (this.browser === browser) this.browser = undefined
          })
          return browser
        })
        .catch((error: unknown) => {
          throw new OutputEngineError('browser', 'Chromium could not be started', [], {
            cause: error,
          })
        })
        .finally(() => {
          this.browserLaunch = undefined
        })
    }
    return this.browserLaunch
  }
}
