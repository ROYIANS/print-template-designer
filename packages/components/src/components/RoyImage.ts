import type { ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'

export class RoyImage extends BaseComponent {
  constructor(schema: ComponentSchema) {
    super(schema)
  }

  protected render(): void {
    this.container.classList.add('ptd-image')
    let img = this.container.querySelector<HTMLImageElement>('img')
    if (!img) {
      img = document.createElement('img')
      img.alt = ''
      this.container.appendChild(img)
    }
    const src = typeof this.schema.propValue === 'string' ? this.schema.propValue : ''
    img.src = src
  }
}
