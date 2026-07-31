import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { TemplatePreview } from '@ptd/react-designer'
import {
  TemplateApiError,
  templateApi,
  type TemplateApi,
  type TemplateSummary,
} from './templateApi'
import { MAX_RECENT_TEMPLATE_PREVIEWS, useRecentTemplateDetails } from './useRecentTemplateDetails'
import styles from './WorkspaceHome.module.css'

type HomeState =
  | { kind: 'loading' }
  | { kind: 'ready'; templates: TemplateSummary[] }
  | { kind: 'error'; message: string }

const EMPTY_TEMPLATES: TemplateSummary[] = []

interface WorkspaceHomeProps {
  api?: TemplateApi
  accountControl?: ReactNode
  onNew(): void
  onOpen(templateId: number): void
}

function loadError(error: unknown): string {
  if (!(error instanceof TemplateApiError)) return '模板列表载入失败，请稍后重试。'
  if (error.kind === 'unauthorized') return '登录状态已失效，请重新登录。'
  if (error.kind === 'forbidden') return '当前账户没有读取模板的权限。'
  if (error.kind === 'network') return '无法连接模板服务，请检查网络后重试。'
  return error.message
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function formatUpdatedAt(value: string, includeTime = true) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(value))
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a className={styles.brand} data-compact={compact} href="/" aria-label="Foliq 首页">
      <img src="/assets/brand/ptd-mark.svg" alt="" />
      <span>
        <strong>Foliq</strong>
        {!compact ? <small>结构化文档设计器</small> : null}
      </span>
    </a>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m15.5 15.5 4.1 4.1" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function FilePlaceholder() {
  return (
    <span className={styles.filePlaceholder} aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <path d="M14 6.5h13l7 7V41.5H14z" />
        <path d="M27 6.5v8h7M19 23h10M19 29h10M19 35h7" />
      </svg>
    </span>
  )
}

