# TypeScript Conventions (v2)

---

## Shared Base Config (`tsconfig.base.json`)

All packages extend this. Key settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext", "DOM"],
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true
  }
}
```

`moduleResolution: "bundler"` — required for Vite and modern bundlers. Do not change to `node16` or `nodenext` without testing all packages.

---

## Strict TypeScript

All packages use `strict: true`. This enables:
- `strictNullChecks`
- `noImplicitAny`
- `strictFunctionTypes`

**Never disable strict locally** with `// @ts-ignore` or `as any` for convenience. If a third-party type is wrong, use `declare module` augmentation.

---

## NestJS Exception: Decorator Support

`apps/server` requires additional compiler options not in base config:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false
  }
}
```

These are NestJS-specific. Do not add them to `tsconfig.base.json`.

---

## Public API Pattern

Every package exports only through `src/index.ts`. Internal modules are not re-exported unless intentionally public.

```ts
// src/index.ts — explicit, intentional exports only
export { PageSchema } from './schema'
export type { ComponentDescriptor, StyleConfig } from './types'
// Do NOT: export * from './internal-utils'
```

---

## Forbidden Patterns

- `as any` — use proper typing or `unknown` with type guards
- `@ts-ignore` — use `@ts-expect-error` with a comment explaining why
- Circular imports between packages — use dependency injection or event emitters
- `require()` — ESM only (`"type": "module"` in all packages)
