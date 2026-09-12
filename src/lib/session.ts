/**
 * Token session admin — HMAC-SHA256 ditandatangani, stateless.
 *
 * Sengaja memakai Web Crypto (`crypto.subtle`), BUKAN `node:crypto`, karena
 * modul ini juga dipakai di `src/middleware.ts` yang berjalan di Edge runtime
 * di mana `node:crypto` tidak tersedia. Web Crypto ada di Edge maupun Node.
 *
 * Format token:  base64url(payloadJSON) + "." + base64url(hmac)
 * Token hanya ditandatangani, tidak dienkripsi — jangan menaruh data rahasia
 * di payload. Payload cuma id admin, email, dan waktu kedaluwarsa.
 */

export const SESSION_COOKIE = 'admin_session';

/** Umur session: 7 hari. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface SessionPayload {
  sub: string; // id admin
  email: string;
  exp: number; // unix seconds
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET belum di-set atau terlalu pendek (minimal 32 karakter). Generate dengan `node scripts/generate-secret.mjs`.'
    );
  }
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Mengembalikan ArrayBuffer, bukan Uint8Array, karena tipe `BufferSource` yang
 * diminta `crypto.subtle` mensyaratkan buffer ber-ArrayBuffer eksplisit.
 */
function fromBase64Url(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return buffer;
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signSession(
  payload: Omit<SessionPayload, 'exp'>,
  maxAgeSeconds = SESSION_MAX_AGE_SECONDS
): Promise<string> {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };
  const body = new TextEncoder().encode(JSON.stringify(full));
  const signature = await crypto.subtle.sign('HMAC', await getKey(), body);
  return `${toBase64Url(body)}.${toBase64Url(new Uint8Array(signature))}`;
}

/**
 * Verifikasi token. Mengembalikan payload kalau tanda tangan valid DAN belum
 * kedaluwarsa; null untuk semua kasus lain (termasuk token cacat).
 * Perbandingan tanda tangan dilakukan oleh `crypto.subtle.verify`, yang
 * constant-time — jangan diganti dengan `===` pada string HMAC.
 */
export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;

  const dot = token.indexOf('.');
  if (dot < 1 || dot === token.length - 1) return null;

  try {
    const body = fromBase64Url(token.slice(0, dot));
    const signature = fromBase64Url(token.slice(dot + 1));

    const ok = await crypto.subtle.verify('HMAC', await getKey(), signature, body);
    if (!ok) return null;

    const payload = JSON.parse(new TextDecoder().decode(body)) as SessionPayload;
    if (typeof payload?.exp !== 'number' || payload.exp * 1000 < Date.now()) return null;
    if (!payload.sub || !payload.email) return null;

    return payload;
  } catch {
    return null;
  }
}

/** Atribut cookie session. `secure` dimatikan di dev karena localhost pakai http. */
export function sessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}
