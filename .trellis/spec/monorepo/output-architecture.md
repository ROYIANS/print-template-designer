# Deterministic Output Architecture

> Authoritative boundary for Foliq print preview and PDF output.

## Ownership

```text
@ptd/core        serialized contracts, Page Master, diagnostics, Detail Table props
@ptd/components  framework-free component DOM and render-state markers
@ptd/export      Layout Compiler, derived page IR, pagination, output DOM, readiness
apps/web         professional preview surface, authenticated API client and download
apps/server      request validation, Chromium lifecycle, network policy and PDF bytes
```

`@ptd/export` may depend on Core and Components. It must not depend on React, NestJS, Playwright or Node-only APIs.
Web and the Server internal render bundle must use the same compiler, fragment IR and component factory.

## Persisted Pages vs Derived Pages

- `TemplateSchema.pages` contains manual authoring pages and is the only persisted page list.
- `compileOutputDocument()` creates immutable `OutputDocument.pages` for one preview/export operation.
- Automatic continuation never writes to TemplateSchema, Designer History, dirty state or Server versions.
- Page numbers and total pages are resolved only after all manual and continuation pages are known.

## Geometry

- `PageConfig` mm dimensions are authoritative.
- PTD component coordinates use `mmToPx(1) === 5` logical pixels per millimetre.
- Each output page is a physical mm element containing a full logical canvas scaled by `(96 / 25.4) / 5`.
- Fragment and region bounds are page-relative logical coordinates; viewport, DPR, Designer zoom and Preview fit scale
  never affect pagination.
- `@page` uses the explicit paper size and zero margin. One OutputPage must equal one PDF page, with no trailing blank page.

## Pagination v1

- Manual pages without flow components remain one-to-one.
- v1 supports at most one semantic `RoyComplexTable` flow component per manual page.
- Detail rows are measured, remain whole, preserve order and never silently disappear or duplicate.
- Continuation pages repeat the table header when configured; a deferred footer/summary page always repeats its header.
- A row taller than the complete body is `ROW_TOO_TALL`. A header/footer unit that cannot fit is
  `UNBREAKABLE_FRAGMENT`. Exhausting the page budget is always `PAGE_LIMIT_EXCEEDED`; content must never be dropped
  without a fatal diagnostic.
- Page Master header/footer plus margins must leave a positive body height. Zero-body layouts are fatal.
- Full rich-text line fragmentation, rowSpan across pages, grouping, per-page subtotal/carry-forward, odd/even masters
  and first-page masters are outside v1.

## Resource Readiness

Output is ready only after:

1. `document.fonts.ready`;
2. component render states leave `loading`;
3. embedded images decode;
4. QR/barcode errors are converted to stable diagnostics;
5. the root dimensions remain unchanged for two animation frames.

v1 output images must be embedded `data:image/*`. Relative, remote, file and other non-embedded sources are blocked
before an `<img>` request is created and return `REMOTE_RESOURCE_BLOCKED` with a source component id. Render code must
not expose the rejected URL in logs or diagnostics.

## Scenario: Unified Text-Accuracy Preflight

### 1. Scope / Trigger

- Trigger: any Web proof or Server Chromium PDF output after `compileOutputDocument()` and `mountOutputDocument()`.
- `@ptd/export` owns the browser-side orchestration so Web and Server cannot drift in readiness, overflow, or page-bound
  behavior.

### 2. Signatures

```ts
preflightOutputDocument(
  root: HTMLElement,
  output: OutputDocument,
  options?: { timeoutMs?: number; overflowTolerancePx?: number },
): Promise<readonly OutputDiagnostic[]>
```

`OutputDiagnostic` text overflow fields are `horizontalOverflowPx`, `verticalOverflowPx`, `sourceComponentId`,
`pageNumber` and `fragmentIndex`.

### 3. Contracts

- Preflight order is compiler diagnostics → fonts/component/image readiness → two stable frames → text overflow → page
  bounds/empty-page checks.
- `RoySimpleText` and `RoyText` content frames are measured with a default `0.5px` tolerance. Their in-frame CSS
  multi-column settings (`columnCount` 1–6, non-negative `columnGap`, `columnFill` auto/balance) are measured on the
  final rendered DOM; content beyond the final column remains fatal `TEXT_OVERFLOW`. Cross-page text flow is still
  deferred.
