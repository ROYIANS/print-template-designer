import { barCodeContentError, normalizeBarCodeProps, type ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'

export class RoyBarCode extends BaseComponent {
  private barContainer: HTMLDivElement | null = null
  private renderToken = 0

  constructor(schema: ComponentSchema) {
    super(schema)
  }

  protected render(): void {
    this.container.classList.add('ptd-barcode')

    let barContainer = this.container.querySelector<HTMLDivElement>('.ptd-barcode__inner')
    if (!barContainer) {
      barContainer = document.createElement('div')
      barContainer.className = 'ptd-barcode__inner'
      this.container.appendChild(barContainer)
    }
    this.barContainer = barContainer
    this.renderBarCode()
  }

  private renderBarCode(): void {
    if (!this.barContainer) return
    const target = this.barContainer
    const token = ++this.renderToken
    const props = normalizeBarCodeProps(this.schema.propValue)
    const contentError = barCodeContentError(props)

    if (contentError) {
      setBarCodeStatus(this.container, target, 'error', contentError)
      return
    }
    setBarCodeStatus(this.container, target, 'loading', '正在生成条形码…')

    import('bwip-js')
      .then((mod) => {
        if (token !== this.renderToken || this.barContainer !== target) return
        const bwipjs = mod.default ?? mod
        const canvas = document.createElement('canvas')
        try {
          bwipjs.toCanvas(canvas, {
            bcid: props.bcid,
            text: props.text,
            scale: 2,
            barcolor: withoutHash(props.colorDark),
            textcolor: withoutHash(props.colorDark),
            backgroundcolor: backgroundColor(this.schema.style.background),
            includetext: props.includeText,
            textxalign: 'center',
            textsize: 10,
          })
          target.replaceChildren(canvas)
          this.container.dataset.renderState = 'ready'
        } catch {
          setBarCodeStatus(this.container, target, 'error', '条形码内容不符合当前码制')
        }
      })
      .catch(() => {
        if (token === this.renderToken && this.barContainer === target) {
          setBarCodeStatus(this.container, target, 'error', '条形码渲染模块载入失败')
        }
      })
  }

  override destroy(): void {
    this.renderToken += 1
    super.destroy()
  }
}

function withoutHash(value: string): string {
  return value.replace(/^#/, '')
}

function backgroundColor(value: unknown): string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? withoutHash(value) : 'ffffff'
}

function setBarCodeStatus(
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
