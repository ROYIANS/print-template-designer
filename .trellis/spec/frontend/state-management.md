# State Management

> How state is managed in this project.

---

## Overview

<!--
Document your project's state management conventions here.

Questions to answer:
- What state management solution do you use?
- How is local vs global state decided?
- How do you handle server state?
- What are the patterns for derived state?
-->

Vuex 3 (Vue 2 compatible). Single store with one namespaced module: `printTemplateModule`.

---

## State Categories

| Category | Where it lives | Examples |
|----------|---------------|---------|
| Canvas/editor state | `printTemplateModule` Vuex module | `componentData`, `curComponent`, `pageConfig`, `editMode` |
| UI toggle state | Sub-modules (`nightMode`, `rulerThings`) | `isNightMode`, ruler visibility |
| Undo/redo | `snapshot.js` spread into global state | `snapshotData`, `snapshotIndex` |
| Clipboard | `copy.js` spread into global state | `copyData` |
| Local component state | `data()` in the component | modal open/close, editor instance |

---

## Store Structure

The main module (`printTemplateModule`) is built by spreading several concern files into `global.js`:

```js
// stores/modules/global.js
export const state = {
  ...compose.state,
  ...snapshot.state,
  ...copy.state,
  // own state
  editMode: 'edit',
  pageConfig: { ... },
  componentData: [],
  curComponent: null,
  // ...
}
```

Sub-modules (`nightMode`, `rulerThings`) are registered separately and accessed as `printTemplateModule/nightMode/*`.

---

## Accessing State

Always use the `printTemplateModule` namespace:

```js
// In computed
...mapState({ curComponent: (state) => state.printTemplateModule.curComponent })

// Direct commit
this.$store.commit('printTemplateModule/setPropValue', { id, propValue })

// mapMutations
...mapMutations('printTemplateModule', ['setCurComponent'])
```

---

## When to Use Global State

Use Vuex for:
- Any state shared between Editor panels and PageComponents
- `curComponent` — the currently selected canvas element
- `componentData` — the full list of canvas elements
- `pageConfig` — page size, margins, fonts

Use local `data()` for:
- Modal open/close flags
- Editor instances (wangEditor)
- Transient UI state that no other component needs

---

## Common Mistakes

- Mutating `componentData` array items directly — always go through a mutation
- Forgetting the `printTemplateModule/` namespace prefix in commits/dispatches
- Storing editor instances (wangEditor) in Vuex — they are not serializable; keep them in local `data()`
