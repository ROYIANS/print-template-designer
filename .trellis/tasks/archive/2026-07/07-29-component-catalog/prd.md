# Component catalog, placeholders and shape drawing tools

## Goal

Turn the v2 component panel into a deliberate, professional inventory instead of a technical
registry projection. The catalog should explain the components that exist today, honestly reserve
space for important future capabilities, and treat geometric shapes as drawing tools in the
Photoshop/Illustrator tradition: choosing a shape activates a tool, while dragging on the page
creates the component.

## Requirements

### Catalog information architecture

- Follow the established PTD Adobe/InDesign-like UI language: compact, precise and scan-friendly,
  with hierarchy expressed by typography, spacing and rules rather than large cards.
- Keep all 11 currently creatable engine types for compatibility and keep `RoyGroup` internal.
- Separate persisted schema category from catalog information architecture. Existing
  `ComponentSchema.group` values and component type names must not change.
- Use five stable user-facing groups in this order:
  1. 文本：`RoySimpleText`, `RoyText`, plus planned data and print-context text presets;
  2. 表格：`RoySimpleTable`, `RoyComplexTable`, plus planned repeating/data tables;
  3. 图像：`RoyImage`, plus planned SVG/icon support;
  4. 编码：`RoyQRCode`, `RoyBarCode`;
  5. 图形：`RoyLine`, `RoyRect`, `RoyCircle`, `RoyStar`, plus a planned Frame/container.
- Give every available entry a product name, concise use-oriented description, search keywords,
  complexity label and creation mode.
- Show planned components as visibly disabled placeholders marked “规划中”. They explain the
  roadmap but cannot be clicked, dragged or create a schema.
- Preserve the current overlapping types for compatibility, but use product language:
  “文本/富文本”, “自由表格/结构表格”, and “直线/矩形/椭圆/星形”.
- Rename the resource entry and panel from “资产与组件” to “组件”, including its internal
  non-persisted panel id (`assets` to `components`).
- Make the component panel the authoritative complete inventory. The Tool Dock should expose tools
  and high-frequency insertion actions rather than duplicate the whole catalog.

### Two-level sidebar architecture

- Adopt a PTD-specific hybrid of the professional-tool patterns confirmed from Photoshop,
  boardmix and Gaoding: a narrow mode/tool rail plus a wider task-oriented resource panel.
- Keep the rail compact and predictable. It must not present four separate shape buttons or grow by
  one permanent icon every time a new shape preset is added.
- Divide the rail into two visually explicit zones:
  - creation/interaction tools: Select, Hand, Text, Shape group, Image and Table;
  - workspace resources: Components, Pages, Layers and Data.
- Model the four existing shapes as one accessible Shape tool group in the Dock:
  - the group shows the current or last-used shape icon;
  - its primary action activates that shape tool;
  - a visible disclosure affordance opens a keyboard-accessible chooser for Line, Rectangle,
    Ellipse and Star;
  - selecting a subtype closes the chooser, activates it and keeps all existing persistent drawing
    behavior;
  - the same four subtype tools remain directly available in the component panel.
- Keep every primary Dock glyph on the same optical center and 40×40 alignment grid. The Shape
  disclosure is an overlaid lower-corner affordance with its own accessible target; it must not
  shrink or push the primary shape glyph sideways relative to Select, Hand, Text, Image and Table.
- Do not copy Photoshop's dark chrome or Gaoding's marketing-card style. Continue PTD's light
  paper/graphite surfaces, precise rules and restrained cobalt active state.
- Increase tool legibility and target size without making the Dock visually heavy: approximately
  52px rail width, 40px controls and 20px icons, with tooltips and stable accessible names.
- Do not use the current admin-navigation-like combination of a cobalt left rule and pale cobalt
  background for active Dock items. Use neutral structure as the primary state signal:
  - an active persistent tool uses a raised paper surface, graphite hairline/keycap edge and strong
    icon; cobalt may tint only the icon as a precise secondary accent;
  - an open resource-panel button visually connects to the adjacent panel surface like a neutral
    attached tab, rather than imitating a selected drawing tool;
  - keyboard focus retains the cobalt focus ring because it is a distinct accessibility state;
  - active shape presets in the panel use graphite edge/weight and at most a small current-tool
    label, never a full pale-blue fill or blue left border;
  - selected page/layer rows inside the left resource panel follow the same neutral selected-state
    language instead of retaining the old cobalt left-rule/pale-fill treatment;
  - ordinary Dock buttons and rows must not gain external drop shadows; use hairlines and restrained
    inset physical edges allowed by the PTD UI system.
