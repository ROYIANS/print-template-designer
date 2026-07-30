import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { getPageDimensions, pxToMm, type ComponentSchema, type ComponentStyle } from '@ptd/core'
import { RiAddLine, RiLandscapeLine, RiRuler2Line, RiSubtractLine } from '@remixicon/react'
import {
  CJK_FONT_FAMILY_OPTIONS,
  composeFontFamily,
  DEFAULT_CJK_FONT_FAMILY,
  LATIN_FONT_FAMILY_OPTIONS,
  resolveFontFamily,
} from '../../config/typography'
import { useEditorStore } from '../../state'
import { PanelBody, PanelFooter, PanelHeader, PanelRoot } from '../Panel'
import {
  isEditableTextPropValue,
  isHexColor,
  parseFiniteNumber,
  parseTextPropValue,
  scrubNumberValue,
} from './propertyValue'
import styles from './PropertyInspector.module.css'

type ColorVariables = CSSProperties & { '--field-color': string }

interface FieldProps {
  label: string
  labelControl?: ReactNode
  wide?: boolean
  children: ReactNode
}

function Field({ label, labelControl, wide = false, children }: FieldProps) {
  return (
    <div className={styles.field} data-wide={wide || undefined}>
      {labelControl ?? <span className={styles.fieldLabel}>{label}</span>}
      {children}
    </div>
  )
}

function SectionHeading({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className={styles.sectionHeading}>
      <span>{title}</span>
      {meta && <small>{meta}</small>}
    </div>
  )
}

function InspectorSection({
  title,
  meta,
  children,
}: {
  title: string
  meta?: string
  children: ReactNode
}) {
  return (
    <section className={styles.section}>
      <SectionHeading title={title} meta={meta} />
      <div className={styles.sectionBody}>{children}</div>
    </section>
  )
}

function InspectorDisclosure({
  title,
  meta,
  children,
}: {
  title: string
  meta?: string
  children: ReactNode
}) {
  return (
    <details className={styles.disclosure}>
      <summary>
        <span>{title}</span>
        {meta && <small>{meta}</small>}
      </summary>
      <div className={styles.disclosureBody}>{children}</div>
    </details>
  )
}

function InspectorShell({
  label,
  title,
  meta,
  page = false,
  children,
  footer,
}: {
  label: string
  title: string
  meta: string
  page?: boolean
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <aside className={styles.inspector} aria-label={label} data-ptd-region="inspector">
      <PanelRoot className={styles.inspectorPanel}>
        <PanelHeader title={title} meta={meta} />
        <PanelBody>
          <div
            className={styles.inspectorView}
            data-ptd-region={page ? 'page-inspector' : undefined}
          >
            {children}
          </div>
        </PanelBody>
        {footer && <PanelFooter className={styles.inspectorFooter}>{footer}</PanelFooter>}
      </PanelRoot>
    </aside>
  )
}

const NUMBER_FIELDS: Array<{
  key: keyof ComponentStyle
  label: string
  unit?: string
  step?: number
  scrubStep?: number
  min?: number
  max?: number
  scale?: number
}> = [
  { key: 'left', label: 'X', unit: 'px' },
  { key: 'top', label: 'Y', unit: 'px' },
  { key: 'width', label: '宽度', unit: 'px', min: 1 },
  { key: 'height', label: '高度', unit: 'px', min: 1 },
  { key: 'rotate', label: '旋转', unit: '°' },
  {
    key: 'opacity',
    label: '透明度',
    unit: '%',
    step: 5,
    scrubStep: 1,
    min: 0,
    max: 100,
    scale: 100,
  },
  { key: 'fontSize', label: '字号', unit: 'px', min: 1 },
  { key: 'borderWidth', label: '边框', unit: 'px', min: 0 },
]

