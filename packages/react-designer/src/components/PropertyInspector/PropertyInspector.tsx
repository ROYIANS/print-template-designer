import { useEffect, useState, type ChangeEvent, type FocusEvent, type ReactNode } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import type { ComponentSchema, ComponentStyle } from '@ptd/core'
import { useEditorStore } from '../../state'
import {
  isEditableTextPropValue,
  isHexColor,
  parseFiniteNumber,
  parseTextPropValue,
} from './propertyValue'
import styles from './PropertyInspector.module.css'

interface FieldProps {
  label: string
  children: ReactNode
}

function Field({ label, children }: FieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
    </label>
  )
}

const NUMBER_FIELDS: Array<{
  key: keyof ComponentStyle
  label: string
  step?: number
  min?: number
  max?: number
}> = [
  { key: 'left', label: 'X' },
  { key: 'top', label: 'Y' },
  { key: 'width', label: '宽', min: 1 },
  { key: 'height', label: '高', min: 1 },
  { key: 'rotate', label: '旋转' },
  { key: 'opacity', label: '透明度', step: 0.05, min: 0, max: 1 },
  { key: 'fontSize', label: '字号', min: 1 },
  { key: 'borderWidth', label: '边框', min: 0 },
]

export function PropertyInspector() {
  useSignals()
  const store = useEditorStore()
  const selected = store.selectedComponents.value
  if (selected.length === 0) return <EmptyInspector />
  if (selected.length > 1) return <BatchInspector components={selected} />
  return <SingleInspector component={selected[0]!} />
}

function EmptyInspector() {
  return (
    <aside className={styles.inspector} aria-label="属性面板">
      <div className={styles.heading}>
        <span className={styles.eyebrow}>INSPECTOR</span>
        <h2>属性</h2>
      </div>
      <div className={styles.empty}>
        <span className={styles.emptyGlyph}>⌁</span>
        <h3>选择画布中的对象</h3>
        <p>单击对象调整尺寸与样式；按住 Shift 可建立多选，进行对齐、分布或组合。</p>
      </div>
    </aside>
  )
}

