import { describe, expect, it } from 'vitest'
import {
  createSimpleTableProps,
  DEFAULT_PAGE_CONFIG,
  type ComponentSchema,
  type TemplateSchema,
} from '@ptd/core'
import { deriveDocumentColors } from '../components/PropertyInspector/inspectorColors'

function component(
  id: string,
  component: ComponentSchema['component'],
  propValue: unknown,
  style: Partial<ComponentSchema['style']> = {},
): ComponentSchema {
  return {
    id,
    component,
    propValue,
    style: { width: 10, height: 10, rotate: 0, opacity: 1, ...style },
    groupStyle: {},
    position: {},
  }
}

describe('inspector document colors', () => {
  it('derives normalized colors by frequency and stable document order', () => {
    const table = createSimpleTableProps(1, 1)
    const firstCell = Object.values(table.cells)[0]!
    firstCell.style = {
      ...firstCell.style,
      color: '#aabbcc',
      background: '#ffffff',
      borderColor: '#123456',
    }
    const template: TemplateSchema = {
      _version: 1,
      pageConfig: { ...DEFAULT_PAGE_CONFIG, background: '#FFF', color: '#123456' },
      pages: [
        {
          id: 'page-1',
          componentData: [
            component('text', 'RoySimpleText', '内容', {
              color: '#123456',
              background: 'transparent',
            }),
            component('qr', 'RoyQRCode', {
              text: 'PTD',
              colorDark: '#abcdef',
              colorLight: '#ffffff',
              correctLevel: 'M',
              margin: 4,
            }),
            component('table', 'RoySimpleTable', table),
          ],
        },
      ],
      dataSource: [],
      dataSet: {},
    }

    expect(deriveDocumentColors(template)).toEqual(['#ffffff', '#123456', '#abcdef', '#aabbcc'])
  })

  it('honors the palette size limit', () => {
    const template: TemplateSchema = {
      _version: 1,
      pageConfig: { ...DEFAULT_PAGE_CONFIG, background: '#111111', color: '#222222' },
      pages: [{ id: 'page-1', componentData: [] }],
      dataSource: [],
      dataSet: {},
    }

    expect(deriveDocumentColors(template, 1)).toEqual(['#111111'])
  })
})
