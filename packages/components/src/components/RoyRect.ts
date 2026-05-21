import type { ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'

export class RoyRect extends BaseComponent {
  constructor(schema: ComponentSchema) {
    super(schema)
  }

  protected render(): void {
    this.container.classList.add('ptd-rect')
  }
}
