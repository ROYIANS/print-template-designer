import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import styles from './SaveAsSheet.module.css'

interface SaveAsSheetProps {
  defaultValue: string
  onClose(): void
  onConfirm(title: string): void
}

export function SaveAsSheet({ defaultValue, onClose, onConfirm }: SaveAsSheetProps) {
  const [title, setTitle] = useState(defaultValue)
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const normalized = title.trim()
  const valid = normalized.length > 0 && normalized.length <= 120

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    inputRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previous?.focus()
    }
  }, [onClose])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (valid) onConfirm(normalized)
  }

  return (
    <aside
      className={styles.sheet}
      aria-labelledby={`${inputId}-title`}
      data-ptd-editor-interactive
    >
      <header>
        <h2 id={`${inputId}-title`}>另存为</h2>
        <button type="button" onClick={onClose} aria-label="关闭另存为面板">
          ×
        </button>
      </header>
      <p className={styles.description}>创建一份独立服务器文档；当前模板和版本历史不会改变。</p>
      <form onSubmit={submit}>
        <label htmlFor={inputId}>新模板名称</label>
        <span className={styles.inputShell}>
          <input
            ref={inputRef}
            id={inputId}
            value={title}
            maxLength={120}
            autoComplete="off"
            onChange={(event) => setTitle(event.target.value)}
            aria-describedby={`${inputId}-hint`}
          />
          <span>{title.length}/120</span>
        </span>
        <small id={`${inputId}-hint`} data-error={!valid || undefined}>
          {normalized ? '名称会同步为新模板的页面标题' : '请输入模板名称'}
        </small>
        <footer>
          <button type="button" onClick={onClose}>
            取消
          </button>
          <button type="submit" disabled={!valid}>
            创建副本
          </button>
        </footer>
      </form>
    </aside>
  )
}