function SingleInspector({ component }: { component: ComponentSchema }) {
  const store = useEditorStore()
  const locked = Boolean(component.isLock)
  const [textDraft, setTextDraft] = useState<string | null>(null)
  const start = () => store.beginGesture()
  const finish = () => store.commitGesture()
  const updateStyle = (key: keyof ComponentStyle, value: unknown) =>
    store.updateComponentStyle(component.id, { [key]: value }, true)
  const updateText =
    (key: keyof ComponentStyle) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      updateStyle(key, event.target.value)

  useEffect(() => () => store.commitGesture(), [store])

  const editableText = isEditableTextPropValue(component)

  return (
    <aside className={styles.inspector} aria-label="属性面板">
      <div className={styles.heading}>
        <span className={styles.eyebrow}>{component.component}</span>
        <h2>{component.name || '未命名组件'}</h2>
      </div>
      <section className={styles.section}>
        <h3>内容</h3>
        {editableText ? (
          <Field label={component.component === 'RoyText' ? '内容源码' : '文本值'}>
            <textarea
              value={textDraft ?? printable(component.propValue)}
              disabled={locked}
              onFocus={(event) => {
                setTextDraft(event.currentTarget.value)
                start()
              }}
              onBlur={() => {
                setTextDraft(null)
                finish()
              }}
              onChange={(event) => {
                const draft = event.target.value
                setTextDraft(draft)
                const value = parseTextPropValue(component.propValue, draft)
                if (value !== null) store.updateComponent(component.id, { propValue: value }, true)
              }}
            />
          </Field>
        ) : (
          <div className={styles.structuredNotice} role="note">
            <strong>结构化内容不可在此编辑</strong>
            <span>该组件的数据由专用编辑器维护，通用面板仅提供几何与外观设置。</span>
          </div>
        )}
      </section>
      <section className={styles.section}>
        <h3>几何</h3>
        <div className={styles.fieldGrid}>
          {NUMBER_FIELDS.slice(0, 6).map(({ key, label, ...attributes }) => (
            <Field key={key} label={label}>
              <NumberInput
                value={numeric(component.style[key])}
                disabled={locked}
                onStart={start}
                onFinish={finish}
                onValue={(value) => updateStyle(key, value)}
                {...attributes}
              />
            </Field>
          ))}
        </div>
      </section>
      <section className={styles.section}>
        <h3>排版与外观</h3>
        <div className={styles.fieldGrid}>
          {NUMBER_FIELDS.slice(6).map(({ key, label, ...attributes }) => (
            <Field key={key} label={label}>
              <NumberInput
                value={numeric(component.style[key])}
                disabled={locked}
                onStart={start}
                onFinish={finish}
                onValue={(value) => updateStyle(key, value)}
                {...attributes}
              />
            </Field>
          ))}
          <TextInput
            label="字体"
            value={text(component.style.fontFamily)}
            disabled={locked}
            onFocus={start}
            onBlur={finish}
            onChange={updateText('fontFamily')}
          />
          <TextInput
            label="圆角"
            value={text(component.style.borderRadius)}
            disabled={locked}
            onFocus={start}
            onBlur={finish}
            onChange={updateText('borderRadius')}
          />
          <ColorInput
            label="文字"
            value={color(component.style.color, '#292421')}
            disabled={locked}
            onFocus={start}
            onBlur={finish}
            onChange={updateText('color')}
          />
          <ColorInput
            label="背景"
            value={color(component.style.background, '#fdfaf5')}
            disabled={locked}
            onFocus={start}
            onBlur={finish}
            onChange={updateText('background')}
          />
          <ColorInput
            label="边框色"
            value={color(component.style.borderColor, '#6b625d')}
            disabled={locked}
            onFocus={start}
            onBlur={finish}
            onChange={updateText('borderColor')}
          />
          <SelectInput
            label="边框型"
            value={text(component.style.borderType, 'solid')}
            disabled={locked}
            onFocus={start}
            onBlur={finish}
            onChange={updateText('borderType')}
            options={[
              ['solid', '实线'],
              ['dashed', '虚线'],
              ['dotted', '点线'],
              ['none', '无'],
            ]}
          />
          <SelectInput
            label="水平"
            value={text(component.style.justifyContent, 'flex-start')}
            disabled={locked}
            onFocus={start}
            onBlur={finish}
            onChange={updateText('justifyContent')}
            options={[
              ['flex-start', '左'],
              ['center', '中'],
              ['flex-end', '右'],
            ]}
          />
          <SelectInput
            label="垂直"
            value={text(component.style.alignItems, 'flex-start')}
            disabled={locked}
            onFocus={start}
            onBlur={finish}
            onChange={updateText('alignItems')}
            options={[
              ['flex-start', '上'],
              ['center', '中'],
              ['flex-end', '下'],
            ]}
          />
        </div>
      </section>
      <label className={styles.lockRow}>
        <span>
          <strong>锁定组件</strong>
          <small>锁定后禁止结构和几何修改</small>
        </span>
        <input
          type="checkbox"
          checked={locked}
          onChange={(event) =>
            store.updateComponent(component.id, { isLock: event.target.checked })
          }
        />
      </label>
    </aside>
  )
}

function BatchInspector({ components }: { components: ComponentSchema[] }) {
  const store = useEditorStore()
  const locked = components.some((component) => component.isLock)
  const start = () => store.beginGesture()
  const finish = () => store.commitGesture()
  useEffect(() => () => store.commitGesture(), [store])

  const shared = (key: keyof ComponentStyle): { mixed: boolean; value: unknown } => {
    const first = components[0]!.style[key]
    return {
      mixed: !components.every((component) => component.style[key] === first),
      value: first,
    }
  }
  const sharedColor = shared('color')
  return (
    <aside className={styles.inspector} aria-label="属性面板">
      <div className={styles.heading}>
        <span className={styles.eyebrow}>MULTI SELECT</span>
        <h2>{components.length} 个对象</h2>
      </div>
      <p className={styles.summary}>
        批量字段仅应用于全部所选对象。选择中含锁定对象时，先解锁再编辑。
      </p>
      <section className={styles.section}>
        <h3>批量外观</h3>
        <div className={styles.fieldGrid}>
          {(['opacity', 'fontSize'] as const).map((key) => (
            <Field key={key} label={key === 'opacity' ? '透明度' : '字号'}>
              <NumberInput
                value={shared(key).mixed ? null : numeric(shared(key).value)}
                placeholder={shared(key).mixed ? '混合' : '未设置'}
                disabled={locked}
                onStart={start}
                onFinish={finish}
                onValue={(value) => store.updateSelectedStyles({ [key]: value }, true)}
              />
            </Field>
          ))}
          <BatchColorInput
            label="文字"
            value={sharedColor.mixed ? null : sharedColor.value}
            mixed={sharedColor.mixed}
            disabled={locked}
            onStart={start}
            onFinish={finish}
            onValue={(value) => store.updateSelectedStyles({ color: value }, true)}
          />
        </div>
      </section>
      <button
        type="button"
        className={styles.unlockButton}
        disabled={!locked}
        onClick={() => store.setLock(false)}
      >
        解锁所选对象
      </button>
    </aside>
  )
}

