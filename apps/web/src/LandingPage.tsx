import { useState, type ReactNode } from 'react'
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

function RulerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="8"
        width="18"
        height="8"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 8v3M11 8v3M15 8v3M19 8v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.5 20.5 8 12 12.5 3.5 8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 12 12 16.5 20.5 12M3.5 16 12 20.5 20.5 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PagesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="6"
        y="3.5"
        width="12"
        height="15"
        rx="1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.5 7v11.5M20.5 7v11.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12.5" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 8v5l3.5 2M6 4l2 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AccessAction({ access, onEnterApp, onRetry }: Omit<LandingPageProps, 'notice'>) {
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
      <div className={styles.accessAction} data-state="checking" role="status">
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
    icon: <RulerIcon />,
    accent: 'teal',
    title: '像素级的精确排版',
    description:
      '真实纸张尺寸、标尺与对齐线，毫米和像素随时切换。移动、缩放、旋转都能精确到个位数。',
  },
  {
    icon: <LayersIcon />,
    accent: 'rose',
    title: '一页纸装下所有信息',
    description:
      '文本、图片、二维码、条形码、表格与基础图形自由组合。表格支持合并单元格、增删行列，像 Excel 一样直接编辑。',
  },
  {
    icon: <PagesIcon />,
    accent: 'amber',
    title: '多页面文档，整份管理',
    description: '新增、复制、删除、排序页面，标签、说明书、多联单据都能在一份模板里管理完整。',
  },
  {
    icon: <HistoryIcon />,
    accent: 'blue',
    title: '改错了，找回来就好',
    description:
      '每一次保存都留下一份不可篡改的历史记录，随时对比、还原到任意版本。多人同时编辑也不会被悄悄覆盖。',
  },
]

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
      '能。每一次保存都会留下一份不可修改的历史记录，你可以随时查看、对比、恢复到任意一个版本，不用担心手滑或者改错方向。',
  },
  {
    question: '可以只部署在我们自己的服务器上吗？',
    answer:
      '可以，而且这正是 PTD 的设计初衷。整个系统都能装进你自己的机房或云主机，模板数据不需要经过任何第三方，谁能用、谁能看，都由你自己掌控。',
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
          <a className={styles.headerBrand} href="/" aria-label="PTD 首页">
            <span className={styles.brandSymbol} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className={styles.brandName}>PTD</span>
            <span className={styles.headerBrandLabel}>打印模板设计器</span>
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
        <div className={styles.heroPattern} aria-hidden="true" />
        <div className={styles.main}>
          <h1 id="hero-title" className={styles.heroTitle}>
            模板改了又改，
            <br />
            版本却越改越乱？
          </h1>
          <p className={styles.heroLede}>
            PTD 把每一次修改都存成历史，改错了，一键就能找回来。
            <br className={styles.softBreak} />
            从出库标签到复杂报表，你的每一张纸，都值得被认真设计。
          </p>

          {notice && <p className={styles.routeNotice}>{noticeCopy[notice]}</p>}

          <div className={styles.heroMeta}>
            <div className={styles.metaItem}>
              <span className={styles.stateDot} />
              <span>真实可用的排版画布，不是演示 Demo</span>
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
              下面这张截图，就是你打开后看到的样子。
            </h2>

            <figure className={styles.productWindow}>
              <div className={styles.windowBar} aria-hidden="true">
                <span />
                <span />
                <span />
                <p>ptd / 冷链出库标签 · 华东 07</p>
              </div>
              <div className={styles.productViewport}>
                <img
                  src="/assets/product/designer-proof-sheet.png"
                  alt="PTD 工作台正在编辑一张冷链出库标签，画布两侧显示组件目录和属性面板"
                  width="1600"
                  height="1000"
                />
              </div>
              <figcaption>
                <span>真实 PTD Designer</span>
                <span>A5 · 148 × 210 mm</span>
                <span>2 pages · real schema</span>
              </figcaption>
            </figure>
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
              PTD 可以完整部署在你自己的服务器里，模板、历史版本和账户数据都留在你的基础设施上，
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
              打印预览、PDF/Word 导出、数据源绑定与自动分页正在开发中，暂未上线。PTD
              不会把还没做完的 功能包装成现在就能用的样子——能不能用，我们说的和你看到的一致。
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

        <section className={styles.finalCta} aria-labelledby="final-title">
          <div className={styles.main}>
            <h2 id="final-title">下一张模板，从现在开始认真设计。</h2>
            <AccessAction access={access} onEnterApp={onEnterApp} onRetry={onRetry} />
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.main}>
          <div className={styles.footerTop}>
            <a className={styles.brand} href="/" aria-label="返回 PTD 首页">
              <span className={styles.brandSymbol} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className={styles.brandName}>PTD</span>
            </a>
            <p className={styles.footerTagline}>
              专业的 Web 打印模板设计器，部署在你自己的服务器上。
            </p>
          </div>

          <nav className={styles.footerNav} aria-label="产品导航">
            <a href="#product">产品截图</a>
            <a href="#capabilities">功能</a>
            <a href="#deployment">部署方式</a>
            <a href="#pricing">价格</a>
            <a href="#faq">常见问题</a>
          </nav>

          <div className={styles.footerContact}>
            <a href="mailto:royians@vidorra.life">royians@vidorra.life</a>
            <a
              href="https://github.com/ROYIANS/print-template-designer"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </div>

          <p className={styles.footerCopyright}>© 2026 PTD · ROYIANS · MIT License</p>
        </div>
      </footer>
    </div>
  )
}
