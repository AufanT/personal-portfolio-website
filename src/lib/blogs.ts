import { randomUUID } from 'crypto';
import { execute, query, queryOne } from '@/lib/db';
import { parseJsonColumn, toBool, toIso } from '@/lib/rows';

/** Modul server-only — mengimport `@/lib/db`. */

export interface Blog {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  content: any;
  github_url: string | null;
  cover_url: string | null;
  is_published: boolean;
  created_at: string;
}

/** Ringkasan untuk daftar — tanpa kolom `content` yang bisa puluhan KB. */
export interface BlogSummary {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  cover_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface BlogInput {
  title: string;
  subject: string;
  description: string | null;
  content: any;
  github_url: string | null;
  cover_url: string | null;
  is_published: boolean;
}

const SUMMARY_COLUMNS =
  'id, title, subject, description, cover_url, is_published, created_at';

function mapSummary(row: any): BlogSummary {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    description: row.description,
    cover_url: row.cover_url,
    is_published: toBool(row.is_published),
    created_at: toIso(row.created_at),
  };
}

function mapBlog(row: any): Blog {
  return {
    ...mapSummary(row),
    content: parseJsonColumn(row.content),
    github_url: row.github_url,
  };
}

/** Daftar publik di /blog. */
export async function getPublishedBlogs(): Promise<BlogSummary[]> {
  const rows = await query(
    `SELECT ${SUMMARY_COLUMNS} FROM blogs WHERE is_published = 1 ORDER BY created_at DESC`
  );
  return rows.map(mapSummary);
}

/** Semua artikel termasuk draft — hanya untuk dashboard admin. */
export async function getAllBlogs(): Promise<BlogSummary[]> {
  const rows = await query(
    `SELECT ${SUMMARY_COLUMNS} FROM blogs ORDER BY created_at DESC`
  );
  return rows.map(mapSummary);
}

export async function getBlogById(id: string): Promise<Blog | null> {
  const row = await queryOne('SELECT * FROM blogs WHERE id = ? LIMIT 1', [id]);
  return row ? mapBlog(row) : null;
}

/** Hanya artikel published — dipakai halaman publik /blog/[id]. */
export async function getPublishedBlogById(id: string): Promise<Blog | null> {
  const row = await queryOne(
    'SELECT * FROM blogs WHERE id = ? AND is_published = 1 LIMIT 1',
    [id]
  );
  return row ? mapBlog(row) : null;
}

export interface AdjacentBlog {
  id: string;
  title: string;
}

/**
 * Artikel published tepat sebelum & sesudah artikel ini menurut `created_at`.
 *
 * Pembanding `created_at` diambil lewat subquery dari `id`, bukan dikirim dari
 * pemanggil sebagai string — supaya tidak ada konversi timestamp bolak-balik
 * antara ISO dan format MySQL yang bisa bergeser presisi mikrodetik.
 */
export async function getAdjacentBlogs(
  id: string
): Promise<{ prev: AdjacentBlog | null; next: AdjacentBlog | null }> {
  const [prev, next] = await Promise.all([
    queryOne<AdjacentBlog>(
      `SELECT id, title FROM blogs
       WHERE is_published = 1
         AND created_at < (SELECT created_at FROM blogs WHERE id = ?)
       ORDER BY created_at DESC
       LIMIT 1`,
      [id]
    ),
    queryOne<AdjacentBlog>(
      `SELECT id, title FROM blogs
       WHERE is_published = 1
         AND created_at > (SELECT created_at FROM blogs WHERE id = ?)
       ORDER BY created_at ASC
       LIMIT 1`,
      [id]
    ),
  ]);

  return { prev, next };
}

/** Untuk sitemap.xml. */
export async function getPublishedBlogRefs(): Promise<{ id: string; created_at: string }[]> {
  const rows = await query(
    'SELECT id, created_at FROM blogs WHERE is_published = 1 ORDER BY created_at DESC'
  );
  return rows.map((row) => ({ id: row.id, created_at: toIso(row.created_at) }));
}

export async function createBlog(input: BlogInput): Promise<string> {
  const id = randomUUID();
  await execute(
    `INSERT INTO blogs
       (id, title, subject, description, content, github_url, cover_url, is_published, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(6))`,
    [
      id,
      input.title,
      input.subject,
      input.description,
      input.content == null ? null : JSON.stringify(input.content),
      input.github_url,
      input.cover_url,
      input.is_published ? 1 : 0,
    ]
  );
  return id;
}

/** Mengembalikan false kalau id tidak ditemukan. */
export async function updateBlog(id: string, input: BlogInput): Promise<boolean> {
  const affected = await execute(
    `UPDATE blogs SET
       title = ?, subject = ?, description = ?, content = ?,
       github_url = ?, cover_url = ?, is_published = ?
     WHERE id = ?`,
    [
      input.title,
      input.subject,
      input.description,
      input.content == null ? null : JSON.stringify(input.content),
      input.github_url,
      input.cover_url,
      input.is_published ? 1 : 0,
      id,
    ]
  );

  // affectedRows 0 juga terjadi kalau tidak ada nilai yang berubah, jadi
  // keberadaan baris diperiksa terpisah supaya tidak salah lapor 404.
  if (affected > 0) return true;
  return (await queryOne('SELECT id FROM blogs WHERE id = ? LIMIT 1', [id])) !== null;
}

export async function deleteBlog(id: string): Promise<boolean> {
  return (await execute('DELETE FROM blogs WHERE id = ?', [id])) > 0;
}