interface CommonInputProps {
  label: string
  value: string
  disabled: boolean
  onFocus: (event: FocusEvent<HTMLElement>) => void
  onBlur: (event: FocusEvent<HTMLElement>) => void
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

interface NumberInputProps {
  value: number | null
  disabled: boolean
  placeholder?: string
  step?: number
  min?: number
  max?: number
  onStart: () => void
  onFinish: () => void
  onValue: (value: number) => void
}

function NumberInput({
  value,
  disabled,
  placeholder,
  step,
  min,
  max,
  onStart,
  onFinish,
  onValue,
}: NumberInputProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const shownValue = editing ? draft : value === null ? '' : String(value)
  const apply = (nextDraft: string) => {
    const parsed = parseFiniteNumber(nextDraft, { min, max })
    if (parsed !== null) onValue(parsed)
  }

  return (
    <input
      type="number"
      value={shownValue}
      placeholder={placeholder}
      disabled={disabled}
      step={step}
      min={min}
      max={max}
      onFocus={(event) => {
        setEditing(true)
        setDraft(event.currentTarget.value)
        onStart()
      }}
      onChange={(event) => {
        setDraft(event.target.value)
        apply(event.target.value)
      }}
      onBlur={(event) => {
        apply(event.currentTarget.value)
        setEditing(false)
        onFinish()
      }}
    />
  )
}

function TextInput({ label, ...props }: CommonInputProps) {
  return (
    <Field label={label}>
      <input type="text" {...props} />
    </Field>
  )
}
function ColorInput({ label, ...props }: CommonInputProps) {
  return (
    <Field label={label}>
      <input type="color" {...props} />
    </Field>
  )
}

interface BatchColorInputProps {
  label: string
  value: unknown
  mixed: boolean
  disabled: boolean
  onStart: () => void
  onFinish: () => void
  onValue: (value: string) => void
}

function BatchColorInput({
  label,
  value,
  mixed,
  disabled,
  onStart,
  onFinish,
  onValue,
}: BatchColorInputProps) {
  const [editing, setEditing] = useState(false)
  const [textMode, setTextMode] = useState(false)
  const [draft, setDraft] = useState('')
  const sharedColor = isHexColor(value) ? value : null
  const useTextInput = mixed || !sharedColor || (editing && textMode)
  const shownValue = editing ? draft : (sharedColor ?? '')
  const apply = (nextDraft: string) => {
    if (isHexColor(nextDraft)) onValue(nextDraft)
  }

  return (
    <Field label={label}>
      <input
        type={useTextInput ? 'text' : 'color'}
        value={shownValue}
        placeholder={mixed ? '混合：输入 #RRGGBB' : '未设置'}
        aria-label={mixed ? `${label}（混合值）` : label}
        disabled={disabled}
        onFocus={(event) => {
          setEditing(true)
          setTextMode(useTextInput)
          setDraft(event.currentTarget.value)
          onStart()
        }}
        onChange={(event) => {
          setDraft(event.target.value)
          apply(event.target.value)
        }}
        onBlur={(event) => {
          apply(event.currentTarget.value)
          setEditing(false)
          onFinish()
        }}
      />
    </Field>
  )
}
function SelectInput({
  options,
  ...props
}: CommonInputProps & { options: Array<[string, string]> }) {
  const { label, ...selectProps } = props
  return (
    <Field label={label}>
      <select {...selectProps}>
        {options.map(([value, optionLabel]) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </Field>
  )
}
function numeric(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}
function printable(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}
function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}
function color(value: unknown, fallback: string): string {
  return isHexColor(value) ? value : fallback
}
