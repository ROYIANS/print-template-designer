import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import {
  RiArrowDownSLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiBookOpenLine,
  RiBringToFront,
  RiClipboardLine,
  RiCloseLine,
  RiFileCopyLine,
  RiFileLine,
  RiFolderOpenLine,
  RiFullscreenLine,
  RiGroupLine,
  RiGuideLine,
  RiInformationLine,
  RiKeyboardBoxLine,
  RiLayoutLine,
  RiLoader4Line,
  RiLock2Line,
  RiMenuLine,
  RiPagesLine,
  RiRulerLine,
  RiSave2Line,
  RiSave3Line,
  RiScissorsCutLine,
  RiSendToBack,
  RiSideBarLine,
  RiStackLine,
  RiUser3Line,
  RiZoomInLine,
  RiZoomOutLine,
  type RemixiconComponentType,
} from '@remixicon/react'
import type { DesignerHostCommandController, DesignerHostCommandId } from '../../host'
import type { EditorStore } from '../../state'
import { useEditorStore } from '../../state'
import type { ResourcePanelId } from '../../hooks/useWorkspaceLayout'
import styles from './AppBar.module.css'

type EditorCommandId =
  | 'undo'
  | 'redo'
  | 'cut'
  | 'copy'
  | 'paste'
  | 'group'
  | 'ungroup'
  | 'toggleLock'
  | 'moveForward'
  | 'moveBackward'
  | 'toggleRuler'
  | 'toggleGuides'
  | 'zoomIn'
  | 'zoomOut'

type WorkspaceCommandId = ResourcePanelId | 'inspector'

interface AppMenuItemBase {
  icon: RemixiconComponentType
  label: string
  description: string
  shortcut?: string
}

type AppMenuItem = AppMenuItemBase &
  (
    | { kind: 'host'; command: DesignerHostCommandId }
    | { kind: 'editor'; command: EditorCommandId }
    | { kind: 'workspace'; command: WorkspaceCommandId }
    | { kind: 'planned'; reason: string }
  )

interface AppMenu {
  id: 'file' | 'edit' | 'object' | 'view' | 'window' | 'help'
  label: string
  mnemonic: string
  items: readonly AppMenuItem[]
}

interface AppBarWorkspaceCommands {
  resourcesOpen: boolean
  inspectorOpen: boolean
  openResource: (panel: ResourcePanelId) => void
  toggleInspector: () => void
}

interface AppBarProps {
  hostCommands?: DesignerHostCommandController
  workspace?: AppBarWorkspaceCommands
}

