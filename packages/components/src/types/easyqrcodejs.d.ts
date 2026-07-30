declare module 'easyqrcodejs' {
  interface QRCodeOptions {
    text?: string
    width?: number
    height?: number
    colorDark?: string
    colorLight?: string
    correctLevel?: number
    quietZone?: number
    onRenderingEnd?: (options: QRCodeOptions, dataURL: string) => void
  }

  class QRCode {
    constructor(element: HTMLElement, options: QRCodeOptions)
    clear(): void
    makeCode(text: string): void
  }

  export = QRCode
}
