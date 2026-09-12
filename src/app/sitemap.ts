import type { MetadataRoute } from 'next';
import { getPublishedBlogRefs } from '@/lib/blogs';

// Dibangkitkan per request agar daftar artikel tidak ikut terbekukan kosong
// saat build berjalan tanpa akses database.
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aufan.ifportofolio.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'monthly', priority: 1.0 },
    { url: `${SITE_URL}/portofolio`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ];

  let blogs: { id: string; created_at: string }[] = [];
  try {
    blogs = await getPublishedBlogRefs();
  } catch (error) {
    // Sitemap tetap terbit dengan route statis kalau database bermasalah.
    console.error('Gagal memuat daftar artikel untuk sitemap:', error);
  }

  for (const blog of blogs) {
    staticRoutes.push({
      url: `${SITE_URL}/blog/${blog.id}`,
      lastModified: new Date(blog.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    });
  }

  return staticRoutes;
}
