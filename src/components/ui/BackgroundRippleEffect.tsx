'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';

const CELL_SIZE = 44;
const BORDER_COLOR = 'rgba(57, 255, 20, 0.22)';
const FILL_COLOR = 'rgba(57, 255, 20, 0.1)';

type CellStyle = React.CSSProperties & {
  '--delay'?: string;
  '--duration'?: string;
};

function DivGrid({
  className = '',
  rows,
  cols,
  cellSize = CELL_SIZE,
  borderColor = BORDER_COLOR,
  fillColor = FILL_COLOR,
  clickedCell = null,
  onCellClick = () => {},
  interactive = true,
}: {
  className?: string;
  rows: number;
  cols: number;
  cellSize?: number;
  borderColor?: string;
  fillColor?: string;
  clickedCell: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
}) {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols],
  );

  return (
    <div
      className={`relative z-[3] ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        width: cols * cellSize,
        height: rows * cellSize,
        marginInline: 'auto',
      }}
    >
      {cells.map((idx) => {
        const rowIdx = Math.floor(idx / cols);
        const colIdx = idx % cols;
        const distance = clickedCell
          ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
          : 0;
        const delay = clickedCell ? Math.max(0, distance * 55) : 0;
        const duration = 200 + distance * 80;

        const style: CellStyle = clickedCell
          ? { '--delay': `${delay}ms`, '--duration': `${duration}ms` }
          : {};

        const cls =
          'border-[0.5px] opacity-40 transition-all duration-150 will-change-transform ' +
          'hover:opacity-100 hover:shadow-[0_0_10px_rgba(57,255,20,0.35)] cursor-pointer' +
          (clickedCell ? ' animate-cell-ripple [animation-fill-mode:none]' : '') +
          (!interactive ? ' pointer-events-none' : '');

        return (
          <div
            key={idx}
            className={cls}
            style={{
              backgroundColor: fillColor,
              borderColor: borderColor,
              ...style,
            }}
            onClick={interactive ? () => onCellClick(rowIdx, colIdx) : undefined}
          />
        );
      })}
    </div>
  );
}

export default function BackgroundRippleEffect({
  onCellClick,
}: {
  onCellClick?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ cols: 40, rows: 18 });
  const [clickedCell, setClickedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showHint, setShowHint] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setDims({
        cols: Math.ceil(w / CELL_SIZE) + 2,
        rows: Math.ceil(h / CELL_SIZE) + 2,
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,rgba(0,0,0,0.3)_80%,transparent_100%)]"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowHint(true)}
      onMouseLeave={() => setShowHint(false)}
    >
      <div className="relative h-auto w-auto overflow-hidden opacity-60">
        <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden" />
        <DivGrid
          key={`base-${rippleKey}`}
          className=""
          rows={dims.rows}
          cols={dims.cols}
          cellSize={CELL_SIZE}
          borderColor={BORDER_COLOR}
          fillColor={FILL_COLOR}
          clickedCell={clickedCell}
          onCellClick={(row, col) => {
            setClickedCell({ row, col });
            setRippleKey((k) => k + 1);
            setIsMusicPlaying((p) => !p);
            onCellClick?.();
          }}
          interactive
        />
      </div>

      {showHint && (
        <div
          className="fixed z-[100] pointer-events-none flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono text-primary-container bg-background/80 border border-primary-container/30 backdrop-blur-sm"
          style={{
            left: mousePos.x + 14,
            top: mousePos.y - 28,
          }}
        >
          <span className="text-xs leading-none">♪</span>
          <span className="leading-none">{isMusicPlaying ? 'Click to pause' : 'Click to play'}</span>
        </div>
      )}
    </div>
  );
}
