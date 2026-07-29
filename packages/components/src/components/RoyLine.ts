import type { ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'

export class RoyLine extends BaseComponent {
  constructor(schema: ComponentSchema) {
    super(schema)
  }

  protected render(): void {
    this.container.classList.add('ptd-line')
    // Line is rendered purely via CSS — background color fills the element
    // Direction (horizontal/vertical) is controlled by width/height ratio
  }
}
