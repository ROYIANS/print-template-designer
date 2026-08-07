import * as Select from '@radix-ui/react-select'
import { RiArrowDownSLine, RiCheckLine } from '@remixicon/react'
import { useEffect, useState, type ReactNode } from 'react'
import { ptdThemeClass } from './theme'
import styles from './primitives.module.css'
import { PtdField } from './Field'

export interface PtdSelectOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface PtdSelectProps {
  label: string
  options: readonly PtdSelectOption[]
  value?: string
  defaultValue?: string
  open?: boolean
  defaultOpen?: boolean
  placeholder?: ReactNode
  disabled?: boolean
  locked?: boolean
  wide?: boolean
  onValueChange?: (value: string) => void
  onOpenChange?: (open: boolean) => void
}

export function PtdSelect({
  label,
  options,
  value,
  defaultValue,
  open,
  defaultOpen = false,
  placeholder = '请选择',
  disabled = false,
  locked = false,
  wide = false,
  onValueChange,
  onOpenChange,
}: PtdSelectProps) {
  const selectableOptions = options.filter((option) => option.value.length > 0)
  const effectiveDisabled = disabled || locked || selectableOptions.length === 0
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const currentValue = value === undefined ? internalValue : value
  const currentOpen = open === undefined ? internalOpen : open
  const effectiveOpen = effectiveDisabled ? false : currentOpen

  useEffect(() => {
    if (!effectiveDisabled || !currentOpen) return
    // The Radix root is controlled so a lock transition closes an already-open portal immediately.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the uncontrolled open contract on lock
    setInternalOpen(false)
    onOpenChange?.(false)
  }, [currentOpen, effectiveDisabled, onOpenChange])

  const handleValueChange = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue)
    onValueChange?.(nextValue)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (effectiveDisabled && nextOpen) return
    if (open === undefined) setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  return (
    <PtdField label={label} wide={wide} disabled={effectiveDisabled} locked={locked}>
      <Select.Root
        value={currentValue}
        open={effectiveOpen}
        onValueChange={handleValueChange}
        onOpenChange={handleOpenChange}
      >
        <Select.Trigger
          className={styles.selectTrigger}
          aria-label={label}
          disabled={effectiveDisabled}
          data-ptd-editor-interactive="true"
        >
          <Select.Value
            className={styles.selectValue}
            placeholder={selectableOptions.length ? placeholder : '无可用选项'}
          />
          <Select.Icon className={styles.selectIcon}>
            <RiArrowDownSLine aria-hidden="true" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className={`${styles.selectContent} ${ptdThemeClass}`}
            position="popper"
            sideOffset={4}
            data-ptd-editor-interactive="true"
          >
            <Select.Viewport className={styles.selectViewport}>
              {selectableOptions.length === 0 ? (
                <div className={styles.selectEmpty}>无可用选项</div>
              ) : (
                selectableOptions.map((option) => (
                  <Select.Item
                    key={option.value}
                    className={styles.selectItem}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    <Select.ItemIndicator className={styles.selectItemIndicator}>
                      <RiCheckLine aria-hidden="true" />
                    </Select.ItemIndicator>
                    <Select.ItemText className={styles.selectItemText}>
                      {option.label}
                    </Select.ItemText>
                  </Select.Item>
                ))
              )}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </PtdField>
  )
}
