# Validation status

## Passed locally

- Frozen lockfile install with strict peer dependency validation using the mandated workstation pnpm
  path (the workspace Corepack configuration activates pnpm 10.15.1).
- Compose configuration renders successfully from `.env.example`; structural assertions confirm the
  `postgres`, `migrate`, `server` and `web` services, the named PostgreSQL volume, internal-only
  PostgreSQL/Server ports, the public Web port and the required health/dependency chain.
- Bash deployment entrypoint passes `bash -n`, renders help, rejects missing/placeholder/unsafe
  configuration, copies a first-run `.env` and stops before deployment, and preserves its executable
  mode.
- Both Web and Server Docker images build successfully from a clean Docker context. The production
  Server image contains the compiled `@ptd/core` workspace dependency, generated Prisma Client,
  committed migrations and the production Prisma CLI/runtime dependencies.
- A complete isolated Docker Compose deployment was started through `./deploy.sh --build` with a
  dedicated project name, bind address, port and PostgreSQL volume. PostgreSQL became healthy, the
  migration service exited with code 0, and both Server and Web became healthy.
- Host-level smoke checks through the Nginx same-origin endpoint passed: `/healthz` returned `200 ok`,
  `/api/auth/get-session` returned `200 null`, and protected `/api/account/me` returned `401`.
- GitHub social sign-in initialization through Nginx returned `200`, issued the Better Auth state
  cookie and generated an authorization URL whose callback is
  `/api/auth/callback/github` on the configured public origin. Real provider callback/login was not
  attempted because validation credentials are intentionally placeholders.
- A second final-script `./deploy.sh --build` run force-recreated every service container while
  preserving the existing PostgreSQL volume, completed all health checks, produced new container IDs
  for PostgreSQL/migration/Server/Web, and reported no pending migrations.
- The isolated validation containers, network, PostgreSQL volume and ignored temporary `.env` were
  removed after the smoke test.
- Server ESLint, strict typecheck, production build and PostgreSQL integration suite pass (12/12).
  The integration suite's placeholder users and related records were removed from the explicitly
  isolated test database after validation.
- Core typecheck/build/tests pass (47/47); Components typecheck/build/tests pass (45/45); React
  Designer typecheck/build/tests pass (120/120).
- Frontend ESLint, Web strict typecheck and production build pass. The build retains only the known
  large-chunk advisory warning.
- Workflow YAML parses, Prettier checks all applicable modified source/configuration/documentation
  files, `git diff --check` passes and the Trellis task context validates. The pnpm-generated lockfile
  is excluded because both the baseline and updated lockfile intentionally use pnpm's own YAML format.

## Environment notes

- Docker Desktop was used for the real two-image build and complete local Compose smoke test.
- This workstation does not provide `pwsh` or Windows PowerShell, so `deploy.ps1` could not be parsed
  locally. CI retains the PowerShell parser gate and the Bash/PowerShell implementations were reviewed
  for parameter and lifecycle parity.
- No database URL, OAuth secret, Better Auth secret, GHCR token or local validation credential is
  stored in tracked files.
