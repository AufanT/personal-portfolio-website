import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getAllBlogs } from '@/lib/blogs';
import { queryOne } from '@/lib/db';

/**
 * Alat diagnosa database.
 *
 * Halaman ini sekarang WAJIB login admin. Sebelumnya terbuka untuk publik
 * padahal menampilkan seluruh baris termasuk draft, nama-nama kolom, error
 * database mentah, dan tautan langsung ke form admin. `robots.txt` hanya
 * menyembunyikannya dari crawler, bukan melindunginya.
 */
export const dynamic = 'force-dynamic';

export default async function DiagnosePage() {
  if (!(await getAdminSession())) {
    // 404, bukan redirect — keberadaan halaman ini tidak perlu diumumkan.
    notFound();
  }

  let blogs: Awaited<ReturnType<typeof getAllBlogs>> = [];
  let dbError: string | null = null;
  let serverTime: string | null = null;

  try {
    blogs = await getAllBlogs();
    const row = await queryOne<{ now: string; version: string }>(
      'SELECT UTC_TIMESTAMP(6) AS now, VERSION() AS version'
    );
    serverTime = row ? `${row.now} UTC · MySQL ${row.version}` : null;
  } catch (error) {
    dbError = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
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
            <pre className="text-xs whitespace-pre-wrap">{dbError}</pre>
            <p className="text-xs mt-3 text-red-300/80">
              Periksa DB_HOST / DB_USER / DB_PASSWORD / DB_NAME di environment server.
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-sm mb-1 text-on-surface-variant">
              Success: Terhubung ke MySQL. Ditemukan {blogs.length} baris di tabel{' '}
              <code className="text-primary-container">blogs</code>.
            </p>
            {serverTime && (
              <p className="text-[11px] mb-4 text-on-surface-variant/60">{serverTime}</p>
            )}

            <div className="space-y-4">
              {blogs.map((blog, idx) => (
                <div
                  key={blog.id}
                  className="p-4 rounded border border-outline-variant/30 bg-surface-container-low hover:border-primary-container/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-primary-container font-bold text-sm">
                      Record #{idx + 1}: {blog.title || '(No Title)'}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        blog.is_published
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}
                    >
                      {blog.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-on-surface-variant">
                    <div>
                      <strong className="text-white">ID:</strong>{' '}
                      <code className="text-yellow-400 select-all">{blog.id}</code>
                    </div>
                    <div>
                      <strong className="text-white">Subject:</strong> {blog.subject || 'N/A'}
                    </div>
                    <div>
                      <strong className="text-white">Created At:</strong> {blog.created_at || 'N/A'}
                    </div>
                    <div>
                      <strong className="text-white">Cover:</strong> {blog.cover_url || 'N/A'}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-4 text-xs font-bold">
                    {blog.is_published && (
                      <Link
                        href={`/blog/${blog.id}`}
                        target="_blank"
                        className="text-primary-container hover:underline"
                      >
                        [ VIEW BLOG DETAIL PAGE ]
                      </Link>
                    )}
                    <Link
                      href={`/admin/form?id=${blog.id}`}
                      target="_blank"
                      className="text-yellow-400 hover:underline"
                    >
                      [ EDIT IN DASHBOARD ]
                    </Link>
                  </div>
                </div>
              ))}

              {blogs.length === 0 && (
                <p className="text-sm text-yellow-400 italic">
                  Tabel blogs masih kosong.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-primary-container/10 pt-4 mt-6 flex justify-between text-xs text-on-surface-variant">
          <span>Date: {new Date().toISOString()}</span>
          <Link href="/admin/dashboard" className="text-primary-container hover:underline">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
