import type { Metadata } from 'next';
import { getPublishedBlogs } from '@/lib/blogs';
import BlogList from './BlogList';
import RippleSection from '@/components/RippleSection';

/**
 * Dirender per request, bukan ISR.
 *
 * Build berjalan di GitHub Actions yang tidak punya akses ke MySQL milik
 * hosting, jadi prerender saat build akan menghasilkan halaman KOSONG yang
 * lalu tersaji ke pengunjung pertama sampai revalidasi pertama terjadi.
 * Database ada di localhost server yang sama, jadi query per request murah.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest articles, tutorials, and research findings from the cyber-informatics frontier. Decrypting the systems of tomorrow.',
  openGraph: {
    title: 'Tech Insights & Lab Reports | Aufan Taufiqurrahman',
    description: 'Latest articles, tutorials, and research findings from the cyber-informatics frontier.',
  },
};

async function getBlogs() {
  try {
    return await getPublishedBlogs();
  } catch (error) {
    // Halaman tetap dirender walau database sedang tidak bisa dihubungi,
    // supaya kunjungan tidak berujung error page.
    console.error('Gagal memuat daftar artikel:', error);
    return [];
  }
}

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen relative flex flex-col items-center bg-background">
      {/* Header Section — full-width ripple */}
      <RippleSection className="pt-24 md:pt-28">
        <div className="flex flex-col items-center text-center py-4 md:py-6">
          <span className="font-mono text-[10px] md:text-xs tracking-[0.25em] text-primary-container uppercase">LAB</span>
          <h1 className="font-mono text-3xl md:text-4xl lg:text-5xl text-on-surface mt-2 leading-tight tracking-tight">
            Reports
          </h1>
        </div>
      </RippleSection>

      <div className="w-full px-margin-mobile md:px-margin-desktop pt-2 pb-12 relative z-10">
        {/* Client side search, filter & grid */}
        <BlogList initialBlogs={blogs} />
      </div>
    </div>
  );
}
