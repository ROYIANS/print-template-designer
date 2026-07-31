import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { authClient } from './auth-client'
import type { LandingNotice } from './navigation'
import styles from './LandingPage.module.css'

export interface AccountUser {
  id: string
  name: string
  email: string
  image: string | null
  authMode: 'github' | 'dev-bypass'
}

export type AccessState =
  | { kind: 'checking' }
  | { kind: 'signedOut' }
  | { kind: 'allowed'; user: AccountUser }
  | { kind: 'denied' }
  | { kind: 'error' }

interface LandingPageProps {
  access: AccessState
  notice?: LandingNotice
  onEnterApp: () => void
  onRetry: () => void
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2.24c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.74-1.55-2.57-.3-5.27-1.29-5.27-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.3 3.17 1.18a10.9 10.9 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.71 5.38-5.29 5.67.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"
      />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.arrowIcon}>
      <path
        d="M9 6l6 6l-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.checkIcon}>
      <path
        d="M5 12l5 5l10 -10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PtdMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" aria-hidden="true">
      <path fill="currentColor" opacity=".16" d="M1 7h17v20H1z" />
      <path fill="currentColor" opacity=".38" d="M4 4h18v21H4z" />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M7 1h13l5 5v17H7V1Zm4 4v15h3v-5.5h4c3.5 0 5.5-1.8 5.5-4.75S21.5 5 18 5h-7Zm3 3h4c1.5 0 2.4.65 2.4 1.75S19.5 11.5 18 11.5h-4V8Z"
      />
    </svg>
  )
}

function PrecisionMarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.7 1h2.6v6.1h-2.6zM10.7 16.9h2.6V23h-2.6zM1 10.7h6.1v2.6H1zM16.9 10.7H23v2.6h-6.1zM3.45 5.29l1.84-1.84 4.31 4.31L7.76 9.6zM14.4 16.24l1.84-1.84 4.31 4.31-1.84 1.84zM3.45 18.71l4.31-4.31 1.84 1.84-4.31 4.31zM14.4 7.76l4.31-4.31 1.84 1.84-4.31 4.31z"
      />
      <circle cx="12" cy="12" r="3.6" fill="currentColor" />
    </svg>
  )
}

function ComponentBloomIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 1.5 16 8l6.5 4-6.5 4-4 6.5L8 16l-6.5-4L8 8z" />
      <circle cx="12" cy="12" r="3.1" fill="var(--canvas)" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" />
    </svg>
  )
}

function PageStackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" opacity=".35" d="m2.2 6.2 12.7-3.4 4 15-12.7 3.4z" />
      <path fill="currentColor" opacity=".65" d="M5.2 3.1h13.5v16.3H5.2z" />
      <path fill="currentColor" d="m8.4 4.8 13.1 3.5-4.1 15.2-13-3.5z" />
      <path
        fill="var(--canvas)"
        d="m10.1 9.1 8.2 2.2-.5 1.7-8.2-2.2zm-1 3.5 8.2 2.2-.5 1.7-8.2-2.2zm-1 3.6 5.4 1.4-.5 1.7-5.4-1.5z"
      />
    </svg>
  )
}

function HistorySealIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="m12 1.4 2.1 2 2.8-.5.9 2.7 2.7.9-.5 2.8 2 2.1-2 2.1.5 2.8-2.7.9-.9 2.7-2.8-.5-2.1 2-2.1-2-2.8.5-.9-2.7-2.7-.9.5-2.8-2-2.1 2-2.1-.5-2.8 2.7-.9.9-2.7 2.8.5z"
      />
      <path fill="var(--canvas)" d="M11 6.7h2v5.1l3.2 2.1-1.1 1.7-4.1-2.7z" />
    </svg>
  )
}

const ASCII_NOISE_GLYPHS = ".,':;~-`"
const ASCII_DENSE_GLYPHS = '&_=!#$@%01'
const ASCII_BACKGROUND_ROWS = 34
const ASCII_SUBJECT_COLUMNS = 84
const ASCII_SUBJECT_ROWS = 40
const ASCII_MEASURE_TEXT = '00000000000000000000'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function asciiNoise(column: number, row: number, frame: number, salt = 0): number {
  const value = Math.sin(column * 12.9898 + row * 78.233 + frame * 4.173 + salt * 19.19)
  return value * 43758.5453 - Math.floor(value * 43758.5453)
}

