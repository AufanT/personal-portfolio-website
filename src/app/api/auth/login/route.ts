import { NextResponse } from 'next/server';
import { findAdminByEmail, verifyPassword } from '@/lib/auth';
import { execute } from '@/lib/db';
import { SESSION_COOKIE, sessionCookieOptions, signSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/** Jeda tetap saat kredensial salah, supaya percobaan brute force tidak murah. */
const FAILURE_DELAY_MS = 600;

function invalidCredentials() {
  return NextResponse.json(
    { error: 'Email atau password salah.' },
    { status: 401 }
  );
}

export async function POST(request: Request) {
  let email: unknown;
  let password: unknown;

  try {
    const body = await request.json();
    email = body?.email;
    password = body?.password;
  } catch {
    return NextResponse.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
  }

  try {
    const admin = await findAdminByEmail(email);

    // Password tetap diverifikasi terhadap hash dummy saat email tidak ada,
    // supaya waktu respons tidak membocorkan email mana yang terdaftar.
    const hash =
      admin?.password_hash ??
      'scrypt$00000000000000000000000000000000$' + '0'.repeat(128);

    const ok = await verifyPassword(password, hash);

    if (!admin || !ok) {
      await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS));
      return invalidCredentials();
    }

    const token = await signSession({ sub: admin.id, email: admin.email });

    // Kegagalan mencatat last_login_at tidak boleh membatalkan login.
    try {
      await execute('UPDATE admins SET last_login_at = UTC_TIMESTAMP(6) WHERE id = ?', [admin.id]);
    } catch {
      /* diabaikan dengan sengaja */
    }

    const response = NextResponse.json({ email: admin.email });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Tidak dapat terhubung ke server. Coba lagi.' },
      { status: 500 }
    );
  }
}
