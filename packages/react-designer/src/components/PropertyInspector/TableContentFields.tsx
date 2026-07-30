import { useMemo } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import {
  deleteTableColumn,
  deleteTableRow,
  expandTableCellRange,
  getTableCellAt,
  getTableCellIdsInRange,
  insertTableColumn,
  insertTableRow,
  mergeTableCells,
  normalizeSimpleTableProps,
  resizeTableColumn,
  resizeTableRow,
  splitTableCell,
  updateTableCellText,
  updateTableCellsStyle,
  type ComponentSchema,
  type SimpleTableProps,
  type TableCellStyle,
} from '@ptd/core'
import {
  CJK_FONT_FAMILY_OPTIONS,
  composeFontFamily,
  LATIN_FONT_FAMILY_OPTIONS,
  resolveFontFamily,
} from '../../config/typography'
import { useEditorStore } from '../../state'
import styles from './PropertyInspector.module.css'

export interface TableContentFieldsProps {
  component: ComponentSchema & { component: 'RoySimpleTable' }
  disabled: boolean
  onStart: () => void
  onFinish: () => void
  onCancel: () => void
  onValue: (value: unknown) => void
  onDiscreteValue: (value: unknown) => void
}

export function TableContentFields({
  component,
  disabled,
  onStart,
  onFinish,
  onCancel,
  onValue,
  onDiscreteValue,
}: TableContentFieldsProps) {
  useSignals()
  const store = useEditorStore()
  const value = useMemo(() => normalizeSimpleTableProps(component.propValue), [component.propValue])
  const selection =
    store.tableCellSelection.value?.componentId === component.id
      ? store.tableCellSelection.value
      : null
  const range = selection
    ? expandTableCellRange(value, {
        startRow: selection.anchorRow,
        startColumn: selection.anchorColumn,
        endRow: selection.focusRow,
        endColumn: selection.focusColumn,
      })
    : null
  const cellIds = range ? getTableCellIdsInRange(value, range) : []
  const cells = cellIds.flatMap((id) => (value.cells[id] ? [value.cells[id]!] : []))
  const primary = selection
    ? getTableCellAt(value, selection.focusRow, selection.focusColumn)
    : null
  const primaryStyle = primary?.style
  const fontSelection = resolveFontFamily(primaryStyle?.fontFamily ?? '')
  const rowIndex = clamp(selection?.focusRow ?? value.grid.length - 1, 0, value.grid.length - 1)
  const columnIndex = clamp(
    selection?.focusColumn ?? value.columnWidths.length - 1,
    0,
    value.columnWidths.length - 1,
  )

  const applyDiscrete = (next: SimpleTableProps, row = rowIndex, column = columnIndex) => {
    if (next === value) return
    onDiscreteValue(next)
    store.selectTableCell(
      component.id,
      clamp(row, 0, next.grid.length - 1),
      clamp(column, 0, next.columnWidths.length - 1),
    )
  }
  const patchCells = (patch: Partial<TableCellStyle>, discrete = true) => {
    if (cellIds.length === 0) return
    const next = updateTableCellsStyle(value, cellIds, patch)
    if (discrete) onDiscreteValue(next)
    else onValue(next)
  }
  const insertRowAt = (index: number) =>
    applyDiscrete(insertTableRow(value, index), index, columnIndex)
  const insertColumnAt = (index: number) =>
    applyDiscrete(insertTableColumn(value, index), rowIndex, index)

  return (
    <div className={styles.tableContentEditor}>
      <div className={styles.tableSummary} role="status">
        <span>
          {value.grid.length} 行 × {value.columnWidths.length} 列
        </span>
        <strong>{cellIds.length > 0 ? `已选 ${cellIds.length} 格` : '选择画布中的单元格'}</strong>
      </div>

      <div className={styles.tableActionGrid} aria-label="表格结构命令">
        <button type="button" disabled={disabled} onClick={() => insertRowAt(rowIndex)}>
          上方插入行
        </button>
        <button type="button" disabled={disabled} onClick={() => insertRowAt(rowIndex + 1)}>
          下方插入行
        </button>
        <button type="button" disabled={disabled} onClick={() => insertColumnAt(columnIndex)}>
          左侧插入列
        </button>
        <button type="button" disabled={disabled} onClick={() => insertColumnAt(columnIndex + 1)}>
          右侧插入列
        </button>
        <button
          type="button"
          disabled={disabled || value.grid.length <= 1}
          data-danger
          onClick={() => applyDiscrete(deleteTableRow(value, rowIndex), rowIndex - 1, columnIndex)}
        >
          删除当前行
        </button>
        <button
          type="button"
          disabled={disabled || value.columnWidths.length <= 1}
          data-danger
          onClick={() =>
            applyDiscrete(deleteTableColumn(value, columnIndex), rowIndex, columnIndex - 1)
          }
        >
          删除当前列
        </button>
      </div>

      <div className={styles.tableActionRow}>
        <button
          type="button"
          disabled={disabled || !range || cellIds.length <= 1}
          onClick={() => {
            if (range)
              applyDiscrete(mergeTableCells(value, range), range.startRow, range.startColumn)
          }}
        >
          合并所选单元格
        </button>
        <button
          type="button"
          disabled={disabled || !primary || (primary.rowSpan === 1 && primary.colSpan === 1)}
          onClick={() => {
            if (primary) applyDiscrete(splitTableCell(value, primary.id))
          }}
        >
          拆分单元格
        </button>
      </div>

      {primary ? (
        <>
          <div className={styles.tableSubheading}>
            <span>单元格</span>
            <small>{cells.length > 1 ? '混合值 · 修改将应用到所选区域' : primary.id}</small>
          </div>
          {cells.length === 1 && (
            <label className={styles.tableWideField}>
              <span>内容</span>
              <textarea
                className={styles.textArea}
                value={primary.text}
                disabled={disabled}
                aria-label="单元格内容"
                onFocus={onStart}
                onBlur={onFinish}
                onChange={(event) =>
                  onValue(updateTableCellText(value, primary.id, event.target.value))
                }
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    onCancel()
                    event.currentTarget.blur()
                  }
                }}
              />
            </label>
          )}

          <div className={styles.tableFieldGrid}>
            <NumberField
              label="当前行高"
              value={round(value.rowHeights[rowIndex] ?? 0)}
              min={8}
              disabled={disabled}
              onStart={onStart}
              onFinish={onFinish}
              onValue={(next) => onValue(resizeTableRow(value, rowIndex, next))}
            />
            <NumberField
              label="当前列宽"
              value={round(value.columnWidths[columnIndex] ?? 0)}
              min={8}
              disabled={disabled}
              onStart={onStart}
              onFinish={onFinish}
              onValue={(next) => onValue(resizeTableColumn(value, columnIndex, next))}
            />
            <NumberField
              label="字号"
              value={primaryStyle?.fontSize ?? 10}
              min={1}
              disabled={disabled}
              onStart={onStart}
              onFinish={onFinish}
              onValue={(next) => patchCells({ fontSize: next }, false)}
            />
            <NumberField
              label="内边距"
              value={primaryStyle?.padding ?? 4}
              min={0}
              disabled={disabled}
              onStart={onStart}
              onFinish={onFinish}
              onValue={(next) => patchCells({ padding: next }, false)}
            />
            <label>
              <span>中文字体</span>
              <select
                value={fontSelection.cjk}
                disabled={disabled}
                onFocus={onStart}
                onBlur={onFinish}
                onChange={(event) =>
                  patchCells(
                    { fontFamily: composeFontFamily(event.target.value, fontSelection.latin) },
                    false,
                  )
                }
              >
                {CJK_FONT_FAMILY_OPTIONS.map(([font, label]) => (
                  <option key={font} value={font}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>西文字体</span>
              <select
                value={fontSelection.latin}
                disabled={disabled}
                onFocus={onStart}
                onBlur={onFinish}
                onChange={(event) =>
                  patchCells(
                    { fontFamily: composeFontFamily(fontSelection.cjk, event.target.value) },
                    false,
                  )
                }
              >
                {LATIN_FONT_FAMILY_OPTIONS.map(([font, label]) => (
                  <option key={font || 'follow-cjk'} value={font}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.tableSegmented} aria-label="字形样式">
            <ToggleButton
              label="粗体"
              active={primaryStyle?.fontWeight === 'bold'}
              disabled={disabled}
              onClick={() =>
                patchCells({
                  fontWeight: primaryStyle?.fontWeight === 'bold' ? 'normal' : 'bold',
                })
              }
            />
            <ToggleButton
              label="斜体"
              active={primaryStyle?.fontStyle === 'italic'}
              disabled={disabled}
              onClick={() =>
                patchCells({
                  fontStyle: primaryStyle?.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
            />
            <ToggleButton
              label="下划线"
              active={primaryStyle?.textDecoration === 'underline'}
              disabled={disabled}
              onClick={() =>
                patchCells({
                  textDecoration:
                    primaryStyle?.textDecoration === 'underline' ? 'none' : 'underline',
                })
              }
            />
          </div>

          <div className={styles.tableFieldGrid}>
            <SelectField
              label="水平对齐"
              value={primaryStyle?.horizontalAlign ?? 'left'}
              disabled={disabled}
              options={[
                ['left', '左对齐'],
                ['center', '居中'],
                ['right', '右对齐'],
              ]}
              onValue={(next) =>
                patchCells({ horizontalAlign: next as TableCellStyle['horizontalAlign'] })
              }
            />
            <SelectField
              label="垂直对齐"
              value={primaryStyle?.verticalAlign ?? 'middle'}
              disabled={disabled}
              options={[
                ['top', '顶部'],
                ['middle', '居中'],
                ['bottom', '底部'],
              ]}
              onValue={(next) =>
                patchCells({ verticalAlign: next as TableCellStyle['verticalAlign'] })
              }
            />
            <ColorField
              label="文字颜色"
              value={primaryStyle?.color ?? '#1d2735'}
              disabled={disabled}
              onStart={onStart}
              onFinish={onFinish}
              onValue={(next) => patchCells({ color: next }, false)}
            />
            <ColorField
              label="背景颜色"
              value={primaryStyle?.background ?? '#ffffff'}
              disabled={disabled}
              onStart={onStart}
              onFinish={onFinish}
              onValue={(next) => patchCells({ background: next }, false)}
            />
            <ColorField
              label="边框颜色"
              value={primaryStyle?.borderColor ?? '#8d99a8'}
              disabled={disabled}
              onStart={onStart}
              onFinish={onFinish}
              onValue={(next) => patchCells({ borderColor: next }, false)}
            />
            <NumberField
              label="边框宽度"
              value={primaryStyle?.borderWidth ?? 1}
              min={0}
              step={0.5}
              disabled={disabled}
              onStart={onStart}
              onFinish={onFinish}
              onValue={(next) => patchCells({ borderWidth: next }, false)}
            />
          </div>
        </>
      ) : (
        <div className={styles.structuredNotice} role="note">
          <strong>在画布中选择单元格</strong>
          <span>拖动可选择区域；双击单元格直接编辑文字。</span>
        </div>
      )}
    </div>
  )
}

function NumberField({
  label,
  value,
  min,
  step = 1,
  disabled,
  onStart,
  onFinish,
  onValue,
}: {
  label: string
  value: number
  min: number
  step?: number
  disabled: boolean
  onStart: () => void
  onFinish: () => void
  onValue: (value: number) => void
}) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        disabled={disabled}
        onFocus={onStart}
        onBlur={onFinish}
        onChange={(event) => onValue(Number(event.target.value))}
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  options,
  disabled,
  onValue,
}: {
  label: string
  value: string
  options: Array<[string, string]>
  disabled: boolean
  onValue: (value: string) => void
}) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} disabled={disabled} onChange={(event) => onValue(event.target.value)}>
        {options.map(([option, text]) => (
          <option key={option} value={option}>
            {text}
          </option>
        ))}
      </select>
    </label>
  )
}

function ColorField({
  label,
  value,
  disabled,
  onStart,
  onFinish,
  onValue,
}: {
  label: string
  value: string
  disabled: boolean
  onStart: () => void
  onFinish: () => void
  onValue: (value: string) => void
}) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="color"
        value={value}
        disabled={disabled}
        onFocus={onStart}
        onBlur={onFinish}
        onChange={(event) => onValue(event.target.value)}
      />
    </label>
  )
}

function ToggleButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string
  active: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button type="button" aria-pressed={active} disabled={disabled} onClick={onClick}>
      {label}
    </button>
  )
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}
