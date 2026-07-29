import { describe, it, expect, beforeEach } from 'vitest'
import { applyCssVars } from '../base/css-variables'
import type { ComponentStyle } from '@ptd/core'

const baseStyle: ComponentStyle = {
  width: 100,
  height: 50,
  rotate: 45,
  opacity: 0.8,
  fontSize: 14,
  fontFamily: 'Arial',
  color: '#ff0000',
  background: '#ffffff',
  borderWidth: 2,
  borderColor: '#000000',
  borderType: 'solid',
  borderRadius: '4px',
  padding: '5',
  margin: '0',
  lineHeight: '1.5',
  letterSpacing: '1',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: 'bold',
  fontStyle: 'italic',
  isUnderLine: true,
  isDelLine: false,
}

describe('applyCssVars', () => {
  let el: HTMLElement

  beforeEach(() => {
    el = document.createElement('div')
  })

  it('sets --ptd-width and --ptd-height', () => {
    applyCssVars(el, baseStyle)
    expect(el.style.getPropertyValue('--ptd-width')).toBe('100px')
    expect(el.style.getPropertyValue('--ptd-height')).toBe('50px')
  })

  it('sets --ptd-rotate', () => {
    applyCssVars(el, baseStyle)
    expect(el.style.getPropertyValue('--ptd-rotate')).toBe('45deg')
  })

  it('sets --ptd-opacity', () => {
    applyCssVars(el, baseStyle)
    expect(el.style.getPropertyValue('--ptd-opacity')).toBe('0.8')
  })

  it('sets --ptd-color and --ptd-background', () => {
    applyCssVars(el, baseStyle)
    expect(el.style.getPropertyValue('--ptd-color')).toBe('#ff0000')
    expect(el.style.getPropertyValue('--ptd-background')).toBe('#ffffff')
  })

  it('sets --ptd-font-size in pt', () => {
    applyCssVars(el, baseStyle)
    expect(el.style.getPropertyValue('--ptd-font-size')).toBe('14pt')
  })

  it('sets --ptd-font-family', () => {
    applyCssVars(el, baseStyle)
    expect(el.style.getPropertyValue('--ptd-font-family')).toBe('Arial')
  })

  it('uses inherit for default font-family', () => {
    applyCssVars(el, { ...baseStyle, fontFamily: 'default' })
    expect(el.style.getPropertyValue('--ptd-font-family')).toBe('inherit')
  })

  it('sets --ptd-border from borderWidth/borderType/borderColor', () => {
    applyCssVars(el, baseStyle)
    expect(el.style.getPropertyValue('--ptd-border')).toBe('2px solid #000000')
  })

  it('sets --ptd-border to none when borderType is none', () => {
    applyCssVars(el, { ...baseStyle, borderType: 'none' })
    expect(el.style.getPropertyValue('--ptd-border')).toBe('none')
  })

  it('sets --ptd-text-decoration for underline', () => {
    applyCssVars(el, { ...baseStyle, isUnderLine: true, isDelLine: false })
    expect(el.style.getPropertyValue('--ptd-text-decoration')).toBe('underline')
  })

  it('sets --ptd-text-decoration for both underline and strikethrough', () => {
    applyCssVars(el, { ...baseStyle, isUnderLine: true, isDelLine: true })
    expect(el.style.getPropertyValue('--ptd-text-decoration')).toBe('underline line-through')
  })

  it('sets --ptd-text-decoration to none when neither flag is set', () => {
    applyCssVars(el, { ...baseStyle, isUnderLine: false, isDelLine: false })
    expect(el.style.getPropertyValue('--ptd-text-decoration')).toBe('none')
  })
})
