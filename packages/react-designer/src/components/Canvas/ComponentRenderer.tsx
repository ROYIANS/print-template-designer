import { useEffect, useRef } from 'react'
import type { ComponentSchema } from '@ptd/core'
import {
  RoySimpleText,
  RoyText,
  RoyLine,
  RoyRect,
  RoyCircle,
  RoyStar,
  RoyImage,
  RoyQRCode,
  RoyBarCode,
  RoyGroup,
  RoySimpleTable,
  RoyComplexTable,
  type BaseComponent,
} from '@ptd/components'
import styles from './ComponentRenderer.module.css'

type ComponentConstructor = new (schema: ComponentSchema) => BaseComponent

const COMPONENT_MAP: Record<string, ComponentConstructor> = {
  RoySimpleText,
  RoyText,
  RoyLine,
  RoyRect,
  RoyCircle,
  RoyStar,
  RoyImage,
  RoyQRCode,
  RoyBarCode,
  RoyGroup,
  RoySimpleTable,
  RoyComplexTable,
}

interface ComponentRendererProps {
  schema: ComponentSchema
}

export function ComponentRenderer({ schema }: ComponentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<BaseComponent | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const Ctor = COMPONENT_MAP[schema.component]
    if (!Ctor) return

    // Create and mount instance
    const instance = new Ctor(schema)
    instance.mount(el)
    instanceRef.current = instance

    return () => {
      instance.destroy()
      instanceRef.current = null
    }
    // Only run on mount/unmount — schema changes handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema.component])

  // Update when schema changes (but component type stays the same)
  useEffect(() => {
    instanceRef.current?.update(schema)
  }, [schema])

  return <div ref={containerRef} className={styles.renderer} />
}
