'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { supabaseClient } from '@/lib/supabase';
import { useToast, ToastComponent } from '@/components/Toast';
import ImageUpload from '@/components/ImageUpload';

const CATEGORIES = [
  { name: 'Web Development', slug: 'web' },
  { name: 'Mobile App', slug: 'app' },
  { name: 'Machine Learning', slug: 'ml' },
  { name: 'UI/UX', slug: 'ui' },
  { name: 'Cybersecurity', slug: 'security' },
  { name: 'Other', slug: 'other' },
];

export default function PortfolioFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [categorySlug, setCategorySlug] = useState('web');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [demoUrl, setDemoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [details, setDetails] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { toast, showToast, setToast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        router.push('/admin');
        return;
      }
      if (projectId) {
        loadProject(projectId);
      }
    };
    checkAuth();
  }, [projectId, router]);

  const loadProject = async (id: string) => {
    setFetching(true);
    try {
      const { data, error } = await supabaseClient
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setTitle(data.title || '');
        setCategory(data.category || 'Web Development');
        setCategorySlug(data.category_slug || 'web');
        setDescription(data.description || '');
        setImageUrl(data.image_url || '');
        setStatus(data.status || 'DRAFT');
        setDemoUrl(data.demo_url || '');
        setGithubUrl(data.github_url || '');
        setDetails(data.details || '');
        setIsPublished(data.is_published || false);
        setIsFeatured(data.is_featured || false);
      }
    } catch (err: any) {
      showToast('Gagal memuat data: ' + err.message, 'error');
    } finally {
      setFetching(false);
    }
  };

  const handleCategoryChange = (name: string) => {
    setCategory(name);
    const found = CATEGORIES.find((c) => c.name === name);
    if (found) setCategorySlug(found.slug);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Judul project wajib diisi.', 'error');
      return;
    }

    setLoading(true);

    const payload = {
      title: title.trim(),
      category: category.trim(),
      category_slug: categorySlug.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      status: status.trim() || 'DRAFT',
      demo_url: demoUrl.trim() || null,
      github_url: githubUrl.trim() || null,
      details: details.trim() || null,
      is_published: isPublished,
      is_featured: isFeatured,
    };

    try {
      let result;
      if (projectId) {
        result = await supabaseClient.from('projects').update(payload).eq('id', projectId);
      } else {
        result = await supabaseClient.from('projects').insert([payload]);
      }

      if (result.error) throw result.error;

      showToast('Project berhasil disimpan!', 'success');
      setTimeout(() => {
        router.push('/admin/portfolio');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      showToast('Gagal menyimpan: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="cyber-grid min-h-screen py-12 flex items-center justify-center relative">
        <div className="text-center font-mono text-sm text-on-surface-variant flex flex-col items-center gap-3 relative z-10">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-container" />
          <span>LOADING_PROJECT...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-grid min-h-screen py-12 relative w-full">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop relative z-10 w-full">
        <Link
          href="/admin/portfolio"
          className="inline-flex items-center gap-2 font-mono text-sm text-on-surface-variant hover:text-primary-container transition-colors mb-8 group uppercase"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>RETURN_TO_PORTFOLIO</span>
        </Link>

        <div className="mb-10 border-l-4 border-primary-container pl-6 py-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-mono text-2xl md:text-3xl text-white">
              {projectId ? 'Edit Project' : 'Create Project'} <span className="text-primary-container">_</span>
            </h1>
            <p className="font-mono text-xs text-on-surface-variant mt-1 uppercase tracking-wider">
              {projectId ? `ID: ${projectId.slice(0, 8)}...` : 'NEW_PROJECT'}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-neon flex items-center gap-2 py-2.5 px-6 self-start md:self-auto"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'SAVING...' : 'SAVE_PROJECT'}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="glass-panel p-6 md:p-8 border border-outline-variant/30 space-y-5">
            <h2 className="font-mono text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <FolderOpen className="w-4 h-4 text-primary-container" />
              PROJECT_DETAILS
            </h2>

            <div>
              <label className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Project Title" className="command-input" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">Category</label>
                <select value={category} onChange={(e) => handleCategoryChange(e.target.value)}
                  className="command-input appearance-none">
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="command-input appearance-none">
                  <option value="DRAFT">DRAFT</option>
                  <option value="DEPLOYED">DEPLOYED</option>
                  <option value="STABLE">STABLE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="WIP">WIP</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of the project..." className="command-input min-h-[80px]" />
            </div>

            <div>
              <label className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">Image URL</label>
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..." className="command-input mb-3" />
              <ImageUpload value={imageUrl} onChange={setImageUrl} label="Upload Image" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">Demo URL</label>
                <input type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://..." className="command-input" />
              </div>
              <div>
                <label className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">GitHub URL</label>
                <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..." className="command-input" />
              </div>
            </div>

            <div>
              <label className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">Details</label>
              <textarea value={details} onChange={(e) => setDetails(e.target.value)}
                placeholder="Detailed description of the project..." className="command-input min-h-[100px]" />
            </div>

            <div className="flex items-center gap-6 pt-2 border-t border-outline-variant/20">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPublished" checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded bg-black border border-outline-variant focus:ring-primary-container/30 text-primary-container w-4 h-4 cursor-pointer" />
                <label htmlFor="isPublished" className="font-mono text-xs text-white uppercase tracking-wider cursor-pointer select-none">
                  PUBLISHED
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isFeatured" checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded bg-black border border-outline-variant focus:ring-primary-container/30 text-primary-container w-4 h-4 cursor-pointer" />
                <label htmlFor="isFeatured" className="font-mono text-xs text-white uppercase tracking-wider cursor-pointer select-none">
                  FEATURED (large card)
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>

      {toast && <ToastComponent toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
