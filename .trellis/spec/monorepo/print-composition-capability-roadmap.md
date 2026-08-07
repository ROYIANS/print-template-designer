# Print Composition Capability Roadmap

> Milestone A (2026-08) implemented the P0 text correctness slice: Corepack/pnpm 11.18 CI ordering,
> plain-text newline/`white-space` parity, rich blank-paragraph canonicalization, unified browser preflight,
> and DOM-backed `TEXT_OVERFLOW` diagnostics. The remaining roadmap items below are future capabilities.

> Status: **Proposed**. This document records implementation-ready capability decisions learned from building
> complex report and editorial templates. It is a roadmap, not a statement that the capabilities already exist.
> The currently implemented output contract remains authoritative in
> [Output Architecture](./output-architecture.md).

## Why This Document Exists

Building the electricity-industry report, business report and long-form magazine demos exposed a recurring pattern:
Foliq can already place many components precisely, but complex templates still require authors to simulate document
layout by manually splitting content into many absolute-positioned components. That workaround makes templates harder
to edit, bind, paginate and validate.

The system needs to evolve from a **fixed canvas with printable components** into a **deterministic print composition
engine**. The goal is not to copy a browser or desktop publishing application feature-for-feature. The goal is to add
small, explicit contracts that preserve WYSIWYG parity and always fail visibly when content cannot fit.

## Evidence From the Current Implementation

| Observation                                                             | Current evidence                                                                                                                                                                | Consequence                                                                                                             |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Plain-text whitespace differs between edit and output                   | `ContentEditor.module.css` gives `.plainEditor` `white-space: pre-wrap`; `packages/components/src/base/stylesheet.ts` does not give `.ptd-simple-text__inner` a whitespace rule | Leading blank lines, repeated spaces and manual line breaks can collapse in preview/PDF                                 |
| Rich-text empty paragraphs do not have one canonical representation     | Tiptap HTML is sanitized by `sanitizeRichTextHtml()`, while output paragraph margins are reset to zero                                                                          | `<p></p>` may have zero visual height; an intentional blank paragraph can disappear unless represented as `<p><br></p>` |
| Text frames silently hide excess content                                | `.ptd-component` globally uses `overflow: hidden`                                                                                                                               | A PDF can have no readiness diagnostic while the last paragraphs are clipped                                            |
| `TEXT_OVERFLOW` is defined but is not produced by layout/readiness code | `OutputDiagnosticCode` includes it; no component/export measurement currently emits it                                                                                          | The output contract promises a diagnostic that current text rendering does not enforce                                  |
| Long articles are manually split across text components                 | `RoySimpleText` and `RoyText` render one frame each; output v1 explicitly excludes full rich-text line fragmentation                                                            | Editing one article requires coordinating multiple `propValue` strings and frame geometries                             |
| No chart component exists                                               | `ComponentType`, registry and component factory contain text, tables, media, codes and shapes only                                                                              | Reports must approximate charts with shapes or embed raster screenshots, losing semantics and binding                   |
| Output resources are intentionally offline and deterministic            | Output v1 only allows embedded images and blocks remote URLs                                                                                                                    | A chart component must be bundled and data-driven; it cannot load remote scripts, fonts or datasets                     |
| Numeric formatting is typed but lacks explicit display units            | `DataFormatter` supports number/currency/date, but not a deterministic divisor + unit contract                                                                                  | Values such as `842000000` cannot reliably become `¥ 8.42 亿` without preformatted strings or custom template text      |

## Priority Summary