const APP_MENUS: readonly AppMenu[] = [
  {
    id: 'file',
    label: '文件',
    mnemonic: 'F',
    items: [
      {
        kind: 'host',
        command: 'new',
        icon: RiFileLine,
        label: '新建模板',
        description: '创建一个空白结构化文档',
        shortcut: 'Ctrl+N',
      },
      {
        kind: 'host',
        command: 'open',
        icon: RiFolderOpenLine,
        label: '打开模板',
        description: '从模板库或文件打开模板',
        shortcut: 'Ctrl+O',
      },
      {
        kind: 'host',
        command: 'save',
        icon: RiSave3Line,
        label: '保存模板',
        description: '保存当前模板内容',
        shortcut: 'Ctrl+S',
      },
      {
        kind: 'host',
        command: 'saveAs',
        icon: RiSave2Line,
        label: '另存为',
        description: '以新文档保存模板副本',
        shortcut: 'Ctrl+Shift+S',
      },
    ],
  },
  {
    id: 'edit',
    label: '编辑',
    mnemonic: 'E',
    items: [
      {
        kind: 'editor',
        command: 'undo',
        icon: RiArrowGoBackLine,
        label: '撤销',
        description: '撤销上一步编辑',
        shortcut: 'Ctrl+Z',
      },
      {
        kind: 'editor',
        command: 'redo',
        icon: RiArrowGoForwardLine,
        label: '重做',
        description: '恢复刚刚撤销的编辑',
        shortcut: 'Ctrl+Shift+Z',
      },
      {
        kind: 'editor',
        command: 'cut',
        icon: RiScissorsCutLine,
        label: '剪切',
        description: '剪切当前选择',
        shortcut: 'Ctrl+X',
      },
      {
        kind: 'editor',
        command: 'copy',
        icon: RiFileCopyLine,
        label: '复制',
        description: '复制当前选择',
        shortcut: 'Ctrl+C',
      },
      {
        kind: 'editor',
        command: 'paste',
        icon: RiClipboardLine,
        label: '粘贴',
        description: '粘贴剪贴板内容',
        shortcut: 'Ctrl+V',
      },
    ],
  },
  {
    id: 'object',
    label: '对象',
    mnemonic: 'O',
    items: [
      {
        kind: 'editor',
        command: 'group',
        icon: RiGroupLine,
        label: '组合',
        description: '将多个组件组合编辑',
        shortcut: 'Ctrl+G',
      },
      {
        kind: 'editor',
        command: 'ungroup',
        icon: RiLayoutLine,
        label: '拆分',
        description: '拆分当前组件组合',
        shortcut: 'Ctrl+Shift+G',
      },
      {
        kind: 'editor',
        command: 'toggleLock',
        icon: RiLock2Line,
        label: '锁定 / 解锁',
        description: '切换当前选择的锁定状态',
        shortcut: 'Ctrl+L',
      },
      {
        kind: 'editor',
        command: 'moveForward',
        icon: RiBringToFront,
        label: '上移一层',
        description: '调整对象堆叠顺序',
        shortcut: 'Ctrl+]',
      },
      {
        kind: 'editor',
        command: 'moveBackward',
        icon: RiSendToBack,
        label: '下移一层',
        description: '调整对象堆叠顺序',
        shortcut: 'Ctrl+[',
      },
    ],
  },
  {
    id: 'view',
    label: '视图',
    mnemonic: 'V',
    items: [
      {
        kind: 'editor',
        command: 'toggleRuler',
        icon: RiRulerLine,
        label: '显示标尺',
        description: '切换页面标尺显示',
        shortcut: 'Ctrl+R',
      },
      {
        kind: 'editor',
        command: 'toggleGuides',
        icon: RiGuideLine,
        label: '显示参考线',
        description: '切换参考线显示',
        shortcut: 'Ctrl+;',
      },
      {
        kind: 'editor',
        command: 'zoomIn',
        icon: RiZoomInLine,
        label: '放大',
        description: '放大当前画布',
        shortcut: 'Ctrl++',
      },
      {
        kind: 'editor',
        command: 'zoomOut',
        icon: RiZoomOutLine,
        label: '缩小',
        description: '缩小当前画布',
        shortcut: 'Ctrl+-',
      },
      {
        kind: 'planned',
        reason: '等待画布可视区域测量合同',
        icon: RiFullscreenLine,
        label: '适合页面',
        description: '让页面适配工作区',
        shortcut: 'Ctrl+0',
      },
    ],
  },
  {
    id: 'window',
    label: '窗口',
    mnemonic: 'W',
    items: [
      {
        kind: 'workspace',
        command: 'assets',
        icon: RiLayoutLine,
        label: '素材面板',
        description: '浏览图片与组件素材',
        shortcut: 'F6',
      },
      {
        kind: 'workspace',
        command: 'pages',
        icon: RiPagesLine,
        label: '页面面板',
        description: '管理模板页面',
        shortcut: 'F7',
      },
      {
        kind: 'workspace',
        command: 'layers',
        icon: RiStackLine,
        label: '图层面板',
        description: '查看对象与层级',
        shortcut: 'F8',
      },
      {
        kind: 'workspace',
        command: 'inspector',
        icon: RiSideBarLine,
        label: '属性面板',
        description: '打开或收起属性面板',
        shortcut: 'F9',
      },
    ],
  },
  {
    id: 'help',
    label: '帮助',
    mnemonic: 'H',
    items: [
      {
        kind: 'host',
        command: 'keyboardShortcuts',
        icon: RiKeyboardBoxLine,
        label: '快捷键',
        description: '查看完整快捷键表',
        shortcut: 'Ctrl+/',
      },
      {
        kind: 'host',
        command: 'documentation',
        icon: RiBookOpenLine,
        label: '使用文档',
        description: '打开 Foliq 使用指南',
        shortcut: 'F1',
      },
      {
        kind: 'host',
        command: 'about',
        icon: RiInformationLine,
        label: '关于 Foliq',
        description: '版本、许可与项目信息',
      },
    ],
  },
]

type AppMenuId = AppMenu['id']

interface CommandState {
  enabled: boolean
  pending: boolean
  reason?: string
}

const UNAVAILABLE: CommandState = { enabled: false, pending: false, reason: '功能待接入' }

function hasLockedSelection(store: EditorStore): boolean {
  return store.selectedComponents.value.some((component) => component.isLock)
}

