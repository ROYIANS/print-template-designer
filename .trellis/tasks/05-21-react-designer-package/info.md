# PR3 technical design

## Delivery slice

This implementation completes the editor command loop before expanding the PR4 sidebar and ruler
surface. It includes PR1/PR2 stabilization, a production command layer, toolbar, property inspector,
keyboard shortcuts and a runnable web example.

## State ownership

`Designer` creates exactly one `EditorStore` for its lifetime and exposes it through
`EditorStoreContext`. No mutable editor state remains at module scope.

The store owns signals for:

- controlled template mirror;
- current page index;
- ordered selected component ids and primary selection;
- scale and ruler visibility;
- area selection;
- clipboard;
- full-template history and history index.

## Controlled value synchronization

- Commands emit the exact new template object through `onChange`.
- When the parent returns that same object through `value`, synchronization is a no-op so history is
  retained.
- A genuinely external object replaces the store template, resets selection and initializes a new
  history baseline.
- The store always calls the latest callback supplied by the host.

## Mutation and history contract

- Normal commands create one new immutable template and one history entry.
- Pointer gestures use transient updates while moving and call `commitHistory()` once on release.
- Consecutive equal snapshots are deduplicated by object identity at the transaction boundary.
- Undo/redo restore the full template and repair selection if selected ids disappeared.
- History retains at most twenty snapshots.

## Command surface

- selection: select one, select many, clear;
- schema: add, delete, update component, update style;
- history: undo, redo, begin/commit gesture;
- clipboard: copy, cut, paste;
- layer: forward, backward, front, back;
- lock: lock, unlock, toggle;
- geometry: six alignments and horizontal/vertical distribution;
- grouping: group and ungroup;
- page/view: direction, zoom and ruler visibility.

## UI direction

Default direction pending explicit user branding input: a precise, restrained professional
production tool. Use warm ink neutrals, a vermilion action accent, dense but breathable controls,
clear hierarchy and no decorative gradients/glass effects. UI is CSS Modules plus Radix primitives.

The PR3 layout is:

1. compact top toolbar grouped by command domain;
2. central scrollable print canvas;
3. fixed-width right inspector with contextual empty state;
4. bottom status strip for selection, page dimensions and zoom.

## Testing and verification

- Vitest node tests cover the store and pure commands without adding a DOM dependency.
- Existing core/components tests remain green.
- TypeScript, ESLint, package build and the web build must all pass.
- Browser-only pointer behavior receives a runnable example now and DOM interaction tests in the
  follow-up PR4 test harness if a jsdom dependency is explicitly approved.
