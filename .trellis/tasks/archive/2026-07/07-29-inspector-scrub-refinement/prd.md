# Inspector scrub and disclosure refinement

## Background

The professional Inspector control system is visually coherent, but rapid numeric tuning still
depends on repeated step-button clicks or exact text entry. The current disclosure model also makes
every major property group collapsible, which can hide high-frequency controls and prevent users
from building stable spatial memory.

## Direction

- Add Photoshop/After Effects-style scrub interaction to numeric property labels while preserving
  exact text entry and step buttons.
- Keep frequent, context-relevant Inspector sections visibly stable; use disclosure only for
  genuinely advanced options.
- Preserve the refined industrial studio aesthetic and the existing Panel shell contract.
- Treat scrub gestures as professional editing gestures: reversible, cancellable and recorded as a
  single history step.

## Scope

1. Add pointer-driven horizontal scrubbing to eligible `NumberInput` labels.
2. Support normal, Shift accelerated and Alt/Option precision adjustment.
3. Support Escape cancellation and one committed history gesture on pointer release.
4. Disable scrub for locked controls; define safe behavior for mixed multi-selection values.
5. Replace all-major-section disclosure with stable section headers for frequent Content, Geometry,
   Typography and basic Appearance controls.
6. Retain disclosure only for advanced stroke/radius controls.
7. Hide Typography for component types that do not use textual style.
8. Keep Page and Multi Inspector concise and directly visible.
9. Preserve stable Inspector hooks and instance-only UI state behavior.

## Out of Scope

- New public Designer APIs or TemplateSchema fields.
- Relative mixed-value multi-selection scrubbing unless the current editor store can support it
  without flattening values.
- Dedicated editors for table, image, barcode or QR-code content.
- Global persistence of Inspector disclosure preferences.

## Acceptance Criteria

- Dragging an eligible numeric label horizontally adjusts its value continuously.
- Shift increases scrub speed; Alt/Option provides precision for fields that allow fractional values.
- Clicking without an effective drag still focuses the numeric input.
- Escape restores the gesture's starting value and does not leave a history entry.
- Pointer release commits exactly one history entry; one Undo restores the pre-scrub value.
- Locked controls have no scrub behavior or scrub cursor.
- Mixed values are never flattened accidentally; scrub is disabled unless relative adjustment is
  explicitly supported.
- Content, Geometry and relevant Typography controls stay visible without disclosure clicks.
- Typography is absent for non-text components.
- Basic appearance colors stay visible; advanced stroke/radius controls use one disclosure area.
- Page and Multi Inspector do not add unnecessary collapsible groups.
- Browser QA passes in wide, standard and compact layouts, including scrub, cancel, Undo, locked,
  mixed and non-text component states.
- React Designer typecheck, tests, frontend lint, package build, Web typecheck/build, static CSS/TS
  scan and `git diff --check` pass.
