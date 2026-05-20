# Directory Structure

> How frontend code is organized in this project.

---

## Overview

<!--
Document your project's frontend directory structure here.

Questions to answer:
- Where do components live?
- How are features/modules organized?
- Where are shared utilities?
- How are assets organized?
-->

This is a Vue 2 print template designer library. The entry point is `src/components/index.js`, which exports `PtdDesigner` and `PtdViewer` as installable Vue plugins.

---

## Directory Layout

```
src/
  App.vue              # Demo app entry (not part of the library)
  main.js              # Demo app bootstrap
  assets/              # Global CSS, SCSS, iconfont
  components/          # All library components (the library root)
  mixin/               # Shared Vue mixins
  router/              # Vue Router (demo only, routes array is empty)
  stores/              # Vuex store
  utils/               # Pure utility functions
  views/               # Demo views (TemplateViews)
```

### `src/components/` layout

```
components/
  index.js             # Library install() entry — registers all public components
  config/              # Static config: componentList, editorConfig, paletteConfig, renderers
  Editor/              # Designer editor panels (DesignerAside, DesignerMain, etc.)
  Main/                # Top-level layout: Home.vue (PtdDesigner wrapper)
  PageComponents/      # Draggable canvas components (RoyText, RoyRect, RoyImage, …)
    style.js           # vue-styled-components definitions for all PageComponents
    RoyTable/          # Table component (sub-directory for complex components)
    WangEditorVue/     # Rich-text editor wrapper
  RoyContext/          # Right-click context menu
  RoyLoading/          # Loading overlay
  RoyModal/            # Modal dialog
  RoyUI/               # Internal UI component library (layout, color picker, sidebar)
    styles/            # Per-component SCSS files
    utils/             # RoyUI utility helpers
  RoyUserTour/         # Onboarding tour (shepherd.js wrapper)
  SketchRuler/         # Canvas ruler component
  ToolBar/             # Top toolbar
  Viewer/              # PtdViewer — read-only print preview
```

### `src/stores/` layout

```
stores/
  index.js             # Creates Vuex.Store with printTemplateModule
  modules/
    index.js           # Combines global state + sub-modules (nightMode, rulerThings)
    global.js          # Main state/mutations/actions/getters (spreads compose, snapshot, copy, lock, layer)
    compose.js         # Multi-select / group state
    snapshot.js        # Undo/redo state
    copy.js            # Clipboard state
    layer.js           # Layer ordering mutations
    lock.js            # Component lock mutations
    night-mode.js      # Dark mode toggle
    ruler-things.js    # Ruler visibility/position
```

---

## Module Organization

- New canvas components go in `src/components/PageComponents/` with a matching entry in `src/components/config/componentList.js`
- Complex components that need sub-files get their own sub-directory (e.g. `RoyTable/`)
- New store concerns go in a new `src/stores/modules/<name>.js` and are spread into `global.js` state or registered as a sub-module in `modules/index.js`
- Utility functions (pure, no Vue dependency) go in `src/utils/`

---

## Naming Conventions

- Vue SFCs: `PascalCase.vue` (e.g. `RoyText.vue`, `DesignerAside.vue`)
- JS utility files: `kebab-case.js` (e.g. `style-util.js`, `generateID.js`)
- SCSS files: match the component name they style (e.g. `RoyAside/index.scss`)
- Internal components start with `Roy` prefix; public API components start with `Ptd`
- Config files in `src/components/config/` export plain objects/arrays

---

## Anti-patterns

- Do not add routes to `src/router/index.js` — the library has no routing
- Do not put library code in `src/views/` — that directory is demo-only
- Do not create new top-level directories under `src/` without a clear category need
