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
  white-space: var(--ptd-white-space, pre-wrap);
  overflow-wrap: anywhere;
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
  background: transparent;
}

.ptd-star__svg {
  width: 100%;
  height: 100%;
  display: block;
  fill: var(--ptd-background);
  pointer-events: none;
}

.ptd-image {
  background: var(--ptd-background);
  border: var(--ptd-border);
  border-radius: var(--ptd-border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ptd-image img {
  width: 100%;
  height: 100%;
  display: block;
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

.ptd-qrcode__inner,
.ptd-barcode__inner {
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

.ptd-render-state {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: grid;
  place-items: center;
  padding: 8px;
  color: #647184;
  background: rgb(231 236 243 / 46%);
  font-family: system-ui, sans-serif;
  font-size: 11px;
  line-height: 1.35;
  text-align: center;
}

.ptd-render-state[data-state='error'] {
  color: #9f3523;
  background: rgb(207 77 52 / 8%);
}

.ptd-group {
  position: absolute;
}

.ptd-simple-table {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.ptd-simple-table table {
  width: 100%;
  height: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.ptd-simple-table td {
  position: relative;
  box-sizing: border-box;
  padding: 0;
  border: var(--ptd-table-border-width) var(--ptd-table-border-style)
    var(--ptd-table-border-color);
  color: var(--ptd-table-color);
  background: var(--ptd-table-background);
  font-family: var(--ptd-table-font-family);
  font-size: var(--ptd-table-font-size);
  font-style: var(--ptd-table-font-style);
  font-weight: var(--ptd-table-font-weight);
  text-align: var(--ptd-table-horizontal-align);
  vertical-align: var(--ptd-table-vertical-align);
  overflow: hidden;
}

.ptd-simple-table__cell-content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: var(--ptd-table-padding);
  overflow: hidden;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  text-decoration: var(--ptd-table-text-decoration);
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