- When a drawing tool is active, the Context Bar must identify the tool and show concise interaction
  guidance (`拖动画布创建`, `Shift 等比/约束`, `Esc 取消`) instead of leaving the UI in a page-only
  context.

### Hand and canvas panning

- Add a visible Hand tool alongside Select in the primary tool zone.
- `H` activates Hand persistently; `V` returns to Select; Escape returns a persistent Hand tool to
  Select consistently with other active tools.
- While Hand is effective, pointer down + drag pans the Canvas viewport by changing only its scroll
  position. It must not move the paper, components, guides or schema geometry.
- The pointer is `grab` while idle and `grabbing` during a pan gesture.
- Holding Space outside input/textarea/select/contenteditable temporarily makes Hand effective;
  releasing Space restores the exact persistent tool that was active before the hold. Space-pan must
  work while Select, Text or a Shape tool is persistent and must not replace last-used tool state.
- Hand activation and panning are editor-only UI state: no template `onChange`, selection mutation or
  history entry. Losing focus/pointer capture cancels the pan safely.
- Dedicated Hand and temporary Space-Hand share one effective-tool contract so Canvas, Dock cursor and
  Context Bar cannot disagree about the current mode.

### Drawn text frames

- Change the primary `RoySimpleText` catalog entry and Dock shortcut from immediate center insertion
  to a persistent Text drawing tool. `RoyText` (富文本) remains an insert-mode component in this task.
- Selecting Text activates the tool and crosshair/text-frame cursor without creating a schema.
- Pointer down + drag on paper shows a transient text-frame preview; pointer up creates one
  `RoySimpleText` schema using the normalized/clamped drag rectangle for `left`, `top`, `width` and
  `height`.
- Text-frame tools stay active after creation for repeated use. Reverse dragging works; Shift has no
  special text-frame constraint; a drag shorter than 4 CSS pixels creates nothing.
- Text preview follows the same history boundary as shape preview: no preview movement enters the
  template/history, and one valid pointer-up produces one `store.addComponent()` mutation.
- `V`, Escape, dedicated Hand or temporary Space-Hand cancel an in-progress text preview without
  creating a component. Releasing Space returns to the persistent Text tool.
- Point text, click-without-drag creation, inline text editing and converting `RoyText` to area-text
  behavior remain future work.

### Component maturity and placeholders

- Represent three honest maturity levels in catalog copy and presentation:
  - 基础：an available renderer and a straightforward editing model;
  - 复杂：an available structural component whose editing/data behavior will continue to evolve;
  - 规划：a non-interactive placeholder with no `ComponentType` and no renderer yet.
- Include planned placeholders for these confirmed gaps:
  - 数据字段 / 表达式文本;
  - 页码 / 总页数;
  - 日期时间;
  - 重复明细 / 列表;
  - 数据驱动表格 / 自动分页表格;
  - SVG / 图标;
  - 容器 / Frame.
- Treat 条件显示 as a future cross-component capability described in the audit, not as a fake
  standalone component.
- Model available and planned items as a discriminated union so TypeScript prevents a planned item
  from reaching schema creation or drag/drop code.

### Shape drawing interaction

- Rectangle, ellipse, line and star use `creationMode: 'draw'` in the catalog and Tool Dock.
- Selecting one of these items changes the shared editor tool rather than immediately inserting a
  component. The active tool is visible and the page cursor becomes a crosshair.
- On the page, pointer down starts a transient preview; pointer move updates it; pointer up creates
  exactly one complete component schema through `store.addComponent()`.
- The drawing tool stays active after creation so users can draw repeatedly, matching professional
  graphics-editor behavior.
- `V`, selecting the pointer tool, or `Escape` returns to Select. `Escape`, pointer cancellation and
  interrupted drawing clear the transient preview without creating a component.
- Rectangle, ellipse and star use the normalized drag rectangle for `left`, `top`, `width` and
  `height`; reverse-direction drawing must work.
- Holding Shift constrains rectangle, ellipse and star to a square/circle while preserving the drag
  direction and page boundaries.
- A line is represented by its midpoint, Euclidean length and angle:
  `length = hypot(dx, dy)`, `rotate = atan2(dy, dx)`, with its schema bounds centered on the segment.
- Ignore accidental drags shorter than the agreed 4 CSS-pixel threshold.
- Clamp drawn geometry to the current page bounds.
- The preview is editor-only UI state: it must not enter the template schema, selection, onChange or
  history. Completing a valid draw produces one store mutation and one history step.
