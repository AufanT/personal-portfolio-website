import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase';

export const revalidate = 0; // Fetch fresh data always

export default async function DiagnosePage() {
  const supabase = getSupabaseServerClient();
  let blogs: any[] = [];
  let dbError: any = null;

  try {
    const { data, error } = await supabase.from('blogs').select('*');
    if (error) {
      dbError = error;
    } else {
      blogs = data || [];
    }
  } catch (e: any) {
    dbError = e;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto border border-primary-container/20 p-6 rounded-lg bg-surface">
        <h1 className="text-xl text-primary-container mb-4 font-bold border-b border-primary-container/20 pb-2">
          Aufan@Database-Diagnostic-Tool:~$ run --check-blogs
        </h1>

        {dbError ? (
          <div className="bg-red-950/40 border border-red-500 text-red-200 p-4 rounded mb-6">
            <h2 className="font-bold mb-1">Database Error:</h2>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(dbError, null, 2)}</pre>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-sm mb-4 text-on-surface-variant">
              Success: Connected to Supabase. Found {blogs.length} record(s) in the <code className="text-primary-container">blogs</code> table.
            </p>

            <div className="space-y-4">
              {blogs.map((blog, idx) => {
                let contentFormat = 'Unknown';
                let parsedContent: any = null;
                try {
                  parsedContent = typeof blog.content === 'string' ? JSON.parse(blog.content) : blog.content;
                  if (parsedContent) {
                    if (parsedContent.format === 'structured') {
                      contentFormat = 'Structured (New)';
                    } else if (Array.isArray(parsedContent)) {
                      contentFormat = `Legacy Steps Array (${parsedContent.length} steps)`;
                    } else {
                      contentFormat = `Object (Not structured/array)`;
                    }
                  }
                } catch (e) {
                  contentFormat = 'Invalid JSON String';
                }

                return (
                  <div
                    key={blog.id}
                    className="p-4 rounded border border-outline-variant/30 bg-surface-container-low hover:border-primary-container/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-primary-container font-bold text-sm">
                        Record #{idx + 1}: {blog.title || '(No Title)'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        blog.is_published ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {blog.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-on-surface-variant">
                      <div><strong className="text-white">ID:</strong> <code className="text-yellow-400 select-all">{blog.id}</code></div>
                      <div><strong className="text-white">Columns:</strong> <code className="text-green-400">{Object.keys(blog).join(', ')}</code></div>
                      <div><strong className="text-white">Subject:</strong> {blog.subject || 'N/A'}</div>
                      <div><strong className="text-white">Created At:</strong> {blog.created_at || 'N/A'}</div>
                      <div><strong className="text-white">Content Format:</strong> {contentFormat}</div>
                      <div><strong className="text-white">GitHub URL:</strong> {blog.github_url || 'N/A'}</div>
                    </div>

                    <div className="mt-4 flex gap-4 text-xs font-bold">
                      <Link
                        href={`/blog/${blog.id}`}
                        target="_blank"
                        className="text-primary-container hover:underline"
                      >
                        [ VIEW BLOG DETAIL PAGE ]
                      </Link>
                      <Link
                        href={`/admin/form?id=${blog.id}`}
                        target="_blank"
                        className="text-yellow-400 hover:underline"
                      >
                        [ EDIT IN DASHBOARD ]
                      </Link>
                    </div>
                  </div>
                );
              })}

              {blogs.length === 0 && (
                <p className="text-sm text-yellow-400 italic">
                  No records found in the blogs table.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-primary-container/10 pt-4 mt-6 flex justify-between text-xs text-on-surface-variant">
          <span>Date: {new Date().toISOString()}</span>
          <Link href="/blog" className="text-primary-container hover:underline">
            ← Back to Blog list
          </Link>
        </div>
      </div>
    </div>
  );
}
