# React Designer Integration Contract

## Scenario: embed and extend `@ptd/react-designer`

### 1. Scope / Trigger

Use this contract whenever code changes the public `<Designer>` component, editor state/history,
component commands, package styles, or a host application consuming the designer.

The designer is React-specific, but its `TemplateSchema` and canvas renderers come from the
framework-agnostic `@ptd/core` and `@ptd/components` packages. This boundary must remain explicit.

### 2. Signatures

Public component:

```ts
interface DesignerProps {
  value: TemplateSchema
  onChange?: (value: TemplateSchema) => void
  onSave?: (value: TemplateSchema) => void
  onLoad?: () => TemplateSchema | Promise<TemplateSchema>
}
```

Internal command boundary:

```ts
class EditorStore {
  syncExternal(template: TemplateSchema): void
  updateComponent(id: string, patch: Partial<ComponentSchema>, transient?: boolean): void
  updateComponentStyle(id: string, patch: Partial<ComponentStyle>, transient?: boolean): void
  beginGesture(): void
  commitGesture(): void
  cancelGesture(): void
  pasteAt(left: number, top: number): void
  setCurrentPage(index: number): void
  addPage(): string
  duplicatePage(index?: number): string | null
  deletePage(index?: number): void
  movePage(fromIndex: number, toIndex: number): void
  undo(): void
  redo(): void
}
```

Host style import:

```ts
import '@ptd/react-designer/styles.css'
```

### 3. Contracts

#### Controlled value

- Each `<Designer>` creates one isolated `EditorStore`; editor signals must never live at module
  scope.
- Commands produce a new immutable `TemplateSchema` and call the latest `onChange` callback.
- When the host returns the exact emitted object as `value`, history is preserved.
- A genuinely external template object creates a new history baseline and clears invalid selection.

#### History and gestures

- History snapshots contain the complete `TemplateSchema`, not only current-page components.
- The initial `value` is snapshot zero, so the first edit is undoable.
- A pointer or form gesture may emit transient updates, but `commitGesture()` adds at most one
  history entry.
- `cancelGesture()` restores the exact gesture-start `TemplateSchema`, emits that restoration through
  `onChange`, preserves valid selection, and adds no history entry.
- A new edit after undo discards the redo branch.
- Locked components reject content, style, geometry and structural commands; changing `isLock` to
  unlock remains allowed.

#### Clipboard placement

- `pasteAt(left, top)` interprets `left/top` as the requested paper-space position of the copied
  selection's visual bounding-box top-left, not as a per-component absolute position.
- A copied multi-selection preserves every component's relative geometry. All pasted ids, including
  ids nested inside groups, are regenerated before insertion.
- If the copied selection can fit on an axis of the physical page, the complete selection is clamped
  into that page axis. A selection larger than the page keeps the requested translation rather than
  being distorted or collapsing its relative layout.
- One paste inserts and selects the complete copied set through one immutable template update, one
  `onChange` emission and one history entry. Pasting a cut clipboard consumes it only after the
  insertion succeeds.

#### Canvas context commands

- Context targeting is resolved before the menu opens: an unselected component becomes the sole
  selection, a component already inside a multi-selection preserves the complete selection, and
  blank paper clears component selection.
- Opening a context menu or opening Properties is UI state only and must not add template history.
- Locked selections may be inspected, copied and explicitly unlocked. Cut, delete, group/ungroup and
  layer mutations must be unavailable in the UI and remain guarded as no-ops in `EditorStore`.
- Blank-paper paste delegates to `pasteAt`; component commands reuse the same store methods as the
  command bar and keyboard shortcuts rather than duplicating mutation logic.
- The paper exposes an accessible name and supports both native pointer context-menu input and
  `Shift+F10` / the Context Menu key. Radix owns roving focus, Arrow navigation, Enter selection and
  Escape dismissal.

#### Manual pages and derived pagination

- `TemplateSchema.pages` is the ordered list of manually designed physical pages. Page switching is
  instance UI navigation: it clears page-local selection/guides/reveal state but does not emit
  `onChange` or create template history.
- Add inserts one blank page after the current page. Duplicate inserts a deep independent copy after
  the source and regenerates the page id plus every component and nested group-child id.
- Delete must never remove the final page. When deleting the current page, select the page now at the
  deleted index or the previous final page when the deleted page was last.
- Reorder is a single immutable `pages` replacement and preserves the active page by `page.id`, not
  by its former numeric index. Add, duplicate, delete and reorder each emit once and create exactly
  one history entry.
- History restore preserves the active page id when it still exists; otherwise it clamps
  `currentPageIndex` into the restored page array and clears stale page-local selection state.
- Automatic overflow pagination is derived preview/print output, not a mutation of the manual page
  list. Future table/list/long-text flow rules must generate ephemeral render pages and must not write
  those pages back into `TemplateSchema.pages`.