| Priority | Capability                              | Recommended first deliverable                                                        | Complexity   |
| -------- | --------------------------------------- | ------------------------------------------------------------------------------------ | ------------ |
| P0       | Plain/rich-text whitespace parity       | Canonical newline and empty-paragraph behavior in design, proof, preview and export  | Small        |
| P0       | Text overflow detection                 | Real `TEXT_OVERFLOW` preflight with component/page identity and overflow amount      | Medium       |
| P0       | Unit-aware number formatting            | Explicit divisor, prefix, suffix and decimal policy                                  | Small–Medium |
| P0       | Unified output preflight                | Clickable diagnostics for text, images, fonts, codes, page bounds and layout timeout | Medium       |
| P1       | In-frame text columns                   | One `RoyText`/`RoySimpleText` component flowing through 1–6 columns                  | Medium       |
| P1       | Print-native chart component            | Deterministic SVG bar/line charts with bounded data and monochrome-safe theme        | Large        |
| P1       | Named paragraph/character styles        | Reusable typography tokens rather than duplicated inline settings                    | Medium       |
| P1       | Image print controls                    | Focal point, crop preview, effective DPI and low-resolution warning                  | Medium       |
| P2       | Deterministic layout frames             | Fixed row/column/grid distribution inside one bounded frame                          | Large        |
| P2       | Linked text frames and cross-page flow  | One content source flowing through ordered frames/pages                              | Very large   |
| P2       | Editorial pagination rules              | Keep-with-next, widow/orphan limits, break-before/after and baseline grid            | Large        |
| P2       | Data repeaters and conditional sections | Bounded record-driven repeated regions with deterministic pagination                 | Large        |
| P2       | Text wrap around media                  | Rectangular float/exclusion zones, then optional contour wrapping                    | Large        |
| P3       | Publication features                    | Footnotes, cross-references, TOC, bleed/crop marks and PDF/X exploration             | Very large   |

---

## Scenario: Deterministic Editorial Text and Print Charts

### 1. Scope / Trigger

Use this scenario when changing any of the following:

- `RoySimpleText` or `RoyText` persisted style/content fields;
- editor/output whitespace behavior;
- in-frame columns, overflow detection or text-flow pagination;
- the component registry, catalog, factory or Inspector to add `RoyChart`;
- data formatting for scaled units such as 万、亿、kWh、MWh or percentages;
- output readiness and diagnostics for text or chart rendering.

These changes cross `@ptd/core`, `@ptd/components`, `@ptd/react-designer`, `@ptd/export`, Web preview and Server PDF
output. Editor-only CSS is never sufficient evidence of completion.

### 2. Signatures

#### 2.1 Text layout fields

Text layout remains part of `ComponentStyle` because it affects frame rendering rather than content semantics.

```ts
export interface ComponentStyle {
  // Existing fields omitted.

  /** Plain-text whitespace policy. RoyText continues to use canonical HTML block semantics. */
  whiteSpace?: 'normal' | 'pre-wrap' | 'pre-line' | 'nowrap'

  /** One disables multicolumn layout. Valid only for RoySimpleText and RoyText. */
  columnCount?: number
  /** Logical canvas pixels. Must be >= 0. */
  columnGap?: number
  /** Sequential newspaper flow or balanced short columns. */
  columnFill?: 'auto' | 'balance'
  columnRuleWidth?: number
  columnRuleColor?: string
  columnRuleStyle?: 'none' | 'solid' | 'dashed' | 'dotted'

  /** Silent clipping must be an explicit author choice. */
  overflowPolicy?: 'error' | 'warning' | 'clip'
}
```

Recommended defaults:

```ts
const DEFAULT_SIMPLE_TEXT_LAYOUT = {
  whiteSpace: 'pre-wrap',
  columnCount: 1,
  columnGap: 24,
  columnFill: 'auto',
  columnRuleWidth: 0,
  columnRuleStyle: 'none',
  overflowPolicy: 'error',
} as const

const DEFAULT_RICH_TEXT_LAYOUT = {
  // Rich text uses HTML paragraphs; source-code indentation is not presentation whitespace.
  whiteSpace: 'normal',
  columnCount: 1,
  columnGap: 24,
  columnFill: 'auto',
  columnRuleWidth: 0,
  columnRuleStyle: 'none',
  overflowPolicy: 'error',
} as const
```

`columnFill: 'auto'` is the default for long-form reading because content fills column 1 from top to bottom, then
column 2. `balance` is for short callouts where similar visual column heights matter more than a fixed sequential fill.

#### 2.2 Canonical rich-text blank lines

```ts
normalizeRichTextHtml(html: string): string
```

Contract:

- an intentional empty paragraph is serialized as `<p><br></p>`;
- `<p></p>` is normalized to `<p><br></p>` before persistence and again before rendering legacy input;
- whitespace-only text nodes between block elements are not interpreted as visual blank lines;
- leading/trailing intentional blank paragraphs are preserved;
- sanitizer safety rules remain unchanged: no script, object, iframe, SVG or unsafe URL/style.

#### 2.3 Text overflow measurement

```ts
export interface TextOverflowMeasurement {
  readonly componentId: string
  readonly pageId: string
  readonly horizontalPx: number
  readonly verticalPx: number
  readonly columnCount: number
}

measureTextOverflow(root: HTMLElement): readonly TextOverflowMeasurement[]
```

