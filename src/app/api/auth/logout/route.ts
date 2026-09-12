import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // maxAge 0 menghapus cookie; atribut lain harus sama dengan saat di-set
  // agar browser mencocokkan cookie yang benar.
  response.cookies.set(SESSION_COOKIE, '', sessionCookieOptions(0));
  return response;
}
