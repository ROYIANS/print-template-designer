import type { ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'

export class RoyGroup extends BaseComponent {
  private children: BaseComponent[] = []

  constructor(schema: ComponentSchema) {
    super(schema)
  }

  protected render(): void {
    this.container.classList.add('ptd-group')
    // Children are mounted externally via addChild
  }

  addChild(child: BaseComponent): void {
    this.children.push(child)
    child.mount(this.container)
  }

  override destroy(): void {
    for (const child of this.children) {
      child.destroy()
    }
    this.children = []
    super.destroy()
  }
}
