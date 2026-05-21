# Monorepo Architecture Guidelines (v2)

> Conventions for the v2 pnpm monorepo rewrite. This replaces the legacy Vue 2 `frontend/` spec.

---

## Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | Monorepo layout, package roles | Done |
| [Package Conventions](./package-conventions.md) | package.json, tsconfig, exports | Done |
| [TypeScript Conventions](./typescript-conventions.md) | Strict TS, shared base config | Done |
| [Styling Conventions](./styling-conventions.md) | CSS Modules vs CSS Variables | Done |
| [Quality Guidelines](./quality-guidelines.md) | ESLint flat config, Prettier, Node ≥20 | Done |

---

## Pre-Development Checklist

Before writing any code for a task in this monorepo, **always read these files**:

| File | Why it matters |
|------|---------------|
| [Package Conventions](./package-conventions.md) | tsup config, `exports` field order (`types` before `import`/`require`), `peerDependencies` rules — getting these wrong breaks consumers silently |
| [TypeScript Conventions](./typescript-conventions.md) | `strict: true` is non-negotiable; `as any` and `@ts-ignore` are forbidden; all public API must export through `src/index.ts` only |
| [Styling Conventions](./styling-conventions.md) | CSS Modules for designer UI, CSS Custom Properties for canvas components — mixing these up causes style leakage and print-safety issues |
| [Directory Structure](./directory-structure.md) | Where each package/app lives and what it owns — putting code in the wrong layer creates circular dependencies |
| [Quality Guidelines](./quality-guidelines.md) | ESLint flat config + Prettier — CI will reject non-compliant code |

---

## Task Context Files (implement.jsonl / check.jsonl)

Every task under `.trellis/tasks/` has two context files that **must be filled before implementation starts**:

### `implement.jsonl`
Loaded by the `trellis-implement` sub-agent before writing code. Each line is:
```json
{"file": "<repo-root-relative path to spec file>", "reason": "<why this spec matters for this task>"}
```

**Required entries for any task in this monorepo:**
- `package-conventions.md` — always, for build/export correctness
- `typescript-conventions.md` — always, for type safety
- `styling-conventions.md` — for any task touching UI or canvas components
- `directory-structure.md` — for any task creating new files/packages
- `quality-guidelines.md` — always, for lint/format compliance

**What NOT to put here:** code file paths (`src/**`, `packages/**/*.ts`) — the sub-agent reads those during implementation, not pre-registration.

### `check.jsonl`
Loaded by the `trellis-check` sub-agent when verifying code quality. Typically a subset of `implement.jsonl` focused on quality/compliance specs:
- `quality-guidelines.md` — always
- `typescript-conventions.md` — always
- `styling-conventions.md` — when UI/canvas code is involved

### Why this matters
A sub-agent with empty jsonl files has **no spec context** — it will make up conventions, produce inconsistent code, and require rework. Filling these files is the single highest-leverage action before starting implementation.
