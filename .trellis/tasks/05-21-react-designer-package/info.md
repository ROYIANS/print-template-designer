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

## PR4-A UI architecture

PR4-A follows `.trellis/spec/monorepo/ptd-ui-system.md` and the decisions in
`research/pr4-ui-synthesis.md`.

The layout is split into stable product regions:

1. App Bar for product identity, document title and host/document actions.
2. Command Bar for history, clipboard, arrangement, grouping and viewport controls.
3. Left Rail with five Legacy-compatible destinations.
4. One contextual Left Panel; the first complete panel is the component catalog.
5. Canvas viewport as the dominant center surface.
6. Right Inspector reusing the same panel header/body rhythm.
7. Status Bar for selection, page metrics, zoom and edit state.

Component creation uses a pure catalog/factory module. The panel emits a catalog item id; Canvas
converts pointer coordinates into unscaled page coordinates; EditorStore commits the new schema.
Click creation uses the visible paper center as its deterministic fallback. Both paths select the
new component and create one history entry.

Static application styling is tokenized CSS Modules. Dynamic geometry remains CSS custom
properties. Stable `data-ptd-region` attributes are the host customization and browser-test hooks.
Radix Portal content receives the same PTD theme class as the Designer root so tokens and overlay
layers remain valid outside the root DOM subtree.

## PR4-A implementation result

- Added a complete tokenized PTD theme using cool paper, blue graphite, sparse editor-cobalt
  interaction states and proof vermilion. This replaces the warm-brown iteration that felt too retro
  in browser review without returning to an undifferentiated admin-blue wash. The Designer root and
  Tooltip portal share the same theme contract.
- Split product chrome into a 48px App Bar and 44px Command Bar. The 300px brand cell aligns with
  the Rail + Left Panel structure line, and editing/view commands occupy two compact bordered decks.
  Host save/load actions are only
  rendered when real callbacks are supplied; all editor commands use Remix SVG icons and accessible
  labels/tooltips.
- Added the five-destination Legacy-compatible Rail and one contextual panel surface. Components,
  structure, selection summary, data-source summary and global page summary all render real state;
  none are empty placeholder pages.
- Added an 11-item component Catalog/Factory backed by `defaultRegistry`. `RoyGroup` remains a
  command-created type. Click and drag creation share the factory, clamp geometry to paper bounds,
  auto-select the new object and create one history snapshot.
- Added stable `data-ptd-region` hooks for the designer, App Bar, Command Bar, left panels, canvas,
  paper, inspector and status bar.
- Reused the current Legacy PTD Logo as a replaceable image asset without deriving theme colors from
  it. Added Outfit Variable to the Web host; the public font stack is Outfit + Sarasa UI SC with
  Noto Serif SC reserved for serif content. Large CJK font binaries remain a host self-loading concern.
- Combined the Vidorra Blueprint's “structure is decoration” method with Zed-like cool-paper
  precision: sparse cobalt selected-row dot fields, blue-gray hairlines and a light inset physical
  response, without importing either reference's marketing-page ornaments into the workbench.
- Added Workshop/Zed-derived pasteboard framing: a 24px grid, restrained 135° mount texture,
  workbench frame, structural diamond nodes, paper corner nodes and numberless edge ticks. The demo
  Schema now uses cold paper white and blue-graphite content; only proofing semantics remain vermilion.
- Added a portalled single-selection Quick Bar with component name, drag, lock/unlock, duplicate,
  layer-forward and delete. It stays screen-horizontal for rotated components, follows scroll/resize
  through RAF-throttled measurement and clamps or flips within the visible Canvas viewport.
- Responsive browser checks retain the full three-column workspace at 1600px/1366px and collapse
  the contextual left panel to its 48px Rail at 1024px without shrinking the paper schema.

## PR4-A verification

- React Designer strict TypeScript: pass.
- React Designer ESLint: pass with zero warnings.
- Vitest: 24 tests pass, including four Catalog/Factory and add/history tests.
- tsup ESM/CJS/DTS/CSS build: pass; CSS Module mappings remain non-empty.
- Web strict TypeScript and Vite production build: pass. The existing `bwip-js` large-chunk warning
  remains non-blocking.
- Actual Edge screenshots checked at 1600×1000, 1366×768 and 1024×768. The final professional-frame
  references are `ptd-pr4-professional-frame-1600x1000-v2.png`,
  `ptd-pr4-professional-frame-1366x768.png` and `ptd-pr4-professional-frame-1024x768.png`.
  `ptd-pr4-professional-selected-1600x1000-v2.png` verifies the standard Quick Bar and
  `ptd-pr4-professional-selected-rotated-1600x1000.png` verifies the rotated-component overlay.

## PR4-A post-baseline visual correction

- Removed every decorative rotated-square node from the App Bar intersection, workbench frame and
  paper corners. Hairlines now express the layout without symbolic corner ornaments.
- Replaced fixed repeating edge ticks with a real millimetre ruler generated from page dimensions.
  It uses 5mm minor ticks, 10mm major ticks, 20mm labels, exact page endpoints and an explicit `mm`
  unit; landscape direction swaps the physical axes and zoom scales mark positions.
- Connected the ruler to the existing `showRuler` command so disabling it removes the complete tool,
  not merely its labels. Removed the redundant frame around the ruler and paper.
- Added UI-only colored guides: click/drag either ruler to create, drag to move, click to select,
  double-click or Delete to remove, and use arrow keys for 0.1mm (Shift: 1mm) adjustment. Selected
  guides expose a triangular ruler marker and an axis/position label. The View Deck provides cobalt,
  vermilion, emerald and amber colors plus visibility, lock and clear commands.
- Guide state is clamped to the physical page, excluded from `TemplateSchema`, exports and template
  history, and reset on a genuinely external template replacement. Added Store and ruler-mark
  coverage; the suite now has 29 passing tests.
- Browser evidence: `ptd-real-rulers-final-1600x1000.png`, `ptd-real-rulers-hidden-1600x1000.png`,
  `ptd-ruler-guides-final-1600x1000.png`, `ptd-ruler-component-selection-1600x1000.png`,
  `ptd-ruler-guides-final-1024x768-v3.png` and `ptd-ruler-guides-final-landscape-150-v2.png`.
