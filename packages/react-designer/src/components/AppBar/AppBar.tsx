import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import type { TemplateSchema } from '@ptd/core'
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
} from '@remixicon/react'
import { useEditorStore } from '../../state'
import styles from './AppBar.module.css'

interface AppBarProps {
  onSave?: (value: TemplateSchema) => void
  onLoad?: () => TemplateSchema | Promise<TemplateSchema>
}

const APP_MENUS = [
  {
    id: 'file',
    label: '文件',
    mnemonic: 'F',
    items: [
      {
        icon: RiFileLine,
        label: '新建模板',
        description: '创建一个空白打印模板',
        shortcut: 'Ctrl+N',
      },
      {
        icon: RiFolderOpenLine,
        label: '打开模板',
        description: '从本地载入模板文件',
        shortcut: 'Ctrl+O',
      },
      { icon: RiSave3Line, label: '保存模板', description: '保存当前模板内容', shortcut: 'Ctrl+S' },
      {
        icon: RiSave2Line,
        label: '另存为',
        description: '以新名称保存模板副本',
        shortcut: 'Ctrl+Shift+S',
      },
    ],
  },
  {
    id: 'edit',
    label: '编辑',
    mnemonic: 'E',
    items: [
      { icon: RiArrowGoBackLine, label: '撤销', description: '撤销上一步编辑', shortcut: 'Ctrl+Z' },
      {
        icon: RiArrowGoForwardLine,
        label: '重做',
        description: '恢复刚刚撤销的编辑',
        shortcut: 'Ctrl+Shift+Z',
      },
      { icon: RiScissorsCutLine, label: '剪切', description: '剪切当前选择', shortcut: 'Ctrl+X' },
      { icon: RiFileCopyLine, label: '复制', description: '复制当前选择', shortcut: 'Ctrl+C' },
      { icon: RiClipboardLine, label: '粘贴', description: '粘贴剪贴板内容', shortcut: 'Ctrl+V' },
    ],
  },
  {
    id: 'object',
    label: '对象',
    mnemonic: 'O',
    items: [
      { icon: RiGroupLine, label: '组合', description: '将多个组件组合编辑', shortcut: 'Ctrl+G' },
      {
        icon: RiLayoutLine,
        label: '拆分',
        description: '拆分当前组件组合',
        shortcut: 'Ctrl+Shift+G',
      },
      { icon: RiLock2Line, label: '锁定', description: '锁定当前选择', shortcut: 'Ctrl+L' },
      {
        icon: RiBringToFront,
        label: '上移一层',
        description: '调整对象堆叠顺序',
        shortcut: 'Ctrl+]',
      },
      {
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
      { icon: RiRulerLine, label: '显示标尺', description: '切换页面标尺显示', shortcut: 'Ctrl+R' },
      { icon: RiGuideLine, label: '显示参考线', description: '切换参考线显示', shortcut: 'Ctrl+;' },
      { icon: RiZoomInLine, label: '放大', description: '放大当前画布', shortcut: 'Ctrl++' },
      { icon: RiZoomOutLine, label: '缩小', description: '缩小当前画布', shortcut: 'Ctrl+-' },
      {
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
      { icon: RiLayoutLine, label: '组件面板', description: '浏览可用模板组件', shortcut: 'F6' },
      { icon: RiPagesLine, label: '页面面板', description: '管理模板页面', shortcut: 'F7' },
      { icon: RiStackLine, label: '图层面板', description: '查看对象与层级', shortcut: 'F8' },
      { icon: RiSideBarLine, label: '属性面板', description: '编辑页面与组件属性', shortcut: 'F9' },
    ],
  },
  {
    id: 'help',
    label: '帮助',
    mnemonic: 'H',
    items: [
      {
        icon: RiKeyboardBoxLine,
        label: '快捷键',
        description: '查看完整快捷键表',
        shortcut: 'Ctrl+/',
      },
      { icon: RiBookOpenLine, label: '使用文档', description: '打开 PTD 使用指南', shortcut: 'F1' },
      { icon: RiInformationLine, label: '关于 PTD', description: '版本、许可与项目信息' },
    ],
  },
] as const

type AppMenuId = (typeof APP_MENUS)[number]['id']

export function AppBar({ onSave, onLoad }: AppBarProps) {
  useSignals()
  const store = useEditorStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<AppMenuId>('file')
  const appBarRef = useRef<HTMLElement>(null)
  const menuButtonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const activeMenu = APP_MENUS.find((menu) => menu.id === activeMenuId) ?? APP_MENUS[0]

  const openMenu = (menuId?: AppMenuId) => {
    if (menuId) setActiveMenuId(menuId)
    setIsExpanded(true)
  }

  const closeMenu = () => {
    setIsExpanded(false)
  }

  const toggleMenu = (menuId: AppMenuId) => {
    if (isExpanded && activeMenuId === menuId) {
      closeMenu()
      return
    }
    openMenu(menuId)
  }

  useEffect(() => {
    if (!isExpanded) return

    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !appBarRef.current?.contains(event.target)) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('pointerdown', handleOutsidePointerDown)
    return () => document.removeEventListener('pointerdown', handleOutsidePointerDown)
  }, [isExpanded])

  const load = async () => {
    if (!onLoad || isLoading) return
    setIsLoading(true)
    try {
      store.syncExternal(await onLoad())
    } finally {
      setIsLoading(false)
    }
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
        <div className={styles.brand} aria-label="Print Template Designer">
          <span className={styles.legacyLogo} aria-hidden="true" />
          <span className={styles.wordmark}>PTD</span>
          <span className={styles.productName}>打印模板设计器</span>
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
          {onLoad && (
            <button
              type="button"
              className={styles.quietAction}
              disabled={isLoading}
              onClick={load}
            >
              <RiFolderOpenLine aria-hidden="true" />
              <span>{isLoading ? '正在载入' : '载入模板'}</span>
            </button>
          )}
          {onSave && (
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => onSave(store.template.value)}
            >
              <RiSave3Line aria-hidden="true" />
              <span>保存模板</span>
            </button>
          )}
          <button
            type="button"
            className={styles.userPlaceholder}
            aria-disabled="true"
            aria-label="用户账户（待接入）"
            title="用户账户 · 即将支持"
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
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={styles.commandItem}
                    tabIndex={isExpanded ? 0 : -1}
                    aria-label={`${item.label}（功能待接入，关闭菜单）`}
                    title={`${item.label} · 功能待接入 · 点击关闭菜单`}
                    onClick={closeMenu}
                  >
                    <Icon aria-hidden="true" />
                    <span className={styles.commandCopy}>
                      <strong>{item.label}</strong>
                      <span>{item.description}</span>
                    </span>
                    {'shortcut' in item && item.shortcut && <kbd>{item.shortcut}</kbd>}
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
