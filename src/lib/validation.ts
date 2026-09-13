import type { BlogInput } from '@/lib/blogs';
import type { ProjectInput } from '@/lib/projects';

/**
 * Validasi payload dari halaman admin.
 *
 * Dulu batasan kolom dijaga oleh Postgres lewat PostgREST; sekarang request
 * masuk lewat API route sendiri, jadi panjang dan tipe field harus diperiksa
 * di sini — kalau tidak, string yang lebih panjang dari kolomnya akan ditolak
 * MySQL sebagai error 500 yang tidak informatif bagi user.
 */

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

function str(value: unknown, max: number, field: string): Parsed<string> {
  if (typeof value !== 'string') return { ok: false, error: `${field} harus berupa teks.` };
  const trimmed = value.trim();
  if (trimmed.length > max) {
    return { ok: false, error: `${field} terlalu panjang (maksimal ${max} karakter).` };
  }
  return { ok: true, value: trimmed };
}

/** String opsional: kosong dinormalkan menjadi null, seperti perilaku form lama. */
function nullableStr(value: unknown, max: number, field: string): Parsed<string | null> {
  if (value == null || value === '') return { ok: true, value: null };
  const parsed = str(value, max, field);
  if (!parsed.ok) return parsed;
  return { ok: true, value: parsed.value || null };
}

function bool(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

export function parseBlogInput(body: any): Parsed<BlogInput> {
  const title = str(body?.title, 300, 'Judul');
  if (!title.ok) return title;
  if (!title.value) return { ok: false, error: 'Judul wajib diisi.' };

  const subject = nullableStr(body?.subject, 150, 'Subject');
  if (!subject.ok) return subject;

  const course = nullableStr(body?.course, 150, 'Mata kuliah');
  if (!course.ok) return course;

  const description = nullableStr(body?.description, 5000, 'Deskripsi');
  if (!description.ok) return description;

  const githubUrl = nullableStr(body?.github_url, 500, 'GitHub URL');
  if (!githubUrl.ok) return githubUrl;

  const coverUrl = nullableStr(body?.cover_url, 500, 'Cover URL');
  if (!coverUrl.ok) return coverUrl;

  const content = body?.content ?? null;
  if (content !== null && typeof content !== 'object') {
    return { ok: false, error: 'Konten artikel tidak berbentuk objek yang valid.' };
  }

  // Kolom content bertipe LONGTEXT (maks 4 GB), tapi batas wajar tetap dipasang
  // supaya request yang keliru tidak membebani koneksi shared hosting.
  if (content !== null && JSON.stringify(content).length > 4_000_000) {
    return { ok: false, error: 'Konten artikel terlalu besar (maksimal 4 MB).' };
  }

  return {
    ok: true,
    value: {
      title: title.value,
      subject: subject.value ?? 'Praktikum',
      course: course.value,
      description: description.value,
      content,
      github_url: githubUrl.value,
      cover_url: coverUrl.value,
      is_published: bool(body?.is_published),
    },
  };
}

export function parseProjectInput(body: any): Parsed<ProjectInput> {
  const title = str(body?.title, 300, 'Judul');
  if (!title.ok) return title;
  if (!title.value) return { ok: false, error: 'Judul project wajib diisi.' };

  const category = nullableStr(body?.category, 120, 'Kategori');
  if (!category.ok) return category;

  const categorySlug = nullableStr(body?.category_slug, 60, 'Slug kategori');
  if (!categorySlug.ok) return categorySlug;

  const description = nullableStr(body?.description, 5000, 'Deskripsi');
  if (!description.ok) return description;

  const imageUrl = nullableStr(body?.image_url, 500, 'Image URL');
  if (!imageUrl.ok) return imageUrl;

  const status = nullableStr(body?.status, 60, 'Status');
  if (!status.ok) return status;

  const demoUrl = nullableStr(body?.demo_url, 500, 'Demo URL');
  if (!demoUrl.ok) return demoUrl;

  const githubUrl = nullableStr(body?.github_url, 500, 'GitHub URL');
  if (!githubUrl.ok) return githubUrl;

  const details = nullableStr(body?.details, 20000, 'Detail');
  if (!details.ok) return details;

  return {
    ok: true,
    value: {
      title: title.value,
      category: category.value ?? 'Web Development',
      category_slug: categorySlug.value ?? 'web',
      description: description.value,
      image_url: imageUrl.value,
      status: status.value ?? 'DRAFT',
      demo_url: demoUrl.value,
      github_url: githubUrl.value,
      details: details.value,
      is_published: bool(body?.is_published),
      is_featured: bool(body?.is_featured),
    },
  };
}
