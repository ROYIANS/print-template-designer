import {
  useCallback,
  useEffect,
  useInsertionEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import {
  componentStyleToCssVariables,
  injectStylesheet,
  canonicalizeRichTextHtml,
  type ComponentCssVariables,
} from '@ptd/components'
import { normalizePlainText, type ComponentSchema } from '@ptd/core'
import { Color } from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import { FontSize, LineHeight, TextStyle } from '@tiptap/extension-text-style'
import { BubbleMenu } from '@tiptap/react/menus'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  RiAlignCenter,
  RiAlignJustify,
  RiAlignLeft,
  RiAlignRight,
  RiBold,
  RiCloseLine,
  RiDoubleQuotesL,
  RiEraserLine,
  RiItalic,
  RiLink,
  RiListOrdered,
  RiListUnordered,
  RiStrikethrough,
  RiUnderline,
} from '@remixicon/react'
import {
  CJK_FONT_FAMILY_OPTIONS,
  composeFontFamily,
  DEFAULT_CJK_FONT_FAMILY,
  LATIN_FONT_FAMILY_OPTIONS,
  resolveFontFamily,
} from '../../config/typography'
import { useEditorStore } from '../../state'
import { ptdThemeClass } from '../Theme'
import styles from './ContentEditor.module.css'

interface ContentEditorProps {
  schema: ComponentSchema
}

type ContentEditorStyle = CSSProperties & ComponentCssVariables

const FONT_SIZES = [
  '8pt',
  '9pt',
  '10pt',
  '10.5pt',
  '11pt',
  '12pt',
  '14pt',
  '16pt',
  '18pt',
  '20pt',
  '24pt',
  '28pt',
  '32pt',
  '36pt',
  '48pt',
  '72pt',
] as const
const LINE_HEIGHTS = ['1', '1.25', '1.5', '1.75', '2'] as const
const RICH_TOOLBAR_OPTIONS = {
  strategy: 'fixed',
  placement: 'top',
  offset: 7,
  shift: { padding: 8 },
} as const

export function isDirectlyEditableComponent(schema: ComponentSchema): boolean {
  return schema.component === 'RoySimpleText' || schema.component === 'RoyText'
}

export function ContentEditor({ schema }: ContentEditorProps) {
  useInsertionEffect(() => {
    injectStylesheet()
  }, [])

  if (schema.component === 'RoySimpleText') return <PlainTextEditor schema={schema} />
  if (schema.component === 'RoyText') return <RichTextEditor schema={schema} />
  return null
}

function PlainTextEditor({ schema }: ContentEditorProps) {
  const store = useEditorStore()
  const frameRef = useRef<HTMLDivElement>(null)
  const editableRef = useRef<HTMLDivElement>(null)
  const draftRef = useRef(normalizePlainText(textValue(schema.propValue)))
  const composingRef = useRef(false)
  const settledRef = useRef(false)

  const commit = useCallback(() => {
    if (settledRef.current) return
    settledRef.current = true
    store.commitContentEditing(schema.id, normalizePlainText(draftRef.current))
  }, [schema.id, store])
  const cancel = useCallback(() => {
    if (settledRef.current) return
    settledRef.current = true
    store.cancelContentEditing(schema.id)
  }, [schema.id, store])

  useOutsideCommit(frameRef, commit)

  useEffect(() => {
    const element = editableRef.current
    if (!element) return
    element.textContent = draftRef.current
    element.focus({ preventScroll: true })
    placeCaretAtEnd(element)
  }, [])

  return (
    <div
      ref={frameRef}
      className={`${styles.editorFrame} ptd-simple-text`}
      style={contentEditorStyle(schema)}
      data-ptd-content-editor
      data-ptd-editor-interactive
    >
      <div
        ref={editableRef}
        className={`${styles.plainEditor} ptd-simple-text__inner`}
        contentEditable="plaintext-only"
        suppressContentEditableWarning
        role="textbox"
        aria-label="文本内容"
        aria-multiline="true"
        spellCheck
        onInput={(event: FormEvent<HTMLDivElement>) => {
          draftRef.current = normalizePlainText(event.currentTarget.innerText)
        }}
        onCompositionStart={() => {
          composingRef.current = true
        }}
        onCompositionEnd={() => {
          composingRef.current = false
        }}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          event.stopPropagation()
          if (event.key === 'Escape' && !composingRef.current) {
            event.preventDefault()
            cancel()
          } else if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault()
            commit()
          }
        }}
        onPointerDown={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      />
      <EditingHint label="文本编辑" />
    </div>
  )
}

