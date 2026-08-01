import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type MutableRefObject,
} from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import {
  DATA_SOURCE_LIMITS,
  flattenDataFields,
  formatDataPath,
  getComponentBindingTargets,
  getTableCellAt,
  inferDataDefinition,
  normalizeSimpleTableProps,
  parseRuntimeRecordsJson,
  type BindingExpression,
  type ComponentBinding,
  type ComponentBindingTarget,
  type ComponentSchema,
  type DataDiagnostic,
  type DataFieldDefinition,
  type DataFormatter,
  type RuntimeRecordsValidationResult,
  type TemplateDataDefinition,
  type TextBindingExpression,
} from '@ptd/core'
import {
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiFileUploadLine,
  RiLink,
  RiSearchLine,
  RiLinkUnlink,
} from '@remixicon/react'
import { useEditorStore } from '../../state'
import { PanelBody, PanelFooter, PanelHeader, PanelRoot, PanelTools } from '../Panel'
import styles from './DataPanel.module.css'

interface DataPanelProps {
  onClose: () => void
}

interface ImportCandidate {
  readonly sourceName: string
  readonly sourceText: string
  readonly result: RuntimeRecordsValidationResult
  readonly data?: TemplateDataDefinition
}

interface FieldDraft {
  readonly id: string
  readonly name: string
  readonly formatter?: DataFormatter
}

const TYPE_LABELS: Readonly<Record<DataFieldDefinition['valueType'], string>> = {
  string: '文本',
  number: '数值',
  boolean: '布尔',
  date: '日期',
  object: '对象',
  array: '数组',
  unknown: '未知',
}

export function DataPanel({ onClose }: DataPanelProps) {
  useSignals()
  const store = useEditorStore()
  return <DataPanelSession key={store.externalTemplateRevision.value} onClose={onClose} />
}

