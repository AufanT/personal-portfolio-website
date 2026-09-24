import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createProject, getAllProjects } from '@/lib/projects';
import { parseProjectInput } from '@/lib/validation';
import { readAdminJson } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

const UNAUTHORIZED = { error: 'Tidak terautentikasi.' };

/**
 * GET — daftar semua project termasuk draft, untuk admin.
 * Halaman publik tidak memakai endpoint ini; /portofolio dan homepage
 * mengambil data langsung di server saat render.
 */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json(UNAUTHORIZED, { status: 401 });
  }

  try {
    return NextResponse.json({ projects: await getAllProjects() });
  } catch (error) {
    console.error('GET /api/projects gagal:', error);
    return NextResponse.json({ error: 'Gagal memuat project dari database.' }, { status: 500 });
  }
}

/** POST — buat project baru. */
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

  const parsed = parseProjectInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const id = await createProject(parsed.value);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects gagal:', error);
    return NextResponse.json({ error: 'Gagal menyimpan project ke database.' }, { status: 500 });
  }
}
