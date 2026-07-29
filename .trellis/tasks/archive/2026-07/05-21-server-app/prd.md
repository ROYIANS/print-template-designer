# Server application foundation and template API

## Background

`apps/server` currently compiles but only exposes `Hello PTD`. Its legacy NestJS 10 / Prisma 5.22
SQLite schema is not operational: `Template.content Json` fails `prisma validate` because that
connector/version predates SQLite JSON support. There are no migrations, generated-client lifecycle
service, tests, health contract or template endpoints.

The server task should first establish a real persistence boundary for the standalone application.
This slice delivers template CRUD and version snapshots; it does not pretend that authentication,
asset storage, remote data proxying or PDF rendering can be safely completed without their own
contracts.

## Direction

- Modernize the Server workspace to the current stable backend stack verified on 2026-07-29:
  NestJS 11, Prisma ORM 7.9, Vitest 4 and Node 24 development/runtime types. Stay on TypeScript 5.9
  until the repository's current `@typescript-eslint` line supports TypeScript 7.
- Use Prisma 7's `prisma-client` generator, explicit generated output, `prisma.config.ts`, explicit
  environment loading and the `@prisma/adapter-better-sqlite3` driver adapter.
- Store `TemplateSchema` in Prisma's native `Json` field. Prisma supports SQLite JSON from ORM 6.2
  onward. Normalize values through the canonical `@ptd/core.serialize` / `deserialize` contract at
  the persistence boundary so schema-version migration remains centralized.
- Use one Prisma lifecycle service and committed migrations; the application must not rely on
  `db push` or a developer's residual database.
- Expose explicit, testable REST resources with optimistic version checks so two clients cannot
  silently overwrite each other.
- Keep the React package backend-agnostic. Host integration remains owned by the integration-hooks
  and Web App tasks.

## Scope

1. Replace the placeholder App controller/service with:
   - `GET /healthz`;
   - Template module, controller and service;
   - Prisma module/service with connect/disconnect lifecycle.
2. Upgrade the Server runtime/toolchain and make the SQLite schema valid:
   - NestJS packages use the current 11.x stable line;
   - Prisma CLI, Client and SQLite adapter use the same current 7.x stable version;
   - Prisma generates an ESM client to an explicit ignored source directory;
   - `prisma.config.ts` owns schema, migration and datasource URL configuration;
   - application startup and Prisma CLI explicitly load environment variables.
3. Add the first committed migration:
   - `Template` stores current title/content/version/timestamps;
   - `TemplateVersion` stores every immutable version snapshot;
   - deleting a template cascades its snapshots.
4. Add `@ptd/core` as a workspace dependency and use its `serialize`/`deserialize` contract to
   normalize native JSON values going into and out of persistence.
5. Add endpoints:
   - `GET /api/templates` — ordered summaries;
   - `POST /api/templates` — create version 1;
   - `GET /api/templates/:id` — current template;
   - `PUT /api/templates/:id` — update with required `expectedVersion`;
   - `DELETE /api/templates/:id`;
   - `GET /api/templates/:id/versions` — snapshot summaries;
   - `GET /api/templates/:id/versions/:version` — snapshot detail;
   - `POST /api/templates/:id/versions/:version/restore` — restore as a new version using required
     `expectedVersion`.
6. Validate request boundaries without coercing malformed input:
   - title is a trimmed, non-empty bounded string;
   - content has the minimum `TemplateSchema` structure;
   - expected version is a positive integer;
   - missing records return 404 and stale writes return 409.
7. Create/update/restore writes are transactions. Every successful write creates exactly one
   immutable `TemplateVersion` record matching the new current version.
8. Add Vitest 4 + Supertest integration coverage using an isolated ignored SQLite test database and
   committed migrations.
9. Add server Prisma validate/generate, typecheck, test, lint and build gates to the task verification.
10. Update safe environment examples and ignore local SQLite database files, sidecars and generated
    Prisma Client output.

## Out of scope

- User registration/login, password storage, sessions, JWTs or authorization. These require an
  explicit standalone-app security decision before implementation.
- Static asset upload/storage. Local volume versus object storage and public URL policy are not yet
  defined.
- REST/Excel data-source proxying and credentials. Owned by `05-21-datasource-refactor`.
- Puppeteer/PDF endpoints. Owned by `05-21-export-package`.
- Wiring Web App callbacks to this API. Owned by `05-21-integration-hooks` and `05-21-web-app`.
- Publishing a server image or adding it to the pull-only production Compose. The completed Docker
  task intentionally shipped frontend-only deployment; server rollout needs its own image/release
  slice after the API is stable.
- Pagination, search, tenant isolation and batch-print APIs.

## Acceptance criteria

- Prisma 7.9 schema validation, migration reset/deploy and explicit client generation pass against
  SQLite through the better-sqlite3 adapter.
- Server package versions resolve to NestJS 11, Prisma 7 and Vitest 4 without unsupported peers;
  generated Prisma files and database files are not committed.
- A created template returns version 1 and has one matching immutable snapshot.
- Updating with the current expected version creates version N+1; a stale expected version returns
  409 and does not create a snapshot.
- Restoring an older snapshot creates a new current version; it never rewrites or deletes history.
- Delete removes the template and its snapshots; later reads return 404.
- Invalid title/content/version/id inputs return deterministic 400 responses.
- Every API response returns content as a `TemplateSchema` object; Prisma JSON representation and
  serialization details never leak through the HTTP contract.
- Health, CRUD, snapshots, restore, conflict, validation and deletion pass through real Nest HTTP
  integration tests backed by isolated SQLite.
- Server lint/typecheck/test/build pass after generating Prisma Client and building `@ptd/core`.
- No secrets, generated Prisma client files or SQLite database files are committed.

## Completion boundary

After this task, the repository has a stable standalone template persistence/versioning API.
Datasource, export and Web integration can build on its module, error and testing patterns without
coupling the reusable designer package to this backend.
