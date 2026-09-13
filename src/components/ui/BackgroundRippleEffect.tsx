'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toggleMusic, useMusicPlaying } from '@/lib/music';

const CELL_SIZE = 44;
const BORDER_COLOR = 'rgba(57, 255, 20, 0.22)';
const FILL_COLOR = 'rgba(57, 255, 20, 0.1)';

type CellStyle = React.CSSProperties & {
  '--delay'?: string;
  '--duration'?: string;
};

interface Cell {
  row: number;
  col: number;
}

export type FadeEdge = 'top' | 'bottom' | 'left' | 'right';

/**
 * Gradasi pudar per tepi. Tepi bawah adalah efek asli hero: grid penuh sampai
 * 55% lalu memudar ke transparan. Tinggi hero ±100vh, jadi panjang pudarnya
 * ±45vh dengan titik 0,3 di 20vh dari tepi. Tepi lain memakai ukuran vh yang
 * sama agar pudar horizontal terlihat identik dengan pudar vertikal hero,
 * berapa pun lebar panelnya.
 */
const FADE_GRADIENTS: Record<FadeEdge, string> = {
  bottom: 'linear-gradient(to bottom, black 55%, rgba(0,0,0,0.3) 80%, transparent 100%)',
  top: 'linear-gradient(to top, black calc(100% - 45vh), rgba(0,0,0,0.3) calc(100% - 20vh), transparent 100%)',
  left: 'linear-gradient(to right, transparent 0, rgba(0,0,0,0.3) 20vh, black 45vh)',
  right: 'linear-gradient(to left, transparent 0, rgba(0,0,0,0.3) 20vh, black 45vh)',
};

function fadeMaskStyle(edges: FadeEdge[]): React.CSSProperties {
  if (edges.length === 0) return {};
  const image = edges.map((edge) => FADE_GRADIENTS[edge]).join(', ');
  return {
    maskImage: image,
    WebkitMaskImage: image,
    // Beberapa gradasi digabung dengan irisan: area terlihat hanya jika tidak
    // pudar di tepi mana pun.
    maskComposite: 'intersect',
    WebkitMaskComposite: 'source-in',
  };
}

/**
 * Grid kotak-kotak. Dibungkus memo: grid bisa berisi ratusan elemen, dan
 * hanya perlu digambar ulang saat ukurannya berubah atau ada klik (ripple) —
 * bukan saat mouse bergerak.
 */
const DivGrid = memo(function DivGrid({
  rows,
  cols,
  clickedCell,
  onCellClick,
}: {
  rows: number;
  cols: number;
  clickedCell: Cell | null;
  onCellClick: (row: number, col: number) => void;
}) {
  const cells = useMemo(() => Array.from({ length: rows * cols }, (_, idx) => idx), [rows, cols]);

  return (
    <div
      className="relative z-[3]"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
        width: cols * CELL_SIZE,
        height: rows * CELL_SIZE,
        marginInline: 'auto',
      }}
    >
      {cells.map((idx) => {
        const rowIdx = Math.floor(idx / cols);
        const colIdx = idx % cols;
        const distance = clickedCell ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx) : 0;

        const style: CellStyle = clickedCell
          ? { '--delay': `${Math.max(0, distance * 55)}ms`, '--duration': `${200 + distance * 80}ms` }
          : {};

        return (
          <div
            key={idx}
            className={
              'border-[0.5px] opacity-40 transition-all duration-150 will-change-transform ' +
              'hover:opacity-100 hover:shadow-[0_0_10px_rgba(57,255,20,0.35)] cursor-pointer' +
              (clickedCell ? ' animate-cell-ripple [animation-fill-mode:none]' : '')
            }
            style={{ backgroundColor: FILL_COLOR, borderColor: BORDER_COLOR, ...style }}
            onClick={() => onCellClick(rowIdx, colIdx)}
          />
        );
      })}
    </div>
  );
});

