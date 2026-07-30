export type FontFamilyOption = [value: string, label: string]

/**
 * Authoring choices only: these values reference fonts installed on the user's machine.
 * PTD does not bundle, download, or redistribute any of the listed typefaces.
 */
export const CJK_FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  ["'Noto Serif SC', 'Noto Serif CJK SC', 'Source Han Serif SC', serif", 'Noto Serif SC'],
  ["'Sarasa UI SC', 'Sarasa Gothic SC', 'Microsoft YaHei UI', sans-serif", 'Sarasa UI SC'],
  ["'Microsoft YaHei UI', 'Microsoft YaHei', 'PingFang SC', sans-serif", '微软雅黑'],
  ["DengXian, 'Microsoft YaHei UI', 'PingFang SC', sans-serif", '等线'],
  ["SimHei, 'STHeiti', 'Heiti SC', sans-serif", '黑体'],
  ["SimSun, 'STSong', 'Songti SC', serif", '宋体'],
  ["KaiTi, 'STKaiti', 'Kaiti SC', serif", '楷体'],
  ["'FangSong_GB2312', FangSong, 'STFangsong', 'Fangsong SC', serif", '仿宋 GB2312'],
]

export const LATIN_FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  ['', '跟随中文字体'],
  ["'Outfit', 'Outfit Variable'", 'Outfit'],
  ["Arial, 'Helvetica Neue'", 'Arial'],
  ["'Times New Roman', Times", 'Times New Roman'],
]

export const DEFAULT_CJK_FONT_FAMILY = CJK_FONT_FAMILY_OPTIONS[0]![0]

export interface FontFamilySelection {
  cjk: string
  latin: string
  recognized: boolean
}

/**
 * Latin families come first so ASCII glyphs use the selected western face. When that
 * face has no CJK glyphs, the browser naturally falls through to the selected CJK stack.
 */
export function composeFontFamily(cjk: string, latin = ''): string {
  return latin ? `${latin}, ${cjk}` : cjk
}

export function resolveFontFamily(fontFamily: string): FontFamilySelection {
  if (!fontFamily.trim()) {
    return { cjk: DEFAULT_CJK_FONT_FAMILY, latin: '', recognized: true }
  }
  for (const [cjk] of CJK_FONT_FAMILY_OPTIONS) {
    for (const [latin] of LATIN_FONT_FAMILY_OPTIONS) {
      if (sameFontFamily(fontFamily, composeFontFamily(cjk, latin))) {
        return { cjk, latin, recognized: true }
      }
    }
  }
  return { cjk: fontFamily, latin: '', recognized: false }
}

function sameFontFamily(left: string, right: string): boolean {
  return normalizeFontFamily(left) === normalizeFontFamily(right)
}

function normalizeFontFamily(value: string): string {
  return value
    .replace(/["']/g, '')
    .split(',')
    .map((family) => family.trim().toLowerCase())
    .filter(Boolean)
    .join(',')
}
