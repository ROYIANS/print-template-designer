import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const themeCss = readFileSync(
  resolve(process.cwd(), 'src/components/Theme/Theme.module.css'),
  'utf8',
)
const inspectorCss = readFileSync(
  resolve(process.cwd(), 'src/components/PropertyInspector/PropertyInspector.module.css'),
  'utf8',
)

describe('Inspector visual contract', () => {
  it('defines the semantic surfaces, medium radius ladder, and exact field elevation', () => {
    expect(themeCss).toMatch(/--ptd-surface-form:\s*var\(--ptd-paper-2\)/)
    expect(themeCss).toMatch(/--ptd-surface-field:\s*var\(--ptd-paper-0\)/)
    expect(themeCss).toMatch(/--ptd-surface-selection:\s*var\(--ptd-paper-0\)/)
    expect(themeCss).toMatch(/--ptd-radius-control-sm:\s*4px/)
    expect(themeCss).toMatch(/--ptd-radius-control:\s*6px/)
    expect(themeCss).toMatch(/--ptd-radius-surface:\s*8px/)
    expect(themeCss).toMatch(/--ptd-radius-overlay:\s*12px/)
    expect(themeCss).toMatch(/--ptd-radius-shell:\s*14px/)
    expect(themeCss).toMatch(/--ptd-radius-1:\s*var\(--ptd-radius-control-sm\)/)
    expect(themeCss).toMatch(/--ptd-radius-2:\s*var\(--ptd-radius-control\)/)
    expect(themeCss).toMatch(
      /--ptd-shadow-field:\s*0 1px 2px rgb\(0 0 0 \/ 2%\),\s*0 0 1px rgb\(0 0 0 \/ 3%\)/,
    )
    expect(themeCss).toMatch(
      /--ptd-shadow-field-hover:\s*0 2px 4px rgb\(0 0 0 \/ 4%\),\s*0 1px 2px rgb\(0 0 0 \/ 6%\),\s*0 0 1px rgb\(0 0 0 \/ 6%\)/,
    )
    expect(themeCss).toMatch(/--ptd-shadow-selection:/)
    expect(themeCss).not.toMatch(/--ptd-focus:\s*var\(--ptd-(?:action|selection)/)
  })

  it('renders one continuous warm form canvas with only inset inter-section separators', () => {
    expect(inspectorCss).toMatch(/\.inspectorBody\s*{[^}]*background:\s*var\(--ptd-surface-form\)/s)
    expect(inspectorCss).toMatch(/\.inspectorView\s*{[^}]*min-height:\s*100%/s)
    expect(inspectorCss).toMatch(/\.section\s*{[^}]*border:\s*0/s)
    expect(inspectorCss).toMatch(
      /\.section \+ \.section::before\s*{[^}]*height:\s*1px;[^}]*margin:\s*0 var\(--ptd-space-3\);[^}]*background:\s*color-mix\(in oklch, var\(--ptd-border-subtle\) 48%, transparent\)/s,
    )
    expect(inspectorCss).toMatch(/\.sectionHeading\s*{[^}]*background:\s*transparent/s)
    expect(inspectorCss).toMatch(/\.disclosure\s*{[^}]*border:\s*0/s)
    expect(inspectorCss).toMatch(
      /\.disclosure\s*{[^}]*border-radius:\s*var\(--ptd-radius-surface\)/s,
    )
  })

  it('keeps normal, compact table, and coarse-pointer field sizes in one shared contract', () => {
    expect(inspectorCss).toMatch(
      /\.numberControl\s*{[^}]*height:\s*var\(--ptd-inspector-control-height, var\(--ptd-control-md\)\)/s,
    )
    expect(inspectorCss).toMatch(
      /\.textControl,[\s\S]*?\.selectControl\s*{[^}]*height:\s*var\(--ptd-inspector-control-height, var\(--ptd-control-md\)\)/,
    )
    expect(inspectorCss).toMatch(
      /\.tableFieldGrid\s*{[^}]*--ptd-inspector-control-height:\s*var\(--ptd-control-sm\)/s,
    )
    expect(inspectorCss).toMatch(
      /@media \(pointer: coarse\)[\s\S]*?\.tableFieldGrid\s*{[^}]*--ptd-inspector-control-height:\s*var\(--ptd-control-touch\)/,
    )
  })

  it('uses borderless elevated fields and full non-layout focus and invalid rings', () => {
    expect(inspectorCss).toMatch(/\.numberControl\s*{[^}]*border:\s*0/s)
    expect(inspectorCss).toMatch(
      /\.numberControl\s*{[^}]*border-radius:\s*var\(--ptd-radius-control\)/s,
    )
    expect(inspectorCss).toMatch(/\.numberControl\s*{[^}]*box-shadow:\s*var\(--ptd-shadow-field\)/s)
    expect(inspectorCss).toMatch(
      /\.textControl,[\s\S]*?\.selectControl\s*{[^}]*border:\s*0;[^}]*box-shadow:\s*var\(--ptd-shadow-field\)/,
    )
    expect(inspectorCss).toMatch(
      /\.numberControl:focus-within\s*{[^}]*outline:\s*2px solid var\(--ptd-focus\);[^}]*outline-offset:\s*1px/s,
    )
    expect(inspectorCss).toMatch(
      /\.numberControl:has\(input\[aria-invalid='true'\]\)\s*{[^}]*outline:\s*2px solid var\(--ptd-danger\)/s,
    )
  })

  it('uses white segmented tracks with inset neutral selected items and no bottom indicator', () => {
    expect(inspectorCss).toMatch(
      /\.segmented\s*{[^}]*background:\s*var\(--ptd-surface-field\);[^}]*box-shadow:\s*var\(--ptd-shadow-field\)/s,
    )
    expect(inspectorCss).toMatch(
      /\.segmented button\[aria-pressed='true'\]\s*{[^}]*border-color:\s*color-mix\([^}]*background:\s*var\(--ptd-surface-form\);[^}]*box-shadow:\s*none/s,
    )
    expect(inspectorCss).toMatch(
      /\.tableSegmented button\[aria-pressed='true'\]\s*{[^}]*border-color:\s*color-mix\([^}]*background:\s*var\(--ptd-surface-form\);[^}]*box-shadow:\s*none/s,
    )
    expect(inspectorCss).not.toMatch(/box-shadow:\s*inset 0 -/)
  })
})
