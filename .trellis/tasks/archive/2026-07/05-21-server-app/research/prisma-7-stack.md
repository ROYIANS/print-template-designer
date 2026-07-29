# Current stable Server stack decision

## Verified versions and compatibility

Registry metadata was checked on 2026-07-29 with the repository's required pnpm executable.

- Node runtime: 24.11.0.
- Prisma CLI / Client / better-sqlite3 adapter: 7.9.1. Prisma supports Node `^20.19`, `^22.12`
  or `>=24`.
- NestJS common/core/platform/testing: 11.1.28. NestJS 11 supports Node 20+ and uses Express 5.
- Nest CLI: 11.0.24.
- Vitest: 4.1.10. Vitest 4 supports Node 20, 22 and 24+.
- Supertest: 7.2.2.
- TypeScript remains on the current compatible 5.9 line. Although TypeScript 7.0.2 is published,
  `@typescript-eslint/parser` currently declares support only for TypeScript `<6.1.0`; upgrading this
  workspace to TypeScript 7 would make the required lint gate unsupported.

Use compatible current ranges rather than combining incompatible latest package numbers. In
particular, Prisma adapter 7.9.1 depends on `better-sqlite3 ^12.6.0`, whose newest compatible 12.x
release is 12.11.1; better-sqlite3 13 is outside the adapter's supported range.

## Prisma 7 architecture

- Replace `prisma-client-js` with `prisma-client` and an explicit generated output below
  `apps/server/src/generated/prisma`.
- Generate ESM for the Server workspace and keep TypeScript module settings aligned.
- Move datasource URL and migration paths out of `schema.prisma` into
  `apps/server/prisma.config.ts`.
- Load `.env` explicitly with `dotenv/config`; Prisma 7 no longer loads it implicitly.
- Instantiate one Nest-managed Prisma Client with `PrismaBetterSqlite3` and the configured database
  URL. SQL driver adapters are required by Prisma 7.
- Generate explicitly after migrations; Prisma 7 removed migrate's automatic generate behavior and
  the legacy `--skip-generate` flag.

## Native JSON decision

Prisma's official feature matrix states that JSON and Enum types are supported by SQLite from ORM
6.2.0. Prisma 7.9 therefore fixes the original schema validation failure without storing JSON as an
opaque String.

`Template.content` and `TemplateVersion.content` should remain `Json`. Persistence helpers should
normalize content through `@ptd/core.serialize` and `deserialize`, converting between the core
schema contract and Prisma JSON values. HTTP responses expose a `TemplateSchema` object and never a
serialization string.

Official references:

- https://www.prisma.io/docs/orm/more/upgrades/to-v7
- https://www.prisma.io/docs/orm/core-concepts/supported-databases/database-drivers
- https://www.prisma.io/docs/orm/reference/database-features

## Retained API and transaction decisions

The endpoint surface, runtime validation rules, immutable version snapshots and optimistic
concurrency semantics from the original research remain unchanged. Create, update and restore stay
transactional; update/restore use a conditional `updateMany` on `(id, expectedVersion)` so
concurrent writes cannot silently overwrite one another.
