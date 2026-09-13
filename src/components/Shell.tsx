'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Code2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AdminNavbar from '@/components/AdminNavbar';
import AudioPlayer from '@/components/AudioPlayer';
import Footer from '@/components/Footer';

const EASE = [0.77, 0, 0.18, 1] as const;
const PANEL_DURATION = 0.35;
const PANEL_STAGGER = 0.04;

/**
 * Batas waktu menunggu halaman baru. Server normalnya menjawab ~100 ms; ini
 * hanya jaring pengaman supaya tirai tidak pernah menutup layar selamanya
 * (misalnya jaringan putus, atau redirect yang berakhir di path yang sama).
 */
const NAV_TIMEOUT_MS = 8000;

/**
 * Urutan transisi:
 *   idle → covering   : tirai turun, halaman lama masih tampil di belakangnya
 *        → navigating : tirai sudah menutup penuh, baru router.push dijalankan
 *        → revealing  : halaman baru sudah dirender di belakang tirai, tirai pergi
 *        → idle
 *
 * Versi sebelumnya menjalankan router.push bersamaan dengan tirai mulai turun.
 * Server menjawab jauh lebih cepat (~100 ms) daripada tirai menutup (~700 ms),
 * sehingga halaman lama, fallback loading.tsx, lompatan scroll, dan halaman
 * baru semuanya berganti di depan mata pengunjung sebelum tirai sempat menutup.
 */
type Phase = 'idle' | 'covering' | 'navigating' | 'revealing';

