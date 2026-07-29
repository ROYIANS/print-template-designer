# Hook Guidelines

> How hooks are used in this project.

---

## Overview

<!--
Document your project's hook conventions here.

Questions to answer:
- What custom hooks do you have?
- How do you handle data fetching?
- What are the naming conventions?
- How do you share stateful logic?
-->

This project uses Vue 2 Options API — there are no Vue Composition API hooks (`useXxx`). Shared stateful logic is handled via **mixins**, not hooks.

---

## Mixin Pattern (replaces hooks)

The project has one shared mixin: `src/mixin/commonMixin.js`.

All PageComponents include it:

```js
import commonMixin from '@/mixin/commonMixin'

export default {
  mixins: [commonMixin],
  // ...
}
```

`commonMixin` provides utility methods only — no reactive state, no lifecycle side effects. Keep it that way.

---

## Adding Shared Logic

If new shared logic is needed:
1. Add a method to `commonMixin` if it's a pure utility (no state, no lifecycle)
2. Create a new mixin file in `src/mixin/` if it needs reactive data or lifecycle hooks
3. Register the new mixin in the components that need it — do not auto-apply globally

---

## Data Fetching

There is no data-fetching layer. The library is a designer widget — data comes in via props (`preDataSet`, `preDataSource` on `PtdDesigner`) and is stored in Vuex. Components read from the store, not from API calls.

---

## Naming Conventions

- Mixin files: `camelCase.js` in `src/mixin/` (e.g. `commonMixin.js`)
- No `use` prefix — this is Vue 2, not Composition API

---

## Common Mistakes

- Do not create Composition API composables (`useXxx`) — Vue 2 does not support them without `@vue/composition-api` plugin, which is not installed
- Do not add reactive state to `commonMixin` — it is shared across all PageComponents and state would be shared unexpectedly
