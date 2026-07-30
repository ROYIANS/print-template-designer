# UI surface and dock audit

## Header extension

- The task now also includes the user-requested App Bar reconstruction based on
  `D:\Code\Study\chemviz\apps\web\src\App.tsx` and its desktop navigation CSS.
- The ChemViz material contract is retained, while PTD density feedback reduced the bar to 42px and
  the lower corners to 14px. The 16px backdrop blur, soft 10×28 shadow, 120ms delayed close, and
  340ms exponential disclosure motion remain.
- PTD keeps its existing brand plus real load/save actions. Repeated document identity and page
  metadata were removed after visual review because Context Bar, Inspector and Status Bar already own
  that information. A future account placeholder remains at the right edge.
- The expanded area is an application-menu preview with File/Edit/Object/View/Window/Help
  categories, command descriptions and shortcuts. Category switching is functional; command actions
  deliberately remain unimplemented in this iteration.
- The App Bar participates in the Designer grid's intrinsic first row so expansion pushes the Context
  Bar and workspace downward instead of covering them.
- Menus now sit directly after the brand and use Windows-style mnemonics (`文件(F)` through `帮助(H)`)
  with access-key semantics. Only a concrete menu hover/focus/click opens the panel; brand, document,
  actions and the future account entry close it instead of triggering it.
- At narrow Designer container widths the six desktop labels collapse into a hamburger trigger. The
  expanded panel exposes a horizontally scrollable category strip and keeps document actions/account
  affordances reachable as compact icons.

## Current findings

- `--ptd-surface-panel` is `paper-1` while `--ptd-surface-sunken` is the substantially darker
  `paper-3`; repeated use across the entire Chrome accumulates into a muted gray atmosphere.
- App Bar is already an effective dark anchor and should remain unchanged.
- Canvas uses a deliberately darker pasteboard surface and must remain distinct from both Panel and
  Paper.
- Desktop DockButton is 40×40 with a 20px icon. Tool pressed state adds two inset edges; Panel
  pressed state grows to 46px, uses negative margin and draws three inset edges.
- The project design context calls for a precise, lightweight professional workbench for report
  developers/designers, not a generic gray admin shell.
- The status-bar zoom control currently uses one enclosing border plus two fixed separators. In the
  actual screenshot it reads as a legacy form field and is much heavier than the surrounding status
  information; individual hover/focus surfaces are sufficient.

## Verification record

### Implemented

- Remapped application surfaces so Panel uses `paper-0`, App frame uses `paper-1`, and local sunken
  states use the lighter `paper-2`; App Bar and Canvas/Pasteboard remain unchanged anchors.
- Reduced desktop Tool Dock from 52px to 42px, DockButton from 40px to 30px, and icons from 20px to
  16px. Coarse pointer buttons remain 40px.
- Replaced Tool/Panel pressed inset borders, width growth and negative margin with stable-size neutral
  surfaces and short edge markers on different sides.
- Removed the Status Bar zoom group's enclosing border and separators; individual actions retain
  hover and focus feedback.
- Updated the authoritative PTD UI contract with the new surface, Dock and zoom rules.

### Automated verification

- React Designer TypeScript: passed.
- React Designer Vitest: 10 files, 64 tests passed.
- React Designer ESLint (`--max-warnings=0`): passed after rerunning outside the sandbox because pnpm
  virtual-store reads initially returned `EPERM`.
- React Designer tsup ESM/CJS/CSS/DTS build: passed.
- Web TypeScript + Vite production build: passed after rerunning outside the sandbox because Vite
  could not unlink an ignored `dist` asset inside the sandbox. Existing `bwip-js` chunk-size warning
  remains unrelated to this CSS task.
- Prettier and `git diff --check`: passed.

### Visual verification

Headless Edge screenshots were inspected at the UI contract sizes:

- 1600×1000: wide mode shows Resource Panel and Inspector simultaneously; near-white Chrome remains
  distinct from gray Pasteboard and Paper.
- 1366×768: standard mode keeps the compact Dock and collapsed Resource Panel without layout gaps.
- 1024×768: compact mode preserves Canvas reachability and both overlay entry points.
- Dock Tool and Panel markers remain legible without heavy frames; Status Bar zoom remains discoverable
  after removing the group border.

Header browser inspection was repeated after the user-feedback refinements:

- Desktop collapsed (1600×1000): the 42px bar keeps all six left-aligned mnemonic menus and the
  right-edge account placeholder fully visible without repeating document metadata.
- Desktop expanded: Header bottom is 170px, Application Menu runs from 42–169px, and Context Bar starts
  at 170px. This proves the menu participates in layout and pushes the workbench instead of overlaying it.
- Hovering a concrete desktop category opens it; brand, document, actions and account call the close path.
- Compact 640×900: desktop labels are replaced by hamburger/close and account controls. The expanded
  panel exposes all categories in a horizontal strip; commands begin at the left scroll origin rather
  than being clipped by centered overflow. Header bottom and Context Bar top both equal 206px.
- If the operating system disables animation, the browser reports `prefers-reduced-motion: reduce` and
  the intentional accessibility override removes the grid/translate transitions.
- The application-menu heading/preview row and visible Tool Dock zone labels were removed as redundant
  chrome. Their semantics remain in menu `aria-label`s and Dock `role="group"`/`aria-label` attributes.

Screenshots are available in the current Codex visualization directory as
`ptd-surface-1600x1000.png`, `ptd-surface-1366x768.png`, `ptd-surface-1024x768.png`,
`ptd-header-collapsed-1600x1000.png`, `ptd-header-expanded-1600x1000.png`, and
`ptd-header-mobile-expanded-640x900.png`.

No dependency or lockfile changes were made.
