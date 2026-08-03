export type OutputEngineErrorKind = 'saturated' | 'timeout' | 'layout' | 'browser' | 'cancelled'

export class OutputEngineError extends Error {
  readonly kind: OutputEngineErrorKind
  readonly diagnosticCodes: readonly string[]

  constructor(
    kind: OutputEngineErrorKind,
    message: string,
    diagnosticCodes: readonly string[] = [],
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'OutputEngineError'
    this.kind = kind
    this.diagnosticCodes = diagnosticCodes
  }
}
