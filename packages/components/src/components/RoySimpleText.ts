import { DataBindingEngine, normalizePlainText, type ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'

export class RoySimpleText extends BaseComponent {
  private inner: HTMLDivElement

  constructor(schema: ComponentSchema) {
    // inner is assigned before super calls render() via the field initializer trick
    // We must create it before super() calls render()
    // Use a workaround: assign after super, then re-render
    super(schema)
    // inner was created in render(), just keep the reference
    this.inner = this.container.querySelector('.ptd-simple-text__inner') as HTMLDivElement
  }

  protected render(): void {
    this.container.classList.add('ptd-simple-text')
    let inner = this.container.querySelector<HTMLDivElement>('.ptd-simple-text__inner')
    if (!inner) {
      inner = document.createElement('div')
      inner.className = 'ptd-simple-text__inner'
      this.container.appendChild(inner)
    }
    this.inner = inner
    if ((this.schema.style.columnCount ?? 1) > 1) {
      inner.dataset.ptdColumns = 'true'
    } else {
      delete inner.dataset.ptdColumns
    }
    const text = this.resolveText()
    inner.textContent = text
  }

  private resolveText(): string {
    const raw = typeof this.schema.propValue === 'string' ? this.schema.propValue : ''
    // If no data binding context, return raw value
    return normalizePlainText(raw)
  }

  resolveWithData(engine: DataBindingEngine): void {
    const raw = typeof this.schema.propValue === 'string' ? this.schema.propValue : ''
    if (this.inner) {
      this.inner.textContent = normalizePlainText(engine.resolve(raw))
    }
  }
}
