# Validation — 输出正确性 Milestone A

## Passed

- `corepack pnpm --version` → `11.18.0`
- `corepack pnpm typecheck`
- `corepack pnpm build`
- `corepack pnpm lint`
- Core: 103 tests passed
- Components: 54 tests passed
- Export: 17 tests passed, including plain/rich overflow, 0.5px tolerance and unified preflight
- React Designer: 158 tests passed
- Web: 93 tests passed
- Server output controller/browser: 14 tests passed
- `git diff --check`
- Forbidden pattern scan: no new `as any`, `@ts-ignore` or debug logging
- No changes under `legacy/`; no new tracked build artifacts
- Trellis context validation: 11 implementation entries and 8 check entries passed

## Environment-gated checks

- Real Chromium smoke passed with the user-started `http://127.0.0.1:5173/output-render.html` bundle and local Chrome.
  The production render path generated a two-page PDF and passed page-count, PDF signature, text-object and `ToUnicode`
  assertions. The same service also blocked intentionally overflowing Chinese plain-text and rich-text frames before
  PDF generation, with `TEXT_OVERFLOW` diagnostics and no result bytes; the controller mapping was verified as HTTP
  422 with no response body sent.
- PostgreSQL-backed Server test suite passed against the authorized remote development database: 10 files passed,
  58 tests passed, 4 opt-in real-PDF tests skipped in the suite run; Prisma reported no pending migrations. No reset/drop
  operation was executed.
- Docker CLI is not installed in the current environment, so `docker build --check` and container builds remain a
  deployment-level check for the user to run later.

## Remaining deployment smoke

1. Run `docker build --check` and complete Web/Server image builds in an environment with Docker.