const CONTENT_COMPONENTS = new Set<ComponentSchema['component']>([
  'RoySimpleText',
  'RoyText',
  'RoySimpleTable',
  'RoyComplexTable',
  'RoyImage',
  'RoyQRCode',
  'RoyBarCode',
  'RoyGroup',
])
const TYPOGRAPHY_COMPONENTS = new Set<ComponentSchema['component']>([
  'RoySimpleText',
  'RoyText',
  'RoySimpleTable',
  'RoyComplexTable',
])
const ALIGNMENT_COMPONENTS = new Set<ComponentSchema['component']>(['RoySimpleText'])
const BACKGROUND_COMPONENTS = new Set<ComponentSchema['component']>([
  'RoySimpleText',
  'RoyText',
  'RoySimpleTable',
  'RoyComplexTable',
  'RoyLine',
  'RoyRect',
  'RoyCircle',
  'RoyStar',
  'RoyImage',
  'RoyQRCode',
  'RoyBarCode',
])
const BORDER_COMPONENTS = new Set<ComponentSchema['component']>([
  'RoySimpleText',
  'RoyText',
  'RoySimpleTable',
  'RoyComplexTable',
  'RoyRect',
  'RoyCircle',
  'RoyImage',
  'RoyQRCode',
  'RoyBarCode',
])
const BORDER_STYLE_COMPONENTS = new Set<ComponentSchema['component']>([
  'RoySimpleText',
  'RoyText',
  'RoyRect',
  'RoyCircle',
  'RoyImage',
  'RoyQRCode',
  'RoyBarCode',
])
const RADIUS_COMPONENTS = new Set<ComponentSchema['component']>([
  'RoySimpleText',
  'RoyText',
  'RoyRect',
  'RoyImage',
])

export function PropertyInspector() {
  useSignals()
  const store = useEditorStore()
  const selected = store.selectedComponents.value
  if (selected.length === 0) return <PageInspector />
  if (selected.length > 1) return <BatchInspector components={selected} />
  return <SingleInspector component={selected[0]!} />
}

function PageInspector() {
  const store = useEditorStore()
  const page = store.pageConfig.value
  const dimensions = getPageDimensions(page)

  return (
    <InspectorShell
      label="页面属性"
      title={page.title || '未命名模板'}
      meta={`PAGE ${String(store.currentPageIndex.value + 1).padStart(2, '0')}`}
      page
      footer={
        <FooterSetting
          icon={<RiRuler2Line />}
          label="页面标尺"
          detail="拖出参考线"
          checked={store.showRuler.value}
          onChange={() => store.toggleRuler()}
        />
      }
    >
      <InspectorSection title="页面方向" meta={page.pageDirection === 'p' ? '纵向' : '横向'}>
        <SegmentedInput
          label="页面方向"
          value={page.pageDirection}
          options={[
            {
              value: 'p',
              label: '纵向',
              icon: <RiLandscapeLine className={styles.portraitIcon} aria-hidden="true" />,
            },
            { value: 'l', label: '横向', icon: <RiLandscapeLine aria-hidden="true" /> },
          ]}
          onValue={(value) => store.setPageDirection(value as 'p' | 'l')}
        />
      </InspectorSection>

      <InspectorSection
        title="页面规格"
        meta={`${pxToMm(dimensions.width)} × ${pxToMm(dimensions.height)} mm`}
      >
        <dl className={styles.readoutGrid}>
          <Readout label="规格" value={page.pageSize} />
          <Readout label="布局" value={page.pageLayout === 'fixed' ? '固定页面' : '流式页面'} />
          <Readout label="宽度" value={`${pxToMm(dimensions.width)} mm`} />
          <Readout label="高度" value={`${pxToMm(dimensions.height)} mm`} />
          <Readout label="上边距" value={`${page.pageMarginTop} mm`} />
          <Readout label="下边距" value={`${page.pageMarginBottom} mm`} />
        </dl>
      </InspectorSection>

      <InspectorSection title="纸张与排版" meta={primaryFontName(page.fontFamily)}>
        <dl className={styles.readoutList}>
          <Readout label="纸张颜色" value={page.background} swatch={page.background} />
          <Readout label="默认文字" value={page.color} swatch={page.color} />
          <Readout label="默认字体" value={primaryFontName(page.fontFamily)} />
          <Readout label="字号 / 行高" value={`${page.fontSize}px / ${page.lineHeight}`} />
        </dl>
      </InspectorSection>
    </InspectorShell>
  )
}

