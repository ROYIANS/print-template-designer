import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  expandTableCellRange,
  getTableCellAt,
  getTableCellBounds,
  getTableCellIdsInRange,
  normalizeSimpleTableProps,
  resizeTableColumn,
  resizeTableRow,
  updateTableCellText,
  type ComponentSchema,
  type SimpleTableCell,
  type SimpleTableProps,
  type TableCellRange,
  type TableCellStyle,
} from '@ptd/core'
import { useEditorStore } from '../../state'
import styles from './TableEditor.module.css'

type Variables = CSSProperties & Record<`--${string}`, string>
type ResizeAxis = 'row' | 'column'

interface DragSelection {
  pointerId: number
}

interface ResizeSession {
  cleanup: () => void
}

export function TableEditor({ schema }: { schema: ComponentSchema }) {
  const store = useEditorStore()
  const rootRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragSelection | null>(null)
  const resizeRef = useRef<ResizeSession | null>(null)
  const value = useMemo(() => normalizeSimpleTableProps(schema.propValue), [schema.propValue])
  const selection =
    store.tableCellSelection.value?.componentId === schema.id
      ? store.tableCellSelection.value
      : null
  const selectedRange = selection
    ? expandTableCellRange(value, {
        startRow: selection.anchorRow,
        startColumn: selection.anchorColumn,
        endRow: selection.focusRow,
        endColumn: selection.focusColumn,
      })
    : null
  const selectedCellIds = new Set(selectedRange ? getTableCellIdsInRange(value, selectedRange) : [])
  const editing =
    store.editingTableCell.value?.componentId === schema.id ? store.editingTableCell.value : null
  const totalWidth = sum(value.columnWidths)
  const totalHeight = sum(value.rowHeights)

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(
    () => () => {
      resizeRef.current?.cleanup()
    },
    [],
  )

  const selectCell = (row: number, column: number, extend = false) => {
    store.selectTableCell(schema.id, row, column, extend)
    rootRef.current?.focus({ preventScroll: true })
  }

  const startEditing = (row: number, column: number) => {
    const cell = getTableCellAt(value, row, column)
    if (cell) store.startTableCellEditing(schema.id, cell.id)
  }

  const navigate = (row: number, column: number, extend = false) => {
    selectCell(
      clamp(row, 0, value.grid.length - 1),
      clamp(column, 0, value.columnWidths.length - 1),
      extend,
    )
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (editing || !selection) return
    const cell = getTableCellAt(value, selection.focusRow, selection.focusColumn)
    const bounds = cell ? getTableCellBounds(value, cell.id) : null
    if (!cell || !bounds) return
    let target: { row: number; column: number } | null = null
    switch (event.key) {
      case 'ArrowLeft':
        target = { row: selection.focusRow, column: bounds.startColumn - 1 }
        break
      case 'ArrowRight':
        target = { row: selection.focusRow, column: bounds.endColumn + 1 }
        break
      case 'ArrowUp':
        target = { row: bounds.startRow - 1, column: selection.focusColumn }
        break
      case 'ArrowDown':
        target = { row: bounds.endRow + 1, column: selection.focusColumn }
        break
      case 'Tab': {
        const delta = event.shiftKey ? -1 : 1
        const index = selection.focusRow * value.columnWidths.length + selection.focusColumn + delta
        const wrapped =
          (index + value.grid.length * value.columnWidths.length) %
          (value.grid.length * value.columnWidths.length)
        target = {
          row: Math.floor(wrapped / value.columnWidths.length),
          column: wrapped % value.columnWidths.length,
        }
        break
      }
      case 'Enter':
      case 'F2':
        event.preventDefault()
        event.stopPropagation()
        store.startTableCellEditing(schema.id, cell.id)
        return
      case 'Delete':
      case 'Backspace': {
        event.preventDefault()
        event.stopPropagation()
        let next = value
        for (const id of selectedCellIds) next = updateTableCellText(next, id, '')
        if (next !== value) store.updateComponent(schema.id, { propValue: next })
        return
      }
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        store.clearTableCellSelection(schema.id)
        return
    }
    if (!target) return
    event.preventDefault()
    event.stopPropagation()
    navigate(target.row, target.column, event.shiftKey && event.key !== 'Tab')
  }

  const beginTrackResize = (
    axis: ResizeAxis,
    index: number,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    resizeRef.current?.cleanup()
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect) return
    const sizes = axis === 'column' ? value.columnWidths : value.rowHeights
    const first = sizes[index]
    const second = sizes[index + 1]
    const pixelSize = axis === 'column' ? rect.width : rect.height
    if (first === undefined || second === undefined || pixelSize <= 0) return
    const start = axis === 'column' ? event.clientX : event.clientY
    const total = sum(sizes)
    let settled = false
    store.beginGesture()

    const cleanup = () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', finish)
      document.removeEventListener('pointercancel', cancel)
      window.removeEventListener('blur', finish)
      resizeRef.current = null
    }
    const finish = () => {
      if (settled) return
      settled = true
      cleanup()
      store.commitGesture()
    }
    const cancel = () => {
      if (settled) return
      settled = true
      cleanup()
      store.cancelGesture()
    }
    const move = (nextEvent: globalThis.PointerEvent) => {
      const pointer = axis === 'column' ? nextEvent.clientX : nextEvent.clientY
      const requestedDelta = ((pointer - start) / pixelSize) * total
      const delta = clamp(requestedDelta, 8 - first, second - 8)
      let next: SimpleTableProps
      if (axis === 'column') {
        next = resizeTableColumn(value, index, first + delta)
        next = resizeTableColumn(next, index + 1, second - delta)
      } else {
        next = resizeTableRow(value, index, first + delta)
        next = resizeTableRow(next, index + 1, second - delta)
      }
      store.updateComponent(schema.id, { propValue: next }, true)
    }

    resizeRef.current = { cleanup: finish }
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', finish)
    document.addEventListener('pointercancel', cancel)
    window.addEventListener('blur', finish)
  }

  return (
    <div
      ref={rootRef}
      className={styles.editor}
      data-ptd-table-editor
      data-ptd-editor-interactive
      role="group"
      aria-label={`${schema.name ?? '自由表格'}，单元格编辑`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerMove={(event) => {
        if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return
        const target = document.elementFromPoint(event.clientX, event.clientY)
        const cell =
          target instanceof Element ? target.closest<HTMLElement>('[data-table-cell]') : null
        if (!cell || cell.closest('[data-ptd-table-editor]') !== rootRef.current) return
        const row = Number(cell.dataset.row)
        const column = Number(cell.dataset.column)
        if (Number.isInteger(row) && Number.isInteger(column)) selectCell(row, column, true)
      }}
      onPointerUp={(event) => {
        if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null
      }}
      onPointerCancel={() => {
        dragRef.current = null
      }}
    >
      <table className={styles.table} role="grid">
        <colgroup>
          {value.columnWidths.map((width, index) => (
            <col key={index} style={trackVariables((width / totalWidth) * 100)} />
          ))}
        </colgroup>
        <tbody>
          {value.grid.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={trackVariables(((value.rowHeights[rowIndex] ?? 0) / totalHeight) * 100)}
            >
              {row.map((cellId, columnIndex) => {
                const cell = value.cells[cellId]
                const bounds = getTableCellBounds(value, cellId)
                if (
                  !cell ||
                  !bounds ||
                  bounds.startRow !== rowIndex ||
                  bounds.startColumn !== columnIndex
                )
                  return null
                const isEditing = editing?.cellId === cellId
                return (
                  <td
                    key={cellId}
                    className={styles.cell}
                    style={cellVariables(cell.style)}
                    rowSpan={cell.rowSpan}
                    colSpan={cell.colSpan}
                    data-table-cell
                    data-cell-id={cellId}
                    data-row={rowIndex}
                    data-column={columnIndex}
                    data-selected={selectedCellIds.has(cellId) || undefined}
                    data-primary={
                      (selection &&
                        value.grid[selection.focusRow]?.[selection.focusColumn] === cellId) ||
                      undefined
                    }
                    aria-selected={selectedCellIds.has(cellId)}
                    onPointerDown={(event) => {
                      if (event.button !== 0 || isEditing) return
                      event.preventDefault()
                      event.stopPropagation()
                      selectCell(rowIndex, columnIndex, event.shiftKey)
                      dragRef.current = { pointerId: event.pointerId }
                    }}
                    onDoubleClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      startEditing(rowIndex, columnIndex)
                    }}
                  >
                    {isEditing ? (
                      <TableCellInput
                        cell={cell}
                        onCommit={(text) => store.commitTableCellEditing(schema.id, cellId, text)}
                        onCancel={() => store.cancelTableCellEditing(schema.id, cellId)}
                      />
                    ) : (
                      <div className={styles.cellContent}>{cell.text}</div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {value.columnWidths.slice(0, -1).map((_, index) => (
        <button
          key={`column-${index}`}
          type="button"
          className={styles.columnHandle}
          style={handleVariables(trackPosition(value.columnWidths, index))}
          aria-label={`调整第 ${index + 1} 列与第 ${index + 2} 列的宽度`}
          onPointerDown={(event) => beginTrackResize('column', index, event)}
        />
      ))}
      {value.rowHeights.slice(0, -1).map((_, index) => (
        <button
          key={`row-${index}`}
          type="button"
          className={styles.rowHandle}
          style={handleVariables(trackPosition(value.rowHeights, index))}
          aria-label={`调整第 ${index + 1} 行与第 ${index + 2} 行的高度`}
          onPointerDown={(event) => beginTrackResize('row', index, event)}
        />
      ))}
      {selectedRange && <SelectionReadout range={selectedRange} count={selectedCellIds.size} />}
    </div>
  )
}

function TableCellInput({
  cell,
  onCommit,
  onCancel,
}: {
  cell: SimpleTableCell
  onCommit: (text: string) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(cell.text)
  const settledRef = useRef(false)
  const composingRef = useRef(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const commit = () => {
    if (settledRef.current) return
    settledRef.current = true
    onCommit(draft.replace(/\r\n/g, '\n'))
  }
  const cancel = () => {
    if (settledRef.current) return
    settledRef.current = true
    onCancel()
  }

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
    inputRef.current?.select()
  }, [])

  return (
    <textarea
      ref={inputRef}
      className={styles.cellInput}
      aria-label="单元格内容"
      value={draft}
      spellCheck
      data-ptd-editor-interactive
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onCompositionStart={() => {
        composingRef.current = true
      }}
      onCompositionEnd={() => {
        composingRef.current = false
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key === 'Escape' && !composingRef.current) {
          event.preventDefault()
          cancel()
        } else if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          event.preventDefault()
          commit()
        }
      }}
    />
  )
}

function SelectionReadout({ range, count }: { range: TableCellRange; count: number }) {
  const rows = range.endRow - range.startRow + 1
  const columns = range.endColumn - range.startColumn + 1
  return (
    <span className={styles.selectionReadout} aria-live="polite">
      {rows} × {columns} · {count} 格
    </span>
  )
}

function cellVariables(style: TableCellStyle): Variables {
  return {
    '--table-font-family': style.fontFamily,
    '--table-font-size': `${style.fontSize}px`,
    '--table-font-weight': style.fontWeight,
    '--table-font-style': style.fontStyle,
    '--table-text-decoration': style.textDecoration,
    '--table-color': style.color,
    '--table-background': style.background,
    '--table-horizontal-align': style.horizontalAlign,
    '--table-vertical-align': style.verticalAlign,
    '--table-padding': `${style.padding}px`,
    '--table-border-color': style.borderColor,
    '--table-border-width': `${style.borderWidth}px`,
    '--table-border-style': style.borderStyle,
  }
}

function trackVariables(percent: number): Variables {
  return { '--table-track-size': `${percent}%` }
}

function handleVariables(percent: number): Variables {
  return { '--table-handle-position': `${percent}%` }
}

function trackPosition(values: number[], boundaryIndex: number): number {
  return (sum(values.slice(0, boundaryIndex + 1)) / sum(values)) * 100
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) || 1
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}
