# Package Conventions (v2)

---

## package.json Required Fields

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
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc --noEmit"
  },
  "engines": { "node": ">=20" }
}
```

## tsconfig Split Pattern

Each package has TWO tsconfig files:

| File | Purpose | Key settings |
|------|---------|--------------|
| `tsconfig.json` | IDE + typecheck (`tsc --noEmit`) | no `outDir`, includes `src` |
| `tsconfig.build.json` | Emit (`tsc -p tsconfig.build.json`) | `outDir: dist`, `rootDir: src`, `declaration: true` |

`tsconfig.json` example:
```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src"]
}
```

`tsconfig.build.json` example:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["dist", "node_modules"]
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
pnpm build          # runs build in all packages/* and apps/
pnpm typecheck      # tsc --noEmit in all packages
pnpm lint           # eslint across workspace
```

Individual package:
```bash
pnpm --filter @ptd/core build
pnpm --filter web dev
```
