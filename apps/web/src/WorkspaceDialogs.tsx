import { useEffect, useId, useRef } from 'react'
import styles from './WorkspaceDialogs.module.css'

interface UnsavedDialogProps {
  action: 'new' | 'home'
  onCancel(): void
  onDiscard(): void
}

export function UnsavedDialog({ action, onCancel, onDiscard }: UnsavedDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
      )
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    cancelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previous?.focus()
    }
  }, [onCancel])

  const target = action === 'new' ? '新建空白模板' : '返回文件工作台'

  return (
    <div className={styles.backdrop} role="presentation">
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header>
          <h2 id={titleId}>要丢弃未保存的更改吗？</h2>
        </header>
        <div className={styles.notice}>
          <span aria-hidden="true">!</span>
          <p id={descriptionId}>
            当前设计与服务器保存版本不同。{target}会永久丢弃这些更改，但不会影响已保存的历史版本。
          </p>
        </div>
        <footer>
          <button ref={cancelRef} type="button" onClick={onCancel}>
            继续编辑
          </button>
          <button type="button" data-danger onClick={onDiscard}>
            丢弃并{action === 'new' ? '新建' : '返回'}
          </button>
        </footer>
      </section>
    </div>
  )
}
