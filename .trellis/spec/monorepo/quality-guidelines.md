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
- Every `packages/*` must have a `build` script (`tsc -p tsconfig.build.json`)
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

## No Tests Yet

There is no test suite configured in v2. Do not add test infrastructure unless explicitly requested. When tests are added, the recommended stack is Vitest (compatible with Vite and ESM).
