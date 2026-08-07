import type { ReactNode } from 'react'
import styles from './primitives.module.css'

export interface PtdFieldProps {
  label: string
  labelControl?: ReactNode
  wide?: boolean
  disabled?: boolean
  locked?: boolean
  invalid?: boolean
  error?: ReactNode
  children: ReactNode
}

export function PtdField({
  label,
  labelControl,
  wide = false,
  disabled = false,
  locked = false,
  invalid = false,
  error,
  children,
}: PtdFieldProps) {
  return (
    <div
      className={styles.field}
      data-ptd-region="field"
      data-wide={wide || undefined}
      data-disabled={disabled || undefined}
      data-locked={locked || undefined}
      data-invalid={invalid || undefined}
    >
      {labelControl ?? <span className={styles.fieldLabel}>{label}</span>}
      {children}
      {error && (
        <span className={styles.fieldError} role="status">
          {error}
        </span>
      )}
    </div>
  )
}
