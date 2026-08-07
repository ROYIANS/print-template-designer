# Cross-Layer Thinking Guide

> **Purpose**: Think through data flow across layers before implementing.

---

## The Problem

**Most bugs happen at layer boundaries**, not within layers.

Common cross-layer bugs:
- API returns format A, frontend expects format B
- Database stores X, service transforms to Y, but loses data
- Multiple layers implement the same logic differently

---

## Before Implementing Cross-Layer Features

### Step 1: Map the Data Flow

Draw out how data moves:

```
Source → Transform → Store → Retrieve → Transform → Display
```

For each arrow, ask:
- What format is the data in?
- What could go wrong?
- Who is responsible for validation?

### Step 2: Identify Boundaries

| Boundary | Common Issues |
|----------|---------------|
| API ↔ Service | Type mismatches, missing fields |
| Service ↔ Database | Format conversions, null handling |
| Backend ↔ Frontend | Serialization, date formats |
| Component ↔ Component | Props shape changes |

### Step 3: Define Contracts

For each boundary:
- What is the exact input format?
- What is the exact output format?
- What errors can occur?

---

## Common Cross-Layer Mistakes

### Mistake 1: Implicit Format Assumptions

**Bad**: Assuming date format without checking

**Good**: Explicit format conversion at boundaries

### Mistake 2: Scattered Validation

**Bad**: Validating the same thing in multiple layers

**Good**: Validate once at the entry point

### Mistake 3: Leaky Abstractions

**Bad**: Component knows about database schema

**Good**: Each layer only knows its neighbors

---

## Checklist for Cross-Layer Features

Before implementation:
- [ ] Mapped the complete data flow
- [ ] Identified all layer boundaries
- [ ] Defined format at each boundary
- [ ] Decided where validation happens

After implementation:
- [ ] Tested with edge cases (null, empty, invalid)
- [ ] Verified error handling at each boundary
- [ ] Checked data survives round-trip

---

## Cross-Platform Template Consistency

In Trellis, command templates (e.g., `record-session.md`) exist in **multiple platforms** with identical or near-identical content. This is a cross-layer boundary.

### Checklist: After Modifying Any Command Template

