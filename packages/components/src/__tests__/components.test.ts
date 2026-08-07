import { describe, it, expect } from 'vitest'
import type { ComponentSchema } from '@ptd/core'
import { RoySimpleText } from '../components/RoySimpleText'
import { RoyText } from '../components/RoyText'
import { RoyLine } from '../components/RoyLine'
import { RoyRect } from '../components/RoyRect'
import { RoyCircle } from '../components/RoyCircle'
import { RoyStar } from '../components/RoyStar'
import { RoyImage } from '../components/RoyImage'
import { RoyQRCode } from '../components/RoyQRCode'
import { RoyBarCode } from '../components/RoyBarCode'
import { RoyGroup } from '../components/RoyGroup'
import { RoySimpleTable } from '../components/RoySimpleTable'
import { RoyComplexTable } from '../components/RoyComplexTable'

function makeSchema(
  component: ComponentSchema['component'],
  propValue: unknown = '',
): ComponentSchema {
  return {
    id: `test-${component}`,
    component,
    propValue,
    style: {
      width: 100,
      height: 50,
      rotate: 0,
      opacity: 1,
      borderType: 'none',
    },
    groupStyle: {},
    position: {},
  }
}

const allComponents: Array<[string, () => unknown]> = [
  ['RoySimpleText', () => new RoySimpleText(makeSchema('RoySimpleText', 'hello'))],
  ['RoyText', () => new RoyText(makeSchema('RoyText', '<p>rich</p>'))],
  ['RoyLine', () => new RoyLine(makeSchema('RoyLine'))],
  ['RoyRect', () => new RoyRect(makeSchema('RoyRect'))],
  ['RoyCircle', () => new RoyCircle(makeSchema('RoyCircle'))],
  ['RoyStar', () => new RoyStar(makeSchema('RoyStar'))],
  ['RoyImage', () => new RoyImage(makeSchema('RoyImage', 'https://example.com/img.png'))],
  ['RoyQRCode', () => new RoyQRCode(makeSchema('RoyQRCode', { text: 'https://example.com' }))],
  [
    'RoyBarCode',
    () => new RoyBarCode(makeSchema('RoyBarCode', { text: '12345', bcid: 'code128' })),
  ],
  ['RoyGroup', () => new RoyGroup(makeSchema('RoyGroup'))],
  [
    'RoySimpleTable',
    () =>
      new RoySimpleTable(
        makeSchema('RoySimpleTable', {
          tableConfig: { rows: 2, cols: 2, layoutDetail: [] },
          tableData: {},
        }),
      ),
  ],
  [
    'RoyComplexTable',
    () =>
      new RoyComplexTable(
        makeSchema('RoyComplexTable', {
          body: { rows: [[{ content: 'A' }, { content: 'B' }]] },
        }),
      ),
  ],
]

describe('All components smoke test', () => {
  for (const [name, factory] of allComponents) {
    it(`${name} mounts without throwing`, () => {
      const comp = factory() as { mount: (el: HTMLElement) => void; destroy: () => void }
      const parent = document.createElement('div')
      expect(() => comp.mount(parent)).not.toThrow()
      expect(parent.children.length).toBeGreaterThan(0)
      expect(() => comp.destroy()).not.toThrow()
    })
  }

  it('renders the star as a self-contained SVG shape', () => {
    const component = new RoyStar(makeSchema('RoyStar'))
    const parent = document.createElement('div')
    component.mount(parent)

    const svg = parent.querySelector<SVGSVGElement>('.ptd-star__svg')
    expect(svg?.getAttribute('viewBox')).toBe('0 0 100 100')
    expect(svg?.querySelector('polygon')?.getAttribute('points')).toBeTruthy()
    expect(parent.querySelector('i')).toBeNull()

    component.destroy()
  })

  it('maps explicit rich-text paragraph attributes to shared CSS variables', () => {
    const component = new RoyText(
      makeSchema(
        'RoyText',
        '<p data-ptd-space-before="8" data-ptd-space-after="12" data-ptd-first-line-indent="24">正文</p>',
      ),
    )
    const parent = document.createElement('div')
    component.mount(parent)

    const paragraph = parent.querySelector('p') as HTMLElement
    expect(paragraph.style.getPropertyValue('--ptd-paragraph-space-before')).toBe('8px')
    expect(paragraph.style.getPropertyValue('--ptd-paragraph-space-after')).toBe('12px')
    expect(paragraph.style.getPropertyValue('--ptd-paragraph-first-line-indent')).toBe('24px')

    component.destroy()
  })
})
