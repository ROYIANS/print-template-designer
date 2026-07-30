import { imageSourceError, normalizeImageProps, type ComponentSchema } from '@ptd/core'
import { BaseComponent } from '../base/base-component'

type ImageRenderState = 'empty' | 'loading' | 'error'

interface ImageRenderSession {
  image: HTMLImageElement | null
}

const renderSessions = new WeakMap<RoyImage, ImageRenderSession>()

export class RoyImage extends BaseComponent {
  constructor(schema: ComponentSchema) {
    super(schema)
  }

  protected render(): void {
    this.container.classList.add('ptd-image')
    invalidateSession(this)

    const props = normalizeImageProps(this.schema.propValue)
    const sourceError = imageSourceError(props.src)

    if (props.src.trim() === '') {
      setStatus(this.container, 'empty', '选择图片或输入图片地址')
      return
    }
    if (sourceError) {
      setStatus(this.container, 'error', sourceError)
      return
    }

    const image = document.createElement('img')
    const session: ImageRenderSession = { image }
    renderSessions.set(this, session)
    image.alt = props.alt
    image.style.objectFit = props.fit
    image.style.objectPosition = props.position

    setStatus(this.container, 'loading', '正在载入图片…')
    image.onload = () => {
      if (renderSessions.get(this) !== session) return
      clearImageHandlers(image)
      session.image = null
      this.container.replaceChildren(image)
      this.container.dataset.renderState = 'ready'
    }
    image.onerror = () => {
      if (renderSessions.get(this) !== session) return
      clearImageHandlers(image)
      session.image = null
      setStatus(this.container, 'error', '图片载入失败，请检查地址或重新选择')
    }
    image.src = props.src
  }

  override destroy(): void {
    invalidateSession(this)
    renderSessions.delete(this)
    super.destroy()
  }
}

function setStatus(container: HTMLElement, state: ImageRenderState, message: string): void {
  const status = document.createElement('div')
  status.className = 'ptd-render-state'
  container.dataset.renderState = state
  status.dataset.state = state
  status.textContent = message
  container.replaceChildren(status)
}

function invalidateSession(component: RoyImage): void {
  const session = renderSessions.get(component)
  if (session?.image) clearImageHandlers(session.image)
  renderSessions.delete(component)
}

function clearImageHandlers(image: HTMLImageElement): void {
  image.onload = null
  image.onerror = null
}
