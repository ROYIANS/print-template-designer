import {
  useCallback,
  useEffect,
  useInsertionEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type MutableRefObject,
} from 'react'
import {
  componentStyleToCssVariables,
  injectStylesheet,
  canonicalizeRichTextHtml,
  normalizeRichTextParagraphLayout,
  type RichTextParagraphLayout,
  type ComponentCssVariables,
} from '@ptd/components'
import {
  formatMeasurement,
  normalizePlainText,
  parseMeasurement,
  type ComponentSchema,
} from '@ptd/core'
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
  RiArrowDownSLine,
  RiBold,
  RiCheckLine,
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
import { RichTextParagraph } from './richTextParagraphExtension'

interface ContentEditorProps {
  schema: ComponentSchema
}

type ContentEditorStyle = CSSProperties & ComponentCssVariables
type RichTextEditorInstance = NonNullable<ReturnType<typeof useEditor>>
type RichTextSelection = { from: number; to: number }

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
const TEXT_COLOR_PALETTE = [
  ['#1d2735', '默认文字'],
  ['#000000', '黑色'],
  ['#525b66', '深灰'],
  ['#1f4e79', '档案蓝'],
  ['#8f1d2c', '朱红'],
  ['#9a4d00', '琥珀'],
  ['#2d6a4f', '翠绿'],
  ['#6b3f8f', '紫色'],
] as const
const HIGHLIGHT_COLOR_PALETTE = [
  ['#fff1a8', '柔黄'],
  ['#d9ecff', '浅蓝'],
  ['#dff3df', '浅绿'],
  ['#ffe0e7', '浅粉'],
  ['#ffe5c2', '浅橙'],
  ['#e9e1ff', '浅紫'],
] as const
const RICH_TOOLBAR_OPTIONS = {
  strategy: 'fixed',
  placement: 'top',
  offset: 7,
  shift: { padding: 8 },
} as const
const RICH_TOOLBAR_PLUGIN_KEY = 'ptdRichToolbar'

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
  const toolbarRef = useRef<HTMLDivElement>(null)
  const toolbarPointerDownRef = useRef(false)
  const lastSelectionRef = useRef<RichTextSelection | null>(null)
  const settledRef = useRef(false)
  const composingRef = useRef(false)
  const [initialContent] = useState(() => canonicalizeRichTextHtml(textValue(schema.propValue)))
  const [revision, setRevision] = useState(0)
  const [linkEditorOpen, setLinkEditorOpen] = useState(false)
  const [linkDraft, setLinkDraft] = useState('https://')
  const [openToolbarSelect, setOpenToolbarSelect] = useState<string | null>(null)

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
      RichTextParagraph,
    ],
    content: initialContent,
    autofocus: 'end',
    editorProps: {
      attributes: {
        'aria-label': '富文本内容',
        class: `${styles.richEditable} ptd-text__inner`,
        'data-ptd-columns': (schema.style.columnCount ?? 1) > 1 ? 'true' : 'false',
        spellcheck: 'true',
      },
    },
    onCreate: ({ editor: currentEditor }) => syncRichTextEmptyState(currentEditor),
    onUpdate: ({ editor: currentEditor }) => {
      rememberRichTextSelection(currentEditor, lastSelectionRef)
      syncRichTextEmptyState(currentEditor)
      setRevision((value) => value + 1)
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      rememberRichTextSelection(currentEditor, lastSelectionRef)
      syncRichTextEmptyState(currentEditor)
      if (currentEditor.state.selection.empty) setOpenToolbarSelect(null)
      setRevision((value) => value + 1)
    },
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

  const restoreEditorSelection = () => {
    const saved = lastSelectionRef.current
    if (!saved) return
    const { from, to } = editor.state.selection
    if (from === saved.from && to === saved.to) return
    editor.commands.setTextSelection(saved)
  }

  const beginToolbarInteraction = () => {
    toolbarPointerDownRef.current = true
    rememberRichTextSelection(editor, lastSelectionRef)
    window.setTimeout(() => {
      toolbarPointerDownRef.current = false
      const toolbarHasFocus = Boolean(
        toolbarRef.current && toolbarRef.current.contains(document.activeElement),
      )
      if (editor.state.selection.empty && !toolbarHasFocus) {
        editor.view.dispatch(editor.state.tr.setMeta(RICH_TOOLBAR_PLUGIN_KEY, 'hide'))
      }
    }, 600)
  }

  const inlineFontFamily = textValue(editor.getAttributes('textStyle').fontFamily)
  const inheritedFontFamily = textValue(schema.style.fontFamily) || DEFAULT_CJK_FONT_FAMILY
  const fontSelection = resolveFontFamily(inlineFontFamily || inheritedFontFamily)

  const applyLink = (draft = linkDraft) => {
    const href = safeLink(draft)
    if (!href) return
    const saved = lastSelectionRef.current
    if (!saved) return
    editor.chain().focus().setTextSelection(saved).setMark('link', { href }).run()
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
        if (event.target instanceof Element && event.target.closest('[data-ptd-rich-toolbar]')) return
        event.stopPropagation()
        if (event.key === 'Escape' && !composingRef.current && !linkEditorOpen) {
          event.preventDefault()
          cancel()
        } else if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          event.preventDefault()
          commit()
        }
      }}
    >
      <EditorContent editor={editor} className={styles.richContent} />
      <BubbleMenu
        editor={editor}
        ref={toolbarRef}
        pluginKey={RICH_TOOLBAR_PLUGIN_KEY}
        className={`${styles.richToolbar} ${ptdThemeClass}`}
        data-ptd-rich-toolbar
        data-ptd-editor-interactive
        appendTo={appendRichToolbarToBody}
        updateDelay={40}
        resizeDelay={80}
        options={RICH_TOOLBAR_OPTIONS}
        shouldShow={({ from, to, editor: currentEditor }) => {
          if (from !== to) lastSelectionRef.current = { from, to }
          const toolbarHasFocus = Boolean(
            toolbarRef.current && toolbarRef.current.contains(document.activeElement),
          )
          return (
            currentEditor.isEditable &&
            (from !== to || toolbarHasFocus || toolbarPointerDownRef.current)
          )
        }}
        onPointerDownCapture={(event) => {
          beginToolbarInteraction()
          if (!isNativeToolbarControl(event.target)) restoreEditorSelection()
        }}
        onMouseDownCapture={(event) => {
          beginToolbarInteraction()
          if (!isNativeToolbarControl(event.target)) restoreEditorSelection()
        }}
        onPointerDown={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <div className={styles.richToolbarRow} data-ptd-rich-toolbar-row="primary">
          <ToolbarSelect
            id="block"
            label="段落样式"
            value={activeBlock(editor)}
            width="block"
            open={openToolbarSelect === 'block'}
            options={[
              ['paragraph', '正文'],
              ['h1', '标题 1'],
              ['h2', '标题 2'],
              ['h3', '标题 3'],
              ['h4', '标题 4'],
            ]}
            onOpenChange={(open) => setOpenToolbarSelect(open ? 'block' : null)}
            onValueChange={(value) => {
              restoreEditorSelection()
              if (value === 'paragraph') editor.chain().setParagraph().run()
              else
                editor
                  .chain()
                  .toggleHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 | 4 })
                  .run()
            }}
          />
          <ToolbarDivider />
          <ToolbarButton
            label="粗体"
            editor={editor}
            active={editor.isActive('bold')}
            onRun={() => editor.chain().toggleBold().run()}
          >
            <RiBold />
          </ToolbarButton>
          <ToolbarButton
            label="斜体"
            editor={editor}
            active={editor.isActive('italic')}
            onRun={() => editor.chain().toggleItalic().run()}
          >
            <RiItalic />
          </ToolbarButton>
          <ToolbarButton
            label="下划线"
            editor={editor}
            active={editor.isActive('underline')}
            onRun={() => editor.chain().toggleUnderline().run()}
          >
            <RiUnderline />
          </ToolbarButton>
          <ToolbarButton
            label="删除线"
            editor={editor}
            active={editor.isActive('strike')}
            onRun={() => editor.chain().toggleStrike().run()}
          >
            <RiStrikethrough />
          </ToolbarButton>
          <ToolbarButton
            label="引用"
            editor={editor}
            active={editor.isActive('blockquote')}
            onRun={() => editor.chain().toggleBlockquote().run()}
          >
            <RiDoubleQuotesL />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            label="左对齐"
            editor={editor}
            active={editor.isActive({ textAlign: 'left' })}
            onRun={() => editor.chain().setTextAlign('left').run()}
          >
            <RiAlignLeft />
          </ToolbarButton>
          <ToolbarButton
            label="居中"
            editor={editor}
            active={editor.isActive({ textAlign: 'center' })}
            onRun={() => editor.chain().setTextAlign('center').run()}
          >
            <RiAlignCenter />
          </ToolbarButton>
          <ToolbarButton
            label="右对齐"
            editor={editor}
            active={editor.isActive({ textAlign: 'right' })}
            onRun={() => editor.chain().setTextAlign('right').run()}
          >
            <RiAlignRight />
          </ToolbarButton>
          <ToolbarButton
            label="两端对齐"
            editor={editor}
            active={editor.isActive({ textAlign: 'justify' })}
            onRun={() => editor.chain().setTextAlign('justify').run()}
          >
            <RiAlignJustify />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            label="无序列表"
            editor={editor}
            active={editor.isActive('bulletList')}
            onRun={() => editor.chain().toggleBulletList().run()}
          >
            <RiListUnordered />
          </ToolbarButton>
          <ToolbarButton
            label="有序列表"
            editor={editor}
            active={editor.isActive('orderedList')}
            onRun={() => editor.chain().toggleOrderedList().run()}
          >
            <RiListOrdered />
          </ToolbarButton>
        </div>
        <div className={styles.richToolbarRow} data-ptd-rich-toolbar-row="secondary">
          <ParagraphNumberField
            label="段前间距"
            value={paragraphLayoutValue(editor, 'spaceBefore', store.measurementUnit.value)}
            unit={store.measurementUnit.value}
            onChange={(value) =>
              updateParagraphAttribute(editor, 'spaceBefore', value, store.measurementUnit.value)
            }
          />
          <ParagraphNumberField
            label="段后间距"
            value={paragraphLayoutValue(editor, 'spaceAfter', store.measurementUnit.value)}
            unit={store.measurementUnit.value}
            onChange={(value) =>
              updateParagraphAttribute(editor, 'spaceAfter', value, store.measurementUnit.value)
            }
          />
          <ParagraphNumberField
            label="首行缩进"
            value={paragraphLayoutValue(editor, 'firstLineIndent', store.measurementUnit.value)}
            unit={store.measurementUnit.value}
            onChange={(value) =>
              updateParagraphAttribute(
                editor,
                'firstLineIndent',
                value,
                store.measurementUnit.value,
              )
            }
          />
          <ToolbarDivider />
          <ToolbarSelect
            id="font-size"
            label="字号"
            value={editor.getAttributes('textStyle').fontSize ?? ''}
            width="narrow"
            open={openToolbarSelect === 'font-size'}
            options={[['', '字号'], ...FONT_SIZES.map((size) => [size, size] as const)]}
            onOpenChange={(open) => setOpenToolbarSelect(open ? 'font-size' : null)}
            onValueChange={(value) => {
              restoreEditorSelection()
              editor.chain().setFontSize(value).run()
            }}
          />
          <ToolbarSelect
            id="font-cjk"
            label="中文字体"
            title="中文字体效果取决于本机已安装字体"
            value={fontSelection.cjk}
            width="font"
            open={openToolbarSelect === 'font-cjk'}
            options={[
              ...(!fontSelection.recognized
                ? [[fontSelection.cjk, primaryFontName(fontSelection.cjk)] as const]
                : []),
              ...CJK_FONT_FAMILY_OPTIONS,
            ]}
            onOpenChange={(open) => setOpenToolbarSelect(open ? 'font-cjk' : null)}
            onValueChange={(value) => {
              restoreEditorSelection()
              editor.chain().setFontFamily(composeFontFamily(value, fontSelection.latin)).run()
            }}
          />
          <ToolbarSelect
            id="font-latin"
            label="西文字体"
            title="西文字体效果取决于本机已安装字体"
            value={fontSelection.latin}
            width="font"
            open={openToolbarSelect === 'font-latin'}
            options={LATIN_FONT_FAMILY_OPTIONS}
            onOpenChange={(open) => setOpenToolbarSelect(open ? 'font-latin' : null)}
            onValueChange={(value) => {
              restoreEditorSelection()
              editor.chain().setFontFamily(composeFontFamily(fontSelection.cjk, value)).run()
            }}
          />
          <ToolbarSelect
            id="line-height"
            label="行高"
            value={editor.getAttributes('textStyle').lineHeight ?? ''}
            width="narrow"
            open={openToolbarSelect === 'line-height'}
            options={[['', '行高'], ...LINE_HEIGHTS.map((height) => [height, height] as const)]}
            onOpenChange={(open) => setOpenToolbarSelect(open ? 'line-height' : null)}
            onValueChange={(value) => {
              restoreEditorSelection()
              editor.chain().setLineHeight(value).run()
            }}
          />
        </div>
        <div className={styles.richToolbarRow} data-ptd-rich-toolbar-row="tertiary">
          <ToolbarGroupLabel>颜色</ToolbarGroupLabel>
          <ToolbarColorPicker
            label="文字颜色"
            value={editor.getAttributes('textStyle').color ?? TEXT_COLOR_PALETTE[0][0]}
            palette={TEXT_COLOR_PALETTE}
            open={openToolbarSelect === 'text-color'}
            onOpenChange={(open) => {
              if (open) {
                restoreEditorSelection()
                setLinkEditorOpen(false)
              }
              setOpenToolbarSelect(open ? 'text-color' : null)
            }}
            onClear={() => {
              restoreEditorSelection()
              editor.chain().focus().unsetColor().run()
            }}
            onChange={(color) => {
              restoreEditorSelection()
              editor.chain().focus().setColor(color).run()
            }}
            mark="text"
          />
          <ToolbarColorPicker
            label="高亮颜色"
            value={editor.getAttributes('highlight').color ?? HIGHLIGHT_COLOR_PALETTE[0][0]}
            palette={HIGHLIGHT_COLOR_PALETTE}
            open={openToolbarSelect === 'highlight-color'}
            onOpenChange={(open) => {
              if (open) {
                restoreEditorSelection()
                setLinkEditorOpen(false)
              }
              setOpenToolbarSelect(open ? 'highlight-color' : null)
            }}
            onClear={() => {
              restoreEditorSelection()
              editor.chain().focus().unsetHighlight().run()
            }}
            onChange={(color) => {
              restoreEditorSelection()
              editor.chain().focus().setHighlight({ color }).run()
            }}
            mark="highlight"
          />
          <ToolbarDivider />
          <ToolbarGroupLabel>插入</ToolbarGroupLabel>
          <ToolbarButton
            label={editor.isActive('link') ? '移除链接' : '添加链接'}
            editor={editor}
            active={editor.isActive('link')}
            onRun={() => {
              rememberRichTextSelection(editor, lastSelectionRef)
              if (editor.isActive('link')) {
                restoreEditorSelection()
                editor.chain().unsetLink().run()
              } else {
                restoreEditorSelection()
                setOpenToolbarSelect(null)
                setLinkDraft('https://')
                setLinkEditorOpen(true)
              }
            }}
          >
            <RiLink />
          </ToolbarButton>
          <ToolbarButton
            label="清除格式"
            editor={editor}
            onRun={() => editor.chain().unsetAllMarks().clearNodes().run()}
          >
            <RiEraserLine />
          </ToolbarButton>
          {linkEditorOpen && (
            <ToolbarLinkPopover
              value={linkDraft}
              onChange={setLinkDraft}
              onApply={applyLink}
              onClose={() => {
                setLinkEditorOpen(false)
                restoreEditorSelection()
                editor.commands.focus()
              }}
            />
          )}
        </div>
      </BubbleMenu>
      <EditingHint label="富文本编辑" />
    </div>
  )
}