function Readout({ label, value, swatch }: { label: string; value: string; swatch?: string }) {
  const swatchStyle: ColorVariables | undefined = swatch ? { '--field-color': swatch } : undefined
  return (
    <div className={styles.readout}>
      <dt>{label}</dt>
      <dd>
        {swatch && <span className={styles.swatch} style={swatchStyle} aria-hidden="true" />}
        <span>{value}</span>
      </dd>
    </div>
  )
}

function primaryFontName(fontFamily: string): string {
  return (fontFamily.split(',')[0]?.trim() || fontFamily).replace(/^['"]|['"]$/g, '')
}

function SingleInspector({ component }: { component: ComponentSchema }) {
  const store = useEditorStore()
  const locked = Boolean(component.isLock)
  const [textDraft, setTextDraft] = useState<string | null>(null)
  const start = () => store.beginGesture()
  const finish = () => store.commitGesture()
  const cancel = () => store.cancelGesture()
  const updateStyle = (key: keyof ComponentStyle, value: unknown) =>
    store.updateComponentStyle(component.id, { [key]: value }, true)
  const updateDiscreteStyle = (key: keyof ComponentStyle, value: unknown) => {
    start()
    updateStyle(key, value)
    finish()
  }

  useEffect(() => () => store.commitGesture(), [store])

  const editableText = isEditableTextPropValue(component)
  const showsContent = CONTENT_COMPONENTS.has(component.component)
  const showsTypography = TYPOGRAPHY_COMPONENTS.has(component.component)
  const showsAlignment = ALIGNMENT_COMPONENTS.has(component.component)
  const showsTextColor = TYPOGRAPHY_COMPONENTS.has(component.component)
  const showsBackground = BACKGROUND_COMPONENTS.has(component.component)
  const showsBorder = BORDER_COMPONENTS.has(component.component)
  const showsBorderStyle = BORDER_STYLE_COMPONENTS.has(component.component)
  const showsRadius = RADIUS_COMPONENTS.has(component.component)
  const showsAppearance = showsTextColor || showsBackground || showsBorder
  const fontValue = text(component.style.fontFamily, DEFAULT_CJK_FONT_FAMILY)
  const fontSelection = resolveFontFamily(fontValue)
  const cjkFontOptions = fontSelection.recognized
    ? CJK_FONT_FAMILY_OPTIONS
    : [
        [fontSelection.cjk, primaryFontName(fontSelection.cjk)] as [string, string],
        ...CJK_FONT_FAMILY_OPTIONS,
      ]

  return (
    <InspectorShell
      label="属性面板"
      title={component.name || '未命名组件'}
      meta={component.component}
      footer={
        <FooterSetting
          label={locked ? '组件已锁定' : '锁定组件'}
          detail={locked ? '仅允许解锁' : '保护几何与内容'}
          checked={locked}
          onChange={(checked) => store.updateComponent(component.id, { isLock: checked })}
        />
      }
    >
      {showsContent && (
        <InspectorSection title="内容" meta={editableText ? '可编辑' : '专用编辑器'}>
          {editableText ? (
            <Field label={component.component === 'RoyText' ? '内容源码' : '文本值'} wide>
              {component.component === 'RoyText' ? (
                <textarea
                  className={styles.textArea}
                  aria-label="内容源码"
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
                    if (value !== null)
                      store.updateComponent(component.id, { propValue: value }, true)
                  }}
                />
              ) : (
                <input
                  className={styles.textControl}
                  type="text"
                  aria-label="文本值"
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
                    if (value !== null)
                      store.updateComponent(component.id, { propValue: value }, true)
                  }}
                />
              )}
            </Field>
          ) : (
            <div className={styles.structuredNotice} role="note">
              <strong>结构化内容由专用编辑器维护</strong>
              <span>此面板仍可调整几何、层级与视觉样式。</span>
            </div>
          )}
        </InspectorSection>
      )}

      <InspectorSection title="几何" meta="位置与尺寸">
        <div className={styles.fieldGrid}>
          {NUMBER_FIELDS.slice(0, 6).map(({ key, label, scale = 1, ...attributes }) => (
            <NumberInput
              key={key}
              label={label}
              value={numeric(component.style[key]) * scale}
              disabled={locked}
              onStart={start}
              onFinish={finish}
              onCancel={cancel}
              onValue={(value) => updateStyle(key, value / scale)}
              {...attributes}
            />
          ))}
        </div>
      </InspectorSection>

      {showsTypography && (
        <InspectorSection title="排版" meta="文字与对齐">
          <div className={styles.fieldGrid}>
            <NumberInput
              label="字号"
              value={numeric(component.style.fontSize)}
              unit="pt"
              min={1}
              disabled={locked}
              onStart={start}
              onFinish={finish}
              onCancel={cancel}
              onValue={(value) => updateStyle('fontSize', value)}
            />
            <SelectInput
              label="中文字体"
              value={fontSelection.cjk}
              disabled={locked}
              options={cjkFontOptions}
              onStart={start}
              onFinish={finish}
              onValue={(value) =>
                updateStyle('fontFamily', composeFontFamily(value, fontSelection.latin))
              }
            />
            <SelectInput
              label="西文字体"
              value={fontSelection.latin}
              disabled={locked}
              options={LATIN_FONT_FAMILY_OPTIONS}
              onStart={start}
              onFinish={finish}
              onValue={(value) =>
                updateStyle('fontFamily', composeFontFamily(fontSelection.cjk, value))
              }
            />
            {showsAlignment && (
              <>
                <SegmentedInput
                  label="水平对齐"
                  value={text(component.style.justifyContent, 'flex-start')}
                  disabled={locked}
                  wide
                  options={[
                    { value: 'flex-start', label: '左' },
                    { value: 'center', label: '中' },
                    { value: 'flex-end', label: '右' },
                  ]}
                  onValue={(value) => updateDiscreteStyle('justifyContent', value)}
                />
                <SegmentedInput
                  label="垂直对齐"
                  value={text(component.style.alignItems, 'flex-start')}
                  disabled={locked}
                  wide
                  options={[
                    { value: 'flex-start', label: '上' },
                    { value: 'center', label: '中' },
                    { value: 'flex-end', label: '下' },
                  ]}
                  onValue={(value) => updateDiscreteStyle('alignItems', value)}
                />
              </>
            )}
          </div>
        </InspectorSection>
      )}

      {showsAppearance && (
        <InspectorSection title="外观" meta={showsBorder ? '颜色与描边' : '填充'}>
          <div className={styles.fieldGrid}>
            {showsTextColor && (
              <ColorInput
                label="文字"
                value={color(component.style.color, '#1d2735')}
                disabled={locked}
                onStart={start}
                onFinish={finish}
                onValue={(value) => updateStyle('color', value)}
              />
            )}
            {showsBackground && (
              <ColorInput
                label={component.component === 'RoyLine' ? '线条' : '背景'}
                value={color(component.style.background, '#f8fafc')}
                disabled={locked}
                onStart={start}
                onFinish={finish}
                onValue={(value) => updateStyle('background', value)}
              />
            )}
            {showsBorder && (
              <div className={styles.advancedWrap}>
                <InspectorDisclosure title="高级描边与圆角" meta="按需展开">
                  <div className={styles.fieldGrid}>
                    <ColorInput
                      label="边框色"
                      value={color(component.style.borderColor, '#7d8999')}
                      disabled={locked}
                      onStart={start}
                      onFinish={finish}
                      onValue={(value) => updateStyle('borderColor', value)}
                    />
                    <NumberInput
                      label="边框宽"
                      value={numeric(component.style.borderWidth)}
                      unit="px"
                      min={0}
                      disabled={locked}
                      onStart={start}
                      onFinish={finish}
                      onCancel={cancel}
                      onValue={(value) => updateStyle('borderWidth', value)}
                    />
                    {showsRadius && (
                      <NumberInput
                        label="圆角"
                        value={cssNumber(component.style.borderRadius)}
                        unit="px"
                        min={0}
                        disabled={locked}
                        onStart={start}
                        onFinish={finish}
                        onCancel={cancel}
                        onValue={(value) => updateStyle('borderRadius', `${value}px`)}
                      />
                    )}
                    {showsBorderStyle && (
                      <SegmentedInput
                        label="边框样式"
                        value={text(component.style.borderType, 'solid')}
                        disabled={locked}
                        wide
                        options={[
                          { value: 'solid', label: '实线' },
                          { value: 'dashed', label: '虚线' },
                          { value: 'dotted', label: '点线' },
                          { value: 'none', label: '无' },
                        ]}
                        onValue={(value) => updateDiscreteStyle('borderType', value)}
                      />
                    )}
                  </div>
                </InspectorDisclosure>
              </div>
            )}
          </div>
        </InspectorSection>
      )}
    </InspectorShell>
  )
}