- `RoyText` paragraph and heading blocks persist bounded canvas-pixel layout values through the explicit
  `data-ptd-space-before`, `data-ptd-space-after` and `data-ptd-first-line-indent` attributes. Canonicalization drops
  malformed, negative or greater-than-1000 values; the shared component renderer maps valid attributes to CSS custom
  properties in Designer proof, Web preview and Server output. Missing attributes preserve zero spacing/indent.
- Web displays safe code/message plus page/component identity. Server blocks PDF bytes on error diagnostics and returns
  warning codes in `X-PTD-Output-Warnings`; neither surface exposes remote URLs, cookies, secrets or local paths.

### 4. Validation & Error Matrix

| Condition                                                                  | Required result                                       |
| -------------------------------------------------------------------------- | ----------------------------------------------------- |
| `scrollWidth/clientWidth` or `scrollHeight/clientHeight` exceeds tolerance | `TEXT_OVERFLOW` error with both amounts               |
| Difference is ≤ 0.5 CSS px                                                 | no overflow diagnostic                                |
| Fragment bounding box exceeds physical page after rotation                 | `PAGE_BOUNDS_EXCEEDED` error                          |
| Output page has no fragments                                               | `EMPTY_PAGE` warning                                  |
| Readiness deadline expires or renderer/image fails                         | existing stable readiness diagnostic; no PDF on error |

### 5. Good/Base/Bad Cases

- Good: a Chinese long-text fixture fits its frame and produces no overflow; the same fixture with a smaller frame reports
  its component ID, page and horizontal/vertical amounts in Web and Server.
- Base: a warning-only empty page still produces PDF with `X-PTD-Output-Warnings: EMPTY_PAGE`.
- Bad: Web concatenates compiler/readiness results while Server measures a different DOM selector, causing silent clipping
  or a false-success PDF.

### 6. Tests Required

1. Export tests cover plain and rich text overflow, 0.5px tolerance, unified diagnostic ordering and page identity.
2. Web tests assert preflight is the only readiness call and that page/component context is rendered.
3. Server tests assert fatal codes map to 422 and warning codes are returned only through a safe response header.
4. Real Chromium smoke should include one fitting and one intentionally overflowing Chinese text frame.

### 7. Wrong vs Correct

#### Wrong

```ts
const readiness = await waitForOutputReady(mounted.root)
setDiagnostics([...output.diagnostics, ...readiness])
```

#### Correct

```ts
const diagnostics = await preflightOutputDocument(mounted.root, output)
```

## Scenario: Async Code Renderers and Physical Print Canvas Isolation

### 1. Scope / Trigger

- Trigger: changing an asynchronously loaded canvas component such as `RoyQRCode` / `RoyBarCode`, or changing the
  logical-to-physical scaling structure in `mountOutputDocument()`.
- `BaseComponent` invokes the polymorphic `render()` during its constructor. Subclass field initializers have not run
  at that point and will run after `super()` returns, so async render state cannot live in initialized subclass fields.
- A transformed logical canvas must not participate directly in Chromium's paged-media shrink-to-fit calculation.

### 2. Signatures

```ts
const renderSessions = new WeakMap<BaseComponent, { readonly target: HTMLDivElement }>()

mountOutputDocument(container: HTMLElement, output: OutputDocument): MountedOutputDocument
```

Output DOM shape:

```text
.ptd-output-page                         physical mm page
  .ptd-output-page__canvas               100% physical viewport, overflow hidden, contain strict
    .ptd-output-page__logical-canvas     logical mmToPx dimensions + OUTPUT_CANVAS_SCALE transform
      .ptd-output-region / fragment
```

### 3. Contracts

- Every valid QR/barcode starts in `loading` and must reach `ready` or `error`; it must never remain `loading` because
  constructor field initialization replaced its first render token or target reference.
- QR/barcode async callbacks use class-external `WeakMap` session identity. `update()` replaces the active session;
  `destroy()` deletes it; callbacks from an older session are no-ops.
- The physical viewport is exactly `100% × 100%` of the mm page and owns `overflow: hidden` plus `contain: strict`.
- The nested logical canvas owns `mmToPx(page.widthMm/heightMm)` dimensions and the
  `(96 / 25.4) / mmToPx(1)` transform. Regions and fragments mount inside this logical canvas.
- The physical isolation layer is required even when every visible component is inside the page. Without it,
  Chromium may use the transform-before-layout dimensions for shrink-to-fit, scale A5 content to about 86.8%, and
  let subsequent page backgrounds cover the previous page's bottom fragments.

