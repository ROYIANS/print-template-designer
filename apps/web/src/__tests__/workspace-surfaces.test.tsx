import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SaveAsSheet } from '../SaveAsSheet'
import { UnsavedDialog } from '../WorkspaceDialogs'

describe('workspace decision surfaces', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
  })

  it('uses a non-modal command sheet for Save As', async () => {
    const onConfirm = vi.fn()
    await act(async () => {
      root.render(
        <SaveAsSheet defaultValue="采购单 副本" onClose={vi.fn()} onConfirm={onConfirm} />,
      )
    })

    expect(container.querySelector('aside')).not.toBeNull()
    expect(container.querySelector('[role="dialog"]')).toBeNull()
    expect(container.textContent).not.toContain('DOCUMENT COMMAND')
    const input = container.querySelector<HTMLInputElement>('input')!
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
        input,
        '采购单 2026',
      )
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await act(async () => container.querySelector<HTMLFormElement>('form')?.requestSubmit())
    expect(onConfirm).toHaveBeenCalledWith('采购单 2026')
  })

  it('reserves a blocking alert dialog for discarding dirty content', async () => {
    const onDiscard = vi.fn()
    await act(async () => {
      root.render(<UnsavedDialog action="home" onCancel={vi.fn()} onDiscard={onDiscard} />)
    })

    expect(container.querySelector('[role="alertdialog"]')).not.toBeNull()
    expect(container.textContent).not.toContain('UNSAVED CHANGES')
    const discard = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('丢弃并返回'),
    )
    await act(async () => discard?.click())
    expect(onDiscard).toHaveBeenCalledTimes(1)
  })
})