Measurement occurs after `document.fonts.ready`, embedded resources are ready, and root geometry is stable for two
animation frames. Use a `0.5px` tolerance to avoid subpixel false positives.

#### 2.4 Unit-aware numeric formatter

Do not preformat semantic values into strings such as `¥8.42亿`. Add an explicit formatter:

```ts
export interface UnitNumberFormatter {
  readonly kind: 'unit-number'
  /** Divide the source number before formatting. Must be finite and > 0. */
  readonly divisor: number
  readonly prefix?: string
  readonly suffix?: string
  readonly minimumFractionDigits?: number
  readonly maximumFractionDigits?: number
  readonly useGrouping?: boolean
  readonly trimTrailingZeros?: boolean
  readonly coerceNumericString?: boolean
}

// Add UnitNumberFormatter as one explicit member of the existing DataFormatter union in
// packages/core/src/types/data-source.ts.
```

Example:

```json
{
  "kind": "unit-number",
  "divisor": 100000000,
  "prefix": "¥ ",
  "suffix": " 亿",
  "minimumFractionDigits": 2,
  "maximumFractionDigits": 2,
  "useGrouping": false
}
```

`842000000` must resolve to `¥ 8.42 亿`; it must never become `¥842,000,000` or a manually spliced
`¥842,00 0000`.

#### 2.5 Print-native chart component

Add one versioned structured component. Do not encode chart options as arbitrary ECharts JSON.

```ts
export type PrintChartKind = 'bar' | 'line'

export interface ChartDatum {
  readonly category: string
  readonly values: Readonly<Record<string, number | null>>
}

export interface ChartSeries {
  readonly id: string
  readonly name: string
  readonly field: string
  readonly color?: string
  readonly dash?: 'solid' | 'dashed' | 'dotted'
  readonly pattern?: 'none' | 'diagonal' | 'crosshatch' | 'dots'
}

export interface ChartPropsV1 {
  readonly version: 1
  readonly kind: PrintChartKind
  readonly data: readonly ChartDatum[]
  readonly series: readonly ChartSeries[]
  readonly title?: string
  readonly showLegend: boolean
  readonly showValues: boolean
  readonly showXAxis: boolean
  readonly showYAxis: boolean
  readonly yMin?: number
  readonly yMax?: number
  readonly numberFormatter?: Extract<
    DataFormatter,
    { readonly kind: 'number' | 'currency' | 'unit-number' }
  >
  readonly palette: 'document' | 'monochrome' | 'custom'
}
```

Registry binding target:

```ts
{
  kind: 'chart-data',
  label: '图表数据',
  acceptedTypes: ['array'],
  supportsInterpolation: false,
}
```

First release recommendation:

- bundle `echarts/core` with `SVGRenderer`, `BarChart`, `LineChart` and only the required components;
- always render SVG for proof/preview/export; never rasterize to canvas for PDF;
- disable animation, progressive rendering, toolbox and remote assets;
- allow tooltips only in Designer proof mode; omit them from print/export DOM;
- use the same local library version in Designer and internal output bundle;
- use class-external render-session identity if rendering becomes asynchronous, following the QR/barcode `WeakMap`
  session contract;
- start with bar and line charts. Area, stacked, pie/donut, scatter and combo charts require separate label and
  accessibility contracts before admission.

### 3. Contracts

#### 3.1 Edit/preview/export parity

The following four surfaces must share component CSS and content normalization:

```text
ContentEditor → persisted TemplateSchema → Designer proof → Output DOM → Chromium PDF
```

- Plain text stores exact Unicode text. `\r\n` is normalized to `\n`; no other whitespace is trimmed.
- `RoySimpleText` applies the persisted `whiteSpace` mode in every non-editing and editing surface.
- New plain-text components default to `pre-wrap` because the editor already exposes multiline editing.
- Legacy plain text with no `whiteSpace` is interpreted as `pre-wrap`; this is a parity bug fix, not an opt-in visual
  redesign.
- `RoyText` stores sanitized canonical HTML. Visual blank lines are block nodes, never runs of source HTML spaces.
- The output renderer must not maintain a second, subtly different typography stylesheet.

#### 3.2 In-frame columns