function DataPanelSession({ onClose }: DataPanelProps) {
  useSignals()
  const store = useEditorStore()
  const normalized = store.normalizedTemplateData.value
  const fields = normalized.data.fields
  const flatFields = useMemo(() => flattenDataFields(fields), [fields])
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => new Set(fields.filter((field) => field.children?.length).map((field) => field.id)),
  )
  const [importMode, setImportMode] = useState<'closed' | 'paste' | 'preview'>('closed')
  const [pasteDraft, setPasteDraft] = useState('')
  const [candidate, setCandidate] = useState<ImportCandidate | null>(null)
  const [fieldDraft, setFieldDraft] = useState<FieldDraft | null>(null)
  const [composerState, setComposerState] = useState<{
    readonly key: string
    readonly value: TextBindingExpression
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importTriggerRef = useRef<HTMLButtonElement>(null)
  const fieldTriggerRef = useRef<HTMLButtonElement | null>(null)
  const activeReaderRef = useRef<FileReader | null>(null)
  const readGenerationRef = useRef(0)
  const mountedRef = useRef(true)

  const selected = store.selectedComponents.value
  const component = selected.length === 1 ? (selected[0] ?? null) : null
  const target = getConcreteTarget(component, store.tableCellSelection.value)
  const targetIdentity = target ? bindingTargetKey(target) : 'none'
  const binding = component && target ? findBinding(component.bindings, target) : undefined
  const selectedComponentId = component?.id
  const selectedComponentValue = component?.propValue
  const bindingState = describeBindingState(selected, component, target)
  const proofRecords = store.proofRecords.value
  const canProof = proofRecords.length > 0
  const composerKey =
    selectedComponentId && targetIdentity === 'text'
      ? `${selectedComponentId}:${binding?.id ?? 'new'}:${JSON.stringify(
          binding?.expression ?? selectedComponentValue,
        )}`
      : null
  const composerDraft = composerKey
    ? composerState?.key === composerKey
      ? composerState.value
      : toTextExpression(binding?.expression, selectedComponentValue)
    : null

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      readGenerationRef.current += 1
      activeReaderRef.current?.abort()
    }
  }, [])

  const closeImport = useCallback((restoreFocus = true) => {
    activeReaderRef.current?.abort()
    activeReaderRef.current = null
    readGenerationRef.current += 1
    setImportMode('closed')
    setCandidate(null)
    if (restoreFocus) requestAnimationFrame(() => importTriggerRef.current?.focus())
  }, [])

  const parseSource = useCallback(
    (sourceText: string, sourceName: string) => {
      const result = parseRuntimeRecordsJson(sourceText)
      const inferred = result.ok ? inferDataDefinition(result.records) : undefined
      const data = inferred
        ? reconcileDataDefinition(inferred, normalized.data, result.records)
        : undefined
      setCandidate({ sourceName, sourceText, result, ...(data ? { data } : {}) })
      setImportMode('preview')
    },
    [normalized.data],
  )

  const readFile = useCallback(
    (file: File) => {
      activeReaderRef.current?.abort()
      const generation = ++readGenerationRef.current
      if (!file.name.toLowerCase().endsWith('.json')) {
        setCandidate(invalidFileCandidate(file.name, file.size))
        setImportMode('preview')
        return
      }
      if (file.size > DATA_SOURCE_LIMITS.maxBytes) {
        setCandidate(oversizedFileCandidate(file.name, file.size))
        setImportMode('preview')
        return
      }
      const reader = new FileReader()
      activeReaderRef.current = reader
      reader.onload = () => {
        if (!mountedRef.current || generation !== readGenerationRef.current) return
        activeReaderRef.current = null
        parseSource(typeof reader.result === 'string' ? reader.result : '', file.name)
      }
      reader.onerror = () => {
        if (!mountedRef.current || generation !== readGenerationRef.current) return
        activeReaderRef.current = null
        setCandidate(readErrorCandidate(file.name, file.size))
        setImportMode('preview')
      }
      reader.readAsText(file)
    },
    [parseSource],
  )

  const closeTopSurface = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return
    if (fieldDraft) {
      event.preventDefault()
      event.stopPropagation()
      setFieldDraft(null)
      requestAnimationFrame(() => fieldTriggerRef.current?.focus())
      return
    }
    if (importMode !== 'closed') {
      event.preventDefault()
      event.stopPropagation()
      closeImport()
    }
  }

  const applyCandidate = () => {
    if (!candidate?.result.ok || !candidate.data) return
    store.replaceTemplateData(candidate.data)
    closeImport()
  }

  const handleFieldAction = (field: DataFieldDefinition) => {
    if (!component || !target || component.isLock) return
    if (target.kind === 'text') {
      if (!composerKey) return
      const current = composerDraft ?? { kind: 'text', segments: [] }
      setComposerState({
        key: composerKey,
        value: {
          kind: 'text',
          segments: [...current.segments, { kind: 'field', fieldId: field.id }],
        },
      })
      return
    }
    store.setComponentBinding(component.id, target, { kind: 'field', fieldId: field.id })
  }

  const visibleFields = filterFieldTree(fields, query)
  const editedField = fieldDraft
    ? flatFields.find((field) => field.id === fieldDraft.id)
    : undefined
  const impact = candidate?.data
    ? bindingImpact(
        store.template.value.pages.flatMap((page) => page.componentData),
        candidate.data,
      )
    : null

  return (
    <PanelRoot data-ptd-region="data-panel" onKeyDownCapture={closeTopSurface}>
      <PanelHeader title="数据" meta={`${flatFields.length} 个字段`}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="关闭数据面板"
          onClick={onClose}
        >
          <RiCloseLine aria-hidden="true" />
        </button>
      </PanelHeader>
      <PanelTools className={styles.tools}>
        <SegmentedControl
          label="画布显示模式"
          value={store.proofMode.value ? 'proof' : 'design'}
          options={[
            { value: 'design', label: '设计内容' },
            { value: 'proof', label: '数据校样', disabled: !canProof },
          ]}
          onChange={(value) => store.setProofMode(value === 'proof')}
        />
        <RecordControl
          count={proofRecords.length}
          index={store.proofRecordIndex.value}
          disabled={!canProof}
          onPrevious={() => store.setProofRecordIndex(store.proofRecordIndex.value - 1)}
          onNext={() => store.setProofRecordIndex(store.proofRecordIndex.value + 1)}
        />
        {!canProof && <p className={styles.inlineNote}>导入并应用样例数据后即可进入校样。</p>}
      </PanelTools>
      <PanelBody className={styles.body}>
        {importMode !== 'closed' ? (
          <ImportSurface
            mode={importMode}
            pasteDraft={pasteDraft}
            candidate={candidate}
            impact={impact}
            onPasteDraftChange={setPasteDraft}
            onParsePaste={() => parseSource(pasteDraft, '粘贴的 JSON')}
            onBack={() => {
              setCandidate(null)
              setImportMode('paste')
            }}
            onApply={applyCandidate}
            onClose={() => closeImport()}
          />
        ) : (
          <>
            <section className={styles.sourceSection} aria-labelledby="data-source-title">
              <div className={styles.sectionHeading}>
                <div>
                  <h3 id="data-source-title">数据来源</h3>
                  <p>
                    {sourceDescription(
                      normalized.source,
                      normalized.data.sampleRecords?.length ?? 0,
                    )}
                  </p>
                </div>
                <button
                  ref={importTriggerRef}
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setImportMode('paste')}
                >
                  <RiFileUploadLine aria-hidden="true" />
                  导入 JSON
                </button>
              </div>
              <FileDropControl
                fileInputRef={fileInputRef}
                onFile={readFile}
                onChoose={() => fileInputRef.current?.click()}
              />
              {(normalized.data.sampleRecords?.length ?? 0) > 0 && (
                <button
                  type="button"
                  className={styles.textAction}
                  onClick={() => store.removeSampleRecords()}
                >
                  <RiDeleteBinLine aria-hidden="true" />
                  移除样例，保留字段与绑定
                </button>
              )}
              {normalized.diagnostics.length > 0 && (
                <DiagnosticList diagnostics={normalized.diagnostics} title="兼容性信息" />
              )}
            </section>

            <section className={styles.bindingSection} aria-labelledby="binding-title">
              <div className={styles.sectionHeading}>
                <div>
                  <h3 id="binding-title">当前绑定</h3>
                  <p>{bindingState}</p>
                </div>
                {component && target && binding && !component.isLock && (
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label={`解除${targetLabel(target)}绑定`}
                    onClick={() => store.removeComponentBinding(component.id, target)}
                  >
                    <RiLinkUnlink aria-hidden="true" />
                  </button>
                )}
              </div>
              {component && target?.kind === 'text' && composerDraft && !component.isLock && (
                <TextComposer
                  value={composerDraft}
                  fields={flatFields}
                  onChange={(value) => {
                    if (composerKey) setComposerState({ key: composerKey, value })
                  }}
                  onApply={() => store.setComponentBinding(component.id, target, composerDraft)}
                />
              )}
            </section>

            <section className={styles.fieldsSection} aria-labelledby="field-tree-title">
              <div className={styles.sectionHeading}>
                <div>
                  <h3 id="field-tree-title">字段模型</h3>
                  <p>选择字段即可绑定到当前对象的兼容属性。</p>
                </div>
              </div>
              <SearchControl value={query} onChange={setQuery} />
              {fieldDraft && editedField ? (
                <FieldEditor
                  draft={fieldDraft}
                  field={editedField}
                  onChange={setFieldDraft}
                  onCancel={() => {
                    setFieldDraft(null)
                    requestAnimationFrame(() => fieldTriggerRef.current?.focus())
                  }}
                  onApply={() => {
                    store.updateDataField(fieldDraft.id, {
                      name: fieldDraft.name,
                      ...(fieldDraft.formatter
                        ? { formatter: fieldDraft.formatter }
                        : { removeFormatter: true }),
                    })
                    setFieldDraft(null)
                    requestAnimationFrame(() => fieldTriggerRef.current?.focus())
                  }}
                />
              ) : visibleFields.length > 0 ? (
                <div className={styles.fieldTree} role="tree" aria-label="数据字段">
                  {visibleFields.map((field) => (
                    <FieldNode
                      key={field.id}
                      field={field}
                      depth={0}
                      query={query}
                      expanded={expanded}
                      isFieldCompatible={(candidateField) =>
                        isCompatible(candidateField, component, target)
                      }
                      actionLabel={target?.kind === 'text' ? '加入组合文本' : '绑定字段'}
                      onToggle={(fieldId) =>
                        setExpanded((current) => {
                          const next = new Set(current)
                          if (next.has(fieldId)) next.delete(fieldId)
                          else next.add(fieldId)
                          return next
                        })
                      }
                      onBind={handleFieldAction}
                      onEdit={(field, trigger) => {
                        fieldTriggerRef.current = trigger
                        setFieldDraft({
                          id: field.id,
                          name: field.name,
                          ...(field.formatter ? { formatter: field.formatter } : {}),
                        })
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <strong>{query ? '没有匹配字段' : '还没有数据字段'}</strong>
                  <span>
                    {query ? '调整字段名称或路径关键词。' : '导入 JSON 后先检查结构，再明确应用。'}
                  </span>
                </div>
              )}
            </section>
          </>
        )}
      </PanelBody>
      <PanelFooter>
        {store.hostRenderContext.value
          ? '当前校样优先使用 Host 临时数据，不会写入模板'
          : '字段、样例与绑定会随模板版本保存'}
      </PanelFooter>
    </PanelRoot>
  )
}

function FileDropControl({
  fileInputRef,
  onFile,
  onChoose,
}: {
  fileInputRef: MutableRefObject<HTMLInputElement | null>
  onFile: (file: File) => void
  onChoose: () => void
}) {
  const [dragging, setDragging] = useState(false)
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) onFile(file)
  }
  return (
    <div
      className={styles.dropControl}
      data-dragging={dragging || undefined}
      onDragEnter={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        ref={fileInputRef}
        className={styles.visuallyHidden}
        type="file"
        accept="application/json,.json"
        aria-label="选择 JSON 数据文件"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const file = event.currentTarget.files?.[0]
          if (file) onFile(file)
          event.currentTarget.value = ''
        }}
      />
      <span>将 .json 文件拖到这里</span>
      <button type="button" className={styles.secondaryButton} onClick={onChoose}>
        选择文件
      </button>
    </div>
  )
}

