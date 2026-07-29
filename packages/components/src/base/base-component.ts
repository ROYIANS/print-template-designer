import type { ComponentSchema, ComponentStyle } from '@ptd/core'
import { applyCssVars } from './css-variables'
import { injectStylesheet } from './stylesheet'

export abstract class BaseComponent {
  protected container: HTMLElement
  protected schema: ComponentSchema

  constructor(schema: ComponentSchema) {
    this.schema = schema
    this.container = document.createElement('div')
    this.container.classList.add('ptd-component')
    injectStylesheet()
    this.applyStyles(schema.style)
    this.render()
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.container)
  }

  update(schema: ComponentSchema): void {
    this.schema = schema
    this.applyStyles(schema.style)
    this.render()
  }

  destroy(): void {
    this.container.remove()
  }

  protected applyStyles(style: ComponentStyle): void {
    applyCssVars(this.container, style)
  }

  protected abstract render(): void
}