- `columnCount` affects only content inside one fixed component frame.
- Reading order is top-to-bottom in the first column, then the next column from left to right.
- `columnCount` never creates or persists extra `ComponentSchema` objects.
- Data binding resolves once before column layout. A bound article remains one semantic value.
- Selection, history, copy/paste and component IDs remain unchanged when column settings change.
- Columns do not imply cross-page flow. Content that exceeds the final column emits `TEXT_OVERFLOW`.
- Paragraph, heading, list item and blockquote nodes may use `break-inside: avoid` only when the complete block fits
  inside a column. An oversized block must remain breakable or produce a deterministic diagnostic; it must not vanish.
- `columnRuleWidth` consumes gap space. It must never reduce usable column width below one printable character.

#### 3.3 Text overflow and preflight

- Hidden overflow is never accepted merely because Chromium successfully produced PDF bytes.
- Every overflow diagnostic includes source page ID, component ID, axis and overflow pixels.
- `overflowPolicy: 'error'` blocks export.
- `overflowPolicy: 'warning'` allows export but remains visible in preflight and PDF job diagnostics.
- `overflowPolicy: 'clip'` allows intentional clipping and emits an informational preflight item; it is never the
  implicit default.
- Designer frames show a non-printing overflow badge. Selecting the diagnostic selects and reveals the source frame.
- Print Preview runs the same compiler/readiness/preflight functions as Server export.
- Preflight also reports out-of-page geometry, missing fonts, remote resources, failed codes/charts, low effective
  image DPI and empty output pages.

#### 3.4 Print chart behavior

- Chart data is bounded JSON supplied by template sample data or `RenderContext`; the component never performs fetch.
- Maximum first-release limits: 200 category rows, 8 series and 1,000 non-null numeric points.
- Non-finite values are invalid. `null` is a declared missing point and must not be coerced to zero.
- Axis domains are deterministic. If both explicit `yMin` and `yMax` exist, `yMin < yMax` is required.
- Labels use the document locale, explicit formatter and bundled fonts. They never read ambient browser locale.
- Monochrome mode differentiates series by dash/pattern as well as gray value; color alone is insufficient.
- SVG text and strokes remain vector content in Chromium PDF.
- A chart reaches `ready` only after the SVG exists, fonts are ready and its bounding box is stable.
- A chart never silently omits a series, label or legend because it does not fit. It either applies a documented
  collision strategy or emits a diagnostic.

#### 3.5 Named typography styles

Inline component settings are insufficient for multi-page publications. Add optional document styles later:

```ts
interface TemplateStyleDefinition {
  readonly id: string
  readonly name: string
  readonly kind: 'paragraph' | 'character'
  readonly style: Readonly<Partial<ComponentStyle>>
}
```

- Components may reference a style ID and then store explicit local overrides.
- Deleting an in-use style is rejected or requires an explicit detach operation.
- Style changes create one history entry and update all consumers without rewriting each component.
- Page title, deck, body, caption, quote and folio become reusable semantic styles.

#### 3.6 Image print controls

Extend `ImageProps` with a normalized focal point (`0..1` x/y), not arbitrary CSS position strings. Preflight computes
effective DPI from decoded pixel dimensions and printed millimetres. Suggested thresholds:

- `< 150 DPI`: error for production export;
- `150–219 DPI`: warning;
- `>= 220 DPI`: pass;
- SVG is resolution-independent but still subject to remote-resource and sanitizer rules.

#### 3.7 Future linked text flow

In-frame columns are deliberately not the cross-page solution. P2 should introduce a semantic text-flow source and
ordered frames:

```ts
interface TextFlowDefinition {
  readonly id: string
  readonly content: string
  readonly contentKind: 'plain' | 'rich-text'
}

interface TextFlowFrameRef {
  readonly flowId: string
  readonly order: number
}
```

- Content is stored once in `TextFlowDefinition`, not copied into every frame.
- Frames own geometry and layout style; compiler-generated fragments own resolved ranges.
- Continuation ranges are derived output IR and never written back into Designer history.
- Changing an early frame may reflow later frames, but it must not alter their geometry.
- Automatic new pages require an explicit Page Master and page limit.

#### 3.8 Deterministic layout frames

Complex reports currently position every child absolutely. A future `RoyLayoutFrame`, or a versioned layout mode on
`RoyGroup`, may distribute children without making the page responsive:

```ts
interface LayoutFramePropsV1 {
  readonly version: 1
  readonly direction: 'row' | 'column' | 'grid'
  readonly gap: number
  readonly padding: string
  readonly align: 'start' | 'center' | 'end' | 'stretch'
  readonly justify: 'start' | 'center' | 'end' | 'space-between'
  readonly columns?: readonly number[]
  readonly rows?: readonly number[]
}
```