function RichTextEditor({ schema }: ContentEditorProps) {
  const store = useEditorStore()
  const rootRef = useRef<HTMLDivElement>(null)
  const settledRef = useRef(false)
  const composingRef = useRef(false)
  const [initialContent] = useState(() => canonicalizeRichTextHtml(textValue(schema.propValue)))
  const [revision, setRevision] = useState(0)
  const [linkEditorOpen, setLinkEditorOpen] = useState(false)
  const [linkDraft, setLinkDraft] = useState('https://')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        link: { openOnClick: false },
      }),
      TextStyle,
      FontSize,
      LineHeight,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: initialContent,
    autofocus: 'end',
    editorProps: {
      attributes: {
        'aria-label': '富文本内容',
        class: `${styles.richEditable} ptd-text__inner`,
        spellcheck: 'true',
      },
    },
    onUpdate: () => setRevision((value) => value + 1),
    onSelectionUpdate: () => setRevision((value) => value + 1),
  })

  const commit = useCallback(() => {
    if (settledRef.current) return
    settledRef.current = true
    const html = editor?.getHTML() ?? initialContent
    store.commitContentEditing(schema.id, canonicalizeRichTextHtml(html))
  }, [editor, initialContent, schema.id, store])
  const cancel = useCallback(() => {
    if (settledRef.current) return
    settledRef.current = true
    store.cancelContentEditing(schema.id)
  }, [schema.id, store])

  useEffect(() => {
    if (!editor) return
    const frame = requestAnimationFrame(() => {
      if (!editor.isDestroyed) {
        editor.chain().focus('end', { scrollIntoView: false }).run()
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [editor])

  useOutsideCommit(rootRef, commit)

  if (!editor) return <div className={styles.editorFrame} data-ptd-content-editor />
  void revision

  const inlineFontFamily = textValue(editor.getAttributes('textStyle').fontFamily)
  const inheritedFontFamily = textValue(schema.style.fontFamily) || DEFAULT_CJK_FONT_FAMILY
  const fontSelection = resolveFontFamily(inlineFontFamily || inheritedFontFamily)

  const applyLink = () => {
    const href = safeLink(linkDraft)
    if (!href) return
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    setLinkEditorOpen(false)
  }

  return (
    <div
      ref={rootRef}
      className={`${styles.editorFrame} ptd-text`}
      style={contentEditorStyle(schema)}
      data-ptd-content-editor
      data-ptd-editor-interactive
      onPointerDown={(event) => {
        event.stopPropagation()
        if (
          event.button === 0 &&
          event.target instanceof Element &&
          !event.target.closest('[contenteditable="true"]')
        ) {
          editor.chain().focus('end', { scrollIntoView: false }).run()
        }
      }}
      onDoubleClick={(event) => event.stopPropagation()}
      onCompositionStart={() => {
        composingRef.current = true
      }}
      onCompositionEnd={() => {
        composingRef.current = false
      }}
      onKeyDownCapture={(event) => {
        event.stopPropagation()
        if (event.key === 'Escape' && !composingRef.current && !linkEditorOpen) {
          event.preventDefault()
          cancel()
        }
      }}
    >
      <EditorContent editor={editor} className={styles.richContent} />
      <BubbleMenu
        editor={editor}
        className={`${styles.richToolbar} ${ptdThemeClass}`}
        data-ptd-rich-toolbar
        data-ptd-editor-interactive
        appendTo={appendRichToolbarToBody}
        updateDelay={40}
        resizeDelay={80}
        options={RICH_TOOLBAR_OPTIONS}
        shouldShow={({ from, to }) => from !== to && editor.isEditable}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <select
          aria-label="段落样式"
          value={activeBlock(editor)}
          onChange={(event) => {
            const value = event.target.value
            if (value === 'paragraph') editor.chain().focus().setParagraph().run()
            else
              editor
                .chain()
                .focus()
                .toggleHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 | 4 })
                .run()
          }}
        >
          <option value="paragraph">正文</option>
          <option value="h1">标题 1</option>
          <option value="h2">标题 2</option>
          <option value="h3">标题 3</option>
          <option value="h4">标题 4</option>
        </select>
        <ToolbarDivider />
        <ToolbarButton
          label="粗体"
          active={editor.isActive('bold')}
          onRun={() => editor.chain().focus().toggleBold().run()}
        >
          <RiBold />
        </ToolbarButton>
        <ToolbarButton
          label="斜体"
          active={editor.isActive('italic')}
          onRun={() => editor.chain().focus().toggleItalic().run()}
        >
          <RiItalic />
        </ToolbarButton>
        <ToolbarButton
          label="下划线"
          active={editor.isActive('underline')}
          onRun={() => editor.chain().focus().toggleUnderline().run()}
        >
          <RiUnderline />
        </ToolbarButton>
        <ToolbarButton
          label="删除线"
          active={editor.isActive('strike')}
          onRun={() => editor.chain().focus().toggleStrike().run()}
        >
          <RiStrikethrough />
        </ToolbarButton>
        <ToolbarButton
          label="引用"
          active={editor.isActive('blockquote')}
          onRun={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <RiDoubleQuotesL />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          label="左对齐"
          active={editor.isActive({ textAlign: 'left' })}
          onRun={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <RiAlignLeft />
        </ToolbarButton>
        <ToolbarButton
          label="居中"
          active={editor.isActive({ textAlign: 'center' })}
          onRun={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <RiAlignCenter />
        </ToolbarButton>
        <ToolbarButton
          label="右对齐"
          active={editor.isActive({ textAlign: 'right' })}
          onRun={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <RiAlignRight />
        </ToolbarButton>
        <ToolbarButton
          label="两端对齐"
          active={editor.isActive({ textAlign: 'justify' })}
          onRun={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          <RiAlignJustify />
        </ToolbarButton>
        <ToolbarButton
          label="无序列表"
          active={editor.isActive('bulletList')}
          onRun={() => editor.chain().focus().toggleBulletList().run()}
        >
          <RiListUnordered />
        </ToolbarButton>
        <ToolbarButton
          label="有序列表"
          active={editor.isActive('orderedList')}
          onRun={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <RiListOrdered />
        </ToolbarButton>
        <ToolbarDivider />
        <select
          aria-label="字号"
          value={editor.getAttributes('textStyle').fontSize ?? ''}
          onChange={(event) => editor.chain().focus().setFontSize(event.target.value).run()}
        >
          <option value="">字号</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <select
          aria-label="中文字体"
          title="中文字体效果取决于本机已安装字体"
          value={fontSelection.cjk}
          onChange={(event) =>
            editor
              .chain()
              .focus()
              .setFontFamily(composeFontFamily(event.target.value, fontSelection.latin))
              .run()
          }
        >
          {!fontSelection.recognized && (
            <option value={fontSelection.cjk}>{primaryFontName(fontSelection.cjk)}</option>
          )}
          {CJK_FONT_FAMILY_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="西文字体"
          title="西文字体效果取决于本机已安装字体"
          value={fontSelection.latin}
          onChange={(event) =>
            editor
              .chain()
              .focus()
              .setFontFamily(composeFontFamily(fontSelection.cjk, event.target.value))
              .run()
          }
        >
          {LATIN_FONT_FAMILY_OPTIONS.map(([value, label]) => (
            <option key={value || 'follow-cjk'} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="行高"
          value={editor.getAttributes('textStyle').lineHeight ?? ''}
          onChange={(event) => editor.chain().focus().setLineHeight(event.target.value).run()}
        >
          <option value="">行高</option>
          {LINE_HEIGHTS.map((height) => (
            <option key={height} value={height}>
              {height}
            </option>
          ))}
        </select>
        <label className={styles.colorWell} title="文字颜色">
          <span>字</span>
          <input
            type="color"
            aria-label="文字颜色"
            value={editor.getAttributes('textStyle').color ?? '#1d2735'}
            onChange={(event) => editor.chain().focus().setColor(event.target.value).run()}
          />
        </label>
        <label className={styles.colorWell} title="高亮颜色">
          <span className={styles.highlightMark}>字</span>
          <input
            type="color"
            aria-label="高亮颜色"
            value={editor.getAttributes('highlight').color ?? '#fff1a8'}
            onChange={(event) =>
              editor.chain().focus().setHighlight({ color: event.target.value }).run()
            }
          />
        </label>
        <ToolbarButton
          label={editor.isActive('link') ? '移除链接' : '添加链接'}
          active={editor.isActive('link')}
          onRun={() => {
            if (editor.isActive('link')) editor.chain().focus().unsetLink().run()
            else {
              setLinkDraft('https://')
              setLinkEditorOpen(true)
            }
          }}
        >
          <RiLink />
        </ToolbarButton>
        <ToolbarButton
          label="清除格式"
          onRun={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        >
          <RiEraserLine />
        </ToolbarButton>
        {linkEditorOpen && (
          <span className={styles.linkEditor} onMouseDown={(event) => event.stopPropagation()}>
            <input
              autoFocus
              type="url"
              aria-label="链接地址"
              value={linkDraft}
              onChange={(event) => setLinkDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  applyLink()
                } else if (event.key === 'Escape') {
                  event.preventDefault()
                  setLinkEditorOpen(false)
                  editor.commands.focus()
                }
              }}
            />
            <button
              type="button"
              aria-label="关闭链接编辑"
              onClick={() => setLinkEditorOpen(false)}
            >
              <RiCloseLine />
            </button>
          </span>
        )}
      </BubbleMenu>
      <EditingHint label="富文本编辑" />
    </div>
  )
}

function ToolbarButton({
  label,
  active = false,
  onRun,
  children,
}: {
  label: string
  active?: boolean
  onRun: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      data-active={active || undefined}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.preventDefault()
        event.stopPropagation()
        onRun()
      }}
      onClick={(event) => {
        event.stopPropagation()
        if (event.detail === 0) onRun()
      }}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <span className={styles.toolbarDivider} aria-hidden="true" />
}

function appendRichToolbarToBody(): HTMLElement {
  return document.body
}

function EditingHint({ label }: { label: string }) {
  return (
    <span className={styles.editingHint}>
      {label}
      <kbd>Esc</kbd>取消
    </span>
  )
}

function useOutsideCommit(rootRef: React.RefObject<HTMLElement | null>, commit: () => void): void {
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target)) return
      if (target instanceof Element && target.closest('[data-ptd-editor-interactive]')) return
      commit()
    }
    document.addEventListener('pointerdown', handlePointerDown, true)
    return () => document.removeEventListener('pointerdown', handlePointerDown, true)
  }, [commit, rootRef])
}

function placeCaretAtEnd(element: HTMLElement): void {
  const range = document.createRange()
  range.selectNodeContents(element)
  range.collapse(false)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

function activeBlock(editor: NonNullable<ReturnType<typeof useEditor>>): string {
  for (const level of [1, 2, 3, 4] as const)
    if (editor.isActive('heading', { level })) return `h${level}`
  return 'paragraph'
}

function safeLink(value: string): string | null {
  const href = value.trim()
  return /^(?:https?:|mailto:)/i.test(href) ? href : null
}

function primaryFontName(fontFamily: string): string {
  return (fontFamily.split(',')[0]?.trim() || fontFamily).replace(/^["']|["']$/g, '')
}

function textValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function contentEditorStyle(schema: ComponentSchema): ContentEditorStyle {
  return componentStyleToCssVariables(schema.style) as ContentEditorStyle
}
