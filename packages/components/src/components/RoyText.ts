import type { ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'
import { sanitizeRichTextHtml } from './richTextHtml'

export class RoyText extends BaseComponent {
  private inner: HTMLDivElement | null = null

  constructor(schema: ComponentSchema) {
    super(schema)
    this.inner = this.container.querySelector<HTMLDivElement>('.ptd-text__inner')
  }

  protected render(): void {
    this.container.classList.add('ptd-text')
    let inner = this.container.querySelector<HTMLDivElement>('.ptd-text__inner')
    if (!inner) {
      inner = document.createElement('div')
      inner.className = 'ptd-text__inner'
      this.container.appendChild(inner)
    }
    this.inner = inner
    const html = typeof this.schema.propValue === 'string' ? this.schema.propValue : ''
    inner.innerHTML = sanitizeRichTextHtml(html)
  }

  setContent(html: string): void {
    if (this.inner) {
      this.inner.innerHTML = sanitizeRichTextHtml(html)
    }
  }
}
