'use client';

import { useEffect, useState } from 'react';
import { useEditor, useEditorState, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extensions';
import {
  Bold, Italic, Underline, Strikethrough, Highlighter, Code, Heading3, Heading4,
  List, ListOrdered, Quote, Link2, Unlink, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Undo2, Redo2, RemoveFormatting,
} from 'lucide-react';
import { normaliseRichText, toRichHtml } from '@/lib/rich-text';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  /**
   * 'full' (default) — semua toolbar (judul, list, align, dll).
   * 'inline' — hanya format sebaris (tebal/miring/garis bawah/tautan) dan node
   * blok dimatikan. Dipakai field pendek seperti deskripsi artikel.
   */
  variant?: 'full' | 'inline';
}

/** Tombol yang tetap tampil di mode inline; sisanya disembunyikan. */
const INLINE_TOOLBAR_KEYS = new Set(['undo', 'redo', 'bold', 'italic', 'underline', 'link', 'unlink']);

/**
 * Editor teks ala Docs/Word untuk field laporan praktikum.
 *
 * Nilai keluar berupa HTML, atau string kosong kalau editor kosong. Nilai
 * masuk boleh HTML maupun teks biasa dari laporan lama — keduanya diubah lewat
 * toRichHtml. Tampilan publiknya dirender oleh <RichText>, yang menyaring HTML
 * dengan allowlist tag yang sama dengan yang bisa dibuat toolbar ini.
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Tulis di sini...',
  minHeight = '140px',
  variant = 'full',
}: RichTextEditorProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const isInline = variant === 'inline';

  const linkConfig = {
    openOnClick: false,
    autolink: true,
    defaultProtocol: 'https',
    HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
  } as const;

  const editor = useEditor({
    // Wajib false di Next.js: editor hanya dibuat di browser, kalau tidak
    // markup server dan client berbeda dan React melempar hydration error.
    immediatelyRender: false,
    extensions: isInline
      ? [
          // Mode inline: node blok dimatikan, jadi hanya paragraf + format sebaris.
          StarterKit.configure({
            heading: false,
            codeBlock: false,
            bulletList: false,
            orderedList: false,
            blockquote: false,
            horizontalRule: false,
            link: linkConfig,
          }),
          Placeholder.configure({ placeholder }),
        ]
      : [
          StarterKit.configure({
            heading: { levels: [3, 4] },
            // Kode panjang punya blok CODE sendiri dengan syntax highlighting.
            codeBlock: false,
            link: linkConfig,
          }),
          TextAlign.configure({ types: ['heading', 'paragraph'] }),
          Highlight,
          Placeholder.configure({ placeholder }),
        ],
    content: toRichHtml(value),
    editorProps: {
      attributes: {
        class: 'rich-text rich-text-editor focus:outline-none',
        style: `min-height:${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => onChange(normaliseRichText(editor.getHTML())),
  });

  // Data laporan dimuat dari API setelah editor terpasang. Isi editor hanya
  // diganti kalau nilainya benar-benar berbeda, supaya ketikan pengguna sendiri
  // (yang kembali ke sini lewat onChange) tidak memindahkan posisi kursor.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = normaliseRichText(editor.getHTML());
    if (normaliseRichText(value) !== current) {
      editor.commands.setContent(toRichHtml(value), { emitUpdate: false });
    }
  }, [editor, value]);

  const applyLink = () => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setLinkOpen(false);
  };

  return (
    <div className="rounded border border-outline-variant/40 bg-black/40 focus-within:border-primary-container/60 transition-colors">
      <Toolbar
        editor={editor}
        variant={variant}
        onLinkClick={() => {
          if (!editor) return;
          setLinkUrl(editor.getAttributes('link').href ?? '');
          setLinkOpen((open) => !open);
        }}
      />

      {linkOpen && (
        <div className="flex gap-2 items-center px-2 py-2 border-b border-outline-variant/30 bg-surface-container-low">
          <input
            type="url"
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
              if (e.key === 'Escape') setLinkOpen(false);
            }}
            placeholder="https://..."
            className="command-input py-1 text-xs flex-grow"
          />
          <button type="button" onClick={applyLink}
            className="btn-neon py-1 px-3 text-xs font-mono">
            {linkUrl.trim() ? 'PASANG' : 'HAPUS'}
          </button>
        </div>
      )}

      <EditorContent editor={editor} className="px-3 py-2 text-sm font-sans text-on-surface" />
    </div>
  );
}

function Toolbar({ editor, onLinkClick, variant = 'full' }: { editor: Editor | null; onLinkClick: () => void; variant?: 'full' | 'inline' }) {
  // Tiptap v3 tidak me-render ulang komponen di setiap transaksi; status
  // tombol aktif diambil lewat useEditorState agar tetap sinkron dengan kursor.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null;
      return {
        bold: e.isActive('bold'),
        italic: e.isActive('italic'),
        underline: e.isActive('underline'),
        strike: e.isActive('strike'),
        highlight: e.isActive('highlight'),
        code: e.isActive('code'),
        h3: e.isActive('heading', { level: 3 }),
        h4: e.isActive('heading', { level: 4 }),
        bullet: e.isActive('bulletList'),
        ordered: e.isActive('orderedList'),
        quote: e.isActive('blockquote'),
        link: e.isActive('link'),
        left: e.isActive({ textAlign: 'left' }),
        center: e.isActive({ textAlign: 'center' }),
        right: e.isActive({ textAlign: 'right' }),
        justify: e.isActive({ textAlign: 'justify' }),
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
      };
    },
  });

  if (!editor || !state) {
    return <div className="h-[38px] border-b border-outline-variant/30" />;
  }

  const chain = () => editor.chain().focus();

  const groups: { key: string; title: string; icon: React.ElementType; active?: boolean; disabled?: boolean; run: () => void }[][] = [
    [
      { key: 'undo', title: 'Undo (Ctrl+Z)', icon: Undo2, disabled: !state.canUndo, run: () => chain().undo().run() },
      { key: 'redo', title: 'Redo (Ctrl+Y)', icon: Redo2, disabled: !state.canRedo, run: () => chain().redo().run() },
    ],
    [
      { key: 'h3', title: 'Judul', icon: Heading3, active: state.h3, run: () => chain().toggleHeading({ level: 3 }).run() },
      { key: 'h4', title: 'Subjudul', icon: Heading4, active: state.h4, run: () => chain().toggleHeading({ level: 4 }).run() },
    ],
    [
      { key: 'bold', title: 'Tebal (Ctrl+B)', icon: Bold, active: state.bold, run: () => chain().toggleBold().run() },
      { key: 'italic', title: 'Miring (Ctrl+I)', icon: Italic, active: state.italic, run: () => chain().toggleItalic().run() },
      { key: 'underline', title: 'Garis bawah (Ctrl+U)', icon: Underline, active: state.underline, run: () => chain().toggleUnderline().run() },
      { key: 'strike', title: 'Coret', icon: Strikethrough, active: state.strike, run: () => chain().toggleStrike().run() },
      { key: 'highlight', title: 'Stabilo', icon: Highlighter, active: state.highlight, run: () => chain().toggleHighlight().run() },
      { key: 'code', title: 'Kode inline', icon: Code, active: state.code, run: () => chain().toggleCode().run() },
      { key: 'link', title: 'Tautan', icon: Link2, active: state.link, run: onLinkClick },
      ...(state.link
        ? [{ key: 'unlink', title: 'Hapus tautan', icon: Unlink, run: () => chain().extendMarkRange('link').unsetLink().run() }]
        : []),
    ],
    [
      { key: 'bullet', title: 'Daftar berpoin', icon: List, active: state.bullet, run: () => chain().toggleBulletList().run() },
      { key: 'ordered', title: 'Daftar bernomor', icon: ListOrdered, active: state.ordered, run: () => chain().toggleOrderedList().run() },
      { key: 'quote', title: 'Kutipan', icon: Quote, active: state.quote, run: () => chain().toggleBlockquote().run() },
    ],
    [
      { key: 'left', title: 'Rata kiri', icon: AlignLeft, active: state.left, run: () => chain().setTextAlign('left').run() },
      { key: 'center', title: 'Rata tengah', icon: AlignCenter, active: state.center, run: () => chain().setTextAlign('center').run() },
      { key: 'right', title: 'Rata kanan', icon: AlignRight, active: state.right, run: () => chain().setTextAlign('right').run() },
      { key: 'justify', title: 'Rata kiri-kanan', icon: AlignJustify, active: state.justify, run: () => chain().setTextAlign('justify').run() },
    ],
    [
      { key: 'clear', title: 'Hapus format', icon: RemoveFormatting, run: () => chain().unsetAllMarks().clearNodes().run() },
    ],
  ];

  // Mode inline hanya menampilkan tombol format sebaris; grup lain disembunyikan.
  const visibleGroups =
    variant === 'inline'
      ? groups.map((group) => group.filter((b) => INLINE_TOOLBAR_KEYS.has(b.key))).filter((group) => group.length > 0)
      : groups;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-1.5 py-1 border-b border-outline-variant/30 bg-surface-container-low/60 rounded-t">
      {visibleGroups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {gi > 0 && <span className="w-px h-5 bg-outline-variant/40 mx-1" aria-hidden="true" />}
          {group.map(({ key, title, icon: Icon, active, disabled, run }) => (
            <button
              key={key}
              type="button"
              title={title}
              aria-label={title}
              aria-pressed={active}
              disabled={disabled}
              // mousedown dicegah agar klik tombol tidak mencuri seleksi teks dari editor.
              onMouseDown={(e) => e.preventDefault()}
              onClick={run}
              className={`p-1.5 rounded transition-colors disabled:opacity-25 disabled:cursor-not-allowed ${
                active
                  ? 'bg-primary-container/20 text-primary-container'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
