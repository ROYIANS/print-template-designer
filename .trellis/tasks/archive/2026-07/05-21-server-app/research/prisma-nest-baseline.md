# Legacy Prisma/Nest baseline findings

> Superseded on 2026-07-29 by `prisma-7-stack.md` after the user explicitly selected a current
> stable technology stack. The failure analysis below remains useful historical evidence, but its
> Prisma 5 retention and String persistence decisions are no longer implementation requirements.

## Current state

- Installed Prisma CLI and Client resolve to 5.22.0.
- NestJS is 10.4.x and the Server TypeScript decorator configuration already typechecks/builds.
- Prisma uses the classic `prisma-client-js` generator with `DATABASE_URL` in `schema.prisma`; this is
  correct for Prisma 5 and should not be rewritten to the Prisma 7 adapter/config model.
- SQLite is the confirmed zero-dependency default database.
- `prisma validate` currently fails P1012 because Prisma 5's SQLite connector does not support the
  declared `Json` field.
- There are no migrations or committed database lifecycle contract.
- The existing server Dockerfile is an old scaffold and the completed production Compose publishes
  only the Web image by design.

## Superseded persistence decision

- Persist template content as `String` using `@ptd/core.serialize` and return it using
  `@ptd/core.deserialize`.
- This avoids an unnecessary Prisma upgrade, keeps SQLite viable and remains portable to PostgreSQL.
- Use a separate immutable `TemplateVersion` table with a compound unique key
  `(templateId, version)` and cascade delete.
- Create version 1 at template creation. Update and restore append version N+1 transactionally.
- Require `expectedVersion` for update/restore. A stale value is a 409 conflict, preventing silent
  last-write-wins data loss.

## API boundary decision (retained)

- Controllers accept `unknown` request bodies and delegate narrow runtime parsing to a pure contract
  module; TypeScript interfaces alone are not request validation.
- The minimum template shape requires numeric `_version`, object `pageConfig`, non-empty `pages`,
  array `dataSource` and object `dataSet`.
- API responses expose parsed `TemplateSchema`, never the database serialization string.
- Use Nest's standard 400/404/409 HTTP exceptions and integration-test their status/message shape.

## Testing decision (retained, version upgraded)

- Add Vitest, `@nestjs/testing` and Supertest to the Server workspace.
- Run committed migrations against `prisma/test.db` before tests; database and SQLite sidecars remain
  gitignored.
- Integration tests build the real AppModule, call HTTP endpoints and clean tables through the shared
  PrismaService rather than mocking persistence.
