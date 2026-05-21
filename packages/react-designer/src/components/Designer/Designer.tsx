import { useEffect } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import type { TemplateSchema } from '@ptd/core'
import { templateSignal } from '../../state'
import { Canvas } from '../Canvas'
import styles from './Designer.module.css'

export interface DesignerProps {
  value: TemplateSchema
  onChange?: (value: TemplateSchema) => void
  onSave?: (value: TemplateSchema) => void
  onLoad?: () => TemplateSchema | Promise<TemplateSchema>
}

export function Designer({ value, onChange }: DesignerProps) {
  useSignals()

  useEffect(() => {
    templateSignal.value = value
  }, [value])

  return (
    <div className={styles.designer}>
      <div className={styles.canvasArea}>
        <div className={styles.screens}>
          <Canvas onChange={onChange} />
        </div>
      </div>
    </div>
  )
}
