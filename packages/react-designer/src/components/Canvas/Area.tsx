import styles from './Area.module.css'

interface AreaProps {
  left: number
  top: number
  width: number
  height: number
}

export function Area({ left, top, width, height }: AreaProps) {
  return (
    <div
      className={styles.area}
      style={{ left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` }}
    />
  )
}
