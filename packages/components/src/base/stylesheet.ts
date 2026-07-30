const STYLE_ID = 'ptd-components-styles'

const CSS = `
.ptd-component {
  box-sizing: border-box;
  position: absolute;
  width: var(--ptd-width);
  height: var(--ptd-height);
  transform: rotate(var(--ptd-rotate, 0deg));
  opacity: var(--ptd-opacity, 1);
  overflow: hidden;
}

.ptd-simple-text {
  color: var(--ptd-color);
  background: var(--ptd-background);
  border: var(--ptd-border);
  border-radius: var(--ptd-border-radius);
  font-size: var(--ptd-font-size);
  font-family: var(--ptd-font-family);
}

.ptd-simple-text__inner {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  word-break: break-all;
  justify-content: var(--ptd-justify-content);
  align-items: var(--ptd-align-items);
  padding: var(--ptd-padding);
  line-height: var(--ptd-line-height);
  letter-spacing: var(--ptd-letter-spacing);
  font-weight: var(--ptd-font-weight);
  font-style: var(--ptd-font-style);
  text-decoration: var(--ptd-text-decoration);
}

.ptd-text {
  color: var(--ptd-color);
  background: var(--ptd-background);
  border-radius: var(--ptd-border-radius);
  border: var(--ptd-border);
}

.ptd-text__inner {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: var(--ptd-padding);
  line-height: var(--ptd-line-height);
  letter-spacing: var(--ptd-letter-spacing);
  font-size: var(--ptd-font-size);
  font-family: var(--ptd-font-family);
}

.ptd-text__inner table {
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 1px;
  background-color: #000;
  padding: 1px;
}

.ptd-text__inner td {
  position: relative;
  background-color: #fff;
  overflow: hidden;
}

.ptd-text__inner p,
.ptd-text__inner h1,
.ptd-text__inner h2,
.ptd-text__inner h3,
.ptd-text__inner h4 {
  margin-block-start: 0;
  margin-block-end: 0;
}

.ptd-text__inner ul,
.ptd-text__inner ol {
  margin-block-start: 0;
  margin-block-end: 0;
  padding-inline-start: 1.5em;
}

.ptd-text__inner blockquote {
  margin-block-start: 0;
  margin-block-end: 0;
  padding-inline-start: 0.8em;
}

.ptd-line {
  background: var(--ptd-background);
}

.ptd-rect {
  background: var(--ptd-background);
  border: var(--ptd-border);
  border-radius: var(--ptd-border-radius);
}

.ptd-circle {
  background: var(--ptd-background);
  border: var(--ptd-border);
  border-radius: 100%;
}

.ptd-star {
  color: var(--ptd-background);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ptd-star .ptd-star__icon {
  font-size: var(--ptd-height);
  line-height: var(--ptd-height);
}

.ptd-image {
  background: var(--ptd-background);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ptd-border-width);
}

.ptd-image img {
  height: 100%;
  border-radius: var(--ptd-border-radius);
  border: var(--ptd-border);
}

.ptd-qrcode {
  background: var(--ptd-background);
  border: var(--ptd-border);
}

.ptd-qrcode canvas,
.ptd-qrcode img {
  width: 100%;
  height: 100%;
}

.ptd-barcode {
  background: var(--ptd-background);
  border: var(--ptd-border);
  position: relative;
}

.ptd-barcode canvas,
.ptd-barcode img {
  width: 100%;
  height: 100%;
}

.ptd-barcode__text {
  width: 100%;
  height: 14px;
  font-size: 12px;
  position: absolute;
  bottom: 0;
  left: 0;
  text-align: center;
}

.ptd-group {
  position: absolute;
}

.ptd-simple-table {
  color: var(--ptd-color);
  background: var(--ptd-background);
  width: 100%;
  height: auto;
  position: relative;
}

.ptd-simple-table table {
  width: 100%;
  border-collapse: separate;
  border-spacing: var(--ptd-border-spacing);
  background-color: var(--ptd-border-color);
}

.ptd-simple-table td {
  position: relative;
  padding: 2px;
  background-color: var(--ptd-background, #fff);
  overflow: hidden;
}

.ptd-complex-table {
  color: var(--ptd-color);
  background: var(--ptd-background);
  font-size: var(--ptd-font-size);
  font-family: var(--ptd-font-family);
  position: relative;
}

.ptd-complex-table table {
  width: 100%;
}

.ptd-complex-table th {
  text-align: center;
  font-weight: bold;
  padding: 0;
  word-break: break-all;
}

.ptd-complex-table td {
  padding: 0;
  word-break: break-all;
  position: relative;
}

.ptd-complex-table__body table {
  border-collapse: separate;
  border-spacing: var(--ptd-border-spacing);
  background-color: var(--ptd-border-color);
}

.ptd-complex-table__body td,
.ptd-complex-table__body th {
  position: relative;
  background-color: var(--ptd-background, #fff);
}
`

/**
 * Injects the shared component stylesheet into the document head once.
 * Safe to call multiple times — only injects once.
 */
export function injectStylesheet(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = CSS
  document.head.appendChild(style)
}
