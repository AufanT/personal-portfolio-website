import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

/**
 * Penjaga route admin.
 *
 * Berjalan di Edge runtime, jadi hanya boleh mengimport `@/lib/session` yang
 * memakai Web Crypto — bukan `@/lib/auth` atau `@/lib/db` yang butuh Node.
 *
 * Dua perbedaan dari versi Supabase sebelumnya:
 *  1. Matcher benar-benar menutup SEMUA sub-route /admin termasuk
 *     /admin/portfolio, yang dulu lolos dan hanya dijaga di sisi browser.
 *  2. /diagnose ikut dijaga di sini. Halaman itu memang juga memeriksa session
 *     sendiri, tapi `notFound()` di halaman yang dirender streaming sudah
 *     kehilangan kesempatan menyetel status 404 — dijaga di middleware,
 *     request ditolak sebelum halaman mulai dirender sama sekali.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/admin';

  if (!process.env.SESSION_SECRET) {
    // Tanpa secret, tidak ada token yang bisa diverifikasi. Lebih baik gagal
    // terang-terangan daripada memantulkan admin ke halaman login terus.
    return new NextResponse(
      'SESSION_SECRET belum di-set di environment server. Halaman admin dimatikan.',
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    if (isLoginPage) return NextResponse.next();

    // /diagnose tidak perlu mengumumkan keberadaannya ke pengunjung acak.
    if (pathname.startsWith('/diagnose')) {
      return new NextResponse('Not Found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/diagnose'],
};
