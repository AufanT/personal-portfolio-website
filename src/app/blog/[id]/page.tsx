import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Calendar,
  Github,
  ArrowLeft,
  ArrowRight,
  Terminal,
  Laptop,
  Code,
  Globe,
  Wifi,
  Database,
  Cpu,
  Settings,
  Shield,
  FileText,
} from 'lucide-react';
import { getAdjacentBlogs, getPublishedBlogById } from '@/lib/blogs';
import BlogTOC from '@/components/BlogTOC';
import CodeWindow from '@/components/CodeWindow';
import ImageLightbox from '@/components/ImageLightbox';
import ReportImage from '@/components/ReportImage';
import RichText from '@/components/RichText';
import { isRichTextEmpty } from '@/lib/rich-text';
import { numberSections, type ReportSectionKey } from '@/lib/report-sections';

export const revalidate = 60;

interface ContentBlock {
  type: 'text' | 'code' | 'image';
  content: string;
  /** Hanya blok kode: bahasa untuk syntax highlighting ('auto' atau kosong = deteksi otomatis). */
  language?: string;
  /** Hanya blok kode: judul jendela, misalnya "routes/web.php". */
  filename?: string;
}

interface Subtitle {
  title?: string;
  text?: string;
  images?: string[];
  codes?: string[];
  blocks?: ContentBlock[];
}

interface BlogStep {
  title?: string;
  text?: string;
  image_url?: string;
  subtitles?: Subtitle[];
  code?: string;
  codes?: string[];
  images?: string[];
  blocks?: ContentBlock[];
}

interface AlatBahanItem {
  name: string;
  icon: string;
}

interface StructuredStep {
  title: string;
  text: string;
  images?: string[];
  subtitles?: {
    title: string;
    text: string;
    images?: string[];
    codes?: string[];
    blocks?: ContentBlock[];
  }[];
  code?: string;
  codes?: string[];
  blocks?: ContentBlock[];
}

interface StructuredContent {
  format: 'structured';
  tujuan: string[];
  dasar_teori: string;
  alat_bahan: AlatBahanItem[];
  langkah_kerja: StructuredStep[];
  latihan_tugas: StructuredStep[];
  kesimpulan: string;
}

interface Blog {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  cover_url: string | null;
  created_at: string;
  is_published: boolean;
  content: string | BlogStep[] | StructuredContent | null;
  github_url?: string | null;
}

interface NavBlog {
  id: string;
  title: string;
}

interface Props {
  params: {
    id: string;
  };
}

/**
 * Dibungkus `cache()` supaya `generateMetadata` dan komponen halaman berbagi
 * satu hasil query, bukan dua kali memukul database untuk request yang sama.
 */
const getBlog = cache(async (id: string): Promise<Blog | null> => {
  try {
    return (await getPublishedBlogById(id)) as Blog | null;
  } catch (error) {
    console.error('Gagal memuat detail artikel:', error);
    return null;
  }
});

