# PR4 UI synthesis: Workshop method × PTD Legacy × React architecture

## Sources reviewed

- User-provided `Workshop UI 系统规范` from a production builder implementation.
- Workshop source implementation inspected after the user requested a closer visual comparison:
  - `D:/Code/Work/genn-ai-fe-foundry/src/pages/workshop/builder/amis/EditorShell.jsx`
  - `D:/Code/Work/genn-ai-fe-foundry/src/pages/workshop/builder/amis/HighlightOverlay.jsx`
  - `D:/Code/Work/genn-ai-fe-foundry/src/pages/workshop/builder/amis/ComponentToolbar.jsx`
  - `D:/Code/Work/genn-ai-fe-foundry/src/pages/workshop/builder/amis/ActionToolbar.jsx`
  - `D:/Code/Work/genn-ai-fe-foundry/src/pages/workshop/builder/amis/designer-shell.css`
- Legacy PTD files:
  - `legacy/src/components/Main/Home.vue`
  - `legacy/src/components/Main/DesignerAside.vue`
  - `legacy/src/components/Main/DesignerMain.vue`
  - `legacy/src/components/Main/PageComponent.vue`
  - `legacy/src/components/Main/PageToc.vue`
  - `legacy/src/components/Main/DataSource.vue`
  - `legacy/src/components/ToolBar/ToolBar.vue`
  - `legacy/src/components/config/componentList.js`
- Current React Designer toolbar, inspector, canvas, store and package build contract.
- `D:/Code/Study/vidorra-life/.trellis/spec/frontend/blueprint-aesthetic.md` for the
  “structure is decoration” method, warm-matte material, font roles and physical interaction states.
- `D:/Code/Study/vidorra-life/zed.html` and the supplied Zed reference screenshot for cool-paper
  neutrals, blue-gray hairlines, sparse cobalt interaction states and precise grid framing.
- `frontend-design` references for typography, color/contrast, spatial design, interaction,
  responsive behavior, motion and UX writing.

## What PTD keeps from Workshop

- High-density, low-decoration production-tool composition.
- 24/28/32px control scale, 2px primary radius and 4px spacing base.
- Borders and surface changes before shadows.
- One panel shell and one scroll owner for every panel.
- Flat lists with explicit selected state instead of nested cards.
- Radix headless semantics, consistent focus, Portal layering contracts and stable override hooks.
- Progressive disclosure for advanced configuration.
- Design tokens instead of scattered hard-coded color and spacing.
- A two-level 56px/44px application-and-command structure, with command groups presented as compact
  bordered decks instead of loose buttons on one flat bar.
- A 48px dark Rail as the workspace spine, while contextual panels stay light and content-focused.
- A selected-component overlay that combines a 2px outline, component name and direct manipulation
  actions. The overlay follows the visible canvas boundary rather than component-local overflow.
- A cool blue-gray pasteboard with 135° mount texture, faint grid, hard paper edge, offset paper
  shadow and subtle panel inset hierarchy.

## What PTD does differently from Workshop

- No Tailwind and no cva dependency. The package already uses CSS Modules and typed React props;
  variants use `data-variant` / `data-size` plus explicit union types.
- No Foundry blue identity and no generic admin-blue wash. After browser review showed that the
  warm-paper/warm-brown system felt too retro, PTD moved to cool-paper/blue-graphite neutrals with a
  sparse editor cobalt for actions, selection and guides. Proof vermilion remains reserved for
  print-proof semantics. The Zed reference contributes precision and lightness, not its marketing
  layout or brand identity.
- No generic application-builder metaphor. Paper, rulers, page margins, registration and proofing
  form the product-specific visual language.
- The canvas remains the dominant surface; panels are quieter than Workshop configuration screens.
- PTD does not copy Workshop's fixed `#205dd9`, AMIS component taxonomy, Tailwind/inline-style
  implementation, marketing labels, full dark sidebars or `!important` overrides. It adopts the
  spatial grammar and overlay behavior, then expresses them through PTD tokens and print semantics.

## What PTD keeps from Vidorra Blueprint

- “Structure is decoration”: hierarchy comes from hairlines, engineering-paper grids, aligned rails,
  sparse dot fields and functional rulers instead of illustrations or decorative imagery.
