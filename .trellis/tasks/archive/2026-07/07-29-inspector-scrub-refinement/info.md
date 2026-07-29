# Inspector scrub and disclosure refinement

## Outcome

- Numeric property labels now support horizontal pointer scrubbing while exact text entry and
  decrement/increment buttons remain available.
- Shift applies a 10× multiplier, Alt/Option applies a 0.1× multiplier, and Escape restores the
  exact gesture-start template without creating history.
- A completed scrub remains one editor gesture and therefore produces at most one Undo snapshot.
- Locked values cannot scrub. Mixed multi-select values keep direct text entry but disable absolute
  scrubbing and step buttons so different source values are not flattened accidentally.
- Page, Single and Multi Inspectors use stable visible sections for frequent properties. Only the
  low-frequency stroke/radius group remains a disclosure.
- Component capability filters hide content, typography, alignment and appearance controls that the
  selected renderer does not use.

## Design rationale

Professional creative tools benefit from stable spatial memory: frequently used controls should not
move behind disclosure affordances as users switch objects. Disclosure is reserved for controls that
are both low-frequency and visually secondary. Numeric scrubbing belongs on the label so it does not
compete with caret placement, selection or exact keyboard entry inside the field.

Relative scrubbing for mixed values is intentionally deferred. The current safe contract requires an
explicit replacement value for mixed selections; applying one absolute scrub origin would destroy the
differences between selected objects.

## Verification

- `@ptd/react-designer` typecheck passed.
- React Designer tests passed: 8 files, 38 tests.
- Frontend ESLint passed with zero warnings from project code.
- `@ptd/react-designer` production package build passed, including ESM, CJS, DTS and CSS output.
- Web host typecheck and production build passed.
- Browser QA passed at 1600×1000, 1366×768 and 1024×768 for Page, text, non-text, locked and mixed
  multi-selection states. Standard mode remained docked; compact mode exposed a reachable overlay
  Inspector and fixed footer.
- Browser interaction verified normal, Shift and Alt/Option scrub deltas plus Escape restoration.
  Pointer-release history behavior is covered by store unit tests because the browser automation drag
  helper does not emit a reliable captured `pointerup` in this environment.
- Browser console reported no warnings or errors.
- Static diff scan found no new `!important`, `as any`, `@ts-ignore`, raw numeric `z-index` or
  non-variable inline layout styles. `git diff --check` passed.

The Web production build retains its existing Rollup large-chunk advisory for `bwip-js`; it is
unrelated to this Inspector change and does not fail the build.