- Keep native catalog drag-to-position behavior for non-shape available components. Existing
  click-to-center insertion remains available for non-shape items.

### Catalog presentation

- Increase the default resource-panel width from 220px to approximately 280px while keeping the
  existing instance resizing and compact-mode overlay behavior.
- Make the panel a fast creation surface rather than a permanent documentation list:
  - show a compact 常用 section for Text, Image, Free Table and QR Code;
  - render available content components as compact two-column tiles;
  - render Line, Rectangle, Ellipse and Star as a visually scannable shape-preset grid;
  - keep group names and concise introductions at a readable 11px or larger;
  - do not render `基础/复杂` badges on every available item; maturity remains catalog metadata;
  - move all seven unavailable items into one bottom `即将支持` section, collapsed by default and
    explicitly marked `规划中`, so placeholders stay honest without diluting routine creation.
- In the normal browse view, prioritize icon and name. Show the longer use-oriented description in
  accessible tooltips/focus help; search results may use a descriptive list when explanation is
  useful.
- The header count must distinguish the 11 usable components from the seven planned placeholders;
  it must not misleadingly call all 18 items available.
- Add deterministic search over display name, description, technical type and keywords; clearing
  search restores the complete ordered catalog, including planned placeholders.
- Keep keyboard focus, accessible names, disabled semantics and visible active-tool state.

## Catalog copy

| Group | Introduction                     |
| ----- | -------------------------------- |
| 文本  | 标题、标签与多段落排版内容       |
| 表格  | 固定网格、分区结构与重复数据     |
| 图像  | Logo、印章、照片与矢量素材       |
| 编码  | 将网址、单号与业务标识编码到纸面 |
| 图形  | 分隔、边框、底形与视觉标记       |

Component descriptions describe what the user can make, not internal class names or vague
implementation difficulty.

## Technical approach

- Extend available registry definitions with canonical catalog metadata, while keeping planned
  entries in the React catalog layer because they intentionally have no real `ComponentType`.
- Represent catalog items as a discriminated union of available and planned entries. Available
  entries carry an insertion/drawing mode; planned entries carry no schema type.
- Put the shared active tool in `EditorStore` so Sidebar, Tool Dock, Canvas and keyboard handling see
  one state. Keep the in-progress drawing geometry as local Canvas UI state.
- Reuse that shared state for a grouped Dock control and Context Bar guidance. Do not create a second
  sidebar-only selected-shape state that can drift from `EditorStore.activeTool`.
- Separate persistent `activeTool` from a temporary Space-held Hand override and expose one effective
  tool to interaction/rendering code. Persisted template/history state must never store either.
- Put geometry normalization and shape-schema construction in pure helpers with focused unit tests,
  instead of embedding calculations inside React pointer handlers.
- Create the final component only on pointer up. Do not mutate registry defaults or stream preview
  geometry into history.

## Decision (ADR-lite)

**Context:** The existing UI mixes the ideas of a reusable component definition, an insertion
shortcut and a canvas tool. A shape button currently behaves like an insertion action, which does
not match users' expectations from Photoshop, Illustrator or similar layout tools.

**Decision:** Separate catalog definitions from creation modes. Available content components insert
at a position; shapes activate persistent draw tools; planned catalog definitions are disabled
roadmap placeholders. Present those modes through a two-level sidebar: one grouped Shape tool in the
Dock, visually optimized available presets in the component panel, and planned items in a secondary
collapsed roadmap section. Preserve existing shape schema types for template compatibility.

**Consequences:** The editor gains a small tool state machine and transient preview rendering now,
while avoiding a premature schema migration. Text-frame placement and other drawn components can
reuse the same tool architecture later. The catalog can communicate future scope without pretending
that unfinished renderers are usable.

## Acceptance criteria

- The catalog contains the 11 unique available types, excludes `RoyGroup`, and also renders all
  agreed planned placeholders as disabled non-draggable entries.
- Every available registry definition has a catalog group, non-empty description, useful keywords,
  maturity and creation mode.
- Groups render in the agreed five-group order with correct available/planned counts and introductions.
- Searching by Chinese name, use case, description or technical type returns deterministic results;
  clearing search restores the full ordered catalog.
- Planned items are visibly marked “规划中” and cannot call schema creation, activate a tool or
  participate in native drag/drop.
- “资产与组件” no longer appears in the current UI; the resource entry and panel are both “组件”.
- The Dock no longer exposes four permanent shape buttons. One accessible Shape tool group activates
  the current subtype and exposes all four subtypes through a keyboard-accessible chooser.