function buildAsciiBackground(frame: number, revealedRows: number, columns: number): string {
  const lines: string[] = []

  for (let row = 0; row < ASCII_BACKGROUND_ROWS; row += 1) {
    const depth = row / (ASCII_BACKGROUND_ROWS - 1)
    const isRevealed = row >= ASCII_BACKGROUND_ROWS - revealedRows
    const density = isRevealed ? 0.34 * Math.pow(depth, 2.5) : 0
    let line = ''

    for (let column = 0; column < columns; column += 1) {
      const noise = asciiNoise(column, row, frame)
      const glyphIndex = Math.floor(asciiNoise(column, row, frame, 2) * ASCII_NOISE_GLYPHS.length)
      line += noise < density ? ASCII_NOISE_GLYPHS[glyphIndex] : ' '
    }
    lines.push(line)
  }

  return lines.join('\n')
}

function rectangleDensity(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  halfWidth: number,
  halfHeight: number,
): number {
  const localX = x - centerX
  const localY = y - centerY
  const edgeDistance = Math.min(halfWidth - Math.abs(localX), halfHeight - Math.abs(localY))
  if (edgeDistance < 0) return 0
  return edgeDistance < 0.028 ? 0.92 : 0.18
}

function isNegativeP(localX: number, localY: number): boolean {
  const stem = localX > -0.29 && localX < -0.14 && localY > -0.4 && localY < 0.4
  const ellipseX = (localX + 0.015) / 0.3
  const ellipseY = (localY + 0.18) / 0.28
  const innerX = (localX + 0.015) / 0.14
  const innerY = (localY + 0.18) / 0.13
  const outerBowl = ellipseX * ellipseX + ellipseY * ellipseY < 1 && localX > -0.22
  const innerBowl = innerX * innerX + innerY * innerY < 1
  return stem || (outerBowl && !innerBowl)
}

function markDensity(x: number, y: number): number {
  const frontCenterX = 0.08
  const frontCenterY = -0.08
  const halfWidth = 0.5
  const halfHeight = 0.58
  const localX = x - frontCenterX
  const localY = y - frontCenterY
  const edgeDistance = Math.min(halfWidth - Math.abs(localX), halfHeight - Math.abs(localY))

  if (edgeDistance >= 0) {
    const foldedCorner = localX > 0.28 && localY < -0.36 && localX - localY > 0.82
    if (foldedCorner) return 0
    if (isNegativeP(localX, localY)) return 0
    return edgeDistance < 0.03 ? 0.99 : 0.84
  }

  return Math.max(
    rectangleDensity(x, y, -0.2, 0.13, halfWidth, halfHeight),
    rectangleDensity(x, y, -0.06, 0.03, halfWidth, halfHeight),
  )
}

function buildAsciiSubject(frame: number): string {
  const lines: string[] = []

  for (let row = 0; row < ASCII_SUBJECT_ROWS; row += 1) {
    const y = (row / (ASCII_SUBJECT_ROWS - 1)) * 2 - 1
    let line = ''

    for (let column = 0; column < ASCII_SUBJECT_COLUMNS; column += 1) {
      const x = (column / (ASCII_SUBJECT_COLUMNS - 1)) * 2 - 1
      const density = markDensity(x, y)
      const noise = asciiNoise(column, row, frame, 5)
      const glyphIndex = clamp(
        Math.floor(asciiNoise(column, row, frame, 9) * ASCII_DENSE_GLYPHS.length),
        0,
        ASCII_DENSE_GLYPHS.length - 1,
      )
      line += noise < density ? ASCII_DENSE_GLYPHS[glyphIndex] : ' '
    }
    lines.push(line)
  }

  return lines.join('\n')
}

