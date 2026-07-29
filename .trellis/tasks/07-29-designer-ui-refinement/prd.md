# Adobe-inspired Designer UI refinement

## Background

The Canvas-first workspace is functionally sound, but the dark blue Tool Dock feels detached from
the cool-paper panels and canvas. The Inspector also relies too heavily on raw browser inputs,
which makes the editor feel like an engineering form rather than a refined professional design
tool.

Adobe products are the quality reference for professional density, visual hierarchy and precise
property editing. This task must not copy Adobe assets or reproduce a product pixel-for-pixel; it
should translate those qualities into PTD's existing paper, ruler and proofing identity.

## Direction

- Refined industrial studio: neutral cool graphite Chrome, cool paper panels and precise hairlines.
- Cobalt remains an interaction color for selection, focus and active commands, not a structural
  background color.
- The Tool Dock belongs to the same workspace system as the panels instead of reading as a separate
  dark-blue navigation product.
- Inspector controls should choose the form that best matches the value: unit steppers for geometry,
  segmented controls for small enums, swatch + text for colors, compact selects for constrained
  options and text areas only for genuinely long content.
- Density stays professional and compact. Polish comes from alignment, state and typography rather
  than large cards, gradients or decorative animation.

## Scope

1. Restyle the Tool Dock and its dividers, active, hover, focus and disabled states into a neutral
   graphite/paper system that visually connects to Resource Panels and the Command Bar.
2. Refactor Page/Single/Multi Inspector shells to reuse the shared Panel structure with a fixed
   header and one scrolling body.
3. Introduce reusable internal Inspector field primitives for:
   - numeric values with visible units and step controls;
   - segmented choices;
   - color swatch plus editable color value;
   - compact select and text entry;
   - collapsible advanced sections when useful.
4. Preserve legal numeric drafts during editing and commit one history gesture per completed edit.
5. Make the generic Inspector customization hook stable in Page, Single and Multi states.
6. Resolve compact overlay stacking so Canvas selection UI and the Quick Bar do not sit above an
   open Resource/Inspector scrim.
7. Refine small typography, spacing and control states where needed to make the whole shell feel
   cohesive.

## Out of Scope

- New schema fields or changes to the public `Designer` API.
- Data-source binding, multi-page creation, export, right-click menu or server integration.
- Replacing Remix icons, the current logo, the Canvas interaction model or ruler algorithms.
- A dark theme or an Adobe-branded visual clone.

## Acceptance Criteria

- Tool Dock is visually neutral and cohesive with the rest of the workspace at rest; cobalt appears
  only for active/focus interaction.
- Page, Single and Multi Inspector states share one fixed-header, single-scroll-body structure.
- X/Y/W/H, rotation, opacity, font size and border width use compact number controls with useful
  units and step actions instead of bare number inputs.
- Small enums such as page direction and common alignment options use segmented/icon choices where
  they are clearer than a select.
- Color editing exposes both a swatch and an editable value without relying on a standalone native
  color input as the whole interaction.
- Locked, mixed, disabled, hover, focus-visible and invalid states remain understandable without
  color alone.
- Compact Resource and Inspector overlays remain mutually exclusive; Quick Bar and Canvas editing
  Chrome sit below the active scrim and do not remain visually actionable.
- `data-ptd-region="inspector"` is present for Page, Single and Multi Inspector states, with
  `page-inspector` retained as a more specific hook.
- No changes to `TemplateSchema` are emitted for layout/panel-only UI state.
- No `!important`, static inline Chrome styles, raw numeric z-index or new non-token colors.
- Browser QA passes at 1600x1000, 1366x768 and 1024x768 for Page, Single, Multi, Locked and compact
  overlay states; 200% browser zoom remains operable.
- React Designer TypeScript, Vitest, ESLint, package build, CSS mapping assertion and Web production
  build pass.
