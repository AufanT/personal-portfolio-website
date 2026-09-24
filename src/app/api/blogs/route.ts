import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createBlog, getAllBlogs } from '@/lib/blogs';
import { parseBlogInput } from '@/lib/validation';
import { readAdminJson } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

const UNAUTHORIZED = { error: 'Tidak terautentikasi.' };

/**
 * GET — daftar semua artikel termasuk draft, untuk dashboard admin.
 *
 * Endpoint ini wajib memeriksa session sendiri: middleware hanya menjaga
 * halaman /admin, tidak /api, dan request bisa datang langsung ke sini.
 */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json(UNAUTHORIZED, { status: 401 });
  }

  try {
    return NextResponse.json({ blogs: await getAllBlogs() });
  } catch (error) {
    console.error('GET /api/blogs gagal:', error);
    return NextResponse.json({ error: 'Gagal memuat artikel dari database.' }, { status: 500 });
  }
}

/** POST — buat artikel baru. */
export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json(UNAUTHORIZED, { status: 401 });
  }

  let body: any;
  try {
    body = await readAdminJson(request);
  } catch {
    return NextResponse.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }

  const parsed = parseBlogInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const id = await createBlog(parsed.value);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/blogs gagal:', error);
    return NextResponse.json({ error: 'Gagal menyimpan artikel ke database.' }, { status: 500 });
  }
}
