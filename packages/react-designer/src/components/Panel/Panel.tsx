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

export function PanelTools(props: HTMLAttributes<HTMLDivElement>) {
  return <div className={styles.tools} {...props} />
}

export function PanelBody(props: HTMLAttributes<HTMLDivElement>) {
  return <div className={styles.body} {...props} />
}

export function PanelFooter(props: HTMLAttributes<HTMLDivElement>) {
  return <footer className={styles.footer} {...props} />
}
