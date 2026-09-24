'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUp, List, X } from 'lucide-react';
import type { TocSection } from '@/components/BlogTOC';

/** Jarak dari atas layar saat melompat ke section, supaya tidak tertutup navbar. */
const SCROLL_OFFSET_PX = 84;

/** Tombol kembali ke atas baru muncul setelah pembaca cukup jauh menggulir. */
const BACK_TO_TOP_AFTER_PX = 700;

/**
 * Bantuan baca laporan khusus layar kecil: bar progres baca, tombol daftar isi
 * melayang, dan tombol kembali ke atas.
 *
 * Di desktop daftar isi sudah tampil permanen di sisi kiri (BlogTOC), jadi
 * seluruh komponen ini disembunyikan pada lg ke atas.
 */
export default function ReportMobileNav({ sections }: { sections: TocSection[] }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0);
      setShowTop(window.scrollY > BACK_TO_TOP_AFTER_PX);

      // Section aktif = yang judulnya terakhir melewati garis atas layar.
      let current = '';
      for (const section of sections) {
        const el = document.getElementById(section.anchor);
        if (el && el.getBoundingClientRect().top <= SCROLL_OFFSET_PX + 8) current = section.anchor;
      }
      setActiveAnchor(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sections]);

  // Panel terbuka: halaman di belakang tidak ikut ter-scroll, Esc menutup.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = { html: html.style.overflow, body: document.body.style.overflow };
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      html.style.overflow = prev.html;
      document.body.style.overflow = prev.body;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const goTo = useCallback((anchor: string) => {
    const el = document.getElementById(anchor);
    if (!el) return;
    setOpen(false);
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET_PX;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const duration = reduceMotion ? 0 : 0.3;

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="toc-sheet"
          className="lg:hidden fixed inset-0 z-[120] flex flex-col justify-end bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Daftar isi laporan"
        >
          <motion.div
            className="bg-surface-container border-t border-primary-container/30 rounded-t-2xl p-5 pb-8 max-h-[70vh] overflow-y-auto scrollbar-cyber"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-sm font-bold text-primary-container uppercase tracking-wider">
                Daftar Isi
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup daftar isi"
                className="p-2 -mr-2 text-on-surface-variant hover:text-primary-container transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col">
              {sections.map((section) => {
                const isActive = activeAnchor === section.anchor;
                return (
                  <button
                    key={section.anchor}
                    type="button"
                    onClick={() => goTo(section.anchor)}
                    className={`flex items-center gap-3 py-3 text-left font-mono text-base border-b border-outline-variant/15 last:border-b-0 transition-colors ${
                      isActive ? 'text-primary-container' : 'text-on-surface'
                    }`}
                  >
                    <span
                      className={`w-8 shrink-0 text-xs font-bold ${
                        isActive ? 'text-primary-container' : 'text-on-surface-variant'
                      }`}
                    >
                      {section.numeral}
                    </span>
                    <span className="flex-grow">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Bar progres baca, menempel tepat di bawah navbar. */}
      <div
        aria-hidden="true"
        className="lg:hidden fixed top-0 left-0 right-0 z-[60] h-0.5 bg-transparent pointer-events-none"
      >
        <div
          className="h-full bg-primary-container shadow-[0_0_8px_rgba(57,255,20,0.6)] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="lg:hidden fixed right-4 bottom-4 z-[110] flex flex-col items-end gap-3">
        {showTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Kembali ke atas"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-surface-container/90 border border-outline-variant text-on-surface-variant backdrop-blur-sm active:scale-95 transition-transform"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        {sections.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Buka daftar isi"
            aria-expanded={open}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-primary-container text-black shadow-neon active:scale-95 transition-transform"
          >
            <List className="w-6 h-6" />
          </button>
        )}
      </div>

      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}
