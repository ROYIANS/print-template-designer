import { describe, expect, it } from 'vitest'
import { isEditableTarget } from '../hooks/useEditorKeyboard'

describe('keyboard target guard', () => {
  it('skips native form fields and contenteditable descendants', () => {
    expect(isEditableTarget({ tagName: 'INPUT' } as unknown as EventTarget)).toBe(true)
    expect(isEditableTarget({ tagName: 'textarea' } as unknown as EventTarget)).toBe(true)
    expect(isEditableTarget({ tagName: 'SELECT' } as unknown as EventTarget)).toBe(true)
    expect(
      isEditableTarget({ tagName: 'DIV', isContentEditable: true } as unknown as EventTarget),
    ).toBe(true)
    expect(
      isEditableTarget({ tagName: 'SPAN', closest: () => ({}) } as unknown as EventTarget),
    ).toBe(true)
  })

  it('allows editor shortcuts for ordinary surfaces', () => {
    expect(
      isEditableTarget({ tagName: 'DIV', closest: () => null } as unknown as EventTarget),
    ).toBe(false)
    expect(isEditableTarget(null)).toBe(false)
  })
})
