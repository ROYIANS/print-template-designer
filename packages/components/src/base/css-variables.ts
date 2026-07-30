import type { ComponentStyle } from '@ptd/core'

export type ComponentCssVariables = Record<`--ptd-${string}`, string>

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
  for (const [property, value] of Object.entries(componentStyleToCssVariables(style))) {
    el.style.setProperty(property, value)
  }
}

/** One source of truth for both framework-independent rendering and React authoring overlays. */
export function componentStyleToCssVariables(style: ComponentStyle): ComponentCssVariables {
  return {
    '--ptd-width': `${style.width}px`,
    '--ptd-height': `${style.height}px`,
    '--ptd-rotate': `${style.rotate ?? 0}deg`,
    '--ptd-opacity': String(style.opacity ?? 1),
    '--ptd-color': style.color ?? '#212121',
    '--ptd-background': style.background ?? 'transparent',
    '--ptd-font-size': `${style.fontSize ?? 12}pt`,
    '--ptd-font-family':
      style.fontFamily && style.fontFamily !== 'default' ? style.fontFamily : 'inherit',
    '--ptd-font-weight': style.fontWeight ?? 'normal',
    '--ptd-font-style': style.fontStyle ?? 'normal',
    '--ptd-line-height': style.lineHeight ?? '1',
    '--ptd-letter-spacing': `${style.letterSpacing ?? 0}px`,
    '--ptd-padding': `${style.padding ?? 0}px`,
    '--ptd-margin': `${style.margin ?? 0}px`,
    '--ptd-border': computeBorder(style),
    '--ptd-border-radius': style.borderRadius ?? 'inherit',
    '--ptd-justify-content': style.justifyContent ?? 'flex-start',
    '--ptd-align-items': style.alignItems ?? 'flex-start',
    '--ptd-text-decoration': computeTextDecoration(style),
    '--ptd-border-width': `${style.borderWidth ?? 0}px`,
    '--ptd-border-color': style.borderColor ?? '#212121',
    '--ptd-border-spacing': `${style.borderWidth ?? 0}px`,
  }
}
