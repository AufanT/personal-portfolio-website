import type { MetadataRoute } from 'next';
import { getSupabaseServerClient } from '@/lib/supabase';

const SITE_URL = 'https://aufan.ifportofolio.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'monthly', priority: 1.0 },
    { url: `${SITE_URL}/portofolio`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ];

  const supabase = getSupabaseServerClient();
  const { data: blogs } = await supabase
    .from('blogs')
    .select('id, created_at')
    .eq('is_published', true);

  if (blogs) {
    for (const blog of blogs) {
      staticRoutes.push({
        url: `${SITE_URL}/blog/${blog.id}`,
        lastModified: new Date(blog.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      });
    }
  }

  return staticRoutes;
}
