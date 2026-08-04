import { barCodeContentError, normalizeBarCodeProps, type ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'

interface BarCodeRenderSession {
  readonly target: HTMLDivElement
}

const renderSessions = new WeakMap<RoyBarCode, BarCodeRenderSession>()

export class RoyBarCode extends BaseComponent {
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
    this.renderBarCode(barContainer)
  }

  private renderBarCode(target: HTMLDivElement): void {
    const session: BarCodeRenderSession = { target }
    renderSessions.set(this, session)
    const props = normalizeBarCodeProps(this.schema.propValue)
    const contentError = barCodeContentError(props)

    if (contentError) {
      setBarCodeStatus(this.container, target, 'error', contentError)
      return
    }
    setBarCodeStatus(this.container, target, 'loading', '正在生成条形码…')

    import('bwip-js')
      .then((mod) => {
        if (renderSessions.get(this) !== session) return
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
        if (renderSessions.get(this) === session) {
          setBarCodeStatus(this.container, target, 'error', '条形码渲染模块载入失败')
        }
      })
  }

  override destroy(): void {
    renderSessions.delete(this)
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
