import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Panel.module.css'

export function PanelRoot({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={[styles.root, className].filter(Boolean).join(' ')} {...props} />
}

export function PanelHeader({
  title,
  meta,
  children,
}: {
  title: string
  meta?: string
  children?: ReactNode
}) {
  return (
    <header className={styles.header}>
      <div>
        <h2>{title}</h2>
        {meta && <span>{meta}</span>}
      </div>
      {children}
    </header>
  )
}

export function PanelTools({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={[styles.tools, className].filter(Boolean).join(' ')} {...props} />
}

export function PanelBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={[styles.body, className].filter(Boolean).join(' ')} {...props} />
}

export function PanelFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <footer className={[styles.footer, className].filter(Boolean).join(' ')} {...props} />
}