function AsciiPrintField() {
  const fieldRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const backgroundColumnsRef = useRef(160)
  const [frame, setFrame] = useState(0)
  const [revealedRows, setRevealedRows] = useState(4)
  const [backgroundColumns, setBackgroundColumns] = useState(160)
  const [running, setRunning] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const field = fieldRef.current
    const measure = measureRef.current
    if (!field || !measure) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = true
    let interval = 0

    const stop = () => {
      window.clearInterval(interval)
      interval = 0
    }

    const sync = () => {
      stop()
      const reduced = motion.matches
      const active = !reduced && !document.hidden && visible
      setReducedMotion(reduced)
      setRunning(active)
      if (reduced) {
        setFrame(0)
        setRevealedRows(ASCII_BACKGROUND_ROWS)
        field.style.setProperty('--ascii-shift-x', '0px')
        field.style.setProperty('--ascii-shift-y', '0px')
        return
      }
      if (!active) return
      interval = window.setInterval(() => {
        setFrame((current) => current + 1)
        setRevealedRows((current) => Math.min(ASCII_BACKGROUND_ROWS, current + 4))
      }, 100)
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      sync()
    })
    const onVisibilityChange = () => sync()
    const onMotionChange = () => sync()
    const onPointerMove = (event: PointerEvent) => {
      if (motion.matches) return
      const hero = field.parentElement
      if (!hero) return
      const rect = hero.getBoundingClientRect()
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      if (!inside) {
        field.style.setProperty('--ascii-shift-x', '0px')
        field.style.setProperty('--ascii-shift-y', '0px')
        return
      }
      const horizontal = (event.clientX - rect.left) / rect.width - 0.5
      const vertical = (event.clientY - rect.top) / rect.height - 0.5
      field.style.setProperty('--ascii-shift-x', `${(horizontal * 14).toFixed(2)}px`)
      field.style.setProperty('--ascii-shift-y', `${(vertical * 9).toFixed(2)}px`)
    }
    const onPointerLeave = () => {
      field.style.setProperty('--ascii-shift-x', '0px')
      field.style.setProperty('--ascii-shift-y', '0px')
    }

    const measureColumns = () => {
      const characterWidth = measure.getBoundingClientRect().width / ASCII_MEASURE_TEXT.length
      if (characterWidth <= 0) return
      const nextColumns = Math.ceil(field.getBoundingClientRect().width / characterWidth) + 2
      if (nextColumns === backgroundColumnsRef.current) return
      backgroundColumnsRef.current = nextColumns
      setBackgroundColumns(nextColumns)
    }
    const resizeObserver = new ResizeObserver(measureColumns)

    observer.observe(field)
    resizeObserver.observe(field)
    resizeObserver.observe(measure)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('blur', onPointerLeave)
    motion.addEventListener('change', onMotionChange)
    measureColumns()
    sync()

    return () => {
      stop()
      observer.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('blur', onPointerLeave)
      motion.removeEventListener('change', onMotionChange)
    }
  }, [])

  return (
    <div
      ref={fieldRef}
      className={styles.asciiField}
      aria-hidden="true"
      data-reduced-motion={reducedMotion}
      data-running={running}
    >
      <span ref={measureRef} className={styles.asciiMeasure}>
        {ASCII_MEASURE_TEXT}
      </span>
      <pre className={styles.asciiNoise}>
        {buildAsciiBackground(frame, revealedRows, backgroundColumns)}
      </pre>
      <div className={styles.asciiSubjectStage}>
        <pre className={styles.asciiSubject}>{buildAsciiSubject(frame)}</pre>
      </div>
    </div>
  )
}