- A tinted-neutral system and strict accent budget; the final hue is recalibrated toward Zed-like
  cobalt, while the Blueprint rule that structure carries the visual identity remains intact.
- Sarasa UI SC + Outfit for operational UI, Noto Serif SC for explicit serif/template semantics,
  and tabular numbers instead of a monospace “technical” costume.
- A restrained physical response: interactive tiles may use a 1px inset bottom edge, flatten on
  hover and depress by 1px on active.
- No decorative engineering labels, fake coordinates, fake serial numbers or meaningless English
  abbreviations.

PTD does not copy Blueprint's marketing-page five-segment frame, full-viewport section dividers,
hero ornaments or modal backdrop contract into the editor. The workbench is a dense production tool;
those patterns would reduce canvas space or compete with real rulers and page geometry.

## What PTD keeps from Legacy

- A distinct document header and a distinct canvas command toolbar.
- Five left navigation destinations: components, structure, properties, data source and global settings.
- A collapsible icon rail plus contextual left panel.
- Component groups: common, data and shapes.
- Drag-to-create, structure selection/reordering, page configuration, data field discovery and ruler.
- Component names, default schemas and the user's existing mental model.

## What PTD rejects from Legacy

- Vue/Vuex, vxe-form/vxe-table UI coupling and globally injected component libraries.
- Large 95px component cards, strong repeated shadows and continuous pulse animations.
- Magic dimensions, static inline styles, global hard-coded colors and animation libraries for basic UI.
- Icon font classes as an implicit global dependency; React uses tree-shakeable Remix SVG components.
- Hover-only row actions and color-only selection states.
- A single component manually assembling Schema defaults in the drop handler.

## React gaps found before PR4-A

- The PR3 toolbar combines identity, editing commands and view controls in one crowded row.
- Commands use text abbreviations instead of a coherent icon system.
- There is no left navigation, component catalog, structure view, data source view or global settings.
- The right inspector exists but does not yet use shared panel primitives.
- Ruler and context menu state/commands exist only partially at UI level.
- Portal content currently relies on tokens scoped to the Designer root; PR4 needs a shared theme class.

## PR4 first vertical slice

1. Introduce the PTD theme/token layer and stable `data-ptd-region` hooks.
2. Split the shell into App Bar, Command Bar, Rail, Left Panel, Canvas viewport, Inspector and Status Bar.
3. Build reusable panel primitives and a five-entry left Rail with Radix Tabs.
4. Implement the component catalog/factory from Legacy defaults without importing Vue code.
5. Make the component panel support both drag and click creation.
6. Replace text abbreviations with Remix line SVG icons and accessible tooltips.
7. Preserve every PR3 command and controlled-state/history invariant.
8. Add the Workshop-derived single-selection Quick Bar without coupling it to component rotation.
9. Add Zed/Workshop-derived workbench framing only to the pasteboard and application chrome.

## Acceptance focus

- A first-time user can identify where to add a component without instruction.
- The screen reads as a professional print-production workspace at 1600×1000 and 1366×768.
- Adding a component is one store command, one history entry and one final host change.
- The canvas stays visually primary while panels remain dense, legible and keyboard accessible.
- Browser screenshots, not build output alone, are the final visual evidence.

## PR4-A visual outcome

- The demo paper and content neutrals are now cold white/blue graphite; proof vermilion remains only
  on page margins and the internal-transfer proof stamp.
- The 48px App Bar aligns its brand cell with the 48px Rail plus 252px Left Panel. The 44px Command
  Bar contains separate edit and viewport decks, and the Rail uses dark blue graphite as a stable
  workspace spine.
- The pasteboard carries a faint 24px engineering grid, 135° mount texture, inner workbench frame,
  structural diamond nodes, paper corner nodes and numberless edge ticks. None enters the paper DOM.
- The paper uses a cool hard edge, 4px physical offset and soft long shadow, replacing the previous
  warm floating-sheet treatment.
- Single selection now opens a portalled Quick Bar with component name, drag, lock/unlock, duplicate,
  layer-forward and delete. It remains horizontal for rotated components and clamps/flips within the
  visible Canvas viewport on scroll and resize.
- 1600×1000, 1366×768 and 1024×768 screenshots confirm full desktop, constrained desktop and
  collapsed-left-panel layouts. A rotated proof-stamp screenshot confirms overlay orientation.