function TemplateGallery({
  title,
  templates,
  totalCount,
  details,
  onOpen,
  onRetry,
}: {
  title: string
  templates: TemplateSummary[]
  totalCount: number
  details: ReturnType<typeof useRecentTemplateDetails>
  onOpen(templateId: number): void
  onRetry(): void
}) {
  return (
    <section className={styles.gallerySection} aria-labelledby="workspace-gallery-title">
      <header className={styles.sectionHeader}>
        <h2 id="workspace-gallery-title">{title}</h2>
        <span>
          {templates.length === totalCount
            ? `${totalCount} 份`
            : `${templates.length} / ${totalCount} 份`}
        </span>
      </header>
      <div className={styles.fileGrid}>
        {templates.map((summary) => {
          const detail = details.get(summary.id)
          return (
            <article className={styles.fileCard} key={summary.id}>
              <button
                type="button"
                aria-label={`打开模板 ${summary.title}`}
                onClick={() => onOpen(summary.id)}
              >
                <span className={styles.cardPreview}>
                  {detail?.kind === 'ready' ? (
                    <TemplatePreview
                      template={detail.template.content}
                      label={`${summary.title} 预览`}
                      className={styles.templatePreview}
                    />
                  ) : null}
                  {detail?.kind === 'loading' ? (
                    <span className={styles.previewLoading} role="status">
                      <span aria-hidden="true" />
                      正在载入预览
                    </span>
                  ) : null}
                  {detail?.kind === 'error' ? (
                    <span className={styles.previewError} role="alert">
                      <strong>预览暂不可用</strong>
                      <span>{detail.message}</span>
                    </span>
                  ) : null}
                  {!detail ? <FilePlaceholder /> : null}
                </span>
                <span className={styles.cardMeta}>
                  <strong>{summary.title}</strong>
                  <span>
                    版本 {summary.version}
                    <time dateTime={summary.updatedAt}>
                      {formatUpdatedAt(summary.updatedAt, false)}
                    </time>
                  </span>
                </span>
                <span className={styles.cardArrow} aria-hidden="true">
                  ↗
                </span>
              </button>
              {detail?.kind === 'error' ? (
                <button className={styles.retryPreview} type="button" onClick={onRetry}>
                  重试预览
                </button>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function WorkspaceHome({
  api = templateApi,
  accountControl,
  onNew,
  onOpen,
}: WorkspaceHomeProps) {
  const [reloadToken, setReloadToken] = useState(0)
  const [previewRetryToken, setPreviewRetryToken] = useState(0)
  const [query, setQuery] = useState('')
  const [activeSection, setActiveSection] = useState<'recent' | 'all'>('recent')
  const [state, setState] = useState<HomeState>({ kind: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    void api
      .list(controller.signal)
      .then((templates) => setState({ kind: 'ready', templates }))
      .catch((error: unknown) => {
        if (!isAbortError(error)) setState({ kind: 'error', message: loadError(error) })
      })
    return () => controller.abort()
  }, [api, reloadToken])

  const retry = () => {
    setState({ kind: 'loading' })
    setReloadToken((value) => value + 1)
  }

  const templates = state.kind === 'ready' ? state.templates : EMPTY_TEMPLATES
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
  const filteredTemplates = useMemo(
    () =>
      normalizedQuery
        ? templates.filter((template) =>
            template.title.toLocaleLowerCase('zh-CN').includes(normalizedQuery),
          )
        : templates,
    [normalizedQuery, templates],
  )
  const previewIds = useMemo(
    () =>
      filteredTemplates
        .slice(0, MAX_RECENT_TEMPLATE_PREVIEWS)
        .map((template) => template.id),
    [filteredTemplates],
  )
  const details = useRecentTemplateDetails(api, previewIds, previewRetryToken)
  const displayedTemplates =
    activeSection === 'recent'
      ? filteredTemplates.slice(0, MAX_RECENT_TEMPLATE_PREVIEWS)
      : filteredTemplates

  return (
    <main className={styles.home}>
      <a className={styles.skipLink} href="#workspace-files">
        跳到文件列表
      </a>

      <aside className={styles.sidebar} aria-label="工作台导航">
        <Brand />
        <nav aria-label="文件导航">
          <button
            type="button"
            aria-pressed={activeSection === 'recent'}
            onClick={() => setActiveSection('recent')}
          >
            <span aria-hidden="true" />
            最近更新
          </button>
          <button
            type="button"
            aria-pressed={activeSection === 'all'}
            onClick={() => setActiveSection('all')}
          >
            <span aria-hidden="true" />
            全部模板
          </button>
        </nav>
      </aside>

      <header className={styles.compactBar} data-ptd-home-shell="compact">
        <Brand compact />
        <div className={styles.compactActions}>
          <button type="button" aria-label="新建空白模板" onClick={onNew}>
            <PlusIcon />
          </button>
          <div className={styles.accountSlot}>{accountControl}</div>
        </div>
      </header>

      <div id="workspace-files" className={styles.content} tabIndex={-1}>
        <header className={styles.pageHeader}>
          <div className={styles.pageTitle}>
            <h1>文件</h1>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.searchField}>
              <SearchIcon />
              <input
                type="search"
                aria-label="按标题搜索模板"
                value={query}
                placeholder="搜索文件…"
                onChange={(event) => setQuery(event.currentTarget.value)}
              />
              {query ? (
                <button type="button" aria-label="清除搜索" onClick={() => setQuery('')}>
                  ×
                </button>
              ) : null}
            </div>
            <button className={styles.newButton} type="button" onClick={onNew}>
              <PlusIcon />
              新建模板
            </button>
          </div>
        </header>

        {state.kind === 'loading' ? (
          <section className={styles.systemState} role="status" aria-label="正在载入文件工作台">
            <span className={styles.spinner} aria-hidden="true" />
            <div>
              <strong>正在读取模板</strong>
              <p>正在同步服务器中的文件列表。</p>
            </div>
          </section>
        ) : null}

        {state.kind === 'error' ? (
          <section className={styles.systemState} role="alert">
            <div>
              <strong>文件暂时无法载入</strong>
              <p>{state.message}</p>
            </div>
            <button type="button" onClick={retry}>
              重新载入
            </button>
          </section>
        ) : null}

        {state.kind === 'ready' && templates.length === 0 ? (
          <section className={styles.emptyState}>
            <div>
              <h2>创建第一份模板</h2>
              <p>从空白 A4 页面开始设计，首次保存后会出现在这里。</p>
            </div>
            <button type="button" onClick={onNew}>
              <PlusIcon />
              新建空白模板
            </button>
          </section>
        ) : null}

        {state.kind === 'ready' && templates.length > 0 && filteredTemplates.length === 0 ? (
          <section className={styles.noResults} role="status">
            <h2>没有匹配的模板</h2>
            <p>没有标题包含“{query.trim()}”的模板。</p>
            <button type="button" onClick={() => setQuery('')}>
              清除搜索
            </button>
          </section>
        ) : null}

        {state.kind === 'ready' && filteredTemplates.length > 0 ? (
          <div className={styles.documentSections}>
            <TemplateGallery
              title={activeSection === 'recent' ? '最近更新' : '全部模板'}
              templates={displayedTemplates}
              totalCount={templates.length}
              details={details}
              onOpen={onOpen}
              onRetry={() => setPreviewRetryToken((value) => value + 1)}
            />
          </div>
        ) : null}
      </div>
    </main>
  )
}
