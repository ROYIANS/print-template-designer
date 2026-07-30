import type { ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const STAR_POINTS =
  '50,0 61.8,36.2 100,36.2 69.1,58.6 80.9,95 50,72.4 19.1,95 30.9,58.6 0,36.2 38.2,36.2'

export class RoyStar extends BaseComponent {
  constructor(schema: ComponentSchema) {
    super(schema)
  }

  protected render(): void {
    this.container.classList.add('ptd-star')
    let svg = this.container.querySelector<SVGSVGElement>('.ptd-star__svg')
    if (!svg) {
      svg = document.createElementNS(SVG_NAMESPACE, 'svg')
      svg.classList.add('ptd-star__svg')
      svg.setAttribute('viewBox', '0 0 100 100')
      svg.setAttribute('preserveAspectRatio', 'none')
      svg.setAttribute('aria-hidden', 'true')
      svg.setAttribute('focusable', 'false')

      const polygon = document.createElementNS(SVG_NAMESPACE, 'polygon')
      polygon.setAttribute('points', STAR_POINTS)
      svg.appendChild(polygon)
      this.container.replaceChildren(svg)
    }
  }
}