/**
 * Label "Click to play/pause" yang mengikuti kursor.
 *
 * Komponen terpisah dengan listener DOM langsung: posisi diperbarui lewat
 * style.transform di requestAnimationFrame, tanpa setState per gerakan mouse.
 * Versi lama menyimpan posisi kursor di state milik grid, sehingga setiap
 * piksel gerakan mouse me-render ulang seluruh grid.
 *
 * Dirender lewat portal ke <body>. Grid di panel project berada di dalam track
 * scroll horizontal yang digeser GSAP dengan transform; elemen `fixed` di
 * dalam induk bertransform dihitung relatif terhadap induk itu, sehingga label
 * akan melenceng jauh dari kursor. Portal juga menghindari mask-image grid
 * yang ikut memudarkan label di bagian bawah.
 */
function MusicCursorHint({ targetRef }: { targetRef: React.RefObject<HTMLElement> }) {
  const hintRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const playing = useMusicPlaying();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    let frame = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (hintRef.current) {
          hintRef.current.style.transform = `translate(${e.clientX + 14}px, ${e.clientY - 28}px)`;
        }
      });
    };
    const onEnter = (e: MouseEvent) => {
      setVisible(true);
      onMove(e);
    };
    const onLeave = () => setVisible(false);

    target.addEventListener('mousemove', onMove);
    target.addEventListener('mouseenter', onEnter);
    target.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      target.removeEventListener('mousemove', onMove);
      target.removeEventListener('mouseenter', onEnter);
      target.removeEventListener('mouseleave', onLeave);
    };
  }, [targetRef]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={hintRef}
      aria-hidden="true"
      className={`fixed left-0 top-0 z-[100] pointer-events-none flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono text-primary-container bg-background/80 border border-primary-container/30 backdrop-blur-sm transition-opacity duration-150 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <span className="text-xs leading-none">♪</span>
      <span className="leading-none">{playing ? 'Click to pause' : 'Click to play'}</span>
    </div>,
    document.body
  );
}

/**
 * Latar grid kotak-kotak interaktif: klik memunculkan riak dan (default)
 * memutar/menjeda musik latar. Dipakai di hero, header halaman, panel project,
 * dan panel "Explore More" — cukup `<BackgroundRippleEffect />`.
 *
 * Mengisi induk terdekat yang `position: relative`. Konten di atasnya perlu
 * `relative z-10`; area kosong yang ingin tetap bisa diklik sebaiknya diberi
 * `pointer-events-none`.
 */
export default function BackgroundRippleEffect({
  playMusic = true,
  onCellClick,
  fadeEdges = ['bottom'],
}: {
  /** Klik grid memutar/menjeda musik. Default true. */
  playMusic?: boolean;
  /** Callback tambahan setiap kotak diklik. */
  onCellClick?: () => void;
  /**
   * Tepi yang memudar ke latar gelap. Default ['bottom'] (seperti hero).
   * Panel di scroll horizontal memakai 'left' agar batas antarpanel memudar
   * seperti batas vertikal hero.
   */
  fadeEdges?: FadeEdge[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ cols: 40, rows: 18 });
  const [clickedCell, setClickedCell] = useState<Cell | null>(null);
  const [rippleKey, setRippleKey] = useState(0);

  useEffect(() => {
    const update = () => {
      setDims({
        cols: Math.ceil(window.innerWidth / CELL_SIZE) + 2,
        rows: Math.ceil(window.innerHeight / CELL_SIZE) + 2,
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Stabil antar render agar memo pada DivGrid benar-benar berlaku.
  const onCellClickRef = useRef(onCellClick);
  onCellClickRef.current = onCellClick;

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      setClickedCell({ row, col });
      setRippleKey((k) => k + 1);
      if (playMusic) toggleMusic();
      onCellClickRef.current?.();
    },
    [playMusic]
  );

  const fadeKey = fadeEdges.join(',');
  const maskStyle = useMemo(() => fadeMaskStyle(fadeKey ? (fadeKey.split(',') as FadeEdge[]) : []), [fadeKey]);

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full overflow-hidden" style={maskStyle}>
      <div className="relative h-auto w-auto overflow-hidden opacity-60">
        <DivGrid
          key={rippleKey}
          rows={dims.rows}
          cols={dims.cols}
          clickedCell={clickedCell}
          onCellClick={handleCellClick}
        />
      </div>

      {playMusic && <MusicCursorHint targetRef={containerRef} />}
    </div>
  );
}