function LoadingOverlay({
  visible,
  onCovered,
  onExitComplete,
}: {
  visible: boolean;
  onCovered: () => void;
  onExitComplete: () => void;
}) {
  const panels = [
    'left-0 bg-primary-container',
    'left-[33.333%] bg-background',
    'right-0 bg-primary-container',
  ];

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {visible && (
        <motion.div key="fullscreen-loader" className="fixed inset-0 z-[999]" aria-hidden="true">
          {panels.map((className, i) => {
            const isLast = i === panels.length - 1;
            return (
              <motion.div
                key={className}
                className={`absolute top-0 w-1/3 h-full ${className}`}
                initial={{ translateY: '-101%' }}
                animate={{ translateY: 0 }}
                exit={{ translateY: '101%' }}
                transition={{ duration: PANEL_DURATION, ease: EASE, delay: i * PANEL_STAGGER }}
                // Panel terakhir punya delay terbesar, jadi saat animasinya
                // selesai layar dijamin tertutup penuh. Callback ini juga
                // terpanggil setelah animasi keluar; pemanggil mengabaikannya
                // lewat pengecekan fase.
                onAnimationComplete={isLast ? onCovered : undefined}
              />
            );
          })}
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, delay: 0.12 }}
          >
            <div className="flex flex-col items-center gap-5 font-mono">
              <div className="relative flex items-center justify-center">
                <Code2 className="w-12 h-12 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]" />
                <motion.span
                  className="absolute text-white text-3xl font-thin drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                  initial={{ opacity: 0, scaleX: 0, rotate: -15 }}
                  animate={{ opacity: [0, 1, 1, 0], scaleX: [0, 1, 1, 0], rotate: [-15, 0, 0, -15] }}
                  transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.1, 0.5, 0.7] }}
                >
                  /
                </motion.span>
              </div>
              <span className="text-sm text-white font-bold tracking-[0.2em]">AUFAN</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [phase, setPhaseState] = useState<Phase>('idle');
  // Salinan fase di ref karena handler klik dan callback animasi bisa berjalan
  // sebelum React sempat me-render ulang dengan state terbaru.
  const phaseRef = useRef<Phase>('idle');
  const pendingHref = useRef<string | null>(null);
  const pathnameAtClick = useRef(pathname);
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const clearWatchdog = useCallback(() => {
    if (watchdog.current) {
      clearTimeout(watchdog.current);
      watchdog.current = null;
    }
  }, []);

  const handleCaptureClick = useCallback(
    (e: React.MouseEvent) => {
      // Hanya klik kiri biasa. Ctrl/Cmd/Shift/Alt+klik dan klik tengah
      // dibiarkan ke browser supaya "buka di tab baru" tetap berfungsi.
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as HTMLElement).closest('a');
      if (!link || !link.getAttribute('href')) return;
      if (link.hasAttribute('download')) return;
      if (link.target && link.target !== '_self') return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Hash atau query di halaman yang sama: biarkan Link menanganinya.
      if (url.pathname === pathname) return;

      // Pengguna yang meminta gerakan minimal di sistem operasinya tidak
      // mendapat tirai; navigasi berjalan normal lewat Link.
      if (reduceMotion) return;

      e.preventDefault();

      // Klik berikutnya selama transisi berjalan diabaikan, bukan diteruskan
      // ke Link — kalau diteruskan, dua navigasi akan saling berebut.
      if (phaseRef.current !== 'idle') return;

      pendingHref.current = url.pathname + url.search + url.hash;
      pathnameAtClick.current = pathname;
      setPhase('covering');

      clearWatchdog();
      watchdog.current = setTimeout(() => {
        console.warn('[Shell] Navigasi terlalu lama, tirai dibuka paksa.');
        if (phaseRef.current === 'covering' || phaseRef.current === 'navigating') {
          setPhase('revealing');
        }
      }, NAV_TIMEOUT_MS);
    },
    [pathname, reduceMotion, setPhase, clearWatchdog]
  );

  /** Dipanggil saat tirai selesai menutup penuh: baru sekarang pindah halaman. */
  const handleCovered = useCallback(() => {
    if (phaseRef.current !== 'covering' || !pendingHref.current) return;
    setPhase('navigating');
    router.push(pendingHref.current);
  }, [router, setPhase]);

  /**
   * Halaman baru siap saat pathname berubah. Ini hanya bisa diandalkan karena
   * src/app/loading.tsx sudah dihapus: tanpa loading boundary, router Next.js
   * mempertahankan halaman lama sampai data halaman baru tiba, lalu mengganti
   * konten dan URL dalam satu commit. Dengan loading.tsx, URL sudah berubah
   * saat yang tampil masih fallback "LOADING_SYSTEM...".
   *
   * useEffect berjalan setelah browser melukis commit tersebut, jadi halaman
   * baru sudah tergambar di belakang tirai sebelum tirai mulai pergi.
   */
  useEffect(() => {
    if (phaseRef.current === 'navigating' && pathname !== pathnameAtClick.current) {
      setPhase('revealing');
    }
  }, [pathname, setPhase]);

  const handleExitComplete = useCallback(() => {
    clearWatchdog();
    pendingHref.current = null;
    setPhase('idle');
  }, [clearWatchdog, setPhase]);

  useEffect(() => clearWatchdog, [clearWatchdog]);

  const isAdmin = pathname.startsWith('/admin') && pathname !== '/admin';
  const overlayVisible = phase === 'covering' || phase === 'navigating';

  // overflow-x-clip pada <main>: elemen yang sesaat menonjol ke samping (mis.
  // animasi masuk framer-motion dengan x: ±20 sebelum terlihat di layar) tidak
  // lagi melebarkan halaman. Browser HP tetap mengizinkan geser horizontal
  // walau <html> overflow-x: hidden, jadi kelebihannya harus dipotong di sini.
  // "clip", bukan "hidden": tidak membuat scroll container, sehingga
  // position: sticky di HorizontalSection tetap bekerja.
  return (
    <div onClickCapture={handleCaptureClick}>
      {isAdmin ? (
        <>
          <AdminNavbar />
          <main id="main-content" className="flex-grow pt-16 flex flex-col min-h-screen overflow-x-clip">
            {children}
          </main>
        </>
      ) : (
        <>
          <Navbar />
          <main id="main-content" className="flex-grow flex flex-col overflow-x-clip">
            {children}
          </main>
          <AudioPlayer />
          <Footer />
        </>
      )}
      <LoadingOverlay
        visible={overlayVisible}
        onCovered={handleCovered}
        onExitComplete={handleExitComplete}
      />
    </div>
  );
}
