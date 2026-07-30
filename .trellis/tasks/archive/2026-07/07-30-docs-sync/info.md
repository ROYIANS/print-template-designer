# Documentation design

## Information architecture

```text
README.md                         project/product overview and fastest valid path
DEVELOPMENT.md                    contributor environment, commands and troubleshooting
DEPLOYMENT.md                     current Web-only GHCR deployment operations
CHANGELOG.md                      v2 Unreleased progress + preserved v1 release history
apps/web/README.md                current host behavior and integration boundary
apps/server/README.md             Server setup, database and HTTP API
packages/core/README.md           framework-agnostic core API
packages/components/README.md     renderer package and runtime contract
packages/react-designer/README.md controlled React editor API and capabilities
packages/export/README.md         explicit scaffold status and planned boundary
.trellis/spec/monorepo/*          implementation authority for agents/contributors
```

## Writing rules

- Chinese is the primary language; code identifiers and short product tagline may remain English.
- Lead with current capability, then label partial/planned work explicitly.
- Commands must be executable from repository root unless a preceding `cd` says otherwise.
- Public documentation must not depend on reading archived Trellis tasks.
- Historical v1 details stay available without being confused with the v2 API.
- Do not add current UI screenshots until a repository-owned, versioned v2 screenshot exists.

## Verification record

Documentation implementation completed on 2026-07-30.

### Facts rechecked against live code

- Root and workspace `package.json` files, package public `src/index.ts` exports and Web host entry.
- The exact `DesignerProps` contract in `packages/react-designer`.
- Server controller routes, request parsers, transaction/version behavior, Prisma schema and defaults.
- GitHub Actions image tags/platform, pull-only Compose, `.env.example` and deployment scripts' public
  contract.
- Recent v2 commits and the last mature Legacy README from Git history.

### Documentation checks

- All relative Markdown and image links in public/current documentation resolve.
- README Designer props match source; Server endpoint and request examples match controller/contracts.
- No positive claims remain for unpublished v2 npm packages, implemented export/PDF, auth, upload,
  data-source proxy or Server Docker deployment.
- Current Markdown files contain no replacement characters, trailing whitespace, missing final LF or
  unbalanced fenced code blocks.
- `git diff --check` passes.
- `python ./.trellis/scripts/task.py validate 07-30-docs-sync` passes: 3 implementation context and
  2 check context entries.

### Environment note

The local `node_modules/.bin/prettier.CMD` is unavailable while the user repairs the interrupted
dependency installation. No dependency install, lockfile change or runtime build/test was triggered
for this documentation-only task. Prettier should be rerun after the local dependency tree is
restored; static Markdown checks above were completed independently.
