import { randomUUID } from 'crypto';
import { execute, query, queryOne } from '@/lib/db';
import { toBool, toIso } from '@/lib/rows';

/** Modul server-only — mengimport `@/lib/db`. */

export interface Project {
  id: string;
  title: string;
  category: string;
  category_slug: string;
  description: string | null;
  image_url: string | null;
  status: string;
  demo_url: string | null;
  github_url: string | null;
  details: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface ProjectInput {
  title: string;
  category: string;
  category_slug: string;
  description: string | null;
  image_url: string | null;
  status: string;
  demo_url: string | null;
  github_url: string | null;
  details: string | null;
  is_published: boolean;
  is_featured: boolean;
}

function mapProject(row: any): Project {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    category_slug: row.category_slug,
    description: row.description,
    image_url: row.image_url,
    status: row.status,
    demo_url: row.demo_url,
    github_url: row.github_url,
    details: row.details,
    is_published: toBool(row.is_published),
    is_featured: toBool(row.is_featured),
    created_at: toIso(row.created_at),
  };
}

/** Galeri publik di /portofolio. */
export async function getPublishedProjects(): Promise<Project[]> {
  const rows = await query(
    'SELECT * FROM projects WHERE is_published = 1 ORDER BY created_at DESC'
  );
  return rows.map(mapProject);
}

/** Project unggulan di homepage. */
export async function getFeaturedProjects(): Promise<Project[]> {
  const rows = await query(
    'SELECT * FROM projects WHERE is_featured = 1 AND is_published = 1 ORDER BY created_at DESC'
  );
  return rows.map(mapProject);
}

/** Semua project termasuk draft — hanya untuk admin. */
export async function getAllProjects(): Promise<Project[]> {
  const rows = await query('SELECT * FROM projects ORDER BY created_at DESC');
  return rows.map(mapProject);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const row = await queryOne('SELECT * FROM projects WHERE id = ? LIMIT 1', [id]);
  return row ? mapProject(row) : null;
}

export async function createProject(input: ProjectInput): Promise<string> {
  const id = randomUUID();
  await execute(
    `INSERT INTO projects
       (id, title, category, category_slug, description, image_url, status,
        demo_url, github_url, details, is_published, is_featured, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(6))`,
    [
      id,
      input.title,
      input.category,
      input.category_slug,
      input.description,
      input.image_url,
      input.status,
      input.demo_url,
      input.github_url,
      input.details,
      input.is_published ? 1 : 0,
      input.is_featured ? 1 : 0,
    ]
  );
  return id;
}

/** Mengembalikan false kalau id tidak ditemukan. */
export async function updateProject(id: string, input: ProjectInput): Promise<boolean> {
  const affected = await execute(
    `UPDATE projects SET
       title = ?, category = ?, category_slug = ?, description = ?, image_url = ?,
       status = ?, demo_url = ?, github_url = ?, details = ?,
       is_published = ?, is_featured = ?
     WHERE id = ?`,
    [
      input.title,
      input.category,
      input.category_slug,
      input.description,
      input.image_url,
      input.status,
      input.demo_url,
      input.github_url,
      input.details,
      input.is_published ? 1 : 0,
      input.is_featured ? 1 : 0,
      id,
    ]
  );

  if (affected > 0) return true;
  return (await queryOne('SELECT id FROM projects WHERE id = ? LIMIT 1', [id])) !== null;
}

export async function deleteProject(id: string): Promise<boolean> {
  return (await execute('DELETE FROM projects WHERE id = ?', [id])) > 0;
}
