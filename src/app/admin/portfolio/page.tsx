'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  FolderKanban,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useToast, ToastComponent } from '@/components/Toast';

interface Project {
  id: string;
  title: string;
  category: string;
  category_slug: string;
  status: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
}

export default function AdminPortfolioPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast, showToast, setToast } = useToast();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { projects } = await api.get<{ projects: Project[] }>('/api/projects');
      setProjects(projects);
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) {
        router.push('/admin');
        return;
      }
      showToast(
        err instanceof ApiError ? err.message : 'Gagal memuat project.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Halaman ini kini juga dijaga middleware — dulu /admin/portfolio lolos
    // dari matcher dan hanya mengandalkan pengecekan di sisi browser.
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus project "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeletingId(id);
    try {
      await api.del(`/api/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast(`Project "${title}" berhasil dihapus.`, 'success');
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) {
        router.push('/admin');
        return;
      }
      showToast(
        err instanceof ApiError ? err.message : 'Gagal menghapus project.',
        'error'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="cyber-grid min-h-screen py-12 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-mono text-2xl md:text-3xl text-white">
              Portfolio Management <span className="text-primary-container">_</span>
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1">
              Kelola project portofolio Anda.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/portofolio"
              target="_blank"
              className="px-4 py-2 border border-outline-variant/40 hover:border-primary-container hover:text-primary-container text-xs font-mono rounded transition-colors"
            >
              LIVE_VIEW
            </Link>
            <Link
              href="/admin/portfolio/form"
              className="btn-neon flex items-center gap-2 py-2 px-5"
            >
              <Plus className="w-4 h-4" />
              CREATE_NEW_PROJECT
            </Link>
          </div>
        </div>

        <div className="glass-panel border border-outline-variant/30 overflow-hidden">
          {loading ? (
            <div className="text-center py-20 font-mono text-sm text-on-surface-variant flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary-container" />
              <span>RETRIEVING_PROJECTS...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 px-6 font-mono">
              <FolderKanban className="w-10 h-10 text-primary-container/45 mx-auto mb-4" />
              <h3 className="text-white text-base font-bold mb-2">NO_PROJECTS_FOUND</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-6">
                Belum ada project portofolio. Tambahkan project pertama Anda.
              </p>
              <Link href="/admin/portfolio/form" className="btn-neon inline-flex items-center gap-2 py-2 px-4">
                <Plus className="w-4 h-4" />
                CREATE_FIRST_PROJECT
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/40 border-b border-outline-variant/30 font-mono text-xs text-primary-container uppercase">
                    <th className="py-4 px-6 font-bold">Title</th>
                    <th className="py-4 px-6 font-bold">Category</th>
                    <th className="py-4 px-6 font-bold">Status</th>
                    <th className="py-4 px-6 font-bold">Featured</th>
                    <th className="py-4 px-6 font-bold">Date</th>
                    <th className="py-4 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-sans text-sm text-on-surface-variant">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-primary-container/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-white font-mono font-semibold">{project.title}</span>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs">
                        <span className="bg-surface-container border border-outline-variant/20 px-2.5 py-1 rounded text-on-surface">
                          {project.category || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs">
                        {project.is_published ? (
                          <span className="bg-primary-container/10 text-primary-container border border-primary-container/30 px-2.5 py-1 rounded">
                            {project.status || 'DRAFT'}
                          </span>
                        ) : (
                          <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2.5 py-1 rounded">
                            DRAFT
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs">
                        {project.is_featured ? (
                          <span className="text-primary-container">★ YES</span>
                        ) : (
                          <span className="text-outline">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs">
                        {formatDate(project.created_at)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <Link
                            href={`/portofolio`}
                            target="_blank"
                            className="w-8 h-8 rounded border border-outline-variant/30 hover:border-primary-container/60 hover:text-primary-container flex items-center justify-center transition-colors"
                            title="View on site"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/portfolio/form?id=${project.id}`}
                            className="w-8 h-8 rounded border border-outline-variant/30 hover:border-blue-400 hover:text-blue-400 flex items-center justify-center transition-colors"
                            title="Edit project"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(project.id, project.title)}
                            disabled={deletingId === project.id}
                            className="w-8 h-8 rounded border border-outline-variant/30 hover:border-red-500 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50"
                            title="Delete project"
                          >
                            {deletingId === project.id ? (
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