function ToolbarButton({
  label,
  editor,
  active = false,
  onRun,
  children,
}: {
  label: string
  editor: NonNullable<ReturnType<typeof useEditor>>
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
        const { from, to } = editor.state.selection
        if (from !== to) editor.commands.setTextSelection({ from, to })
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

type ToolbarSelectOption = readonly [value: string, label: string]

function ToolbarSelect({
  id,
  label,
  title,
  value,
  options,
  width,
  open,
  onOpenChange,
  onValueChange,
}: {
  id: string
  label: string
  title?: string
  value: string
  options: readonly ToolbarSelectOption[]
  width: 'block' | 'font' | 'narrow'
  open: boolean
  onOpenChange: (open: boolean) => void
  onValueChange: (value: string) => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find(([optionValue]) => optionValue === value)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return
      onOpenChange(false)
    }
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onOpenChange(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [onOpenChange, open])

  return (
    <div
      ref={rootRef}
      className={styles.toolbarSelect}
      data-width={width}
      data-open={open || undefined}
    >
      <button
        type="button"
        className={styles.toolbarSelectTrigger}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={title ?? label}
        onPointerDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onOpenChange(!open)
        }}
        onClick={(event) => {
          event.stopPropagation()
          if (event.detail === 0) onOpenChange(!open)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpenChange(!open)
          }
        }}
      >
        <span>{selected?.[1] ?? label}</span>
        <RiArrowDownSLine aria-hidden="true" />
      </button>
      {open && (
        <div
          className={styles.toolbarSelectMenu}
          role="listbox"
          aria-label={label}
          data-ptd-editor-interactive
        >
          {options.map(([optionValue, optionLabel]) => (
            <button
              key={`${id}:${optionValue}`}
              type="button"
              role="option"
              aria-selected={optionValue === value}
              className={styles.toolbarSelectOption}
              data-value={optionValue}
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onValueChange(optionValue)
                onOpenChange(false)
              }}
              onClick={(event) => {
                event.stopPropagation()
                if (event.detail === 0) {
                  onValueChange(optionValue)
                  onOpenChange(false)
                }
              }}
            >
              {optionLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

type ToolbarColorOption = readonly [color: string, label: string]

function ToolbarColorPicker({
  label,
  value,
  palette,
  open,
  onOpenChange,
  onChange,
  onClear,
  mark,
}: {
  label: string
  value: string
  palette: readonly ToolbarColorOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (color: string) => void
  onClear: () => void
  mark: 'text' | 'highlight'
}) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return
      onOpenChange(false)
    }
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onOpenChange(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [onOpenChange, open])

  return (
    <div
      ref={rootRef}
      className={styles.toolbarColorPicker}
      data-open={open || undefined}
      data-mark={mark}
    >
      <button
        type="button"
        className={styles.toolbarColorTrigger}
        aria-label={label}
        aria-haspopup="grid"
        aria-expanded={open}
        title={label}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          event.preventDefault()
          event.stopPropagation()
          onOpenChange(!open)
        }}
        onClick={(event) => {
          event.stopPropagation()
          if (event.detail === 0) onOpenChange(!open)
        }}
      >
        <span className={mark === 'highlight' ? styles.highlightMark : styles.textColorMark}>字</span>
        <span
          className={styles.colorIndicator}
          style={{ '--ptd-color-value': value } as CSSProperties}
          aria-hidden="true"
        />
        <RiArrowDownSLine aria-hidden="true" />
      </button>
      {open && (
        <div
          className={styles.toolbarColorMenu}
          role="grid"
          aria-label={`${label}色板`}
          data-ptd-editor-interactive
        >
          <div className={styles.colorMenuHeading}>{label}</div>
          <div className={styles.colorSwatches}>
            {palette.map(([color, optionLabel]) => (
              <button
                key={color}
                type="button"
                role="gridcell"
                aria-label={optionLabel}
                aria-selected={value.toLowerCase() === color.toLowerCase()}
                className={styles.colorSwatch}
                data-selected={value.toLowerCase() === color.toLowerCase() || undefined}
                style={{ '--ptd-color-value': color } as CSSProperties}
                onPointerDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onChange(color)
                  onOpenChange(false)
                }}
                onClick={(event) => event.stopPropagation()}
              >
                {value.toLowerCase() === color.toLowerCase() && <RiCheckLine aria-hidden="true" />}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.clearColorButton}
            onPointerDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onClear()
              onOpenChange(false)
            }}
          >
            清除{mark === 'highlight' ? '高亮' : '文字颜色'}
          </button>
        </div>
      )}
    </div>
  )
}

