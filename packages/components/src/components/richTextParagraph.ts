export const RICH_TEXT_PARAGRAPH_ATTRIBUTES = {
  spaceBefore: 'data-ptd-space-before',
  spaceAfter: 'data-ptd-space-after',
  firstLineIndent: 'data-ptd-first-line-indent',
} as const

export type RichTextParagraphAttribute = keyof typeof RICH_TEXT_PARAGRAPH_ATTRIBUTES

export interface RichTextParagraphLayout {
  readonly spaceBefore: number
  readonly spaceAfter: number
  readonly firstLineIndent: number
}

export const DEFAULT_RICH_TEXT_PARAGRAPH_LAYOUT: RichTextParagraphLayout = {
  spaceBefore: 0,
  spaceAfter: 0,
  firstLineIndent: 0,
}

export const MAX_RICH_TEXT_PARAGRAPH_PX = 1000

export function parseRichTextParagraphPx(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const text = String(value).trim()
  if (!/^\d+(?:\.\d+)?$/.test(text)) return null
  const number = Number(text)
  if (!Number.isFinite(number) || number < 0 || number > MAX_RICH_TEXT_PARAGRAPH_PX) return null
  return number
}

export function paragraphLayoutFromElement(element: Element): RichTextParagraphLayout {
  return {
    spaceBefore:
      parseRichTextParagraphPx(
        element.getAttribute(RICH_TEXT_PARAGRAPH_ATTRIBUTES.spaceBefore),
      ) ?? DEFAULT_RICH_TEXT_PARAGRAPH_LAYOUT.spaceBefore,
    spaceAfter:
      parseRichTextParagraphPx(element.getAttribute(RICH_TEXT_PARAGRAPH_ATTRIBUTES.spaceAfter)) ??
      DEFAULT_RICH_TEXT_PARAGRAPH_LAYOUT.spaceAfter,
    firstLineIndent:
      parseRichTextParagraphPx(
        element.getAttribute(RICH_TEXT_PARAGRAPH_ATTRIBUTES.firstLineIndent),
      ) ?? DEFAULT_RICH_TEXT_PARAGRAPH_LAYOUT.firstLineIndent,
  }
}

export function canonicalParagraphAttributes(element: Element): Record<string, string> {
  return paragraphAttributesFromLayout(paragraphLayoutFromElement(element))
}

export function normalizeRichTextParagraphLayout(value: unknown): RichTextParagraphLayout {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return DEFAULT_RICH_TEXT_PARAGRAPH_LAYOUT
  }
  const layout = value as Record<string, unknown>
  return {
    spaceBefore:
      parseRichTextParagraphPx(layout['spaceBefore']) ??
      DEFAULT_RICH_TEXT_PARAGRAPH_LAYOUT.spaceBefore,
    spaceAfter:
      parseRichTextParagraphPx(layout['spaceAfter']) ??
      DEFAULT_RICH_TEXT_PARAGRAPH_LAYOUT.spaceAfter,
    firstLineIndent:
      parseRichTextParagraphPx(layout['firstLineIndent']) ??
      DEFAULT_RICH_TEXT_PARAGRAPH_LAYOUT.firstLineIndent,
  }
}

export function paragraphAttributesFromLayout(value: RichTextParagraphLayout): Record<string, string> {
  const layout = normalizeRichTextParagraphLayout(value)
  const attributes: Record<string, string> = {}
  if (layout.spaceBefore > 0) {
    attributes[RICH_TEXT_PARAGRAPH_ATTRIBUTES.spaceBefore] = String(layout.spaceBefore)
  }
  if (layout.spaceAfter > 0) {
    attributes[RICH_TEXT_PARAGRAPH_ATTRIBUTES.spaceAfter] = String(layout.spaceAfter)
  }
  if (layout.firstLineIndent > 0) {
    attributes[RICH_TEXT_PARAGRAPH_ATTRIBUTES.firstLineIndent] = String(layout.firstLineIndent)
  }
  return attributes
}

export function applyRichTextParagraphStyles(root: ParentNode): void {
  for (const element of Array.from(root.querySelectorAll('p, h1, h2, h3, h4'))) {
    const layout = paragraphLayoutFromElement(element)
    const styled = element as HTMLElement
    styled.style.setProperty('--ptd-paragraph-space-before', `${layout.spaceBefore}px`)
    styled.style.setProperty('--ptd-paragraph-space-after', `${layout.spaceAfter}px`)
    styled.style.setProperty('--ptd-paragraph-first-line-indent', `${layout.firstLineIndent}px`)
  }
}
