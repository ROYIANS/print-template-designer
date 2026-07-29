import type { ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'

export interface ComplexTableCell {
  content?: string
  colSpan?: number
  rowSpan?: number
  style?: Record<string, unknown>
}

export interface ComplexTableSection {
  rows: ComplexTableCell[][]
}

export interface ComplexTablePropValue {
  header?: ComplexTableSection
  body?: ComplexTableSection
  footer?: ComplexTableSection
}

export class RoyComplexTable extends BaseComponent {
  constructor(schema: ComponentSchema) {
    super(schema)
  }

  protected render(): void {
    this.container.classList.add('ptd-complex-table')
    this.container.innerHTML = ''

    const propValue = this.schema.propValue as ComplexTablePropValue | null
    if (!propValue) return

    if (propValue.header) {
      const section = this.renderSection(propValue.header, 'thead')
      section.classList.add('ptd-complex-table__header')
      this.container.appendChild(section)
    }

    if (propValue.body) {
      const section = this.renderSection(propValue.body, 'tbody')
      section.classList.add('ptd-complex-table__body')
      this.container.appendChild(section)
    }

    if (propValue.footer) {
      const section = this.renderSection(propValue.footer, 'tfoot')
      section.classList.add('ptd-complex-table__footer')
      this.container.appendChild(section)
    }
  }

  private renderSection(
    section: ComplexTableSection,
    tagName: 'thead' | 'tbody' | 'tfoot',
  ): HTMLElement {
    const table = document.createElement('table')
    const sectionEl = document.createElement(tagName)
    table.appendChild(sectionEl)

    for (const row of section.rows) {
      const tr = document.createElement('tr')
      for (const cell of row) {
        const td = document.createElement(tagName === 'thead' ? 'th' : 'td')
        if (cell.colSpan && cell.colSpan > 1) td.colSpan = cell.colSpan
        if (cell.rowSpan && cell.rowSpan > 1) td.rowSpan = cell.rowSpan
        td.innerHTML = cell.content ?? ''
        tr.appendChild(td)
      }
      sectionEl.appendChild(tr)
    }

    return table
  }
}