- The outer frame remains fixed in logical page coordinates.
- Track sizes and gaps are deterministic logical pixels; there are no viewport breakpoints.
- Child order is semantic and must survive copy/paste, grouping and data binding.
- Overflow is diagnosed; children never shrink or wrap implicitly unless the persisted layout contract says so.
- This is useful for KPI rows, report sections and equal-height cards, but it is not a replacement for text columns or
  cross-page flow.

#### 3.9 Additional high-value print capabilities

After the P0/P1 contracts are stable, prioritize:

1. paragraph spacing, first-line indent and hanging punctuation controls;
2. `keepWithNext`, `breakBefore`, `breakAfter`, widow and orphan thresholds;
3. baseline grid and optical alignment for long CJK articles;
4. rectangular text wrap around images, followed by optional contour/exclusion paths;
5. bounded data repeaters and conditional sections for reports;
6. deterministic row/column/grid layout frames for repeated report structures;
7. document-wide color and typography styles;
8. automatic captions, figure numbering, cross-references and table of contents;
9. bleed, safe-area, crop-mark and PDF/X feasibility research after browser PDF limitations are documented.

### 4. Validation & Error Matrix

| Condition                                                                | Required result                                                                   |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Plain text contains leading `\n\n`, repeated spaces or internal newlines | Design, proof, preview and PDF preserve the same line boxes under `pre-wrap`      |
| Plain text uses `normal`                                                 | Whitespace collapses intentionally and consistently on every surface              |
| Rich text contains `<p></p>`                                             | Normalize to `<p><br></p>` and preserve one blank paragraph line                  |
| Rich text sanitizer removes an unsafe tag                                | Unsafe content is removed without changing adjacent valid blank paragraphs        |
| `columnCount` is not an integer in `1..6`                                | Schema validation fails; do not clamp silently                                    |
| `columnGap < 0` or non-finite                                            | Schema validation fails                                                           |
| Column width becomes too narrow after gap/rule                           | `TEXT_COLUMN_TOO_NARROW` error with component ID                                  |
| Text exceeds the final column                                            | `TEXT_OVERFLOW` with horizontal/vertical overflow amounts                         |
| Overflow policy is omitted                                               | Use `error` for text output; never silently clip                                  |
| Chart component receives remote option/script/data URL                   | Schema/content validation rejects it before rendering                             |
| Chart data contains `NaN`, `Infinity` or a string in a numeric slot      | `CHART_DATA_INVALID` error with row/series path                                   |
| Chart exceeds row/series/point limits                                    | `CHART_DATA_TOO_LARGE` error                                                      |
| Chart library/render session fails                                       | Stable `CHART_RENDER_FAILED`; readiness must not end only as `LAYOUT_TIMEOUT`     |
| SVG renders but labels/legend are clipped                                | `CHART_LABEL_OVERFLOW` warning or error according to policy                       |
| Monochrome series cannot be distinguished                                | `CHART_SERIES_NOT_DISTINCT` warning                                               |
| Unit formatter divisor is zero, negative or non-finite                   | `invalid-formatter`; binding fallback applies                                     |
| `842000000` uses the documented 亿 formatter                             | Exact output `¥ 8.42 亿` under the declared locale                                |
| Raster image effective DPI is below threshold                            | Preflight warning/error with calculated DPI and component ID                      |
| A missing font changes text geometry after fallback                      | `MISSING_FONT` plus subsequent overflow measurement on the actual fallback layout |

Add these output diagnostic codes when implementing the relevant capability:

```ts
type OutputDiagnosticCode =
  | ExistingOutputDiagnosticCode
  | 'TEXT_COLUMN_TOO_NARROW'
  | 'CHART_CONFIG_INVALID'
  | 'CHART_DATA_INVALID'
  | 'CHART_DATA_TOO_LARGE'
  | 'CHART_RENDER_FAILED'
  | 'CHART_LABEL_OVERFLOW'
  | 'CHART_SERIES_NOT_DISTINCT'
  | 'IMAGE_LOW_RESOLUTION'
  | 'OUT_OF_PAGE_BOUNDS'
  | 'EMPTY_OUTPUT_PAGE'
```

### 5. Good / Base / Bad Cases

