import { getFeaturedProjects } from '@/lib/projects';
import HomeView, { type Project } from './HomeView';

/**
 * Homepage. Project unggulan diambil di server lalu diturunkan sebagai props
 * ke HomeView (Client Component) yang memegang seluruh animasi dan interaksi.
 */
// force-dynamic, bukan ISR: build di CI tidak punya akses database, sehingga
// prerender saat build akan mencache homepage tanpa panel project.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let featuredProjects: Project[] = [];

  try {
    featuredProjects = (await getFeaturedProjects()) as Project[];
  } catch (error) {
    // Homepage tetap tampil lengkap tanpa panel project kalau database gagal.
    console.error('Gagal memuat project unggulan:', error);
  }

  return <HomeView featuredProjects={featuredProjects} />;
}
