# Context menu contract research

## Legacy behavior

`legacy/src/components/Editor/Editor.vue` attached a custom `RoyContext` menu to the full design
paper. It stored the right-click offset so mouse paste could position the copied component. Its
component menu provided Properties, Copy, Cut, Delete, Lock, Bring to front, Send to back, Move
forward and Move backward. A locked component exposed only Unlock. Blank state provided Properties
and Paste.

The legacy table component also had a cell-specific context menu for inserting/deleting rows and
columns. That behavior depends on a dedicated table editor and is intentionally outside the generic
canvas context-menu contract.

## Current React command surface

`EditorStore` already owns selection, clipboard, lock, deletion, four layer operations, grouping and
ungrouping. The Context Menu should call these commands rather than recreate mutations. The only
missing command is paste at an absolute paper position; current `paste(offset)` applies a repeated
relative offset.

The package already depends on `@radix-ui/react-context-menu`, and Tooltip portals already establish
the shared PTD theme pattern. Context Menu portal content should reuse that theme and the UI-system
overlay tokens.

## Architecture reconciliation

The current canvas-first workspace has four left resource destinations: Pages, Layers, Data and
Assets. Property editing is the right Inspector, while global/page information is the Page Inspector
shown when no component is selected. Therefore, implementing duplicate left-side Property and Global
forms would regress the accepted workspace model.

Pages currently switch existing pages; structural mutations belong to the multi-page task. Data
currently reads real `TemplateSchema.dataSource`; editing/import/preview belongs to the data-source
task. The remaining React Designer package work is the generic context menu and interaction
acceptance, not another panel-visual pass.
