import { describe, expect, it } from 'vitest'
import {
  isEditorInteractiveTarget,
  isEditableTarget,
  isHandToolShortcut,
  isSelectToolShortcut,
  isTemporaryHandKey,
  getHostCommandShortcut,
} from '../hooks/useEditorKeyboard'

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

  it('preserves focus and native keyboard handling inside portal menus', () => {
    const portalItem = {
      tagName: 'DIV',
      closest: (selector: string) =>
        selector.includes('[data-ptd-portal-interactive]') ? {} : null,
    } as unknown as EventTarget

    expect(isEditableTarget(portalItem)).toBe(false)
    expect(isEditorInteractiveTarget(portalItem)).toBe(true)
    expect(
      isEditorInteractiveTarget({ tagName: 'DIV', closest: () => null } as unknown as EventTarget),
    ).toBe(false)
  })
})

describe('tool keyboard shortcuts', () => {
  it('returns to Select for V and Escape without intercepting paste', () => {
    expect(isSelectToolShortcut('v')).toBe(true)
    expect(isSelectToolShortcut('V')).toBe(true)
    expect(isSelectToolShortcut('Escape')).toBe(true)
    expect(isSelectToolShortcut('v', { command: true })).toBe(false)
    expect(isSelectToolShortcut('v', { alt: true })).toBe(false)
  })

  it('activates Hand with H and recognizes the Space override', () => {
    expect(isHandToolShortcut('h')).toBe(true)
    expect(isHandToolShortcut('H')).toBe(true)
    expect(isHandToolShortcut('h', { command: true })).toBe(false)
    expect(isHandToolShortcut('h', { alt: true })).toBe(false)
    expect(isTemporaryHandKey(' ', 'Space')).toBe(true)
    expect(isTemporaryHandKey('Space')).toBe(true)
    expect(isTemporaryHandKey('Spacebar')).toBe(true)
    expect(isTemporaryHandKey('Enter', 'Enter')).toBe(false)
  })
})

describe('host application shortcuts', () => {
  it('maps only declared application chord shapes to stable host commands', () => {
    expect(getHostCommandShortcut('s', { command: true })).toBe('save')
    expect(getHostCommandShortcut('S', { command: true, shift: true })).toBe('saveAs')
    expect(getHostCommandShortcut('n', { command: true })).toBe('new')
    expect(getHostCommandShortcut('o', { command: true })).toBe('open')
    expect(getHostCommandShortcut('n', { command: true, shift: true })).toBeNull()
    expect(getHostCommandShortcut('s')).toBeNull()
  })
})
