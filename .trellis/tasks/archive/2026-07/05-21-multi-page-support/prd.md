# Multi-page visual management

## Background

`TemplateSchema.pages` and page switching already exist, and the current Pages Resource Panel shows
real page/object counts. It intentionally stops at a read-only message because add, duplicate,
delete and reorder were deferred from the React Designer package-completion task.

This task completes that page-structure loop inside the existing canvas-first workspace. It must not
reopen the finished visual-refinement phase or add data-source/server concerns.

## Direction

- Follow a professional document-tool model: a compact ordered page list, explicit current-page
  state, direct creation/duplication/deletion and drag reordering with visible button alternatives.
- Keep all page mutations in `EditorStore`; the Pages panel is a command surface, not a second state
  owner.
- Treat page switching as UI navigation, while page structure mutations are controlled template
  edits with one host change and one Undo history entry.
- Preserve the current page by page identity when reordering or restoring history whenever possible.
- Use a hybrid pagination model confirmed with the user: `TemplateSchema.pages` contains stable,
  manually managed design pages; data overflow may create ephemeral preview/print pages later, but
  runtime-generated pages must not be written back into this manual page list.

## Scope

1. Add Store commands to create a blank page, duplicate a page, delete a page and move a page.
2. New pages are inserted after the current page and become current.
3. Duplicated pages are inserted after the source, become current and regenerate the page id plus all
   component ids, including nested group children.
4. Deleting the final remaining page is prohibited. Deleting any other page selects the nearest
   surviving page and clears page-local UI state.
5. Reordering preserves the identity of the current page and records exactly one template history
   entry.
6. Undo/redo and external template synchronization always clamp or repair `currentPageIndex`; they
   must never leave the designer pointing to a missing page.
7. Upgrade the existing Pages panel with:
   - a compact ordered list with page number and object count;
   - current-page selection;
   - Add, Duplicate, Move Up, Move Down and Delete actions;
   - HTML5 drag reorder;
   - visible keyboard/click alternatives for every drag action.
8. Keep App Bar, Page Inspector and Status Bar page counters synchronized through Store signals.
9. Add unit coverage for command output, ids, current page, history, `onChange`, last-page guard,
   reorder and Undo/Redo repair.
10. Run wide/standard/compact browser acceptance and the normal React Designer/Web quality gates.

## Out of scope

- Per-page paper size, margins, orientation or other PageConfig overrides; PageConfig remains shared
  by the current schema.
- Page naming, master pages, spreads, sections or page-number formatting.
- Cross-document clipboard and native operating-system clipboard integration.
- Data-source editing, record-driven pagination, print pagination and export rendering changes.
- A new thumbnail renderer or further visual redesign of the workspace.

## Product decision: manual design pages, automatic render pages

- PTD is closer to InDesign/report designers than to Word: each design page is an explicit physical
  coordinate system for fixed components, while only flow-capable content such as tables, lists and
  long text should generate overflow pages.
- Manual pages cover structurally distinct layouts such as cover, body, signature and reverse side.
- Future automatic pagination belongs to data preview/export. Generated pages are derived output,
  remain read-only by default and are not persisted as individual `TemplatePage` records.
- Future flow settings may include clip/continue/repeat-per-record policies and repeating table
  headers or page chrome, but they require their own schema and rendering contract.

## Acceptance criteria

- Add creates one blank page after the current page, selects it, emits one `onChange` and creates one
  history entry.
- Duplicate produces an independent deep copy with a fresh page id and fresh component/group-child
  ids, then selects the new page.
- Delete never allows `pages` to become empty; deleting the current page selects a deterministic
  nearest survivor.
- Move Up/Down and drag reorder produce the same ordered Schema result and preserve the active page
  by id.
- Page switching alone creates no template mutation, host change or history entry.
- Every structural action is undoable/redoable without an invalid current-page index or stale
  component selection.
- All drag behavior has a visible button alternative and accessible names/focus states.
- Pages panel retains one main scroll area and a fixed action footer in wide, standard and compact
  layouts.
- React Designer typecheck/tests/lint/build and Web typecheck/build pass sequentially.
- Browser QA covers add, duplicate, reorder, delete, Undo/Redo and compact overlay behavior with no
  application runtime error.

## Completion boundary

After this task, the editor owns complete manual page structure management. Record-driven pagination
and print/export behavior remain in their existing data/export tasks.
