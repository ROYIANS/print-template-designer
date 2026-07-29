# Professional editor sidebar benchmark

## References supplied by the user

The user supplied current screenshots of boardmix, an online Photoshop-like editor and Gaoding's
editor/add panel. The goal is not visual imitation; the screenshots expose useful information-
architecture patterns for a print-template tool.

## Comparative findings

| Reference             | Dominant model                                                                                                                        | Useful lesson for PTD                                                                                              | Pattern to avoid copying                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Photoshop-like editor | The left rail contains persistent pointer/tool modes; related tools use grouped flyouts; the top options bar reflects the active tool | Treat geometry as tools, group shape subtypes, and show context outside the tiny rail                              | Dark chrome, icon-only discoverability and expert-level density are unsuitable defaults for mixed-skill business users |
| boardmix              | A narrow tool rail selects a mode; a separate wide panel exposes the complete visual library                                          | Separate tool activation from catalog browsing; shapes should be visually scanned as presets                       | Its enormous diagram vocabulary and floating-whiteboard composition exceed PTD's scope                                 |
| Gaoding editor        | A labelled module rail opens a wide task-oriented content panel                                                                       | Chinese labels and task grouping make creation approachable; an Add/Components hub can organize many content types | Large marketing cards, New/VIP decoration and consumer-content emphasis conflict with PTD's precise workbench tone     |

## Current PTD shortcomings observed in the browser

At the end of the first implementation pass, the 44px Dock contained twelve visually equivalent
controls:

```text
Select
Text / Image / Free Table
Line / Rectangle / Ellipse / Star
Pages / Layers / Data / Components
```

Those controls have three different semantic outcomes—persistent tool activation, immediate schema
insertion, and resource-panel disclosure—but the rail does not make the distinction obvious.

The 220px component panel renders icon, name, two-line description and maturity badge for every
entry. Browser inspection at a 1280×720 workspace showed that group introductions and descriptions
fall to 9px, usable entries compete with planned entries, and the panel reads like documentation
rather than a fast creation surface. Four individual shape icons also consume permanent Dock space
and cannot scale to future presets.

## Adopted PTD direction

Use a deliberately hybrid model:

1. A slightly wider but still neutral tool rail with approximately 40px targets.
2. Two explicit zones: creation/mode tools and workspace resource panels.
3. One Shape tool group in the Dock, backed by the existing shared active-tool state.
4. A resource panel around 280px wide with:
   - a small 常用 section;
   - two-column content-component targets;
   - a direct shape-preset grid;
   - one collapsed 即将支持 section for all seven placeholders.
5. Context Bar guidance for active persistent drawing tools.
6. No always-visible 基础/复杂 badges; maturity is valuable product/catalog metadata but is not a
   repeated creation-time decision.

This structure preserves the professional tool mental model while remaining understandable to
Chinese business users who do not already know every Adobe shortcut.

## Hand and Text tool extension

The user asked to bring two more established graphics-editor conventions into the same tool model:

- A visible Hand tool pans only the viewport. `H` is the persistent tool shortcut; holding Space is a
  temporary override that restores the prior persistent tool on release. Panning is UI state and must
  never move template objects or enter history.
- Static Text should behave like an area-text pen: choosing it activates a persistent mode, and a
  paper drag defines the text frame before the component exists. This makes position and size a single
  direct manipulation and removes the inconsistent center-insert behavior from the primary text tool.

The Hand override requires a distinction between persistent active tool and effective current tool.
Text-frame preview can reuse the shape preview/history architecture, but it must create the existing
`RoySimpleText` type and keep `RoyText` as the separate insert-mode rich-text component for backward
compatibility.

The grouped Shape control must retain the same optical center as every other 40×40 Dock tool. Its
disclosure arrow should overlay a lower corner rather than reducing the main icon's layout cell and
pushing it sideways.

## Active-state refinement

The user rejected the first-pass cobalt left rule plus pale-cobalt background as visually cheap and
too similar to generic administration navigation. PTD should use a restrained state hierarchy:

- neutral raised-paper/keycap geometry and graphite contrast carry active-tool recognition;
- cobalt is limited to an icon accent and keyboard focus ring;
- open resource panels connect visually to their panel surface and do not reuse the tool-active
  treatment;
- shape presets use neutral edge/weight plus an optional small `当前` label, not a full selected fill;
- page/layer selection inside the resource panel uses the same neutral state family;
- ordinary controls use hairlines/inset edges instead of external button shadows;
- Context Bar guidance supplies the explicit mode name, so the Dock does not need a loud colored
  block.
