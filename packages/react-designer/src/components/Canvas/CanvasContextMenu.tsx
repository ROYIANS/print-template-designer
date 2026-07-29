import { type ReactNode } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import * as ContextMenu from '@radix-ui/react-context-menu'
import {
  RiArrowRightSLine,
  RiBringForward,
  RiBringToFront,
  RiClipboardLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiGroupLine,
  RiLayoutRightLine,
  RiLockLine,
  RiLockUnlockLine,
  RiScissorsCutLine,
  RiSendBackward,
  RiSendToBack,
  RiSplitCellsHorizontal,
  RiStackLine,
} from '@remixicon/react'
import { useEditorStore } from '../../state'
import { ptdThemeClass } from '../Theme'
import styles from './CanvasContextMenu.module.css'

interface CanvasContextMenuProps {
  children: ReactNode
  onOpenInspector: () => void
  onPasteAtContext: () => void
}

interface MenuItemProps {
  label: string
  shortcut?: string
  disabled?: boolean
  danger?: boolean
  onSelect: () => void
  children: ReactNode
}

function MenuItem({
  label,
  shortcut,
  disabled = false,
  danger = false,
  onSelect,
  children,
}: MenuItemProps) {
  return (
    <ContextMenu.Item
      className={styles.item}
      disabled={disabled}
      data-danger={danger || undefined}
      onSelect={onSelect}
    >
      {children}
      <span>{label}</span>
      {shortcut && <kbd>{shortcut}</kbd>}
    </ContextMenu.Item>
  )
}

function LayerMenu({ disabled }: { disabled: boolean }) {
  const store = useEditorStore()
  return (
    <ContextMenu.Sub>
      <ContextMenu.SubTrigger className={styles.item} disabled={disabled}>
        <RiStackLine aria-hidden="true" />
        <span>排列层级</span>
        <RiArrowRightSLine className={styles.subArrow} aria-hidden="true" />
      </ContextMenu.SubTrigger>
      <ContextMenu.Portal>
        <ContextMenu.SubContent
          className={`${styles.content} ${ptdThemeClass}`}
          sideOffset={4}
          collisionPadding={8}
        >
          <MenuItem label="上移一层" onSelect={() => store.moveLayer('forward')}>
            <RiBringForward aria-hidden="true" />
          </MenuItem>
          <MenuItem label="下移一层" onSelect={() => store.moveLayer('backward')}>
            <RiSendBackward aria-hidden="true" />
          </MenuItem>
          <ContextMenu.Separator className={styles.separator} />
          <MenuItem label="置于顶层" onSelect={() => store.moveLayer('front')}>
            <RiBringToFront aria-hidden="true" />
          </MenuItem>
          <MenuItem label="置于底层" onSelect={() => store.moveLayer('back')}>
            <RiSendToBack aria-hidden="true" />
          </MenuItem>
        </ContextMenu.SubContent>
      </ContextMenu.Portal>
    </ContextMenu.Sub>
  )
}

export function CanvasContextMenu({
  children,
  onOpenInspector,
  onPasteAtContext,
}: CanvasContextMenuProps) {
  useSignals()
  const store = useEditorStore()
  const selected = store.selectedComponents.value
  const blank = selected.length === 0
  const hasLocked = selected.some((component) => component.isLock)
  const canGroup = selected.length > 1 && !hasLocked
  const canUngroup =
    !hasLocked &&
    selected.length > 0 &&
    selected.every((component) => component.component === 'RoyGroup')

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className={`${styles.content} ${ptdThemeClass}`} collisionPadding={8}>
          <MenuItem label={blank ? '页面属性' : '组件属性'} onSelect={onOpenInspector}>
            <RiLayoutRightLine aria-hidden="true" />
          </MenuItem>

          {blank ? (
            <>
              <ContextMenu.Separator className={styles.separator} />
              <MenuItem
                label="粘贴到此处"
                shortcut="Ctrl V"
                disabled={!store.clipboard.value}
                onSelect={onPasteAtContext}
              >
                <RiClipboardLine aria-hidden="true" />
              </MenuItem>
            </>
          ) : (
            <>
              <ContextMenu.Separator className={styles.separator} />
              <MenuItem label="复制" shortcut="Ctrl C" onSelect={() => store.copy()}>
                <RiFileCopyLine aria-hidden="true" />
              </MenuItem>
              <MenuItem
                label="剪切"
                shortcut="Ctrl X"
                disabled={hasLocked}
                onSelect={() => store.cut()}
              >
                <RiScissorsCutLine aria-hidden="true" />
              </MenuItem>
              <ContextMenu.Separator className={styles.separator} />
              <MenuItem
                label={hasLocked ? '解锁所选对象' : '锁定所选对象'}
                onSelect={() => store.setLock(!hasLocked)}
              >
                {hasLocked ? (
                  <RiLockUnlockLine aria-hidden="true" />
                ) : (
                  <RiLockLine aria-hidden="true" />
                )}
              </MenuItem>
              {canGroup && (
                <MenuItem label="组合所选对象" onSelect={() => store.group()}>
                  <RiGroupLine aria-hidden="true" />
                </MenuItem>
              )}
              {canUngroup && (
                <MenuItem label="拆分组合" onSelect={() => store.ungroup()}>
                  <RiSplitCellsHorizontal aria-hidden="true" />
                </MenuItem>
              )}
              <LayerMenu disabled={hasLocked} />
              <ContextMenu.Separator className={styles.separator} />
              <MenuItem
                label="删除"
                shortcut="Delete"
                disabled={hasLocked}
                danger
                onSelect={() => store.deleteSelected()}
              >
                <RiDeleteBinLine aria-hidden="true" />
              </MenuItem>
            </>
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
