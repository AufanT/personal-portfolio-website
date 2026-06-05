'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Terminal,
  FolderOpen,
  AlignLeft,
  ChevronUp,
  ChevronDown,
  Code,
  Image as ImageIcon,
} from 'lucide-react';
import { supabaseClient } from '@/lib/supabase';
import { useToast, ToastComponent } from '@/components/Toast';
import ImageUpload from '@/components/ImageUpload';
import CodeTextarea from '@/components/CodeTextarea';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ContentBlock {
  id: string;
  type: 'text' | 'code' | 'image';
  content: string;
}

interface SubstepItem {
  title: string;
  blocks: ContentBlock[];
}

interface LangkahItem {
  title: string;
  blocks: ContentBlock[];
  subtitles: SubstepItem[];
}

interface AlatBahanItem {
  name: string;
  icon: string;
}

interface StructuredContent {
  format: 'structured';
  tujuan: string[];
  dasar_teori: string;
  alat_bahan: AlatBahanItem[];
  langkah_kerja: LangkahItem[];
  latihan_tugas: LangkahItem[];
  kesimpulan: string;
}

// ─── ID generation (stable within a session) ─────────────────────────────────
let _id = 0;
const uid = () => `blk_${++_id}_${Date.now()}`;

// ─── Data normalisation (old format → new blocks format) ─────────────────────
function blocksFromLegacy(data: any): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  // If already has blocks array saved, use it
  if (Array.isArray(data.blocks) && data.blocks.length > 0) {
    return data.blocks.map((b: any) => ({ id: uid(), type: b.type, content: b.content ?? '' }));
  }
  // Old separate arrays: texts → codes → images
  const texts: string[] = data.texts?.length ? data.texts : data.text ? [data.text] : [];
  const codes: string[] = data.codes?.length ? data.codes : data.code ? [data.code] : [];
  const images: string[] = data.images ?? [];
  texts.forEach((t: string) => t && blocks.push({ id: uid(), type: 'text', content: t }));
  codes.forEach((c: string) => c && blocks.push({ id: uid(), type: 'code', content: c }));
  images.forEach((img: string) => img && blocks.push({ id: uid(), type: 'image', content: img }));
  return blocks;
}