function ImportSurface({
  mode,
  pasteDraft,
  candidate,
  impact,
  onPasteDraftChange,
  onParsePaste,
  onBack,
  onApply,
  onClose,
}: {
  mode: 'paste' | 'preview'
  pasteDraft: string
  candidate: ImportCandidate | null
  impact: ReturnType<typeof bindingImpact> | null
  onPasteDraftChange: (value: string) => void
  onParsePaste: () => void
  onBack: () => void
  onApply: () => void
  onClose: () => void
}) {
  const titleId = useId()
  if (mode === 'paste') {
    return (
      <section className={styles.importSurface} aria-labelledby={titleId}>
        <SurfaceHeader title="粘贴 JSON 数据" titleId={titleId} onClose={onClose} />
        <PasteControl value={pasteDraft} onChange={onPasteDraftChange} />
        <p className={styles.inlineNote}>
          接受一个对象或对象数组，最大 {formatBytes(DATA_SOURCE_LIMITS.maxBytes)}、
          {DATA_SOURCE_LIMITS.maxRecords} 条记录。
        </p>
        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={!pasteDraft.trim()}
            onClick={onParsePaste}
          >
            检查数据结构
          </button>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>
            取消导入
          </button>
        </div>
      </section>
    )
  }
  const summary = candidate?.result.summary
  return (
    <section className={styles.importSurface} aria-labelledby={titleId}>
      <SurfaceHeader title="导入检查" titleId={titleId} onClose={onClose} />
      <p className={styles.sourceName}>{candidate?.sourceName}</p>
      {summary && (
        <dl className={styles.summaryGrid}>
          <SummaryMetric label="记录" value={String(summary.recordCount)} />
          <SummaryMetric label="字段" value={String(summary.fieldCount)} />
          <SummaryMetric label="体积" value={formatBytes(summary.byteCount)} />
          <SummaryMetric label="深度" value={String(summary.maxDepth)} />
        </dl>
      )}
      {candidate && candidate.result.diagnostics.length > 0 && (
        <DiagnosticList diagnostics={candidate.result.diagnostics} title="检查结果" />
      )}
      {candidate?.result.ok && impact && (
        <div className={styles.impactSummary}>
          <strong>应用影响</strong>
          <span>保留 {impact.valid} 个现有字段引用</span>
          <span>
            {impact.invalid > 0 ? `${impact.invalid} 个绑定将失效但不会被删除` : '现有绑定不会失效'}
          </span>
        </div>
      )}
      <div className={styles.actionRow}>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={!candidate?.result.ok}
          onClick={onApply}
        >
          应用字段与样例
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onBack}>
          返回修改
        </button>
      </div>
    </section>
  )
}