function BatchInspector({ components }: { components: ComponentSchema[] }) {
  const store = useEditorStore()
  const locked = components.some((component) => component.isLock)
  const start = () => store.beginGesture()
  const finish = () => store.commitGesture()
  const cancel = () => store.cancelGesture()
  useEffect(() => () => store.commitGesture(), [store])

  const shared = (key: keyof ComponentStyle): { mixed: boolean; value: unknown } => {
    const first = components[0]!.style[key]
    return {
      mixed: !components.every((component) => component.style[key] === first),
      value: first,
    }
  }
  const opacity = shared('opacity')
  const fontSize = shared('fontSize')
  const sharedColor = shared('color')
  const allSupportTypography = components.every((component) =>
    TYPOGRAPHY_COMPONENTS.has(component.component),
  )

  return (
    <InspectorShell
      label="属性面板"
      title={`${components.length} 个对象`}
      meta="MULTI SELECT"
      footer={
        <button
          type="button"
          className={styles.footerAction}
          disabled={!locked}
          onClick={() => store.setLock(false)}
        >
          {locked ? '解锁所选对象' : '所选对象均可编辑'}
        </button>
      }
    >
      <div className={styles.summary} role="note">
        <strong>{locked ? '选择中包含锁定对象' : '批量编辑共同属性'}</strong>
        <span>
          {locked ? '先解锁后再修改共同样式。' : '混合值保持为空，录入后应用到全部所选对象。'}
        </span>
      </div>
      <InspectorSection title="共同属性" meta={`${components.length} 项`}>
        <div className={styles.fieldGrid}>
          <NumberInput
            label="透明度"
            value={opacity.mixed ? null : numeric(opacity.value) * 100}
            placeholder={opacity.mixed ? '混合' : '未设置'}
            unit="%"
            step={5}
            min={0}
            max={100}
            scrubStep={1}
            disabled={locked}
            onStart={start}
            onFinish={finish}
            onCancel={cancel}
            onValue={(value) => store.updateSelectedStyles({ opacity: value / 100 }, true)}
          />
          {allSupportTypography && (
            <>
              <NumberInput
                label="字号"
                value={fontSize.mixed ? null : numeric(fontSize.value)}
                placeholder={fontSize.mixed ? '混合' : '未设置'}
                unit="pt"
                min={1}
                disabled={locked}
                onStart={start}
                onFinish={finish}
                onCancel={cancel}
                onValue={(value) => store.updateSelectedStyles({ fontSize: value }, true)}
              />
              <ColorInput
                label="文字"
                value={
                  sharedColor.mixed || !isHexColor(sharedColor.value) ? null : sharedColor.value
                }
                placeholder={sharedColor.mixed ? '混合：输入颜色' : '未设置'}
                disabled={locked}
                onStart={start}
                onFinish={finish}
                onValue={(value) => store.updateSelectedStyles({ color: value }, true)}
              />
            </>
          )}
        </div>
      </InspectorSection>
    </InspectorShell>
  )
}