### 4. Validation & Error Matrix

| Condition                                                        | Required result                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------- |
| Valid QR/barcode on its constructor render                       | leaves `loading`, reaches `ready`                             |
| Renderer module import or encoding fails                         | stable component `error` and matching readiness diagnostic    |
| Component updates before an old async callback returns           | old callback cannot replace the new render                    |
| Component is destroyed before callback returns                   | callback is a no-op; session does not retain the instance     |
| Logical canvas is mounted directly as the transformed page child | contract failure; PDF may shrink and lose bottom content      |
| Four-page A5 fixed template                                      | PDF stays four A5 pages and every page footer remains visible |

### 5. Good/Base/Bad Cases

- Good: a 227-component A5 report with a bound QR code reaches readiness without diagnostics; all four PDF pages use
  the safe printable width and preserve their bottom approval/footer content.
- Base: a single fixed A4 text component renders through the same physical viewport/logical canvas structure.
- Bad: `private renderToken = 0` or `private qrContainer = null` is read by `render()` during `super()` and then reset
  by subclass initialization, leaving the first QR forever in `loading` and producing both `QRCODE_RENDER_FAILED` and
  `LAYOUT_TIMEOUT`.

### 6. Tests Required

1. Components tests mock the QR/barcode libraries and assert the initial constructor render reaches `ready`.
2. Media lifecycle tests continue to cover stale image callbacks; QR/barcode session changes must preserve the same
   stale-callback rule.
3. Export renderer tests assert the physical viewport is `100% × 100%`, isolated with `overflow: hidden` and
   `contain: strict`, while the nested logical canvas owns logical pixel dimensions and transform.
4. A real Chromium A5 PDF smoke must assert page count and physical size, render every page with Poppler, and inspect
   KPI text, QR visibility, approval blocks and all four footers.

### 7. Wrong vs Correct

#### Wrong

```ts
class RoyQRCode extends BaseComponent {
  private target: HTMLDivElement | null = null
  private renderToken = 0
  // BaseComponent calls render() before these initializers run, then they overwrite first-render state.
}

pageElement.append(logicalCanvas)
logicalCanvas.style.transform = `scale(${OUTPUT_CANVAS_SCALE})`
```

#### Correct

```ts
const sessions = new WeakMap<RoyQRCode, { readonly target: HTMLDivElement }>()

const physicalViewport = document.createElement('div')
physicalViewport.style.contain = 'strict'
physicalViewport.style.overflow = 'hidden'
physicalViewport.append(logicalCanvas)
pageElement.append(physicalViewport)
```

## Server Renderer

- `POST /api/output/pdf` is Cookie-session protected and accepts a deeply validated template, bounded RenderContext and
  explicit OutputOptions. It never accepts arbitrary HTML, JavaScript, URL or client-generated IR.
- Use exact `playwright-core` and matching fixed Playwright Chromium image versions.
- Maintain one Browser; create one isolated BrowserContext/Page per job; default concurrency is 2 with no queue.
- The job timeout covers launch, navigation, compile, readiness and PDF. Abort closes the Context; a job keeps its
  concurrency slot until cleanup actually completes.
- A disconnected Browser may be rebuilt once. Shutdown must close an existing or currently launching Browser.
- Only the exact internal render document origin, its script/stylesheet/font resources, `data:` and `blob:` are allowed.
  No Cookie, database setting or Server secret enters the render context.
- PDF uses `preferCSSPageSize`, zero margin, background graphics, no Chromium header/footer and explicit metadata time.

## Scenario: Fixed Chromium Server Runtime Image

### 1. Scope / Trigger

- Trigger: changing the Server Docker base, Playwright/Chromium version, pnpm version, Prisma install stages,
  init process or container fonts.
- This is an infra contract because dependency installation, Prisma generation, Nest startup, Chromium launch and
  PDF glyph output span different Docker stages and Linux distributions.

### 2. Signatures

- Build: `docker build -f docker/Dockerfile.server -t <server-image> .`
- Runtime: `ENTRYPOINT ["/usr/bin/dumb-init", "--"]` followed by `CMD ["node", "dist/main.js"]`.
- Browser package/image pair: `playwright-core@1.62.0` with
  `mcr.microsoft.com/playwright:v1.62.0-noble`.

### 3. Contracts

