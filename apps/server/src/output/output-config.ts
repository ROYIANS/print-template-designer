import { Injectable } from '@nestjs/common'

const DEFAULT_RENDER_URL = 'http://127.0.0.1:5173/output-render.html'
const DEFAULT_CONCURRENCY = 2
const MAX_CONCURRENCY = 4
const DEFAULT_TIMEOUT_MS = 30_000
const MIN_TIMEOUT_MS = 1_000
const MAX_TIMEOUT_MS = 120_000

export interface OutputConfig {
  readonly renderUrl: URL
  readonly chromiumExecutablePath?: string
  readonly maxConcurrency: number
  readonly timeoutMs: number
}

function boundedInteger(name: string, fallback: number, minimum: number, maximum: number): number {
  const raw = process.env[name]
  if (raw === undefined || raw.trim() === '') return fallback
  const value = Number(raw)
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be an integer from ${minimum}-${maximum}`)
  }
  return value
}

function renderUrl(): URL {
  const configured = process.env.PTD_OUTPUT_RENDER_URL?.trim()
  if (!configured && process.env.NODE_ENV === 'production') {
    throw new Error('PTD_OUTPUT_RENDER_URL is required in production')
  }
  const value = new URL(configured || DEFAULT_RENDER_URL)
  if (!['http:', 'https:'].includes(value.protocol)) {
    throw new Error('PTD_OUTPUT_RENDER_URL must use http or https')
  }
  if (value.username || value.password || value.search || value.hash) {
    throw new Error('PTD_OUTPUT_RENDER_URL must not include credentials, query or fragment')
  }
  if (!value.pathname.endsWith('/output-render.html')) {
    throw new Error('PTD_OUTPUT_RENDER_URL must point to output-render.html')
  }
  return value
}

@Injectable()
export class OutputConfigService {
  readonly value: OutputConfig

  constructor() {
    const executablePath = process.env.PTD_CHROMIUM_EXECUTABLE_PATH?.trim()
    this.value = Object.freeze({
      renderUrl: renderUrl(),
      ...(executablePath ? { chromiumExecutablePath: executablePath } : {}),
      maxConcurrency: boundedInteger(
        'PTD_OUTPUT_MAX_CONCURRENCY',
        DEFAULT_CONCURRENCY,
        1,
        MAX_CONCURRENCY,
      ),
      timeoutMs: boundedInteger(
        'PTD_OUTPUT_TIMEOUT_MS',
        DEFAULT_TIMEOUT_MS,
        MIN_TIMEOUT_MS,
        MAX_TIMEOUT_MS,
      ),
    })
  }
}