#### Package consumption

- `@ptd/react-designer` extracts CSS to `dist/index.css` and exports it as `./styles.css`.
- Its tsup configuration maps `.css` to esbuild's `local-css` loader. tsup's CSS plugin reads the
  generic `.css` loader even when the source filename ends in `.module.css`; configuring only
  `.module.css` silently emits empty JavaScript class maps.
- Every host imports the style subpath explicitly. Do not use runtime style injection: it conflicts
  with CSS Modules, CSP and SSR control.
- Every host declares the designer's peer dependencies (`react`, `react-dom`,
  `@preact/signals-react`) in its own dependencies.
- Build dependency packages before consuming apps. Never run `react-designer` clean/build in
  parallel with a Web build that reads its `dist` directory.

### 4. Validation & Error Matrix

| Condition                                | Required behavior                                           |
| ---------------------------------------- | ----------------------------------------------------------- |
| `value` is the exact last-emitted object | No history reset                                            |
| `value` is a new external object         | Replace template; reset history baseline and selection      |
| First user mutation then undo            | Restore initial `value`                                     |
| Gesture emits many transient updates     | One final history entry                                     |
| Gesture is cancelled                     | Restore the exact gesture-start value; add no history entry |
| Selection contains a locked component    | Destructive/structural command is a no-op                   |
| Context click targets unselected object   | Select that object before rendering component commands      |
| Context click targets selected group item | Preserve the existing multi-selection                       |
| Context click targets blank paper         | Clear selection; expose page properties and positioned paste |
| `pasteAt` receives a multi-selection      | Preserve relative geometry; regenerate every id; one history |
| Switch an existing page                   | Change UI page only; clear local selection; no host/history  |
| Add or duplicate a page                   | Insert after source; select new page; one host/history       |
| Duplicate a page with groups              | Regenerate page, component and recursive child ids           |
| Delete the only page                      | No-op; template always retains at least one manual page       |
| Reorder around the active page            | Preserve active `page.id` and valid component selection       |
| History removes the active page           | Select nearest valid page; never expose an invalid index      |
| Structured `propValue` (array/object)    | Inspector is read-only; never coerce to string              |
| Host omits `styles.css` import           | Integration is invalid; UI styling is not guaranteed        |
| Built CSS Module default export is `{}`  | Invalid package build; host elements receive no class names |
| Host omits a peer dependency             | Workspace/install validation must fail before release       |
| App build overlaps package `clean`       | Invalid verification order; rerun sequentially              |

### 5. Good / Base / Bad Cases

- **Good**: a host declares all peers, imports `styles.css`, stores `onChange` output unchanged, and
  builds after dependency packages.
- **Base**: a single designer edits one page; the first update, undo and redo all preserve schema and
  selection invariants.
- **Bad**: module-global signals make two designers share selection/history; a group array is edited
  through a text area; or Web build runs while tsup is cleaning designer `dist`.

### 6. Tests Required

- Store unit test: two stores do not share template, selection, clipboard or history.
- Store unit test: first mutation undo/redo and redo-branch truncation.
- Store unit test: a committed transient gesture produces one snapshot; a cancelled gesture restores
  the exact starting template without history; locked commands are no-ops.
- Store unit test: `pasteAt` preserves multi-selection geometry, selects fresh ids, emits one host
  change, creates one history entry, undoes as one operation and clamps into physical page bounds.
- Store unit test: add/duplicate/delete/reorder page commands cover fresh recursive ids, final-page
  protection, one host/history mutation, active-page identity and Undo/Redo index repair.
- Geometry unit test: group → scale/rotate/move → ungroup preserves visual geometry.
- Inspector helper test: structured values are read-only; numeric primitive values preserve type.
- Package build assertion: ESM, CJS, DTS and `dist/index.css` exist; ESM/CJS contain non-empty CSS
  Module class maps such as `Designer_designer`.
- Host build assertion: peer dependencies resolve and `@ptd/react-designer/styles.css` imports.
- Browser assertion: right-click target resolution, blank/component command sets, locked disabled
  states, positioned paste + one-step Undo, layer submenu and `Shift+F10` keyboard entry all work.
- Verification ordering: finish the designer package build before starting the host build.

### 7. Wrong vs Correct

#### Wrong

```ts
// Global mutable editor state leaks between Designer instances.
export const templateSignal = signal(defaultTemplate)

// Host relies on package CSS appearing automatically.
import { Designer } from '@ptd/react-designer'
```

#### Correct

```tsx
import { Designer } from '@ptd/react-designer'
import '@ptd/react-designer/styles.css'

function Host() {
  const [template, setTemplate] = useState(initialTemplate)
  return <Designer value={template} onChange={setTemplate} />
}
```