async function getPrevAndNextBlogs(
  id: string
): Promise<{ prev: NavBlog | null; next: NavBlog | null }> {
  try {
    return await getAdjacentBlogs(id);
  } catch (error) {
    // Navigasi prev/next hanya pelengkap — artikelnya sendiri tetap tampil.
    console.error('Gagal memuat navigasi artikel:', error);
    return { prev: null, next: null };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlog(params.id);

  // Artikel draft atau id yang tidak ada dijawab 404, dan isi artikelnya
  // tidak pernah dikirim ke browser.
  //
  // Jangan tambahkan src/app/loading.tsx lagi: Suspense boundary global dari
  // file itu membuat respons mulai di-stream sebelum notFound() berjalan,
  // sehingga halaman "not found" terkirim dengan status 200. File itu juga
  // mengacaukan transisi halaman di src/components/Shell.tsx.
  if (!blog) {
    notFound();
  }

  return {
    title: blog.title,
    description: blog.description || 'Tech blog post detailing cyber-informatics research.',
    openGraph: {
      title: `${blog.title} | Aufan Taufiqurrahman`,
      description: blog.description ?? undefined,
      images: blog.cover_url ? [blog.cover_url] : [],
    },
  };
}

function getAlatIcon(iconName: string) {
  switch (iconName?.toLowerCase()) {
    case 'laptop':
    case 'laptop_mac':
      return <Laptop className="w-5 h-5 text-primary-container" />;
    case 'code':
      return <Code className="w-5 h-5 text-primary-container" />;
    case 'browser':
    case 'public':
    case 'globe':
      return <Globe className="w-5 h-5 text-primary-container" />;
    case 'terminal':
    case 'artisan':
    case 'bash':
      return <Terminal className="w-5 h-5 text-primary-container" />;
    case 'wifi':
    case 'internet':
      return <Wifi className="w-5 h-5 text-primary-container" />;
    case 'database':
    case 'db':
    case 'dns':
      return <Database className="w-5 h-5 text-primary-container" />;
    case 'cpu':
      return <Cpu className="w-5 h-5 text-primary-container" />;
    case 'settings':
      return <Settings className="w-5 h-5 text-primary-container" />;
    case 'shield':
      return <Shield className="w-5 h-5 text-primary-container" />;
    default:
      return <FileText className="w-5 h-5 text-primary-container" />;
  }
}

function renderCodeSnippet(
  code: string | undefined | null,
  index?: number,
  language?: string,
  filename?: string
) {
  if (!code) return null;
  return <CodeWindow key={index} code={code} language={language} filename={filename} />;
}

export default async function BlogDetailPage({ params }: Props) {
  const blog = await getBlog(params.id);

  if (!blog) {
    notFound();
  }

  const { prev: prevBlog, next: nextBlog } = await getPrevAndNextBlogs(blog.id);

  // Parse content defensively
  let structuredContent: StructuredContent | null = null;
  let legacySteps: BlogStep[] = [];
  let isStructured = false;

  if (blog.content) {
    let contentObj: any = null;
    if (typeof blog.content === 'string') {
      try {
        contentObj = JSON.parse(blog.content);
      } catch (e) {
        console.error('Failed to parse blog content JSON string:', e);
      }
    } else {
      contentObj = blog.content;
    }

    if (contentObj) {
      if (contentObj.format === 'structured') {
        structuredContent = {
          format: 'structured',
          tujuan: Array.isArray(contentObj.tujuan) ? contentObj.tujuan : [],
          dasar_teori: contentObj.dasar_teori || '',
          alat_bahan: Array.isArray(contentObj.alat_bahan) ? contentObj.alat_bahan : [],
          langkah_kerja: Array.isArray(contentObj.langkah_kerja)
            ? contentObj.langkah_kerja.map((step: any) => ({
                title: step.title || '',
                text: step.text || '',
                images: Array.isArray(step.images) ? step.images : [],
                blocks: Array.isArray(step.blocks) ? step.blocks : null,
                subtitles: Array.isArray(step.subtitles)
                  ? step.subtitles.map((sub: any) => ({
                      title: sub.title || '',
                      text: sub.text || '',
                      images: Array.isArray(sub.images) ? sub.images : [],
                      codes: Array.isArray(sub.codes) ? sub.codes : [],
                      blocks: Array.isArray(sub.blocks) ? sub.blocks : null,
                    }))
                  : [],
                code: step.code || '',
                codes: Array.isArray(step.codes) ? step.codes : [],
              }))
            : [],
          latihan_tugas: Array.isArray(contentObj.latihan_tugas)
            ? contentObj.latihan_tugas.map((task: any) => ({
                title: task.title || '',
                text: task.text || '',
                images: Array.isArray(task.images) ? task.images : [],
                blocks: Array.isArray(task.blocks) ? task.blocks : null,
                subtitles: Array.isArray(task.subtitles)
                  ? task.subtitles.map((sub: any) => ({
                      title: sub.title || '',
                      text: sub.text || '',
                      images: Array.isArray(sub.images) ? sub.images : [],
                      codes: Array.isArray(sub.codes) ? sub.codes : [],
                      blocks: Array.isArray(sub.blocks) ? sub.blocks : null,
                    }))
                  : [],
                code: task.code || '',
                codes: Array.isArray(task.codes) ? task.codes : [],
              }))
            : [],
          kesimpulan: contentObj.kesimpulan || '',
        };
        isStructured = true;
      } else if (Array.isArray(contentObj)) {
        legacySteps = contentObj.map((step: any) => ({
          title: step.title || '',
          text: step.text || '',
          image_url: step.image_url || '',
          subtitles: Array.isArray(step.subtitles)
            ? step.subtitles.map((sub: any) => ({
                title: sub.title || '',
                text: sub.text || '',
                images: Array.isArray(sub.images) ? sub.images : [],
                codes: Array.isArray(sub.codes) ? sub.codes : [],
              }))
            : [],
          code: step.code || '',
          codes: Array.isArray(step.codes) ? step.codes : [],
        }));
      }
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Tanggal tidak diketahui';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Tanggal tidak diketahui';
      }
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Tanggal tidak diketahui';
    }
  };

  // Nomor romawi hanya untuk section yang berisi, sesuai urutan baku —
  // laporan tanpa Tujuan dimulai dari "I. Dasar Teori".
  const sections = isStructured && structuredContent
    ? numberSections({
        tujuan: structuredContent.tujuan.some((item) => item?.trim()),
        dasar_teori: !isRichTextEmpty(structuredContent.dasar_teori),
        alat_bahan: structuredContent.alat_bahan.length > 0,
        langkah_kerja: structuredContent.langkah_kerja.length > 0,
        latihan_tugas: structuredContent.latihan_tugas.length > 0,
        kesimpulan: !isRichTextEmpty(structuredContent.kesimpulan),
      })
    : [];
  const numeral = (key: ReportSectionKey) => sections.find((section) => section.key === key)?.numeral ?? '';

  return (
    <div className="cyber-grid min-h-screen pt-28 pb-12 relative w-full">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10 w-full">
        <ImageLightbox>
        {isStructured && structuredContent ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter w-full">
            {/* TOC Sidebar */}
            <BlogTOC sections={sections} />

            {/* Main Content Area */}
            <article className="col-span-1 lg:col-span-9 flex flex-col gap-12">
              {/* Mobile back navigation */}
              <div className="lg:hidden">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 font-mono text-xs text-on-surface-variant hover:text-primary-container transition-colors group uppercase"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  <span>RETURN_TO_DATABASE</span>
                </Link>
              </div>

              {/* Hero Header Area */}
              <header
                className="relative rounded-2xl overflow-hidden border border-outline-variant/30 bg-cover bg-center min-h-[250px] flex flex-col justify-end p-6 md:p-8"
                style={{
                  backgroundImage: blog.cover_url
                    ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.85)), url('${blog.cover_url}')`
                    : `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.9)), url('/images/onprogress.png')`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex flex-wrap gap-2 items-center text-on-surface-variant font-mono text-xs uppercase tracking-wider mb-4">
                    <span className="text-background bg-primary-container px-2.5 py-0.5 rounded font-bold">
                      {blog.subject || 'Praktikum'}
                    </span>
                    <span>·</span>
                    <div className="flex items-center gap-1 text-on-surface-variant bg-black/60 px-2.5 py-1 rounded border border-outline-variant/20">
                      <Calendar className="w-3.5 h-3.5 text-primary-container" />
                      <span>{formatDate(blog.created_at)}</span>
                    </div>
                  </div>
                  <h1 className="font-mono text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]">
                    {blog.title}
                  </h1>
                  {blog.github_url && (
                    <a
                      href={blog.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-neon-outline inline-flex items-center gap-2 py-1.5 px-4 text-xs font-mono bg-black/50"
                    >
                      <Github className="w-4 h-4" />
                      REPOSITORY_GITHUB
                    </a>
                  )}
                </div>
              </header>

              {/* Description callout */}
              {blog.description && (
                <div className="glass-panel p-6 border-l-4 border-l-primary-container">
                  <p className="font-sans text-base text-on-surface leading-relaxed font-medium break-words">
                    {blog.description}
                  </p>
                </div>
              )}

              {/* Tujuan Praktikum */}
              {structuredContent.tujuan.some((item) => item?.trim()) && (
                <section
                  id="tujuan"
                  className="bg-surface-container border border-outline-variant rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:border-primary-container/30 transition-colors corner-glow"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-bl-full blur-2xl group-hover:bg-primary-container/10 transition-colors pointer-events-none" />
                  <h2 className="font-mono text-base md:text-lg text-primary-container mb-6 flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded bg-surface border border-primary-container/30 font-mono text-xs font-bold">{numeral('tujuan')}</span>
                    Tujuan Praktikum
                  </h2>
                  <p className="mb-4 text-on-surface-variant font-mono text-xs uppercase tracking-wider">Setelah menyelesaikan praktikum ini, mahasiswa diharapkan mampu:</p>
                  <ul className="space-y-3 text-on-surface">
                    {structuredContent.tujuan.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-primary-container font-mono text-sm mt-0.5 shrink-0">✓</span>
                        <span className="font-sans text-sm md:text-base text-on-surface break-words">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Dasar Teori */}
              {!isRichTextEmpty(structuredContent.dasar_teori) && (
                <section id="dasar-teori" className="flex flex-col gap-6">
                  <h2 className="font-mono text-base md:text-lg text-primary-container flex items-center gap-3 border-b border-outline-variant pb-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded bg-surface border border-primary-container/30 font-mono text-xs font-bold">{numeral('dasar_teori')}</span>
                    Dasar Teori
                  </h2>
                  <RichText
                    value={structuredContent.dasar_teori}
                    className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed break-words"
                  />
                </section>
              )}

              {/* Alat dan Bahan */}
              {structuredContent.alat_bahan && structuredContent.alat_bahan.length > 0 && (
                <section id="alat-bahan" className="flex flex-col gap-6">
                  <h2 className="font-mono text-base md:text-lg text-primary-container flex items-center gap-3 border-b border-outline-variant pb-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded bg-surface border border-primary-container/30 font-mono text-xs font-bold">{numeral('alat_bahan')}</span>
                    Alat dan Bahan
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {structuredContent.alat_bahan.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-surface-container-low border border-outline-variant p-4 rounded-xl flex items-center gap-3 hover:border-primary-container/40 transition-colors"
                      >
                        {getAlatIcon(item.icon)}
                        <span className="font-mono text-xs md:text-sm text-on-surface">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Langkah Kerja */}
              {structuredContent.langkah_kerja && structuredContent.langkah_kerja.length > 0 && (
                <section id="langkah-kerja" className="flex flex-col gap-10">
                  <h2 className="font-mono text-base md:text-lg text-primary-container flex items-center gap-3 border-b border-outline-variant pb-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded bg-surface border border-primary-container/30 font-mono text-xs font-bold">{numeral('langkah_kerja')}</span>
                    Langkah Kerja Praktikum
                  </h2>
                  <div className="space-y-0 pl-2">
                    {structuredContent.langkah_kerja.map((step, idx) => {
                      const isLast = idx === (structuredContent?.langkah_kerja?.length || 0) - 1;
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col gap-6 relative pl-8 pb-10 border-l ${
                            isLast ? 'border-transparent' : 'border-outline-variant'
                          }`}
                        >
                          {/* Timeline Node */}
                          <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-surface-container-high border-2 border-primary-container flex items-center justify-center font-mono text-xs text-primary-container font-bold timeline-node-active">
                            {idx + 1}
                          </div>

                          <div className="flex-grow">
                            <h3 className="font-mono text-base md:text-lg text-white mt-1 mb-2 break-words">
                              {step.title}
                            </h3>

                            {/* Render blocks in order if available, otherwise fall back to legacy */}
                            {step.blocks && step.blocks.length > 0 ? (
                              <div className="space-y-3 mb-2">
                                {step.blocks.filter((b: ContentBlock) => (b.type === 'text' ? !isRichTextEmpty(b.content) : b.content?.trim())).map((block: ContentBlock, bIdx: number) => {
                                  if (block.type === 'text') return (
                                    <RichText key={bIdx} value={block.content} className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed break-words" />
                                  );
                                  if (block.type === 'code') return renderCodeSnippet(block.content, bIdx, block.language, block.filename);
                                  if (block.type === 'image') return (
                                    <ReportImage key={bIdx} src={block.content} alt={`${step.title} visual reference ${bIdx + 1}`} />
                                  );
                                  return null;
                                })}
                              </div>
                            ) : (
                              <>
                                {step.text && (
                                  <RichText value={step.text} className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed mb-4 break-words" />
                                )}
                                {step.codes && step.codes.length > 0
                                  ? step.codes.map((code, cIdx) => renderCodeSnippet(code, cIdx))
                                  : renderCodeSnippet(step.code)}
                                {step.images && step.images.length > 0 && (
                                  <div className="flex flex-col items-start gap-4 mb-4">
                                    {step.images.map((imgUrl, imgIdx) => (
                                      <ReportImage key={imgIdx} src={imgUrl} alt={`${step.title} visual reference ${imgIdx + 1}`} />
                                    ))}
                                  </div>
                                )}
                              </>
                            )}

                            {/* Subtitles (Sub-Steps) */}
                            {step.subtitles && step.subtitles.length > 0 && (
                              <div className="border-t border-outline-variant/10 mt-4 pt-4 space-y-6">
                                {step.subtitles.map((sub, subIdx) => (
                                  <div key={subIdx} className="space-y-3">
                                    <h4 className="font-mono text-xs md:text-sm text-primary-container flex items-center gap-1.5 font-bold uppercase break-words">
                                      <span className="opacity-75">{idx + 1}.{subIdx + 1} —</span> {sub.title}
                                    </h4>
                                    {/* Sub-blocks ordered */}
                                    {sub.blocks && sub.blocks.length > 0 ? (
                                      <div className="space-y-3">
                                        {sub.blocks.filter((b: ContentBlock) => (b.type === 'text' ? !isRichTextEmpty(b.content) : b.content?.trim())).map((block: ContentBlock, bIdx: number) => {
                                          if (block.type === 'text') return (
                                            <RichText key={bIdx} value={block.content} className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed break-words" />
                                          );
                                          if (block.type === 'code') return renderCodeSnippet(block.content, bIdx, block.language, block.filename);
                                          if (block.type === 'image') return (
                                            <ReportImage key={bIdx} src={block.content} alt={`${sub.title} view ${bIdx + 1}`} />
                                          );
                                          return null;
                                        })}
                                      </div>
                                    ) : (
                                      <>
                                        {sub.text && (
                                          <RichText value={sub.text} className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed break-words" />
                                        )}
                                        {sub.images && sub.images.length > 0 && (
                                          <div className="flex flex-col items-start gap-4 mt-2">
                                            {sub.images.map((imgUrl, imgIdx) => (
                                              <ReportImage key={imgIdx} src={imgUrl} alt={`${sub.title} view ${imgIdx + 1}`} />
                                            ))}
                                          </div>
                                        )}
                                        {sub.codes && sub.codes.map((code, cIdx) => renderCodeSnippet(code, cIdx))}
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Latihan dan Tugas */}
              {structuredContent.latihan_tugas && structuredContent.latihan_tugas.length > 0 && (
                <section id="latihan-tugas" className="flex flex-col gap-6">
                  <h2 className="font-mono text-base md:text-lg text-primary-container flex items-center gap-3 border-b border-outline-variant pb-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded bg-surface border border-primary-container/30 font-mono text-xs font-bold">{numeral('latihan_tugas')}</span>
                    Latihan dan Tugas
                  </h2>
                  <div className="space-y-6">
                    {structuredContent.latihan_tugas.map((task, idx) => (
                      <div
                        key={idx}
                        className="bg-surface-container-low border border-outline-variant/35 hover:border-primary-container/20 transition-all duration-300 rounded-2xl p-6 md:p-8 relative overflow-hidden group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded bg-primary-container text-black font-mono font-bold flex items-center justify-center text-sm shadow-neon">
                            {idx + 1}
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-mono text-base md:text-lg text-white mb-3 break-words">
                              {task.title}
                            </h3>

                            {/* Render blocks in order if available */}
                            {task.blocks && task.blocks.length > 0 ? (
                              <div className="space-y-3 mb-2">
                                {task.blocks.filter((b: ContentBlock) => (b.type === 'text' ? !isRichTextEmpty(b.content) : b.content?.trim())).map((block: ContentBlock, bIdx: number) => {
                                  if (block.type === 'text') return (
                                    <RichText key={bIdx} value={block.content} className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed break-words" />
                                  );
                                  if (block.type === 'code') return renderCodeSnippet(block.content, bIdx, block.language, block.filename);
                                  if (block.type === 'image') return (
                                    <ReportImage key={bIdx} src={block.content} alt={`${task.title} view ${bIdx + 1}`} />
                                  );
                                  return null;
                                })}
                              </div>
                            ) : (
                              <>
                                {task.text && (
                                  <RichText value={task.text} className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed mb-4 break-words" />
                                )}
                                {task.codes && task.codes.length > 0
                                  ? task.codes.map((code, cIdx) => renderCodeSnippet(code, cIdx))
                                  : renderCodeSnippet(task.code)}
                                {task.images && task.images.length > 0 && (
                                  <div className="flex flex-col items-start gap-4 mb-4">
                                    {task.images.map((imgUrl, imgIdx) => (
                                      <ReportImage key={imgIdx} src={imgUrl} alt={`${task.title} view ${imgIdx + 1}`} />
                                    ))}
                                  </div>
                                )}
                              </>
                            )}

                            {/* Subtitles (Sub-Tugas) */}
                            {task.subtitles && task.subtitles.length > 0 && (
                              <div className="border-t border-outline-variant/10 mt-4 pt-4 space-y-6">
                                {task.subtitles.map((sub, subIdx) => (
                                  <div key={subIdx} className="space-y-3">
                                    <h4 className="font-mono text-xs md:text-sm text-primary-container flex items-center gap-1.5 font-bold uppercase break-words">
                                      <span className="opacity-75">#{subIdx + 1}</span> {sub.title}
                                    </h4>
                                    {sub.blocks && sub.blocks.length > 0 ? (
                                      <div className="space-y-3">
                                        {sub.blocks.filter((b: ContentBlock) => (b.type === 'text' ? !isRichTextEmpty(b.content) : b.content?.trim())).map((block: ContentBlock, bIdx: number) => {
                                          if (block.type === 'text') return (
                                            <RichText key={bIdx} value={block.content} className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed break-words" />
                                          );
                                          if (block.type === 'code') return renderCodeSnippet(block.content, bIdx, block.language, block.filename);
                                          if (block.type === 'image') return (
                                            <ReportImage key={bIdx} src={block.content} alt={`${sub.title} view ${bIdx + 1}`} />
                                          );
                                          return null;
                                        })}
                                      </div>
                                    ) : (
                                      <>
                                        {sub.text && (
                                          <RichText value={sub.text} className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed break-words" />
                                        )}
                                        {sub.images && sub.images.length > 0 && (
                                          <div className="flex flex-col items-start gap-4 mt-2">
                                            {sub.images.map((imgUrl, imgIdx) => (
                                              <ReportImage key={imgIdx} src={imgUrl} alt={`${sub.title} view ${imgIdx + 1}`} />
                                            ))}
                                          </div>
                                        )}
                                        {sub.codes && sub.codes.map((code, cIdx) => renderCodeSnippet(code, cIdx))}
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Kesimpulan */}
              {!isRichTextEmpty(structuredContent.kesimpulan) && (
                <section id="kesimpulan" className="flex flex-col gap-6">
                  <h2 className="font-mono text-base md:text-lg text-primary-container flex items-center gap-3 border-b border-outline-variant pb-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded bg-surface border border-primary-container/30 font-mono text-xs font-bold">{numeral('kesimpulan')}</span>
                    Kesimpulan
                  </h2>
                  <RichText
                    value={structuredContent.kesimpulan}
                    className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed break-words"
                  />
                </section>
              )}

              {/* Prev/Next Navigation */}
              {(prevBlog || nextBlog) && (
                <div className="border-t border-outline-variant/20 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-stretch gap-4">
                  {prevBlog ? (
                    <Link
                      href={`/blog/${prevBlog.id}`}
                      className="flex-1 group flex flex-col gap-2 p-4 rounded-xl border border-outline-variant/30 hover:border-primary-container/40 hover:bg-surface-container-low transition-all text-left"
                    >
                      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> PREVIOUS_ARTICLE
                      </span>
                      <span className="font-mono text-xs md:text-sm text-white group-hover:text-primary-container transition-colors line-clamp-1">
                        {prevBlog.title}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex-1 hidden sm:block"></div>
                  )}

                  {nextBlog ? (
                    <Link
                      href={`/blog/${nextBlog.id}`}
                      className="flex-1 group flex flex-col gap-2 p-4 rounded-xl border border-outline-variant/30 hover:border-primary-container/40 hover:bg-surface-container-low transition-all text-right items-end"
                    >
                      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5 flex-row-reverse">
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /> NEXT_ARTICLE
                      </span>
                      <span className="font-mono text-xs md:text-sm text-white group-hover:text-primary-container transition-colors line-clamp-1">
                        {nextBlog.title}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex-1 hidden sm:block"></div>
                  )}
                </div>
              )}
            </article>
          </div>
        ) : (
          /* Legacy format fallback */
          <div className="max-w-4xl mx-auto w-full">
            {/* Back navigation */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-mono text-sm text-on-surface-variant hover:text-primary-container transition-colors mb-8 group uppercase"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>RETURN_TO_DATABASE</span>
            </Link>

            {/* Hero Header Area */}
            <div
              className="relative rounded-xl overflow-hidden mb-12 border border-outline-variant/30 bg-cover bg-center min-h-[300px] flex flex-col justify-end p-8 md:p-12"
              style={{
                backgroundImage: blog.cover_url
                  ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.85)), url('${blog.cover_url}')`
                  : `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.9)), url('/images/onprogress.png')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none" />

              <div className="relative z-10 max-w-2xl">
                <div className="flex flex-wrap gap-3 items-center mb-4">
                  <span className="font-mono text-xs text-background bg-primary-container px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                    {blog.subject || 'Tutorial'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-mono bg-black/60 px-2.5 py-1 rounded border border-outline-variant/20">
                    <Calendar className="w-3.5 h-3.5 text-primary-container" />
                    <span>{formatDate(blog.created_at)}</span>
                  </div>
                </div>

                <h1 className="font-mono text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight tracking-tight drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]">
                  {blog.title}
                </h1>

                {blog.github_url && (
                  <a
                    href={blog.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-neon-outline inline-flex items-center gap-2 py-1.5 px-4 text-xs font-mono"
                  >
                    <Github className="w-4 h-4" />
                    REPOSITORY_GITHUB
                  </a>
                )}
              </div>
            </div>

            {/* Description intro */}
            {blog.description && (
              <div className="glass-panel p-6 mb-12 border-l-4 border-l-primary-container">
                <p className="font-sans text-base md:text-lg text-on-surface leading-relaxed font-medium break-words">
                  {blog.description}
                </p>
              </div>
            )}

            {/* Content steps */}
            <div className="space-y-8">
              {legacySteps && legacySteps.length > 0 ? (
                legacySteps.map((step, index) => (
                  <div
                    key={index}
                    className="glass-panel p-6 md:p-8 border border-outline-variant/20 hover:border-primary-container/20 transition-colors duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded bg-primary-container text-black font-mono font-bold flex items-center justify-center text-sm shadow-neon">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-mono text-lg md:text-xl text-white mb-4 break-words">
                          {step.title || 'Untitled Step'}
                        </h3>
                        {step.text && (
                          <RichText value={step.text} className="font-sans text-base text-on-surface-variant leading-relaxed mb-6 break-words" />
                        )}

                        {/* Code snippet mockup */}
                        {step.codes && step.codes.length > 0 ? (
                          step.codes.map((code, cIdx) => renderCodeSnippet(code, cIdx))
                        ) : (
                          renderCodeSnippet(step.code)
                        )}

                        {step.image_url && (
                          <ReportImage src={step.image_url} alt={step.title || `Step ${index + 1}`} />
                        )}

                        {/* Subtitles rendering */}
                        {step.subtitles && step.subtitles.length > 0 && (
                          <div className="border-t border-outline-variant/20 mt-6 pt-6 space-y-6">
                            {step.subtitles.map((sub, subIdx) => (
                              <div key={subIdx} className="space-y-3">
                                <h4 className="font-mono text-sm text-primary-container flex items-center gap-1.5 font-bold break-words">
                                  <span className="opacity-75">#</span> {sub.title || `Sub-item ${subIdx + 1}`}
                                </h4>
                                {sub.text && (
                                  <RichText value={sub.text} className="font-sans text-sm text-on-surface-variant leading-relaxed break-words" />
                                )}
                                {sub.images && sub.images.length > 0 && (
                                  <div className="flex flex-col items-start gap-4 mt-2">
                                    {sub.images.map((imgUrl, imgIdx) => (
                                      <ReportImage key={imgIdx} src={imgUrl} alt={step.title || `Sub-item visual reference`} />
                                    ))}
                                  </div>
                                )}
                                {sub.codes && sub.codes.map((code, cIdx) => renderCodeSnippet(code, cIdx))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-outline-variant/30 rounded-xl">
                  <Terminal className="w-8 h-8 text-primary-container mx-auto mb-4 animate-pulse" />
                  <p className="font-mono text-sm text-on-surface-variant mb-2">
                    WARNING: NO_CONTENT_STEPS_LOADED_FROM_RECORD
                  </p>
                  <p className="font-sans text-xs text-on-surface-variant/70">
                    This article has no steps formatted in the database.
                  </p>
                </div>
              )}
            </div>

            {/* Prev/Next Navigation */}
            {(prevBlog || nextBlog) && (
              <div className="border-t border-outline-variant/20 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-stretch gap-4">
                {prevBlog ? (
                  <Link
                    href={`/blog/${prevBlog.id}`}
                    className="flex-1 group flex flex-col gap-2 p-4 rounded-xl border border-outline-variant/30 hover:border-primary-container/40 hover:bg-surface-container-low transition-all text-left"
                  >
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> PREVIOUS_ARTICLE
                    </span>
                    <span className="font-mono text-xs md:text-sm text-white group-hover:text-primary-container transition-colors line-clamp-1">
                      {prevBlog.title}
                    </span>
                  </Link>
                ) : (
                  <div className="flex-1 hidden sm:block"></div>
                )}

                {nextBlog ? (
                  <Link
                    href={`/blog/${nextBlog.id}`}
                    className="flex-1 group flex flex-col gap-2 p-4 rounded-xl border border-outline-variant/30 hover:border-primary-container/40 hover:bg-surface-container-low transition-all text-right items-end"
                  >
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5 flex-row-reverse">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /> NEXT_ARTICLE
                    </span>
                    <span className="font-mono text-xs md:text-sm text-white group-hover:text-primary-container transition-colors line-clamp-1">
                      {nextBlog.title}
                    </span>
                  </Link>
                ) : (
                  <div className="flex-1 hidden sm:block"></div>
                )}
              </div>
            )}
          </div>
        )}
        </ImageLightbox>
      </div>
    </div>
  );
}
