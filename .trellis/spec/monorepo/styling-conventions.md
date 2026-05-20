# Styling Conventions (v2)

---

## Two-Layer Styling Strategy

This project uses different styling approaches for different layers:

| Layer | Approach | Why |
|-------|----------|-----|
| Canvas components (`@ptd/components`) | CSS Custom Properties | Precise mm/px control, zero runtime, print-safe |
| Designer UI (`@ptd/react-designer`, `apps/web`) | CSS Modules | Scoped styles, no Tailwind dependency |

**No CSS-in-JS (Emotion, styled-components).** The old Vue 2 codebase used `vue-styled-components` — do not replicate this pattern in v2.

---

## Canvas Components: CSS Custom Properties

Dynamic values (size, color, font) are injected as CSS variables on the element:

```ts
// Set via element.style in TypeScript
element.style.setProperty('--ptd-width', `${style.width}px`)
element.style.setProperty('--ptd-color', style.color)
```

```css
/* Component CSS reads from variables */
.ptd-text {
  width: var(--ptd-width);
  color: var(--ptd-color);
  font-size: var(--ptd-font-size);
}
```

This replaces the `vue-styled-components` dynamic template literals used in `legacy/src/components/PageComponents/style.js`.

---

## Designer UI: CSS Modules

All React components in `@ptd/react-designer` and `apps/web` use CSS Modules:

```tsx
import styles from './Toolbar.module.css'

export function Toolbar() {
  return <div className={styles.toolbar}>...</div>
}
```

File naming: `ComponentName.module.css` co-located with the component.

**No global class names** in designer UI components (except intentional global resets in `apps/web/src/global.css`).

---

## Radix UI Integration

Radix UI Primitives handle interactive components (Dialog, DropdownMenu, Tooltip, Tabs). Style them via CSS Modules targeting the `data-*` attributes Radix provides:

```css
.dialog[data-state='open'] { animation: fadeIn 150ms; }
.trigger[data-state='open'] { background: var(--surface-hover); }
```

Do not use Tailwind utility classes — style via CSS Modules only.

---

## Anti-patterns

- Do not use inline `style={{ color: value }}` in React components — use CSS variables via a wrapping element or CSS Modules
- Do not use `!important` — it indicates a specificity conflict that should be resolved structurally
- Do not use Shadow DOM for canvas components — it blocks CSS variable inheritance from the host page
