import type { ComponentStyle } from '@ptd/core'

/**
 * Computes the CSS border shorthand from style properties.
 */
function computeBorder(style: ComponentStyle): string {
  const { borderWidth, borderType, borderColor } = style
  if (!borderType || borderType === 'none') return 'none'
  return `${borderWidth ?? 0}px ${borderType} ${borderColor ?? '#212121'}`
}

/**
 * Computes the text-decoration value from style flags.
 */
function computeTextDecoration(style: ComponentStyle): string {
  const parts: string[] = []
  if (style.isUnderLine) parts.push('underline')
  if (style.isDelLine) parts.push('line-through')
  return parts.length > 0 ? parts.join(' ') : 'none'
}

/**
 * Applies CSS custom properties derived from a ComponentStyle onto an element.
 */
export function applyCssVars(el: HTMLElement, style: ComponentStyle): void {
  el.style.setProperty('--ptd-width', `${style.width}px`)
  el.style.setProperty('--ptd-height', `${style.height}px`)
  el.style.setProperty('--ptd-rotate', `${style.rotate ?? 0}deg`)
  el.style.setProperty('--ptd-opacity', String(style.opacity ?? 1))
  el.style.setProperty('--ptd-color', style.color ?? '#212121')
  el.style.setProperty('--ptd-background', style.background ?? 'transparent')
  el.style.setProperty('--ptd-font-size', `${style.fontSize ?? 12}pt`)
  el.style.setProperty(
    '--ptd-font-family',
    style.fontFamily && style.fontFamily !== 'default' ? style.fontFamily : 'inherit',
  )
  el.style.setProperty('--ptd-font-weight', style.fontWeight ?? 'normal')
  el.style.setProperty('--ptd-font-style', style.fontStyle ?? 'normal')
  el.style.setProperty('--ptd-line-height', style.lineHeight ?? '1')
  el.style.setProperty('--ptd-letter-spacing', `${style.letterSpacing ?? 0}px`)
  el.style.setProperty('--ptd-padding', `${style.padding ?? 0}px`)
  el.style.setProperty('--ptd-margin', `${style.margin ?? 0}px`)
  el.style.setProperty('--ptd-border', computeBorder(style))
  el.style.setProperty('--ptd-border-radius', style.borderRadius ?? 'inherit')
  el.style.setProperty('--ptd-justify-content', style.justifyContent ?? 'flex-start')
  el.style.setProperty('--ptd-align-items', style.alignItems ?? 'flex-start')
  el.style.setProperty('--ptd-text-decoration', computeTextDecoration(style))
  el.style.setProperty('--ptd-border-width', `${style.borderWidth ?? 0}px`)
  el.style.setProperty('--ptd-border-color', style.borderColor ?? '#212121')
  el.style.setProperty('--ptd-border-spacing', `${style.borderWidth ?? 0}px`)
}
