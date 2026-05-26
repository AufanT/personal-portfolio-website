'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, FileText, LayoutDashboard, LogOut, FolderKanban, ExternalLink } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase';
import ScrambleText from '@/components/ScrambleText';

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.push('/admin');
    router.refresh();
  };

  const navLinks = [
    { name: 'Blog', path: '/admin/dashboard', icon: FileText },
    { name: 'Portfolio', path: '/admin/portfolio', icon: FolderKanban },
  ];

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-primary-container/20 py-3">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary-container" />
          <Link href="/admin/dashboard" className="font-mono text-sm font-bold text-primary-container">
            ADMIN
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`font-mono text-xs px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                  isActive(link.path)
                    ? 'text-primary-container bg-primary-container/10 border border-primary-container/30'
                    : 'text-on-surface-variant hover:text-primary-container hover:bg-primary-container/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <ScrambleText>{link.name}</ScrambleText>
              </Link>
            );
          })}
          <Link
            href="/"
            className="font-mono text-xs text-on-surface-variant hover:text-primary-container transition-colors px-2 flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            SITE
          </Link>
          <button
            onClick={handleLogout}
            className="font-mono text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
