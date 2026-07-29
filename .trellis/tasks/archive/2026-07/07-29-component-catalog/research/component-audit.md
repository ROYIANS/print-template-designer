# Component inventory and professional-tool interaction audit

## Current inventory

The core registry contains 12 types. Eleven are user-creatable; `RoyGroup` is created only by the
Group command and is correctly excluded from the catalog.

| Existing type     | Current behavior boundary                   | Product decision                    |
| ----------------- | ------------------------------------------- | ----------------------------------- |
| `RoySimpleText`   | Lightweight string/number text renderer     | Keep as 文本, 基础                  |
| `RoyText`         | HTML-rich multi-paragraph renderer          | Keep as 富文本, 复杂                |
| `RoySimpleTable`  | Fixed grid, spans and per-cell content      | Keep as 自由表格, 复杂              |
| `RoyComplexTable` | Header/body/footer section structure        | Keep as 结构表格, 复杂              |
| `RoyImage`        | Bitmap URL renderer                         | Keep as 图片, 基础                  |
| `RoyQRCode`       | QR encoding renderer                        | Keep as 二维码, 基础                |
| `RoyBarCode`      | One-dimensional barcode renderer            | Keep as 条形码, 基础                |
| `RoyLine`         | CSS-filled line with rotation support       | Keep as 直线, 基础, draw tool       |
| `RoyRect`         | Filled/bordered rectangle                   | Keep as 矩形, 基础, draw tool       |
| `RoyCircle`       | 100% radius shape; can be elliptical        | Keep as 椭圆, 基础, draw tool       |
| `RoyStar`         | Decorative star marker                      | Keep as 星形, 基础, draw tool       |
| `RoyGroup`        | Structural container created from selection | Internal only, never a catalog item |

The inventory matches the legacy component list almost exactly. The v2 catalog therefore needs a
product organization and an extensible creation model rather than another mechanical migration.

## Redundancy analysis

### Text

Simple text and rich text overlap conceptually, as professional layout tools usually expose one Type
tool with point-text and area-text modes. They are not technically redundant today: they have
different stored values, renderer behavior and editing expectations. Keep both until text editing,
flow and binding contracts are designed together.

### Tables

“Simple” and “complex” describe implementation difficulty, not user intent. Their structures are
different enough to keep: a free fixed-cell grid versus a sectioned report structure. Rename them so
the distinction is discoverable. A future data table may replace or build on both.

### Shapes

Rectangle, ellipse and star should eventually be presets of one Shape renderer, not three unrelated
classes. Removing them now would break existing `ComponentType` values and templates. Keep the
catalog tools together and defer consolidation to an explicit schema-migration task.

### UI entry points

The current Tool Dock repeats component creation actions from the full component panel. Professional
tool rails represent active modes and very frequent placement actions, while panels expose the full
inventory. The catalog should be authoritative; the dock should communicate selection versus
drawing state, not behave as a second component list.

The “资产与组件” label is misleading: the panel contains no uploads, reusable assets or asset
management. Rename it “组件”; add a future Assets panel only when storage and insertion contracts
exist.

## Missing capabilities and placeholder policy

Prioritized gaps based on print-template workflows:

1. **数据字段 / 表达式文本** — a discoverable field insertion/binding flow, potentially a preset of
   the text renderer rather than a new renderer type.
2. **页码 / 总页数 / 日期时间** — print-context values that ordinary static text cannot resolve at
   design time.
3. **重复明细 / 列表** — collection rendering with a row template and overflow behavior.
4. **数据驱动表格 / 自动分页表格** — columns, repeated headers, row splitting and page flow.
5. **SVG / 图标** — resolution-independent marks and symbols; bitmap Image is insufficient for many
   print assets.
6. **容器 / Frame** — clipping, background and child-layout semantics beyond Group.
7. **条件显示** — a cross-component capability, not necessarily a renderer.

The user explicitly asked to reserve these component concepts in the catalog before their
implementations are ready. They should appear as disabled “规划中” placeholders. A planned item must
not carry a `ComponentType`, draggable payload or creation callback. This keeps the inventory honest
while making product direction visible.

## Photoshop / Illustrator interaction model

Across Photoshop, Illustrator and similar professional layout/graphics tools, geometric items are
created through persistent tools rather than immediately appearing when a toolbar icon is clicked:

1. The user chooses a rectangle, ellipse, line or polygon-like tool.
2. The pointer changes to a precision/crosshair cursor and the tool remains visibly selected.
3. Pointer down defines an origin; drag defines geometry with live feedback; pointer up commits it.
4. Shift constrains proportions or angles.
5. The same tool remains active for repeated drawing until the Selection tool or a shortcut replaces
   it; Escape cancels transient work.

Why this convention matters:

- It lets users decide both position and size in one direct manipulation.
- Persistent tools make repeated layout work efficient.
- A transient outline separates preview from committed document history.
- The Selection tool is an explicit neutral mode, preventing accidental insertion.

PTD should adopt this model for its four existing shape schemas without changing stored types. Other
components can later use the same architecture for area-text frames, image frames or table placement,
but broadening placement modes now would make the task substantially larger.

## Geometry mapping to the current schema

Closed shapes normalize the two pointer coordinates into a positive rectangle. Reverse-direction
drawing therefore produces the same schema form. Shift makes width and height equal using the
smaller available drag extent after considering page boundaries.

A line maps endpoints to the existing center-based component geometry:

```text
dx = end.x - start.x
dy = end.y - start.y
length = hypot(dx, dy)
angle = atan2(dy, dx) in degrees
midpoint = ((start.x + end.x) / 2, (start.y + end.y) / 2)
left = midpoint.x - length / 2
top = midpoint.y - lineHeight / 2
```

The drawing preview remains local UI state. Only a valid pointer-up operation calls
`store.addComponent`, which preserves a single onChange/history mutation per created object. Pointer
cancel, Escape, blur and drags under 4 CSS pixels clear preview state without adding anything.

## Adopted catalog taxonomy

Use five user-intent groups independent of persisted schema categories:

1. 文本 — static/rich text plus planned dynamic and print-context presets.
2. 表格 — free/sectioned tables plus planned repeating/data-flow structures.
3. 图像 — bitmap placement plus planned vector assets.
4. 编码 — QR and barcode.
5. 图形 — line, rectangle, ellipse and star draw tools plus planned Frame.

This taxonomy accommodates later presets and renderers without changing existing template
categories.
