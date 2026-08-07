import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { useState, type ReactNode } from 'react'
import { PtdField } from './Field'
import styles from './primitives.module.css'

export interface PtdSegmentedOption {
  value: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

export interface PtdSegmentedProps {
  label: string
  options: readonly PtdSegmentedOption[]
  value?: string
  defaultValue?: string
  disabled?: boolean
  locked?: boolean
  wide?: boolean
  onValueChange?: (value: string) => void
}

export function PtdSegmented({
  label,
  options,
  value,
  defaultValue,
  disabled = false,
  locked = false,
  wide = false,
  onValueChange,
}: PtdSegmentedProps) {
  const selectableOptions = options.filter((option) => option.value.length > 0)
  const [internalValue, setInternalValue] = useStateValue(defaultValue)
  const effectiveDisabled = disabled || locked || selectableOptions.length === 0
  const currentValue = value === undefined ? internalValue : value

  return (
    <PtdField label={label} wide={wide} disabled={effectiveDisabled} locked={locked}>
      <ToggleGroup.Root
        className={styles.segmentedRoot}
        type="single"
        value={currentValue}
        disabled={effectiveDisabled}
        rovingFocus
        loop
        role="group"
        aria-label={label}
        data-ptd-editor-interactive="true"
        data-count={selectableOptions.length}
        onValueChange={(nextValue) => {
          if (!nextValue) return
          if (value === undefined) setInternalValue(nextValue)
          onValueChange?.(nextValue)
        }}
      >
        {selectableOptions.map((option) => (
          <ToggleGroup.Item
            key={option.value}
            className={styles.segmentedItem}
            value={option.value}
            disabled={effectiveDisabled || option.disabled}
            aria-label={typeof option.label === 'string' ? option.label : undefined}
          >
            {option.icon}
            <span className={styles.segmentedLabel}>{option.label}</span>
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
    </PtdField>
  )
}

function useStateValue(initial: string | undefined): [string, (value: string) => void] {
  // Kept local to avoid exposing a state-management dependency from the primitive package.
  const [value, setValue] = useState(initial ?? '')
  return [value, setValue]
}
