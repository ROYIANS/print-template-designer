# Milestone B — Editorial Composition

## Goal

Add the first editorial-composition capability: deterministic in-frame columns for `RoySimpleText` and `RoyText`.
One semantic text component should flow through a bounded 1–6 column frame in Designer proof, Web preview and Server
Chromium output, while preserving component identity, controlled history and the Milestone A overflow/preflight
contract.

## What I already know

- Milestone A is committed and archived. `@ptd/core` now owns `ComponentStyle.whiteSpace`, text normalization and
  output diagnostic contracts; `@ptd/export` owns the single browser preflight and `TEXT_OVERFLOW` measurement.
- `@ptd/components` injects shared CSS through CSS custom properties and renders both text component types through the
  same output DOM path used by proof and Chromium.
- `@ptd/react-designer` exposes geometry and typography controls through `PropertyInspector.tsx`; component style
  edits use `beginGesture` / `commitGesture` so one user interaction becomes one history entry.
- `RoySimpleText` renders a fixed `.ptd-simple-text__inner`; `RoyText` renders a fixed `.ptd-text__inner`. Both frames
  currently hide overflow and rely on preflight to report it.
- The roadmap defines `columnCount`, `columnGap`, `columnFill`, optional column rules and an explicit future
  `overflowPolicy`; cross-page linked text flow remains a later Milestone D capability.

## Decision

The first delivery is **B1: in-frame columns only**. It includes `columnCount`, `columnGap` and `columnFill` for
plain/rich text, shared rendering and Inspector controls, plus overflow and real Chromium coverage. Named typography
styles, paragraph spacing and keep-with-next are deferred to B2 so the first new layout mode stays compatible with the
recently stabilized serialization, history and preflight contracts.

## Assumptions

- This first slice uses CSS multi-column layout inside the existing fixed frame; it does not create persisted child
  components or output fragments for individual columns.
- `columnCount` defaults to `1`, `columnGap` defaults to `24px`, and `columnFill` defaults to `auto`, matching the
  roadmap's proposed contract.
- A column configuration is valid for both plain and rich text, but the plain-text `whiteSpace` mode remains the
  persisted source of truth for line-break behavior.

## Open Questions

- None for B1. B2 scope remains intentionally deferred until the B1 vertical slice is verified.

## Requirements (evolving)

- Add validated, version-compatible `columnCount`, `columnGap` and `columnFill` style fields.
- Apply the same column CSS variables and layout declarations in Components, Designer proof, Web preview and Server
  output DOM.
- Keep one component ID, one semantic content value, one controlled mutation and one undo/redo entry when changing
  column settings.
- Preserve deterministic reading order: `columnFill: auto` flows top-to-bottom in the first column, then proceeds
  left-to-right; `balance` is available for short callouts.
- Ensure a final-column overflow remains a `TEXT_OVERFLOW` error under the existing default behavior.
- Expose column controls for both text component types in the Property Inspector with bounded values and disabled
  controls when the selected component is not text.
- Add Core, Components, React Designer, Export and real Chromium regression coverage for valid values, invalid values,
  layout declarations, history behavior, parity and overflow.

## Implementation Plan

1. Extend the Core style contract, validation and serialization round-trip tests.
2. Add shared Components CSS variables and multi-column declarations for both text renderers.
3. Add Property Inspector controls with one gesture/history mutation and React Designer regression tests.
4. Verify Export/Web/Server parity, overflow diagnostics and real Chromium fitting/overflow smoke.
5. Update the nearest README/spec contract and run the full quality gate.

## Acceptance Criteria (evolving)

- [x] Core accepts `columnCount` integers from 1–6, finite non-negative `columnGap`, and `columnFill` values `auto` or
      `balance`; invalid values are rejected or normalized at the canonical boundary.
- [x] A plain-text and a rich-text component with two columns preserve one component ID and render deterministic
      column declarations in proof and output DOM.
- [x] `columnFill: auto` has sequential reading order and `columnFill: balance` is explicitly represented in CSS.
- [x] Changing column settings is one controlled history gesture and survives serialize/deserialize round-trip.
- [x] Content exceeding the final column produces `TEXT_OVERFLOW` with the existing source component/page identity.
- [x] Web and Server use the same renderer/preflight path; no second column implementation is introduced in Server.
- [x] Core/Components/Export/React Designer/Web/Server tests, typecheck, lint and build remain green.
- [x] A real Chromium smoke covers a fitting two-column Chinese fixture and an overflowing final-column fixture.

## Definition of Done (team quality bar)

- Persisted style contract is validated, serialized without mutating unrelated fields and documented.
- Designer edit, proof, Web preview and Server PDF use the same column behavior.
- Tests cover normal, boundary and failure paths, including history and overflow diagnostics.
- Lint, typecheck, build, unit tests and real Chromium smoke pass.
- No Docker work is included in this milestone execution on the current machine.

## Out of Scope

- Linked text frames or automatic cross-page text flow.
- New pages generated from text overflow.
- Named paragraph/character style definitions.
- First-line indent, paragraph spacing, keep-with-next, widow/orphan controls.
- Image focal point/effective DPI, charts, layout frames and unit-number formatting.
- Arbitrary HTML/CSS column configuration or third-party layout libraries.

## Technical Notes

- Primary files inspected: `packages/core/src/types/component-schema.ts`, `packages/core/src/schema-validation.ts`,
  `packages/core/src/serialization/index.ts`, `packages/components/src/base/css-variables.ts`,
  `packages/components/src/base/stylesheet.ts`, `packages/components/src/components/RoySimpleText.ts`,
  `packages/components/src/components/RoyText.ts`, `packages/react-designer/src/components/PropertyInspector/PropertyInspector.tsx`,
  `packages/react-designer/src/state/*`, `packages/export/src/preflight.ts`, `packages/export/src/textOverflow.ts`.
- Authoritative contracts: `.trellis/spec/monorepo/output-architecture.md`,
  `.trellis/spec/monorepo/react-designer-contract.md`, `.trellis/spec/monorepo/print-composition-capability-roadmap.md`.
- Milestone A validation: `.trellis/tasks/archive/2026-08/08-07-output-correctness-milestone-a/validation.md`.
