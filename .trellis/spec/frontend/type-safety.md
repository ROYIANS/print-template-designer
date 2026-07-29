# Type Safety

> Type safety patterns in this project.

---

## Overview

<!--
Document your project's type safety conventions here.

Questions to answer:
- What type system do you use?
- How are types organized?
- What validation library do you use?
- How do you handle type inference?
-->

This project is **JavaScript, not TypeScript**. There is no type system, no `.ts` files, and no `tsconfig.json`. Type safety is enforced through Vue prop validation and runtime checks.

---

## Vue Prop Validation

All props must declare their type and a default value:

```js
props: {
  element: {
    type: Object,
    default: () => ({})   // factory function for objects/arrays
  },
  propValue: {
    type: String,
    default: ''
  }
}
```

Accepted types: `String`, `Number`, `Boolean`, `Array`, `Object`, `Function`. Use array syntax for multiple types: `type: [Number, String]`.

---

## Runtime Checks

Use `commonMixin.isBlank(value)` for null/undefined/empty-string checks instead of writing `value === null || value === undefined || value === ''` inline.

---

## No TypeScript

- Do not add `.ts` or `.tsx` files
- Do not install `typescript` or `@vue/tsconfig`
- Do not add JSDoc `@type` annotations — the codebase does not use them

---

## Forbidden Patterns

- Accessing `element` properties without checking `element.style || {}` — `element` can be partially initialized
- Mutating props directly — always emit or commit to store
- Using `any` equivalent patterns like `Object` type for everything — be specific with prop types when possible
