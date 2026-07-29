import type { ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'

interface QRCodeProps {
  text?: string
  colorDark?: string
  colorLight?: string
  correctLevel?: number
}

export class RoyQRCode extends BaseComponent {
  private qrContainer: HTMLDivElement | null = null

  constructor(schema: ComponentSchema) {
    super(schema)
  }

  protected render(): void {
    this.container.classList.add('ptd-qrcode')
    let qrContainer = this.container.querySelector<HTMLDivElement>('.ptd-qrcode__inner')
    if (!qrContainer) {
      qrContainer = document.createElement('div')
      qrContainer.className = 'ptd-qrcode__inner'
      qrContainer.style.width = '100%'
      qrContainer.style.height = '100%'
      this.container.appendChild(qrContainer)
    }
    this.qrContainer = qrContainer
    this.renderQRCode()
  }

  private renderQRCode(): void {
    if (!this.qrContainer) return
    const props = this.schema.propValue as QRCodeProps | null
    const text = props?.text ?? ''
    if (!text) return

    // Clear previous content
    this.qrContainer.innerHTML = ''

    // Dynamically import to allow tree-shaking and avoid issues in SSR/test
    import('easyqrcodejs')
      .then((mod) => {
        const QRCode = mod.default ?? mod
        if (!this.qrContainer) return
        new QRCode(this.qrContainer, {
          text,
          width: this.schema.style.width,
          height: this.schema.style.height,
          colorDark: props?.colorDark ?? '#000000',
          colorLight: props?.colorLight ?? '#ffffff',
          correctLevel: props?.correctLevel ?? 0,
        })
      })
      .catch(() => {
        // Silently fail if easyqrcodejs is not available (e.g., test env)
      })
  }
}
