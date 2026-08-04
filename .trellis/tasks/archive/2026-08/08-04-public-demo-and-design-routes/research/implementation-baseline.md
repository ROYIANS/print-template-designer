# Implementation Baseline

## Existing access flow

- `apps/server/src/auth/auth.ts` rejects Better Auth user creation through a `PTD_ALLOWED_EMAILS` database hook.
- `apps/server/src/auth/auth.guard.ts` rechecks the same allowlist on every protected request.
- `apps/server/src/auth/auth-config.ts`, Compose, deploy scripts, CI fixtures and public docs all require the allowlist.
- The Web host separately calls `/api/account/me`, so account role and demo deployment state can be carried through a small explicit runtime contract.

## Existing data boundary

- User-owned mutable product data is currently limited to `Template` and cascading `TemplateVersion` rows.
- `User`, `Session` and `Account` are Better Auth identity/session state and must not be deleted by a demo reset.
- Template operations already enforce `ownerId`; opaque route keys must preserve that predicate rather than becoming public access tokens.

## Demo reset decision

- Add a per-user `DemoUserState` row containing the last UTC reset date.
- On first protected access and at the daily scheduler boundary, acquire the reset date for a visitor inside the same transaction that deletes/recreates templates.
- The database row is the idempotency boundary. This prevents duplicate resets across repeated requests, server restarts and multiple server replicas.
- Restore only non-admin template/version data. Preserve users, accounts and sessions.
- Seed one deterministic, print-valid electricity-price forecast example.
- UTC midnight is the fixed reset boundary; it is deterministic across hosts and equals 08:00 Asia/Shanghai.

## Route decision

- Add an opaque unique `Template.key` generated on creation; retain the integer primary key for internal API mutations and version relations.
- Canonical routes:
  - `/app` — file workspace
  - `/design/new` — unsaved document
  - `/design/:key/:slug` — editor
  - `/preview/new` — unsaved document preview within the current SPA lifetime
  - `/preview/:key/:slug` — saved document preview
- The key is authoritative; the slug is cosmetic and canonicalized after load.
- Design and preview use the same mounted document controller so route switching preserves unsaved in-memory edits.
- Existing `/app?new=blank` and `/app?template=<integer>` links are accepted and migrated to canonical routes.

## UI decision

- Demo deployments keep the existing public landing page.
- Non-demo deployments render a compact GitHub login page at `/`.
- `/app` shows a prominent demo notice with the exact reset boundary and a GitHub Fork/Star action.
- Deep design/preview routes show a smaller persistent demo badge so direct-link visitors still understand persistence limits.

## Constraints

- No new runtime dependency is needed; scheduling uses Nest lifecycle plus a bounded `setTimeout`.
- No lockfile or dependency installation changes.
- Nginx already falls back arbitrary SPA paths to `index.html`.
- Existing owner predicates remain mandatory for both integer-ID and key-based reads.
