import type { CSSProperties } from 'react'
import styles from './Area.module.css'

interface AreaProps {
  left: number
  top: number
  width: number
  height: number
}

export function Area({ left, top, width, height }: AreaProps) {
  const variables = {
    '--area-left': `${left}px`,
    '--area-top': `${top}px`,
    '--area-width': `${width}px`,
    '--area-height': `${height}px`,
  } as CSSProperties
  return <div className={styles.area} style={variables} />
}
