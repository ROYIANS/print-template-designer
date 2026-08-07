import { describe, expect, it } from 'vitest'
import { canonicalizeRichTextHtml, sanitizeRichTextHtml } from '../components/richTextHtml'

describe('sanitizeRichTextHtml', () => {
  it('keeps sanitizer output separate from the canonical blank-paragraph representation', () => {
    expect(sanitizeRichTextHtml('<p></p>')).toBe('<p></p>')
    expect(canonicalizeRichTextHtml('<p></p>')).toBe('<p><br></p>')
    expect(canonicalizeRichTextHtml('<p>  </p><p>正文</p><p>\n</p>')).toBe(
      '<p><br></p><p>正文</p><p><br></p>',
    )
  })

  it('sanitizes before canonicalizing blank paragraphs', () => {
    expect(canonicalizeRichTextHtml('<script>alert(1)</script><p></p>')).toBe('<p><br></p>')
  })

  it('keeps the supported semantic formatting subset', () => {
    expect(
      sanitizeRichTextHtml(
        '<h2 style="text-align:center">标题</h2><p><strong>粗体</strong><em>斜体</em></p>',
      ),
    ).toBe('<h2 style="text-align: center">标题</h2><p><strong>粗体</strong><em>斜体</em></p>')
  })

  it('drops executable content, event handlers and unsafe links', () => {
    const result = sanitizeRichTextHtml(
      '<script>alert(1)</script><p onclick="alert(2)">安全</p><a href="javascript:alert(3)">链接</a>',
    )
    expect(result).toBe('<p>安全</p><a>链接</a>')
  })

  it('unwraps unsupported layout tags and filters arbitrary styles', () => {
    expect(
      sanitizeRichTextHtml(
        '<div><span style="position:fixed;color:#123456;font-size:16px;background-image:url(x)">内容</span></div>',
      ),
    ).toBe('<span style="color: rgb(18, 52, 86); font-size: 16px">内容</span>')
  })

  it('keeps local office font fallback stacks without embedding font data', () => {
    expect(
      sanitizeRichTextHtml(
        '<p><span style="font-family: &quot;FangSong_GB2312&quot;, FangSong, STFangsong, serif">仿宋正文</span></p>',
      ),
    ).toBe(
      '<p><span style="font-family: &quot;FangSong_GB2312&quot;, FangSong, STFangsong, serif">仿宋正文</span></p>',
    )
  })

  it('keeps point sizes used by the print typography contract', () => {
    expect(sanitizeRichTextHtml('<p><span style="font-size: 10.5pt">正文</span></p>')).toBe(
      '<p><span style="font-size: 10.5pt">正文</span></p>',
    )
  })
})
