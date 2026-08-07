/** CSS white-space modes supported by plain text frames. */
export type PlainTextWhiteSpace = 'normal' | 'pre-wrap' | 'pre-line' | 'nowrap'

/** Legacy and newly-created plain text frames use pre-wrap unless explicitly overridden. */
export const DEFAULT_PLAIN_TEXT_WHITE_SPACE: PlainTextWhiteSpace = 'pre-wrap'

/**
 * Normalizes platform line endings without changing any other Unicode whitespace.
 * In particular, this deliberately preserves leading/trailing newlines and repeated spaces.
 */
export function normalizePlainText(value: string): string {
  return value.replace(/\r\n?/g, '\n')
}

export function normalizePlainTextWhiteSpace(value: unknown): PlainTextWhiteSpace {
  return value === 'normal' || value === 'pre-line' || value === 'nowrap' || value === 'pre-wrap'
    ? value
    : DEFAULT_PLAIN_TEXT_WHITE_SPACE
}