function AccessAction({
  access,
  onEnterApp,
  onRetry,
  announceStatus = true,
}: Omit<LandingPageProps, 'notice'> & { announceStatus?: boolean }) {
  const [signingIn, setSigningIn] = useState(false)
  const [message, setMessage] = useState<string>()

  const signIn = async () => {
    setSigningIn(true)
    setMessage(undefined)
    const result = await authClient.signIn.social({
      provider: 'github',
      callbackURL: `${window.location.origin}/app`,
    })
    if (result.error) {
      setMessage(result.error.message ?? 'GitHub 登录没有完成，请重试。')
      setSigningIn(false)
    }
  }

  const signOut = async () => {
    setMessage(undefined)
    await authClient.signOut()
    onRetry()
  }

  if (access.kind === 'allowed') {
    const local = access.user.authMode === 'dev-bypass'
    return (
      <div className={styles.accessAction} data-state="allowed">
        <p className={styles.accessState}>
          <span className={styles.stateDot} />
          {local ? '本地开发身份已就绪' : `${access.user.name} 已获准`}
        </p>
        <button type="button" className={styles.primaryAction} onClick={onEnterApp}>
          {local ? '进入本地工作台' : '进入工作台'}
          <ArrowIcon />
        </button>
        <button
          type="button"
          className={styles.textAction}
          onClick={local ? onRetry : () => void signOut()}
        >
          {local ? '重新检查身份' : '退出当前账户'}
        </button>
      </div>
    )
  }

  if (access.kind === 'denied') {
    return (
      <div className={styles.accessAction} data-state="denied">
        <p className={styles.accessTitle}>此账户尚未获准</p>
        <p className={styles.accessCopy}>当前 GitHub 邮箱不在实例访问名单中。</p>
        <button type="button" className={styles.secondaryAction} onClick={() => void signOut()}>
          退出并更换 GitHub 账户
        </button>
      </div>
    )
  }

  if (access.kind === 'error') {
    return (
      <div className={styles.accessAction} data-state="error">
        <p className={styles.accessTitle}>工作台服务暂时不可用</p>
        <p className={styles.accessCopy}>产品介绍仍可浏览。请检查 Server 后重试连接。</p>
        <button type="button" className={styles.secondaryAction} onClick={onRetry}>
          重新连接
        </button>
      </div>
    )
  }

  if (access.kind === 'checking') {
    return (
      <div
        className={styles.accessAction}
        data-state="checking"
        role={announceStatus ? 'status' : undefined}
      >
        <p className={styles.accessState}>
          <span className={styles.checkingMark} aria-hidden="true" />
          正在校验工作台访问状态
        </p>
        <button type="button" className={styles.primaryAction} disabled>
          正在连接…
        </button>
      </div>
    )
  }

  return (
    <div className={styles.accessAction} data-state="signed-out">
      <button
        type="button"
        className={styles.primaryAction}
        disabled={signingIn}
        onClick={() => void signIn()}
      >
        <GitHubIcon />
        {signingIn ? '正在前往 GitHub…' : '使用 GitHub 登录'}
      </button>
      <p className={styles.securityNote}>HttpOnly Cookie · 服务端准入 · 不保存浏览器 Token</p>
      {message && (
        <p className={styles.inlineError} role="alert">
          {message}
        </p>
      )}
    </div>
  )
}

const noticeCopy: Partial<Record<LandingNotice, string>> = {
  'auth-required': '请先登录已获准的 GitHub 账户，再进入工作台。',
  'access-denied': '当前账户没有工作台访问权限，你仍可浏览完整产品介绍。',
  'session-expired': '会话已经失效，请重新登录后继续。',
  'sign-in-failed': 'GitHub 登录未完成，请检查账户或稍后重试。',
  unavailable: '工作台服务暂时不可用，产品介绍不受影响。',
}

interface CapabilityItem {
  icon: ReactNode
  accent: 'teal' | 'rose' | 'amber' | 'blue'
  title: string
  description: string
}

const capabilityItems: CapabilityItem[] = [
  {
    icon: <PrecisionMarkIcon />,
    accent: 'teal',
    title: '像素级的精确排版',
    description:
      '真实纸张尺寸、标尺与对齐线，毫米和像素随时切换。移动、缩放、旋转都能精确到个位数。',
  },
  {
    icon: <ComponentBloomIcon />,
    accent: 'rose',
    title: '一页纸装下所有信息',
    description:
      '文本、图片、二维码、条形码、表格与基础图形自由组合。表格支持合并单元格、增删行列，像 Excel 一样直接编辑。',
  },
  {
    icon: <PageStackIcon />,
    accent: 'amber',
    title: '多页面文档，整份管理',
    description: '新增、复制、删除、排序页面，标签、说明书、多联单据都能在一份模板里管理完整。',
  },
  {
    icon: <HistorySealIcon />,
    accent: 'blue',
    title: '版本留痕，正在接入工作台',
    description:
      '服务端已经具备不可变版本与冲突保护；工作台里的保存、查看和恢复流程仍在接入，不把半成品当成已经上线。',
  },
]

