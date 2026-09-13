import type { Metadata } from 'next';
import { getPublishedProjects } from '@/lib/projects';
import PortfolioView from './PortfolioView';

/**
 * Galeri project dirender di server, seperti /blog.
 *
 * Sebelumnya halaman ini Client Component yang query Supabase dari browser.
 * Itu tidak mungkin lagi dengan MySQL — kredensial database tidak boleh
 * sampai ke browser — dan versi server ini juga menghilangkan kedipan
 * loading serta membuat isi galeri terbaca oleh crawler.
 *
 * force-dynamic, bukan ISR: lingkungan build tidak dijamin bisa menghubungi
 * database, jadi prerender saat build bisa mencache galeri kosong.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Portofolio',
  description:
    'Koleksi project yang pernah dikerjakan Aufan Taufiqurrahman — web development, API, dan desain.',
  openGraph: {
    title: 'Project Collection | Aufan Taufiqurrahman',
    description: 'Koleksi project web development, API, dan desain.',
  },
};

export default async function PortfolioPage() {
  let projects: Awaited<ReturnType<typeof getPublishedProjects>> = [];

  try {
    projects = await getPublishedProjects();
  } catch (error) {
    // Halaman tetap tampil dengan status kosong kalau database bermasalah.
    console.error('Gagal memuat daftar project:', error);
  }

  return <PortfolioView initialProjects={projects} />;
}
