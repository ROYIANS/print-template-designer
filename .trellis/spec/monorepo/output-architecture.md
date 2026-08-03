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
    && test "$(pnpm --version)" = "11.18.0"

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