- Select, Hand, Text, the Shape primary glyph, Image and Table share one optical icon center; the
  Shape disclosure corner does not shift its main glyph.
- Dock tools and resource-panel entries are visually separated, have predictable semantics, and fit
  without crowding at the target 720px workspace height.
- Active persistent tools, open resource panels and keyboard focus use three visually distinct
  states. No active Dock, shape preset, page row or layer row combines a blue left border with
  pale-blue fill, and ordinary controls use no external drop shadow.
- The component browse view prioritizes 常用 and available two-column/icon-grid creation targets;
  normal available items do not show `基础/复杂` badges or 9px permanent descriptions.
- All seven planned placeholders appear together in a collapsed `即将支持` section and remain
  searchable without being mixed into routine available groups.
- The component header identifies 11 usable entries separately from planned items.
- The default resource panel is approximately 280px wide, remains resizable, and opens as an overlay
  without layout breakage in compact mode.
- Activating each shape updates the Context Bar with the tool name, draw instruction, relevant Shift
  behavior and Escape hint; returning to Select restores the normal page/selection context.
- `H` activates a persistent Hand tool; pointer-drag pans only the viewport with grab/grabbing cursor,
  producing no schema/onChange/history mutation.
- Space temporarily activates the effective Hand tool outside editable controls and returns to the
  exact prior persistent Select/Text/Shape tool on keyup, including safe blur/cancel cleanup.
- The Context Bar identifies persistent or temporary Hand mode and explains viewport panning.
- Selecting the primary Text entry or Dock button creates nothing immediately. Forward/reverse valid
  drags create one clamped `RoySimpleText` frame and one history entry; preview, short drag, Escape and
  cancellation create none; the Text tool remains active after creation.
- Selecting line, rectangle, ellipse or star does not create a component and visibly activates the
  corresponding persistent draw tool.
- Forward and reverse pointer drags create correct shape bounds; Shift constrains closed shapes;
  lines use correct length, midpoint and rotation.
- Sub-threshold, cancelled and escaped draws create nothing and clear the preview.
- A completed valid drawing creates one schema, one onChange and one history entry; preview movement
  creates none.
- `V`, pointer selection and `Escape` return to Select without interfering with text inputs or
  contenteditable controls.
- Existing insert-mode component click insertion and native drag/drop still create complete schemas
  through one store/history update.
- Existing component types and persisted `common/data/shape` categories remain compatible.
- Core and React Designer lint, typecheck, tests and builds pass, followed by Web typecheck/build and
  interactive browser verification at wide and compact workspace widths.

## Definition of done

- Registry/catalog, Sidebar/Tool Dock, EditorStore, Canvas pointer handling and keyboard behavior are
  implemented and covered by focused tests.
- Drawing preview and active-tool styling are visually verified in a running Web workspace.
- Relevant UI and react-designer specifications are updated with durable catalog/tool contracts.
- Quality gates pass with the project pnpm selected by `AGENTS.md`.

## Out of scope

- Adding new `ComponentType` values or renderers for planned placeholders.
- Implementing data binding, expressions, repeaters, automatic table pagination, rich-text editing,
  SVG rendering or Frame/container semantics.
- Merging existing component schema types or migrating stored templates.
- Converting image, table, QR, barcode or rich-text creation to drawn-frame placement in this task.
- Click-without-drag point text, inline text editing and advanced text-frame overflow.
- Selection-tool move/resize behavior changes beyond the minimum precedence needed for shape drawing.
- Building an asset upload/library feature.
- Completing every component's Property Inspector.

## Research references

- [`research/component-audit.md`](research/component-audit.md) — current inventory, overlap decisions,
  missing capabilities, and the adopted Photoshop/Illustrator-style tool model.
- [`research/sidebar-benchmark.md`](research/sidebar-benchmark.md) — supplied-editor comparison,
  two-level sidebar, neutral state language, Hand/Space panning and drawn Text direction.

## Technical notes

- Core registry: `packages/core/src/registry/component-registry.ts`.
- React catalog: `packages/react-designer/src/catalog/componentCatalog.ts`.
- Shared tool state: `packages/react-designer/src/state/editor.ts`.
- Drawing interaction: `packages/react-designer/src/components/Canvas/Canvas.tsx`.
- Keyboard behavior: `packages/react-designer/src/hooks/useEditorKeyboard.ts`.
- Resource panel: `packages/react-designer/src/components/Sidebar/Sidebar.tsx`.
- Context Bar: `packages/react-designer/src/components/Toolbar/Toolbar.tsx`.
