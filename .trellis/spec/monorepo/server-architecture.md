# Server Architecture (NestJS 11 + Prisma 7)

> Authoritative conventions for `apps/server` persistence and HTTP boundaries.

---

## Runtime Baseline

- Use the current compatible NestJS 11 and Prisma 7 lines.
- Prisma CLI, Client and driver adapter must use the same exact version.
- Node engines must match Prisma's supported release lines; do not use a broad range that includes
  unsupported odd-numbered Node releases.
- Keep TypeScript on a version supported by the repository's ESLint parser. A newer compiler is not
  an upgrade when the required lint toolchain declares it unsupported.
- The Server is ESM. Keep `package.json#type`, TypeScript `NodeNext`, Prisma generator
  `moduleFormat`, emitted imports and runtime start commands aligned.

## Prisma 7 Contract

- Use the `prisma-client` generator with an explicit output below
  `apps/server/src/generated/prisma`.
- Generated Prisma Client files are build artifacts and must remain gitignored. Clean-clone
  typecheck and build commands must explicitly run `prisma generate`; local generated output must
  never hide a missing generation step.
- Keep datasource URLs and migration paths in `apps/server/prisma.config.ts`, not
  `schema.prisma`. Load environment variables explicitly with `dotenv/config`.
- SQL connections require a driver adapter. PostgreSQL uses `@prisma/adapter-pg` + `pg`, managed by
  the single Nest `PrismaService` lifecycle and connection pool.
- Commit Prisma migrations. Runtime/test setup uses `prisma migrate deploy`; do not replace migration
  history with `db push`.
- Prisma 7 does not generate automatically after migrate commands. Generate explicitly.

## PostgreSQL Configuration and Fresh Databases

- PostgreSQL is the only provider for development, tests and production; do not maintain a SQLite
  fallback, dual migration history or provider-conditional application code.
- `DATABASE_URL` is required and must use `postgresql://` or `postgres://`; never fall back to a
  repository-local database file.
- The 2026 PostgreSQL transition happened before production data existed. Its initial migration is a
  fresh baseline, not a SQLite data-copy workflow or anonymous-owner backfill.
- CI and HTTP integration tests run committed migrations against a real isolated PostgreSQL service.
  Do not replace this with `db push` or a SQLite-only test shortcut.
- Generated Client output and local database credentials must never be tracked.

## Authentication and Resource Authorization

- Better Auth is mounted at `/api/auth/*` before Express JSON body parsing and reuses the same Nest
  `PrismaService`; do not create a second Prisma Client for auth. This middleware order is required so
  Better Auth consumes and validates its own auth request bodies rather than receiving a stream already
  consumed by the global parser.
- The first release enables GitHub OAuth only. Email/password, OTP, SMTP, Passkey and browser-stored
  bearer tokens are outside this contract.
- `PTD_ALLOWED_EMAILS` is parsed server-side, normalized to lowercase and fails closed. New identities
  must pass it, and every protected request checks it again so removing an email revokes old sessions.
- `/healthz` remains anonymous. Current-user, template and version endpoints require the Cookie
  session Guard; unauthenticated access is 401.
- `Template.ownerId` comes only from the authenticated request. Every read, conditional update,
  delete, version query and restore is scoped in the database by owner; cross-owner access is 404.
- Auth/session/user/HTTP types remain outside `@ptd/react-designer`.

## Template Persistence Boundary

- `Template` stores the current version; `TemplateVersion` is append-only history with a unique
  `(templateId, version)` key and cascade deletion from `Template`.
- PostgreSQL stores template content as native `JsonB` through Prisma `Json`, while normalizing every
  read/write through `@ptd/core.serialize` and `deserialize` so template schema migration remains
  centralized.
- Server template contracts must reuse Core `serialize`, `deserialize` and `isTemplateSchema`; do not
  introduce a shallow Server-only validator that accepts a shape Core would reject or loses v2 data and
  binding normalization.
- Core `DATA_SOURCE_LIMITS.maxBytes` limits canonical `TemplateDataDefinition.sampleRecords` to
  **512 KiB**. This is an internal budget for persisted sample records, not the complete HTTP request limit;
  a full template also contains pages, components, image Data URLs and bindings.
