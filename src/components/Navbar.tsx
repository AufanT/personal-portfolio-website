'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X, Code2, LogIn } from 'lucide-react';
import ScrambleText from '@/components/ScrambleText';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Portfolio', path: '/portofolio' },
  { name: 'Blog', path: '/blog' },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Navbar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [hash, setHash] = useState('');

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Menu selalu tertutup setelah berpindah halaman, termasuk lewat tombol
  // back browser yang tidak melewati onClick link di menu.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Selama menu mobile terbuka: halaman di belakang tidak bisa di-scroll, Esc
  // menutup menu, dan menu ikut tertutup kalau layar melebar ke ukuran desktop.
  useEffect(() => {
    if (!isOpen) return;

    // Layout memasang overflow-y-auto pada <html>, jadi html dan body dikunci.
    const html = document.documentElement;
    const prev = { html: html.style.overflow, body: document.body.style.overflow };
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 768px)');
    const onBreakpoint = (e: MediaQueryListEvent) => {
      if (e.matches) setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onBreakpoint);

    return () => {
      html.style.overflow = prev.html;
      document.body.style.overflow = prev.body;
      window.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onBreakpoint);
    };
  }, [isOpen]);

  // Tombol login dibedakan dari link navigasi biasa lewat latar dan border
  // membulat, tapi memakai tipografi dan animasi yang sama.
  const loginActive = pathname.startsWith('/admin');

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/' && !hash;
    }
    if (path.includes('#')) {
      const linkHash = '#' + path.split('#')[1];
      return pathname === '/' && hash === linkHash;
    }
    return pathname.startsWith(path);
  };

  const close = () => setIsOpen(false);
  const duration = reduceMotion ? 0 : 0.35;

  return (
    <nav aria-label="Main navigation" className="fixed top-0 w-full z-50 py-4">
      {/* Latar menu mobile: transparan, halaman di belakangnya di-blur agar
          perhatian ke menu. Menutupi seluruh layar sehingga ketukan di luar
          link menutup menu; touch-action none mencegah gestur scroll di iOS,
          yang tidak selalu terhenti hanya dengan overflow hidden. */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            className="md:hidden fixed inset-0 z-0 bg-background/40 backdrop-blur-xl [touch-action:none]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration, ease: EASE }}
            onClick={close}
          >
            <motion.ul
              className="flex flex-col gap-2 px-6 pt-24"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.06, delayChildren: reduceMotion ? 0 : 0.05 } },
                hidden: { transition: { staggerChildren: reduceMotion ? 0 : 0.03, staggerDirection: -1 } },
              }}
            >
              {NAV_LINKS.map((link) => (
                <motion.li
                  key={link.name}
                  variants={{
                    hidden: { opacity: 0, y: -12 },
                    visible: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
                  }}
                >
                  <Link
                    href={link.path}
                    onClick={(e) => {
                      e.stopPropagation();
                      close();
                    }}
                    className={`block font-mono text-2xl px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive(link.path)
                        ? 'text-primary-container border-l-4 border-primary-container bg-primary-container/5'
                        : 'text-on-surface hover:text-primary-container'
                    }`}
                  >
                    <ScrambleText>{link.name}</ScrambleText>
                  </Link>
                </motion.li>
              ))}
              <motion.li
                className="pt-4"
                variants={{
                  hidden: { opacity: 0, y: -12 },
                  visible: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
                }}
              >
                <Link
                  href="/admin"
                  onClick={(e) => {
                    e.stopPropagation();
                    close();
                  }}
                  className={`w-full font-mono text-2xl px-4 py-3 rounded-full border flex items-center justify-center gap-2.5 transition-all duration-200 ${
                    loginActive
                      ? 'bg-primary-container text-black border-primary-container'
                      : 'bg-primary-container/10 text-primary-container border-primary-container/40 hover:bg-primary-container hover:text-black'
                  }`}
                >
                  <LogIn className="w-5 h-5" aria-hidden="true" />
                  <ScrambleText>Login</ScrambleText>
                </Link>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-width inner — logo hard left, menu hard right */}
      <div className="relative z-10 w-full px-6 md:px-10 flex justify-between items-center">
        {/* Brand/Logo — far left */}
        <Link
          href="/"
          onClick={close}
          className="font-mono text-xl md:text-2xl font-bold tracking-tighter flex items-center gap-2 group"
        >
          <Code2 className="w-6 h-6 text-primary-container group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-primary-container">Aufan</span>
        </Link>

        {/* Desktop Navigation — far right */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`font-mono text-sm px-4 py-2 rounded transition-all duration-300 ease-in-out active:scale-95 ${
                isActive(link.path)
                  ? 'text-primary-container border-b-2 border-primary-container'
                  : 'text-on-surface-variant hover:text-primary-container'
              }`}
            >
              <ScrambleText>{link.name}</ScrambleText>
            </Link>
          ))}
          <Link
            href="/admin"
            className={`ml-2 font-mono text-sm px-4 py-2 rounded-full border flex items-center gap-2 transition-all duration-300 ease-in-out active:scale-95 ${
              loginActive
                ? 'bg-primary-container text-black border-primary-container shadow-neon'
                : 'bg-primary-container/10 text-primary-container border-primary-container/40 hover:bg-primary-container hover:text-black hover:shadow-neon'
            }`}
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <ScrambleText>Login</ScrambleText>
          </Link>
        </div>

        {/* Mobile Hamburger — ikon berputar dan bertukar saat dibuka/ditutup */}
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
          className="md:hidden relative w-10 h-10 -mr-2 flex items-center justify-center text-on-surface-variant hover:text-primary-container focus:outline-none focus-visible:text-primary-container transition-colors"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={isOpen ? 'close' : 'open'}
              className="flex"
              initial={{ opacity: 0, rotate: isOpen ? -90 : 90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: isOpen ? 90 : -90, scale: 0.6 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: EASE }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </nav>
  );
}
