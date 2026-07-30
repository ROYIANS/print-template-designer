# Documentation audit — 2026-07-30

## Sources reviewed

- Current root README, CHANGELOG and DEPLOYMENT.
- Historical README at Git commit `d205902` (last mature Vue 2 README before v2 rewrite).
- All current package manifests and public `src/index.ts` entrypoints.
- React `DesignerProps`, Web `App.tsx`, component registry and catalog.
- Nest Controllers, HTTP contracts, Prisma schema and Server architecture spec.
- Git history and archived task delivery records from 2026-07-29/30.

## Public documentation inventory

- Root: `README.md`, `CHANGELOG.md`, `DEPLOYMENT.md`.
- No current package or app README exists.
- `legacy/README.assets/` still contains the original favicon and contact QR; `legacy/README.md` does not exist because the old README lived at repository root.
- Trellis frontend specs are explicitly marked Vue 2 Legacy; monorepo specs are the v2 authority.

## Incorrect or stale claims found

- README marks completed core/components/designer/multi-page/server work as incomplete.
- README example passes `onExport` and `onDataSource`, which are not `DesignerProps`.
- README describes `@ptd/export` as a working Puppeteer/html2canvas/Word package; its public API is currently `export {}`.
- README lists upload, server-side PDF, data-source proxy and auth as current Server responsibilities; none exist.
- README says PostgreSQL is a one-line schema change; Prisma 7 uses a SQLite driver adapter and changing database requires adapter/config/migration work.
- DEPLOYMENT says the backend contract is not ready; the template API now exists, but is not containerized or connected to Web.
- Root and spec Node baseline say `>=20`; the full workspace CI/Docker baseline is Node 22 and `better-sqlite3@12.11.1` has no Node 20 Windows prebuild.
- Package conventions say every package uses tsup/Vitest, but `@ptd/export` remains a `tsc`-only, untested scaffold.
- CHANGELOG contains only the old 0.1.x Vue history and no v2 work.

## Current product facts

- `@ptd/core`: schema/types, units, serialization, data binding and component registry.
- `@ptd/components`: 11 visible renderers plus internal `RoyGroup`.
- `@ptd/react-designer`: controlled React editor, professional workspace/Inspector, history, clipboard, context menu, guides/rulers, multi-page management and drawing/hand tools.
- `apps/web`: standalone Vite host with an in-memory example template; no Server integration.
- `apps/server`: NestJS 11 + Prisma 7.9.1 + SQLite template/version API with optimistic concurrency.
- `@ptd/export`: placeholder only.
- Deployment: Web-only Nginx image from GHCR, pull-only Compose.

## Legacy README ideas retained

- Centered identity block and concise bilingual description.
- Clear feature list, local preview path, installation/development guidance and API entry point.
- Honest maturity statement.
- Legacy/npm history, contact, references, license and roadmap.

Outdated screenshots, Vue installation snippets, obsolete public preview URL and v1 API tables must not be reused as v2 documentation.
