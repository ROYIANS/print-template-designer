# PR1/PR2 stabilization audit

## High-risk findings

1. `ComponentAdjuster` builds `pointList` on every render, then an effect synchronously calls
   `setCursors`. ESLint reports `react-hooks/set-state-in-effect`; the dependency chain can also
   cause repeated renders. Cursor values should be derived, not stored in React state.
2. `Designer` copies the controlled value into a module-global signal. Multiple designer instances
   therefore share template, selection, zoom, clipboard and history.
3. History is not initialized when the controlled value is received. The first operation records
   only the post-operation state and cannot be undone.
4. History stores only the current page's component array. Page configuration and future multi-page
   mutations cannot be undone atomically.
5. Drag/resize/rotate call `onChange` on every pointer movement and separately record a snapshot on
   mouseup. This needs an explicit transaction boundary so one gesture equals one history entry.
6. Rotation is applied by both `ComponentAdjuster` and the nested `@ptd/components` instance. The
   designer wrapper should own positioning and rotation; the renderer must suppress the nested
   transform.
7. Document-level mouse listeners are removed on mouseup but not when a component unmounts during a
   gesture. A reusable pointer-session cleanup is desirable; the initial refactor must at least keep
   cleanup functions in refs and run them on unmount.
8. The React designer has no tests despite owning the highest-risk geometry and editor state.

## Stabilization architecture

- Create one `EditorStore` per `<Designer>` and provide it with React Context.
- Store only ids for selection; derive component objects from the current template.
- Store full `TemplateSchema` history initialized with the first controlled value.
- Expose immutable commands for component/style updates, selection, clipboard, layer, alignment,
  grouping, history, page direction and zoom.
- Support transient mutations during pointer gestures and commit the final template once per
  gesture to history.
- Keep the public API controlled: external values replace the store when they are not the exact
  object last emitted by the store.

## Required tests

- first mutation can be undone and redone;
- redo is discarded after undo plus a new mutation;
- history cap is enforced;
- two stores do not share state;
- immutable update does not mutate the caller's template;
- copy/cut/paste regenerates ids and offsets positions;
- layer operations preserve relative order;
- alignment/distribution geometry is correct;
- group/ungroup round-trips child positions;
- locked components cannot be transformed by pointer commands;
- pure resize/rotation geometry remains covered separately.
