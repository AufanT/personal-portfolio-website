import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deleteProject, getProjectById, updateProject } from '@/lib/projects';
import { parseProjectInput } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const UNAUTHORIZED = { error: 'Tidak terautentikasi.' };
const NOT_FOUND = { error: 'Project tidak ditemukan.' };

interface Params {
  params: { id: string };
}

/** GET — satu project termasuk draft, untuk form edit admin. */
export async function GET(_request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json(UNAUTHORIZED, { status: 401 });
  }

  try {
    const project = await getProjectById(params.id);
    if (!project) return NextResponse.json(NOT_FOUND, { status: 404 });
    return NextResponse.json({ project });
  } catch (error) {
    console.error(`GET /api/projects/${params.id} gagal:`, error);
    return NextResponse.json({ error: 'Gagal memuat project dari database.' }, { status: 500 });
  }
}

/** PUT — perbarui project. */
export async function PUT(request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json(UNAUTHORIZED, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }

  const parsed = parseProjectInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const updated = await updateProject(params.id, parsed.value);
    if (!updated) return NextResponse.json(NOT_FOUND, { status: 404 });
    return NextResponse.json({ id: params.id });
  } catch (error) {
    console.error(`PUT /api/projects/${params.id} gagal:`, error);
    return NextResponse.json({ error: 'Gagal menyimpan project ke database.' }, { status: 500 });
  }
}

/** DELETE — hapus project. */
export async function DELETE(_request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json(UNAUTHORIZED, { status: 401 });
  }

  try {
    const deleted = await deleteProject(params.id);
    if (!deleted) return NextResponse.json(NOT_FOUND, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`DELETE /api/projects/${params.id} gagal:`, error);
    return NextResponse.json({ error: 'Gagal menghapus project.' }, { status: 500 });
  }
}