function getEditorCommandState(store: EditorStore, command: EditorCommandId): CommandState {
  const selected = store.selectedComponents.value
  const locked = hasLockedSelection(store)
  let enabled = true

  if (command === 'undo') enabled = store.canUndo.value
  if (command === 'redo') enabled = store.canRedo.value
  if (command === 'copy') enabled = selected.length > 0
  if (command === 'cut') enabled = selected.length > 0 && !locked
  if (command === 'paste') enabled = Boolean(store.clipboard.value)
  if (command === 'group') enabled = selected.length > 1 && !locked
  if (command === 'ungroup') {
    enabled = !locked && selected.some((component) => component.component === 'RoyGroup')
  }
  if (command === 'toggleLock') enabled = selected.length > 0
  if (command === 'moveForward' || command === 'moveBackward') {
    enabled = selected.length > 0 && !locked
  }
  if (command === 'zoomIn') enabled = store.scale.value < 2
  if (command === 'zoomOut') enabled = store.scale.value > 0.25

  return enabled
    ? { enabled: true, pending: false }
    : { enabled: false, pending: false, reason: '当前状态不可用' }
}

function runEditorCommand(store: EditorStore, command: EditorCommandId): void {
  if (command === 'undo') store.undo()
  if (command === 'redo') store.redo()
  if (command === 'cut') store.cut()
  if (command === 'copy') store.copy()
  if (command === 'paste') store.paste()
  if (command === 'group') store.group()
  if (command === 'ungroup') store.ungroup()
  if (command === 'toggleLock') store.toggleLock()
  if (command === 'moveForward') store.moveLayer('forward')
  if (command === 'moveBackward') store.moveLayer('backward')
  if (command === 'toggleRuler') store.toggleRuler()
  if (command === 'toggleGuides') store.toggleGuidesVisible()
  if (command === 'zoomIn') store.setZoom(store.scale.value + 0.25)
  if (command === 'zoomOut') store.setZoom(store.scale.value - 0.25)
}