function ToolbarLinkPopover({
  value,
  onChange,
  onApply,
  onClose,
}: {
  value: string
  onChange: (value: string) => void
  onApply: (value: string) => void
  onClose: () => void
}) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return
      onClose()
    }
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [onClose])

  return (
    <span ref={rootRef} className={styles.linkEditor} data-ptd-editor-interactive>
      <input
        ref={inputRef}
        type="url"
        aria-label="链接地址"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onPointerDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            onApply(value)
          } else if (event.key === 'Escape') {
            event.preventDefault()
            onClose()
          }
        }}
      />
      <button
        type="button"
        aria-label="应用链接"
        onPointerDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onApply(value)
        }}
        onClick={(event) => {
          event.stopPropagation()
          if (event.detail === 0) onApply(value)
        }}
      >
        <RiCheckLine />
      </button>
      <button
        type="button"
        aria-label="关闭链接编辑"
        onPointerDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onClose()
        }}
        onClick={(event) => {
          event.stopPropagation()
          if (event.detail === 0) onClose()
        }}
      >
        <RiCloseLine />
      </button>
    </span>
  )
}

function ToolbarDivider() {
  return <span className={styles.toolbarDivider} aria-hidden="true" />
}

function ToolbarGroupLabel({ children }: { children: React.ReactNode }) {
  return <span className={styles.toolbarGroupLabel}>{children}</span>
}

