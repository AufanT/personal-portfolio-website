import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deleteBlog, getBlogById, updateBlog } from '@/lib/blogs';
import { parseBlogInput } from '@/lib/validation';
import { readAdminJson } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

const UNAUTHORIZED = { error: 'Tidak terautentikasi.' };
const NOT_FOUND = { error: 'Artikel tidak ditemukan.' };

interface Params {
  params: { id: string };
}

/** GET — satu artikel termasuk draft, untuk form edit admin. */
export async function GET(_request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json(UNAUTHORIZED, { status: 401 });
  }

  try {
    const blog = await getBlogById(params.id);
    if (!blog) return NextResponse.json(NOT_FOUND, { status: 404 });
    return NextResponse.json({ blog });
  } catch (error) {
    console.error(`GET /api/blogs/${params.id} gagal:`, error);
    return NextResponse.json({ error: 'Gagal memuat artikel dari database.' }, { status: 500 });
  }
}

/** PUT — perbarui artikel. */
export async function PUT(request: Request, { params }: Params) {
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
    const updated = await updateBlog(params.id, parsed.value);
    if (!updated) return NextResponse.json(NOT_FOUND, { status: 404 });
    return NextResponse.json({ id: params.id });
  } catch (error) {
    console.error(`PUT /api/blogs/${params.id} gagal:`, error);
    return NextResponse.json({ error: 'Gagal menyimpan artikel ke database.' }, { status: 500 });
  }
}

/** DELETE — hapus artikel. */
export async function DELETE(_request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json(UNAUTHORIZED, { status: 401 });
  }

  try {
    const deleted = await deleteBlog(params.id);
    if (!deleted) return NextResponse.json(NOT_FOUND, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`DELETE /api/blogs/${params.id} gagal:`, error);
    return NextResponse.json({ error: 'Gagal menghapus artikel.' }, { status: 500 });
  }
}