- The shared `node:22-bookworm-slim` base installs `openssl` before dependencies, build and
  production-dependencies stages run Prisma commands.
- Every Docker build activates the root-declared `pnpm@11.18.0` and asserts the resolved version.
- The independent Playwright runtime installs `dumb-init=1.2.5-3` and
  `fonts-noto-cjk=1:20230817+repack1-3`; it must not assume packages from the Node base are inherited.
- Runtime output configuration uses `PTD_OUTPUT_RENDER_URL`, `PTD_OUTPUT_MAX_CONCURRENCY` and
  `PTD_OUTPUT_TIMEOUT_MS`; Compose needs no privileged mode or extra Linux capability.

### 4. Validation & Error Matrix

| Condition                                           | Required result                                                      |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| OpenSSL absent from the Node slim stages            | Build fails; do not accept Prisma's `openssl-1.1.x` fallback warning |
| `/usr/bin/dumb-init` absent from the final stage    | Build assertion fails before the image can reach OCI runtime failure |
| pnpm does not resolve to `11.18.0`                  | Build assertion fails before dependency installation                 |
| Noto CJK does not match the fixed package/version   | Image validation fails; do not accept host-font fallback             |
| IR page count differs from parsed PDF page count    | Docker PDF smoke fails                                               |
| Compose adds `privileged`, `SYS_ADMIN` or `cap_add` | Security validation fails                                            |

### 5. Good/Base/Bad Cases

- Good: final image starts with `dumb-init` as PID 1, launches the fixed Chromium and returns a multi-page CJK PDF
  whose parsed page count matches the Output IR.
- Base: a template containing only manual pages still produces one A4 PDF page per Output page without a trailing
  blank page.
- Bad: a statically plausible Dockerfile that was never built, or a PDF checked only for `/ToUnicode`, is not valid
  release evidence.

### 6. Tests Required

1. Run `docker build --check` and a complete Server image build; assert no OpenSSL detection fallback warning.
2. Start the final image through its default ENTRYPOINT; assert `/proc/1/comm` is `dumb-init`.
3. Assert the exact `playwright-core`, Chromium, `dumb-init` and Noto CJK versions inside the image.
4. Generate a real PDF through `OutputBrowserService`; assert PDF signature, IR/PDF page counts, A4 size,
   normalized metadata and no fatal diagnostic.
5. Inspect text objects and image XObjects, extract CJK text, then render every page with Poppler and inspect glyphs,
   clipping and blank pages. Compatibility-radical ToUnicode mappings must be reported rather than hidden.
6. Run an isolated Compose `/api/output/pdf` E2E and verify `200 application/pdf` plus UTF-8
   `Content-Disposition`; delete only the test project's containers, network and volume afterward.

### 7. Wrong vs Correct

#### Wrong

```dockerfile
FROM node:22-bookworm-slim AS base
RUN corepack prepare pnpm@11.18.0 --activate

FROM mcr.microsoft.com/playwright:v1.62.0-noble AS runtime
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
```

This assumes Prisma can detect OpenSSL in the slim build stages and that an independent runtime contains
`dumb-init`; neither assumption is guaranteed.

#### Correct

```dockerfile
FROM node:22-bookworm-slim AS base
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/* \
    && corepack prepare pnpm@11.18.0 --activate \
    && test "$(corepack pnpm --version)" = "11.18.0"

FROM mcr.microsoft.com/playwright:v1.62.0-noble AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      dumb-init=1.2.5-3 \
      fonts-noto-cjk=1:20230817+repack1-3 \
    && test -x /usr/bin/dumb-init \
    && rm -rf /var/lib/apt/lists/*
```

## Verification

Every output change must cover the closest pure unit test and consumer typecheck. Before release:

1. build Core, Components and Export before Web/Server consumers;
2. run Core/Export/Web/Server unit and contract tests;
3. run a real Chromium PDF test and compare IR page count with the parsed PDF page count;
4. render PDF pages to PNG and inspect clipping, blank pages, glyphs, headers, footers and table continuation;
5. verify the PDF contains text objects rather than an entire-page bitmap;
6. build and smoke the fixed Docker image, including Noto CJK visual and text extraction checks;
7. scan for `window.print`, `html2canvas`, `jsPDF`, arbitrary navigation, privileged Compose options and tracked QA files.

Local Windows Chrome visual success does not replace Docker validation. `/ToUnicode` presence alone does not prove
correct CJK extraction.
