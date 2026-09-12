import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { cookies } from 'next/headers';
import { queryOne } from '@/lib/db';
import { SESSION_COOKIE, verifySession, type SessionPayload } from '@/lib/session';

/**
 * Auth admin pengganti Supabase Auth.
 *
 * Modul ini NODE-ONLY (pakai `node:crypto` dan `next/headers`) — hanya boleh
 * diimport dari Route Handler atau Server Component, tidak dari middleware
 * (Edge runtime) maupun Client Component.
 *
 * Password di-hash dengan scrypt dari pustaka standar Node, jadi tidak ada
 * dependensi native tambahan yang perlu dikompilasi di shared hosting.
 */

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEYLEN);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;

  const salt = Buffer.from(parts[1], 'hex');
  const expected = Buffer.from(parts[2], 'hex');
  if (salt.length === 0 || expected.length !== KEYLEN) return false;

  const derived = await scrypt(password, salt, KEYLEN);
  return timingSafeEqual(derived, expected);
}

export interface AdminRow {
  id: string;
  email: string;
  password_hash: string;
}

export async function findAdminByEmail(email: string): Promise<AdminRow | null> {
  return queryOne<AdminRow>(
    'SELECT id, email, password_hash FROM admins WHERE email = ? LIMIT 1',
    [email.trim().toLowerCase()]
  );
}

/** Session admin dari cookie request, atau null kalau tidak login. */
export async function getAdminSession(): Promise<SessionPayload | null> {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}

/**
 * Dipakai di awal setiap Route Handler yang menulis data.
 * Middleware sudah menjaga halaman /admin, tapi API route harus memeriksa
 * sendiri — middleware tidak melindungi /api, dan request bisa datang
 * langsung ke endpoint tanpa melewati halaman mana pun.
 */
export async function requireAdmin(): Promise<SessionPayload | null> {
  return getAdminSession();
}