interface NumberInputProps {
  label: string
  value: number | null
  disabled: boolean
  placeholder?: string
  unit?: string
  step?: number
  scrubStep?: number
  min?: number
  max?: number
  onStart: () => void
  onFinish: () => void
  onCancel: () => void
  onValue: (value: number) => void
}

interface ScrubSession {
  pointerId: number
  startX: number
  startValue: number
  lastValue: number
  moved: boolean
}

function NumberInput({
  label,
  value,
  disabled,
  placeholder,
  unit,
  step = 1,
  scrubStep = step,
  min,
  max,
  onStart,
  onFinish,
  onCancel,
  onValue,
}: NumberInputProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [scrubbing, setScrubbing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrubRef = useRef<ScrubSession | null>(null)
  const shownValue = editing ? draft : value === null ? '' : formatNumber(value)
  const parsedDraft = parseFiniteNumber(draft, { min, max })
  const invalid = editing && draft.trim() !== '' && parsedDraft === null
  const scrubbable = !disabled && value !== null

  const apply = (nextDraft: string) => {
    const parsed = parseFiniteNumber(nextDraft, { min, max })
    if (parsed !== null) onValue(parsed)
  }
  const nudge = (direction: -1 | 1) => {
    if (value === null) return
    const next = clamp(roundForStep(value + direction * step, step), min, max)
    onStart()
    onValue(next)
    onFinish()
  }

  const clearPointerCapture = (target: HTMLButtonElement, pointerId: number) => {
    scrubRef.current = null
    if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId)
  }

  const cancelScrub = (target: HTMLButtonElement, pointerId: number) => {
    const session = scrubRef.current
    if (!session || session.pointerId !== pointerId) return
    clearPointerCapture(target, pointerId)
    if (!session.moved) return
    setScrubbing(false)
    onCancel()
  }

  const handleScrubPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!scrubbable || value === null || event.button !== 0 || event.pointerType === 'touch') return
    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
    event.currentTarget.setPointerCapture(event.pointerId)
    scrubRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startValue: value,
      lastValue: value,
      moved: false,
    }
  }

  const handleScrubPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const session = scrubRef.current
    if (!session || session.pointerId !== event.pointerId) return
    const deltaX = event.clientX - session.startX
    if (!session.moved) {
      if (Math.abs(deltaX) < 3) return
      session.moved = true
      setScrubbing(true)
      onStart()
    }
    const next = scrubNumberValue(session.startValue, deltaX, {
      step: scrubStep,
      min,
      max,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    })
    if (next === session.lastValue) return
    session.lastValue = next
    onValue(next)
  }

  const handleScrubPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const session = scrubRef.current
    if (!session || session.pointerId !== event.pointerId) return
    const moved = session.moved
    clearPointerCapture(event.currentTarget, event.pointerId)
    if (moved) {
      setScrubbing(false)
      onFinish()
      return
    }
    inputRef.current?.focus({ preventScroll: true })
  }

  const handleScrubKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const session = scrubRef.current
    if (event.key !== 'Escape' || !session) return
    event.preventDefault()
    cancelScrub(event.currentTarget, session.pointerId)
  }

  return (
    <Field
      label={label}
      labelControl={
        <button
          type="button"
          className={styles.scrubLabel}
          tabIndex={-1}
          aria-label={`${label}，左右拖动调整数值`}
          title={scrubbable ? '左右拖动调整；Shift 加速，Alt 精调' : undefined}
          disabled={!scrubbable}
          data-active={scrubbing || undefined}
          onPointerDown={handleScrubPointerDown}
          onPointerMove={handleScrubPointerMove}
          onPointerUp={handleScrubPointerUp}
          onPointerCancel={(event) => cancelScrub(event.currentTarget, event.pointerId)}
          onLostPointerCapture={(event) => cancelScrub(event.currentTarget, event.pointerId)}
          onKeyDown={handleScrubKeyDown}
        >
          {label}
        </button>
      }
    >
      <div className={styles.numberControl} data-disabled={disabled || undefined}>
        <button
          type="button"
          aria-label={`${label}减少${step}`}
          disabled={disabled || value === null}
          onClick={() => nudge(-1)}
        >
          <RiSubtractLine aria-hidden="true" />
        </button>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          aria-label={label}
          aria-invalid={invalid || undefined}
          value={shownValue}
          placeholder={placeholder}
          disabled={disabled}
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
        {unit && <span className={styles.unit}>{unit}</span>}
        <button
          type="button"
          aria-label={`${label}增加${step}`}
          disabled={disabled || value === null}
          onClick={() => nudge(1)}
        >
          <RiAddLine aria-hidden="true" />
        </button>
      </div>
    </Field>
  )
}

