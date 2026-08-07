import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const editorSource = readFileSync(
  resolve(process.cwd(), 'src/components/ContentEditor/ContentEditor.tsx'),
  'utf8',
)
const editorCss = readFileSync(
  resolve(process.cwd(), 'src/components/ContentEditor/ContentEditor.module.css'),
  'utf8',
)

describe('RichText editor flow contract', () => {
  it('separates one-column editing flow from the shared output column stylesheet', () => {
    expect(editorSource).toMatch(/data-ptd-columns.*columnCount/) 
    expect(editorCss).toMatch(
      /\.richContent \.richEditable\[data-ptd-columns='false'\][\s\S]*?column-count:\s*auto/,
    )
    expect(editorCss).toMatch(/\.editorFrame\s*\{[\s\S]*?overflow-x:\s*hidden/)
    expect(editorCss).toMatch(/\.editorFrame\s*\{[\s\S]*?overflow-y:\s*auto/)
  })
})