interface ProductCase {
  key: string
  title: string
  eyebrow: string
  description: string
  src: string
  alt: string
  format: string
}

const productCases: ProductCase[] = [
  {
    key: 'cold-chain',
    title: '冷链出库标签',
    eyebrow: '物流追溯',
    description: '二维码、条码、温区与复核信息在一张标签里保持清楚。',
    src: '/assets/product/designer-proof-sheet.png',
    alt: 'Foliq 工作台正在编辑冷链出库标签，画布两侧显示组件目录和属性面板',
    format: 'A5 · 2 pages',
  },
  {
    key: 'delivery-note',
    title: '采购送货单',
    eyebrow: '仓储单据',
    description: '供应商、交付批次、明细与签收区域按纸张节奏完整编排。',
    src: '/assets/product/designer-delivery-note.png',
    alt: 'Foliq 工作台正在编辑一张采购送货单，纸张中包含交付信息与商品明细',
    format: 'A4 · fixed layout',
  },
  {
    key: 'price-label',
    title: '门店商品价签',
    eyebrow: '零售标签',
    description: '价格、规格、会员提示与商品条码压缩进小尺寸纸张。',
    src: '/assets/product/designer-price-label.png',
    alt: 'Foliq 工作台正在编辑一张门店商品价签，画布中有价格、规格和条码',
    format: '100 × 60 mm',
  },
  {
    key: 'inspection-report',
    title: '来料检验报告',
    eyebrow: '质量管理',
    description: '检验结论、批次信息和项目结果在同一份报告里建立层级。',
    src: '/assets/product/designer-inspection-report.png',
    alt: 'Foliq 工作台正在编辑一张来料检验报告，纸张中包含检验项目和结论印章',
    format: 'A4 · report',
  },
]

