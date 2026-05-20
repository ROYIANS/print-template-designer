# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

<!--
Document your project's quality standards here.

Questions to answer:
- What patterns are forbidden?
- What linting rules do you enforce?
- What are your testing requirements?
- What code review standards apply?
-->

ESLint + Prettier enforced via `lint-staged` on commit. Vue CLI service runs lint.

---

## Linting Setup

- ESLint config: `.eslintrc.js` — extends `plugin:vue/essential`, `eslint:recommended`, `plugin:prettier/recommended`
- Prettier config: default (no `.prettierrc` — uses eslint-plugin-prettier defaults)
- `no-console` and `no-debugger` are warnings in production, off in development
- Lint command: `npm run lint` (runs `vue-cli-service lint`)

---

## Formatting Rules (from `.editorconfig`)

- Indent: 2 spaces (no tabs)
- Line endings: LF
- Trim trailing whitespace
- Insert final newline
- Max line length: 100

---

## Required Patterns

- All PageComponents must `mixins: [commonMixin]`
- All PageComponents must have `element` and `propValue` props with defaults
- Styled components for PageComponents must be defined in `src/components/PageComponents/style.js`, not inline
- New canvas components must be registered in `src/components/config/componentList.js`
- Destroy third-party instances in `beforeDestroy` (e.g. wangEditor: `editor.destroy()`)

---

## Forbidden Patterns

- `console.log` in committed code (lint warning in production)
- `debugger` in committed code
- Direct DOM manipulation outside of `mounted`/`beforeDestroy` lifecycle hooks
- Importing from `node_modules` paths directly in components — use package names
- Adding `<style scoped>` to PageComponents (breaks vue-styled-components)

---

## Testing

There is no test suite configured. No test files exist in the repo. Do not add tests unless the user explicitly requests a testing setup.

---

## Build

- Dev server: `npm run serve`
- Library build: `npm run lib` (outputs to `lib/`, targets `src/components/index.js`)
- Production build: `npm run build`