export function AppBar({ hostCommands, workspace }: AppBarProps) {
  useSignals()
  const store = useEditorStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<AppMenuId>('file')
  const appBarRef = useRef<HTMLElement>(null)
  const menuButtonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const activeMenu = APP_MENUS.find((menu) => menu.id === activeMenuId) ?? APP_MENUS[0]!

  const openMenu = (menuId?: AppMenuId) => {
    if (menuId) setActiveMenuId(menuId)
    setIsExpanded(true)
  }

  const closeMenu = () => setIsExpanded(false)

  const toggleMenu = (menuId: AppMenuId) => {
    if (isExpanded && activeMenuId === menuId) closeMenu()
    else openMenu(menuId)
  }

  useEffect(() => {
    if (!isExpanded) return
    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !appBarRef.current?.contains(event.target)) closeMenu()
    }
    document.addEventListener('pointerdown', handleOutsidePointerDown)
    return () => document.removeEventListener('pointerdown', handleOutsidePointerDown)
  }, [isExpanded])

  const getCommandState = (item: AppMenuItem): CommandState => {
    if (item.kind === 'host') return hostCommands?.getState(item.command) ?? UNAVAILABLE
    if (item.kind === 'editor') return getEditorCommandState(store, item.command)
    if (item.kind === 'workspace') {
      return workspace
        ? { enabled: true, pending: false }
        : { enabled: false, pending: false, reason: '工作区控制器未接入' }
    }
    return { enabled: false, pending: false, reason: item.reason }
  }

  const executeCommand = async (item: AppMenuItem): Promise<boolean> => {
    const state = getCommandState(item)
    if (!state.enabled || state.pending) return false
    if (item.kind === 'host') return (await hostCommands?.execute(item.command)) ?? false
    if (item.kind === 'editor') runEditorCommand(store, item.command)
    if (item.kind === 'workspace' && workspace) {
      if (item.command === 'inspector') workspace.toggleInspector()
      else workspace.openResource(item.command)
    }
    return item.kind !== 'planned'
  }

  const executeAndClose = (item: AppMenuItem) => {
    void executeCommand(item).then((executed) => {
      if (executed) closeMenu()
    })
  }

  const moveMenuFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % APP_MENUS.length
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + APP_MENUS.length) % APP_MENUS.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = APP_MENUS.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    const nextMenu = APP_MENUS[nextIndex]
    if (!nextMenu) return
    if (isExpanded) openMenu(nextMenu.id)
    menuButtonRefs.current[nextIndex]?.focus()
  }

  const openState = hostCommands?.getState('open') ?? UNAVAILABLE
  const saveState = hostCommands?.getState('save') ?? UNAVAILABLE

  return (
    <header
      ref={appBarRef}
      className={styles.appBar}
      data-expanded={isExpanded}
      data-ptd-editor-interactive
      data-ptd-region="app-bar"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeMenu()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        event.preventDefault()
        event.stopPropagation()
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        closeMenu()
      }}
    >
      <div className={styles.topBar}>
        <div className={styles.brand} aria-label="Foliq 结构化文档设计器">
          <span className={styles.legacyLogo} aria-hidden="true" />
          <span className={styles.wordmark}>Foliq</span>
          <span className={styles.productName}>结构化文档设计器</span>
        </div>

        <nav className={styles.menuBar} aria-label="应用菜单">
          {APP_MENUS.map((menu, index) => (
            <button
              key={menu.id}
              ref={(node) => {
                menuButtonRefs.current[index] = node
              }}
              type="button"
              className={styles.menuTrigger}
              data-active={isExpanded && activeMenuId === menu.id}
              aria-controls="ptd-application-menu"
              aria-expanded={isExpanded && activeMenuId === menu.id}
              aria-keyshortcuts={`Alt+${menu.mnemonic}`}
              accessKey={menu.mnemonic.toLowerCase()}
              onClick={() => toggleMenu(menu.id)}
              onKeyDown={(event) => moveMenuFocus(event, index)}
            >
              <span>
                {menu.label}
                <span className={styles.mnemonic}>({menu.mnemonic})</span>
              </span>
              <RiArrowDownSLine aria-hidden="true" />
            </button>
          ))}
        </nav>

        <button
          type="button"
          className={styles.mobileMenuTrigger}
          aria-controls="ptd-application-menu"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? '关闭应用菜单' : '打开应用菜单'}
          onClick={() => (isExpanded ? closeMenu() : openMenu(activeMenuId))}
        >
          {isExpanded ? <RiCloseLine aria-hidden="true" /> : <RiMenuLine aria-hidden="true" />}
        </button>

        <div className={styles.actions}>
          {hostCommands?.configured && (
            <>
              <button
                type="button"
                className={styles.quietAction}
                disabled={!openState.enabled || openState.pending}
                aria-busy={openState.pending}
                title={openState.reason}
                onClick={() => void hostCommands.execute('open')}
              >
                {openState.pending ? (
                  <RiLoader4Line className={styles.pendingIcon} aria-hidden="true" />
                ) : (
                  <RiFolderOpenLine aria-hidden="true" />
                )}
                <span>{openState.pending ? '正在打开' : '打开模板'}</span>
              </button>
              <button
                type="button"
                className={styles.primaryAction}
                disabled={!saveState.enabled || saveState.pending}
                aria-busy={saveState.pending}
                title={saveState.reason}
                onClick={() => void hostCommands.execute('save')}
              >
                {saveState.pending ? (
                  <RiLoader4Line className={styles.pendingIcon} aria-hidden="true" />
                ) : (
                  <RiSave3Line aria-hidden="true" />
                )}
                <span>{saveState.pending ? '正在保存' : '保存模板'}</span>
              </button>
            </>
          )}
          <button
            type="button"
            className={styles.userPlaceholder}
            aria-disabled="true"
            aria-label="用户账户（由宿主应用提供）"
            title="用户账户由宿主应用提供"
            onClick={(event) => event.preventDefault()}
          >
            <RiUser3Line aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        id="ptd-application-menu"
        className={styles.menuPanel}
        aria-hidden={!isExpanded}
        data-ptd-region="application-menu"
      >
        <div className={styles.menuPanelClip}>
          <div className={styles.menuPanelInner} data-open={isExpanded}>
            <nav className={styles.mobileCategories} aria-label="应用菜单分类">
              {APP_MENUS.map((menu) => (
                <button
                  key={menu.id}
                  type="button"
                  data-active={activeMenuId === menu.id}
                  aria-pressed={activeMenuId === menu.id}
                  tabIndex={isExpanded ? 0 : -1}
                  onClick={() => openMenu(menu.id)}
                >
                  {menu.label}
                  <span>({menu.mnemonic})</span>
                </button>
              ))}
            </nav>
            <div className={styles.commandGrid} aria-label={`${activeMenu.label}菜单命令`}>
              {activeMenu.items.map((item) => {
                const state = getCommandState(item)
                const Icon = state.pending ? RiLoader4Line : item.icon
                const disabled = !state.enabled || state.pending
                const stateText = state.pending ? '正在执行' : state.reason
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={styles.commandItem}
                    tabIndex={isExpanded ? 0 : -1}
                    disabled={disabled}
                    aria-busy={state.pending}
                    aria-label={stateText ? `${item.label}（${stateText}）` : item.label}
                    title={stateText ? `${item.label} · ${stateText}` : item.label}
                    onClick={() => executeAndClose(item)}
                  >
                    <Icon
                      className={state.pending ? styles.pendingIcon : undefined}
                      aria-hidden="true"
                    />
                    <span className={styles.commandCopy}>
                      <strong>{item.label}</strong>
                      <span>{stateText ?? item.description}</span>
                    </span>
                    {item.shortcut && <kbd>{item.shortcut}</kbd>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
