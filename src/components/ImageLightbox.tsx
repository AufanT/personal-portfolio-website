'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, ExternalLink, X, ZoomIn, ZoomOut } from 'lucide-react';

interface LightboxImage {
  src: string;
  alt: string;
}

/**
 * Preview gambar layar penuh untuk semua <ReportImage> di dalam `children`.
 *
 * Klik ditangkap lewat event delegation pada elemen [data-lightbox-src], dan
 * daftar gambar diambil dari DOM saat dibuka — urutannya sama dengan urutan
 * di laporan, jadi tombol sebelumnya/berikutnya mengikuti alur membaca.
 *
 * Mode "pas layar" menampilkan gambar utuh; mode "ukuran asli" menampilkan
 * gambar 1:1 dan bisa di-scroll, berguna untuk membaca teks kecil di
 * screenshot kode.
 */
export default function ImageLightbox({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const [images, setImages] = useState<LightboxImage[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const [actualSize, setActualSize] = useState(false);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const open = index !== null;
  const current = open ? images[index] : null;

  const handleClick = (e: React.MouseEvent) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-lightbox-src]');
    if (!trigger || !containerRef.current?.contains(trigger)) return;

    const triggers = Array.from(containerRef.current.querySelectorAll<HTMLElement>('[data-lightbox-src]'));
    setImages(
      triggers.map((el) => ({
        src: el.dataset.lightboxSrc ?? '',
        alt: el.dataset.lightboxAlt ?? '',
      }))
    );
    triggerRef.current = trigger;
    setActualSize(false);
    setDimensions(null);
    setImageLoaded(false);
    setIndex(Math.max(0, triggers.indexOf(trigger)));
  };

  const close = useCallback(() => {
    setIndex(null);
    // Kembalikan fokus ke gambar yang tadi diklik (penting untuk pengguna keyboard).
    triggerRef.current?.focus();
  }, []);

  const go = useCallback(
    (step: number) => {
      if (images.length < 2) return;
      setIndex((i) => (i === null ? i : (i + step + images.length) % images.length));
      setActualSize(false);
      setDimensions(null);
      setImageLoaded(false);
    },
    [images.length]
  );

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);

    // Kunci scroll halaman di belakang. Layout memasang overflow-y-auto pada
    // <html>, jadi keduanya (html dan body) harus dikunci.
    const html = document.documentElement;
    const prev = { html: html.style.overflow, body: document.body.style.overflow };
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', onKey);
      html.style.overflow = prev.html;
      document.body.style.overflow = prev.body;
    };
  }, [open, close, go]);

  const overlay =
    index !== null && current ? (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preview gambar ${index + 1} dari ${images.length}`}
        className="fixed inset-0 z-[1000] flex flex-col bg-black/90 backdrop-blur-sm"
        onClick={(e) => {
          // Klik di area kosong (bukan gambar atau tombol) menutup preview.
          if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.lightboxBackdrop) close();
        }}
      >
        {/* Bar atas */}
        <div className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-mono text-xs border-b border-white/5 bg-black/40">
          <span className="shrink-0 text-primary-container">
            {index + 1} / {images.length}
          </span>
          <span className="truncate flex-grow" title={current.alt}>
            {current.alt}
            {dimensions && <span className="ml-2 opacity-60">{dimensions.w}×{dimensions.h}px</span>}
          </span>
          <button
            type="button"
            onClick={() => setActualSize((v) => !v)}
            className="lightbox-btn"
            title={actualSize ? 'Pas layar' : 'Ukuran asli (100%)'}
            aria-label={actualSize ? 'Pas layar' : 'Ukuran asli (100%)'}
          >
            {actualSize ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>
          <a
            href={current.src}
            target="_blank"
            rel="noopener noreferrer"
            className="lightbox-btn"
            title="Buka gambar asli di tab baru"
            aria-label="Buka gambar asli di tab baru"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button ref={closeButtonRef} type="button" onClick={close} className="lightbox-btn" title="Tutup (Esc)" aria-label="Tutup">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Area gambar */}
        <div
          data-lightbox-backdrop="true"
          className={`relative flex-grow min-h-0 ${actualSize ? 'overflow-auto' : 'flex items-center justify-center overflow-hidden'} p-4 md:p-8`}
        >
          {/* Gambar versi penuh bisa beberapa MB; skeleton menahan tempatnya
              supaya layar tidak kosong menghitam saat menunggu. */}
          {!imageLoaded && (
            <span
              aria-hidden="true"
              className="skeleton absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,900px)] aspect-[16/10] rounded-lg"
            />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current.src}
            src={current.src}
            alt={current.alt}
            onLoad={(e) => {
              setDimensions({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });
              setImageLoaded(true);
            }}
            onClick={() => setActualSize((v) => !v)}
            className={`${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 ${
              actualSize
                ? 'max-w-none mx-auto cursor-zoom-out'
                : 'max-w-full max-h-full object-contain cursor-zoom-in select-none'
            }`}
          />
        </div>

        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className="lightbox-nav left-3" aria-label="Gambar sebelumnya">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button type="button" onClick={() => go(1)} className="lightbox-nav right-3" aria-label="Gambar berikutnya">
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    ) : null;

  return (
    <div ref={containerRef} onClick={handleClick}>
      {children}
      {/* Portal ke <body> agar overlay tidak terpotong oleh section ber-overflow-hidden. */}
      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </div>
  );
}
