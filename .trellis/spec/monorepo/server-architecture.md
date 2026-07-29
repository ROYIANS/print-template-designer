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
- SQL connections require a driver adapter. SQLite uses `@prisma/adapter-better-sqlite3`, managed by
  the single Nest `PrismaService` lifecycle.
- Native dependencies whose install scripts pnpm blocks must be listed in the root
  `pnpm.onlyBuiltDependencies` allowlist and verified at runtime, not only by TypeScript.
- Commit Prisma migrations. Runtime/test setup uses `prisma migrate deploy`; do not replace migration
  history with `db push`.
- Prisma 7 does not generate automatically after migrate commands. Generate explicitly.

## SQLite Paths and Fresh Databases

- Resolve relative `file:` URLs against `apps/server`, consistently in both the runtime adapter and
  migration preparation.
- Preserve `file::memory:` as an in-memory database; never turn it into a disk path.
- Before `migrate deploy`, the safe preparation script may create a missing parent directory and an
  empty SQLite file. It must never truncate, delete or overwrite an existing database.
- Prefer plain file URL paths. Prisma's schema engine may reject manually percent-encoded SQLite
  paths even when the corresponding unencoded path is valid.
- Local databases, journals, WAL/SHM sidecars and generated Client output must never be tracked.

## Template Persistence Boundary

- `Template` stores the current version; `TemplateVersion` is append-only history with a unique
  `(templateId, version)` key and cascade deletion from `Template`.
- Prisma 7 supports native SQLite `Json`. Store template content as `Json`, while normalizing every
  read/write through `@ptd/core.serialize` and `deserialize` so template schema migration remains
  centralized.
- Do not use unchecked `any` or an unchecked assertion to force application objects into Prisma JSON.
  Validate the recursive JSON value and require an object at the top-level.

## HTTP and Concurrency Contract

- Controllers accept request bodies as `unknown`; pure contract parsers enforce the runtime shape.
- IDs and version route parameters must be positive integers within Prisma/SQLite `Int` range
  (`1..2_147_483_647`).
- Malformed input returns 400, missing resources return 404, and stale writes return 409.
- Create, update and restore are transactions. Every successful current version has exactly one
  immutable snapshot.
- Update and restore require `expectedVersion` and perform a conditional `updateMany` on the current
  database version. A prior read check alone is insufficient because concurrent requests can read
  the same version.
- Restore appends a new current version and snapshot; it never rewrites the selected historical row.

## Required Verification

For Server persistence changes, verify at minimum:

1. Build `@ptd/core` so workspace types exist on a clean runner.
2. Run frozen install with strict peer dependency validation after manifest changes.
3. Run Prisma validate, explicit generate and deploy to a brand-new ignored SQLite path.
4. Run Server lint, strict typecheck, real Nest HTTP integration tests and production build.
5. Exercise a genuine simultaneous stale-write race: exactly one request succeeds, one returns 409,
   and exactly one new snapshot exists.
6. Start the compiled Server and smoke-test `/healthz`.
7. Run Prettier, `git diff --check`, forbidden-pattern scans and tracked-artifact checks.

`prisma migrate reset --force` is destructive even for a test database. Agents must not bypass
Prisma's safety gate; run it only after explicit user authorization identifies the exact isolated
database that may be destroyed and recreated.
