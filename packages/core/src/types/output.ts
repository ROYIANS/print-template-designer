import type { ComponentSchema } from './component-schema'

export type OutputRegionKind = 'header' | 'body' | 'footer'

export type OutputFragmentContinuation = 'none' | 'start' | 'middle' | 'end'

export type OutputDiagnosticSeverity = 'info' | 'warning' | 'error'

export type OutputDiagnosticCode =
  | 'TEXT_OVERFLOW'
  | 'ROW_TOO_TALL'
  | 'UNSUPPORTED_TABLE_SPAN'
  | 'UNBREAKABLE_FRAGMENT'
  | 'PAGE_LIMIT_EXCEEDED'
  | 'PAGE_BOUNDS_EXCEEDED'
  | 'EMPTY_PAGE'
  | 'MISSING_FONT'
  | 'IMAGE_LOAD_FAILED'
  | 'REMOTE_RESOURCE_BLOCKED'
  | 'QRCODE_RENDER_FAILED'
  | 'BARCODE_RENDER_FAILED'
  | 'LAYOUT_TIMEOUT'

export interface PageMasterRegion {
  /** Physical region height. Component coordinates remain in the template's CSS-pixel system. */
  readonly heightMm: number
  readonly componentData: readonly ComponentSchema[]
}

export interface PageMaster {
  readonly id: string
  readonly name: string
  readonly header: PageMasterRegion
  readonly footer: PageMasterRegion
}

/** Persisted output definition. v1 edits one default master; the array keeps multi-master extensible. */
export interface TemplateOutputDefinition {
  readonly defaultPageMasterId: string
  readonly pageMasters: readonly PageMaster[]
}

export interface OutputOptions {
  readonly locale: string
  readonly timeZone: string
  /** Explicit ISO-8601 instant. Output generation never reads the system clock implicitly. */
  readonly now: string
  readonly title?: string
  readonly pageLimit?: number
}

export interface OutputPageContext {
  readonly pageNumber: number
  readonly totalPages: number
}

export const OUTPUT_PAGE_TOKENS = Object.freeze({
  pageNumber: '{{page.number}}',
  totalPages: '{{page.totalPages}}',
})

export interface OutputBounds {
  /** Layout coordinates in deterministic 96-DPI CSS pixels. */
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

export interface OutputFragment {
  readonly id: string
  readonly sourceComponentId: string
  readonly fragmentIndex: number
  readonly continuation: OutputFragmentContinuation
  readonly bounds: OutputBounds
  /** Resolved, render-only component. It must never be written back to TemplateSchema. */
  readonly component: ComponentSchema
}

export interface OutputRegion {
  readonly kind: OutputRegionKind
  readonly bounds: OutputBounds
  readonly fragments: readonly OutputFragment[]
}

export interface OutputPage {
  readonly id: string
  readonly pageNumber: number
  readonly totalPages: number
  readonly widthMm: number
  readonly heightMm: number
  readonly style: {
    readonly background: string
    readonly color: string
    readonly fontSizePx: number
    readonly fontFamily: string
    readonly lineHeight: number
  }
  readonly regions: Readonly<Record<OutputRegionKind, OutputRegion>>
}

export interface OutputDiagnostic {
  readonly severity: OutputDiagnosticSeverity
  readonly code: OutputDiagnosticCode
  readonly message: string
  readonly sourceComponentId?: string
  readonly pageNumber?: number
  readonly fragmentIndex?: number
  /** Measured overflow beyond the text frame's content box. */
  readonly horizontalOverflowPx?: number
  readonly verticalOverflowPx?: number
}

export interface OutputDocument {
  readonly pages: readonly OutputPage[]
  readonly diagnostics: readonly OutputDiagnostic[]
  readonly metadata: {
    readonly title: string
    readonly generatedAt: string
    readonly locale: string
    readonly timeZone: string
  }
}
