'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Terminal,
  FolderOpen,
  Link as LinkIcon,
} from 'lucide-react';
import { supabaseClient } from '@/lib/supabase';
import { useToast, ToastComponent } from '@/components/Toast';
import ImageUpload from '@/components/ImageUpload';
interface SubstepItem {
  title: string;
  text: string;
  images: string[];
  codes?: string[];
}

interface LangkahItem {
  title: string;
  text: string;
  images: string[];
  subtitles: SubstepItem[];
  codes?: string[];
  code?: string;
}

interface AlatBahanItem {
  name: string;
  icon: string;
}

interface StructuredContent {
  format: 'structured';
  tujuan: string[];
  dasar_teori: string;
  alat_bahan: AlatBahanItem[];
  langkah_kerja: LangkahItem[];
  latihan_tugas: LangkahItem[];
  kesimpulan: string;
}

function AdminFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blogId = searchParams.get('id');

  // Metadata States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Praktikum');
  const [githubUrl, setGithubUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // Content Sections States
  const [tujuan, setTujuan] = useState<string[]>([]);
  const [dasarTeori, setDasarTeori] = useState('');
  const [alatBahan, setAlatBahan] = useState<AlatBahanItem[]>([]);
  const [langkahKerja, setLangkahKerja] = useState<LangkahItem[]>([]);
  const [latihanTugas, setLatihanTugas] = useState<LangkahItem[]>([]);
  const [kesimpulan, setKesimpulan] = useState('');

  // UI Active Tab State
  const [activeTab, setActiveTab] = useState('tujuan');

  // Loading States
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

      if (blogId) {
        loadBlogData(blogId);
      } else {
        // Initialize clean state for a new article
        setTujuan(['']);
        setAlatBahan([{ name: '', icon: 'laptop' }]);
        setLangkahKerja([{ title: '', text: '', images: [], subtitles: [], code: undefined, codes: [] }]);
        setLatihanTugas([{ title: '', text: '', images: [], subtitles: [], code: undefined, codes: [] }]);
      }
    };

    checkAuth();
  }, [blogId, router]);

  const loadBlogData = async (id: string) => {
    setFetching(true);
    try {
      const { data, error } = await supabaseClient
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setTitle(data.title || '');
        setDescription(data.description || '');
        setSubject(data.subject || 'Praktikum');
        setGithubUrl(data.github_url || '');
        setCoverUrl(data.cover_url || '');
        setIsPublished(data.is_published || false);

        // Check content structure
        let contentObj: any = null;
        if (data.content) {
          if (typeof data.content === 'string') {
            try {
              contentObj = JSON.parse(data.content);
            } catch (e) {
              console.error('Error parsing content JSON string:', e);
            }
          } else {
            contentObj = data.content;
          }
        }

        if (contentObj && contentObj.format === 'structured') {
          // Structured JSON
          const structured = contentObj as StructuredContent;
          setTujuan(structured.tujuan || []);
          setDasarTeori(structured.dasar_teori || '');
          setAlatBahan(structured.alat_bahan || []);
          
          setLangkahKerja(
            (structured.langkah_kerja || []).map((step: any) => {
              const stepCodes = step.codes && step.codes.length > 0 ? step.codes : (step.code ? [step.code] : []);
              return {
                title: step.title || '',
                text: step.text || '',
                images: step.images || [],
                subtitles: (step.subtitles || []).map((sub: any) => ({
                  title: sub.title || '',
                  text: sub.text || '',
                  images: sub.images || [],
                  codes: sub.codes || [],
                })),
                code: step.code || undefined,
                codes: stepCodes,
              };
            })
          );
          
          setLatihanTugas(
            (structured.latihan_tugas || []).map((task: any) => {
              const taskCodes = task.codes && task.codes.length > 0 ? task.codes : (task.code ? [task.code] : []);
              return {
                title: task.title || '',
                text: task.text || '',
                images: task.images || [],
                subtitles: (task.subtitles || []).map((sub: any) => ({
                  title: sub.title || '',
                  text: sub.text || '',
                  images: sub.images || [],
                  codes: sub.codes || [],
                })),
                code: task.code || undefined,
                codes: taskCodes,
              };
            })
          );
          
          setKesimpulan(structured.kesimpulan || '');
        } else if (Array.isArray(contentObj)) {
          // Legacy format (flat step array): map into Langkah Kerja
          const legacySteps = contentObj.map((step: any) => {
            const stepCodes = step.codes && step.codes.length > 0 ? step.codes : (step.code ? [step.code] : []);
            return {
              title: step.title || '',
              text: step.text || '',
              images: step.image_url ? [step.image_url] : [],
              subtitles: (step.subtitles || []).map((sub: any) => ({
                title: sub.title || '',
                text: sub.text || '',
                images: sub.images || [],
                codes: sub.codes || [],
              })),
              code: step.code || undefined,
              codes: stepCodes,
            };
          });
          setLangkahKerja(legacySteps);
          // Other tabs initialized as empty
          setTujuan(['']);
          setDasarTeori('');
          setAlatBahan([{ name: '', icon: 'laptop' }]);
          setLatihanTugas([{ title: '', text: '', images: [], subtitles: [], code: undefined, codes: [] }]);
          setKesimpulan('');
        } else {
          // Empty fallback
          setTujuan(['']);
          setAlatBahan([{ name: '', icon: 'laptop' }]);
          setLangkahKerja([{ title: '', text: '', images: [], subtitles: [], code: undefined, codes: [] }]);
          setLatihanTugas([{ title: '', text: '', images: [], subtitles: [], code: undefined, codes: [] }]);
        }
      }
    } catch (err: any) {
      showToast('Gagal memuat data: ' + err.message, 'error');
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);
    } finally {
      setFetching(false);
    }
  };

  // Tujuan Manipulation
  const handleAddTujuan = () => {
    setTujuan((prev) => [...prev, '']);
  };

  const handleRemoveTujuan = (index: number) => {
    setTujuan((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleTujuanChange = (index: number, value: string) => {
    setTujuan((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  // Alat & Bahan Manipulation
  const handleAddAlatBahan = () => {
    setAlatBahan((prev) => [...prev, { name: '', icon: 'laptop' }]);
  };

  const handleRemoveAlatBahan = (index: number) => {
    setAlatBahan((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAlatBahanChange = (index: number, field: keyof AlatBahanItem, value: string) => {
    setAlatBahan((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Langkah Kerja Helpers
  const handleAddLangkah = () => {
    setLangkahKerja((prev) => [...prev, { title: '', text: '', images: [], subtitles: [], code: undefined, codes: [] }]);
  };

  const handleInsertLangkah = (index: number) => {
    setLangkahKerja((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, { title: '', text: '', images: [], subtitles: [], code: undefined, codes: [] });
      return next;
    });
  };

  const handleRemoveLangkah = (index: number) => {
    setLangkahKerja((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleLangkahChange = (index: number, field: keyof LangkahItem, value: any) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) => (idx === index ? { ...step, [field]: value } : step))
    );
  };

  const handleAddLangkahImage = (stepIdx: number) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) =>
        idx === stepIdx
          ? { ...step, images: [...(step.images || []), ''] }
          : step
      )
    );
  };

  const handleRemoveLangkahImage = (stepIdx: number, imgIdx: number) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) =>
        idx === stepIdx
          ? { ...step, images: step.images.filter((_, i) => i !== imgIdx) }
          : step
      )
    );
  };

  const handleLangkahImageChange = (stepIdx: number, imgIdx: number, value: string) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) =>
        idx === stepIdx
          ? {
              ...step,
              images: step.images.map((img, i) => (i === imgIdx ? value : img)),
            }
          : step
      )
    );
  };

  const handleAddLangkahCode = (stepIdx: number) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) =>
        idx === stepIdx
          ? { ...step, codes: [...(step.codes || []), ''] }
          : step
      )
    );
  };

  const handleRemoveLangkahCode = (stepIdx: number, codeIdx: number) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) =>
        idx === stepIdx
          ? { ...step, codes: (step.codes || []).filter((_, i) => i !== codeIdx) }
          : step
      )
    );
  };

  const handleLangkahCodeChange = (stepIdx: number, codeIdx: number, value: string) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) =>
        idx === stepIdx
          ? {
              ...step,
              codes: (step.codes || []).map((code, i) => (i === codeIdx ? value : code)),
            }
          : step
      )
    );
  };

  const handleAddLangkahSub = (stepIdx: number) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) =>
        idx === stepIdx
          ? {
              ...step,
              subtitles: [...(step.subtitles || []), { title: '', text: '', images: [], codes: [] }],
            }
          : step
      )
    );
  };

  const handleRemoveLangkahSub = (stepIdx: number, subIdx: number) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) =>
        idx === stepIdx
          ? {
              ...step,
              subtitles: step.subtitles.filter((_, i) => i !== subIdx),
            }
          : step
      )
    );
  };

  const handleLangkahSubChange = (stepIdx: number, subIdx: number, field: keyof SubstepItem, value: any) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) =>
        idx === stepIdx
          ? {
              ...step,
              subtitles: step.subtitles.map((sub, sIdx) =>
                sIdx === subIdx ? { ...sub, [field]: value } : sub
              ),
            }
          : step
      )
    );
  };

  const handleAddLangkahSubImage = (stepIdx: number, subIdx: number) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) =>
        idx === stepIdx
          ? {
              ...step,
              subtitles: step.subtitles.map((sub, sIdx) =>
                sIdx === subIdx
                  ? { ...sub, images: [...(sub.images || []), ''] }
                  : sub
              ),
            }
          : step
      )
    );
  };

  const handleRemoveLangkahSubImage = (stepIdx: number, subIdx: number, imgIdx: number) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) =>
        idx === stepIdx
          ? {
              ...step,
              subtitles: step.subtitles.map((sub, sIdx) =>
                sIdx === subIdx
                  ? { ...sub, images: sub.images.filter((_, i) => i !== imgIdx) }
                  : sub
              ),
            }
          : step
      )
    );
  };

  const handleLangkahSubImageChange = (stepIdx: number, subIdx: number, imgIdx: number, value: string) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) =>
        idx === stepIdx
          ? {
              ...step,
              subtitles: step.subtitles.map((sub, sIdx) =>
                sIdx === subIdx
                  ? {
                      ...sub,
                      images: sub.images.map((img, i) => (i === imgIdx ? value : img)),
                    }
                  : sub
              ),
            }
          : step
      )
    );
  };

  const handleAddLangkahSubCode = (stepIdx: number, subIdx: number) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) =>
        idx === stepIdx
          ? {
              ...step,
              subtitles: (step.subtitles || []).map((sub, sIdx) =>
                sIdx === subIdx
                  ? { ...sub, codes: [...(sub.codes || []), ''] }
                  : sub
              ),
            }
          : step
      )
    );
  };

  const handleRemoveLangkahSubCode = (stepIdx: number, subIdx: number, codeIdx: number) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) =>
        idx === stepIdx
          ? {
              ...step,
              subtitles: (step.subtitles || []).map((sub, sIdx) =>
                sIdx === subIdx
                  ? { ...sub, codes: (sub.codes || []).filter((_, i) => i !== codeIdx) }
                  : sub
              ),
            }
          : step
      )
    );
  };

  const handleLangkahSubCodeChange = (stepIdx: number, subIdx: number, codeIdx: number, value: string) => {
    setLangkahKerja((prev) =>
      prev.map((step, idx) =>
        idx === stepIdx
          ? {
              ...step,
              subtitles: (step.subtitles || []).map((sub, sIdx) =>
                sIdx === subIdx
                  ? {
                      ...sub,
                      codes: (sub.codes || []).map((code, i) => (i === codeIdx ? value : code)),
                    }
                  : sub
              ),
            }
          : step
      )
    );
  };

  // Latihan & Tugas Helpers
  const handleAddTugas = () => {
    setLatihanTugas((prev) => [...prev, { title: '', text: '', images: [], subtitles: [], code: undefined, codes: [] }]);
  };

  const handleInsertTugas = (index: number) => {
    setLatihanTugas((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, { title: '', text: '', images: [], subtitles: [], code: undefined, codes: [] });
      return next;
    });
  };

  const handleRemoveTugas = (index: number) => {
    setLatihanTugas((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleTugasChange = (index: number, field: keyof LangkahItem, value: any) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) => (idx === index ? { ...task, [field]: value } : task))
    );
  };

  const handleAddTugasImage = (stepIdx: number) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) =>
        idx === stepIdx
          ? { ...task, images: [...(task.images || []), ''] }
          : task
      )
    );
  };

  const handleRemoveTugasImage = (stepIdx: number, imgIdx: number) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) =>
        idx === stepIdx
          ? { ...task, images: task.images.filter((_, i) => i !== imgIdx) }
          : task
      )
    );
  };

  const handleTugasImageChange = (stepIdx: number, imgIdx: number, value: string) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) =>
        idx === stepIdx
          ? {
              ...task,
              images: task.images.map((img, i) => (i === imgIdx ? value : img)),
            }
          : task
      )
    );
  };

  const handleAddTugasCode = (taskIdx: number) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) =>
        idx === taskIdx
          ? { ...task, codes: [...(task.codes || []), ''] }
          : task
      )
    );
  };

  const handleRemoveTugasCode = (taskIdx: number, codeIdx: number) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) =>
        idx === taskIdx
          ? { ...task, codes: (task.codes || []).filter((_, i) => i !== codeIdx) }
          : task
      )
    );
  };

  const handleTugasCodeChange = (taskIdx: number, codeIdx: number, value: string) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) =>
        idx === taskIdx
          ? {
              ...task,
              codes: (task.codes || []).map((code, i) => (i === codeIdx ? value : code)),
            }
          : task
      )
    );
  };

  const handleAddTugasSub = (stepIdx: number) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) =>
        idx === stepIdx
          ? {
              ...task,
              subtitles: [...(task.subtitles || []), { title: '', text: '', images: [], codes: [] }],
            }
          : task
      )
    );
  };

  const handleRemoveTugasSub = (stepIdx: number, subIdx: number) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) =>
        idx === stepIdx
          ? {
              ...task,
              subtitles: task.subtitles.filter((_, i) => i !== subIdx),
            }
          : task
      )
    );
  };

  const handleTugasSubChange = (stepIdx: number, subIdx: number, field: keyof SubstepItem, value: any) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) =>
        idx === stepIdx
          ? {
              ...task,
              subtitles: task.subtitles.map((sub, sIdx) =>
                sIdx === subIdx ? { ...sub, [field]: value } : sub
              ),
            }
          : task
      )
    );
  };

  const handleAddTugasSubImage = (stepIdx: number, subIdx: number) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) =>
        idx === stepIdx
          ? {
              ...task,
              subtitles: task.subtitles.map((sub, sIdx) =>
                sIdx === subIdx
                  ? { ...sub, images: [...(sub.images || []), ''] }
                  : sub
              ),
            }
          : task
      )
    );
  };

  const handleRemoveTugasSubImage = (stepIdx: number, subIdx: number, imgIdx: number) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) =>
        idx === stepIdx
          ? {
              ...task,
              subtitles: task.subtitles.map((sub, sIdx) =>
                sIdx === subIdx
                  ? { ...sub, images: sub.images.filter((_, i) => i !== imgIdx) }
                  : sub
              ),
            }
          : task
      )
    );
  };

  const handleTugasSubImageChange = (stepIdx: number, subIdx: number, imgIdx: number, value: string) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) =>
        idx === stepIdx
          ? {
              ...task,
              subtitles: task.subtitles.map((sub, sIdx) =>
                sIdx === subIdx
                  ? {
                      ...sub,
                      images: sub.images.map((img, i) => (i === imgIdx ? value : img)),
                    }
                  : sub
              ),
            }
          : task
      )
    );
  };

  const handleAddTugasSubCode = (taskIdx: number, subIdx: number) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) =>
        idx === taskIdx
          ? {
              ...task,
              subtitles: (task.subtitles || []).map((sub, sIdx) =>
                sIdx === subIdx
                  ? { ...sub, codes: [...(sub.codes || []), ''] }
                  : sub
              ),
            }
          : task
      )
    );
  };

  const handleRemoveTugasSubCode = (taskIdx: number, subIdx: number, codeIdx: number) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) =>
        idx === taskIdx
          ? {
              ...task,
              subtitles: (task.subtitles || []).map((sub, sIdx) =>
                sIdx === subIdx
                  ? { ...sub, codes: (sub.codes || []).filter((_, i) => i !== codeIdx) }
                  : sub
              ),
            }
          : task
      )
    );
  };

  const handleTugasSubCodeChange = (taskIdx: number, subIdx: number, codeIdx: number, value: string) => {
    setLatihanTugas((prev) =>
      prev.map((task, idx) =>
        idx === taskIdx
          ? {
              ...task,
              subtitles: (task.subtitles || []).map((sub, sIdx) =>
                sIdx === subIdx
                  ? {
                      ...sub,
                      codes: (sub.codes || []).map((code, i) => (i === codeIdx ? value : code)),
                    }
                  : sub
              ),
            }
          : task
      )
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Judul artikel wajib diisi.', 'error');
      return;
    }

    setLoading(true);

    // Clean up content payload
    const payloadContent: StructuredContent = {
      format: 'structured',
      tujuan: tujuan.map((t) => t.trim()).filter(Boolean),
      dasar_teori: dasarTeori.trim(),
      alat_bahan: alatBahan
        .map((ab) => ({ name: ab.name.trim(), icon: ab.icon.trim() }))
        .filter((ab) => ab.name || ab.icon),
      langkah_kerja: langkahKerja
        .map((step) => {
          const stepCodes = step.codes?.map((c) => c.trim()).filter(Boolean) || [];
          return {
            title: step.title.trim(),
            text: step.text.trim(),
            images: step.images.map((img) => img.trim()).filter(Boolean),
            subtitles: (step.subtitles || [])
              .map((sub) => ({
                title: sub.title.trim(),
                text: sub.text.trim(),
                images: sub.images.map((img) => img.trim()).filter(Boolean),
                codes: sub.codes?.map((c) => c.trim()).filter(Boolean) || [],
              }))
              .filter((sub) => sub.title || sub.text || sub.images.length > 0 || sub.codes.length > 0),
            codes: stepCodes,
            code: stepCodes[0] || undefined,
          };
        })
        .filter(
          (step) =>
            step.title ||
            step.text ||
            step.images.length > 0 ||
            step.codes.length > 0
        ),
      latihan_tugas: latihanTugas
        .map((task) => {
          const taskCodes = task.codes?.map((c) => c.trim()).filter(Boolean) || [];
          return {
            title: task.title.trim(),
            text: task.text.trim(),
            images: task.images.map((img) => img.trim()).filter(Boolean),
            subtitles: (task.subtitles || [])
              .map((sub) => ({
                title: sub.title.trim(),
                text: sub.text.trim(),
                images: sub.images.map((img) => img.trim()).filter(Boolean),
                codes: sub.codes?.map((c) => c.trim()).filter(Boolean) || [],
              }))
              .filter((sub) => sub.title || sub.text || sub.images.length > 0 || sub.codes.length > 0),
            codes: taskCodes,
            code: taskCodes[0] || undefined,
          };
        })
        .filter(
          (task) =>
            task.title ||
            task.text ||
            task.images.length > 0 ||
            task.codes.length > 0
        ),
      kesimpulan: kesimpulan.trim(),
    };

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      subject: subject.trim() || 'Praktikum',
      github_url: githubUrl.trim() || null,
      cover_url: coverUrl.trim() || null,
      is_published: isPublished,
      content: payloadContent,
    };

    try {
      let result;
      if (blogId) {
        result = await supabaseClient.from('blogs').update(payload).eq('id', blogId);
      } else {
        result = await supabaseClient.from('blogs').insert([payload]);
      }

      if (result.error) throw result.error;

      showToast('Artikel berhasil disimpan dalam format baru!', 'success');
      setTimeout(() => {
        router.push('/admin/dashboard');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      showToast('Gagal menyimpan artikel: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'tujuan', label: 'I. TUJUAN' },
    { id: 'dasar_teori', label: 'II. DASAR TEORI' },
    { id: 'alat_bahan', label: 'III. ALAT & BAHAN' },
    { id: 'langkah_kerja', label: 'IV. LANGKAH KERJA' },
    { id: 'latihan_tugas', label: 'V. LATIHAN & TUGAS' },
    { id: 'kesimpulan', label: 'VI. KESIMPULAN' },
  ];

  if (fetching) {
    return (
      <div className="cyber-grid min-h-screen py-12 flex items-center justify-center relative">
        <div className="text-center font-mono text-sm text-on-surface-variant flex flex-col items-center gap-3 relative z-10">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-container" />
          <span>INITIALIZING_RECORD_EDITOR...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-grid min-h-screen py-12 relative w-full">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop relative z-10 w-full">
        {/* Navigation */}
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 font-mono text-sm text-on-surface-variant hover:text-primary-container transition-colors mb-8 group uppercase"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>RETURN_TO_DASHBOARD</span>
        </Link>

        {/* Title */}
        <div className="mb-10 border-l-4 border-primary-container pl-6 py-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-mono text-2xl md:text-3xl text-white">
              {blogId ? 'Edit Structured Article' : 'Create Structured Article'} <span className="text-primary-container">_</span>
            </h1>
            <p className="font-sans text-xs md:text-sm text-on-surface-variant mt-1 uppercase tracking-wider font-mono">
              {blogId ? `RECORD_ID: ${blogId}` : 'RECORD_STATE: NEW_ENTRY'}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-neon flex items-center gap-2 py-2.5 px-6 self-start md:self-auto"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'SAVING_RECORD...' : 'SAVE_RECORD'}
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} className="space-y-8">
          {/* Metadata Card */}
          <div className="glass-panel p-6 md:p-8 border border-outline-variant/30 space-y-6">
            <h2 className="font-mono text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <FolderOpen className="w-4 h-4 text-primary-container" />
              METADATA_SPECIFICATION
            </h2>

            {/* Title */}
            <div>
              <label htmlFor="title" className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">
                --title
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-primary-container">
                  &gt;
                </span>
                <input
                  type="text"
                  id="title"
                  required
                  placeholder="Judul Artikel Utama"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="command-input pl-8"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">
                --description
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 font-mono text-sm text-primary-container">
                  &gt;
                </span>
                <textarea
                  id="description"
                  placeholder="Deskripsi singkat atau ringkasan artikel..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="command-input pl-8 min-h-[80px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subject Input */}
              <div>
                <label htmlFor="subject" className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">
                  --subject
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-primary-container">
                    &gt;
                  </span>
                  <input
                    type="text"
                    id="subject"
                    placeholder="Contoh: Praktikum, Cybersecurity"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="command-input pl-8"
                  />
                </div>
              </div>

              {/* GitHub URL */}
              <div>
                <label htmlFor="githubUrl" className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">
                  --github-url
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-primary-container">
                    &gt;
                  </span>
                  <input
                    type="url"
                    id="githubUrl"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="command-input pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Cover Image URL */}
            <div>
              <label htmlFor="coverUrl" className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block">
                --cover-url
              </label>
              <div className="relative flex-grow mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-primary-container pointer-events-none">
                  &gt;
                </span>
                <input
                  type="url"
                  id="coverUrl"
                  placeholder="https://..."
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="command-input pl-8"
                />
              </div>
              <ImageUpload value={coverUrl} onChange={setCoverUrl} label="Upload Cover Image" />
            </div>

            {/* Is Published Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded bg-black border border-outline-variant focus:ring-primary-container/30 text-primary-container w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isPublished" className="font-mono text-xs text-white uppercase tracking-wider cursor-pointer select-none">
                PUBLISH_TO_LIVE_WEBSITE
              </label>
            </div>
          </div>

          {/* Structured Content Tabs Area */}
          <div className="glass-panel p-6 md:p-8 border border-outline-variant/20 flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <Terminal className="w-4 h-4 text-primary-container" />
              <h2 className="font-mono text-base font-bold text-white uppercase">
                Structured Content Sections Editor
              </h2>
            </div>

            {/* Tabs Header */}
            <div className="flex flex-wrap gap-2 border-b border-outline-variant/30 pb-4">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 font-mono text-xs uppercase border transition-all rounded ${
                      isActive
                        ? 'bg-primary-container text-black border-primary-container font-bold shadow-neon'
                        : 'border-outline-variant/30 text-on-surface-variant hover:border-primary-container/30 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Active Tab Panel */}
            <div className="min-h-[300px]">
              {/* Tab I. Tujuan */}
              {activeTab === 'tujuan' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                      Objectives List
                    </span>
                    <button
                      type="button"
                      onClick={handleAddTujuan}
                      className="btn-neon-outline flex items-center gap-1.5 py-1 px-3 text-xs font-mono"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      ADD_OBJECTIVE
                    </button>
                  </div>

                  {tujuan.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="relative flex-grow">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-primary-container">
                          tujuan[#{idx + 1}] &gt;
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Masukkan tujuan praktikum..."
                          value={item}
                          onChange={(e) => handleTujuanChange(idx, e.target.value)}
                          className="command-input pl-28 text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTujuan(idx)}
                        className="p-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {tujuan.length === 0 && (
                    <p className="font-mono text-xs text-on-surface-variant italic">
                      Belum ada poin tujuan. Klik ADD_OBJECTIVE untuk menambahkan.
                    </p>
                  )}
                </div>
              )}

              {/* Tab II. Dasar Teori */}
              {activeTab === 'dasar_teori' && (
                <div className="space-y-2">
                  <label className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-2 block">
                    Dasar Teori Text
                  </label>
                  <textarea
                    placeholder="Masukkan landasan teori/dasar teori untuk praktikum ini..."
                    value={dasarTeori}
                    onChange={(e) => setDasarTeori(e.target.value)}
                    className="command-input min-h-[300px] text-sm font-sans"
                  />
                </div>
              )}

              {/* Tab III. Alat & Bahan */}
              {activeTab === 'alat_bahan' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                      Equipment & Tools List
                    </span>
                    <button
                      type="button"
                      onClick={handleAddAlatBahan}
                      className="btn-neon-outline flex items-center gap-1.5 py-1 px-3 text-xs font-mono"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      ADD_TOOL
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {alatBahan.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded border border-outline-variant/20 bg-surface-container-low/40 flex flex-col gap-3 relative"
                      >
                        <button
                          type="button"
                          onClick={() => handleRemoveAlatBahan(idx)}
                          className="absolute right-3 top-3 text-on-surface-variant hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div>
                          <label className="font-mono text-[10px] text-on-surface-variant/80 uppercase block mb-1">
                            Tool Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Laptop"
                            value={item.name}
                            onChange={(e) => handleAlatBahanChange(idx, 'name', e.target.value)}
                            className="command-input py-1.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-mono text-[10px] text-on-surface-variant/80 uppercase block mb-1">
                            Select Icon Visual
                          </label>
                          <select
                            value={item.icon}
                            onChange={(e) => handleAlatBahanChange(idx, 'icon', e.target.value)}
                            className="command-input py-1.5 text-xs bg-background"
                          >
                            <option value="laptop">Laptop (Mac/Windows)</option>
                            <option value="code">VS Code / Editor</option>
                            <option value="browser">Browser / Chrome / Firefox</option>
                            <option value="terminal">Terminal / CLI</option>
                            <option value="wifi">Koneksi Internet</option>
                            <option value="database">Database (SQL/Supabase)</option>
                            <option value="cpu">Processor / CPU</option>
                            <option value="settings">Konfigurasi / Setup</option>
                            <option value="shield">Security / Key</option>
                            <option value="file">Dokumen / generic</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {alatBahan.length === 0 && (
                    <p className="font-mono text-xs text-on-surface-variant italic">
                      Belum ada alat & bahan. Klik ADD_TOOL untuk menambahkan.
                    </p>
                  )}
                </div>
              )}

              {/* Tab IV. Langkah Kerja */}
              {activeTab === 'langkah_kerja' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                      Procedural Steps
                    </span>
                    <button
                      type="button"
                      onClick={handleAddLangkah}
                      className="btn-neon-outline flex items-center gap-1.5 py-1 px-3 text-xs font-mono"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      ADD_STEP
                    </button>
                  </div>

                  <div className="space-y-6">
                    {langkahKerja.map((step, idx) => (
                      <div
                        key={idx}
                        className="glass-panel p-6 border border-outline-variant/20 relative group hover:border-primary-container/20 transition-all duration-300"
                      >
                        {/* Step Circle Badge */}
                        <div className="absolute -left-3 top-6 w-8 h-8 rounded bg-primary-container text-black font-mono font-bold flex items-center justify-center text-xs shadow-neon">
                          {idx + 1}
                        </div>

                        {/* Top Options */}
                        <div className="flex justify-between items-center mb-4 pl-4">
                          <span className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                            STEP_DATA_RECORD
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleInsertLangkah(idx)}
                              className="text-xs font-mono text-primary-container/80 hover:text-primary-container border border-primary-container/20 px-2 py-0.5 rounded transition-all"
                            >
                              + INSERT_AFTER
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveLangkah(idx)}
                              className="text-xs font-mono text-red-400 hover:text-red-500 border border-red-500/20 px-2 py-0.5 rounded transition-all"
                            >
                              DELETE
                            </button>
                          </div>
                        </div>

                        {/* Fields */}
                        <div className="space-y-4 pl-4">
                          <div>
                            <label className="font-mono text-xs text-on-surface-variant mb-1 block">
                              title
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-primary-container">
                                &gt;
                              </span>
                              <input
                                type="text"
                                required
                                placeholder="Judul langkah ini..."
                                value={step.title}
                                onChange={(e) => handleLangkahChange(idx, 'title', e.target.value)}
                                className="command-input pl-8 text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-mono text-xs text-on-surface-variant mb-1 block">
                              text
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-3 font-mono text-sm text-primary-container">
                                &gt;
                              </span>
                              <textarea
                                required
                                placeholder="Jelaskan langkah ini secara mendetail..."
                                value={step.text}
                                onChange={(e) => handleLangkahChange(idx, 'text', e.target.value)}
                                className="command-input pl-8 min-h-[100px] text-sm"
                              />
                            </div>
                          </div>

                          {/* Multi Code Snippets */}
                          {step.codes && step.codes.map((code, codeIdx) => (
                            <div key={codeIdx} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <label className="font-mono text-xs text-on-surface-variant font-bold">
                                  code-snippet[#{codeIdx + 1}]
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLangkahCode(idx, codeIdx)}
                                  className="text-xs font-mono text-red-400 hover:text-red-500 transition-colors"
                                >
                                  REMOVE_CODE
                                </button>
                              </div>
                              <div className="relative">
                                <span className="absolute left-3 top-3 font-mono text-sm text-primary-container">
                                  &gt;
                                </span>
                                <textarea
                                  placeholder="Code Snippet Mockup..."
                                  value={code}
                                  onChange={(e) => handleLangkahCodeChange(idx, codeIdx, e.target.value)}
                                  className="command-input pl-8 min-h-[100px] text-xs font-mono"
                                />
                              </div>
                            </div>
                          ))}

                          {/* Multi Image URLs */}
                          <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                              <label className="font-mono text-xs text-on-surface-variant font-bold">
                                STEP_IMAGES (MULTI-IMAGE URL)
                              </label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleAddLangkahCode(idx)}
                                  className="text-xs font-mono text-primary-container border border-primary-container/20 px-2 py-0.5 rounded hover:bg-primary-container/10 transition-colors"
                                >
                                  + ADD_CODE
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddLangkahImage(idx)}
                                  className="text-xs font-mono text-primary-container border border-primary-container/20 px-2 py-0.5 rounded hover:bg-primary-container/10 transition-colors"
                                >
                                  + ADD_IMAGE
                                </button>
                              </div>
                            </div>

                            {step.images && step.images.map((imgUrl, imgIdx) => (
                              <div key={imgIdx} className="space-y-2">
                                <div className="flex gap-2 items-start">
                                  <input
                                    type="url"
                                    placeholder={`URL gambar reference #${imgIdx + 1}`}
                                    value={imgUrl}
                                    onChange={(e) =>
                                      handleLangkahImageChange(idx, imgIdx, e.target.value)
                                    }
                                    className="command-input py-1.5 text-xs flex-grow"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLangkahImage(idx, imgIdx)}
                                    className="p-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded transition-colors shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <ImageUpload
                                  value={imgUrl}
                                  onChange={(url) => handleLangkahImageChange(idx, imgIdx, url)}
                                  onRemove={() => handleRemoveLangkahImage(idx, imgIdx)}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Nested Subtitles (Sub-Langkah) */}
                          <div className="border-t border-outline-variant/20 pt-4 mt-6 space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-mono text-xs text-white uppercase tracking-wider font-bold">
                                Sub-Steps / Sub-Items
                              </h4>
                              <button
                                type="button"
                                onClick={() => handleAddLangkahSub(idx)}
                                className="text-xs font-mono text-primary-container hover:text-primary-container border border-primary-container/20 px-2 py-0.5 rounded transition-all"
                              >
                                + ADD_SUBSTEP
                              </button>
                            </div>

                            {step.subtitles && step.subtitles.length > 0 && (
                              <div className="space-y-4">
                                {step.subtitles.map((sub, subIdx) => (
                                  <div
                                    key={subIdx}
                                    className="p-4 rounded border border-outline-variant/10 bg-surface-container-low/30 space-y-3 relative"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveLangkahSub(idx, subIdx)}
                                      className="absolute right-3 top-3 text-on-surface-variant hover:text-red-400"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div>
                                      <label className="font-mono text-xs text-on-surface-variant/80 mb-1 block">
                                        sub_step[#{subIdx + 1}].title
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Judul sub-langkah..."
                                        value={sub.title}
                                        onChange={(e) =>
                                          handleLangkahSubChange(idx, subIdx, 'title', e.target.value)
                                        }
                                        className="command-input py-2 text-xs"
                                      />
                                    </div>

                                    <div>
                                      <label className="font-mono text-xs text-on-surface-variant/80 mb-1 block">
                                        sub_step[#{subIdx + 1}].text
                                      </label>
                                      <textarea
                                        placeholder="Penjelasan sub-langkah..."
                                        value={sub.text}
                                        onChange={(e) =>
                                          handleLangkahSubChange(idx, subIdx, 'text', e.target.value)
                                        }
                                        className="command-input py-2 min-h-[60px] text-xs"
                                      />
                                    </div>

                                    {/* Sub-step Multi-images */}
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <label className="font-mono text-xs text-primary-container/85">
                                          sub_step[#{subIdx + 1}].images
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => handleAddLangkahSubImage(idx, subIdx)}
                                          className="text-[10px] font-mono text-primary-container border border-primary-container/20 px-1.5 py-0.5 rounded hover:bg-primary-container/10"
                                        >
                                          + ADD_SUB_IMG
                                        </button>
                                      </div>

                                      {sub.images && sub.images.map((subImgUrl, subImgIdx) => (
                                        <div key={subImgIdx} className="space-y-2">
                                          <div className="flex gap-2 items-start">
                                            <input
                                              type="url"
                                              placeholder="URL gambar sub-langkah..."
                                              value={subImgUrl}
                                              onChange={(e) =>
                                                handleLangkahSubImageChange(idx, subIdx, subImgIdx, e.target.value)
                                              }
                                              className="command-input py-1.5 text-xs flex-grow"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveLangkahSubImage(idx, subIdx, subImgIdx)}
                                              className="p-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded transition-colors shrink-0"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                          <ImageUpload
                                            value={subImgUrl}
                                            onChange={(url) => handleLangkahSubImageChange(idx, subIdx, subImgIdx, url)}
                                            onRemove={() => handleRemoveLangkahSubImage(idx, subIdx, subImgIdx)}
                                          />
                                        </div>
                                      ))}
                                    </div>

                                    {/* Sub-step Multi Code Snippets */}
                                    <div className="space-y-2 pt-2">
                                      <div className="flex justify-between items-center">
                                        <label className="font-mono text-xs text-primary-container/85">
                                          sub_step[#{subIdx + 1}].codes
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => handleAddLangkahSubCode(idx, subIdx)}
                                          className="text-[10px] font-mono text-primary-container border border-primary-container/20 px-1.5 py-0.5 rounded hover:bg-primary-container/10"
                                        >
                                          + ADD_SUB_CODE
                                        </button>
                                      </div>

                                      {sub.codes && sub.codes.map((subCode, subCodeIdx) => (
                                        <div key={subCodeIdx} className="space-y-1">
                                          <div className="flex justify-between items-center">
                                            <span className="font-mono text-[10px] text-on-surface-variant">
                                              code[#{subCodeIdx + 1}]
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveLangkahSubCode(idx, subIdx, subCodeIdx)}
                                              className="text-[10px] font-mono text-red-400 hover:text-red-500"
                                            >
                                              REMOVE
                                            </button>
                                          </div>
                                          <div className="relative">
                                            <span className="absolute left-3 top-2.5 font-mono text-xs text-primary-container">
                                              &gt;
                                            </span>
                                            <textarea
                                              placeholder="Code Snippet Mockup..."
                                              value={subCode}
                                              onChange={(e) =>
                                                handleLangkahSubCodeChange(idx, subIdx, subCodeIdx, e.target.value)
                                              }
                                              className="command-input pl-8 min-h-[80px] text-xs font-mono py-1.5"
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={handleAddLangkah}
                      className="btn-neon-outline flex items-center gap-1.5 py-2.5 px-6 font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      ADD_NEXT_STEP
                    </button>
                  </div>
                </div>
              )}

              {/* Tab V. Latihan & Tugas */}
              {activeTab === 'latihan_tugas' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                      Exercises & Assignments
                    </span>
                    <button
                      type="button"
                      onClick={handleAddTugas}
                      className="btn-neon-outline flex items-center gap-1.5 py-1 px-3 text-xs font-mono"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      ADD_TASK
                    </button>
                  </div>

                  <div className="space-y-6">
                    {latihanTugas.map((task, idx) => (
                      <div
                        key={idx}
                        className="glass-panel p-6 border border-outline-variant/20 relative group hover:border-primary-container/20 transition-all duration-300"
                      >
                        {/* Task Circle Badge */}
                        <div className="absolute -left-3 top-6 w-8 h-8 rounded bg-primary-container text-black font-mono font-bold flex items-center justify-center text-xs shadow-neon">
                          {idx + 1}
                        </div>

                        {/* Top Options */}
                        <div className="flex justify-between items-center mb-4 pl-4">
                          <span className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                            TASK_DATA_RECORD
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleInsertTugas(idx)}
                              className="text-xs font-mono text-primary-container/80 hover:text-primary-container border border-primary-container/20 px-2 py-0.5 rounded transition-all"
                            >
                              + INSERT_AFTER
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveTugas(idx)}
                              className="text-xs font-mono text-red-400 hover:text-red-500 border border-red-500/20 px-2 py-0.5 rounded transition-all"
                            >
                              DELETE
                            </button>
                          </div>
                        </div>

                        {/* Fields */}
                        <div className="space-y-4 pl-4">
                          <div>
                            <label className="font-mono text-xs text-on-surface-variant mb-1 block">
                              title
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-primary-container">
                                &gt;
                              </span>
                              <input
                                type="text"
                                required
                                placeholder="Judul tugas/soal ini..."
                                value={task.title}
                                onChange={(e) => handleTugasChange(idx, 'title', e.target.value)}
                                className="command-input pl-8 text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-mono text-xs text-on-surface-variant mb-1 block">
                              text
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-3 font-mono text-sm text-primary-container">
                                &gt;
                              </span>
                              <textarea
                                required
                                placeholder="Jelaskan deskripsi soal atau pengerjaan tugas secara detail..."
                                value={task.text}
                                onChange={(e) => handleTugasChange(idx, 'text', e.target.value)}
                                className="command-input pl-8 min-h-[100px] text-sm"
                              />
                            </div>
                          </div>

                          {/* Multi Code Snippets */}
                          {task.codes && task.codes.map((code, codeIdx) => (
                            <div key={codeIdx} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <label className="font-mono text-xs text-on-surface-variant font-bold">
                                  code-snippet[#{codeIdx + 1}]
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTugasCode(idx, codeIdx)}
                                  className="text-xs font-mono text-red-400 hover:text-red-500 transition-colors"
                                >
                                  REMOVE_CODE
                                </button>
                              </div>
                              <div className="relative">
                                <span className="absolute left-3 top-3 font-mono text-sm text-primary-container">
                                  &gt;
                                </span>
                                <textarea
                                  placeholder="Code Snippet Mockup..."
                                  value={code}
                                  onChange={(e) => handleTugasCodeChange(idx, codeIdx, e.target.value)}
                                  className="command-input pl-8 min-h-[100px] text-xs font-mono"
                                />
                              </div>
                            </div>
                          ))}

                          {/* Task Multi Image URLs */}
                          <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                              <label className="font-mono text-xs text-on-surface-variant font-bold">
                                TASK_IMAGES (MULTI-IMAGE URL)
                              </label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleAddTugasCode(idx)}
                                  className="text-xs font-mono text-primary-container border border-primary-container/20 px-2 py-0.5 rounded hover:bg-primary-container/10 transition-colors"
                                >
                                  + ADD_CODE
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddTugasImage(idx)}
                                  className="text-xs font-mono text-primary-container border border-primary-container/20 px-2 py-0.5 rounded hover:bg-primary-container/10 transition-colors"
                                >
                                  + ADD_IMAGE
                                </button>
                              </div>
                            </div>

                            {task.images && task.images.map((imgUrl, imgIdx) => (
                              <div key={imgIdx} className="space-y-2">
                                <div className="flex gap-2 items-start">
                                  <input
                                    type="url"
                                    placeholder={`URL gambar reference #${imgIdx + 1}`}
                                    value={imgUrl}
                                    onChange={(e) =>
                                      handleTugasImageChange(idx, imgIdx, e.target.value)
                                    }
                                    className="command-input py-1.5 text-xs flex-grow"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTugasImage(idx, imgIdx)}
                                    className="p-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded transition-colors shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <ImageUpload
                                  value={imgUrl}
                                  onChange={(url) => handleTugasImageChange(idx, imgIdx, url)}
                                  onRemove={() => handleRemoveTugasImage(idx, imgIdx)}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Nested Subtitles (Sub-Tugas) */}
                          <div className="border-t border-outline-variant/20 pt-4 mt-6 space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-mono text-xs text-white uppercase tracking-wider font-bold">
                                Sub-Tasks / Sub-Items
                              </h4>
                              <button
                                type="button"
                                onClick={() => handleAddTugasSub(idx)}
                                className="text-xs font-mono text-primary-container hover:text-primary-container border border-primary-container/20 px-2 py-0.5 rounded transition-all"
                              >
                                + ADD_SUBTASK
                              </button>
                            </div>

                            {task.subtitles && task.subtitles.length > 0 && (
                              <div className="space-y-4">
                                {task.subtitles.map((sub, subIdx) => (
                                  <div
                                    key={subIdx}
                                    className="p-4 rounded border border-outline-variant/10 bg-surface-container-low/30 space-y-3 relative"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTugasSub(idx, subIdx)}
                                      className="absolute right-3 top-3 text-on-surface-variant hover:text-red-400"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div>
                                      <label className="font-mono text-xs text-on-surface-variant/80 mb-1 block">
                                        sub_task[#{subIdx + 1}].title
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Judul sub-tugas..."
                                        value={sub.title}
                                        onChange={(e) =>
                                          handleTugasSubChange(idx, subIdx, 'title', e.target.value)
                                        }
                                        className="command-input py-2 text-xs"
                                      />
                                    </div>

                                    <div>
                                      <label className="font-mono text-xs text-on-surface-variant/80 mb-1 block">
                                        sub_task[#{subIdx + 1}].text
                                      </label>
                                      <textarea
                                        placeholder="Penjelasan sub-tugas..."
                                        value={sub.text}
                                        onChange={(e) =>
                                          handleTugasSubChange(idx, subIdx, 'text', e.target.value)
                                        }
                                        className="command-input py-2 min-h-[60px] text-xs"
                                      />
                                    </div>

                                    {/* Sub-task Multi-images */}
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <label className="font-mono text-xs text-primary-container/85">
                                          sub_task[#{subIdx + 1}].images
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => handleAddTugasSubImage(idx, subIdx)}
                                          className="text-[10px] font-mono text-primary-container border border-primary-container/20 px-1.5 py-0.5 rounded hover:bg-primary-container/10"
                                        >
                                          + ADD_SUB_IMG
                                        </button>
                                      </div>

                                      {sub.images && sub.images.map((subImgUrl, subImgIdx) => (
                                        <div key={subImgIdx} className="space-y-2">
                                          <div className="flex gap-2 items-start">
                                            <input
                                              type="url"
                                              placeholder="URL gambar sub-tugas..."
                                              value={subImgUrl}
                                              onChange={(e) =>
                                                handleTugasSubImageChange(idx, subIdx, subImgIdx, e.target.value)
                                              }
                                              className="command-input py-1.5 text-xs flex-grow"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveTugasSubImage(idx, subIdx, subImgIdx)}
                                              className="p-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded transition-colors shrink-0"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                          <ImageUpload
                                            value={subImgUrl}
                                            onChange={(url) => handleTugasSubImageChange(idx, subIdx, subImgIdx, url)}
                                            onRemove={() => handleRemoveTugasSubImage(idx, subIdx, subImgIdx)}
                                          />
                                        </div>
                                      ))}
                                    </div>

                                    {/* Sub-task Multi Code Snippets */}
                                    <div className="space-y-2 pt-2">
                                      <div className="flex justify-between items-center">
                                        <label className="font-mono text-xs text-primary-container/85">
                                          sub_task[#{subIdx + 1}].codes
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => handleAddTugasSubCode(idx, subIdx)}
                                          className="text-[10px] font-mono text-primary-container border border-primary-container/20 px-1.5 py-0.5 rounded hover:bg-primary-container/10"
                                        >
                                          + ADD_SUB_CODE
                                        </button>
                                      </div>

                                      {sub.codes && sub.codes.map((subCode, subCodeIdx) => (
                                        <div key={subCodeIdx} className="space-y-1">
                                          <div className="flex justify-between items-center">
                                            <span className="font-mono text-[10px] text-on-surface-variant">
                                              code[#{subCodeIdx + 1}]
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveTugasSubCode(idx, subIdx, subCodeIdx)}
                                              className="text-[10px] font-mono text-red-400 hover:text-red-500"
                                            >
                                              REMOVE
                                            </button>
                                          </div>
                                          <div className="relative">
                                            <span className="absolute left-3 top-2.5 font-mono text-xs text-primary-container">
                                              &gt;
                                            </span>
                                            <textarea
                                              placeholder="Code Snippet Mockup..."
                                              value={subCode}
                                              onChange={(e) =>
                                                handleTugasSubCodeChange(idx, subIdx, subCodeIdx, e.target.value)
                                              }
                                              className="command-input pl-8 min-h-[80px] text-xs font-mono py-1.5"
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={handleAddTugas}
                      className="btn-neon-outline flex items-center gap-1.5 py-2.5 px-6 font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      ADD_NEXT_TASK
                    </button>
                  </div>
                </div>
              )}

              {/* Tab VI. Kesimpulan */}
              {activeTab === 'kesimpulan' && (
                <div className="space-y-2">
                  <label className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-2 block">
                    Kesimpulan Text
                  </label>
                  <textarea
                    placeholder="Masukkan poin kesimpulan akhir dari praktikum..."
                    value={kesimpulan}
                    onChange={(e) => setKesimpulan(e.target.value)}
                    className="command-input min-h-[250px] text-sm font-sans"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Save bar */}
          <div className="flex justify-between items-center border-t border-outline-variant/20 pt-6">
            <span className="font-mono text-xs text-on-surface-variant italic">
              * Silakan lengkapi semua seksi sebelum menyimpan.
            </span>
            <button
              type="submit"
              disabled={loading}
              className="btn-neon flex items-center gap-2 py-2.5 px-6 font-bold uppercase"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'SAVING_RECORD...' : 'SAVE_RECORD'}
            </button>
          </div>
        </form>
      </div>

      {toast && <ToastComponent toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function AdminFormPage() {
  return (
    <Suspense
      fallback={
        <div className="cyber-grid min-h-screen py-12 flex items-center justify-center relative">
          <div className="text-center font-mono text-sm text-on-surface-variant flex flex-col items-center gap-3 relative z-10">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-container" />
            <span>LOADING_EDITOR_DEPENDENCIES...</span>
          </div>
        </div>
      }
    >
      <AdminFormContent />
    </Suspense>
  );
}
