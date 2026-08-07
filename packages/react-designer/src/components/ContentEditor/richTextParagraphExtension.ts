import {
  DEFAULT_RICH_TEXT_PARAGRAPH_LAYOUT,
  normalizeRichTextParagraphLayout,
  paragraphAttributesFromLayout,
  parseRichTextParagraphPx,
  RICH_TEXT_PARAGRAPH_ATTRIBUTES,
} from '@ptd/components'
import { TextStyle } from '@tiptap/extension-text-style'

export const RichTextParagraph = TextStyle.extend({
  name: 'ptdRichTextParagraph',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          ptdParagraphLayout: {
            default: DEFAULT_RICH_TEXT_PARAGRAPH_LAYOUT,
            keepOnSplit: true,
            parseHTML: (element: HTMLElement) => ({
              spaceBefore: parseRichTextParagraphPx(
                element.getAttribute(RICH_TEXT_PARAGRAPH_ATTRIBUTES.spaceBefore),
              ) ?? 0,
              spaceAfter: parseRichTextParagraphPx(
                element.getAttribute(RICH_TEXT_PARAGRAPH_ATTRIBUTES.spaceAfter),
              ) ?? 0,
              firstLineIndent: parseRichTextParagraphPx(
                element.getAttribute(RICH_TEXT_PARAGRAPH_ATTRIBUTES.firstLineIndent),
              ) ?? 0,
            }),
            renderHTML: (attributes: Record<string, unknown>) => {
              const layout = normalizeRichTextParagraphLayout(attributes['ptdParagraphLayout'])
              const dataAttributes = paragraphAttributesFromLayout(layout)
              return {
                ...dataAttributes,
                style: `--ptd-paragraph-space-before: ${layout.spaceBefore}px; --ptd-paragraph-space-after: ${layout.spaceAfter}px; --ptd-paragraph-first-line-indent: ${layout.firstLineIndent}px`,
              }
            },
          },
        },
      },
    ]
  },
})
