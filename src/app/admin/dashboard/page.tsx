'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  FileText,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { supabaseClient } from '@/lib/supabase';
import { useToast, ToastComponent } from '@/components/Toast';
import { motion } from 'framer-motion';

interface Blog {
  id: string;
  title: string;
  description: string;
  subject: string;
  cover_url: string;
  created_at: string;
  is_published: boolean;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { toast, showToast, setToast } = useToast();

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from('blogs')
        .select('id, title, description, subject, cover_url, created_at, is_published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (err: any) {
      showToast('Error fetching blogs: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        router.push('/admin');
        return;
      }
      setUserEmail(session.user?.email || null);
      fetchBlogs();
    };

    initSession();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/admin');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus artikel "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;

    setDeletingId(id);
    try {
      const { error } = await supabaseClient
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBlogs((prev) => prev.filter((blog) => blog.id !== id));
      showToast(`Artikel "${title}" berhasil dihapus.`, 'success');
    } catch (err: any) {
      showToast('Gagal menghapus artikel: ' + err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="cyber-grid min-h-screen py-12 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-mono text-2xl md:text-3xl text-white">
              Blog Management <span className="text-primary-container">_</span>
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1">
              Kelola postingan praktikum dan artikel teknologi Anda.
            </p>
            {userEmail && (
              <p className="font-mono text-xs text-on-surface-variant/60 mt-0.5">
                SYSOP: {userEmail}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              target="_blank"
              className="px-4 py-2 border border-outline-variant/40 hover:border-primary-container hover:text-primary-container text-xs font-mono rounded transition-colors"
            >
              LIVE_VIEW
            </Link>
            <Link
              href="/admin/form"
              className="btn-neon flex items-center gap-2 py-2 px-5"
            >
              <Plus className="w-4 h-4" />
              CREATE_NEW_RECORD
            </Link>
          </div>
        </div>

        {/* Database Table Card */}
        <div className="glass-panel border border-outline-variant/30 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="text-center py-20 font-mono text-sm text-on-surface-variant flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary-container" />
              <span>RETRIEVING_DATABASE_RECORDS...</span>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16 px-6 font-mono border-dashed border-outline-variant/20">
              <Terminal className="w-10 h-10 text-primary-container/45 mx-auto mb-4" />
              <h3 className="text-white text-base font-bold mb-2">NO_RECORDS_FOUND</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-6">
                Belum ada artikel yang tercatat di database. Mulai tulis perjalanan praktikum Anda sekarang.
              </p>
              <Link href="/admin/form" className="btn-neon inline-flex items-center gap-2 py-2 px-4">
                <Plus className="w-4 h-4" />
                WRITE_FIRST_RECORD
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/40 border-b border-outline-variant/30 font-mono text-xs text-primary-container uppercase">
                    <th className="py-4 px-6 font-bold">Record Title / Description</th>
                    <th className="py-4 px-6 font-bold">Subject</th>
                    <th className="py-4 px-6 font-bold">Status</th>
                    <th className="py-4 px-6 font-bold">Date Created</th>
                    <th className="py-4 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-sans text-sm text-on-surface-variant">
                  {blogs.map((blog) => (
                    <tr
                      key={blog.id}
                      className="hover:bg-primary-container/[0.02] transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="text-white font-mono font-semibold mb-1 line-clamp-1">
                          {blog.title}
                        </div>
                        <div className="text-xs line-clamp-1 max-w-md">
                          {blog.description || 'No description provided.'}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs">
                        <span className="bg-surface-container border border-outline-variant/20 px-2.5 py-1 rounded text-on-surface">
                          {blog.subject || 'Tutorial'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs">
                        {blog.is_published ? (
                          <span className="inline-flex items-center gap-1 bg-primary-container/10 text-primary-container border border-primary-container/30 px-2.5 py-1 rounded shadow-[0_0_5px_rgba(57,255,20,0.1)]">
                            <CheckCircle className="w-3.5 h-3.5" />
                            PUBLISHED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2.5 py-1 rounded">
                            <FileText className="w-3.5 h-3.5" />
                            DRAFT
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs">
                        {formatDate(blog.created_at)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <Link
                            href={`/blog/${blog.id}`}
                            target="_blank"
                            title="View live post"
                            className="w-8 h-8 rounded border border-outline-variant/30 hover:border-primary-container/60 hover:text-primary-container flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/form?id=${blog.id}`}
                            title="Edit record"
                            className="w-8 h-8 rounded border border-outline-variant/30 hover:border-blue-400 hover:text-blue-400 flex items-center justify-center transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(blog.id, blog.title)}
                            disabled={deletingId === blog.id}
                            title="Delete record"
                            className="w-8 h-8 rounded border border-outline-variant/30 hover:border-red-500 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            {deletingId === blog.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && <ToastComponent toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
