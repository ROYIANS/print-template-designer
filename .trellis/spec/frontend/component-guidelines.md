# Component Guidelines

> How components are built in this project.

---

## Overview

<!--
Document your project's component conventions here.

Questions to answer:
- What component patterns do you use?
- How are props defined?
- How do you handle composition?
- What accessibility standards apply?
-->

Vue 2 Options API throughout. No Composition API. All components use `export default { name, mixins, components, props, computed, data, methods, created, mounted, watch, beforeDestroy }` in that order.

---

## Component Structure

Standard SFC layout (see `src/components/PageComponents/RoyRect.vue`):

```vue
<template>
  <div class="ComponentName">
    <StyledXxx v-bind="style" />
  </div>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import { StyledXxx } from '@/components/PageComponents/style'

export default {
  name: 'ComponentName',
  mixins: [commonMixin],
  components: { StyledXxx },
  props: {
    element: { type: Object, default: () => ({}) },
    propValue: { type: String, default: '' }
  },
  computed: {
    style() { return this.element.style || {} }
  },
  data() { return {} },
  methods: {},
  created() {},
  mounted() {},
  watch: {}
}
</script>

<style lang="scss">
.ComponentName { width: 100%; height: 100%; }
</style>
```

---

## Props Conventions

All PageComponents receive exactly two props:

| Prop | Type | Purpose |
|------|------|---------|
| `element` | `Object` | Full component descriptor (id, style, text, etc.) |
| `propValue` | `String` | The primary display value (text content, image src, etc.) |

Always provide `default: () => ({})` for Object props and `default: ''` for String props.

---

## Styling Patterns

PageComponents use `vue-styled-components` for dynamic styles. All styled components are defined in `src/components/PageComponents/style.js` and imported by name.

```js
// style.js — define once, import everywhere
import styled from 'vue-styled-components'
export const StyledRect = styled('div', commonProps)`
  width: ${(props) => props.width}px;
  ...
`
```

Non-canvas components (RoyUI, Editor panels) use scoped SCSS with `lang="scss"`. Class names match the component name (BEM-style: `.RoyModal`, `.RoyModal__title`).

Global styles live in `src/assets/main.scss`. Do not add global styles inside component `<style>` blocks.

---

## Mixin Usage

`commonMixin` (`src/mixin/commonMixin.js`) is mixed into every PageComponent. It provides:
- `deepCopy(obj)` — deep clone with cycle detection
- `getUuid(length)` — nanoid-based ID generator
- `isBlank(value)` — null/undefined/empty check
- `findParentComponent(vueIns, name)` — walk `$parent` chain by component name

Always `mixins: [commonMixin]` in PageComponents. Do not duplicate these utilities.

---

## Component Registration

Public components are registered in `src/components/index.js` via `install()`. New PageComponents must also be added to `src/components/config/componentList.js` with a full descriptor (icon, code, name, component, propValue, group, style).

---

## Common Mistakes

- Forgetting `Object.seal(editor)` when storing wangEditor instance — causes Vue reactivity errors
- Using `v-model` on `propValue` directly — propValue is read-only; commit to store via `setPropValue` mutation
- Adding `<style scoped>` to PageComponents — breaks styled-components dynamic styles
