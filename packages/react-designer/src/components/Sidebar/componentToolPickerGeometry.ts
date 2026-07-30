export interface ComponentPickerRect {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}

export interface ComponentPickerGeometry {
  left: number
  top: number
  width: number
  maxHeight: number
}

const PICKER_GUTTER = 8
const PICKER_MAX_WIDTH = 264
const PICKER_MIN_WIDTH = 176
const PICKER_MIN_HEIGHT = 160

export function componentToolPickerGeometry(
  trigger: Pick<ComponentPickerRect, 'top' | 'right'>,
  bounds: ComponentPickerRect,
  contentHeight: number,
): ComponentPickerGeometry {
  const rightSideWidth = Math.max(0, bounds.right - trigger.right - PICKER_GUTTER * 2)
  const width = Math.min(PICKER_MAX_WIDTH, Math.max(PICKER_MIN_WIDTH, rightSideWidth))
  const left =
    rightSideWidth >= PICKER_MIN_WIDTH
      ? trigger.right + PICKER_GUTTER
      : Math.max(bounds.left + PICKER_GUTTER, bounds.right - width - PICKER_GUTTER)
  const maxHeight = Math.max(PICKER_MIN_HEIGHT, bounds.height - PICKER_GUTTER * 2)
  const measuredHeight = Math.min(contentHeight || 480, maxHeight)
  const maximumTop = bounds.bottom - measuredHeight - PICKER_GUTTER
  const top = Math.max(bounds.top + PICKER_GUTTER, Math.min(trigger.top, maximumTop))

  return { left, top, width, maxHeight }
}
