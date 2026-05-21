# Quality Guidelines (v2)

---

## Toolchain

| Tool | Version | Config |
|------|---------|--------|
| ESLint | v9 (flat config) | `eslint.config.js` at root |
| Prettier | v3 | `.prettierrc.json` at root |
| TypeScript | v5+ | `tsconfig.base.json` + per-package |
| Node | ≥ 20 | `engines` field in all `package.json` |
| pnpm | ≥ 9 | `pnpm-workspace.yaml` |

---

## Prettier Config

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "semi": false,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## EditorConfig

```ini
indent_style = space
indent_size = 2
end_of_line = lf
trim_trailing_whitespace = true
insert_final_newline = true
```

---

## ESLint

Uses flat config (`eslint.config.js`). TypeScript rules applied to `**/*.{ts,tsx}`. React rules applied to `apps/web/**` and `packages/react-designer/**`.

Run: `pnpm lint`

---

## Required Patterns

- Every `packages/*` must have a `typecheck` script (`tsc --noEmit`)
- Every `packages/*` must have a `build` script (`tsup`)
- Every `packages/*` must have a `test` script (`vitest run`)
- `src/index.ts` must exist and be the only public API entry point
- `pnpm install` must succeed from root after any `package.json` change
- Destroy third-party instances in cleanup / component unmount (e.g., Puppeteer browser `browser.close()`)

---

## Forbidden Patterns

- Importing across packages via relative paths (`../../../packages/core/src`)
- `console.log` in library packages (`@ptd/*`) — use a debug utility or remove
- Committing `dist/` directories — they are gitignored
- `node_modules` in any commit
- Adding `"type": "commonjs"` to any package — all packages are ESM

---

## Testing

All `packages/*` use **Vitest** for unit tests.

### vitest.config.ts (required in every package)

Default for pure logic packages (no DOM):
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
})
```

For packages that use DOM APIs (`@ptd/components` and any future browser-only packages), use `jsdom`:
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
})
```

> **Rule**: Use `environment: 'node'` by default. Switch to `'jsdom'` only when the package directly manipulates DOM (e.g., `document.createElement`, `element.style.setProperty`). Do not add `jsdom` to packages that don't need it — it adds ~5s to test startup.

### Test file location

Tests live in `src/__tests__/` with the naming pattern `<module>.test.ts`.

### Import paths in tests

Tests are inside `src/__tests__/`, so imports are relative to `src/`:

```ts
// Correct — tests are inside src/__tests__/
import { DataBindingEngine } from '../data-binding/engine'

// Wrong — do not include 'src' in the path
import { DataBindingEngine } from '../src/data-binding/engine'
```
