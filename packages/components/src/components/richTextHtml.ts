const ALLOWED_TAGS = new Set([
  'A',
  'BLOCKQUOTE',
  'BR',
  'EM',
  'H1',
  'H2',
  'H3',
  'H4',
  'LI',
  'OL',
  'P',
  'S',
  'SPAN',
  'STRONG',
  'U',
  'UL',
])

const DROP_CONTENT_TAGS = new Set(['IFRAME', 'OBJECT', 'SCRIPT', 'STYLE', 'SVG'])
const ALLOWED_STYLES = new Set([
  'background-color',
  'color',
  'font-family',
  'font-size',
  'line-height',
  'text-align',
])
const ALLOWED_TEXT_ALIGN = new Set(['center', 'justify', 'left', 'right'])
const SAFE_LENGTH = /^\d+(?:\.\d+)?(?:em|pt|px|rem|%)$/
const SAFE_LINE_HEIGHT = /^(?:normal|\d+(?:\.\d+)?(?:em|px|rem|%)?)$/

export function sanitizeRichTextHtml(html: string): string {
  if (typeof document === 'undefined' || html.trim() === '') return ''
  const template = document.createElement('template')
  template.innerHTML = html
  sanitizeChildren(template.content)
  return template.innerHTML
}

/** Sanitizes rich text and gives every visually blank paragraph one explicit line box. */
export function canonicalizeRichTextHtml(html: string): string {
  const sanitized = sanitizeRichTextHtml(html)
  if (!sanitized) return '<p><br></p>'
  const template = document.createElement('template')
  template.innerHTML = sanitized
  for (const paragraph of Array.from(template.content.querySelectorAll('p'))) {
    if (isBlankParagraph(paragraph)) paragraph.replaceChildren(document.createElement('br'))
  }
  return template.innerHTML || '<p><br></p>'
}

function isBlankParagraph(paragraph: HTMLParagraphElement): boolean {
  return (paragraph.textContent ?? '').trim() === ''
}

function sanitizeChildren(parent: ParentNode): void {
  for (const child of Array.from(parent.childNodes)) {
    if (!(child instanceof Element)) continue
    if (DROP_CONTENT_TAGS.has(child.tagName)) {
      child.remove()
      continue
    }
    if (!ALLOWED_TAGS.has(child.tagName)) {
      sanitizeChildren(child)
      child.replaceWith(...Array.from(child.childNodes))
      continue
    }
    sanitizeElement(child)
    sanitizeChildren(child)
  }
}

function sanitizeElement(element: Element): void {
  const style = sanitizeStyle(element.getAttribute('style') ?? '')
  const href = element.tagName === 'A' ? sanitizeLink(element.getAttribute('href') ?? '') : null
  const target =
    element.tagName === 'A' && element.getAttribute('target') === '_blank' ? '_blank' : null
  for (const attribute of Array.from(element.attributes)) element.removeAttribute(attribute.name)
  if (style) element.setAttribute('style', style)
  if (!href) return
  element.setAttribute('href', href)
  element.setAttribute('rel', 'noopener noreferrer')
  if (target) element.setAttribute('target', target)
}

function sanitizeStyle(styleText: string): string {
  const probe = document.createElement('span')
  probe.setAttribute('style', styleText)
  const accepted: string[] = []
  for (const property of ALLOWED_STYLES) {
    const value = probe.style.getPropertyValue(property).trim()
    if (!value || !isSafeStyleValue(property, value)) continue
    accepted.push(`${property}: ${value}`)
  }
  return accepted.join('; ')
}

function isSafeStyleValue(property: string, value: string): boolean {
  if (/url\s*\(|expression\s*\(|[<>]/i.test(value)) return false
  if (property === 'font-size') return SAFE_LENGTH.test(value)
  if (property === 'line-height') return SAFE_LINE_HEIGHT.test(value)
  if (property === 'text-align') return ALLOWED_TEXT_ALIGN.has(value)
  if (property === 'font-family') return value.length <= 180
  return property === 'color' || property === 'background-color'
}

function sanitizeLink(href: string): string | null {
  const value = href.trim()
  if (!value) return null
  if (/^(?:https?:|mailto:)/i.test(value)) return value
  return null
}
