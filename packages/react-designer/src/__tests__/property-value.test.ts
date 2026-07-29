import { describe, expect, it } from 'vitest'
import type { ComponentSchema } from '@ptd/core'
import {
  isEditableTextPropValue,
  isHexColor,
  parseFiniteNumber,
  parseTextPropValue,
  scrubNumberValue,
} from '../components/PropertyInspector/propertyValue'

function component(type: ComponentSchema['component'], propValue: unknown): ComponentSchema {
  return {
    id: type,
    component: type,
    propValue,
    style: { width: 10, height: 10, rotate: 0, opacity: 1 },
    groupStyle: {},
    position: {},
  }
}

describe('property inspector value guards', () => {
  it('only exposes primitive values owned by text components', () => {
    expect(isEditableTextPropValue(component('RoySimpleText', 'text'))).toBe(true)
    expect(isEditableTextPropValue(component('RoyText', 12))).toBe(true)
    expect(isEditableTextPropValue(component('RoyImage', 'https://example.test/image.png'))).toBe(
      false,
    )
    expect(isEditableTextPropValue(component('RoySimpleTable', { tableData: {} }))).toBe(false)
    expect(isEditableTextPropValue(component('RoyGroup', []))).toBe(false)
  })

  it('preserves numeric prop values and rejects invalid numeric drafts', () => {
    expect(parseTextPropValue(12, '12.5')).toBe(12.5)
    expect(parseTextPropValue(12, 'not a number')).toBeNull()
    expect(parseTextPropValue('12', '13')).toBe('13')
    expect(parseFiniteNumber('', { min: 1 })).toBeNull()
    expect(parseFiniteNumber('-4', { min: 1 })).toBe(1)
    expect(parseFiniteNumber('3', { max: 1 })).toBe(1)
  })

  it('accepts only six-digit hex colors', () => {
    expect(isHexColor('#cf4d34')).toBe(true)
    expect(isHexColor('#fff')).toBe(false)
    expect(isHexColor('mixed')).toBe(false)
  })

  it('calculates normal, accelerated, precise and clamped scrub values', () => {
    expect(scrubNumberValue(100, 8)).toBe(104)
    expect(scrubNumberValue(100, -8, { shiftKey: true })).toBe(60)
    expect(scrubNumberValue(10, 8, { altKey: true })).toBe(10.4)
    expect(scrubNumberValue(98, 8, { max: 100 })).toBe(100)
    expect(scrubNumberValue(2, -8, { min: 1 })).toBe(1)
    expect(scrubNumberValue(1, 8, { step: 5 })).toBe(21)
  })
})