- Do not use unchecked `any` or an unchecked assertion to force application objects into Prisma JSON.
  Validate the recursive JSON value and require an object at the top-level.

## HTTP and Concurrency Contract

- The template API accepts complete template JSON bodies up to **4 MiB**. Express JSON parsing and Nginx
  `client_max_body_size` must both use that value, and every outer reverse proxy, ingress or CDN must allow
  at least **4 MiB** rather than becoming a smaller undocumented limit.
- Web preflight, Nginx and Server limits must remain synchronized so a template cannot pass locally and
  then drift into proxy 413 or application 400 behavior. The 4 MiB transport limit does not weaken Core's
  independent 512 KiB `sampleRecords` validation.
- Controllers accept request bodies as `unknown`; pure contract parsers enforce the runtime shape.
- IDs and version route parameters must be positive integers within Prisma `Int` range
  (`1..2_147_483_647`).
- Malformed input returns 400, missing resources return 404, and stale writes return 409.
- Create, update and restore are transactions. Every successful current version has exactly one
  immutable snapshot.
- Update and restore require `expectedVersion` and perform a conditional `updateMany` on the current
  database version. A prior read check alone is insufficient because concurrent requests can read
  the same version.
- Restore appends a new current version and snapshot; it never rewrites the selected historical row.

## Deterministic PDF Boundary

- The authenticated `POST /api/output/pdf` accepts a Core-validated TemplateSchema, bounded RenderContext and explicit
  OutputOptions. It does not require a template id and never persists the request or result.
- PDF layout belongs to `@ptd/export`; Server owns only contract validation, browser lifecycle, network isolation,
  response headers and error mapping. Never accept arbitrary HTML, client OutputDocument, scripts or navigation URLs.
- Use one long-lived Browser and one isolated BrowserContext/Page per request. Enforce a hard concurrency ceiling with
  no unbounded queue; a cancelled/timed-out job retains its slot until Context cleanup completes.
- Abort and all failure paths close the Context exactly once. Browser disconnect may trigger one rebuild, never an
  infinite retry. Nest shutdown closes an already-running or currently-launching Browser.
- Browser routing fails closed. Only the exact configured internal render origin's document/script/stylesheet/font plus
  `data:`/`blob:` is permitted; no request may reach public, private, loopback, metadata or other Compose services.
- The 30 second default application deadline remains below Nginx's 60 second `/api` timeout. Output request bodies use
  the existing 4 MiB JSON limit; generated PDFs have an independent 64 MiB limit.
- Map invalid request to 400, unauthenticated to 401, fatal layout to 422, saturation to 429, browser failure/cancel to
  503 and timeout to 504. Error bodies and logs must not include template data, resource URLs, secrets or local paths.

## Required Verification

For Server persistence changes, verify at minimum:

1. Build `@ptd/core` so workspace types exist on a clean runner.
2. Run frozen install with strict peer dependency validation after manifest changes.
3. Run Prisma validate, explicit generate and deploy to a brand-new PostgreSQL database.
4. Run Server lint, strict typecheck, real Nest HTTP integration tests against PostgreSQL and the
   production build.
5. Exercise a genuine simultaneous stale-write race: exactly one request succeeds, one returns 409,
   and exactly one new snapshot exists.
6. Start the compiled Server and smoke-test `/healthz`.
7. Run Prettier, `git diff --check`, forbidden-pattern scans and tracked-artifact checks.
8. Create and update a canonical v2 template below 4 MiB; verify a request above 4 MiB is rejected with
   413 or an equivalently explicit payload-too-large response.
9. Verify Core schema validation rejects `sampleRecords` above 512 KiB even when the complete request is
   below 4 MiB, and that no Server-only shallow validation path can accept it.
10. Regression-test GitHub login and callback requests with Better Auth mounted before the JSON parser.

`prisma migrate reset --force` is destructive even for an isolated PostgreSQL test database. Agents must not bypass
Prisma's safety gate; run it only after explicit user authorization identifies the exact isolated
database that may be destroyed and recreated.