#### Good: long-form magazine

- One `RoyText` contains an entire section with 10 paragraphs.
- `columnCount: 2`, `columnGap: 32`, `columnFill: 'auto'` flows the section in reading order.
- Two intentional blank paragraphs remain visible in edit, preview and PDF.
- The last line fits; preflight has no overflow diagnostic.
- Changing body font size produces immediate, clickable overflow feedback if it no longer fits.

#### Base: simple label

- One `RoySimpleText` has `columnCount: 1` and `whiteSpace: 'pre-wrap'`.
- `PASS\n合 格` renders as two lines everywhere without requiring rich text.

#### Good: electricity-price report chart

- One bound `RoyChart` receives 24 hourly price points and two line series.
- SVG output uses solid/dashed line distinctions, fixed axes, explicit locale and no animation.
- The PDF remains readable in grayscale and at 100% print scale.

#### Bad: simulated article columns

- The author copies one article into three manually truncated `RoyText` components.
- Editing paragraph 2 requires shifting content in components 2 and 3.
- A binding update changes text length and silently clips the final component.

#### Bad: chart screenshot

- A remote dashboard screenshot is inserted as a bitmap.
- Labels blur in print, values are not bindable, remote loading can be blocked, and grayscale series become
  indistinguishable.

### 6. Tests Required

#### Core

1. Schema validation accepts every documented text-column boundary and rejects fractional/out-of-range values.
2. Legacy normalization assigns the intended whitespace defaults without rewriting unrelated component data.
3. Rich-text normalization preserves leading, internal and trailing `<p><br></p>` blocks through serialization.
4. `unit-number` formatter covers positive, negative, zero, numeric-string opt-in, rounding, grouping and invalid
   divisor cases.
5. `ChartPropsV1` validation covers unique series IDs, referenced fields, point limits, finite numbers and axis bounds.
6. Registry exposes `RoyChart` metadata and the exact `chart-data` binding target.
7. Layout-frame validation covers finite gaps, bounded tracks, unique child identity and impossible geometry.

#### Components

1. `RoySimpleText` DOM tests assert computed/declared `white-space` parity for all four modes.
2. `RoyText` renders canonical blank paragraphs after sanitizer round-trip.
3. Column tests assert count, gap, fill and rule declarations without creating child components.
4. Resize/update tests ensure old column declarations do not survive a style reset incorrectly.
5. `RoyChart` renders local SVG, disables animation and reaches `ready` or `error` deterministically.
6. Chart update/destroy tests reject stale asynchronous callbacks if the implementation uses async rendering.
7. Layout-frame tests assert exact row/column/grid child bounds without viewport-dependent reflow.

#### React Designer

1. Inspector edits column count/gap/fill as one gesture and one history entry.
2. Count `1` disables column-only controls without deleting their persisted values unexpectedly.
3. Plain-text editing preserves leading blank lines and repeated spaces after commit, undo and redo.
4. Rich-text editing preserves empty paragraphs after commit, external value replacement and JSON import.
5. Overflow badge is non-printing, keyboard reachable and selects the source component from preflight.
6. Chart Inspector edits structured fields without exposing an arbitrary JSON textarea.
7. Layout-frame edits remain one controlled mutation and preserve semantic child order through undo/redo.

#### Export

1. Readiness waits for fonts and chart SVG state before overflow measurement.
2. Text overflow tests cover single column, multicolumn, padding, rotation, fallback fonts and subpixel tolerance.
3. `overflowPolicy` produces the documented severity and export blocking behavior.
4. Output DOM contains no extra persisted text components when rendering columns.
5. Chart output contains SVG rather than canvas/image and performs no network request.
6. Designer proof and output DOM snapshot the same whitespace and paragraph geometry.
7. Layout-frame geometry is byte-for-byte deterministic between Web preview and Server render input.

#### Server / Real PDF

1. Generate a two-column Chinese article PDF; Poppler inspection confirms all first/last lines and intentional blanks.
2. Generate an intentionally overflowing article; Server returns `TEXT_OVERFLOW` and does not return a false-success
   production PDF under `error` policy.
3. Generate a monochrome electricity-price chart PDF; inspect SVG-derived vector output and grayscale legibility.
4. Assert exact physical page size, page count, footer visibility and zero remote requests.
5. Run a missing-font case and assert both `MISSING_FONT` and geometry-based overflow behavior.

### 7. Wrong vs Correct

