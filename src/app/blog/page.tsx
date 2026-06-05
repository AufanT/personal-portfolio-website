import type { Metadata } from 'next';
import { getSupabaseServerClient } from '@/lib/supabase';
import BlogList from './BlogList';
import RippleSection from '@/components/RippleSection';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest articles, tutorials, and research findings from the cyber-informatics frontier. Decrypting the systems of tomorrow.',
  openGraph: {
    title: 'Tech Insights & Lab Reports | Aufan Taufiqurrahman',
    description: 'Latest articles, tutorials, and research findings from the cyber-informatics frontier.',
  },
};

async function getBlogs() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase blogs fetch error:', error);
    return [];
  }
  return data || [];
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