function SurfaceHeader({
  title,
  titleId,
  onClose,
}: {
  title: string
  titleId: string
  onClose: () => void
}) {
  return (
    <div className={styles.surfaceHeader}>
      <h3 id={titleId}>{title}</h3>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={`关闭${title}`}
        onClick={onClose}
      >
        <RiCloseLine aria-hidden="true" />
      </button>
    </div>
  )
}

function PasteControl({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const id = useId()
  return (
    <label className={styles.pasteControl} htmlFor={id}>
      <span>JSON 内容</span>
      <textarea
        id={id}
        value={value}
        spellCheck={false}
        placeholder={'例如：[{\n  "orderNo": "CC-2026-0815"\n}]'}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  )
}

function SearchControl({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className={styles.searchControl}>
      <RiSearchLine aria-hidden="true" />
      <span className={styles.visuallyHidden}>搜索字段名称或路径</span>
      <input
        value={value}
        placeholder="搜索名称或路径"
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      {value && (
        <button type="button" aria-label="清除字段搜索" onClick={() => onChange('')}>
          <RiCloseLine aria-hidden="true" />
        </button>
      )}
    </label>
  )
}

function SegmentedControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly { value: string; label: string; disabled?: boolean }[]
  onChange: (value: string) => void
}) {
  return (
    <div className={styles.segmented} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          disabled={option.disabled}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function RecordControl({
  count,
  index,
  disabled,
  onPrevious,
  onNext,
}: {
  count: number
  index: number
  disabled: boolean
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <div className={styles.recordControl} role="group" aria-label="校样记录">
      <button
        type="button"
        aria-label="上一条样例记录"
        disabled={disabled || index <= 0}
        onClick={onPrevious}
      >
        <RiArrowLeftSLine aria-hidden="true" />
      </button>
      <output aria-live="polite">{count > 0 ? `${index + 1} / ${count}` : '0 / 0'}</output>
      <button
        type="button"
        aria-label="下一条样例记录"
        disabled={disabled || index >= count - 1}
        onClick={onNext}
      >
        <RiArrowRightSLine aria-hidden="true" />
      </button>
    </div>
  )
}

function FieldNode({
  field,
  depth,
  query,
  expanded,
  isFieldCompatible,
  actionLabel,
  onToggle,
  onBind,
  onEdit,
}: {
  field: DataFieldDefinition
  depth: number
  query: string
  expanded: ReadonlySet<string>
  isFieldCompatible: (field: DataFieldDefinition) => boolean
  actionLabel: string
  onToggle: (id: string) => void
  onBind: (field: DataFieldDefinition) => void
  onEdit: (field: DataFieldDefinition, trigger: HTMLButtonElement) => void
}) {
  const children = field.children ?? []
  const open = query.trim() !== '' || expanded.has(field.id)
  return (
    <div
      role="treeitem"
      aria-expanded={children.length ? open : undefined}
      className={styles.fieldBranch}
      data-depth={depth}
    >
      <div className={styles.fieldRow}>
        {children.length > 0 ? (
          <button
            type="button"
            className={styles.disclosure}
            aria-label={`${open ? '收起' : '展开'}${field.name}`}
            onClick={() => onToggle(field.id)}
          >
            <RiArrowDownSLine aria-hidden="true" />
          </button>
        ) : (
          <span className={styles.disclosureSpacer} />
        )}
        <button
          type="button"
          className={styles.fieldMain}
          disabled={!isFieldCompatible(field)}
          aria-label={`${actionLabel}：${field.name}，路径 ${formatDataPath(field.path)}`}
          onClick={() => onBind(field)}
        >
          <span className={styles.fieldName}>{field.name}</span>
          <span className={styles.fieldPath}>{formatDataPath(field.path)}</span>
        </button>
        <span className={styles.typeLabel}>{TYPE_LABELS[field.valueType]}</span>
        <button
          type="button"
          className={styles.editField}
          aria-label={`编辑字段 ${field.name}`}
          onClick={(event) => onEdit(field, event.currentTarget)}
        >
          编辑
        </button>
      </div>
      {children.length > 0 && open && (
        <div role="group" className={styles.fieldChildren}>
          {children.map((child) => (
            <FieldNode
              key={child.id}
              field={child}
              depth={depth + 1}
              query={query}
              expanded={expanded}
              isFieldCompatible={isFieldCompatible}
              actionLabel={actionLabel}
              onToggle={onToggle}
              onBind={onBind}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FieldEditor({
  draft,
  field,
  onChange,
  onCancel,
  onApply,
}: {
  draft: FieldDraft
  field: DataFieldDefinition
  onChange: (value: FieldDraft) => void
  onCancel: () => void
  onApply: () => void
}) {
  const nameId = useId()
  const presets = formatterPresets(field)
  return (
    <div className={styles.fieldEditor} aria-label={`编辑字段 ${field.name}`}>
      <label className={styles.textControl} htmlFor={nameId}>
        <span>显示名称</span>
        <input
          id={nameId}
          autoFocus
          value={draft.name}
          onChange={(event) => onChange({ ...draft, name: event.currentTarget.value })}
        />
      </label>
      <div className={styles.presetControl}>
        <span>默认格式</span>
        <div role="group" aria-label="字段默认格式">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              aria-pressed={sameFormatter(draft.formatter, preset.formatter)}
              onClick={() => onChange({ ...draft, formatter: preset.formatter })}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      <p className={styles.fieldIdentity}>字段 ID 与路径保持不变：{formatDataPath(field.path)}</p>
      <div className={styles.actionRow}>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={!draft.name.trim()}
          onClick={onApply}
        >
          保存字段
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onCancel}>
          取消编辑
        </button>
      </div>
    </div>
  )
}

function TextComposer({
  value,
  fields,
  onChange,
  onApply,
}: {
  value: TextBindingExpression
  fields: readonly DataFieldDefinition[]
  onChange: (value: TextBindingExpression) => void
  onApply: () => void
}) {
  const addLiteral = () =>
    onChange({ ...value, segments: [...value.segments, { kind: 'literal', value: '' }] })
  return (
    <div className={styles.composer} aria-label="组合文本编辑器">
      <div className={styles.composerSegments}>
        {value.segments.map((segment, index) =>
          segment.kind === 'literal' ? (
            <label key={`literal-${index}`} className={styles.literalSegment}>
              <span>固定文字 {index + 1}</span>
              <input
                value={segment.value}
                onChange={(event) =>
                  onChange(
                    replaceSegment(value, index, {
                      kind: 'literal',
                      value: event.currentTarget.value,
                    }),
                  )
                }
              />
              <button
                type="button"
                aria-label={`移除固定文字 ${index + 1}`}
                onClick={() => onChange(removeSegment(value, index))}
              >
                <RiCloseLine aria-hidden="true" />
              </button>
            </label>
          ) : (
            <div key={`field-${index}`} className={styles.fieldToken}>
              <RiLink aria-hidden="true" />
              <span>
                {fields.find((field) => field.id === segment.fieldId)?.name ??
                  `失效字段 ${segment.fieldId}`}
              </span>
              <button
                type="button"
                aria-label={`移除字段片段 ${index + 1}`}
                onClick={() => onChange(removeSegment(value, index))}
              >
                <RiCloseLine aria-hidden="true" />
              </button>
            </div>
          ),
        )}
      </div>
      <div className={styles.actionRow}>
        <button type="button" className={styles.secondaryButton} onClick={addLiteral}>
          添加固定文字
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={value.segments.length === 0}
          onClick={onApply}
        >
          应用组合文本
        </button>
      </div>
    </div>
  )
}

function DiagnosticList({
  diagnostics,
  title,
}: {
  diagnostics: readonly DataDiagnostic[]
  title: string
}) {
  return (
    <div className={styles.diagnostics} aria-live="polite">
      <strong>{title}</strong>
      <ul>
        {diagnostics.map((diagnostic, index) => (
          <li key={`${diagnostic.code}-${index}`} data-severity={diagnostic.severity}>
            <span>
              {diagnostic.severity === 'error'
                ? '错误'
                : diagnostic.severity === 'warning'
                  ? '提醒'
                  : '信息'}
            </span>
            {diagnostic.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function filterFieldTree(
  fields: readonly DataFieldDefinition[],
  query: string,
): readonly DataFieldDefinition[] {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return fields
  return fields.flatMap((field) => {
    const children = filterFieldTree(field.children ?? [], query)
    const matches = `${field.name} ${formatDataPath(field.path)} ${field.valueType}`
      .toLocaleLowerCase()
      .includes(normalized)
    return matches || children.length > 0
      ? [{ ...field, ...(children.length > 0 ? { children } : {}) }]
      : []
  })
}

function reconcileDataDefinition(
  inferred: TemplateDataDefinition,
  existing: TemplateDataDefinition,
  records: RuntimeRecordsValidationResult['records'],
): TemplateDataDefinition {
  const oldByPath = new Map(
    flattenDataFields(existing.fields).map((field) => [JSON.stringify(field.path), field]),
  )
  const reconcile = (field: DataFieldDefinition): DataFieldDefinition => {
    const old = oldByPath.get(JSON.stringify(field.path))
    const children = field.children?.map(reconcile)
    return {
      ...field,
      ...(old
        ? { id: old.id, name: old.name, ...(old.formatter ? { formatter: old.formatter } : {}) }
        : {}),
      ...(children ? { children } : {}),
    }
  }
  return { version: 1, fields: inferred.fields.map(reconcile), sampleRecords: records }
}

function getConcreteTarget(
  component: ComponentSchema | null,
  tableSelection: { componentId: string; focusRow: number; focusColumn: number } | null,
): ComponentBindingTarget | null {
  if (!component) return null
  const definitions = getComponentBindingTargets(component.component)
  const definition = definitions[0]
  if (!definition) return null
  if (definition.kind !== 'table-cell-text') return { kind: definition.kind }
  if (!tableSelection || tableSelection.componentId !== component.id) return null
  const cell = getTableCellAt(
    normalizeSimpleTableProps(component.propValue),
    tableSelection.focusRow,
    tableSelection.focusColumn,
  )
  return cell ? { kind: 'table-cell-text', cellId: cell.id } : null
}

function findBinding(
  bindings: readonly ComponentBinding[] | undefined,
  target: ComponentBindingTarget,
): ComponentBinding | undefined {
  return bindings?.find(
    (binding) =>
      binding.target.kind === target.kind &&
      (target.kind !== 'table-cell-text' ||
        (binding.target.kind === 'table-cell-text' && binding.target.cellId === target.cellId)),
  )
}

function bindingTargetKey(target: ComponentBindingTarget): string {
  return target.kind === 'table-cell-text' ? `${target.kind}:${target.cellId}` : target.kind
}

function describeBindingState(
  selected: readonly ComponentSchema[],
  component: ComponentSchema | null,
  target: ComponentBindingTarget | null,
): string {
  if (selected.length === 0) return '选择一个支持数据绑定的组件。'
  if (selected.length > 1) return '多选状态不能建立字段绑定，请只选择一个组件。'
  if (component?.isLock) return '当前组件已锁定，解锁后才能修改绑定。'
  if (component?.component === 'RoySimpleTable' && !target)
    return '选择自由表格中的一个单元格后即可绑定。'
  if (!target) return '当前组件没有可用的数据绑定属性。'
  return `${component?.name || component?.component} · ${targetLabel(target)}`
}

function targetLabel(target: ComponentBindingTarget): string {
  if (target.kind === 'text') return '文本内容'
  if (target.kind === 'rich-text') return '富文本内容'
  if (target.kind === 'image-source') return '图片地址'
  if (target.kind === 'code-content') return '编码内容'
  return `单元格 ${target.cellId}`
}

function isCompatible(
  field: DataFieldDefinition,
  component: ComponentSchema | null,
  target: ComponentBindingTarget | null,
): boolean {
  if (
    !component ||
    !target ||
    component.isLock ||
    field.valueType === 'object' ||
    field.valueType === 'array'
  )
    return false
  const definition = getComponentBindingTargets(component.component).find(
    (item) => item.kind === target.kind,
  )
  return Boolean(definition?.acceptedTypes.includes(field.valueType))
}

function toTextExpression(
  expression: BindingExpression | undefined,
  staticValue: unknown,
): TextBindingExpression {
  if (expression?.kind === 'text') return { kind: 'text', segments: [...expression.segments] }
  if (expression?.kind === 'field') return { kind: 'text', segments: [expression] }
  const literal = typeof staticValue === 'string' ? staticValue : ''
  return { kind: 'text', segments: literal ? [{ kind: 'literal', value: literal }] : [] }
}

function replaceSegment(
  value: TextBindingExpression,
  index: number,
  segment: TextBindingExpression['segments'][number],
): TextBindingExpression {
  return {
    ...value,
    segments: value.segments.map((current, currentIndex) =>
      currentIndex === index ? segment : current,
    ),
  }
}

function removeSegment(value: TextBindingExpression, index: number): TextBindingExpression {
  return { ...value, segments: value.segments.filter((_, currentIndex) => currentIndex !== index) }
}

function bindingImpact(
  components: readonly ComponentSchema[],
  data: TemplateDataDefinition,
): { valid: number; invalid: number } {
  const ids = new Set(flattenDataFields(data.fields).map((field) => field.id))
  let valid = 0
  let invalid = 0
  const inspectExpression = (expression: BindingExpression) => {
    const segments =
      expression.kind === 'field'
        ? [expression]
        : expression.segments.filter((segment) => segment.kind === 'field')
    segments.forEach((segment) => {
      if (segment.kind !== 'field') return
      if (ids.has(segment.fieldId)) valid += 1
      else invalid += 1
    })
  }
  const visit = (component: ComponentSchema) => {
    component.bindings?.forEach((binding) => inspectExpression(binding.expression))
    if (component.component === 'RoyGroup' && Array.isArray(component.propValue)) {
      ;(component.propValue as ComponentSchema[]).forEach(visit)
    }
  }
  components.forEach(visit)
  return { valid, invalid }
}

function formatterPresets(
  field: DataFieldDefinition,
): readonly { label: string; formatter?: DataFormatter }[] {
  if (field.valueType === 'number')
    return [
      { label: '原值' },
      {
        label: '千分位',
        formatter: { kind: 'number', useGrouping: true, maximumFractionDigits: 2 },
      },
      {
        label: '人民币',
        formatter: { kind: 'currency', currency: 'CNY', maximumFractionDigits: 2 },
      },
      { label: '大写金额', formatter: { kind: 'chinese-currency' } },
    ]
  if (field.valueType === 'date')
    return [
      { label: '原值' },
      { label: '年月日', formatter: { kind: 'date', pattern: 'YYYY-MM-DD' } },
      { label: '中文日期', formatter: { kind: 'date', pattern: 'YYYY年M月D日' } },
    ]
  if (field.valueType === 'object' || field.valueType === 'array')
    return [{ label: '原值' }, { label: 'JSON', formatter: { kind: 'json' } }]
  return [{ label: '原值' }]
}

function sameFormatter(left: DataFormatter | undefined, right: DataFormatter | undefined): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function sourceDescription(source: 'canonical' | 'legacy' | 'empty', records: number): string {
  if (source === 'legacy') return `旧模板数据已兼容读取 · ${records} 条样例`
  if (source === 'canonical')
    return records > 0 ? `模板样例 · ${records} 条记录` : '字段模型已定义，未保存样例'
  return '尚未定义字段模型'
}

function formatBytes(bytes: number): string {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`
}

function invalidFileCandidate(name: string, byteCount: number): ImportCandidate {
  return {
    sourceName: name,
    sourceText: '',
    result: {
      ok: false,
      records: [],
      diagnostics: [
        { code: 'invalid-root', severity: 'error', message: '只能导入扩展名为 .json 的数据文件。' },
      ],
      summary: { root: 'invalid', recordCount: 0, fieldCount: 0, byteCount, maxDepth: 0 },
    },
  }
}

function readErrorCandidate(name: string, byteCount: number): ImportCandidate {
  return {
    sourceName: name,
    sourceText: '',
    result: {
      ok: false,
      records: [],
      diagnostics: [
        {
          code: 'unsupported-value',
          severity: 'error',
          message: '文件读取失败，请重新选择本地 JSON 文件。',
        },
      ],
      summary: { root: 'invalid', recordCount: 0, fieldCount: 0, byteCount, maxDepth: 0 },
    },
  }
}

function oversizedFileCandidate(name: string, byteCount: number): ImportCandidate {
  return {
    sourceName: name,
    sourceText: '',
    result: {
      ok: false,
      records: [],
      diagnostics: [
        {
          code: 'max-bytes',
          severity: 'error',
          message: `JSON 文件体积 ${byteCount} 字节超过上限 ${DATA_SOURCE_LIMITS.maxBytes} 字节。`,
        },
      ],
      summary: { root: 'invalid', recordCount: 0, fieldCount: 0, byteCount, maxDepth: 0 },
    },
  }
}
