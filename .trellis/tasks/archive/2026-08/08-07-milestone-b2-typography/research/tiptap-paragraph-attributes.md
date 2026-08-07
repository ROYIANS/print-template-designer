# Tiptap paragraph attribute research

## Question

Can the installed Tiptap version persist explicit paragraph-level attributes without introducing a second HTML renderer?

## Evidence

* The repository uses Tiptap `3.29.2` in `@ptd/react-designer`.
* The installed `@tiptap/core` declarations expose `addGlobalAttributes`, node `addAttributes`, and per-attribute `renderHTML` / `parseHTML` hooks.
* The same declarations document `addGlobalAttributes()` as the mechanism for adding attributes to existing nodes and show style parsing/rendering as an example.
* Existing `@ptd/components` sanitization removes arbitrary attributes and keeps only a small tag/style allow-list, so explicit PTD attributes must be captured, validated, canonicalized and re-emitted deliberately.

## Mapping to this repository

* Add one small Tiptap extension that targets `paragraph` and `heading` nodes and serializes the three bounded numeric attributes.
* Keep the persisted representation explicit and PTD-owned, for example `data-ptd-space-before`, `data-ptd-space-after`, and `data-ptd-first-line-indent`, with canonical canvas-pixel numbers.
* Extend `sanitizeRichTextHtml()` / `canonicalizeRichTextHtml()` to preserve only those attributes, reject malformed/non-finite/out-of-range values, and emit deterministic attribute ordering.
* Render the attributes to shared component CSS variables or direct CSS declarations in the output bundle; do not rely on editor-only CSS.
* Existing HTML without these attributes remains unchanged semantically and receives zero spacing/indent defaults.

## Recommendation

Use explicit PTD data attributes with numeric canvas-pixel values. Tiptap's global attribute hooks give a single parse/render path, while a dedicated sanitizer allow-list prevents arbitrary HTML attributes from becoming an output contract.