function ProductShowcase() {
  const railRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    scrollLeft: number
    moved: boolean
  }>()
  const suppressClickRef = useRef(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragging, setDragging] = useState(false)

  const scrollToCase = (index: number) => {
    const rail = railRef.current
    const item = rail?.children.item(index)
    if (!(item instanceof HTMLElement) || !rail) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    rail.scrollTo({
      left: item.offsetLeft - (rail.clientWidth - item.clientWidth) / 2,
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }

  const updateActiveCase = () => {
    const rail = railRef.current
    if (!rail) return
    const center = rail.scrollLeft + rail.clientWidth / 2
    let nextIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY
    Array.from(rail.children).forEach((child, index) => {
      if (!(child instanceof HTMLElement)) return
      const childCenter = child.offsetLeft + child.clientWidth / 2
      const distance = Math.abs(childCenter - center)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nextIndex = index
      }
    })
    setActiveIndex(nextIndex)
  }

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const distance = event.clientX - drag.startX
    if (Math.abs(distance) > 4) drag.moved = true
    event.currentTarget.scrollLeft = drag.scrollLeft - distance
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    suppressClickRef.current = drag.moved
    dragRef.current = undefined
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragging(false)
  }

  return (
    <div className={styles.productShowcase}>
      <div className={styles.productRailHeader}>
        <p aria-live="polite">
          <span>{String(activeIndex + 1).padStart(2, '0')}</span>
          {productCases[activeIndex]?.title}
        </p>
        <div className={styles.railActions} aria-label="切换模板案例">
          <button
            type="button"
            aria-label="上一个案例"
            disabled={activeIndex === 0}
            onClick={() => scrollToCase(activeIndex - 1)}
          >
            <ArrowIcon />
          </button>
          <button
            type="button"
            aria-label="下一个案例"
            disabled={activeIndex === productCases.length - 1}
            onClick={() => scrollToCase(activeIndex + 1)}
          >
            <ArrowIcon />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className={`${styles.productRail} ${dragging ? styles.productRailDragging : ''}`}
        role="region"
        aria-label="真实 Foliq 文档案例，可横向滚动"
        tabIndex={0}
        onScroll={updateActiveCase}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return
          event.preventDefault()
          suppressClickRef.current = false
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            scrollToCase(Math.max(0, activeIndex - 1))
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            scrollToCase(Math.min(productCases.length - 1, activeIndex + 1))
          }
        }}
      >
        {productCases.map((item) => (
          <figure key={item.key} className={styles.productWindow}>
            <div className={styles.windowBar} aria-hidden="true">
              <span />
              <span />
              <span />
              <p>foliq / {item.title}</p>
            </div>
            <a className={styles.productViewport} href={item.src} target="_blank" rel="noreferrer">
              <img src={item.src} alt={item.alt} width="1600" height="1000" draggable={false} />
            </a>
            <figcaption>
              <span>
                <strong>{item.eyebrow}</strong>
                {item.description}
              </span>
              <span>{item.format}</span>
              <span>real schema</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className={styles.productRailHint}>拖动或横滑查看案例 · 点击截图打开高清原图</p>
    </div>
  )
}

interface FaqItem {
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    question: '现在就能拿来做正式的模板吗？',
    answer:
      '排版、组件和多页面管理都是可以直接使用的真实能力，很多业务模板已经能在这里完整制作出来。但打印预览、PDF/Word 导出和数据源绑定还没做完，如果你的场景离不开这些，建议先等一等，或者找我们确认。',
  },
  {
    question: '改错了模板，还能找回来吗？',
    answer:
      '可以。每次保存都会保留不可变的服务器版本；你可以在编辑器里查看真实历史快照，并把任一旧版本恢复成新的最新版本。恢复不会改写原有历史，遇到并发版本冲突时也不会自动覆盖服务器内容。',
  },
  {
    question: '可以只部署在我们自己的服务器上吗？',
    answer:
      '可以，而且这正是 Foliq 的设计初衷。整个系统都能装进你自己的机房或云主机，模板数据不需要经过任何第三方，谁能用、谁能看，都由你自己掌控。',
  },
  {
    question: '除了我自己，还能让同事一起用吗？',
    answer:
      '可以。目前通过 GitHub 账户登录，管理员可以维护一份允许登录的名单，把访问权限收在团队内部，不对外开放注册。',
  },
]

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number>()

  return (
    <div className={styles.faqList}>
      {faqItems.map((item, index) => {
        const expanded = openIndex === index
        return (
          <div key={item.question} className={styles.faqItem}>
            <button
              type="button"
              className={styles.faqTrigger}
              aria-expanded={expanded}
              onClick={() => setOpenIndex(expanded ? undefined : index)}
            >
              <span>{item.question}</span>
              <span className={styles.faqIcon} aria-hidden="true" />
            </button>
            {expanded && <p className={styles.faqAnswer}>{item.answer}</p>}
          </div>
        )
      })}
    </div>
  )
}