function SegmentedInput({
  label,
  value,
  options,
  disabled = false,
  wide = false,
  onValue,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string; icon?: ReactNode }>
  disabled?: boolean
  wide?: boolean
  onValue: (value: string) => void
}) {
  return (
    <Field label={label} wide={wide}>
      <div className={styles.segmented} role="group" aria-label={label} data-count={options.length}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            disabled={disabled}
            onClick={() => onValue(option.value)}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </Field>
  )
}

function SelectInput({
  label,
  value,
  options,
  disabled,
  onStart,
  onFinish,
  onValue,
}: {
  label: string
  value: string
  options: Array<[string, string]>
  disabled: boolean
  onStart: () => void
  onFinish: () => void
  onValue: (value: string) => void
}) {
  return (
    <Field label={label}>
      <select
        className={styles.selectControl}
        aria-label={label}
        value={value}
        disabled={disabled}
        onFocus={onStart}
        onBlur={onFinish}
        onChange={(event) => onValue(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </Field>
  )
}

function ColorInput({
  label,
  value,
  placeholder,
  disabled,
  onStart,
  onFinish,
  onValue,
}: {
  label: string
  value: string | null
  placeholder?: string
  disabled: boolean
  onStart: () => void
  onFinish: () => void
  onValue: (value: string) => void
}) {
  const fallback = value ?? '#ffffff'
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const shownValue = editing ? draft : (value ?? '')
  const valid = isHexColor(shownValue)
  const swatchStyle: ColorVariables = { '--field-color': valid ? shownValue : fallback }
  const apply = (next: string) => {
    if (isHexColor(next)) onValue(next)
  }

  return (
    <Field label={label}>
      <div className={styles.colorControl} data-disabled={disabled || undefined}>
        <label className={styles.colorWell} style={swatchStyle}>
          <span className={styles.visuallyHidden}>{label}色板</span>
          <input
            type="color"
            aria-label={`${label}色板`}
            value={fallback}
            disabled={disabled}
            onFocus={onStart}
            onBlur={onFinish}
            onChange={(event) => onValue(event.target.value)}
          />
        </label>
        <input
          type="text"
          spellCheck={false}
          aria-label={`${label}颜色值`}
          aria-invalid={(editing && shownValue !== '' && !valid) || undefined}
          value={shownValue}
          placeholder={placeholder ?? '#RRGGBB'}
          disabled={disabled}
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
      </div>
    </Field>
  )
}

function FooterSetting({
  icon,
  label,
  detail,
  checked,
  onChange,
}: {
  icon?: ReactNode
  label: string
  detail: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className={styles.footerSetting}>
      {icon && <span className={styles.footerIcon}>{icon}</span>}
      <span className={styles.footerCopy}>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
      <button
        type="button"
        className={styles.switchControl}
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  )
}

function numeric(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function cssNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return 0
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
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

function formatNumber(value: number): string {
  return String(Math.round(value * 100) / 100)
}

function roundForStep(value: number, step: number): number {
  const decimals = String(step).split('.')[1]?.length ?? 0
  return Number(value.toFixed(decimals))
}

function clamp(value: number, min?: number, max?: number): number {
  return Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, value))
}
