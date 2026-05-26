'use client';

import { useState, useLayoutEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Code2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AdminNavbar from '@/components/AdminNavbar';
import AudioPlayer from '@/components/AudioPlayer';
import Footer from '@/components/Footer';

function LoadingOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="fullscreen-loader"
          className="fixed inset-0 z-[999]"
        >
          <motion.div
            className="absolute top-0 left-0 w-1/3 h-full bg-primary-container"
            initial={{ translateY: '-101%' }}
            animate={{ translateY: 0 }}
            exit={{ translateY: '101%' }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.18, 1] }}
          />
          <motion.div
            className="absolute top-0 left-[33.333%] w-1/3 h-full bg-background"
            initial={{ translateY: '-101%' }}
            animate={{ translateY: 0 }}
            exit={{ translateY: '101%' }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.18, 1], delay: 0.06 }}
          />
          <motion.div
            className="absolute top-0 right-0 w-1/3 h-full bg-primary-container"
            initial={{ translateY: '-101%' }}
            animate={{ translateY: 0 }}
            exit={{ translateY: '101%' }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.18, 1], delay: 0.12 }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
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
  const prevPathname = useRef(pathname);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [cachedIsAdmin, setCachedIsAdmin] = useState(
    pathname.startsWith('/admin') && pathname !== '/admin'
  );
  const [loading, setLoading] = useState(false);
  const isTransitioning = useRef(false);

  const handleCaptureClick = useCallback((e: React.MouseEvent) => {
    if (isTransitioning.current) return;

    const link = (e.target as HTMLElement).closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;
    if (link.hostname && link.hostname !== window.location.hostname) return;

    const url = new URL(href, window.location.origin);
    if (url.pathname === pathname) return;

    e.preventDefault();
    isTransitioning.current = true;
    setLoading(true);

    setTimeout(() => {
      router.push(href);
    }, 660);
  }, [pathname, router]);

  useLayoutEffect(() => {
    if (prevPathname.current !== pathname && isTransitioning.current) {
      prevPathname.current = pathname;
      isTransitioning.current = false;
      setDisplayChildren(children);
      setCachedIsAdmin(pathname.startsWith('/admin') && pathname !== '/admin');
      setTimeout(() => setLoading(false), 100);
    }
  }, [pathname, children]);

  useLayoutEffect(() => {
    if (!loading) {
      setDisplayChildren(children);
      setCachedIsAdmin(pathname.startsWith('/admin') && pathname !== '/admin');
    }
  }, [children, loading]);

  return (
    <div onClickCapture={handleCaptureClick}>
      {cachedIsAdmin ? (
        <>
          <AdminNavbar />
          <main id="main-content" className="flex-grow pt-16 flex flex-col min-h-screen">
            {displayChildren}
          </main>
        </>
      ) : (
        <>
          <Navbar />
          <main id="main-content" className="flex-grow flex flex-col">
            {displayChildren}
          </main>
          <AudioPlayer />
          <Footer />
        </>
      )}
      <LoadingOverlay visible={loading} />
    </div>
  );
}
