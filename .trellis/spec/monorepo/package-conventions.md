# Package Conventions (v2)

---

## Build Tool: tsup (ESM + CJS dual output)

All `packages/*` use **tsup** for building, not `tsc` directly. tsup produces ESM + CJS + `.d.ts` in one command.

### tsup.config.ts (required in every package)

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
})
```

### package.json Required Fields

Every package under `packages/` must have:

```json
{
  "name": "@ptd/<name>",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  },
  "engines": { "node": ">=20" }
}
```

> **Warning**: In `exports`, `"types"` must come **before** `"import"` and `"require"`. Putting it after causes a tsup/esbuild warning: "The condition 'types' here will never be used."

### tsconfig Split Pattern

Each package still has TWO tsconfig files (for IDE + typecheck):

| File | Purpose |
|------|---------|
| `tsconfig.json` | IDE + `tsc --noEmit` typecheck |
| `tsconfig.build.json` | Kept for reference; tsup uses `tsconfig.json` directly |

`tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## peerDependencies

| Package | peerDependencies |
|---------|-----------------|
| `@ptd/core` | none |
| `@ptd/components` | `@preact/signals-core: ^1` |
| `@ptd/react-designer` | `react: >=18`, `react-dom: >=18`, `@preact/signals-react: ^2` |
| `@ptd/export` | none |

Framework packages (react, preact) go in `peerDependencies`, not `dependencies`.

## Build Script Convention

Root `package.json` scripts run all packages via pnpm filter:

```bash
pnpm build          # runs tsup in all packages/* and apps/
pnpm typecheck      # tsc --noEmit in all packages
pnpm lint           # eslint across workspace
```

Individual package:
```bash
pnpm --filter @ptd/core build
pnpm --filter web dev
```

