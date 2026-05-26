'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowRight, ArrowLeft, RefreshCw, KeyRound, Mail } from 'lucide-react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        router.push('/admin/dashboard');
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const errMap: Record<string, string> = {
          'Invalid login credentials': 'Email atau password salah.',
          'Email not confirmed': 'Email belum dikonfirmasi. Cek inbox Anda.',
          'Too many requests': 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
        };
        setErrorMsg(errMap[error.message] || error.message);
        setLoading(false);
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg('Terdapat kesalahan koneksi ke server.');
      setLoading(false);
    }
  };

  return (
    <div className="cyber-grid min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="glass-panel w-full max-w-md p-8 md:p-10 border border-outline-variant/30 relative z-10"
      >
        {/* Shield Icon Decoration */}
        <div className="w-14 h-14 rounded-xl border border-primary-container bg-primary-container/10 flex items-center justify-center text-primary-container shadow-[0_0_15px_rgba(57,255,20,0.2)] mx-auto mb-6">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h2 className="font-mono text-2xl font-bold text-center text-white mb-1">
          SECURE_PORTAL
        </h2>
        <p className="font-sans text-xs text-on-surface-variant text-center mb-8 uppercase tracking-widest">
          ADMIN_IDENT_VERIFICATION
        </p>

        {errorMsg && (
          <div className="mb-6 p-3 rounded border border-red-500/30 bg-red-500/5 font-mono text-xs text-red-400">
            [ACCESS_DENIED]: {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email input */}
          <div>
            <label className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
              disabled={loading}
              className="command-input"
            />
          </div>

          {/* Password input */}
          <div>
            <label className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="command-input"
            />
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full py-3 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  INITIALIZE_HANDSHAKE
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Back Link */}
        <div className="mt-8 pt-6 border-t border-outline-variant/20 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs text-on-surface-variant hover:text-primary-container transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            RETURN_TO_SYSTEM_HOME
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
