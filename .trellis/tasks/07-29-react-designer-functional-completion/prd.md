# React Designer functional completion

## Background

The React Designer package has a stable canvas-first workspace and a refined Inspector, but its
parent PRD still has two unverified functional acceptance points: asset drag/drop and the canvas
context menu. The older PR4-B wording also predates the current workspace architecture: page/global
information now belongs to Page Inspector, component properties belong to the right Inspector, and
page mutations plus data binding have dedicated downstream tasks.

This task closes the remaining editor interaction loop without reopening the visual-design phase.

## Direction

- Implement a real, selection-aware canvas context menu using the already installed Radix primitive.
- Reuse `EditorStore` commands; menu actions must not create parallel mutation logic.
- Preserve professional editing semantics: right-click selects the intended object, locked objects
  expose only safe commands, paste can use the clicked paper position, and each mutation creates one
  history entry.
- Complete actual browser acceptance for catalog drag/drop and context-menu actions.
- Reconcile the parent PR4-B/PR4-C plan with the current architecture and hand off page/data features
  to their existing tasks.

## Scope

1. Add a Context Menu layer on the paper using `@radix-ui/react-context-menu` and the shared PTD
   Portal theme/layer contract.
2. Resolve the context target before opening:
   - right-clicking an unselected component selects it;
   - right-clicking a member of a multi-selection preserves that selection;
   - right-clicking blank paper clears component selection and exposes canvas commands.
3. Component selection commands:
   - open/focus Properties;
   - copy and cut;
   - delete;
   - lock, or unlock when the selection contains locked objects;
   - move forward/backward and bring to front/send to back;
   - group or ungroup when the current selection makes the command meaningful.
4. Blank-paper commands:
   - open Page Properties;
   - paste at the clicked paper position when clipboard content exists.
5. Add an editor-store paste-at-position command that preserves the relative geometry of copied
   multi-selections, regenerates ids, selects the pasted objects and records one history entry.
6. Keep context-menu availability and disabled states consistent with locked selection, clipboard,
   selection count and component type.
7. Verify catalog drag/drop creates one component at the dropped paper position, selects it, emits
   one final `onChange` and creates one Undo history entry.
8. Run wide/standard/compact browser acceptance plus keyboard/menu focus and console checks.
9. Update the React Designer parent PRD so the obsolete duplicate-panel interpretation of PR4-B is
   removed and downstream ownership is explicit.

## Out of Scope

- Further color, typography, spacing or Inspector visual redesign.
- Page add/delete/duplicate/reorder; owned by `05-21-multi-page-support`.
- Editing, importing or previewing data sources; owned by `05-21-datasource-refactor`.
- Table-cell-specific row/column context menus.
- New public persistence or server integration hooks.
- Native operating-system clipboard integration.

## Acceptance Criteria

- The browser's default context menu never appears over the paper.
- Right-click target resolution follows the single-, multi- and blank-paper rules above.
- Every visible menu item invokes an existing editor command or the new documented paste-at-position
  command; no decorative or nonfunctional item is rendered.
- Locked selections cannot be cut, deleted, grouped or reordered and provide an explicit unlock
  action.
- Paste at cursor keeps copied objects' relative layout, clamps the pasted selection into paper
  bounds when possible, regenerates all ids and creates one history entry.
- Component context actions create at most one history entry each; opening the menu or Properties
  creates none.
- Menu items expose accessible names, keyboard navigation, focus-visible state and shortcut hints.
- Context Menu portals inherit PTD theme tokens and remain above compact scrim/panel layers.
- Catalog drag/drop browser acceptance proves position, selection, `onChange` and Undo behavior.
- React Designer typecheck/tests/lint/build and Web typecheck/build pass sequentially.
- Browser QA passes at 1600×1000, 1366×768 and 1024×768 with no console error/warn.
- The parent React Designer PRD accurately identifies remaining downstream work after this task.

## Completion boundary

After this task, `@ptd/react-designer` can be closed as the editor-shell package. The next product
feature should be `05-21-multi-page-support`, followed by data-source work after its server/data
contract is planned.
