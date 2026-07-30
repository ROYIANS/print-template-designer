# Validation status

## Passed locally

- Prisma format, validate, explicit generate.
- Prisma `migrate diff --from-empty --to-schema ... --script`; generated PostgreSQL DDL matches the
  committed fresh baseline migration.
- Deployed the sole PostgreSQL baseline migration to a user-provided, fully isolated PostgreSQL test
  database; a second deploy reported no pending migrations.
- Server strict typecheck, ESLint and production build.
- Allowlist unit tests, including normalization, exact matching and fail-closed behavior.
- Full Nest HTTP integration suite against PostgreSQL: 12/12 tests pass, including unauthenticated
  rejection, two-owner isolation, version access/restore, deletion and optimistic concurrency.
- Compiled Server process starts successfully with explicit runtime dependencies. Real HTTP smoke
  checks pass for `/healthz`, unauthenticated Better Auth session lookup, protected account/template
  rejection, and GitHub OAuth authorization URL generation.
- Frontend ESLint, Web strict typecheck and production build.
- Browser QA of signed-out GitHub-only screen at wide and 480px viewport.
- Frozen lockfile install with strict peer dependency validation.

## Environment notes

The workstation has neither Docker nor a local PostgreSQL executable, so database verification used a
user-provided, fully isolated remote test database. No connection string or credential is stored in the
repository. `.github/workflows/ci.yml` independently provisions PostgreSQL 17 and repeats migration,
integration, lint, typecheck and build gates on every CI run.
