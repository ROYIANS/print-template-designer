import { imageSourceError, normalizeImageProps, type ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'

export class RoyImage extends BaseComponent {
  constructor(schema: ComponentSchema) {
    super(schema)
  }

  protected render(): void {
    this.container.classList.add('ptd-image')
    let img = this.container.querySelector<HTMLImageElement>('img')
    if (!img) {
      img = document.createElement('img')
      this.container.appendChild(img)
    }
    let status = this.container.querySelector<HTMLDivElement>('.ptd-render-state')
    if (!status) {
      status = document.createElement('div')
      status.className = 'ptd-render-state'
      this.container.appendChild(status)
    }

    const props = normalizeImageProps(this.schema.propValue)
    const sourceError = imageSourceError(props.src)
    img.alt = props.alt
    img.style.objectFit = props.fit
    img.style.objectPosition = props.position
    img.onload = null
    img.onerror = null

    if (props.src.trim() === '') {
      img.hidden = true
      img.removeAttribute('src')
      setStatus(this.container, status, 'empty', '选择图片或输入图片地址')
      return
    }
    if (sourceError) {
      img.hidden = true
      img.removeAttribute('src')
      setStatus(this.container, status, 'error', sourceError)
      return
    }

    img.hidden = true
    setStatus(this.container, status, 'loading', '正在载入图片…')
    img.onload = () => {
      if (img?.src !== props.src && img?.getAttribute('src') !== props.src) return
      img.hidden = false
      status.hidden = true
      this.container.dataset.renderState = 'ready'
    }
    img.onerror = () => {
      img.hidden = true
      setStatus(this.container, status, 'error', '图片载入失败，请检查地址或重新选择')
    }
    img.src = props.src
  }
}

function setStatus(
  container: HTMLElement,
  status: HTMLDivElement,
  state: 'empty' | 'loading' | 'error',
  message: string,
): void {
  container.dataset.renderState = state
  status.dataset.state = state
  status.textContent = message
  status.hidden = false
}