function normaliseStep(s: any): LangkahItem {
  return {
    title: s.title ?? '',
    blocks: blocksFromLegacy(s),
    subtitles: (s.subtitles ?? []).map((sub: any): SubstepItem => ({
      title: sub.title ?? '',
      blocks: blocksFromLegacy(sub),
    })),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
type SetSteps = React.Dispatch<React.SetStateAction<LangkahItem[]>>;

function makeHandlers(set: SetSteps) {
  const upd = (fn: (prev: LangkahItem[]) => LangkahItem[]) => set(fn);

  // Step-level
  const addStep = () =>
    upd((p) => [...p, { title: '', blocks: [], subtitles: [] }]);

  const insertStep = (i: number) =>
    upd((p) => {
      const n = [...p];
      n.splice(i + 1, 0, { title: '', blocks: [], subtitles: [] });
      return n;
    });

  const removeStep = (i: number) => upd((p) => p.filter((_, idx) => idx !== i));

  const changeTitle = (i: number, v: string) =>
    upd((p) => p.map((s, idx) => (idx === i ? { ...s, title: v } : s)));

  // Block-level
  const addBlock = (i: number, type: ContentBlock['type']) =>
    upd((p) =>
      p.map((s, idx) =>
        idx === i
          ? { ...s, blocks: [...s.blocks, { id: uid(), type, content: '' }] }
          : s
      )
    );

  const removeBlock = (i: number, bId: string) =>
    upd((p) =>
      p.map((s, idx) =>
        idx === i ? { ...s, blocks: s.blocks.filter((b) => b.id !== bId) } : s
      )
    );

  const changeBlock = (i: number, bId: string, content: string) =>
    upd((p) =>
      p.map((s, idx) =>
        idx === i
          ? { ...s, blocks: s.blocks.map((b) => (b.id === bId ? { ...b, content } : b)) }
          : s
      )
    );

  const moveBlock = (i: number, bId: string, dir: -1 | 1) =>
    upd((p) =>
      p.map((s, idx) => {
        if (idx !== i) return s;
        const blocks = [...s.blocks];
        const bIdx = blocks.findIndex((b) => b.id === bId);
        const target = bIdx + dir;
        if (target < 0 || target >= blocks.length) return s;
        [blocks[bIdx], blocks[target]] = [blocks[target], blocks[bIdx]];
        return { ...s, blocks };
      })
    );

  // Substep-level
  const addSub = (i: number) =>
    upd((p) =>
      p.map((s, idx) =>
        idx === i
          ? { ...s, subtitles: [...s.subtitles, { title: '', blocks: [] }] }
          : s
      )
    );

  const removeSub = (i: number, sIdx: number) =>
    upd((p) =>
      p.map((s, idx) =>
        idx === i
          ? { ...s, subtitles: s.subtitles.filter((_, si) => si !== sIdx) }
          : s
      )
    );

  const changeSubTitle = (i: number, sIdx: number, v: string) =>
    upd((p) =>
      p.map((s, idx) =>
        idx === i
          ? {
              ...s,
              subtitles: s.subtitles.map((sub, si) =>
                si === sIdx ? { ...sub, title: v } : sub
              ),
            }
          : s
      )
    );

  // Sub-block-level
  const addSubBlock = (i: number, sIdx: number, type: ContentBlock['type']) =>
    upd((p) =>
      p.map((s, idx) =>
        idx === i
          ? {
              ...s,
              subtitles: s.subtitles.map((sub, si) =>
                si === sIdx
                  ? { ...sub, blocks: [...sub.blocks, { id: uid(), type, content: '' }] }
                  : sub
              ),
            }
          : s
      )
    );

  const removeSubBlock = (i: number, sIdx: number, bId: string) =>
    upd((p) =>
      p.map((s, idx) =>
        idx === i
          ? {
              ...s,
              subtitles: s.subtitles.map((sub, si) =>
                si === sIdx
                  ? { ...sub, blocks: sub.blocks.filter((b) => b.id !== bId) }
                  : sub
              ),
            }
          : s
      )
    );

  const changeSubBlock = (i: number, sIdx: number, bId: string, content: string) =>
    upd((p) =>
      p.map((s, idx) =>
        idx === i
          ? {
              ...s,
              subtitles: s.subtitles.map((sub, si) =>
                si === sIdx
                  ? {
                      ...sub,
                      blocks: sub.blocks.map((b) =>
                        b.id === bId ? { ...b, content } : b
                      ),
                    }
                  : sub
              ),
            }
          : s
      )
    );

  const moveSubBlock = (i: number, sIdx: number, bId: string, dir: -1 | 1) =>
    upd((p) =>
      p.map((s, idx) =>
        idx === i
          ? {
              ...s,
              subtitles: s.subtitles.map((sub, si) => {
                if (si !== sIdx) return sub;
                const blocks = [...sub.blocks];
                const bIdx = blocks.findIndex((b) => b.id === bId);
                const target = bIdx + dir;
                if (target < 0 || target >= blocks.length) return sub;
                [blocks[bIdx], blocks[target]] = [blocks[target], blocks[bIdx]];
                return { ...sub, blocks };
              }),
            }
          : s
      )
    );

  return {
    addStep, insertStep, removeStep, changeTitle,
    addBlock, removeBlock, changeBlock, moveBlock,
    addSub, removeSub, changeSubTitle,
    addSubBlock, removeSubBlock, changeSubBlock, moveSubBlock,
  };
}

// ─── Block type meta ─────────────────────────────────────────────────────────
const BLOCK_META: Record<ContentBlock['type'], { label: string; color: string }> = {
  text: { label: 'TXT', color: 'text-blue-400 border-blue-500/30 bg-blue-500/5' },
  code: { label: 'CODE', color: 'text-primary-container border-primary-container/30 bg-primary-container/5' },
  image: { label: 'IMG', color: 'text-purple-400 border-purple-500/30 bg-purple-500/5' },
};

// ─── BlockRow: renders a single content block with move controls ─────────────
function BlockRow({
  block,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
  onChangeContent,
  stepTitle,
}: {
  block: ContentBlock;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onChangeContent: (v: string) => void;
  stepTitle?: string;
}) {
  const meta = BLOCK_META[block.type];

  return (
    <div className={`flex gap-2 items-stretch rounded border ${meta.color} p-2`}>
      {/* Left: type badge + move controls */}
      <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${meta.color} uppercase leading-none`}>
          {meta.label}
        </span>
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          title="Move up"
          className="p-0.5 text-on-surface-variant hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          title="Move down"
          className="p-0.5 text-on-surface-variant hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Center: content */}
      <div className="flex-grow min-w-0">
        {block.type === 'text' && (
          <textarea
            placeholder="Tulis penjelasan di sini..."
            value={block.content}
            onChange={(e) => onChangeContent(e.target.value)}
            className="command-input min-h-[90px] text-sm w-full"
          />
        )}
        {block.type === 'code' && (
          <CodeTextarea
            value={block.content}
            onChange={onChangeContent}
            placeholder="Masukkan code snippet di sini..."
            className="command-input pl-3 pr-3 w-full"
            minHeight="110px"
          />
        )}
        {block.type === 'image' && (
          <div className="space-y-2">
            <input
              type="url"
              placeholder="URL gambar (https://...)"
              value={block.content}
              onChange={(e) => onChangeContent(e.target.value)}
              className="command-input py-1.5 text-xs w-full"
            />
            <ImageUpload
              value={block.content}
              onChange={onChangeContent}
              onRemove={() => onChangeContent('')}
            />
            {block.content && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={block.content}
                alt={stepTitle ? `Preview: ${stepTitle}` : 'Image preview'}
                className="max-h-[140px] rounded border border-outline-variant/20 object-contain bg-black/30"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>
        )}
      </div>

      {/* Right: remove */}
      <button
        type="button"
        onClick={onRemove}
        title="Remove"
        className="shrink-0 p-1 text-on-surface-variant hover:text-red-400 transition-colors self-start mt-0.5"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Add-block toolbar ───────────────────────────────────────────────────────
function AddBlockBar({
  onAdd,
  size = 'md',
}: {
  onAdd: (type: ContentBlock['type']) => void;
  size?: 'sm' | 'md';
}) {
  const cls = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-0.5';
  return (
    <div className="flex flex-wrap gap-1.5">
      <button type="button" onClick={() => onAdd('text')}
        className={`font-mono text-blue-400 border border-blue-500/20 rounded hover:bg-blue-500/10 transition-colors flex items-center gap-1 ${cls}`}>
        <AlignLeft className="w-3 h-3" /> + TEXT
      </button>
      <button type="button" onClick={() => onAdd('code')}
        className={`font-mono text-primary-container border border-primary-container/20 rounded hover:bg-primary-container/10 transition-colors flex items-center gap-1 ${cls}`}>
        <Code className="w-3 h-3" /> + CODE
      </button>
      <button type="button" onClick={() => onAdd('image')}
        className={`font-mono text-purple-400 border border-purple-500/20 rounded hover:bg-purple-500/10 transition-colors flex items-center gap-1 ${cls}`}>
        <ImageIcon className="w-3 h-3" /> + IMAGE
      </button>
    </div>
  );
}

// ─── SubstepCard ─────────────────────────────────────────────────────────────
function SubstepCard({
  sub, stepIdx, subIdx,
  h, prefix,
}: {
  sub: SubstepItem;
  stepIdx: number;
  subIdx: number;
  h: ReturnType<typeof makeHandlers>;
  prefix: string;
}) {
  return (
    <div className="p-4 rounded border border-outline-variant/10 bg-surface-container-low/30 space-y-3 relative">
      <div className="flex justify-between items-center">
        <span className="font-mono text-[10px] text-primary-container/60 uppercase tracking-widest">
          sub_{prefix.toLowerCase()}[#{subIdx + 1}]
        </span>
        <button type="button" onClick={() => h.removeSub(stepIdx, subIdx)}
          className="text-on-surface-variant hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Sub title — required */}
      <div>
        <label className="font-mono text-xs text-on-surface-variant/80 mb-1 block">
          title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="Judul sub-langkah..."
          value={sub.title}
          onChange={(e) => h.changeSubTitle(stepIdx, subIdx, e.target.value)}
          className="command-input py-2 text-xs"
        />
      </div>

      {/* Sub blocks */}
      <div className="space-y-2">
        {sub.blocks.map((block, bIdx) => (
          <BlockRow
            key={block.id}
            block={block}
            isFirst={bIdx === 0}
            isLast={bIdx === sub.blocks.length - 1}
            onMoveUp={() => h.moveSubBlock(stepIdx, subIdx, block.id, -1)}
            onMoveDown={() => h.moveSubBlock(stepIdx, subIdx, block.id, 1)}
            onRemove={() => h.removeSubBlock(stepIdx, subIdx, block.id)}
            onChangeContent={(v) => h.changeSubBlock(stepIdx, subIdx, block.id, v)}
            stepTitle={sub.title}
          />
        ))}
      </div>

      {/* Add sub-block */}
      <AddBlockBar onAdd={(type) => h.addSubBlock(stepIdx, subIdx, type)} size="sm" />
    </div>
  );
}

// ─── StepCard ─────────────────────────────────────────────────────────────────
function StepCard({
  step, idx, h, labelPrefix,
}: {
  step: LangkahItem;
  idx: number;
  h: ReturnType<typeof makeHandlers>;
  labelPrefix: string;
}) {
  return (
    <div className="glass-panel p-6 border border-outline-variant/20 relative group hover:border-primary-container/20 transition-all duration-300">
      {/* Badge */}
      <div className="absolute -left-3 top-6 w-8 h-8 rounded bg-primary-container text-black font-mono font-bold flex items-center justify-center text-xs shadow-neon">
        {idx + 1}
      </div>

      {/* Top action bar */}
      <div className="flex justify-between items-center mb-4 pl-4">
        <span className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider">
          {labelPrefix}_DATA_RECORD
        </span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => h.insertStep(idx)}
            className="text-xs font-mono text-primary-container/80 hover:text-primary-container border border-primary-container/20 px-2 py-0.5 rounded transition-all">
            + INSERT_AFTER
          </button>
          <button type="button" onClick={() => h.removeStep(idx)}
            className="text-xs font-mono text-red-400 hover:text-red-500 border border-red-500/20 px-2 py-0.5 rounded transition-all">
            DELETE
          </button>
        </div>
      </div>

      <div className="space-y-4 pl-4">
        {/* Title — required */}
        <div>
          <label className="font-mono text-xs text-on-surface-variant mb-1 block">
            title <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-primary-container">&gt;</span>
            <input
              type="text"
              required
              placeholder="Judul langkah ini..."
              value={step.title}
              onChange={(e) => h.changeTitle(idx, e.target.value)}
              className="command-input pl-8 text-sm"
            />
          </div>
        </div>

        {/* Blocks — in order */}
        {step.blocks.length > 0 && (
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-on-surface-variant/60 uppercase tracking-widest block">
              Content Blocks — drag/reorder with ↑↓
            </label>
            {step.blocks.map((block, bIdx) => (
              <BlockRow
                key={block.id}
                block={block}
                isFirst={bIdx === 0}
                isLast={bIdx === step.blocks.length - 1}
                onMoveUp={() => h.moveBlock(idx, block.id, -1)}
                onMoveDown={() => h.moveBlock(idx, block.id, 1)}
                onRemove={() => h.removeBlock(idx, block.id)}
                onChangeContent={(v) => h.changeBlock(idx, block.id, v)}
                stepTitle={step.title}
              />
            ))}
          </div>
        )}

        {/* Add block toolbar */}
        <div className="border border-dashed border-outline-variant/20 rounded p-2">
          <p className="font-mono text-[10px] text-on-surface-variant/50 mb-2">
            Tambah konten di posisi bawah →
          </p>
          <AddBlockBar onAdd={(type) => h.addBlock(idx, type)} />
        </div>

        {/* Substeps */}
        <div className="border-t border-outline-variant/20 pt-4 mt-2 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-mono text-xs text-white uppercase tracking-wider font-bold">
              Sub-Steps / Sub-Items
            </h4>
            <button type="button" onClick={() => h.addSub(idx)}
              className="text-xs font-mono text-primary-container hover:text-white bg-primary-container/10 hover:bg-primary-container/20 border border-primary-container/30 px-3 py-1 rounded transition-all flex items-center gap-1">
              <Plus className="w-3 h-3" /> ADD_SUBSTEP
            </button>
          </div>

          {step.subtitles.map((sub, sIdx) => (
            <SubstepCard key={sIdx} sub={sub} stepIdx={idx} subIdx={sIdx} h={h} prefix={labelPrefix} />
          ))}

          {step.subtitles.length > 0 && (
            <button type="button" onClick={() => h.addSub(idx)}
              className="w-full text-xs font-mono text-primary-container/70 hover:text-primary-container border border-dashed border-primary-container/20 hover:border-primary-container/40 py-2 rounded transition-all flex items-center justify-center gap-1.5">
              <Plus className="w-3 h-3" /> ADD_SUBSTEP_BELOW
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
function AdminFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blogId = searchParams.get('id');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Praktikum');
  const [githubUrl, setGithubUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const [tujuan, setTujuan] = useState<string[]>([]);
  const [dasarTeori, setDasarTeori] = useState('');
  const [alatBahan, setAlatBahan] = useState<AlatBahanItem[]>([]);
  const [langkahKerja, setLangkahKerja] = useState<LangkahItem[]>([]);
  const [latihanTugas, setLatihanTugas] = useState<LangkahItem[]>([]);
  const [kesimpulan, setKesimpulan] = useState('');

  const [activeTab, setActiveTab] = useState('tujuan');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const { toast, showToast, setToast } = useToast();

  const lk = makeHandlers(setLangkahKerja);
  const lt = makeHandlers(setLatihanTugas);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) { router.push('/admin'); return; }
      if (blogId) {
        loadBlogData(blogId);
      } else {
        setTujuan(['']);
        setAlatBahan([{ name: '', icon: 'laptop' }]);
        setLangkahKerja([{ title: '', blocks: [], subtitles: [] }]);
        setLatihanTugas([{ title: '', blocks: [], subtitles: [] }]);
      }
    };
    checkAuth();
  }, [blogId, router]);

  const loadBlogData = async (id: string) => {
    setFetching(true);
    try {
      const { data, error } = await supabaseClient.from('blogs').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        setTitle(data.title ?? '');
        setDescription(data.description ?? '');
        setSubject(data.subject ?? 'Praktikum');
        setGithubUrl(data.github_url ?? '');
        setCoverUrl(data.cover_url ?? '');
        setIsPublished(data.is_published ?? false);

        let contentObj: any = null;
        if (data.content) {
          contentObj = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
        }

        if (contentObj?.format === 'structured') {
          const s = contentObj as StructuredContent;
          setTujuan(s.tujuan ?? []);
          setDasarTeori(s.dasar_teori ?? '');
          setAlatBahan(s.alat_bahan ?? []);
          setLangkahKerja((s.langkah_kerja ?? []).map(normaliseStep));
          setLatihanTugas((s.latihan_tugas ?? []).map(normaliseStep));
          setKesimpulan(s.kesimpulan ?? '');
        } else if (Array.isArray(contentObj)) {
          setLangkahKerja(contentObj.map(normaliseStep));
          setTujuan(['']); setDasarTeori('');
          setAlatBahan([{ name: '', icon: 'laptop' }]);
          setLatihanTugas([{ title: '', blocks: [], subtitles: [] }]);
          setKesimpulan('');
        } else {
          setTujuan(['']);
          setAlatBahan([{ name: '', icon: 'laptop' }]);
          setLangkahKerja([{ title: '', blocks: [], subtitles: [] }]);
          setLatihanTugas([{ title: '', blocks: [], subtitles: [] }]);
        }
      }
    } catch (err: any) {
      showToast('Gagal memuat data: ' + err.message, 'error');
      setTimeout(() => router.push('/admin/dashboard'), 1500);
    } finally {
      setFetching(false);
    }
  };

  // Tujuan
  const handleAddTujuan = () => setTujuan((p) => [...p, '']);
  const handleRemoveTujuan = (i: number) => setTujuan((p) => p.filter((_, idx) => idx !== i));
  const handleTujuanChange = (i: number, v: string) =>
    setTujuan((p) => p.map((x, idx) => (idx === i ? v : x)));

  // Alat & Bahan
  const handleAddAlatBahan = () => setAlatBahan((p) => [...p, { name: '', icon: 'laptop' }]);
  const handleRemoveAlatBahan = (i: number) => setAlatBahan((p) => p.filter((_, idx) => idx !== i));
  const handleAlatBahanChange = (i: number, field: keyof AlatBahanItem, v: string) =>
    setAlatBahan((p) => p.map((x, idx) => (idx === i ? { ...x, [field]: v } : x)));

  // Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { showToast('Judul artikel wajib diisi.', 'error'); return; }
    setLoading(true);

    const cleanBlock = (b: ContentBlock) => ({ type: b.type, content: b.content.trim() });
    const isBlockFilled = (b: ContentBlock) => b.content.trim().length > 0;

    const cleanSub = (sub: SubstepItem) => {
      const blocks = sub.blocks.filter(isBlockFilled).map(cleanBlock);
      const texts = blocks.filter((b) => b.type === 'text').map((b) => b.content);
      const codes = blocks.filter((b) => b.type === 'code').map((b) => b.content);
      const images = blocks.filter((b) => b.type === 'image').map((b) => b.content);
      return {
        title: sub.title.trim(),
        blocks,
        // backward compat fields
        texts, text: texts.join('\n\n'),
        codes, code: codes[0] ?? '',
        images,
      };
    };

    const cleanStep = (step: LangkahItem) => {
      const blocks = step.blocks.filter(isBlockFilled).map(cleanBlock);
      const texts = blocks.filter((b) => b.type === 'text').map((b) => b.content);
      const codes = blocks.filter((b) => b.type === 'code').map((b) => b.content);
      const images = blocks.filter((b) => b.type === 'image').map((b) => b.content);
      const subtitles = step.subtitles.map(cleanSub).filter(
        (s) => s.title || s.blocks.length > 0
      );
      return {
        title: step.title.trim(),
        blocks,
        subtitles,
        // backward compat fields
        texts, text: texts.join('\n\n'),
        codes, code: codes[0] ?? '',
        images,
      };
    };

    const payloadContent: StructuredContent = {
      format: 'structured',
      tujuan: tujuan.map((t) => t.trim()).filter(Boolean),
      dasar_teori: dasarTeori.trim(),
      alat_bahan: alatBahan
        .map((ab) => ({ name: ab.name.trim(), icon: ab.icon.trim() }))
        .filter((ab) => ab.name),
      langkah_kerja: langkahKerja
        .map(cleanStep)
        .filter((s) => s.title || s.blocks.length > 0) as any,
      latihan_tugas: latihanTugas
        .map(cleanStep)
        .filter((s) => s.title || s.blocks.length > 0) as any,
      kesimpulan: kesimpulan.trim(),
    };

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      subject: subject.trim() || 'Praktikum',
      github_url: githubUrl.trim() || null,
      cover_url: coverUrl.trim() || null,
      is_published: isPublished,
      content: payloadContent,
    };

    try {
      let result;
      if (blogId) {
        result = await supabaseClient.from('blogs').update(payload).eq('id', blogId);
      } else {
        result = await supabaseClient.from('blogs').insert([payload]);
      }
      if (result.error) throw result.error;
      showToast('Artikel berhasil disimpan!', 'success');
      setTimeout(() => { router.push('/admin/dashboard'); router.refresh(); }, 1500);
    } catch (err: any) {
      showToast('Gagal menyimpan artikel: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic tab numbering
  const sectionHasContent: Record<string, boolean> = {
    tujuan: tujuan.filter(Boolean).length > 0,
    dasar_teori: dasarTeori.trim().length > 0,
    alat_bahan: alatBahan.filter((a) => a.name.trim()).length > 0,
    langkah_kerja: langkahKerja.some((s) => s.title.trim()),
    latihan_tugas: latihanTugas.some((s) => s.title.trim()),
    kesimpulan: kesimpulan.trim().length > 0,
  };

  const ALL_SECTIONS = [
    { id: 'tujuan', label: 'TUJUAN' },
    { id: 'dasar_teori', label: 'DASAR TEORI' },
    { id: 'alat_bahan', label: 'ALAT & BAHAN' },
    { id: 'langkah_kerja', label: 'LANGKAH KERJA' },
    { id: 'latihan_tugas', label: 'LATIHAN & TUGAS' },
    { id: 'kesimpulan', label: 'KESIMPULAN' },
  ];

  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  let counter = 0;
  const tabs = ALL_SECTIONS.map((sec) => {
    const hasContent = sectionHasContent[sec.id];
    const numLabel = hasContent ? `${ROMAN[counter++]}. ${sec.label}` : sec.label;
    return { ...sec, numLabel, hasContent };
  });

  if (fetching) {
    return (
      <div className="cyber-grid min-h-screen py-12 flex items-center justify-center relative">
        <div className="text-center font-mono text-sm text-on-surface-variant flex flex-col items-center gap-3 relative z-10">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-container" />
          <span>INITIALIZING_RECORD_EDITOR...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-grid min-h-screen py-12 relative w-full">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop relative z-10 w-full">

        {/* Back link */}
        <Link href="/admin/dashboard"
          className="inline-flex items-center gap-2 font-mono text-sm text-on-surface-variant hover:text-primary-container transition-colors mb-8 group uppercase">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>RETURN_TO_DASHBOARD</span>
        </Link>

        {/* Page title */}
        <div className="mb-10 border-l-4 border-primary-container pl-6 py-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-mono text-2xl md:text-3xl text-white">
              {blogId ? 'Edit Structured Article' : 'Create Structured Article'}{' '}
              <span className="text-primary-container">_</span>
            </h1>
            <p className="font-sans text-xs md:text-sm text-on-surface-variant mt-1 uppercase tracking-wider font-mono">
              {blogId ? `RECORD_ID: ${blogId}` : 'RECORD_STATE: NEW_ENTRY'}
            </p>
          </div>
          <button onClick={handleSave} disabled={loading}
            className="btn-neon flex items-center gap-2 py-2.5 px-6 self-start md:self-auto">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'SAVING_RECORD...' : 'SAVE_RECORD'}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Metadata */}
          <div className="glass-panel p-6 md:p-8 border border-outline-variant/30 space-y-6">
            <h2 className="font-mono text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <FolderOpen className="w-4 h-4 text-primary-container" />
              METADATA_SPECIFICATION
            </h2>

            <div>
              <label htmlFor="title" className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">--title</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-primary-container">&gt;</span>
                <input type="text" id="title" required placeholder="Judul Artikel Utama"
                  value={title} onChange={(e) => setTitle(e.target.value)} className="command-input pl-8" />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">--description</label>
              <div className="relative">
                <span className="absolute left-3 top-3 font-mono text-sm text-primary-container">&gt;</span>
                <textarea id="description" placeholder="Deskripsi singkat atau ringkasan artikel..."
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  className="command-input pl-8 min-h-[80px]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="subject" className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">--subject</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-primary-container">&gt;</span>
                  <input type="text" id="subject" placeholder="Contoh: Praktikum, Cybersecurity"
                    value={subject} onChange={(e) => setSubject(e.target.value)} className="command-input pl-8" />
                </div>
              </div>
              <div>
                <label htmlFor="githubUrl" className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">--github-url</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-primary-container">&gt;</span>
                  <input type="url" id="githubUrl" placeholder="https://github.com/..."
                    value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="command-input pl-8" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="coverUrl" className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">--cover-url</label>
              <div className="relative flex-grow mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-primary-container pointer-events-none">&gt;</span>
                <input type="url" id="coverUrl" placeholder="https://..."
                  value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="command-input pl-8" />
              </div>
              <ImageUpload value={coverUrl} onChange={setCoverUrl} label="Upload Cover Image" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="isPublished" checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded bg-black border border-outline-variant focus:ring-primary-container/30 text-primary-container w-4 h-4 cursor-pointer" />
              <label htmlFor="isPublished" className="font-mono text-xs text-white uppercase tracking-wider cursor-pointer select-none">
                PUBLISH_TO_LIVE_WEBSITE
              </label>
            </div>
          </div>

          {/* Structured Content */}
          <div className="glass-panel p-6 md:p-8 border border-outline-variant/20 flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <Terminal className="w-4 h-4 text-primary-container" />
              <h2 className="font-mono text-base font-bold text-white uppercase">
                Structured Content Sections Editor
              </h2>
            </div>

            <p className="font-mono text-[10px] text-on-surface-variant/60 -mt-2">
              * Penomoran section otomatis muncul jika ada konten. Blok konten (TEXT / CODE / IMG) dapat dipindah posisinya dengan ↑↓.
            </p>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-outline-variant/30 pb-4">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 font-mono text-xs uppercase border transition-all rounded relative ${
                      isActive
                        ? 'bg-primary-container text-black border-primary-container font-bold shadow-neon'
                        : 'border-outline-variant/30 text-on-surface-variant hover:border-primary-container/30 hover:text-white'
                    }`}>
                    {tab.numLabel}
                    {tab.hasContent && !isActive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary-container" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab panels */}
            <div className="min-h-[300px]">

              {/* Tujuan */}
              {activeTab === 'tujuan' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                      Objectives List <span className="text-on-surface-variant/40 normal-case font-normal">(opsional)</span>
                    </span>
                    <button type="button" onClick={handleAddTujuan}
                      className="btn-neon-outline flex items-center gap-1.5 py-1 px-3 text-xs font-mono">
                      <Plus className="w-3.5 h-3.5" /> ADD_OBJECTIVE
                    </button>
                  </div>
                  {tujuan.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="relative flex-grow">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-primary-container">
                          tujuan[#{idx + 1}] &gt;
                        </span>
                        <input type="text" placeholder="Masukkan tujuan praktikum..."
                          value={item} onChange={(e) => handleTujuanChange(idx, e.target.value)}
                          className="command-input pl-28 text-sm" />
                      </div>
                      <button type="button" onClick={() => handleRemoveTujuan(idx)}
                        className="p-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {tujuan.length === 0 && (
                    <p className="font-mono text-xs text-on-surface-variant italic">
                      Belum ada poin tujuan. Klik ADD_OBJECTIVE untuk menambahkan.
                    </p>
                  )}
                </div>
              )}

              {/* Dasar Teori */}
              {activeTab === 'dasar_teori' && (
                <div className="space-y-2">
                  <label className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-2 block">
                    Dasar Teori Text <span className="text-on-surface-variant/40 normal-case font-normal">(opsional)</span>
                  </label>
                  <textarea placeholder="Masukkan landasan teori/dasar teori..."
                    value={dasarTeori} onChange={(e) => setDasarTeori(e.target.value)}
                    className="command-input min-h-[300px] text-sm font-sans" />
                </div>
              )}

              {/* Alat & Bahan */}
              {activeTab === 'alat_bahan' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                      Equipment &amp; Tools <span className="text-on-surface-variant/40 normal-case font-normal">(opsional)</span>
                    </span>
                    <button type="button" onClick={handleAddAlatBahan}
                      className="btn-neon-outline flex items-center gap-1.5 py-1 px-3 text-xs font-mono">
                      <Plus className="w-3.5 h-3.5" /> ADD_TOOL
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {alatBahan.map((item, idx) => (
                      <div key={idx} className="p-4 rounded border border-outline-variant/20 bg-surface-container-low/40 flex flex-col gap-3 relative">
                        <button type="button" onClick={() => handleRemoveAlatBahan(idx)}
                          className="absolute right-3 top-3 text-on-surface-variant hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div>
                          <label className="font-mono text-[10px] text-on-surface-variant/80 uppercase block mb-1">Tool Name</label>
                          <input type="text" required placeholder="Contoh: Laptop"
                            value={item.name} onChange={(e) => handleAlatBahanChange(idx, 'name', e.target.value)}
                            className="command-input py-1.5 text-xs" />
                        </div>
                        <div>
                          <label className="font-mono text-[10px] text-on-surface-variant/80 uppercase block mb-1">Icon</label>
                          <select value={item.icon} onChange={(e) => handleAlatBahanChange(idx, 'icon', e.target.value)}
                            className="command-input py-1.5 text-xs bg-background">
                            <option value="laptop">Laptop (Mac/Windows)</option>
                            <option value="code">VS Code / Editor</option>
                            <option value="browser">Browser / Chrome / Firefox</option>
                            <option value="terminal">Terminal / CLI</option>
                            <option value="wifi">Koneksi Internet</option>
                            <option value="database">Database (SQL/Supabase)</option>
                            <option value="cpu">Processor / CPU</option>
                            <option value="settings">Konfigurasi / Setup</option>
                            <option value="shield">Security / Key</option>
                            <option value="file">Dokumen / generic</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                  {alatBahan.length === 0 && (
                    <p className="font-mono text-xs text-on-surface-variant italic">
                      Belum ada alat &amp; bahan. Klik ADD_TOOL.
                    </p>
                  )}
                </div>
              )}

              {/* Langkah Kerja */}
              {activeTab === 'langkah_kerja' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                      Procedural Steps <span className="text-on-surface-variant/40 normal-case font-normal">(opsional)</span>
                    </span>
                    <button type="button" onClick={lk.addStep}
                      className="btn-neon-outline flex items-center gap-1.5 py-1 px-3 text-xs font-mono">
                      <Plus className="w-3.5 h-3.5" /> ADD_STEP
                    </button>
                  </div>
                  <div className="space-y-6">
                    {langkahKerja.map((step, idx) => (
                      <StepCard key={idx} step={step} idx={idx} h={lk} labelPrefix="STEP" />
                    ))}
                  </div>
                  <button type="button" onClick={lk.addStep}
                    className="btn-neon-outline flex items-center gap-1.5 py-2.5 px-6 font-semibold">
                    <Plus className="w-4 h-4" /> ADD_NEXT_STEP
                  </button>
                </div>
              )}

              {/* Latihan & Tugas */}
              {activeTab === 'latihan_tugas' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                      Exercises &amp; Assignments <span className="text-on-surface-variant/40 normal-case font-normal">(opsional)</span>
                    </span>
                    <button type="button" onClick={lt.addStep}
                      className="btn-neon-outline flex items-center gap-1.5 py-1 px-3 text-xs font-mono">
                      <Plus className="w-3.5 h-3.5" /> ADD_TASK
                    </button>
                  </div>
                  <div className="space-y-6">
                    {latihanTugas.map((task, idx) => (
                      <StepCard key={idx} step={task} idx={idx} h={lt} labelPrefix="TASK" />
                    ))}
                  </div>
                  <button type="button" onClick={lt.addStep}
                    className="btn-neon-outline flex items-center gap-1.5 py-2.5 px-6 font-semibold">
                    <Plus className="w-4 h-4" /> ADD_NEXT_TASK
                  </button>
                </div>
              )}

              {/* Kesimpulan */}
              {activeTab === 'kesimpulan' && (
                <div className="space-y-2">
                  <label className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-2 block">
                    Kesimpulan Text <span className="text-on-surface-variant/40 normal-case font-normal">(opsional)</span>
                  </label>
                  <textarea placeholder="Masukkan poin kesimpulan akhir dari praktikum..."
                    value={kesimpulan} onChange={(e) => setKesimpulan(e.target.value)}
                    className="command-input min-h-[250px] text-sm font-sans" />
                </div>
              )}
            </div>
          </div>

          {/* Bottom save bar */}
          <div className="flex justify-between items-center border-t border-outline-variant/20 pt-6">
            <span className="font-mono text-xs text-on-surface-variant italic">
              * Hanya judul artikel yang wajib diisi. Section kosong tidak akan ditampilkan.
            </span>
            <button type="submit" disabled={loading}
              className="btn-neon flex items-center gap-2 py-2.5 px-6 font-bold uppercase">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'SAVING_RECORD...' : 'SAVE_RECORD'}
            </button>
          </div>
        </form>
      </div>

      {toast && <ToastComponent toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function AdminFormPage() {
  return (
    <Suspense fallback={
      <div className="cyber-grid min-h-screen py-12 flex items-center justify-center relative">
        <div className="text-center font-mono text-sm text-on-surface-variant flex flex-col items-center gap-3 relative z-10">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-container" />
          <span>LOADING_EDITOR_DEPENDENCIES...</span>
        </div>
      </div>
    }>
      <AdminFormContent />
    </Suspense>
  );
}
