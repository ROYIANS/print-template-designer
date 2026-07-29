# React Designer functional completion — implementation record

## Result

This slice closes the remaining canvas command loop without reopening visual-design work. The
designer now has a real selection-aware Context Menu, positioned clipboard paste, keyboard context
entry and completed responsive interaction checks. Page mutations and data-source editing remain in
their dedicated downstream tasks.

## Implementation

### Positioned paste

- `EditorStore.pasteAt(left, top)` treats the requested position as the copied selection's visual
  bounding-box top-left in unscaled paper coordinates.
- Multiple copied components keep their relative geometry. Every pasted component id and nested group
  child id is regenerated.
- The complete selection is clamped into each physical paper axis when it can fit. Oversized content
  is translated without distortion.
- One command inserts and selects the complete set through one immutable template update, one host
  `onChange`, one history entry and one-step Undo. A cut clipboard is consumed after successful paste.

### Context menu

- Added `CanvasContextMenu` using the existing `@radix-ui/react-context-menu` dependency and shared
  PTD Portal theme/layer contract.
- Right-clicking an unselected component selects it. Right-clicking a selected member preserves the
  multi-selection. Right-clicking blank paper clears component selection.
- Blank paper exposes Page Properties and clipboard-aware “Paste here”. Component selection exposes
  Properties, copy/cut, lock/unlock, meaningful group/ungroup actions, a four-command layer submenu
  and delete.
- Locked selection keeps inspection, copy and explicit unlock available while destructive and
  structural actions are unavailable. Store command guards remain the second line of defense.
- Opening Properties calls the existing workspace layout command; compact mode opens Inspector and
  closes the mutually exclusive Resource overlay.
- Paper accessibility now includes `aria-label="设计纸张"`, a focus target, native context input,
  `Shift+F10` and the Context Menu key. Radix retains Arrow/Enter/Escape menu behavior.
- Component left-button selection ignores non-primary mouse buttons so right-click does not collapse
  an existing multi-selection before menu target resolution.

## Automated coverage

- Added store tests for multi-selection paste-at-position, relative layout, fresh ids/new selection,
  one `onChange`, one history entry, one-step Undo and physical page clamping.
- Final package suite: 8 test files, 40 tests passed.
- Existing Catalog/Factory coverage verifies complete Schema creation, physical placement clamping,
  auto-selection, one host change, one history entry and Undo.

## Browser acceptance

Verified in the real Web host at 1600×1000, 1366×768 and 1024×768:

- blank-paper and component menus;
- clipboard-empty disabled paste;
- right-click target selection and multi-selection preservation;
- copy, paste at clicked paper position and one-step Undo;
- locked cut/layer/delete disabled states and explicit unlock;
- multi-selection group command and four layer submenu actions;
- compact Inspector opening and Context Menu visibility above its Scrim/panel layer;
- `Shift+F10`, Arrow navigation, Enter activation and Escape dismissal.

The retained browser console buffer contained two earlier Vite HMR reload failures for package
`dist/index.css` and `dist/index.js` at the same timestamp while generated output was being rebuilt.
No application runtime warning/error was produced by the interaction sequence, and all sequential
package/host builds passed afterwards.

### Native HTML5 drag limitation

The browser helper's pointer drag did not generate a complete native HTML5
`dragstart`/`DataTransfer`/`drop` chain, so it could not prove the drag transport itself. The product
continues to use standard `draggable`, `dataTransfer.setData`, Canvas `dragover` and `drop` handlers;
the verified click-creation fallback remains fully accessible. This record intentionally does not
claim synthetic browser drag success. One manual native-drag check should be retained in release QA.

## Final quality gates

- `@ptd/react-designer typecheck`: pass.
- `@ptd/react-designer test`: pass, 8 files / 40 tests.
- `lint:frontend --max-warnings=0`: pass; ESLint emitted its existing React-version detection notice.
- `@ptd/react-designer build`: pass, ESM/CJS/DTS/CSS generated.
- `web typecheck`: pass.
- `web build`: pass; existing `bwip-js` chunk-size warning only.

## Follow-up ownership

1. `05-21-multi-page-support`: add/delete/duplicate/reorder pages through the existing Pages surface.
2. `05-21-datasource-refactor`: edit/import/preview data sources after the server/data contract is
   ready.
