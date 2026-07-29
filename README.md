<div align='center'>
<h1>print-template-designer</h1>
<p>A framework-agnostic print template designer — embed in any stack or deploy as a standalone Docker app.</p>
</div>

> **Status**: Active rewrite (v2). Legacy Vue 2 source is preserved in [`legacy/`](./legacy/).

---

## Architecture

This project is a **pnpm monorepo** with a layered architecture:

```
packages/
  core/           @ptd/core           Framework-agnostic rendering engine & schema (TypeScript)
  components/     @ptd/components     Canvas components (pure TS DOM + Preact Signals + CSS Variables)
  react-designer/ @ptd/react-designer React designer UI (Radix UI + CSS Modules)
  export/         @ptd/export         PDF & Word export utilities

apps/
  web/            Full designer web app (React + Vite)
  server/         Backend API (NestJS + Prisma + SQLite)

docker/           Frontend image and Nginx configuration
docker-compose.yml Pull-only frontend deployment entrypoint
legacy/           Original Vue 2 source — preserved for reference
```

### Integration options

| Scenario               | How                                                          |
| ---------------------- | ------------------------------------------------------------ |
| Embed in React app     | `npm install @ptd/react-designer`                            |
| Embed in Vue / vanilla | `npm install @ptd/core @ptd/components` (framework-agnostic) |
| Standalone deployment  | GHCR + Docker Compose — `./deploy.sh`                        |

---

## Getting Started

**Prerequisites**: Node ≥ 20, pnpm 10.15.1 (via Corepack)

```bash
# Install all workspace dependencies
pnpm install

# Start the designer app (dev)
pnpm --filter web dev

# Start the backend (dev)
pnpm --filter server start:dev

# Build all packages
pnpm build
```

---

## Packages

### `@ptd/core`

Framework-agnostic rendering engine. Handles schema definition, serialization/deserialization, data binding, and auto-pagination logic.

### `@ptd/components`

Canvas component implementations using pure TypeScript DOM + [Preact Signals](https://preactjs.com/guide/v10/signals/) for reactivity and CSS Custom Properties for dynamic styling. Zero framework runtime dependency.

Components: Text, SimpleText, Table (Simple + Complex), Line, Rect, Circle, Star, Image, QRCode, BarCode, Group.

### `@ptd/react-designer`

React wrapper for the full designer UI. Uses [Radix UI Primitives](https://www.radix-ui.com/) for accessible panels, dialogs and menus.

```tsx
import { Designer } from '@ptd/react-designer'

function App() {
  return (
    <Designer
      onSave={(template) => myApi.save(template)}
      onLoad={() => myApi.load()}
      onExport={(format) => myApi.export(format)}
      onDataSource={() => myApi.getFields()}
    />
  )
}
```

### `@ptd/export`

Server-side and client-side export utilities. Puppeteer-based PDF (high quality) with html2canvas fallback. Word export support planned.

---

## Backend (`apps/server`)

NestJS + Prisma backend. Responsibilities:

- Template CRUD + version snapshots
- Static asset upload
- Server-side PDF export (Puppeteer)
- Data source proxy (prevents CORS / credential exposure)
- Minimal auth for standalone deployment

Default database: SQLite (zero-config). Switch to PostgreSQL by changing one line in `prisma/schema.prisma`.

---

## Docker

The frontend image is built by GitHub Actions and published to GHCR. A deployment server only
needs Git and Docker Compose v2; it does not need Node.js or pnpm.

```bash
git clone https://github.com/ROYIANS/print-template-designer.git
cd print-template-designer
./deploy.sh
```

The default URL is `http://localhost:8080`. On Windows Server, use `./deploy.ps1` from
PowerShell 7. See [DEPLOYMENT.md](./DEPLOYMENT.md) for branch previews, private GHCR packages,
updates, immutable version pins and rollback.

---

## Roadmap

**MVP (in progress)**

- [x] Monorepo scaffold
- [ ] `@ptd/core` rendering engine migration
- [ ] `@ptd/components` canvas component migration
- [ ] `@ptd/react-designer` new UI layout
- [ ] Multi-page visual management
- [ ] Data source refactor (Excel / REST API direct connect + live preview)
- [ ] Server-side Puppeteer PDF
- [ ] Template CRUD + version management
- [ ] Integration hooks (`onSave` / `onLoad` / `onExport` / `onDataSource`)
- [x] Frontend Docker / GHCR deployment

**Planned**

- Batch print API
- MySQL / database direct connect
- Word export
- More components (charts, signature, conditional display)
- Multi-language / font management

---

## Legacy (v1)

The original Vue 2 component library source is preserved in [`legacy/`](./legacy/) for reference. It is not maintained.

v1 npm package: [print-template-designer on npm](https://www.npmjs.com/package/print-template-designer)

---

## References

- [report-designer](https://github.com/xinglie/report-designer)
- [printer-editor](https://github.com/xinglie/printer-editor)
- [visual-drag-demo](https://github.com/woai3c/visual-drag-demo)

[![Star History Chart](https://api.star-history.com/svg?repos=ROYIANS/print-template-designer&type=Date)](https://star-history.com/#ROYIANS/print-template-designer&Date)