function ParagraphNumberField({
  label,
  value,
  unit,
  onChange,
}: {
  label: string
  value: string
  unit: 'mm' | 'px'
  onChange: (value: string) => void
}) {
  return (
    <label className={styles.paragraphField} title={`${label}（${unit}）`}>
      <span>{label}</span>
      <input
        type="number"
        min="0"
        max={unit === 'mm' ? '200' : '1000'}
        step={unit === 'mm' ? '0.1' : '1'}
        value={value}
        aria-label={`${label}（${unit}）`}
        onChange={(event) => onChange(event.target.value)}
        onPointerDown={(event) => event.stopPropagation()}
      />
      <small>{unit}</small>
    </label>
  )
}

function appendRichToolbarToBody(): HTMLElement {
  return document.body
}

function rememberRichTextSelection(
  editor: RichTextEditorInstance,
  selectionRef: MutableRefObject<RichTextSelection | null>,
): void {
  const { from, to } = editor.state.selection
  if (from !== to) selectionRef.current = { from, to }
}

function syncRichTextEmptyState(editor: RichTextEditorInstance): void {
  const element = editor.view.dom
  const text = editor.state.doc.textBetween(0, editor.state.doc.content.size, '\n', '\n').trim()
  if (text.length === 0) element.setAttribute('data-ptd-empty', 'true')
  else element.removeAttribute('data-ptd-empty')
}