export function LandingPage({ access, notice, onEnterApp, onRetry }: LandingPageProps) {
  const headerActionLabel =
    access.kind === 'allowed'
      ? access.user.authMode === 'dev-bypass'
        ? '进入本地工作台'
        : '进入工作台'
      : access.kind === 'checking'
        ? '正在连接…'
        : '开始使用'

  return (
    <div className={styles.landing}>
      <a className={styles.skipLink} href="#main-content">
        跳到主要内容
      </a>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.headerBrand} href="/" aria-label="Foliq 首页">
            <PtdMark className={styles.brandSymbol} />
            <span className={styles.brandName}>Foliq</span>
            <span className={styles.headerBrandLabel}>结构化文档设计器</span>
          </a>

          <nav className={styles.headerNav} aria-label="首页导航">
            <a href="#product">产品</a>
            <a href="#capabilities">功能</a>
            <a href="#deployment">部署</a>
            <a href="#pricing">价格</a>
            <a href="#faq">常见问题</a>
          </nav>

          <button
            type="button"
            className={styles.headerAction}
            disabled={access.kind === 'checking'}
            onClick={onEnterApp}
          >
            {headerActionLabel}
            {access.kind !== 'checking' && <ArrowIcon />}
          </button>
        </div>
      </header>

      <section className={styles.hero} id="start" aria-labelledby="hero-title">
        <AsciiPrintField />
        <div className={styles.main}>
          <h1 id="hero-title" className={styles.heroTitle}>
            不是设计一张图，
            <br />
            而是定义一种文档。
          </h1>
          <p className={styles.heroLede}>
            Foliq 从标签、单据和报告开始，让页面结构成为可以持续演进的文档定义。
            <br className={styles.softBreak} />
            目录、期刊与手帐是长期方向；保存与版本流程仍在接入。
          </p>

          {notice && <p className={styles.routeNotice}>{noticeCopy[notice]}</p>}

          <div className={styles.heroMeta}>
            <div className={styles.metaItem}>
              <span className={styles.stateDot} />
              <span>真实可用的排版画布，从标签、单据和报告开始</span>
            </div>
            <div className={styles.metaItem}>
              <CheckIcon />
              <span>部署在你自己的服务器上，数据不假手他人</span>
            </div>
          </div>

          <div className={styles.heroActions}>
            <AccessAction access={access} onEnterApp={onEnterApp} onRetry={onRetry} />
          </div>
        </div>
      </section>

      <main id="main-content">
        <section className={styles.product} id="product" aria-labelledby="product-title">
          <div className={styles.main}>
            <h2 id="product-title" className={styles.sectionTitle}>
              <span className={styles.sectionTitleFaint}>不是效果图，是能点的界面。</span>
              下面这些截图，就是你打开后看到的样子。
            </h2>

            <ProductShowcase />
          </div>
        </section>

        <section
          className={styles.capabilities}
          id="capabilities"
          aria-labelledby="capabilities-title"
        >
          <div className={styles.main}>
            <h2 id="capabilities-title" className={styles.sectionTitle}>
              <span className={styles.sectionTitleFaint}>把复杂业务，排成清楚的一张纸。</span>
              设计一张模板需要的，都在这里。
            </h2>
            <div className={styles.capabilityGrid}>
              {capabilityItems.map((item) => (
                <div key={item.title} className={styles.capabilityCard}>
                  <span className={styles.capabilityIcon} data-accent={item.accent}>
                    {item.icon}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.deployment} id="deployment" aria-labelledby="deployment-title">
          <div className={styles.main}>
            <h2 id="deployment-title" className={styles.sectionTitle}>
              <span className={styles.sectionTitleFaint}>你的模板，留在你自己的地盘。</span>
              部署在你的服务器上，而不是别人的云端。
            </h2>
            <p className={styles.deploymentLede}>
              Foliq 可以完整部署在你自己的服务器里，模板、版本数据和账户数据都留在你的基础设施上，
              不经过任何第三方云服务中转。谁能登录、谁能看到什么，也由你自己的名单说了算。
            </p>
          </div>
        </section>

        <section className={styles.pricing} id="pricing" aria-labelledby="pricing-title">
          <div className={styles.main}>
            <h2 id="pricing-title" className={styles.sectionTitle}>
              <span className={styles.sectionTitleFaint}>开源可用，按需求定制。</span>
              怎么用，价格都说得明白。
            </h2>
            <div className={styles.pricingGrid}>
              <div className={styles.pricingCard}>
                <h3>开源自部署</h3>
                <p className={styles.pricingPrice}>免费</p>
                <p className={styles.pricingDesc}>代码完全开源，装进你自己的服务器即可使用。</p>
                <ul className={styles.pricingList}>
                  <li>
                    <CheckIcon />
                    <span>MIT 协议，可自由使用与修改</span>
                  </li>
                  <li>
                    <CheckIcon />
                    <span>模板与版本数据留在你的基础设施</span>
                  </li>
                  <li>
                    <CheckIcon />
                    <span>社区渠道支持，无 SLA 承诺</span>
                  </li>
                </ul>
                <a
                  className={styles.pricingAction}
                  href="https://github.com/ROYIANS/print-template-designer"
                  target="_blank"
                  rel="noreferrer"
                >
                  查看源码
                  <ArrowIcon />
                </a>
              </div>
              <div className={styles.pricingCard} data-highlight="true">
                <h3>定制部署与支持</h3>
                <p className={styles.pricingPrice}>面议</p>
                <p className={styles.pricingDesc}>
                  需要专属功能、私有化交付或长期支持时，直接找我们谈。
                </p>
                <ul className={styles.pricingList}>
                  <li>
                    <CheckIcon />
                    <span>按业务场景定制组件与流程</span>
                  </li>
                  <li>
                    <CheckIcon />
                    <span>协助部署、迁移与团队培训</span>
                  </li>
                  <li>
                    <CheckIcon />
                    <span>约定响应时间的直接技术支持</span>
                  </li>
                </ul>
                <a className={styles.pricingAction} href="mailto:royians@vidorra.life">
                  发邮件聊聊
                  <ArrowIcon />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.boundary} aria-labelledby="boundary-title">
          <div className={styles.main}>
            <h2 id="boundary-title" className={styles.sectionTitle}>
              <span className={styles.sectionTitleFaint}>说到的都能做，做不到的不说。</span>
              我们更愿意先把话说清楚。
            </h2>
            <p className={styles.boundaryLede}>
              工作台保存与版本历史已经可用；打印预览、PDF/Word
              导出、数据源绑定与自动分页仍在开发中，暂未上线。
              目录、期刊和手帐是长期方向，不是当前功能。Foliq
              不会把还没做完的能力包装成现在就能用的样子——能不能用，我们说的和你看到的一致。
            </p>
          </div>
        </section>

        <section className={styles.faq} id="faq" aria-labelledby="faq-title">
          <div className={styles.main}>
            <h2 id="faq-title" className={styles.sectionTitle}>
              <span className={styles.sectionTitleFaint}>常见疑问。</span>
              上手前想知道的事。
            </h2>
            <FaqAccordion />
          </div>
        </section>
      </main>

      <footer className={styles.closingField} aria-labelledby="closing-title">
        <div className={styles.closingInner}>
          <div className={styles.closingLead}>
            <div className={styles.closingIntro}>
              <p className={styles.closingKicker}>
                <span className={styles.stateDot} />
                FOLIQ / LOGIC FOR EVERY PAGE
              </p>
              <h2 id="closing-title">
                <span>下一种文档，</span>
                从这一页开始定义。
              </h2>
              <p className={styles.closingLede}>
                从一张空白纸开始，把业务里说不清的部分，排成每个人都看得懂的结果。
              </p>
            </div>
            <div className={styles.closingAction}>
              <AccessAction
                access={access}
                onEnterApp={onEnterApp}
                onRetry={onRetry}
                announceStatus={false}
              />
            </div>
          </div>

          <div className={styles.closingBrand}>
            <a className={styles.brand} href="/" aria-label="返回 Foliq 首页">
              <PtdMark className={styles.brandSymbol} />
              <span className={styles.brandName}>Foliq</span>
            </a>
            <p className={styles.footerTagline}>
              面向打印与出版的专业结构化文档设计器，部署在你自己的服务器上。
            </p>
          </div>

          <nav className={styles.closingNav} aria-label="产品导航">
            <p>产品</p>
            <a href="#product">真实界面</a>
            <a href="#capabilities">设计能力</a>
            <a href="#deployment">自有部署</a>
            <a href="#pricing">价格与支持</a>
          </nav>

          <div className={styles.closingContact}>
            <p>联系与源码</p>
            <a href="mailto:royians@vidorra.life">royians@vidorra.life</a>
            <a
              href="https://github.com/ROYIANS/print-template-designer"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </div>

          <div className={styles.closingMeta}>
            <p>© 2026 FOLIQ · ROYIANS</p>
            <p>SELF-HOSTED · MIT LICENSE</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
