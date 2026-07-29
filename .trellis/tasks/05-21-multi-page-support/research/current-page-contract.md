# Current multi-page contract and implementation constraints

## Existing schema and UI

- `TemplateSchema.pages` is an ordered `TemplatePage[]`.
- `TemplatePage` currently contains only `id` and `componentData`; PageConfig is shared by the whole
  template, so this task should not invent per-page paper settings or page names.
- `EditorStore.currentPageIndex` is instance-level UI state. `setCurrentPage()` already clears
  selection, component reveal state, guides and area selection without changing template history.
- App Bar, Page Inspector and Status Bar already derive page counters from Store signals.
- The Pages Resource Panel already lists pages and switches current page, but its footer explicitly
  defers structure commands to this task.

## Mutation decisions

- Page switching remains navigation-only.
- Add/duplicate/delete/reorder replace the ordered `pages` array through one Store commit.
- A template must retain at least one page.
- Duplicate must deep-clone component content and regenerate all ids recursively; sharing object
  references or component ids would make later selection and edits ambiguous.
- Reorder should preserve the active page by `page.id`, not by its previous numeric index.
- Undo/redo history stores complete TemplateSchema snapshots but not UI selection. History restore
  should preserve the active id if it still exists and otherwise clamp to the nearest valid index.

## UI decisions

- Reuse the existing Page list and fixed `PanelFooter`; do not add another panel shell or thumbnail
  rendering subsystem.
- Footer actions remain visible and keyboard reachable. HTML5 drag reorder is an efficiency path,
  never the only path.
- Delete is immediate because it is reversible through Undo; disabling delete on the final page is
  clearer than a confirmation dialog.

## Confirmed pagination boundary

The user confirmed a hybrid model on 2026-07-29:

- design pages are created, duplicated, deleted and reordered manually;
- Word-style overflow pagination is not a mutation of the design page list;
- flow-capable components may create derived preview/print pages in a later data/export task;
- generated render pages must not destabilize manual page ids, history or page-specific layout.