function isNativeToolbarControl(target: EventTarget | null): boolean {
  return target instanceof HTMLSelectElement || target instanceof HTMLInputElement
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

function paragraphNodeType(
  editor: NonNullable<ReturnType<typeof useEditor>>,
): 'paragraph' | 'heading' {
  return editor.isActive('heading') ? 'heading' : 'paragraph'
}

function paragraphLayoutValue(
  editor: NonNullable<ReturnType<typeof useEditor>>,
  key: keyof RichTextParagraphLayout,
  unit: 'mm' | 'px',
): string {
  const layout = normalizeRichTextParagraphLayout(
    editor.getAttributes(paragraphNodeType(editor))['ptdParagraphLayout'],
  )
  return formatMeasurement(layout[key], unit)
}

function updateParagraphAttribute(
  editor: NonNullable<ReturnType<typeof useEditor>>,
  key: keyof RichTextParagraphLayout,
  rawValue: string,
  unit: 'mm' | 'px',
): void {
  const canvasValue = parseMeasurement(rawValue, unit)
  if (canvasValue === null || canvasValue < 0 || canvasValue > 1000) return
  const value = canvasValue === 0 ? null : canvasValue
  const type = paragraphNodeType(editor)
  const currentLayout = normalizeRichTextParagraphLayout(
    editor.getAttributes(type)['ptdParagraphLayout'],
  )
  editor
    .chain()
    .focus()
    .updateAttributes(type, {
      ptdParagraphLayout: {
        ...currentLayout,
        [key]: value ?? 0,
      },
    })
    .run()
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
