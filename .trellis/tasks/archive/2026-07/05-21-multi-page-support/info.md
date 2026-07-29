# Multi-page visual management — implementation record

## Product model

The user confirmed a hybrid pagination model:

- design pages are explicit, stable `TemplateSchema.pages` managed manually;
- automatic overflow pagination belongs to later data preview/print/export rendering;
- runtime-generated pages are derived, read-only output and are not persisted into the manual page
  list or template history.

This keeps fixed layouts such as cover/body/signature/reverse-side deterministic while leaving room
for tables, lists and long text to generate render pages through a future flow contract.

## EditorStore commands

- `addPage()` inserts a blank page after the current page, switches to it and commits once.
- `duplicatePage(index?)` deep-copies the source after it, regenerating the page id, every component
  id and recursive group-child id before switching to the copy.
- `deletePage(index?)` rejects deletion of the final page. Deleting the current page selects the page
  now at that index, or the new final page when deleting the previous final page.
- `movePage(fromIndex, toIndex)` replaces the ordered page array once and keeps the current page by
  `page.id`.
- Page switching remains UI-only and resets selection, reveal requests, guides and area selection
  without host change/history.
- Page-aware commit/history restore repairs `currentPageIndex` by preferred page id and clamps when
  that page no longer exists. Existing selection is preserved across reorder/Undo when its active
  page still exists.

## Pages panel

- Reused the existing Pages Resource Panel, page rows and fixed Panel Footer.
- Rows display an ordered page number, object count, current-page selection and drag affordance.
- Footer provides five real commands: Add, Duplicate, Move Up, Move Down and Delete.
- All icon actions have accessible names, Radix Tooltips, focus-visible and disabled states. Delete
  is disabled on the last page; move buttons disable at their respective boundaries.
- Native HTML5 drag reorder uses a PTD page MIME payload. Move Up/Down remain visible, complete click
  and keyboard alternatives, so drag is never the only path.
- The Sidebar Tooltip Provider now covers both Tool Dock and Resource Panel. Browser QA found the
  original provider boundary before completion; lifting it prevents Page Action Tooltip context
  failures and also gives future resource-panel tooltips the correct shared context.

## Automated verification

- Added Store tests for blank-page insertion, one host/history mutation, page-local UI reset and
  Undo/Redo validity.
- Added duplicate tests covering deep copies and recursive fresh group-child ids.
- Added delete tests covering deterministic nearest-page selection, Undo identity preservation and
  final-page protection.
- Added reorder tests covering active page id, component selection, one host/history mutation and
  Undo index repair.
- Final suite: 8 test files, 44 tests passed.

## Browser acceptance

Verified in the real Web host at 1600×1000, 1366×768 and 1024×768:

- Pages panel layout and fixed five-action footer;
- final-page delete/up/down disabled states;
- add blank page and synchronized App Bar/Status Bar count;
- duplicate populated page and preserve object count;
- move down/up while keeping the duplicated page active;
- delete, Undo and Redo while preserving the surviving page by identity;
- compact overlay opening and Escape dismissal;
- post-fix console buffer contained no new error or warning.

The browser helper again could not synthesize the complete native HTML5
`dragstart`/`DataTransfer`/`drop` chain. The standards-based transport remains implemented and is not
replaced with test-specific event synthesis. Reordering was fully verified through the Store and
the visible Move Up/Down UI path; release QA should retain one manual native-drag check.

## Final quality gates

- `@ptd/react-designer typecheck`: pass.
- `@ptd/react-designer test`: pass, 8 files / 44 tests.
- `lint:frontend --max-warnings=0`: pass; existing React-version detection notice only.
- `@ptd/react-designer build`: pass, ESM/CJS/DTS/CSS generated.
- `web typecheck`: pass.
- `web build`: pass; existing `bwip-js` chunk-size warning only.

## Follow-up boundary

Automatic flow pagination should be planned with data preview/export, including overflow policies,
repeating headers/footers, record repetition and derived-page preview. It must not overload the
manual page commands delivered here.
