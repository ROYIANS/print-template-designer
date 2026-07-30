import {
  normalizeQRCodeProps,
  qrCodeContentError,
  type ComponentSchema,
  type QRCodeErrorCorrection,
} from '@ptd/core'
import { BaseComponent } from '../base/base-component'

const CORRECTION_LEVEL: Record<QRCodeErrorCorrection, number> = { L: 1, M: 0, Q: 3, H: 2 }

export class RoyQRCode extends BaseComponent {
  private qrContainer: HTMLDivElement | null = null
  private renderToken = 0

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
    const target = this.qrContainer
    const token = ++this.renderToken
    const props = normalizeQRCodeProps(this.schema.propValue)
    const contentError = qrCodeContentError(props)

    if (contentError) {
      setCodeStatus(this.container, target, 'error', contentError)
      return
    }
    setCodeStatus(this.container, target, 'loading', '正在生成二维码…')

    import('easyqrcodejs')
      .then((mod) => {
        if (token !== this.renderToken || this.qrContainer !== target) return
        const QRCode = mod.default ?? mod
        target.replaceChildren()
        try {
          new QRCode(target, {
            text: props.text,
            width: this.schema.style.width,
            height: this.schema.style.height,
            colorDark: props.colorDark,
            colorLight: props.colorLight,
            correctLevel: CORRECTION_LEVEL[props.correctLevel],
            quietZone: props.margin,
          })
          this.container.dataset.renderState = 'ready'
        } catch {
          setCodeStatus(this.container, target, 'error', '二维码生成失败，请缩短或检查内容')
        }
      })
      .catch(() => {
        if (token === this.renderToken && this.qrContainer === target) {
          setCodeStatus(this.container, target, 'error', '二维码渲染模块载入失败')
        }
      })
  }

  override destroy(): void {
    this.renderToken += 1
    super.destroy()
  }
}

function setCodeStatus(
  container: HTMLElement,
  target: HTMLElement,
  state: 'loading' | 'error',
  message: string,
): void {
  const status = document.createElement('div')
  status.className = 'ptd-render-state'
  status.dataset.state = state
  status.textContent = message
  target.replaceChildren(status)
  container.dataset.renderState = state
}
