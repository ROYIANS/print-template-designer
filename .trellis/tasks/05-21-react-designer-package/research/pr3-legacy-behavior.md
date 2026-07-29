# PR3 legacy behavior map

## Scope

This note records the Vue 2 behavior that matters to the React designer PR3. The legacy
implementation is a behavioral reference, not a source dependency.

## Confirmed behavior

### History

- `legacy/src/stores/modules/snapshot.js` stores only `componentData`, not the complete template.
- The initial data must be captured separately; otherwise the first operation cannot be undone.
- A new snapshot discards redo entries after the current index.
- Legacy retained only three snapshots despite a stale comment mentioning fifty.
- The React rewrite should retain twenty full-template snapshots so later page and page-config
  changes participate in the same history.

### Clipboard

- Copy stores a deep clone of the active component and its original index.
- Keyboard paste offsets `left` and `top` by 10 px; context-menu paste uses the menu position.
- Paste always creates a new id.
- Cut removes the component and consumes the clipboard after paste.
- PR3 will support copy/cut/paste for the current multi-selection, recursively regenerate ids for
  group children, and offset keyboard paste by 12 px.

### Layer order

- Array order is paint order: a larger index is closer to the top.
- Move forward/back swaps with the adjacent entry.
- Bring to front moves the selection to the array tail; send to back moves it to the head.
- Multi-selection operations must preserve the relative order of selected components.

### Locking

- `isLock` prevents movement and resize but the component remains selectable through structure UI.
- Lock/unlock is a schema change and therefore must create a history entry.

### Grouping

- A group is a `RoyGroup` whose `propValue` is an array of child `ComponentSchema` values.
- Child coordinates are converted from canvas coordinates into coordinates relative to the group.
- Grouping an existing group first flattens its children.
- Ungrouping restores child coordinates to canvas space.
- PR3 will preserve child rotations but keep the group itself at rotation zero. Nested groups are
  flattened when grouping to keep the transform model deterministic.

### Alignment and distribution

- Legacy does **not** contain component alignment/distribution commands. It only contains text
  content `justifyContent`/`alignItems` fields.
- The PRD's eight alignment/distribution operations are therefore new behavior.
- With two or more selected components, alignment uses the multi-selection bounding box.
- Distribution requires at least three components and preserves the first/last spatial anchors.

### Toolbar status

- Legacy toolbar visibly implemented ruler toggle, page orientation and zoom.
- Undo/redo, lock and group toolbar entries were commented out; most edit commands were reachable
  from the editor context menu.
- The React toolbar is intentionally a new, first-class command surface rather than a literal port.

## Migration rule

Every user action routes through one `EditorStore` command. UI components, keyboard shortcuts and
the future context menu may not mutate signals directly. A command must:

1. produce an immutable `TemplateSchema`;
2. update selection consistently;
3. create at most one history entry;
4. call the latest host `onChange` callback.
