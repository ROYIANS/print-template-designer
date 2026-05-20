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
    export/         @ptd/export         PDF / Word export utilities
  apps/
    web/            Designer web app (React + Vite)
    server/         NestJS + Prisma backend
  docker/           Dockerfile.web, Dockerfile.server, docker-compose.yml
  legacy/           Original Vue 2 source — READ ONLY, do not modify
  .trellis/         Trellis workflow, tasks, spec
  package.json      Root — private: true, pnpm workspaces
  pnpm-workspace.yaml
  tsconfig.base.json
```

## Package Anatomy (each package under `packages/`)

```
packages/<name>/
  src/
    index.ts        Public API entry — always re-export from here
  dist/             Build output (gitignored)
  package.json      name, version, main/module/types → dist/
  tsconfig.json     extends ../../tsconfig.base.json (type-check only)
  tsconfig.build.json  outDir: dist, rootDir: src (used by build script)
```

## Apps Anatomy

```
apps/web/
  src/
    main.tsx
    App.tsx
  index.html
  vite.config.ts
  tsconfig.json

apps/server/
  src/
    main.ts           NestJS bootstrap (port 3000)
    app.module.ts
    app.controller.ts
    app.service.ts
  prisma/
    schema.prisma     SQLite datasource + Template model
  tsconfig.json
  tsconfig.build.json
```

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
- Do not add files directly to root (no `src/` at root)
- Do not create new top-level directories without a clear category