#### Wrong: fix whitespace only in the editor

```css
/* The editor looks right, but output still collapses newlines. */
.plainEditor {
  white-space: pre-wrap;
}
```

#### Correct: persist one policy and apply it to shared component rendering

```ts
const whiteSpace = normalizeTextWhiteSpace(schema.style.whiteSpace, schema.component)
container.style.setProperty('--ptd-white-space', whiteSpace)
```

```css
.plainEditor,
.ptd-simple-text__inner {
  white-space: var(--ptd-white-space, pre-wrap);
  overflow-wrap: anywhere;
}
```

#### Wrong: manually split an article

```ts
page.componentData.push(
  textFrame(article.slice(0, 800)),
  textFrame(article.slice(800, 1600)),
  textFrame(article.slice(1600)),
)
```

#### Correct: one semantic text component with in-frame columns

```ts
page.componentData.push({
  ...textFrame(article),
  style: {
    ...frameStyle,
    columnCount: 3,
    columnGap: 28,
    columnFill: 'auto',
    overflowPolicy: 'error',
  },
})
```

#### Wrong: accept a PDF because Chromium returned bytes

```ts
const pdf = await page.pdf()
return { pdf, diagnostics: [] }
```

#### Correct: readiness, preflight and PDF generation share one blocking contract

```ts
await waitForOutputReady(root)
const diagnostics = runOutputPreflight(root, outputDocument)
if (diagnostics.some((item) => item.severity === 'error')) {
  throw new OutputContractError(diagnostics)
}
return page.pdf(PDF_OPTIONS)
```

#### Wrong: arbitrary chart-library options in template JSON

```json
{
  "component": "RoyChart",
  "propValue": {
    "script": "https://cdn.example.com/chart.js",
    "options": { "anything": "goes" }
  }
}
```

#### Correct: bounded, versioned and renderer-independent chart semantics

```json
{
  "component": "RoyChart",
  "propValue": {
    "version": 1,
    "kind": "line",
    "data": [{ "category": "00:00", "values": { "forecast": 0.42, "actual": 0.39 } }],
    "series": [
      { "id": "forecast", "name": "预测电价", "field": "forecast", "dash": "solid" },
      { "id": "actual", "name": "实际电价", "field": "actual", "dash": "dashed" }
    ],
    "showLegend": true,
    "showValues": false,
    "showXAxis": true,
    "showYAxis": true,
    "palette": "monochrome"
  }
}
```

## Recommended Delivery Sequence

### Milestone A — Output correctness before new features

1. Fix plain-text whitespace parity.
2. Canonicalize rich-text blank paragraphs.
3. Implement real text overflow measurement and diagnostics.
4. Surface unified preflight in Print Preview.
5. Add `unit-number` formatter and regression cases for 万/亿/energy units.

This milestone should land before columns or charts. Otherwise new layout features will make silent clipping harder to
detect.

### Milestone B — Editorial composition

1. Add in-frame columns to both text types.
2. Add named paragraph/character styles.
3. Add first-line indent, paragraph spacing and keep-with-next.
4. Add image focal point and effective-DPI preflight.
5. Rebuild the magazine demo using one component per section as the acceptance fixture.

### Milestone C — Print data visualization

1. Add `RoyChart` with line/bar SVG rendering.
2. Add `chart-data` binding and structured Inspector.
3. Add monochrome/pattern print theme and label diagnostics.
4. Rebuild the electricity-price forecast report as the acceptance fixture.

### Milestone D — Flow publishing

1. Add deterministic row/column/grid layout frames for bounded report sections.
2. Design `TextFlowDefinition` and linked frame references.
3. Compile line/block fragments into output-only continuation IR.
4. Add Page Master-driven continuation pages and bounded pagination.
5. Add widow/orphan, keep and break controls.
6. Explore float/exclusion-zone text wrapping after basic flow is stable.

## Definition of Done for Any Capability in This Roadmap

- The persisted contract is versioned, validated and documented.
- Designer edit, proof, Web preview and Server PDF use the same normalization and renderer behavior.
- Failure is represented by a stable diagnostic, never only by blank output or timeout.
- The component performs no implicit network request and reads no ambient locale, time or data.
- Undo/redo and controlled Host integration remain one coherent mutation per user gesture.
- Unit tests cover the contract and one real Chromium PDF is rendered with Poppler visual verification.
- Public README/API documentation is updated when the capability becomes implemented rather than proposed.