- [ ] Find all platforms with the same command: `find src/templates/*/commands/trellis/ -name "<command>.*"`
- [ ] Update all platform copies (Markdown `.md` and TOML `.toml`)
- [ ] For Gemini TOML: adapt line continuations (`\\` vs `\`) and triple-quoted strings
- [ ] Run `/trellis:check-cross-layer` to verify nothing was missed

**Real-world example**: Updated `record-session.md` in Claude to use `--mode record`, but forgot iFlow, Kilo, OpenCode, and Gemini — caught by cross-layer check.

---

## Generated Runtime Template Upgrade Consistency

Some generated files are both documentation and runtime input. In Trellis,
`.trellis/workflow.md` is parsed by `get_context.py`, `workflow_phase.py`,
SessionStart filters, and per-turn hooks. Template changes must be validated
against both fresh init and upgrade paths.

### Checklist: After Modifying A Runtime-Parsed Template

- [ ] Identify every runtime parser that reads the template, not just the file
  writer that installs it
- [ ] Check whether relevant syntax lives outside obvious managed regions
  such as tag blocks
- [ ] Verify fresh `init` output and a versioned `update` scenario that writes
  the older `.trellis/.version`
- [ ] Add an upgrade regression using an older pristine template fixture, then
  assert the installed file reaches the current packaged shape
- [ ] Update the backend spec that owns the runtime contract

**Real-world example**: Codex inline mode changed workflow platform markers from
`[Codex]` / `[Kilo, Antigravity, Windsurf]` to `[codex-sub-agent]` /
`[codex-inline, Kilo, Antigravity, Windsurf]`. Fresh init was correct, but
`trellis update` only merged `[workflow-state:*]` blocks and preserved stale
markers outside those blocks. Result: upgraded projects got new hook scripts
but old workflow routing, so `get_context.py --mode phase --platform codex`
could return empty Phase 2.1 detail.

---

## Mode-Detection Probe Checklist

When a CLI auto-detects a mode by probing a remote resource (e.g., checking if `index.json` exists to decide marketplace vs direct download):

### Before implementing:
- [ ] Probe runs in **ALL** code paths that use the result (interactive, `-y`, `--flag` combos)
- [ ] 404 vs transient error are distinguished — don't treat both as "not found"
- [ ] Transient errors **abort or retry**, never silently switch modes
- [ ] Shared state (caches, prefetched data) is **reset** when context changes (e.g., user switches source)
- [ ] **Shortcut paths** (e.g., `--template` skipping picker) must have the same error-handling quality as the probed path — check that downstream functions don't call catch-all wrappers

### After implementing:
- [ ] Trace every path from probe result to the mode-decision branch — no fallthrough
- [ ] External format contracts (giget URI, raw URLs) are tested or at least documented as comments
- [ ] Metadata reads consume a complete response or use a streaming parser — never parse a fixed-size prefix as full JSON
- [ ] When reconstructing a composite identifier from parsed parts, verify **all** fields are included and in the **correct position** (e.g., `provider:repo/path#ref` not `provider:repo#ref/path`)
- [ ] Verify that **action functions** called after a shortcut don't internally use the old catch-all fetch — they must use the probe-quality variant when error distinction matters

**Real-world example**: Custom registry flow had 8 bugs across 3 review rounds: (1) probe only ran in interactive mode, (2) transient errors fell through to wrong mode, (3) giget URI had `#ref` in wrong position, (4) prefetched templates leaked across source switches, (5) `--template` shortcut bypassed probe but `downloadTemplateById` internally used catch-all `fetchTemplateIndex`, turning timeouts into "Template not found".

**Real-world example**: Agent-session update hints fetched npm `latest` metadata with `response.read(4096)` and then parsed it as complete JSON. The `@mindfoldhq/trellis` package metadata exceeded 4 KB, so the JSON was truncated, parse failed silently, and the first session injection showed no update hint. Fix: read the complete response before parsing, and add a regression where `version` is followed by an 8 KB metadata tail.

---

## When to Create Flow Documentation

Create detailed flow docs when:
- Feature spans 3+ layers
- Multiple teams are involved
- Data format is complex
- Feature has caused bugs before

## Rich-Text Editor Boundary Contract

The PTD rich-text editor has three representations that must be treated as separate layers:

```
ProseMirror state → editor DOM → canonical HTML → RoyText output DOM
```

Keep these rules when changing the editor:

- Use the ProseMirror document (`doc.textBetween(...)`) as the source of truth for empty-state and
  placeholder decisions. DOM-only markers such as `ProseMirror-trailingBreak` are transient and can
  change during IME composition or selection updates.
- `canonicalizeRichTextHtml` is the boundary contract for persisted/output HTML. It may remove
  editor-only attributes (for example trailing-break classes), but it must preserve paragraph count
  and blank paragraphs as exactly one `<p><br></p>` each.
- Verify edit and output modes with the same paragraph layout variables and a round-trip test. A
  shared `.ptd-text__inner` selector must not accidentally apply display-only spacing to a different
  editor structure.
- BubbleMenu is a Portal. Every toolbar descendant needs the `data-ptd-editor-interactive` boundary,
  and selection-preserving handlers must cover both pointer buttons and native focus controls such as
  `<select>`. Native controls must restore the saved selection on `change`, not while their popup is
  opening; dispatching a ProseMirror transaction during `pointerdown` can close the browser's native
  dropdown immediately. A `shouldShow` predicate that only checks `from !== to` will hide the menu
  when a native control receives focus.

### Rich-text boundary checklist

- [ ] Empty placeholder follows editor state, including CJK IME input.
- [ ] Button, select, number input, color input and link controls preserve the selection.
- [ ] Toolbar remains mounted through native control focus and option change.
- [ ] `<p><br class="ProseMirror-trailingBreak"></p>` canonicalizes to one `<p><br></p>`.
- [ ] The same blank-line and paragraph-spacing geometry is measured in editing and output modes.

### Rich-text editor flow and overflow contract

The rendered `.ptd-text__inner` stylesheet is shared with the editor for typography and paragraph
tokens, but its CSS multi-column rules must not silently become the editor's one-column flow model.
When `columnCount` is `1`, the editor must opt out of CSS columns (`column-count: auto`) so a fixed
component height produces vertical overflow rather than synthetic horizontal columns. The editor
should use the component's external width as its inline constraint and expose only vertical scrolling;
otherwise a large inline font can put later paragraphs beside the first one and look like a phantom
leading blank line.

- [ ] Rich editor DOM carries an explicit `data-ptd-columns` mode derived from the schema.
- [ ] One-column edit mode overrides shared column CSS with a higher-specificity editor selector.
- [ ] Editor frame uses `overflow-x: hidden` and `overflow-y: auto`.
- [ ] Verify `scrollWidth === clientWidth` after applying a large font to a multi-paragraph selection.
- [ ] Inspect paragraph top coordinates; later paragraphs must stack below earlier paragraphs, not share
  the same top coordinate in a horizontal overflow column.
