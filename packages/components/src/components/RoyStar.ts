import type { ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'

interface StarProps {
  icon?: string
}

export class RoyStar extends BaseComponent {
  constructor(schema: ComponentSchema) {
    super(schema)
  }

  protected render(): void {
    this.container.classList.add('ptd-star')
    let icon = this.container.querySelector<HTMLElement>('.ptd-star__icon')
    if (!icon) {
      icon = document.createElement('i')
      icon.className = 'ptd-star__icon'
      this.container.appendChild(icon)
    }
    const props = this.schema.propValue as StarProps | null
    const iconClass = props?.icon ?? 'ri-star-fill'
    icon.className = `ptd-star__icon ${iconClass}`
  }
}
