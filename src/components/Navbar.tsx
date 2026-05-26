'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Code2 } from 'lucide-react';
import ScrambleText from '@/components/ScrambleText';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hash, setHash] = useState('');



  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Portfolio', path: '/portofolio' },
    { name: 'Blog', path: '/blog' },
  ];

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

  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-0 w-full z-50 py-4"
    >
      {/* Full-width inner — logo hard left, menu hard right */}
      <div className="w-full px-6 md:px-10 flex justify-between items-center">
        {/* Brand/Logo — far left */}
        <Link
          href="/"
          className="font-mono text-xl md:text-2xl font-bold tracking-tighter flex items-center gap-2 group"
        >
          <Code2 className="w-6 h-6 text-primary-container group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-primary-container">Aufan</span>
        </Link>

        {/* Desktop Navigation — far right */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
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
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-on-surface-variant hover:text-primary-container focus:outline-none transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 border-b border-primary-container/20 backdrop-blur-xl py-6 px-6 flex flex-col gap-4 shadow-2xl z-40">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className={`font-mono text-base px-4 py-2.5 rounded transition-all duration-200 ${
                isActive(link.path)
                  ? 'text-primary-container border-l-4 border-primary-container'
                  : 'text-on-surface-variant hover:text-primary-container'
              }`}
            >
              <ScrambleText>{link.name}</ScrambleText>
            </Link>
          ))}

        </div>
      )}
    </nav>
  );
}
