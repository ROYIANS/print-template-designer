# Mobile menu and density audit

## Evidence

- Real-device screenshot shows a roughly 390px CSS viewport with Header hamburger/account controls and
  first-row Toolbar buttons visually filling almost the complete row height.
- App Bar currently uses React mouse events for automatic open/close. Mobile browsers synthesize these
  around touch interactions, so `mouseleave`, brand/action `mouseenter`, or blur may close a menu that
  was just opened by touch.
- Coarse-pointer CSS globally raises App Bar, Toolbar and Dock controls to 40px. That is appropriate on
  larger touch hardware but too visually heavy inside 42px/40px Chrome rows on phone-width containers.

## Intended correction

- Gate automatic disclosure and close behavior by PointerEvent `pointerType === "mouse"`.
- Keep touch disclosure explicit: hamburger toggle, category selection without close, command selection
  or Escape to close.
- Add a phone-width container override after coarse-pointer rules so visual controls become about 32px
  with 15–16px glyphs while retaining clear spacing and focus states.

## Implementation

- `AppBar.tsx` records the latest Pointer/keyboard modality. Automatic enter/leave and brand/action
  close paths only accept a real mouse Pointer; blur does not auto-close a menu opened by Touch/Pen.
- Mobile categories only replace the active command collection. Hamburger/close, a command preview,
  or Escape closes the disclosure; preview commands announce that their business behavior is pending.
- Phone-width container queries override the broader coarse-pointer rules after them:
  - App Bar first track: 38px; primary controls: 32×32; glyphs: 15px.
  - Context Bar: 36px token plus its 1px boundary; buttons: 32×32; glyphs: 15px.
  - Tool Dock: 36px; primary controls: 32×32; glyphs: 15px.
- The larger coarse-pointer contract remains 40×40 at 640px and other non-phone widths.

## Verification

- React Designer TypeScript and ESLint: passed with zero errors/warnings.
- Vitest: 10 files and 64 tests passed.
- React Designer production build: passed.
- Web TypeScript and production build: passed. The existing `bwip-js` chunk-size warning remains
  unrelated to this task.
- Browser/CDP checks:
  - 390×844 coarse-pointer: Header 38px, hamburger 32×32, Toolbar buttons 32×32, Dock 36px with
    32×32 buttons; no Header wrap, clipping, or edge contact.
  - 480×900 boundary: compact dimensions remain active and unclipped.
  - 640×900 coarse-pointer: 40×40 controls remain active.
  - Touch-synthesized pointer enter/leave does not close the opened menu; category selection keeps it
    open; command, hamburger, and Escape close it.
  - 1600×1000 fine-pointer: mouse Hover opens and mouse leave closes after the 120ms delay.
- Visual captures were inspected for 390×844 closed/open, 480×900, 640×900, and 1600×1000 layouts.

## Follow-up: coarse-pointer cascade hardening

- A real-host DevTools capture showed the 40×40 coarse-pointer declaration still winning because the
  phone-width container query did not enter the matched-rule set in that embedding/debug layout.
- The compact contract now keeps the component-level `@container` behavior and adds a top-level phone
  fallback: `(pointer: coarse) and (max-width: 480px)`.
- Fallback control selectors include their owning region (`.toolbar .toolButton`, `.topBar ...`,
  `.toolDock ...`), giving them higher specificity than the generic 40px coarse-pointer declaration.
  The result does not depend on CSS bundler ordering and does not require `!important`.
- Production CSS and a 378×762 emulated coarse-pointer viewport were rechecked: all three media
  conditions matched, Toolbar buttons computed to 32×32px, the App Bar track to 38px with 32×32px
  controls, and the Tool Dock to 36px with 32×32px controls.
