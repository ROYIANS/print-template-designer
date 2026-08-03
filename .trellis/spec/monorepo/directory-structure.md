# Directory Structure (v2 Monorepo)

> Authoritative layout for the v2 rewrite.

---

## Root Layout

```
print-template-designer/
  packages/
    core/           @ptd/core           Framework-agnostic engine (pure TS)
    components/     @ptd/components     Canvas components (TS DOM + Preact Signals)
    react-designer/ @ptd/react-designer React designer UI
    export/         @ptd/export         Deterministic output compiler and DOM renderer
  apps/
    web/            Designer web app (React + Vite)
    server/         NestJS + Prisma backend
  docker/           Dockerfiles and runtime service configuration (for example nginx.conf)
  docker-compose.yml Complete PostgreSQL/migration/Server/Web deployment entrypoint
  deploy.sh         Linux / macOS / Git Bash deployment script
  deploy.ps1        PowerShell 7 deployment script
  legacy/           Original Vue 2 source — READ ONLY, do not modify
  .trellis/         Trellis workflow, tasks, spec
  README.md         Product overview and fastest valid setup
  DEVELOPMENT.md    Local development, commands and troubleshooting
  DEPLOYMENT.md     Full-stack GHCR/Compose deployment operations
  CHANGELOG.md      v2 Unreleased progress and preserved v1 history
  package.json      Root — private: true, pnpm workspaces
  pnpm-workspace.yaml
  tsconfig.base.json
```

## Package Anatomy

```
packages/<name>/
  README.md         Public API, usage and maturity boundary
  src/
    index.ts        Public API entry — always re-export from here
  dist/             Build output (gitignored)
  package.json      name, version, main/module/types → dist/
  tsconfig.json     extends ../../tsconfig.base.json (type-check only)
  tsconfig.build.json  outDir: dist, rootDir: src (used by build script)
```

`@ptd/core`, `@ptd/components`, `@ptd/export`, and `@ptd/react-designer` use tsup and Vitest.

## Apps Anatomy

```
apps/web/
  README.md           Host behavior and integration boundary
  src/
    main.tsx
    App.tsx
  index.html
  vite.config.ts
  tsconfig.json

apps/server/
  README.md           Setup, database contract and HTTP API
  src/
    main.ts           NestJS ESM bootstrap (port 3000)
    app.module.ts
    generated/prisma/ Ignored Prisma 7 generated Client
    health/           Health endpoint
    prisma/           Driver adapter, URL and lifecycle service
    auth/             Better Auth configuration, Allowlist and Cookie Guard
    templates/        Owner-scoped HTTP contracts, controller and versioned persistence service
  prisma/
    migrations/       Committed PostgreSQL migration history
    schema.prisma     Better Auth + owned Template + immutable TemplateVersion models
  test/               Real Nest HTTP integration tests
  prisma.config.ts    Prisma 7 schema/migration/datasource configuration
  vitest.config.ts    Node integration test configuration
  tsconfig.json
  tsconfig.build.json
```

## Deployment Layout

- Web and Server runtime images are built by CI and published to GHCR with matching branch/tag/SHA
  tags. The normal deployment path pulls them; an explicit `--build`/`-Build` operator action may
  build the same Dockerfiles locally for isolated or pre-publication environments.
- The root Compose owns PostgreSQL persistence, one-shot committed migrations, Server health and the
  Web same-origin `/api` proxy. PostgreSQL and Server stay internal unless an intentional override is
  added outside the default stack.
- Image build files and runtime configuration stay under `docker/`.
- Root deployment scripts are the public operator entrypoints and must keep Bash and PowerShell 7
  behavior aligned.
- Local secrets belong in the gitignored `.env`; `.env.example` contains placeholders and scripts
  must refuse to deploy while required placeholders remain.
- Normal updates keep the PostgreSQL volume. Destructive fresh deployment requires a dedicated flag
  plus confirmation; it must never be an implicit recovery action.

## Naming Conventions

- Package dirs: `kebab-case` (e.g., `react-designer`)
- Package names: `@ptd/<name>` scoped
- Source files: `camelCase.ts` for utilities, `PascalCase.tsx` for React components
- No `index.ts` barrel files inside `src/` subdirectories — only at `src/index.ts`

## Internal Package References

Always use `workspace:*` protocol in `package.json` dependencies:

```json
{
  "dependencies": {
    "@ptd/core": "workspace:*",
    "@ptd/components": "workspace:*"
  }
}
```

Never use relative paths (`../core/src`) to cross package boundaries.

## Anti-patterns

- Do not import from `legacy/` in any v2 code — reference only for understanding
- Do not add application source directly to root (no root `src/`); root documentation and shared
  configuration are expected
- Do not create new top-level directories without a clear category
