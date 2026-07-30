import { describe, expect, it } from 'vitest'
import {
  CJK_FONT_FAMILY_OPTIONS,
  composeFontFamily,
  LATIN_FONT_FAMILY_OPTIONS,
  resolveFontFamily,
} from '../config/typography'

describe('font family authoring', () => {
  it('composes a western-first fallback stack for mixed-script content', () => {
    const cjk = CJK_FONT_FAMILY_OPTIONS.find(([, label]) => label === '宋体')![0]
    const latin = LATIN_FONT_FAMILY_OPTIONS.find(([, label]) => label === 'Outfit')![0]

    expect(composeFontFamily(cjk, latin)).toBe(
      "'Outfit', 'Outfit Variable', SimSun, 'STSong', 'Songti SC', serif",
    )
  })

  it('resolves browser-normalized quotes back to the shared authoring choices', () => {
    expect(
      resolveFontFamily(
        '"Times New Roman", Times, "FangSong_GB2312", FangSong, "STFangsong", "Fangsong SC", serif',
      ),
    ).toMatchObject({
      latin: "'Times New Roman', Times",
      cjk: "'FangSong_GB2312', FangSong, 'STFangsong', 'Fangsong SC', serif",
      recognized: true,
    })
  })

  it('preserves an unknown local font stack until the user changes it', () => {
    expect(resolveFontFamily("'My Local Font', sans-serif")).toEqual({
      cjk: "'My Local Font', sans-serif",
      latin: '',
      recognized: false,
    })
  })

  it('uses the shared CJK default when a text mark has no explicit font', () => {
    expect(resolveFontFamily('')).toMatchObject({ latin: '', recognized: true })
  })
})
