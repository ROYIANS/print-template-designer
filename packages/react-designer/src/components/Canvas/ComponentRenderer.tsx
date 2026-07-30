import { useEffect, useRef, type CSSProperties } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import type { ComponentSchema } from '@ptd/core'
import {
  RoyBarCode,
  RoyCircle,
  RoyComplexTable,
  RoyImage,
  RoyLine,
  RoyQRCode,
  RoyRect,
  RoySimpleTable,
  RoySimpleText,
  RoyStar,
  RoyText,
  type BaseComponent,
} from '@ptd/components'
import { getScaledGroupChildren } from '../../utils/groupGeometry'
import { useEditorStore } from '../../state'
import { ContentEditor, isDirectlyEditableComponent } from '../ContentEditor/ContentEditor'
import styles from './ComponentRenderer.module.css'

type ComponentConstructor = new (schema: ComponentSchema) => BaseComponent
type Variables = CSSProperties & Record<`--${string}`, string>

const COMPONENT_MAP: Partial<Record<ComponentSchema['component'], ComponentConstructor>> = {
  RoySimpleText,
  RoyText,
  RoyLine,
  RoyRect,
  RoyCircle,
  RoyStar,
  RoyImage,
  RoyQRCode,
  RoyBarCode,
  RoySimpleTable,
  RoyComplexTable,
}

interface ComponentRendererProps {
  schema: ComponentSchema
}

export function ComponentRenderer({ schema }: ComponentRendererProps) {
  useSignals()
  const store = useEditorStore()
  if (schema.component === 'RoyGroup') return <GroupRenderer schema={schema} />
  if (store.editingComponentId.value === schema.id && isDirectlyEditableComponent(schema)) {
    return <ContentEditor schema={schema} />
  }
  return <VanillaRenderer schema={schema} />
}

function GroupRenderer({ schema }: ComponentRendererProps) {
  const children = getScaledGroupChildren(schema)
  return (
    <div className={styles.renderer} role="group" aria-label={schema.name ?? '组合组件'}>
      {children.map((child) => {
        const variables: Variables = {
          '--child-left': `${numeric(child.style.left)}px`,
          '--child-top': `${numeric(child.style.top)}px`,
          '--child-width': `${child.style.width}px`,
          '--child-height': `${child.style.height}px`,
          '--child-rotate': `${child.style.rotate ?? 0}deg`,
        }
        return (
          <div key={child.id} className={styles.groupChild} style={variables}>
            <ComponentRenderer schema={child} />
          </div>
        )
      })}
    </div>
  )
}

function VanillaRenderer({ schema }: ComponentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<BaseComponent | null>(null)

  useEffect(() => {
    const element = containerRef.current
    const Constructor = COMPONENT_MAP[schema.component]
    if (!element || !Constructor) return
    const instance = new Constructor(withoutOuterTransform(schema))
    instance.mount(element)
    instanceRef.current = instance
    return () => {
      instance.destroy()
      instanceRef.current = null
    }
    // Mount lifecycle follows the renderer type; the next effect handles schema updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema.component])

  useEffect(() => {
    instanceRef.current?.update(withoutOuterTransform(schema))
  }, [schema])

  return <div ref={containerRef} className={styles.renderer} />
}

function withoutOuterTransform(schema: ComponentSchema): ComponentSchema {
  return { ...schema, style: { ...schema.style, rotate: 0 } }
}

function numeric(value: unknown): number {
  return typeof value === 'number' ? value : 0
}
