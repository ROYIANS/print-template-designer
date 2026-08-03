import { useEffect, useId, useRef, type CSSProperties } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import {
  resolveComponentBindings,
  type ComponentBindingResolution,
  type ComponentSchema,
  type DataDiagnostic,
  type RenderContext,
} from '@ptd/core'
import { createComponentInstance, type BaseComponent } from '@ptd/components'
import { getScaledGroupChildren } from '../../utils/groupGeometry'
import { useEditorStore } from '../../state'
import { ContentEditor, isDirectlyEditableComponent } from '../ContentEditor/ContentEditor'
import { TableEditor } from '../TableEditor/TableEditor'
import styles from './ComponentRenderer.module.css'

type Variables = CSSProperties & Record<`--${string}`, string>

interface ComponentRendererProps {
  schema: ComponentSchema
  renderContext?: RenderContext
}

export function ComponentRenderer({ schema, renderContext }: ComponentRendererProps) {
  useSignals()
  const store = useEditorStore()
  const activeContext = renderContext ?? store.proofRenderContext.value
  const resolution = activeContext
    ? resolveComponentBindings(schema, store.normalizedTemplateData.value.data, activeContext)
    : null
  const renderedSchema = resolution?.component ?? schema
  if (renderedSchema.component === 'RoyGroup') {
    return <GroupRenderer schema={renderedSchema} renderContext={activeContext} />
  }
  if (
    !activeContext &&
    renderedSchema.component === 'RoySimpleTable' &&
    !renderedSchema.isLock &&
    store.selectedIds.value.length === 1 &&
    store.selectedIds.value[0] === renderedSchema.id
  ) {
    return <TableEditor schema={renderedSchema} />
  }
  if (
    !activeContext &&
    store.editingComponentId.value === renderedSchema.id &&
    isDirectlyEditableComponent(renderedSchema)
  ) {
    return <ContentEditor schema={renderedSchema} />
  }
  return <VanillaRenderer schema={renderedSchema} resolution={resolution} />
}

function GroupRenderer({ schema, renderContext }: ComponentRendererProps) {
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
            <ComponentRenderer schema={child} renderContext={renderContext} />
          </div>
        )
      })}
    </div>
  )
}

function VanillaRenderer({
  schema,
  resolution,
}: ComponentRendererProps & { resolution: ComponentBindingResolution | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<BaseComponent | null>(null)
  const diagnosticId = useId()

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const instance = createComponentInstance(withoutOuterTransform(schema))
    if (!instance) return
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

  const diagnosticLabel = bindingDiagnosticLabel(resolution)
  const diagnosticMessages = resolution?.diagnostics.map((item) => item.message).join('\n')

  return (
    <div
      ref={containerRef}
      className={styles.renderer}
      data-binding-status={resolution?.status}
      data-binding-diagnostics={diagnosticMessages || undefined}
      aria-describedby={resolution && resolution.status !== 'ready' ? diagnosticId : undefined}
    >
      {resolution && resolution.status !== 'ready' && (
        <span
          id={diagnosticId}
          className={styles.bindingDiagnostic}
          data-status={resolution.status}
          data-ptd-binding-diagnostic
          title={diagnosticMessages}
          role="status"
        >
          {diagnosticLabel}
        </span>
      )}
    </div>
  )
}

function bindingDiagnosticLabel(
  resolution: Pick<ComponentBindingResolution, 'status' | 'diagnostics'> | null,
): string {
  if (!resolution || resolution.status === 'ready') return '数据已就绪'
  return resolution.status === 'missing' ? '字段缺失' : diagnosticSummary(resolution.diagnostics)
}

function diagnosticSummary(diagnostics: readonly DataDiagnostic[]): string {
  if (diagnostics.some((diagnostic) => diagnostic.code === 'invalid-binding-target')) {
    return '绑定已失效'
  }
  if (diagnostics.some((diagnostic) => diagnostic.code === 'type-mismatch')) {
    return '字段类型不匹配'
  }
  return '数据无效'
}

function withoutOuterTransform(schema: ComponentSchema): ComponentSchema {
  return { ...schema, style: { ...schema.style, rotate: 0 } }
}

function numeric(value: unknown): number {
  return typeof value === 'number' ? value : 0
}
