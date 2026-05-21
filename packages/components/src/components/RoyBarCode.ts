import type { ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'

interface BarCodeProps {
  text?: string
  bcid?: string
  colorDark?: string
  includeText?: boolean
}

export class RoyBarCode extends BaseComponent {
  private barContainer: HTMLDivElement | null = null

  constructor(schema: ComponentSchema) {
    super(schema)
  }

  protected render(): void {
    this.container.classList.add('ptd-barcode')

    let barContainer = this.container.querySelector<HTMLDivElement>('.ptd-barcode__bar')
    if (!barContainer) {
      barContainer = document.createElement('div')
      barContainer.className = 'ptd-barcode__bar'
      this.container.appendChild(barContainer)
    }
    this.barContainer = barContainer

    const props = this.schema.propValue as BarCodeProps | null
    const includeText = props?.includeText ?? false

    barContainer.style.width = '100%'
    barContainer.style.height = includeText ? 'calc(100% - 14px)' : '100%'

    // Text label
    let textEl = this.container.querySelector<HTMLDivElement>('.ptd-barcode__text')
    if (includeText) {
      if (!textEl) {
        textEl = document.createElement('div')
        textEl.className = 'ptd-barcode__text'
        this.container.appendChild(textEl)
      }
      textEl.textContent = props?.text ?? ''
      textEl.style.color = props?.colorDark ?? '#000000'
      textEl.style.background = this.schema.style.background ?? 'transparent'
    } else if (textEl) {
      textEl.remove()
    }

    this.renderBarCode()
  }

  private renderBarCode(): void {
    if (!this.barContainer) return
    const props = this.schema.propValue as BarCodeProps | null
    const text = props?.text ?? ''
    if (!text) return

    this.barContainer.innerHTML = ''

    import('bwip-js')
      .then((mod) => {
        const bwipjs = mod.default ?? mod
        if (!this.barContainer) return
        const canvas = document.createElement('canvas')
        try {
          bwipjs.toCanvas(canvas, {
            bcid: props?.bcid ?? 'code128',
            text,
            scale: 2,
            barcolor: props?.colorDark ?? '000000',
          })
          this.barContainer?.appendChild(canvas)
        } catch {
          // Silently fail if barcode rendering fails (e.g., invalid bcid in test env)
        }
      })
      .catch(() => {
        // Silently fail if bwip-js is not available
      })
  }
}
