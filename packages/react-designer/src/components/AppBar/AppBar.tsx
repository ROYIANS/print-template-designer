import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import {
  RiArrowDownSLine,
  RiBookOpenLine,
  RiCloseLine,
  RiDatabase2Line,
  RiDeleteBinLine,
  RiFileLine,
  RiFileSearchLine,
  RiFolderOpenLine,
  RiFullscreenLine,
  RiGuideLine,
  RiInformationLine,
  RiKeyboardBoxLine,
  RiLayoutLine,
  RiLoader4Line,
  RiLockUnlockLine,
  RiMenuLine,
  RiPagesLine,
  RiRulerLine,
  RiSave2Line,
  RiSave3Line,
  RiSettings3Line,
  type RemixiconComponentType,
} from '@remixicon/react'
import type { DesignerHostCommandController, DesignerHostCommandId } from '../../host'
import type { ResourcePanelId } from '../../hooks/useWorkspaceLayout'
import type { EditorStore } from '../../state'
import { useEditorStore } from '../../state'
import styles from './AppBar.module.css'

type EditorCommandId =
  | 'toggleRuler'
  | 'toggleGuides'
  | 'toggleGuidesLock'
  | 'clearGuides'

type WorkspaceCommandId = 'pageSettings' | Extract<ResourcePanelId, 'assets' | 'pages' | 'data'>

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
  id: 'file' | 'template' | 'view' | 'help'
  label: string
  mnemonic: string
  items: readonly AppMenuItem[]
}

interface AppBarProps {
  hostCommands?: DesignerHostCommandController
  workspace?: {
    openResource: (panel: ResourcePanelId) => void
    openInspector: () => void
  }
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
        description: '返回文件工作台并选择模板',
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
      {
        kind: 'host',
        command: 'versionHistory',
        icon: RiPagesLine,
        label: '版本历史',
        description: '查看并恢复服务器历史版本',
      },
    ],
  },
  {
    id: 'template',
    label: '模板',
    mnemonic: 'T',
    items: [
      {
        kind: 'workspace',
        command: 'pageSettings',
        icon: RiSettings3Line,
        label: '页面设置',
        description: '配置纸张、方向、边距和页面外观',
      },
      {
        kind: 'workspace',
        command: 'pages',
        icon: RiPagesLine,
        label: '页面管理',
        description: '新增、复制、排序和删除模板页面',
      },
      {
        kind: 'workspace',
        command: 'assets',
        icon: RiLayoutLine,
        label: '素材资源',
        description: '浏览可插入模板的组件与素材',
      },
      {
        kind: 'workspace',
        command: 'data',
        icon: RiDatabase2Line,
        label: '数据源',
        description: '管理字段、示例数据与内容绑定',
      },
      {
        kind: 'planned',
        reason: '即将提供',
        icon: RiFileSearchLine,
        label: '模板检查',
        description: '检查越界、缺失数据与打印风险',
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
        command: 'toggleGuidesLock',
        icon: RiLockUnlockLine,
        label: '锁定 / 解锁参考线',
        description: '保护参考线位置，避免误操作',
      },
      {
        kind: 'editor',
        command: 'clearGuides',
        icon: RiDeleteBinLine,
        label: '清除全部参考线',
        description: '移除当前页面上的全部参考线',
      },
      {
        kind: 'planned',
        reason: '即将提供',
        icon: RiFullscreenLine,
        label: '适合页面',
        description: '让页面完整适配当前工作区',
        shortcut: 'Ctrl+0',
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
        description: '查看设计器快捷键列表',
        shortcut: 'Ctrl+/',
      },
      {
        kind: 'host',
        command: 'documentation',
        icon: RiBookOpenLine,
        label: '产品介绍',
        description: '了解 Foliq 的设计与工作方式',
      },
      {
        kind: 'host',
        command: 'about',
        icon: RiInformationLine,
        label: '关于 Foliq',
        description: '查看产品版本与项目说明',
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

const UNAVAILABLE: CommandState = { enabled: false, pending: false, reason: '暂不可用' }

function getEditorCommandState(store: EditorStore, command: EditorCommandId): CommandState {
  let enabled = true

  if (command === 'clearGuides') enabled = store.guides.value.length > 0 && !store.guidesLocked.value

  return enabled
    ? { enabled: true, pending: false }
    : { enabled: false, pending: false, reason: '当前状态不可用' }
}

function runEditorCommand(store: EditorStore, command: EditorCommandId): void {
  if (command === 'toggleRuler') store.toggleRuler()
  if (command === 'toggleGuides') store.toggleGuidesVisible()
  if (command === 'toggleGuidesLock') store.toggleGuidesLocked()
  if (command === 'clearGuides') store.clearGuides()
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
        : { enabled: false, pending: false, reason: '当前工作区不可用' }
    }
    return { enabled: false, pending: false, reason: item.reason }
  }

  const executeCommand = async (item: AppMenuItem): Promise<boolean> => {
    const state = getCommandState(item)
    if (!state.enabled || state.pending) return false
    if (item.kind === 'host') return (await hostCommands?.execute(item.command)) ?? false
    if (item.kind === 'editor') runEditorCommand(store, item.command)
    if (item.kind === 'workspace' && workspace) {
      if (item.command === 'pageSettings') {
        store.clearSelection()
        workspace.openInspector()
      } else {
        workspace.openResource(item.command)
      }
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
                data-ptd-control-family="document-action"
                data-variant="secondary"
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
                <span>{openState.pending ? '正在返回' : '文件工作台'}</span>
              </button>
              <button
                type="button"
                className={styles.primaryAction}
                data-ptd-control-family="document-action"
                data-variant="primary"
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
